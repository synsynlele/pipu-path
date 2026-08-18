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

test("anonymous users cannot enter capability verification", async ({
  page,
}) => {
  await page.goto("/profile/verification");
  await expect(page).toHaveURL(/\/login/);
});

test("authenticated Builder sees the private evidence-bound verification workspace", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/profile/verification");

  await expect(
    page.getByRole("heading", {
      name: "Turn shared work into credible human confirmation.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "PipuPath action evidence" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Collaborator confirmed" }).first(),
  ).toBeVisible();
  await expect(
    page.getByText(
      "No stars, endorsements, popularity counts or paid verification.",
      { exact: false },
    ),
  ).toBeVisible();

  const body = page.locator("body");
  await expect(body).not.toContainText("contact_email");
  await expect(body).not.toContainText("whatsapp_number");
  await expect(body).not.toContainText("problem_statement");
  await expect(body).not.toContainText("what_i_learned");
});
