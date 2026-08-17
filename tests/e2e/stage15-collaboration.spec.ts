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

test("anonymous users cannot enter Builder Collaboration", async ({ page }) => {
  await page.goto("/connect/collaborations");
  await expect(page).toHaveURL(/\/login/);
});

test("authenticated Builder sees the structured collaboration surface", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/connect/collaborations");

  await expect(
    page.getByRole("heading", { name: "Build together. Prove contribution." }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Stage 15 Preview Verification — build useful evidence together.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByText(/unrestricted chat, likes or popularity scores/i),
  ).toBeVisible();

  await page.getByRole("link", { name: "Open Collaboration" }).first().click();

  await expect(
    page.getByRole("heading", {
      name: "Stage 15 Preview Verification — build useful evidence together.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/evidence record, not a message thread/i),
  ).toBeVisible();
  await expect(
    page.getByText(
      "I prepared the synthetic Stage 15 Preview working agreement and verified the collaboration structure.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByText(/private development data belonging to either Builder/i),
  ).toBeVisible();
});

test("collaboration detail exposes the safe agreement but not hidden product fields", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/connect/collaborations");
  await page.getByRole("link", { name: "Open Collaboration" }).first().click();

  await expect(
    page.getByText("Preview verification partner", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Review the structured collaboration workspace and contribute evidence safely.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText(
    "Problems you care about",
  );
  await expect(page.locator("body")).not.toContainText("Private contact email");
  await expect(page.locator("body")).not.toContainText("Nortnspoil reflection");
});
