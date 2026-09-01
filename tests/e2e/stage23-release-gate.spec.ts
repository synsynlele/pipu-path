import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_STAGE3_EMAIL;
const password = process.env.E2E_STAGE3_PASSWORD;

async function signIn(page: Page) {
  test.skip(
    !email || !password,
    "Authenticated release fixture is not configured.",
  );

  await page.goto("/login");
  await page.getByLabel("Email address").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 15_000 });
}

async function expectFiveDestinationNavigation(page: Page, isMobile: boolean) {
  const nav = page.getByRole("navigation", {
    name: isMobile ? "PipuPath mobile navigation" : "PipuPath application",
  });
  await expect(nav).toBeVisible();

  for (const destination of [
    "Home",
    "Discover",
    "Build",
    "Connect",
    "Profile",
  ]) {
    await expect(
      nav.getByRole("link", { name: destination, exact: true }),
    ).toBeVisible();
  }
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test("Stage 23 Builder shell, onboarding and navigation are production-ready", async ({
  page,
  isMobile,
}) => {
  await signIn(page);

  await page.goto("/app");
  await expect(page.locator("main#main-content")).toBeVisible();
  await expectFiveDestinationNavigation(page, isMobile);
  await expectNoHorizontalOverflow(page);

  await page.goto("/onboarding/discovery");
  await expect(
    page.getByRole("heading", {
      name: "Now discover the patterns worth exploring.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Private setup", { exact: true })).toBeVisible();
  await expect(
    page.getByText(/not made public by default/i),
  ).toBeVisible();

  const completed = page.getByRole("heading", {
    name: "Your answers are safely preserved.",
  });
  const questionForm = page.locator("form");
  const continueDiscovery = page.getByRole("link", {
    name: "Continue Discovery",
  });
  await expect(completed.or(questionForm).or(continueDiscovery)).toBeVisible();

  if (await completed.isVisible()) {
    const completionLink = page.locator(
      'a[href="/onboarding/discovery/complete"]',
    );
    await expect(completionLink).toBeVisible();
    await completionLink.click();
    await expect(page).toHaveURL(/\/onboarding\/discovery\/complete/);
  }
});

test("Stage 23 safeguarding, operator isolation and deep product assets hold", async ({
  page,
  isMobile,
}) => {
  await signIn(page);

  await page.goto("/connect");
  await expect(
    page.getByRole("heading", {
      name: "Find people to build with—not people to impress.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/without follower counts, popularity scores or unrestricted private messaging/i),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Public discovery and direct contact sharing stay closed for younger Builders.",
    }),
  ).toBeVisible();
  await expectFiveDestinationNavigation(page, isMobile);

  await page.goto("/connect/collaborations");
  await expect(
    page.getByRole("heading", { name: "Build together. Prove contribution." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Collaboration is adult-only in this MVP.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/not unrestricted chat, likes or popularity scores/i),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Collaboration" })).toHaveCount(0);

  await page.goto("/admin?window=30");
  await expect(
    page.getByRole("heading", { name: "This path is not available." }),
  ).toBeVisible();
  await expect(page.getByText("PipuPath Mission Control", { exact: true })).toHaveCount(0);

  await page.goto("/portfolio");
  await expect(
    page.getByRole("heading", {
      name: "Your real builds live here. You decide what leaves the Vault.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/private by default/i).first(),
  ).toBeVisible();
  await expectFiveDestinationNavigation(page, isMobile);

  await page.goto("/opportunities");
  await expect(
    page.getByRole("heading", {
      name: "Build capability here. Deploy it into a bigger real-world test.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/never promises selection, income or provider outcomes/i),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  for (const route of ["/build", "/projects", "/profile", "/passport"]) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.getByText("Application error")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  }
});

test("Stage 23 PWA contract is installable without caching private Builder data", async ({
  page,
}) => {
  const response = await page.request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);

  const manifest = (await response.json()) as {
    name?: string;
    display?: string;
    start_url?: string;
    icons?: Array<{ sizes?: string }>;
  };
  expect(manifest.name).toContain("PipuPath");
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("/");
  expect(manifest.icons?.some((icon) => icon.sizes === "192x192")).toBe(true);
  expect(manifest.icons?.some((icon) => icon.sizes === "512x512")).toBe(true);

  await page.goto("/");
  const serviceWorkers = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return [];
    const registrations = await navigator.serviceWorker.getRegistrations();
    return registrations.map((registration) => registration.scope);
  });
  expect(serviceWorkers).toEqual([]);
});
