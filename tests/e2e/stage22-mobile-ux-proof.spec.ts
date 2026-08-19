import { expect, test, type Page, type TestInfo } from "@playwright/test";

const email = process.env.E2E_STAGE3_EMAIL;
const password = process.env.E2E_STAGE3_PASSWORD;

async function signIn(page: Page) {
  if (!email || !password) {
    throw new Error("Stage 22 mobile UX proof requires the authenticated E2E fixture.");
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
    .fill("The action produced a useful response and made the next improvement clearer.");
  await page
    .getByLabel("What did you learn?")
    .fill("I learned that acting first gives stronger evidence than planning without testing.");
  await page
    .getByLabel("What will you do differently next time?")
    .fill("Next time I will capture the result immediately and ask one more focused question.");
  await page
    .getByLabel("Nortnspoil reflection")
    .fill("Nothing spoil because an imperfect attempt still produced evidence I can use to improve.");
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

  throw new Error("Could not establish an active Quest for mobile UX proof.");
}

async function assertVisibleControl(page: Page, name: string | RegExp) {
  const control = page.getByRole("link", { name }).first();
  await expect(control).toBeVisible();
  const styles = await control.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      color: style.color,
      backgroundColor: style.backgroundColor,
      opacity: Number(style.opacity),
      visibility: style.visibility,
    };
  });
  expect(styles.opacity).toBeGreaterThan(0.7);
  expect(styles.visibility).toBe("visible");
  expect(styles.color).not.toBe("rgba(0, 0, 0, 0)");
  return styles;
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({ path: testInfo.outputPath(name), fullPage: true });
}

test("desktop navigation and Passport controls are visible before hover", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chrome", "Desktop contrast proof only.");
  await signIn(page);

  await page.goto("/app");
  const navigation = page.getByRole("navigation", { name: "PipuPath application" });
  await expect(navigation).toBeVisible();
  for (const label of ["Journey", "Build", "Vault", "Connect", "Me"]) {
    const link = navigation.getByRole("link", { name: label, exact: true });
    await expect(link).toBeVisible();
    const opacity = await link.evaluate((element) => Number(getComputedStyle(element).opacity));
    expect(opacity).toBeGreaterThan(0.7);
  }
  await capture(page, testInfo, "desktop-app-navigation.png");

  await page.goto("/passport");
  await expect(page.getByRole("heading", { name: "Portable proof, controlled by you." })).toBeVisible();
  const prepare = page.getByRole("link", { name: /Prepare Passport|Prepare a new version/ });
  await expect(prepare).toBeVisible();
  const prepareStyles = await prepare.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      color: style.color,
      backgroundColor: style.backgroundColor,
      opacity: Number(style.opacity),
    };
  });
  expect(prepareStyles.opacity).toBeGreaterThan(0.7);
  expect(prepareStyles.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");

  const signOut = page.getByRole("button", { name: "Sign out" });
  await expect(signOut).toBeVisible();
  await capture(page, testInfo, "desktop-passport-controls.png");
});

test("mobile Quest hands off into a usable dedicated Prove step", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "desktop-chrome", "Mobile-device proof only.");
  test.setTimeout(180_000);
  await signIn(page);
  const questPath = await ensureActiveQuest(page);

  await page.goto(questPath);
  const prove = page.getByRole("link", { name: "Continue to Prove →", exact: true });
  await expect(prove).toBeVisible();
  await prove.click();
  await expect(page).toHaveURL(`${questPath}/proof`, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Bring back what happened." })).toBeVisible();
  await expect(page.getByText("Private by default", { exact: true })).toBeVisible();

  const textarea = page.getByLabel("Tell the proof story");
  const submit = page.getByRole("button", { name: "Submit Proof" });
  const mobileNavigation = page.getByRole("navigation", {
    name: "PipuPath mobile navigation",
  });
  await expect(textarea).toBeVisible();
  await expect(submit).toBeVisible();
  await expect(mobileNavigation).toBeVisible();

  const fontSize = await textarea.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize),
  );
  expect(fontSize).toBeGreaterThanOrEqual(16);

  const scaleBefore = await page.evaluate(() => window.visualViewport?.scale ?? 1);
  await textarea.focus();
  const scaleAfter = await page.evaluate(() => window.visualViewport?.scale ?? 1);
  expect(scaleBefore).toBe(1);
  expect(scaleAfter).toBe(1);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await submit.scrollIntoViewIfNeeded();
  await submit.click({ trial: true });

  for (const label of ["Home", "Journey", "Build", "Vault", "Connect", "Me"]) {
    const link = mobileNavigation.getByRole("link", { name: label, exact: true });
    await expect(link).toBeVisible();
    const box = await link.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }

  const accept = await page.getByLabel("Add a private image (optional)").getAttribute("accept");
  expect(accept).toContain("image/heic");
  expect(accept).toContain("image/heif");
  await expect(page.getByText(/This path is not available/i)).toHaveCount(0);
  await capture(page, testInfo, `${testInfo.project.name}-prove.png`);
});

test("Android-class mobile can submit private Proof and unlock Reflection", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "android-chrome", "Run the mutation once on Android-class mobile.");
  test.setTimeout(180_000);
  await signIn(page);
  const questPath = await ensureActiveQuest(page);
  await page.goto(`${questPath}/proof`);

  await page
    .getByLabel("Tell the proof story")
    .fill(
      "I completed the real-world action with a trusted participant, recorded the result, and captured the honest response that showed what worked.",
    );
  const submit = page.getByRole("button", { name: "Submit Proof" });
  await submit.scrollIntoViewIfNeeded();
  await submit.click();

  await expect(page).toHaveURL(questPath, { timeout: 60_000 });
  await expect(page.getByLabel("What did you do?")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/This path is not available/i)).toHaveCount(0);
});
