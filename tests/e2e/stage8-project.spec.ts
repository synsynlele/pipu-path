import { expect, test } from "@playwright/test";

const email = process.env.E2E_STAGE3_EMAIL;
const password = process.env.E2E_STAGE3_PASSWORD;

async function signIn(page: import("@playwright/test").Page) {
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

function targetDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 30);
  return date.toISOString().slice(0, 10);
}

async function openOrCreateProject(page: import("@playwright/test").Page) {
  await page.goto("/projects");
  await expect(
    page.getByRole("heading", { name: "Turn proof into something useful." }),
  ).toBeVisible();

  const create = page.getByRole("link", {
    name: "Create My Builder Project",
  });
  if ((await create.count()) === 1) {
    await create.click();
    await expect(
      page.getByRole("heading", {
        name: "Build from what you have already proved.",
      }),
    ).toBeVisible();

    await page
      .getByLabel("Project title")
      .fill("Neighbourhood Reading Starter");
    await page
      .getByLabel("What problem will this Project address?")
      .fill(
        "Younger learners nearby have few simple opportunities to practise reading aloud with useful feedback.",
      );
    await page
      .getByLabel("Who should benefit?")
      .fill("Five nearby primary-school learners and their caregivers.");
    await page
      .getByLabel("What practical outcome should exist?")
      .fill(
        "Create and test one small reading activity that learners can use confidently with available materials.",
      );
    await page
      .getByLabel("What is the smallest useful version?")
      .fill(
        "One thirty-minute reading session with a short story, three questions and caregiver feedback.",
      );
    await page
      .getByLabel("What will prove it worked?")
      .fill(
        "At least three learners finish the session and one caregiver confirms that it was useful.",
      );
    await page.getByLabel("Target date").fill(targetDate());

    const milestoneContent = [
      {
        outcome:
          "Confirm the specific reading challenge through three short conversations with learners or caregivers.",
        signal:
          "Three honest conversation notes identify one repeated reading challenge.",
      },
      {
        outcome:
          "Prepare one complete reading activity that a learner can use with materials already available.",
        signal:
          "The story, questions and simple facilitation steps are ready for one real session.",
      },
      {
        outcome:
          "Run the reading session, collect feedback and improve one weak part of the activity.",
        signal:
          "A real test, participant response and one evidence-based improvement are recorded.",
      },
    ];

    for (const [index, milestone] of milestoneContent.entries()) {
      const number = index + 1;
      await page.locator(`#milestone${number}Outcome`).fill(milestone.outcome);
      await page.locator(`#milestone${number}Signal`).fill(milestone.signal);
    }

    await page
      .getByRole("button", { name: "Create My Builder Project" })
      .click();
    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+$/, {
      timeout: 15_000,
    });
    return;
  }

  const active = page.getByRole("link", {
    name: "Open Project Command Centre",
  });
  if ((await active.count()) === 1) {
    await active.click();
    return;
  }

  const completed = page.getByRole("link", { name: "Review Project" }).first();
  await expect(completed).toBeVisible();
  await completed.click();
}

test("authenticated Builder creates and completes an evidence-linked Project", async ({
  page,
  isMobile,
}) => {
  test.setTimeout(180_000);
  test.skip(
    isMobile,
    "The complete Project mutation flow runs once on desktop.",
  );
  await signIn(page);
  await openOrCreateProject(page);

  await expect(
    page.getByText("Builder Project · Private", { exact: true }),
  ).toBeVisible();

  const completionHeading = page.getByRole("heading", {
    name: "A useful result now has an evidence trail.",
  });

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    if (await completionHeading.isVisible()) break;

    const progress = page.getByLabel("What progress did you make?");
    await expect(progress).toBeVisible({ timeout: 15_000 });
    await progress.fill(
      `I completed the practical work for the current milestone, used available resources and recorded the result with the people involved. Attempt ${attempt}.`,
    );
    await page
      .getByLabel("What proof exists?")
      .fill(
        "The milestone result exists, the participant response was recorded and the stated completion signal can now be checked honestly.",
      );
    await page
      .getByLabel("What is the next practical action?")
      .fill(
        "Open the next available milestone, or review the completed Project evidence when this is the final milestone.",
      );
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", { name: "Record Progress and Proof" })
      .click();
    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+$/, {
      timeout: 30_000,
    });
    await page.reload();
    await expect(
      completionHeading.or(page.getByLabel("What progress did you make?")),
    ).toBeVisible({ timeout: 30_000 });
  }

  await expect(completionHeading).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("100%", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Milestone completed", { exact: true }),
  ).toHaveCount(3);

  await page.reload();
  await expect(completionHeading).toBeVisible();
  await page.goto("/projects");
  const completedProjects = page
    .getByRole("heading", { name: "Completed Projects" })
    .locator("..");
  await expect(
    page.getByRole("heading", { name: "Completed Projects" }),
  ).toBeVisible();
  await expect(
    completedProjects
      .getByRole("heading", { name: "Neighbourhood Reading Starter" })
      .first(),
  ).toBeVisible();
});

test("anonymous users cannot access private Projects", async ({ page }) => {
  await page.goto("/projects");
  await expect(page).toHaveURL(/\/login/);
});

test("Project command centre remains usable on a narrow screen", async ({
  page,
  isMobile,
}) => {
  test.skip(
    !isMobile,
    "Focused narrow-screen Project coverage runs on mobile only.",
  );
  await signIn(page);
  await page.goto("/projects");
  await expect(
    page.getByRole("heading", { name: "Turn proof into something useful." }),
  ).toBeVisible();
  const mobileNavigation = page.getByRole("navigation", {
    name: "PipuPath mobile navigation",
  });
  await expect(mobileNavigation).toBeVisible();
  await expect(
    mobileNavigation.getByRole("link", { name: "Build", exact: true }),
  ).toBeVisible();
});
