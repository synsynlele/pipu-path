import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_STAGE3_EMAIL;
const password = process.env.E2E_STAGE3_PASSWORD;
const expectWorkspace = process.env.E2E_STAGE19_EXPECT_WORKSPACE === "true";

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

test("anonymous users cannot enter the Institution Workspace", async ({
  page,
}) => {
  await page.goto("/institution");
  await expect(page).toHaveURL(/\/login/);
});

test(
  "authenticated institution operator sees only bounded cohort and shared-evidence surfaces",
  async ({ page }) => {
    test.skip(
      !expectWorkspace,
      "Stage 19 institution release fixture is not configured.",
    );

    await signIn(page);
    await page.goto("/institution");

    await expect(
      page.getByText("Institution Workspace", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "KAEC Nigerian Schools" }),
    ).toBeVisible();
    await expect(page.getByText("Role: Owner", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Privacy-thresholded development patterns.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Small-cohort protection is active." }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Decide only on evidence the Builder deliberately shared.",
      }),
    ).toBeVisible();

    const institutionBody = page.locator("body");
    await expect(institutionBody).not.toContainText("contact_email");
    await expect(institutionBody).not.toContainText("whatsapp_number");
    await expect(institutionBody).not.toContainText("human_potential");
    await expect(institutionBody).not.toContainText("reflection_text");
    await expect(institutionBody).not.toContainText("problem_statement");
    await expect(institutionBody).not.toContainText("desired_outcome");

    await page.goto("/profile/verification");
    await expect(
      page.getByRole("heading", {
        name: "Share one exact capability when institutional confirmation matters.",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Connected institution", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("KAEC Nigerian Schools", { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("button", { name: "Share this evidence for verification" })
        .first(),
    ).toBeVisible();

    const builderBody = page.locator("body");
    await expect(builderBody).not.toContainText("contact_email");
    await expect(builderBody).not.toContainText("whatsapp_number");
    await expect(builderBody).not.toContainText("problem_statement");
    await expect(builderBody).not.toContainText("what_i_learned");
  },
);
