import { expect, test } from "@playwright/test";

async function assertNoDiscoveryError(page: import("@playwright/test").Page) {
  const alert = page.locator('form p[role="alert"]');
  if ((await alert.count()) === 1) {
    throw new Error(
      `Discovery interaction failed: ${await alert.textContent()}`,
    );
  }
}

test("eligible user completes persistent Discovery without invented results", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "The full flow runs once; mobile controls have a focused test.",
  );
  test.skip(
    !process.env.E2E_STAGE3_EMAIL || !process.env.E2E_STAGE3_PASSWORD,
    "Authenticated staging fixture is not configured.",
  );

  await page.goto("/login");
  await page.getByLabel("Email address").fill(process.env.E2E_STAGE3_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_STAGE3_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/);

  await page.goto("/onboarding/discovery");
  const begin = page.getByRole("button", { name: "Begin Discovery" });
  if ((await begin.count()) === 1) {
    await begin.click();
    await page
      .getByRole("link", { name: "Continue Discovery" })
      .waitFor({ state: "visible" });
  }

  for (let index = 0; index < 30; index += 1) {
    if (page.url().includes("/review")) break;
    const continueDiscovery = page.getByRole("link", {
      name: "Continue Discovery",
    });
    if ((await continueDiscovery.count()) === 1) {
      await Promise.all([
        page.waitForURL(
          (url) =>
            /^\/onboarding\/discovery\/[^/]+$/.test(url.pathname) &&
            !url.pathname.endsWith("/review") &&
            !url.pathname.endsWith("/complete"),
          { waitUntil: "commit" },
        ),
        continueDiscovery.click(),
      ]);
      continue;
    }
    const reviewAnswers = page.getByRole("button", {
      name: "Review my answers",
    });
    if ((await reviewAnswers.count()) === 1) {
      await Promise.all([
        page.waitForURL(/\/onboarding\/discovery\/review/, {
          waitUntil: "commit",
        }),
        reviewAnswers.click(),
      ]);
      continue;
    }
    const textarea = page.locator("textarea");
    const radios = page.locator('input[type="radio"]');
    const checkboxes = page.locator('input[type="checkbox"]');
    if (await textarea.count()) {
      const skip = page.getByRole("button", { name: "Skip for now" });
      if (await skip.count()) {
        const previousUrl = page.url();
        await Promise.all([
          page.waitForURL((url) => url.toString() !== previousUrl, {
            waitUntil: "commit",
          }),
          skip.click(),
        ]);
        await assertNoDiscoveryError(page);
      } else {
        await textarea.fill(
          "Synthetic browser evidence for Stage 3 verification.",
        );
        const previousUrl = page.url();
        await Promise.all([
          page.waitForURL((url) => url.toString() !== previousUrl, {
            waitUntil: "commit",
          }),
          page.getByRole("button", { name: "Save and continue" }).click(),
        ]);
        await assertNoDiscoveryError(page);
      }
    } else if (await radios.count()) {
      await radios.first().check();
      const previousUrl = page.url();
      await Promise.all([
        page.waitForURL((url) => url.toString() !== previousUrl, {
          waitUntil: "commit",
        }),
        page.getByRole("button", { name: "Save and continue" }).click(),
      ]);
      await assertNoDiscoveryError(page);
    } else if (await checkboxes.count()) {
      await checkboxes.first().check();
      const previousUrl = page.url();
      await Promise.all([
        page.waitForURL((url) => url.toString() !== previousUrl, {
          waitUntil: "commit",
        }),
        page.getByRole("button", { name: "Save and continue" }).click(),
      ]);
      await assertNoDiscoveryError(page);
    } else {
      throw new Error(`No supported Discovery input found at ${page.url()}`);
    }
  }

  await expect(page).toHaveURL(/\/onboarding\/discovery\/review/);
  await expect(
    page.getByRole("heading", { name: "Review your answers" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Edit" }).first().click();
  const editTextarea = page.locator("textarea");
  if (await editTextarea.count()) {
    await editTextarea.fill("Edited synthetic browser evidence.");
  }
  await page.getByRole("button", { name: "Save edit" }).click();
  await expect(page).toHaveURL(/\/onboarding\/discovery\/review/);

  await page.getByRole("button", { name: "Complete Discovery" }).click();
  await expect(page).toHaveURL(/\/onboarding\/discovery\/complete/);
  await expect(
    page.getByRole("heading", { name: "Your Discovery evidence is ready" }),
  ).toBeVisible();
  await expect(
    page.getByText(/strength|personality type|mission/i),
  ).toHaveCount(0);

  await page.reload();
  await expect(page).toHaveURL(/\/onboarding\/discovery\/complete/);
});
