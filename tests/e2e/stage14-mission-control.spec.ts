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

test("Mission Control rejects anonymous access", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
});

test("authorised operator can read aggregate Mission Control without private narratives", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/admin?window=30");

  await expect(
    page.getByRole("heading", {
      name: "Measure what makes Builders return and build.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("PipuPath Mission Control", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Total Builders", { exact: true })).toBeVisible();
  await expect(page.getByText("Repeat Builders", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Developmental funnel", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Feature intelligence", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /Private Discovery answers, Human Potential Profile prose, reflections, evidence and contact details are not part of this dashboard\./,
    ),
  ).toBeVisible();
});

test("authenticated product navigation records privacy-safe feature telemetry", async ({
  page,
}) => {
  await signIn(page);

  const telemetry = page.waitForResponse(
    (response) =>
      response.url().includes("/api/product-events/feature-view") &&
      response.request().method() === "POST",
  );
  await page.goto("/connect");
  const response = await telemetry;

  expect(response.status()).toBe(204);
  expect(response.request().postDataJSON()).toEqual({ featureKey: "connect" });
});
