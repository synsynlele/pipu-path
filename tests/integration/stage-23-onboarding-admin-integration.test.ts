import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const continuePage = read("src/app/continue/page.tsx");
const progress = read("src/modules/identity/domain/progress.ts");
const onboardingShell = read("src/components/onboarding/onboarding-shell.tsx");
const normalizedOnboardingShell = onboardingShell.replace(/\s+/g, " ");
const identityPage = read("src/app/onboarding/identity/page.tsx");
const discoveryPage = read("src/app/onboarding/discovery/page.tsx");
const discoveryQuestion = read(
  "src/app/onboarding/discovery/[section]/page.tsx",
);
const home = read("src/app/app/page.tsx");
const adminPage = read("src/app/admin/page.tsx");
const adminLayout = read("src/app/admin/layout.tsx");
const adminDal = read("src/modules/admin/infrastructure/admin-dal.ts");

describe("Stage 23 onboarding and Mission Control integration", () => {
  it("keeps /continue as the single progression router for new and returning Builders", () => {
    expect(continuePage).toContain('redirect("/")');
    const realQuests = read("src/app/real-quests/page.tsx");
    expect(realQuests).toContain("getBuildHome");
    expect(realQuests).toContain("<BuildChoiceForm");
    expect(progress).toContain('path: "/onboarding/identity"');
    expect(progress).toContain('path: "/onboarding/discovery"');
    expect(progress).toContain('path: "/onboarding/discovery/review"');
    expect(progress).toContain('path: "/onboarding/discovery/profile"');
    expect(progress.indexOf("!snapshot.identityComplete")).toBeLessThan(
      progress.indexOf("!snapshot.discoveryStatus"),
    );
  });

  it("presents Identity and Discovery as one coherent mobile-first onboarding experience", () => {
    expect(onboardingShell).toContain('aria-label="Setup sections"');
    expect(onboardingShell).toContain("Your account");
    expect(onboardingShell).toContain("Starting point");
    expect(onboardingShell).toContain("Your direction");
    expect(onboardingShell).toContain("Back to play");
    expect(onboardingShell).not.toContain("{progress}%");
    expect(identityPage).toContain("<OnboardingShell");
    expect(identityPage).toContain("activeStep={1}");
    expect(discoveryPage).toContain("<OnboardingShell");
    expect(discoveryPage).toContain("activeStep={2}");
    expect(discoveryQuestion).toContain("<OnboardingShell");
    expect(discoveryQuestion).toContain("one honest answer at a time");
  });

  it("does not turn onboarding into scoring, public identity or instant AI judgement", () => {
    expect(discoveryPage).toContain("Your answers stay private.");
    expect(discoveryPage).toContain("Skip optional questions");
    expect(normalizedOnboardingShell).toContain(
      "Your answers and evidence stay private unless you choose to share them.",
    );
    expect(discoveryQuestion).toContain("no score to chase");
  });

  it("exposes Mission Control only through the existing active admin-role boundary", () => {
    expect(home).toContain("getCurrentPlatformAdminRole");
    expect(home).toContain('href="/admin"');
    expect(adminDal).toContain('.from("platform_admins")');
    expect(adminDal).toContain('.eq("status", "active")');
    expect(adminDal).toContain('return { access: "forbidden" }');
    expect(adminPage).toContain("getAdminDashboardState");
    expect(adminPage).toContain('state.access === "forbidden"');
  });

  it("keeps Mission Control aggregate-only and exposes every operator workspace", () => {
    expect(adminPage).toContain("Aggregate product intelligence only");
    expect(adminPage).toContain("Private Discovery answers");
    expect(adminPage).toContain("not part of this dashboard");
    expect(adminLayout).toContain('href: "/admin/institutions"');
    expect(adminLayout).toContain('href: "/admin/opportunities"');
    expect(adminLayout).toContain('href: "/admin/providers"');
    expect(adminLayout).toContain("Operator mode");
    expect(adminLayout).toContain("Exit to PipuPath");
  });
});
