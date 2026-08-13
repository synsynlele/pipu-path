import { expect, test } from "@playwright/test";

async function assertNoDiscoveryError(page: import("@playwright/test").Page) {
  const alert = page.locator('form p[role="alert"]');
  if ((await alert.count()) === 1) {
    throw new Error(
      `Discovery interaction failed: ${await alert.textContent()}`,
    );
  }
}

async function assertNoRuntimeFailure(page: import("@playwright/test").Page) {
  const runtimeFailure = page.getByRole("heading", {
    name: "We could not load this page.",
  });
  if (await runtimeFailure.isVisible().catch(() => false)) {
    throw new Error(
      "Preview runtime failed during authentication. Inspect the matching Vercel POST /login log.",
    );
  }
}

async function submitAndAwaitDiscoveryTransition(
  page: import("@playwright/test").Page,
  button: import("@playwright/test").Locator,
) {
  const previousUrl = page.url();
  await button.click();
  await expect.poll(() => page.url()).not.toBe(previousUrl);
  await page.waitForLoadState("domcontentloaded");
  await expect
    .poll(async () => {
      const continueDiscovery = page.getByRole("link", {
        name: "Continue Discovery",
      });
      const reviewAnswers = page.getByRole("button", {
        name: "Review my answers",
      });
      const continueReview = page.getByRole("link", {
        name: "Continue review",
      });
      return (
        (await page.locator("form").count()) +
        (await continueDiscovery.count()) +
        (await reviewAnswers.count()) +
        (await continueReview.count())
      );
    })
    .toBeGreaterThan(0);
  await assertNoDiscoveryError(page);
}

async function generateAndVerifyProfile(page: import("@playwright/test").Page) {
  await page.goto("/onboarding/discovery/profile");
  const generate = page.getByRole("button", { name: "Generate my profile" });
  if ((await generate.count()) === 1) {
    await generate.click();
    await expect(page.getByRole("status")).toHaveText(
      "PipuPath is analysing your Discovery responses…",
    );
  }

  await expect(page.getByRole("heading", { name: "Summary" })).toBeVisible({
    timeout: 45_000,
  });
  await expect(
    page.getByRole("heading", {
      name: "A starting point for your next steps.",
    }),
  ).toBeVisible();
  for (const section of [
    "Emerging Strengths",
    "What Draws You",
    "Problems You Care About",
    "How You Can Contribute",
    "Current Constraints",
    "Best Next Direction",
  ]) {
    await expect(page.getByRole("heading", { name: section })).toBeVisible();
  }

  await page.reload();
  await expect(page.getByRole("heading", { name: "Summary" })).toBeVisible();
  await page.getByRole("button", { name: "👍 Accurate" }).first().click();
  await expect(
    page.getByText(/Saved response: 👍 Accurate/).first(),
  ).toBeVisible({ timeout: 15_000 });

  await expect(
    page.getByRole("heading", { name: "Possible Paths" }),
  ).toBeVisible();
  const explorePaths = page.getByRole("button", {
    name: "Explore Possible Paths",
  });
  if ((await explorePaths.count()) === 1) {
    await explorePaths.click();
    await expect(
      page
        .getByRole("button", { name: "Choose This Path" })
        .or(page.getByRole("button", { name: "Selected Path" }))
        .first(),
    ).toBeVisible({ timeout: 60_000 });
  }

  await expect(
    page.getByRole("heading", { name: "Earn From Your Strengths" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Observed Pattern").first()).toBeVisible();
  await expect(page.getByText("Possible Interpretation").first()).toBeVisible();
  await expect(page.getByText("Evidence Needed").first()).toBeVisible();

  const choosePath = page.getByRole("button", { name: "Choose This Path" });
  if ((await choosePath.count()) > 0) {
    await choosePath.first().click();
    await expect(page).toHaveURL(/\/onboarding\/discovery\/profile\/complete/, {
      timeout: 20_000,
    });
  } else {
    const continueWithPath = page.getByRole("link", {
      name: /^Continue With /,
    });
    await expect(continueWithPath).toBeVisible();
    await continueWithPath.click();
    await expect(page).toHaveURL(/\/onboarding\/discovery\/profile\/complete/);
  }

  await expect(
    page.getByRole("heading", {
      name: "Test the path. Let evidence teach you.",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Build My Practical Mission" }).click();
  await generateAndVerifyMission(page);
}

async function generateAndVerifyMission(page: import("@playwright/test").Page) {
  await expect(page).toHaveURL(/\/mission$/);
  const active = page.getByText("Active Mission", { exact: true });
  const generate = page.getByRole("button", { name: "Generate My Mission" });
  const review = page.getByText("Mission Review", { exact: true });
  await expect(active.or(generate).or(review)).toBeVisible({ timeout: 15_000 });
  if ((await active.count()) === 0) {
    if ((await generate.count()) === 1) {
      await generate.click();
      await expect(page.getByRole("status")).toContainText(
        "PipuPath is shaping a practical mission",
      );
      await expect(review).toBeVisible({ timeout: 50_000 });
    }

    const refine = page.getByRole("button", { name: "Refine Mission" });
    if (
      (await refine.count()) === 1 &&
      (await refine.isEnabled().catch(() => false))
    ) {
      const missionId = page.locator('input[name="missionId"]');
      const sourceMissionId = await missionId.inputValue();
      await page
        .getByLabel("Refine this mission")
        .fill("Make it achievable without spending money");
      await refine.click();
      await expect(missionId).not.toHaveValue(sourceMissionId, {
        timeout: 60_000,
      });
      await expect(review).toBeVisible();
    }
    const acceptMission = page.getByRole("button", {
      name: "Accept Mission",
    });
    await expect(acceptMission).toBeEnabled({ timeout: 60_000 });
    await acceptMission.click();
    await expect(active).toBeVisible({ timeout: 15_000 });
  }

  await expect(
    page.getByRole("heading", { name: "Mission Statement" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Who This Helps" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "First Meaningful Outcome" }),
  ).toBeVisible();
  await page.reload();
  await expect(active).toBeVisible();
  await page.getByRole("link", { name: "Build My 30-Day Pathway" }).click();
  await expect(page).toHaveURL(/\/mission\/complete/);
  await expect(
    page.getByRole("heading", {
      name: "Your direction is ready for a Journey.",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Build My Journey" }).click();
  await generateAndVerifyJourney(page);
}

async function generateAndVerifyJourney(page: import("@playwright/test").Page) {
  await expect(page).toHaveURL(/\/journey$/);
  const activeJourney = page.getByText("Active Journey", { exact: false });
  const activePathway = page.getByText("Active Pathway", { exact: false });
  const active = activeJourney.or(activePathway);
  const generate = page.getByRole("button", { name: "Generate My Journey" });
  const continueJourney = page.getByRole("button", {
    name: "Build My Next Journey",
  });
  const completedJourney = page.getByText("Completed Journey", {
    exact: false,
  });
  const completedPathway = page.getByText("Completed Pathway", {
    exact: false,
  });
  const completed = completedJourney.or(completedPathway);
  const legacyReview = page.getByText("Journey Review", { exact: false });
  const pathwayReview = page.getByText("30-Day Pathway Review", {
    exact: false,
  });
  const review = legacyReview.or(pathwayReview);
  await expect
    .poll(
      async () =>
        (await active.count()) +
        (await generate.count()) +
        (await continueJourney.count()) +
        (await completed.count()) +
        (await review.count()),
      { timeout: 15_000 },
    )
    .toBeGreaterThan(0);

  if ((await active.count()) === 0) {
    if ((await continueJourney.count()) === 1) {
      await expect(continueJourney).toBeEnabled();
      await continueJourney.click();
      await expect(page.getByRole("status")).toContainText(
        "PipuPath is shaping the next evidence-based milestones from your mission",
      );
      await expect(review).toBeVisible({ timeout: 60_000 });
    } else if ((await generate.count()) === 1) {
      await generate.click();
      await expect(page.getByRole("status")).toContainText(
        "PipuPath is shaping milestones",
      );
      await expect(review).toBeVisible({ timeout: 55_000 });
    }

    const refine = page.getByRole("button", { name: "Refine Journey" });
    if (
      (await refine.count()) === 1 &&
      (await refine.isEnabled().catch(() => false))
    ) {
      const journeyId = page.locator('input[name="journeyId"]');
      const sourceJourneyId = await journeyId.inputValue();
      await page
        .getByLabel("Refine this Journey")
        .fill("Make every milestone possible without spending money");
      await refine.click();
      await expect(journeyId).not.toHaveValue(sourceJourneyId, {
        timeout: 60_000,
      });
    }

    const startPathway = page.getByRole("button", {
      name: "Start 30-Day Pathway",
    });
    const acceptJourney = page.getByRole("button", { name: "Accept Journey" });
    await expect(startPathway.or(acceptJourney)).toBeEnabled({
      timeout: 60_000,
    });
    if ((await startPathway.count()) === 1) {
      await startPathway.click();
    } else {
      await acceptJourney.click();
    }
    await expect(active).toBeVisible({ timeout: 15_000 });
  }

  const weekOne = page.getByText(/Week 1 · Learn/);
  const milestoneOne = page.getByText(/Milestone 1/);
  await expect(weekOne.or(milestoneOne)).toBeVisible();
  await page.reload();
  await expect(active).toBeVisible();
  const startWeek = page.getByRole("link", { name: "Start Week 1" });
  const startMilestone = page.getByRole("link", {
    name: "Start First Milestone",
  });
  if ((await startWeek.count()) === 1) {
    await startWeek.click();
  } else {
    await startMilestone.click();
  }
  await expect(page).toHaveURL(/\/journey\/complete/);
  await expect(
    page.getByRole("link", { name: "Begin HQLS Quests" }),
  ).toBeVisible();
}

test("eligible user completes persistent Discovery without invented results", async ({
  page,
  isMobile,
}) => {
  test.setTimeout(300_000);
  test.skip(
    isMobile,
    "The full flow runs once; mobile controls have a focused test.",
  );
  test.skip(
    !process.env.E2E_STAGE3_EMAIL || !process.env.E2E_STAGE3_PASSWORD,
    "Authenticated staging fixture is not configured.",
  );

  await page.goto("/login");
  await page.getByLabel("Email address").fill(process.env.E2E_STAGE3_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_STAGE3_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect
    .poll(
      async () => {
        await assertNoRuntimeFailure(page);
        return new URL(page.url()).pathname;
      },
      { timeout: 15_000 },
    )
    .not.toBe("/login");

  await page.goto("/onboarding/discovery");
  await page.locator("#main-content").waitFor({ state: "visible" });
  const persistedCompletion = page.getByRole("link", {
    name: "View completion",
  });
  if ((await persistedCompletion.count()) === 1) {
    await persistedCompletion.click();
    await expect(page).toHaveURL(/\/onboarding\/discovery\/complete/);
    await expect(
      page.getByRole("heading", {
        name: "Your evidence is safely prepared.",
      }),
    ).toBeVisible();
    await expect(
      page.getByText(/private, provisional Human Potential Profile/),
    ).toBeVisible();
    await page.reload();
    await expect(page).toHaveURL(/\/onboarding\/discovery\/complete/);
    await generateAndVerifyProfile(page);
    return;
  }

  const begin = page.getByRole("button", { name: "Begin Discovery" });
  if ((await begin.count()) === 1) {
    await begin.click();
    await page
      .getByRole("link", { name: "Continue Discovery" })
      .waitFor({ state: "visible" });
  }

  for (let index = 0; index < 30; index += 1) {
    if (page.url().includes("/review")) break;
    const continueDiscovery = page.getByRole("link", {
      name: "Continue Discovery",
    });
    if ((await continueDiscovery.count()) === 1) {
      await Promise.all([
        page.waitForURL(
          (url) =>
            /^\/onboarding\/discovery\/[^/]+$/.test(url.pathname) &&
            !url.pathname.endsWith("/review") &&
            !url.pathname.endsWith("/complete"),
          { waitUntil: "commit" },
        ),
        continueDiscovery.click(),
      ]);
      await page.locator("form").waitFor({ state: "visible" });
      continue;
    }
    const continueReview = page.getByRole("link", {
      name: "Continue review",
    });
    if ((await continueReview.count()) === 1) {
      await continueReview.click();
      await expect(page).toHaveURL(/\/onboarding\/discovery\/review/);
      continue;
    }
    const reviewAnswers = page.getByRole("button", {
      name: "Review my answers",
    });
    if ((await reviewAnswers.count()) === 1) {
      await expect(reviewAnswers).toBeVisible();
      await Promise.all([
        page.waitForURL(/\/onboarding\/discovery\/review/, {
          waitUntil: "commit",
        }),
        reviewAnswers.click(),
      ]);
      continue;
    }
    const textarea = page.locator("textarea");
    const radios = page.locator('input[type="radio"]');
    const checkboxes = page.locator('input[type="checkbox"]');
    const skip = page.getByRole("button", { name: "Skip for now" });
    if (await skip.count()) {
      await submitAndAwaitDiscoveryTransition(page, skip);
    } else if (await textarea.count()) {
      await textarea.fill(
        "Synthetic browser evidence for Stage 3 verification.",
      );
      await submitAndAwaitDiscoveryTransition(
        page,
        page.getByRole("button", { name: "Save and continue" }),
      );
    } else if (await radios.count()) {
      await radios.first().check({ force: true });
      await submitAndAwaitDiscoveryTransition(
        page,
        page.getByRole("button", { name: "Save and continue" }),
      );
    } else if (await checkboxes.count()) {
      await checkboxes.first().check();
      await submitAndAwaitDiscoveryTransition(
        page,
        page.getByRole("button", { name: "Save and continue" }),
      );
    } else {
      throw new Error(`No supported Discovery input found at ${page.url()}`);
    }
  }

  await expect(page).toHaveURL(/\/onboarding\/discovery\/review/);
  await expect(
    page.getByRole("heading", { name: "Your answers, in your words." }),
  ).toBeVisible({ timeout: 15_000 });

  await page.getByRole("link", { name: "Edit answer" }).first().click();
  const editTextarea = page.locator("textarea");
  if (await editTextarea.count()) {
    await editTextarea.fill("Edited synthetic browser evidence.");
  }
  await page.getByRole("button", { name: "Save edit" }).click();
  await expect(page).toHaveURL(/\/onboarding\/discovery\/review/);

  await page.getByRole("button", { name: "Complete Discovery" }).click();
  await expect(page).toHaveURL(/\/onboarding\/discovery\/complete/);
  await expect(
    page.getByRole("heading", { name: "Your evidence is safely prepared." }),
  ).toBeVisible();
  await expect(
    page.getByText(/private, provisional Human Potential Profile/),
  ).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/onboarding\/discovery\/complete/);
  await generateAndVerifyProfile(page);
});
