import { expect, test } from "@playwright/test";

const builderRoutes = [
  "/app",
  "/onboarding/discovery",
  "/onboarding/discovery/profile",
  "/mission",
  "/journey",
  "/quests",
  "/proof",
  "/proof-unavailable",
  "/build",
  "/projects",
  "/portfolio",
  "/connect",
  "/connect/collaborations",
  "/profile",
  "/growth",
  "/guide",
  "/profile/verification",
  "/opportunities",
  "/passport",
] as const;

function isPreviewBrowserNoise(error: Error) {
  const stack = error.stack ?? "";

  // Vercel Preview injects a feedback toolbar iframe. Mobile WebKit does not
  // expose navigator.storage there, and the toolbar currently rejects while
  // probing storage persistence. The trace proves this stack originates from
  // vercel.live rather than PipuPath application code.
  if (stack.includes("https://vercel.live/_next-live/feedback/")) return true;

  // During deliberate page.goto navigation, WebKit can report abandoned
  // Next.js RSC prefetches as page errors even though the destination document
  // succeeds. Keep this narrow: it must be an RSC request, the specific WebKit
  // access-control message, and originate in the Next.js runtime chunk.
  return (
    /_rsc=.*due to access control checks\.$/.test(error.message) &&
    stack.includes("/_next/static/chunks/")
  );
}

test("Builder experience stays navigable from A to Z", async ({ page }) => {
  test.setTimeout(120_000);
  test.skip(
    !process.env.E2E_STAGE3_EMAIL || !process.env.E2E_STAGE3_PASSWORD,
    "Authenticated staging fixture is not configured.",
  );

  const runtimeFailures: string[] = [];
  let currentRoute = "/login";
  page.on("pageerror", (error) => {
    if (isPreviewBrowserNoise(error)) return;
    runtimeFailures.push(
      `${currentRoute}: ${error.message}${error.stack ? `\n${error.stack}` : ""}`,
    );
  });

  await page.goto("/login");
  await page.getByLabel("Email address").fill(process.env.E2E_STAGE3_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_STAGE3_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });

  for (const route of builderRoutes) {
    await test.step(`verify ${route}`, async () => {
      currentRoute = route;
      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
      });
      expect(
        response,
        `${route} should return a document response`,
      ).not.toBeNull();
      expect(
        response?.status(),
        `${route} should not return a server/client error`,
      ).toBeLessThan(400);
      await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
      await expect(
        page.locator("main#main-content"),
        `${route} should expose the shared main-content target`,
      ).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText("This path is not available")).toHaveCount(0);
      await expect(page.getByText("Application error")).toHaveCount(0);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(
        overflow,
        `${route} should not overflow horizontally`,
      ).toBeLessThanOrEqual(1);
    });
  }

  expect(
    runtimeFailures,
    "Builder routes should not throw PipuPath page errors",
  ).toEqual([]);
});
