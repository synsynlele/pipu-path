import { expect, test } from "@playwright/test";

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
  await page
    .getByRole("button", { name: /Begin Discovery|Continue Discovery/ })
    .click();

  for (let index = 0; index < 30; index += 1) {
    if (page.url().includes("/review")) break;
    const textarea = page.locator("textarea");
    const radios = page.locator('input[type="radio"]');
    const checkboxes = page.locator('input[type="checkbox"]');
    if (await textarea.count()) {
      const skip = page.getByRole("button", { name: "Skip for now" });
      if (await skip.count()) await skip.click();
      else {
        await textarea.fill(
          "Synthetic browser evidence for Stage 3 verification.",
        );
        await page.getByRole("button", { name: "Save and continue" }).click();
      }
    } else if (await radios.count()) {
      await radios.first().check();
      await page.getByRole("button", { name: "Save and continue" }).click();
    } else if (await checkboxes.count()) {
      await checkboxes.first().check();
      await page.getByRole("button", { name: "Save and continue" }).click();
    } else {
      throw new Error(`No supported Discovery input found at ${page.url()}`);
    }
    await page.waitForLoadState("networkidle");
  }

  if (!page.url().includes("/review")) {
    await page.getByRole("button", { name: /Review answers/ }).click();
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
