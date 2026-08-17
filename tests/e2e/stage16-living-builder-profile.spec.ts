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

test("anonymous users cannot enter the Living Builder Profile", async ({ page }) => {
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login/);
});

test("authenticated Builder sees a private evidence-backed Living Builder Profile", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/profile");

  await expect(
    page.getByRole("heading", {
      name: "Your potential is a starting point. Your evidence keeps the profile alive.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Private by design", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View Discovery baseline" }),
  ).toHaveAttribute("href", "/onboarding/discovery/profile");
  await expect(
    page.getByRole("heading", { name: "What your completed work currently supports." }),
  ).toBeVisible();
  await expect(page.getByText("Project execution", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText(/PipuPath action evidence/i).first(),
  ).toBeVisible();
});

test("Living Builder Profile exposes safe evidence links without raw private narratives", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/profile");

  const projectEvidence = page.locator('a[href^="/projects/"]').first();
  await expect(projectEvidence).toBeVisible();
  await expect(page.getByRole("button", { name: "Accurate" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Needs context" }).first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Not representative" }).first(),
  ).toBeVisible();

  const body = page.locator("body");
  await expect(body).not.toContainText("problem_statement");
  await expect(body).not.toContainText("what_i_learned");
  await expect(body).not.toContainText("progress_note");
  await expect(body).not.toContainText("Private contact email");
  await expect(body).not.toContainText("WhatsApp number");
});
