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
    page.getByRole("heading", { name: "Paths to Test" }),
  ).toBeVisible({
    timeout: 20_000,
  });
  await expect(
    page.getByRole("heading", { name: "Ways to Create Value" }),
  ).toBeVisible();

  const selectedPath = page.getByRole("button", { name: "Selected Path" });
  if ((await selectedPath.count()) === 0) {
    const choosePath = page
      .getByRole("button", { name: "Choose This Path" })
      .first();
    await expect(choosePath).toBeVisible();
    await choosePath.click();
    await expect(page).toHaveURL(/\/onboarding\/discovery\/profile\/complete/, {
      timeout: 20_000,
    });
    await page.goto("/onboarding/discovery/profile");
  }
  await expect(page.getByRole("button", { name: "Selected Path" })).toBeVisible(
    { timeout: 20_000 },
  );

  const changePath = page
    .getByRole("button", { name: "Change to This Path" })
    .first();
  if ((await changePath.count()) > 0) {
    await changePath.click();
    await expect(
      page.getByText("Change your Path?", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(
        /Completed work, proof, reflections and XP stay saved/,
      ),
    ).toBeVisible();
    await page.getByRole("button", { name: "Keep Current Path" }).click();
    await expect(
      page.getByText("Change your Path?", { exact: true }),
    ).toHaveCount(0);
  }

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
