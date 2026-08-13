import { expect, test } from "@playwright/test";

test("selected economic pathways remain usable on mobile", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Focused Stage 12 mobile verification.");
  test.skip(
    !process.env.E2E_STAGE3_EMAIL || !process.env.E2E_STAGE3_PASSWORD,
    "Authenticated staging fixture is not configured.",
  );

  await page.goto("/login");
  await page.getByLabel("Email address").fill(process.env.E2E_STAGE3_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_STAGE3_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });

  await page.goto("/onboarding/discovery/profile");
  await expect(
    page.getByRole("heading", { name: "Possible Paths" }),
  ).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByRole("heading", { name: "Earn From Your Strengths" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Selected Path" })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
