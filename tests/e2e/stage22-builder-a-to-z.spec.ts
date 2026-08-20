import { expect, test } from "@playwright/test";

const builderRoutes = [
  "/app",
  "/onboarding/discovery",
  "/onboarding/discovery/profile",
  "/mission",
  "/journey",
  "/quests",
  "/proof",
  "/build",
  "/projects",
  "/portfolio",
  "/connect",
  "/profile",
  "/opportunities",
  "/passport",
] as const;

test("Builder experience stays navigable from A to Z", async ({ page }) => {
  test.skip(
    !process.env.E2E_STAGE3_EMAIL || !process.env.E2E_STAGE3_PASSWORD,
    "Authenticated staging fixture is not configured.",
  );

  const runtimeFailures: string[] = [];
  page.on("pageerror", (error) => runtimeFailures.push(error.message));

  await page.goto("/login");
  await page.getByLabel("Email address").fill(process.env.E2E_STAGE3_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_STAGE3_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });

  for (const route of builderRoutes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response, `${route} should return a document response`).not.toBeNull();
    expect(
      response?.status(),
      `${route} should not return a server/client error`,
    ).toBeLessThan(400);
    await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
    await expect(page.locator("main#main-content")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("This path is not available")).toHaveCount(0);
    await expect(page.getByText("Application error")).toHaveCount(0);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, `${route} should not overflow horizontally`).toBeLessThanOrEqual(
      1,
    );
  }

  expect(runtimeFailures, "Builder routes should not throw page errors").toEqual(
    [],
  );
});
