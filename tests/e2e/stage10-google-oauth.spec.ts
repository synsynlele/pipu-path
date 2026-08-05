import { expect, test } from "@playwright/test";

const externalBaseUrl = process.env.E2E_BASE_URL;

test("Google OAuth handoff uses the exact staging callback and reaches Google", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "The external OAuth handoff is verified once on desktop.",
  );

  const expectedOrigin = new URL(externalBaseUrl ?? "http://127.0.0.1:3000")
    .origin;

  await page.goto("/login");

  const authorizeResponsePromise = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname.endsWith("/auth/v1/authorize") &&
      url.searchParams.get("provider") === "google"
    );
  });

  const navigationPromise = page
    .waitForURL(/accounts\.google\.com/, { timeout: 30_000 })
    .catch(() => null);

  await page.getByRole("button", { name: /google/i }).click();

  const authorizeResponse = await authorizeResponsePromise;
  const authorizeUrl = new URL(authorizeResponse.url());
  const redirectToValue = authorizeUrl.searchParams.get("redirect_to");

  expect(redirectToValue).toBeTruthy();
  const redirectTo = new URL(redirectToValue!);
  expect(redirectTo.origin).toBe(expectedOrigin);
  expect(redirectTo.pathname).toBe("/auth/callback");
  expect(redirectTo.searchParams.get("next")).toBe("/app");
  expect([302, 303]).toContain(authorizeResponse.status());
  expect(authorizeResponse.headers()["location"]).toMatch(
    /^https:\/\/accounts\.google\.com\//,
  );

  await navigationPromise;
  expect(page.url()).toMatch(/^https:\/\/accounts\.google\.com\//);
});
