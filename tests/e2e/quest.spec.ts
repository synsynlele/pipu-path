import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_STAGE3_EMAIL;
const password = process.env.E2E_STAGE3_PASSWORD;

async function signIn(page: Page) {
  test.skip(
    !email || !password,
    "Authenticated staging fixture is not configured.",
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect
    .poll(() => new URL(page.url()).pathname, { timeout: 15_000 })
    .not.toBe("/login");
}

async function openCurrentQuestForVerification(page: Page) {
  await page.goto("/quests");
  await expect(page.getByText("Quest path · Real-world action")).toBeVisible();

  const anyQuestAction = page
    .getByRole("link", {
      name: /Reflect and Complete|Continue Challenge|Enter Challenge/,
    })
    .first();
  const generate = page.getByRole("button", {
    name: "Generate My First Quests",
  });
  if (await generate.isVisible()) {
    await generate.click();
    await expect(page.getByRole("status")).toContainText(
      "creating three practical HQLS Quests",
    );
    await expect(anyQuestAction).toBeVisible({ timeout: 60_000 });
  }

  for (const label of [
    "Reflect and Complete →",
    "Continue Challenge →",
    "Enter Challenge →",
  ]) {
    const link = page.getByRole("link", { name: label, exact: true }).first();
    if (await link.isVisible()) {
      await link.click();
      await expect(page).toHaveURL(/\/quests\/[0-9a-f-]+$/);
      return;
    }
  }

  throw new Error("No generated Quest is available for verification.");
}

test("authenticated Builder completes or verifies the current Quest with exactly-once XP", async ({
  page,
  isMobile,
}) => {
  test.setTimeout(180_000);
  test.skip(isMobile, "The full Quest mutation flow runs once on desktop.");
  await signIn(page);
  await openCurrentQuestForVerification(page);

  const start = page.getByRole("button", { name: "Start This Quest" });
  const reflection = page.getByLabel("What did you do?");
  const completed = page.getByRole("heading", {
    name: "Proof created. Progress earned.",
  });

  await expect(start.or(reflection).or(completed).or(page.getByText("Phase 2 · Act"))).toBeVisible({
    timeout: 15_000,
  });

  if (await start.isVisible()) {
    await start.click();
    await expect(page.getByText("Phase 2 · Act").or(reflection).or(completed)).toBeVisible({
      timeout: 30_000,
    });
  }

  if (await page.getByText("Phase 2 · Act").isVisible()) {
    const questPath = new URL(page.url()).pathname;
    await page.goto(`${questPath}/proof`);
    await expect(
      page.getByRole("heading", { name: "Bring back what happened." }),
    ).toBeVisible();
    await expect(page.getByText("Private by default")).toBeVisible();

    const evidence = page.getByLabel("Tell the proof story");
    await evidence.fill(
      "I completed the practical action with a trusted participant and recorded the useful result and honest response.",
    );
    await page.getByRole("button", { name: "Submit Proof" }).click();
    await expect(page).toHaveURL(/\/quests\/[0-9a-f-]+$/, { timeout: 60_000 });
    await expect(reflection.or(completed)).toBeVisible({ timeout: 60_000 });
  }

  if (await reflection.isVisible()) {
    await reflection.fill(
      "I followed the Quest steps and created the small real-world result with resources already available to me.",
    );
    await page
      .getByLabel("What happened?")
      .fill(
        "The trusted participant used the result and gave a clear response that showed what worked and what needed improvement.",
      );
    await page
      .getByLabel("What did you learn?")
      .fill(
        "I learned that a small tested action gives more useful direction than continuing to plan without evidence.",
      );
    await page
      .getByLabel("What will you do differently next time?")
      .fill(
        "Next time I will ask one more focused question and record the response immediately so the evidence is clearer.",
      );
    await page
      .getByLabel("Nortnspoil reflection")
      .fill(
        "Nothing spoil because the imperfect first result gave me evidence, courage and a specific way to improve the next action.",
      );
    await page
      .getByRole("button", { name: "Complete Quest and Earn 50 XP" })
      .click();
    await expect(page).toHaveURL(/\/quests\/[0-9a-f-]+\/complete$/, {
      timeout: 60_000,
    });
  }

  const awardedXp = page.getByText("+50", { exact: true });
  await expect(completed).toBeVisible({ timeout: 30_000 });
  await expect(awardedXp).toBeVisible();

  await page.reload();
  await expect(completed).toBeVisible();
  await expect(awardedXp).toBeVisible();
  await page.goto("/quests");
  await expect(page.getByText(/verified XP/).first()).toBeVisible();
});

test("anonymous users cannot access private Quests", async ({ page }) => {
  await page.goto("/quests");
  await expect(page).toHaveURL(/\/login/);
});

test("Quest path remains usable on a narrow screen", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Focused narrow-screen coverage runs on mobile only.");
  await signIn(page);
  await page.goto("/quests");
  await expect(page.getByText("Quest path · Real-world action")).toBeVisible();
  const mobileNavigation = page.getByRole("navigation", {
    name: "PipuPath mobile navigation",
  });
  await expect(mobileNavigation).toBeVisible();
  await expect(
    mobileNavigation.getByRole("link", { name: "Build", exact: true }),
  ).toBeVisible();
});
