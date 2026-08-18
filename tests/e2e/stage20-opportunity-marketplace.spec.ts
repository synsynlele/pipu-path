import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_STAGE3_EMAIL;
const password = process.env.E2E_STAGE3_PASSWORD;
const expectMarketplace = process.env.E2E_STAGE20_EXPECT_MARKETPLACE === "true";

const providerName = "Stage 20 Release Fixture Provider";
const opportunityTitle = "Stage 20 Release Fixture Opportunity";
const builderSummary =
  "I build practical systems and use evidence to improve how real problems are solved.";

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

async function grantReleaseProviderMemberships(page: Page) {
  await page.goto("/admin/providers");
  await expect(
    page.getByRole("heading", { name: "Opportunity Providers" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: providerName })).toBeVisible();

  for (const [username, role] of [
    ["stage20_ci_owner", "owner"],
    ["stage20_ci_operator", "operator"],
  ] as const) {
    await page.getByLabel("PipuPath username").last().fill(username);
    await page.getByLabel("Role").last().selectOption(role);
    await page.getByRole("button", { name: "Add member" }).click();
    await expect(
      page.getByText("Provider configuration updated.", { exact: true }),
    ).toBeVisible();
  }
}

async function revokeReleaseProviderMemberships(page: Page) {
  await page.goto("/admin/providers");
  for (let index = 0; index < 2; index += 1) {
    const revoke = page.getByRole("button", { name: "Revoke" }).first();
    await expect(revoke).toBeVisible();
    await revoke.click();
    await expect(
      page.getByText("Provider configuration updated.", { exact: true }),
    ).toBeVisible();
  }
}

test("anonymous users cannot enter the Opportunity Provider workspace", async ({
  page,
}) => {
  await page.goto("/provider");
  await expect(page).toHaveURL(/\/login/);
});

test("Stage 20 marketplace preserves admin, Builder and provider trust boundaries", async ({
  page,
}) => {
  test.skip(
    !expectMarketplace,
    "Stage 20 marketplace release fixture is not configured.",
  );

  await signIn(page);
  await grantReleaseProviderMemberships(page);

  await page.goto("/provider");
  await expect(page.getByRole("heading", { name: providerName })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Exact Builder packets only" }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Search Builders");

  await page.goto("/opportunities");
  await expect(
    page.getByRole("heading", { name: opportunityTitle }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Prepare PipuPath application" })
    .click();

  await expect(
    page.getByText("Builder-controlled application", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: opportunityTitle }),
  ).toBeVisible();
  await page.getByLabel("Public-safe Builder summary").fill(builderSummary);
  await page
    .getByLabel("Application note")
    .fill("I want to test my current capability in a real-world opportunity.");
  await page
    .getByRole("button", { name: "Save private application draft" })
    .click();

  await expect(page.getByText("Draft saved.", { exact: false })).toBeVisible();
  await expect(
    page.getByText("Exact packet preview", { exact: true }),
  ).toBeVisible();
  const builderBody = page.locator("body");
  await expect(builderBody).not.toContainText("contact_email");
  await expect(builderBody).not.toContainText("whatsapp_number");
  await expect(builderBody).not.toContainText("human_potential");
  await expect(builderBody).not.toContainText("reflection_text");

  await page
    .getByLabel(/I reviewed this exact packet and consent to share only these/i)
    .check();
  await page.getByRole("button", { name: "Submit exact packet" }).click();
  await expect(
    page.getByText("Application submitted to this provider.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Status: submitted", { exact: true }),
  ).toBeVisible();

  await page.goto("/provider/applications");
  await expect(
    page.getByRole("heading", { name: "Submitted Builder packets" }),
  ).toBeVisible();
  await expect(page.getByText(builderSummary, { exact: true })).toBeVisible();
  const providerBody = page.locator("body");
  await expect(providerBody).not.toContainText("builderUserId");
  await expect(providerBody).not.toContainText("sourceHref");
  await expect(providerBody).not.toContainText("contact_email");
  await expect(providerBody).not.toContainText("whatsapp_number");
  await expect(providerBody).not.toContainText("human_potential");
  await expect(providerBody).not.toContainText("reflection_text");

  await page.getByLabel("Provider decision").selectOption("viewed");
  await page.getByRole("button", { name: "Update application" }).click();
  await expect(
    page.getByText("Application state updated.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Status: viewed", { exact: false }),
  ).toBeVisible();

  await page.goto("/opportunities");
  await page.getByRole("link", { name: /Application: viewed/i }).click();
  await expect(page.getByText("Status: viewed", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Withdraw application" }).click();
  await expect(
    page.getByText("Application withdrawn.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("Status: withdrawn", { exact: true }),
  ).toBeVisible();

  await revokeReleaseProviderMemberships(page);
});
