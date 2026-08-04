import { expect, test, type Browser, type Page } from "@playwright/test";

const email = process.env.E2E_STAGE3_EMAIL;
const password = process.env.E2E_STAGE3_PASSWORD;

const publicCopy = {
  builderName: "Oluwatosin Builder",
  title: "Neighbourhood Reading Proof",
  summary:
    "I designed, tested and improved a small reading activity using available materials, then recorded what changed through three completed Project milestones.",
  problem:
    "Some younger learners nearby had few simple opportunities to practise reading aloud and receive useful feedback.",
  audience:
    "A small group of nearby primary-school learners and supportive caregivers.",
  outcome:
    "A complete thirty-minute reading activity was created, used with learners and improved after real feedback.",
  impact:
    "Learners completed the activity and caregiver feedback identified one useful improvement.",
  milestones: [
    "Clarified the reading challenge through safe conversations without publishing any participant identity.",
    "Built one usable reading session from a short story, questions and materials already available.",
    "Tested the session, recorded the response and improved one weak part before completion.",
  ],
} as const;

async function signIn(page: Page) {
  test.skip(
    !email || !password,
    "Authenticated staging fixture is not configured.",
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/, { timeout: 15_000 });
}

async function openPortfolioStudio(page: Page) {
  await page.goto("/portfolio");
  await expect(
    page.getByRole("heading", {
      name: "Present proof without surrendering privacy.",
    }),
  ).toBeVisible();

  const manageCurrent = page.getByRole("link", {
    name: "Manage Publication",
  });
  if ((await manageCurrent.count()) === 1) {
    await manageCurrent.click();
    return;
  }

  const projectAction = page
    .getByRole("link", {
      name: /Prepare Public Proof|Continue Portfolio Studio|Manage Public Proof/,
    })
    .first();
  await expect(projectAction).toBeVisible();
  await projectAction.click();
}

async function saveDraftWhenNeeded(page: Page) {
  const publishedHeading = page.getByText("Public now", { exact: true });
  if ((await publishedHeading.count()) === 1) return;

  const previewExisting = page.getByRole("link", {
    name: "Preview Existing Draft",
  });
  const editorSubmit = page.getByRole("button", {
    name: "Save and Preview Public Proof",
  });

  if ((await editorSubmit.count()) === 0) {
    await expect(previewExisting).toBeVisible();
    await previewExisting.click();
    return;
  }

  await page.getByLabel("Public Builder name").fill(publicCopy.builderName);
  await page.getByLabel("Public Project title").fill(publicCopy.title);
  await page.getByLabel("Public summary").fill(publicCopy.summary);
  await page.getByLabel("Problem addressed").fill(publicCopy.problem);
  await page.getByLabel("People or community served").fill(publicCopy.audience);
  await page.getByLabel("Useful outcome achieved").fill(publicCopy.outcome);
  await page.getByLabel("Truthful impact signal").fill(publicCopy.impact);
  for (const [index, summary] of publicCopy.milestones.entries()) {
    await page.locator(`#milestoneSummary${index + 1}`).fill(summary);
  }
  await editorSubmit.click();
  await expect(page).toHaveURL(/\/portfolio\/[0-9a-f-]+\/preview$/, {
    timeout: 15_000,
  });
}

async function publishFromPreview(page: Page) {
  await expect(
    page.getByText("Private preview", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: publicCopy.title }),
  ).toBeVisible();

  const alreadyPublished = page.getByText("Already published", { exact: true });
  if ((await alreadyPublished.count()) === 1) {
    const live = page.getByRole("link", { name: "Open Live Public Page" });
    const href = await live.getAttribute("href");
    expect(href).toMatch(/^\/proof\/[a-z0-9-]+$/);
    return href!;
  }

  await page.getByLabel("I choose to publish this exact proof").check();
  await page
    .getByRole("button", { name: "Publish This Project Proof" })
    .click();
  await expect(page).toHaveURL(/\/proof\/[a-z0-9-]+$/, {
    timeout: 15_000,
  });
  return new URL(page.url()).pathname;
}

async function verifyPublicProof(page: Page) {
  await expect(
    page.getByText("Verified Project Proof", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: publicCopy.title }),
  ).toBeVisible();
  await expect(
    page.getByText(publicCopy.builderName, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(publicCopy.summary, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(publicCopy.impact, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(publicCopy.milestones[0], { exact: true }),
  ).toBeVisible();

  const body = await page.locator("body").innerText();
  expect(body).not.toContain("The milestone result exists");
  expect(body).not.toContain("I completed the practical work");
  expect(body).not.toContain("Nortnspoil reflection");
  expect(body).not.toContain("Private update trail");
}

async function verifyAnonymousProof(browser: Browser, path: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const response = await page.goto(path);
  expect(response?.status()).toBe(200);
  await verifyPublicProof(page);
  await context.close();
}

async function verifyAnonymousUnavailable(browser: Browser, path: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const response = await page.goto(path);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /not found/i })).toBeVisible();
  await context.close();
}

test("authenticated adult publishes, withdraws and republishes one selective Project proof", async ({
  page,
  browser,
  isMobile,
}) => {
  test.setTimeout(180_000);
  test.skip(
    isMobile,
    "The complete portfolio mutation flow runs once on desktop.",
  );

  await signIn(page);
  await openPortfolioStudio(page);
  await expect(
    page.getByText("Private Portfolio Studio", { exact: true }),
  ).toBeVisible();

  const projectPath = new URL(page.url()).pathname;
  expect(projectPath).toMatch(/^\/portfolio\/[0-9a-f-]+$/);

  const publishedNow = page.getByText("Public now", { exact: true });
  let proofPath: string;
  if ((await publishedNow.count()) === 1) {
    const href = await page
      .getByRole("link", { name: "Open Public Proof" })
      .getAttribute("href");
    expect(href).toMatch(/^\/proof\/[a-z0-9-]+$/);
    proofPath = href!;
  } else {
    await saveDraftWhenNeeded(page);
    proofPath = await publishFromPreview(page);
  }

  await page.goto(proofPath);
  await verifyPublicProof(page);
  await verifyAnonymousProof(browser, proofPath);

  await page.goto(projectPath);
  await page.getByRole("button", { name: "Withdraw Public Proof" }).click();
  await expect(page).toHaveURL(projectPath, { timeout: 15_000 });
  await expect(page.getByText("Withdrawn", { exact: true })).toBeVisible();
  await verifyAnonymousUnavailable(browser, proofPath);

  await page.getByRole("link", { name: "Preview Existing Draft" }).click();
  const republishedPath = await publishFromPreview(page);
  expect(republishedPath).toBe(proofPath);
  await verifyAnonymousProof(browser, republishedPath);

  await page.reload();
  await verifyPublicProof(page);
  await page.goto("/portfolio");
  await expect(
    page.getByText("Current public proof", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(publicCopy.title, { exact: true })).toBeVisible();
});

test("anonymous users cannot access the private Portfolio Studio", async ({
  page,
}) => {
  await page.goto("/portfolio");
  await expect(page).toHaveURL(/\/login/);
});

test("Portfolio and public proof remain usable on a narrow screen", async ({
  page,
  isMobile,
}) => {
  test.skip(
    !isMobile,
    "Focused narrow-screen portfolio coverage runs on mobile only.",
  );
  await signIn(page);
  await page.goto("/portfolio");
  const mobileNavigation = page.getByRole("navigation", {
    name: "PipuPath mobile navigation",
  });
  await expect(mobileNavigation).toBeVisible();
  await expect(
    mobileNavigation.getByRole("link", { name: "Portfolio", exact: true }),
  ).toBeVisible();
  const publicLink = page.getByRole("link", { name: "View Public Proof" });
  await expect(publicLink).toBeVisible();
  await publicLink.click();
  await expect(
    page.getByRole("heading", { name: publicCopy.title }),
  ).toBeVisible();
  await expect(
    page.getByText("Verified Project Proof", { exact: true }),
  ).toBeVisible();
});
