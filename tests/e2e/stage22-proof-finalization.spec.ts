import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_STAGE3_EMAIL;
const password = process.env.E2E_STAGE3_PASSWORD;

async function signIn(page: Page) {
  if (!email || !password) {
    throw new Error("Stage 22 proof finalization requires the authenticated E2E fixture.");
  }

  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect
    .poll(() => new URL(page.url()).pathname, { timeout: 15_000 })
    .not.toBe("/login");
}

async function finishReflectionIfNeeded(page: Page) {
  const reflect = page.getByRole("link", {
    name: "Reflect and Complete →",
    exact: true,
  });
  if (!(await reflect.isVisible())) return false;

  await reflect.click();
  const did = page.getByLabel("What did you do?");
  await expect(did).toBeVisible();
  await did.fill(
    "I completed the real-world action and captured enough honest evidence to review what happened.",
  );
  await page
    .getByLabel("What happened?")
    .fill(
      "The action produced a useful response and made the next improvement clearer.",
    );
  await page
    .getByLabel("What did you learn?")
    .fill(
      "I learned that acting first gives me stronger evidence than planning without testing.",
    );
  await page
    .getByLabel("What will you do differently next time?")
    .fill(
      "Next time I will capture the result immediately and ask one more focused question.",
    );
  await page
    .getByLabel("Nortnspoil reflection")
    .fill(
      "Nothing spoil because an imperfect attempt still produced evidence I can use to improve.",
    );
  await page
    .getByRole("button", { name: /Complete Quest and Earn \d+ XP/ })
    .click();
  await expect(page).toHaveURL(/\/quests\/[0-9a-f-]+\/complete$/, {
    timeout: 60_000,
  });
  return true;
}

async function ensureActiveQuest(page: Page) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await page.goto("/quests");
    await expect(page.getByText("Quest path · Real-world action")).toBeVisible();

    const generate = page.getByRole("button", {
      name: "Generate My First Quests",
    });
    if (await generate.isVisible()) {
      await generate.click();
      await expect(page.getByRole("status")).toContainText(
        "creating three practical HQLS Quests",
      );
      await expect(
        page
          .getByRole("link", {
            name: /Continue Challenge|Enter Challenge|Reflect and Complete/,
          })
          .first(),
      ).toBeVisible({ timeout: 60_000 });
    }

    const continueQuest = page.getByRole("link", {
      name: "Continue Challenge →",
      exact: true,
    });
    if (await continueQuest.isVisible()) {
      await continueQuest.click();
      await expect(page).toHaveURL(/\/quests\/[0-9a-f-]+$/);
      return new URL(page.url()).pathname;
    }

    const enterQuest = page.getByRole("link", {
      name: "Enter Challenge →",
      exact: true,
    });
    if (await enterQuest.isVisible()) {
      await enterQuest.click();
      await expect(page).toHaveURL(/\/quests\/[0-9a-f-]+$/);
      const start = page.getByRole("button", { name: "Start This Quest" });
      await expect(start).toBeVisible();
      await start.click();
      await expect(page.getByText("Phase 2 · Act")).toBeVisible({
        timeout: 30_000,
      });
      return new URL(page.url()).pathname;
    }

    if (await finishReflectionIfNeeded(page)) continue;
  }

  throw new Error("Could not establish an active Quest for proof verification.");
}

test("premium private proof flow is reachable, beautiful and functional", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await signIn(page);
  const questPath = await ensureActiveQuest(page);

  await page.goto("/proof");
  await expect(page).toHaveURL(`${questPath}/proof`, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", { name: "Bring back what happened." }),
  ).toBeVisible();
  await expect(page.getByText("Private by default", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Show the action, not perfection." }),
  ).toBeVisible();
  await expect(page.getByText("What counts as honest proof?", { exact: true })).toBeVisible();
  await expect(page.getByText("What happens next", { exact: true })).toBeVisible();
  await expect(page.getByText("Your privacy", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Tell the proof story")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit Proof" })).toBeVisible();
  await expect(page.getByText(/This path is not available/i)).toHaveCount(0);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/stage22-proof-desktop.png",
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("navigation", { name: "PipuPath mobile navigation" }),
  ).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
  await page.screenshot({
    path: "test-results/stage22-proof-mobile.png",
    fullPage: true,
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByLabel("Tell the proof story")
    .fill(
      "I completed the real-world action with a trusted participant, recorded the result, and captured the honest response that showed what worked.",
    );
  await page.getByRole("button", { name: "Submit Proof" }).click();
  await expect(page).toHaveURL(questPath, { timeout: 60_000 });
  await expect(page.getByLabel("What did you do?")).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText(/This path is not available/i)).toHaveCount(0);
});
