import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_STAGE3_EMAIL;
const password = process.env.E2E_STAGE3_PASSWORD;
const expectPassport = process.env.E2E_STAGE21_EXPECT_PASSPORT === "true";

const releaseDisplayName = "Stage 21 Release Builder";
const publicSummary =
  "I use evidence from completed work to show what I can currently demonstrate.";
const selectedPathName = "Evidence-backed builder";

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

test("anonymous users cannot enter the private Builder Passport workspace", async ({
  page,
}) => {
  await page.goto("/passport");
  await expect(page).toHaveURL(/\/login/);
});

test("invalid public Passport shares fail closed without revealing why", async ({
  page,
  request,
}) => {
  const invalidShareId = "11111111-1111-4111-8111-111111111111";
  const invalidSecret = `ppsp_${"Z".repeat(43)}`;

  const response = await request.get(
    `/api/passport/v1/shares/${invalidShareId}`,
    { headers: { Authorization: `Bearer ${invalidSecret}` } },
  );
  expect(response.status()).toBe(404);
  expect(await response.json()).toEqual({
    error: "passport_share_unavailable",
  });
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["x-robots-tag"]).toContain("noindex");

  await page.goto(`/passport/share/${invalidShareId}#${invalidSecret}`);
  await expect(
    page.getByRole("heading", {
      name: "This Passport share is not available.",
    }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText(
    "passport_share_unavailable",
  );
});

test("Stage 21 issues, shares, verifies and revokes one exact Builder Passport", async ({
  browser,
  page,
  request,
}) => {
  test.skip(
    !expectPassport,
    "Stage 21 Passport release fixture is not configured.",
  );

  await signIn(page);
  await page.goto("/passport");
  await expect(
    page.getByRole("heading", { name: "Portable proof, controlled by you." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Prepare Passport" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Choose exactly what becomes portable.",
    }),
  ).toBeVisible();
  await page.getByLabel("Public-safe Builder summary").fill(publicSummary);
  await page.getByLabel("Selected pathway label").fill(selectedPathName);

  const claim = page.locator('input[name="claimIds"]').first();
  await claim.check();
  const evidence = page
    .locator('input[name="evidenceIds"]:not(:disabled)')
    .first();
  await expect(evidence).toBeEnabled();
  await evidence.check();

  await expect(
    page.getByText("Evidence shared", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(publicSummary, { exact: true }).last(),
  ).toBeVisible();
  await page
    .getByLabel(
      /I reviewed this exact Passport and consent to issue only the selected proof/i,
    )
    .check();
  await page.getByRole("button", { name: "Issue Passport" }).click();

  await expect(page).toHaveURL(/\/passport\?issued=1/);
  await expect(
    page.getByText("Passport issued. Review it below before creating a share."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: releaseDisplayName }),
  ).toBeVisible();

  await page.getByLabel("Share label").fill("Stage 21 release proof");
  await page.getByLabel("Expires").selectOption("1");
  await page.getByRole("button", { name: "Create share" }).click();

  const shareField = page.locator('input[readonly][value^="/passport/share/"]');
  await expect(shareField).toBeVisible();
  const relativeShareUrl = await shareField.inputValue();
  expect(relativeShareUrl).toMatch(
    /^\/passport\/share\/[0-9a-f-]{36}#ppsp_[A-Za-z0-9_-]{43}$/,
  );

  const [sharePath, secret] = relativeShareUrl.split("#");
  const shareId = sharePath.split("/").at(-1)!;
  expect(secret).toBeTruthy();

  const apiResponse = await request.get(`/api/passport/v1/shares/${shareId}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  expect(apiResponse.status()).toBe(200);
  expect(apiResponse.headers()["cache-control"]).toContain("no-store");
  expect(apiResponse.headers()["x-robots-tag"]).toContain("noindex");
  const apiBody = JSON.stringify(await apiResponse.json());
  expect(apiBody).toContain('"schemaVersion":"builder-passport.v1"');
  expect(apiBody).toContain(releaseDisplayName);
  expect(apiBody).not.toContain("contact_email");
  expect(apiBody).not.toContain("whatsapp_number");
  expect(apiBody).not.toContain("human_potential");
  expect(apiBody).not.toContain("reflection_text");
  expect(apiBody).not.toContain("sourceHref");

  const anonymous = await browser.newContext();
  const anonymousPage = await anonymous.newPage();
  const absoluteShareUrl = new URL(relativeShareUrl, page.url()).toString();
  await anonymousPage.goto(absoluteShareUrl);
  await expect(
    anonymousPage.getByRole("heading", { name: releaseDisplayName }),
  ).toBeVisible();
  await expect(
    anonymousPage.getByText("Integrity: Current", { exact: false }),
  ).toBeVisible();
  const publicBody = anonymousPage.locator("body");
  await expect(publicBody).not.toContainText("contact_email");
  await expect(publicBody).not.toContainText("whatsapp_number");
  await expect(publicBody).not.toContainText("human_potential");
  await expect(publicBody).not.toContainText("reflection_text");
  await expect(publicBody).not.toContainText("sourceHref");
  expect(new URL(anonymousPage.url()).hash).toBe("");
  await anonymous.close();

  await page.goto("/passport");
  await page.getByRole("button", { name: "Revoke share" }).click();
  await expect(page.getByText("Share revoked.", { exact: true })).toBeVisible();

  const revokedResponse = await request.get(
    `/api/passport/v1/shares/${shareId}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  );
  expect(revokedResponse.status()).toBe(404);

  await page.getByRole("button", { name: "Revoke current Passport" }).click();
  await expect(
    page.getByText("Passport revoked. Its active shares are no longer valid."),
  ).toBeVisible();
});
