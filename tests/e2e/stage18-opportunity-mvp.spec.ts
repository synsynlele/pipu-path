import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_STAGE3_EMAIL;
const password = process.env.E2E_STAGE3_PASSWORD;
const proofTitle =
  process.env.E2E_STAGE18_OPPORTUNITY_TITLE ?? "Stage18 Browser Proof Opportunity";

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

test("anonymous users cannot enter Opportunities", async ({ page }) => {
  await page.goto("/opportunities");
  await expect(page).toHaveURL(/\/login/);
});

test("authenticated Builder can evaluate and self-track a vetted opportunity", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/opportunities");

  await expect(
    page.getByRole("heading", {
      name: "Put your development evidence in front of a larger real-world test.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("eligibility checks rather than guessed", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("not a selection probability or employability score", {
      exact: false,
    }),
  ).toBeVisible();

  const opportunityHeading = page.getByRole("heading", { name: proofTitle });
  if ((await opportunityHeading.count()) === 0) {
    test.skip(true, "Stage 18 vetted browser-proof opportunity is not seeded.");
  }
  await expect(opportunityHeading).toBeVisible();

  const card = opportunityHeading.locator("xpath=ancestor::article[1]");
  const cardRoot = (await card.count()) > 0
    ? card
    : opportunityHeading.locator("xpath=ancestor::div[contains(@class,'p-6')][1]");

  await expect(cardRoot.getByText("Why this may fit", { exact: true })).toBeVisible();
  await expect(cardRoot.getByText("Readiness / checks", { exact: true })).toBeVisible();
  await expect(
    cardRoot.getByRole("button", { name: "Open official opportunity" }),
  ).toBeVisible();

  const saveButton = cardRoot.getByRole("button", {
    name: /^(Save opportunity|Remove saved)$/,
  });
  await expect(saveButton).toBeVisible();
  if ((await saveButton.textContent())?.trim() === "Save opportunity") {
    await saveButton.click();
    await expect(page).toHaveURL(/state=updated/);
    await expect(
      page.getByRole("button", { name: "Remove saved" }).first(),
    ).toBeVisible();
  }

  const applyButton = page.getByRole("button", { name: "I applied" }).first();
  if (await applyButton.isVisible().catch(() => false)) {
    await applyButton.click();
    await expect(page).toHaveURL(/application=recorded/);
  }

  await expect(
    page.getByText("Application — self-reported", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("PipuPath has not independently verified", { exact: false }).first(),
  ).toBeVisible();

  const outcome = page.getByLabel("Outcome").first();
  await outcome.selectOption("other");
  await page
    .getByRole("button", { name: "Save self-reported outcome" })
    .first()
    .click();
  await expect(page).toHaveURL(/outcome=recorded/);

  const body = page.locator("body");
  await expect(body).not.toContainText("officialUrl");
  await expect(body).not.toContainText("contact_email");
  await expect(body).not.toContainText("whatsapp_number");
});
