import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const callback = read("src/app/auth/callback/route.ts");
const oauthClient = read("src/lib/supabase/oauth-callback.ts");
const authActions = read("src/modules/identity/application/auth-actions.ts");
const progress = read("src/modules/identity/domain/progress.ts");
const requestOrigin = read(
  "src/modules/identity/application/request-origin.ts",
);
const redirects = read("src/modules/identity/application/redirects.ts");
const proxy = read("src/proxy.ts");
const landing = read("src/app/page.tsx");
const home = read("src/app/app/page.tsx");
const navigation = read("src/components/navigation/app-navigation.tsx");
const shell = read("src/components/shells/app-shell.tsx");
const css = read("src/app/globals.css");
const layout = read("src/app/layout.tsx");
const config = read("next.config.ts");
const migration = read(
  "supabase/migrations/202608050020_stage_10_durable_auth_rate_limit.sql",
);
const rateLimitRepair = read(
  "supabase/migrations/202608050021_fix_stage_10_auth_rate_limit_timestamp.sql",
);
const routeMap = read("docs/implementation/route-map.md");
const oauthRunbook = read("docs/runbooks/google-oauth.md");
const releaseChecklist = read("docs/release/stage-10-release-checklist.md");
const rollback = read("docs/release/stage-10-rollback-plan.md");
const debt = read("docs/release/stage-10-known-debt.md");
const adr = read("docs/architecture/adr-stage-10-mvp-launch-readiness.md");

const expectedLoadingAndErrors = [
  "src/app/loading.tsx",
  "src/app/error.tsx",
  "src/app/not-found.tsx",
  "src/app/app/loading.tsx",
  "src/app/app/error.tsx",
  "src/app/onboarding/loading.tsx",
  "src/app/onboarding/error.tsx",
  "src/app/mission/loading.tsx",
  "src/app/mission/error.tsx",
  "src/app/journey/loading.tsx",
  "src/app/journey/error.tsx",
  "src/app/quests/loading.tsx",
  "src/app/quests/error.tsx",
  "src/app/projects/loading.tsx",
  "src/app/projects/error.tsx",
  "src/app/portfolio/loading.tsx",
  "src/app/portfolio/error.tsx",
];

describe("Stage 10 MVP launch-readiness contract", () => {
  it("exchanges the OAuth code and persists callback cookies on the redirect", () => {
    expect(callback).toContain("exchangeCodeForSession");
    expect(callback).toContain("applyCookies(");
    expect(oauthClient).toContain("pendingCookies");
    expect(oauthClient).toContain("response.cookies.set");
    expect(callback).toContain("getAuthenticatedHomeState");
  });

  it("uses trusted origins and rejects open redirects", () => {
    expect(requestOrigin).toContain("vercel\\.app");
    expect(requestOrigin).toContain("configured.origin");
    expect(requestOrigin).toContain('protocol === "http"');
    expect(redirects).toContain("safeNextPath");
    expect(redirects).toContain('value.startsWith("//")');
    expect(authActions).toContain("resolveTrustedRequestOrigin");
  });

  it("shares one progression resolver across Google and email authentication", () => {
    expect(callback).toContain("state.destination.path");
    expect(authActions).toContain("getAuthenticatedHomeState(client)");
    expect(proxy).toContain('destination.pathname = "/continue"');
    expect(progress.indexOf("snapshot.activeProjectId")).toBeLessThan(
      progress.indexOf('snapshot.journeyStatus === "active"'),
    );
    expect(progress.indexOf("snapshot.completedProjectId")).toBeLessThan(
      progress.indexOf('snapshot.journeyStatus === "active"'),
    );
  });

  it("keeps password recovery on its explicit reset route", () => {
    expect(authActions).toContain("next=/reset-password");
    expect(redirects).toContain("/reset-password");
    expect(callback).toContain("requestedPath");
  });

  it("protects every private MVP route family", () => {
    for (const prefix of [
      "/app",
      "/build",
      "/continue",
      "/onboarding",
      "/mission",
      "/journey",
      "/quests",
      "/projects",
      "/portfolio",
    ]) {
      expect(proxy).toContain(`"${prefix}"`);
    }
    expect(proxy).toContain("get_stage9_public_portfolio");
    expect(proxy).toContain("status: 404");
  });

  it("positions the public product without fake proof", () => {
    expect(landing).toContain("The University for Human Potential");
    expect(landing).toContain("Discover who you are");
    expect(landing).toContain("Start Your Journey");
    expect(landing).toContain("How PipuPath Works");
    expect(landing).toContain("Private by default");
    expect(landing).not.toMatch(/10,?000|million users|trusted by/i);
  });

  it("uses the exact five-item launch navigation", () => {
    for (const label of ["Home", "Journey", "Build", "Portfolio", "Profile"]) {
      expect(navigation).toContain(`label: "${label}"`);
    }
    expect(navigation.match(/label: "/g)).toHaveLength(5);
    expect(navigation).not.toContain("Builders");
    expect(navigation).not.toContain("Discovery");
    expect(navigation).toContain("PipuPath mobile navigation");
  });

  it("builds Home from persisted data and one next destination", () => {
    expect(home).toContain("requireAuthenticatedHomeState");
    expect(home).toContain("state.destination.path");
    expect(home).toContain("state.totalXp");
    expect(home).toContain("state.recentAchievement");
    expect(home).toContain("state.portfolio");
    expect(home).not.toContain("fake");
  });

  it("provides complete route loading and safe error boundaries", () => {
    for (const path of expectedLoadingAndErrors)
      expect(existsSync(path)).toBe(true);
    expect(read("src/components/feedback/route-error.tsx")).not.toMatch(
      /stack|sql|supabase|internal id/i,
    );
    expect(read("src/components/feedback/route-error.tsx")).toContain(
      "Try again",
    );
  });

  it("uses accessible mobile and motion-safe shared styling", () => {
    expect(shell).toContain("Skip to content");
    expect(shell).toContain("safe-area-inset-bottom");
    expect(navigation).toContain('aria-current={active ? "page"');
    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).toContain("--color-primary-700: #4f7cff");
    expect(css).toContain("--color-gold-400: #c9a54d");
  });

  it("removes external font build dependencies", () => {
    expect(layout).not.toContain("next/font/google");
    expect(css).toContain("system-ui");
  });

  it("enforces durable private authentication rate limiting", () => {
    expect(migration).toContain("auth_rate_limit_buckets");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain(
      "revoke all on public.auth_rate_limit_buckets from public, anon, authenticated",
    );
    expect(rateLimitRepair).toContain(
      "get diagnostics inserted_count = row_count",
    );
    expect(rateLimitRepair).toContain("now_value timestamptz");
    expect(rateLimitRepair).toContain("for update");
    expect(migration).toContain("key_hash_input !~ '^[a-f0-9]{64}$'");
    expect(migration).toContain("to anon, authenticated");
    expect(authActions).toContain("allowAuthAttempt");
  });

  it("ships browser security headers without blocking OAuth popups", () => {
    expect(config).toContain("Content-Security-Policy");
    expect(config).toContain("frame-ancestors 'none'");
    expect(config).toContain("same-origin-allow-popups");
    expect(config).toContain("Strict-Transport-Security");
    expect(config).toContain("camera=(self)");
  });

  it("documents every route, OAuth setup and exact release recovery", () => {
    expect(routeMap).toContain("/auth/callback");
    expect(routeMap).toContain("/proof/[slug]");
    expect(oauthRunbook).toContain("approved staging Google account");
    expect(oauthRunbook).toContain("Supabase Auth URL Configuration");
    expect(releaseChecklist).toContain(
      "Live Supabase → Google handoff uses the exact environment callback",
    );
    expect(releaseChecklist).toContain(
      "Approved user completes Google account selection and callback session",
    );
    expect(rollback).toContain("9d0071273654a89d14fe6f60b03a13dc65532ba1");
    expect(debt).toContain("Fixed before launch");
    expect(debt).toContain("Blocks broad public launch");
  });

  it("finishes the MVP without adding prohibited expansion features", () => {
    expect(adr).toContain("Stage 10 ends the MVP");
    expect(adr).toContain("does not add Builder discovery");
    expect(adr).toContain("messaging");
    expect(adr).toContain("opportunities");
    expect(adr).toContain("payments");
    expect(adr).toContain("marketplaces");
  });
});
