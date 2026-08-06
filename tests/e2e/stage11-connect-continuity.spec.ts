import { expect, test } from "@playwright/test";

const email = process.env.E2E_STAGE3_EMAIL;
const password = process.env.E2E_STAGE3_PASSWORD;

async function signIn(page: import("@playwright/test").Page) {
  if (!email || !password) test.skip(true, "Stage 11 credentials are required");
  await page.goto("/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test("Stage 11 Connect and Journey continuity routes are integrated", async ({
  page,
}) => {
  await signIn(page);

  await page.goto("/connect");
  await expect(page.getByRole("heading", { name: /find people who can help/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Connect" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByText(/contact details are never exposed automatically/i)).toBeVisible();

  await page.goto("/journey");
  await expect(page.getByRole("heading", { name: /continuing cycles of action/i })).toBeVisible();
  const completedCycle = page.getByText(/Journey Cycle \d+ complete/i);
  if (await completedCycle.count()) {
    await expect(page.getByRole("button", { name: /Create Journey Cycle/i })).toBeVisible();
  }
});
