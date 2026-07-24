import { expect, test } from "@playwright/test";

test("anonymous protected access redirects to login", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login\?next=%2Fapp|\/login\?next=\/app/);
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
});

test("authentication controls work on a narrow screen", async ({ page }) => {
  await page.goto("/signup");
  await expect(
    page.getByRole("heading", { name: "Join PipuPath" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("anonymous Discovery access is denied without rendering private data", async ({
  page,
}) => {
  await page.goto("/onboarding/discovery");
  await expect(page).toHaveURL(
    /\/login\?next=%2Fonboarding%2Fdiscovery|\/login\?next=\/onboarding\/discovery/,
  );
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await expect(page.getByText("Your answers, in your words.")).toHaveCount(0);
});
