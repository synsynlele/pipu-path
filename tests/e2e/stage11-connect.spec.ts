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

test("Builder Connect preserves its privacy and safeguarding boundary", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/connect");

  await expect(
    page.getByRole("heading", {
      name: "Find trusted Builders around complementary missions.",
    }),
  ).toBeVisible();

  await expect(
    page
      .getByRole("heading", {
        name: "Control how other Builders discover you.",
      })
      .or(
        page.getByRole("heading", {
          name: "Builder Connect is adult-only in this MVP.",
        }),
      ),
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "Connect", exact: true }).first(),
  ).toBeVisible();
});
