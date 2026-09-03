import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202607240001_stage_2_identity.sql",
  "utf8",
);
const hardeningMigration = readFileSync(
  "supabase/migrations/202607240002_harden_identity_grants.sql",
  "utf8",
);
const functionHardeningMigration = readFileSync(
  "supabase/migrations/202607240003_harden_identity_functions.sql",
  "utf8",
);
const serviceRole = readFileSync("src/lib/supabase/service-role.ts", "utf8");
const googleAuthForm = readFileSync(
  "src/modules/identity/ui/google-auth-form.tsx",
  "utf8",
);
const googleAuthRoute = readFileSync("src/app/auth/google/route.ts", "utf8");

describe("Stage 2 structural security contract", () => {
  it.each([
    "profiles",
    "user_preferences",
    "user_consents",
    "onboarding_checkpoints",
    "identity_audit_events",
  ])("enables RLS for %s", (table) => {
    expect(migration).toContain(
      `alter table public.${table} enable row level security`,
    );
  });

  it("contains no anonymous profile selection policy", () => {
    expect(migration).toContain("revoke all on public.profiles");
    expect(migration).not.toMatch(
      /create policy[\s\S]{0,100}on public\.profiles[\s\S]{0,100}to anon/i,
    );
  });

  it("removes inherited authenticated privileges before minimum grants", () => {
    expect(hardeningMigration).toContain("from public, anon, authenticated");
    expect(hardeningMigration).not.toContain(
      "account_status, onboarding_status",
    );
  });

  it("keeps consent and checkpoint mutation behind controlled functions", () => {
    expect(migration).toContain("complete_identity_checkpoint");
    expect(migration).toContain("withdraw_consent");
    expect(migration).not.toContain("grant insert on public.user_consents");
    expect(migration).not.toContain(
      "grant update on public.onboarding_checkpoints",
    );
  });

  it("removes inherited security-definer execution grants", () => {
    expect(functionHardeningMigration).toContain(
      "from public, anon, authenticated, service_role",
    );
    expect(functionHardeningMigration).not.toMatch(
      /grant execute[\s\S]{0,160}to anon/i,
    );
  });

  it("structurally isolates service-role access from browser modules", () => {
    expect(serviceRole).toContain('import "server-only"');
    expect(serviceRole).not.toContain('"use client"');
  });

  it("initiates Google OAuth through the server boundary", () => {
    expect(googleAuthForm).toContain("/auth/google?next=");
    expect(googleAuthForm).toContain("href={googleAuthHref}");
    expect(googleAuthForm).not.toContain('"use client"');
    expect(googleAuthForm).not.toContain("createBrowserSupabaseClient");
    expect(googleAuthRoute).toContain("createServerSupabaseClient");
    expect(googleAuthRoute).toContain("client.auth.signInWithOAuth");
    expect(googleAuthRoute).toContain('provider: "google"');
  });
});
