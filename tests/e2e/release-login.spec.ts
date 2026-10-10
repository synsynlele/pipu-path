import { expect, test } from "@playwright/test";

test("password login keeps the session on Home and narrow Discovery", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const email = process.env.E2E_STAGE3_EMAIL;
  const password = process.env.E2E_STAGE3_PASSWORD;
  test.skip(!email || !password, "Disposable authenticated fixture required");
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect
    .poll(() => new URL(page.url()).pathname, { timeout: 30_000 })
    .not.toBe("/login");
  await page.goto("/app");
  await expect(page).toHaveURL(/\/app$/);
  await page.reload();
  await expect(page).toHaveURL(/\/app$/);
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/onboarding/discovery");
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.locator("main")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
