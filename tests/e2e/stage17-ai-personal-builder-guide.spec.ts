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

test("anonymous users cannot enter the Personal Builder Guide", async ({
  page,
}) => {
  await page.goto("/guide");
  await expect(page).toHaveURL(/\/login/);
});

test("authenticated Builder gets bounded evidence-aware guidance", async ({
  page,
}) => {
  test.setTimeout(75_000);

  await signIn(page);
  await page.goto("/guide");

  await expect(
    page.getByRole("heading", {
      name: "Ask what matters next. Get guidance grounded in what you have actually done.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("No unrestricted chatbot lives here.", { exact: false }),
  ).toBeVisible();

  for (const question of [
    "What should I do next?",
    "Where am I improving?",
    "What evidence am I missing?",
    "What should I focus on this week?",
  ]) {
    await expect(page.getByRole("heading", { name: question })).toBeVisible();
  }

  await page.getByRole("button", { name: "Ask the Guide" }).first().click();
  await expect(page).toHaveURL(/\/guide\?run=/, { timeout: 60_000 });

  await expect(
    page.getByText("Current guidance", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Next action", { exact: true })).toBeVisible();
  await expect(
    page.getByText("What I am uncertain about", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Take the next action" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Helpful" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Not helpful" }),
  ).toBeVisible();

  const body = page.locator("body");
  await expect(body).not.toContainText("what_i_learned");
  await expect(body).not.toContainText("progress_note");
  await expect(body).not.toContainText("contact_email");
  await expect(body).not.toContainText("whatsapp");
});
