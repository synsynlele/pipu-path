import { expect, test } from "@playwright/test";

const email = process.env.E2E_STAGE3_EMAIL;
const password = process.env.E2E_STAGE3_PASSWORD;

async function signIn(page: import("@playwright/test").Page) {
  test.skip(
    !email || !password,
    "Authenticated staging fixture is not configured.",
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/, { timeout: 15_000 });
}

async function openQuestOne(page: import("@playwright/test").Page) {
  await page.goto("/quests");
  await expect(
    page.getByRole("heading", { name: "Build proof, not just plans." }),
  ).toBeVisible();

  const generate = page.getByRole("button", {
    name: "Generate My First Quests",
  });
  if ((await generate.count()) === 1) {
    await generate.click();
    await expect(page.getByRole("status")).toContainText(
      "creating three practical HQLS Quests",
    );
    await expect(page.getByText("Quest 1", { exact: true })).toBeVisible({
      timeout: 60_000,
    });
  }

  const questOne = page
    .locator("li")
    .filter({ has: page.getByText("Quest 1", { exact: true }) });
  await expect(questOne).toBeVisible();
  const open = questOne.getByRole("link", {
    name: /Open Quest|Continue Quest|Complete Reflection|Review Quest/,
  });
  await expect(open).toBeVisible();
  await open.click();
  await expect(page).toHaveURL(/\/quests\/[0-9a-f-]+$/);
}

test("authenticated Builder completes Quest 1 with evidence, reflection and exactly-once XP", async ({
  page,
  isMobile,
}) => {
  test.setTimeout(180_000);
  test.skip(isMobile, "The full Quest mutation flow runs once on desktop.");
  await signIn(page);
  await openQuestOne(page);

  const start = page.getByRole("button", { name: "Start This Quest" });
  if ((await start.count()) === 1) {
    await start.click();
    await expect(page.getByLabel("What proof did you create?")).toBeVisible();
  }

  const evidence = page.getByLabel("What proof did you create?");
  if ((await evidence.count()) === 1) {
    await evidence.fill(
      "I completed the first practical action with a trusted participant and recorded the useful result and honest response.",
    );
    await page.getByRole("button", { name: "Submit Evidence" }).click();
    await expect(page.getByLabel("What did you do?")).toBeVisible({
      timeout: 15_000,
    });
  }

  const reflection = page.getByLabel("What did you do?");
  if ((await reflection.count()) === 1) {
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
    await expect(page).toHaveURL(/\/quests\/[0-9a-f-]+\/complete$/);
  }

  await expect(
    page.getByRole("heading", { name: "Proof created. Progress earned." }),
  ).toBeVisible();
  await expect(page.getByText("+50 XP", { exact: true })).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Proof created. Progress earned." }),
  ).toBeVisible();
  await page.goto("/quests");
  await expect(page.getByText("50", { exact: true })).toBeVisible();
  const questOne = page
    .locator("li")
    .filter({ has: page.getByText("Quest 1", { exact: true }) });
  await expect(questOne.getByText("Completed", { exact: true })).toBeVisible();
  const questTwo = page
    .locator("li")
    .filter({ has: page.getByText("Quest 2", { exact: true }) });
  await expect(questTwo.getByText("Ready", { exact: true })).toBeVisible();
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
  await expect(
    page.getByRole("heading", { name: "Build proof, not just plans." }),
  ).toBeVisible();
  const mobileNavigation = page.getByRole("navigation", {
    name: "PipuPath mobile navigation",
  });
  await expect(mobileNavigation).toBeVisible();
  await expect(
    mobileNavigation.getByRole("link", { name: "Build", exact: true }),
  ).toBeVisible();
});
