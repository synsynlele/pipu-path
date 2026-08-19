import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_STAGE3_EMAIL;
const password = process.env.E2E_STAGE3_PASSWORD;

async function signIn(page: Page) {
  if (!email || !password) {
    throw new Error("Stage 22 release proof requires the authenticated E2E fixture.");
  }

  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect
    .poll(() => new URL(page.url()).pathname, { timeout: 15_000 })
    .not.toBe("/login");
}

test("Stage 22 exact-preview release proof", async ({ page }) => {
  const landing = await page.goto("/");
  expect(landing?.ok()).toBe(true);
  await expect(
    page.getByRole("heading", {
      name: "Your potential deserves a path into the real world.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Private by default", { exact: true })).toBeVisible();

  const unavailableProof = await page.goto(
    "/proof/stage22-release-proof-does-not-exist",
  );
  expect(unavailableProof?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This proof is not public right now." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Return to PipuPath" }),
  ).toBeVisible();

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();

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

  await page.goto("/app");
  await expect(page.getByText("⚡ Your next move", { exact: true })).toBeVisible();
  await expect(page.getByText("Adventure map", { exact: true })).toBeVisible();
  await expect(page.getByText("Builder level", { exact: true })).toBeVisible();

  const desktopNavigation = page.getByRole("navigation", {
    name: "PipuPath application",
  });
  await expect(desktopNavigation).toBeVisible();
  for (const label of ["Home", "Journey", "Build", "Vault", "Connect", "Me"]) {
    await expect(desktopNavigation.getByText(label, { exact: true })).toBeVisible();
  }

  await expect(
    page.getByText("Mission Control available", { exact: true }),
  ).toBeVisible();
  const missionControl = page.getByRole("link", {
    name: "Enter Mission Control",
  });
  await expect(missionControl).toBeVisible();
  await missionControl.click();
  await expect(
    page.getByText("PipuPath Mission Control", { exact: true }),
  ).toBeVisible();

  await page.goto("/growth");
  await expect(
    page.getByRole("heading", {
      name: "Learn only what helps the next real move.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Profile" })).toBeVisible();
  await expect(
    page
      .getByRole("button", { name: "Build My Growth Pack" })
      .or(
        page.getByRole("heading", {
          name: "Your evidence foundation comes first.",
        }),
      )
      .first(),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Learning resources are suggestions, not endorsements or guarantees.",
      { exact: false },
    ),
  ).toBeVisible();

  await page.goto("/journey");
  await expect(
    page.getByRole("navigation", { name: "PipuPath application" }),
  ).toBeVisible();
  await expect(page.getByText(/Application error/i)).toHaveCount(0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/app");
  await expect(page.getByText("⚡ Your next move", { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app");
  const mobileNavigation = page.getByRole("navigation", {
    name: "PipuPath mobile navigation",
  });
  await expect(mobileNavigation).toBeVisible();
  for (const label of ["Home", "Journey", "Build", "Vault", "Connect", "Me"]) {
    await expect(mobileNavigation.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(page.getByText("⚡ Your next move", { exact: true })).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
