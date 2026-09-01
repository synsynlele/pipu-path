import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const enumMigration = read(
  "supabase/migrations/202608060022_stage_11_journey_generation_kind.sql",
);
const migration = [
  "supabase/migrations/202608060023_stage_11_builder_connect_schema.sql",
  "supabase/migrations/202608060024_stage_11_builder_connect_mutations.sql",
  "supabase/migrations/202608060025_stage_11_builder_connect_queries.sql",
  "supabase/migrations/202608060026_stage_11_journey_continuity.sql",
  "supabase/migrations/202608060027_stage_11_function_grants.sql",
  "supabase/migrations/202608060028_index_stage_11_foreign_keys.sql",
  "supabase/migrations/202608060029_harden_stage_11_connect_state.sql",
  "supabase/migrations/202608060030_harden_stage_11_safeguarding_transitions.sql",
  "supabase/migrations/202608060031_fix_stage_11_connection_response_enum.sql",
]
  .map(read)
  .join("\n");
const navigation = read("src/components/navigation/app-navigation.tsx");
const proxy = read("src/proxy.ts");
const connectPage = read("src/app/connect/page.tsx");
const normalizedConnectPage = connectPage.replace(/\s+/g, " ");
const detailPage = read("src/app/connect/builders/[username]/page.tsx");
const journeyPage = read("src/app/journey/page.tsx");
const progress = read("src/modules/identity/domain/progress.ts");
const progressDal = read("src/modules/identity/infrastructure/progress-dal.ts");
const generation = read(
  "src/modules/journey/application/journey-generation.ts",
);

const connectTables = [
  "builder_connect_profiles",
  "builder_connections",
  "builder_blocks",
  "builder_reports",
  "builder_contact_shares",
];

describe("Stage 11 Builder Connect and Journey continuity contract", () => {
  it("protects the complete Connect route family", () => {
    expect(proxy).toContain('"/connect"');
    expect(navigation).toContain('label: "Connect"');
    for (const path of [
      "src/app/connect/page.tsx",
      "src/app/connect/layout.tsx",
      "src/app/connect/loading.tsx",
      "src/app/connect/error.tsx",
      "src/app/connect/builders/[username]/page.tsx",
    ]) {
      expect(existsSync(path)).toBe(true);
    }
  });

  it("keeps every Connect table RLS-protected and directly read-only", () => {
    for (const table of connectTables) {
      expect(migration).toContain(
        `alter table public.${table} enable row level security`,
      );
    }
    expect(migration).toContain(
      "revoke all on public.builder_connect_profiles",
    );
    expect(migration).toContain(
      "grant select on public.builder_connect_profiles",
    );
    expect(migration).not.toContain(
      "grant insert on public.builder_connections",
    );
    expect(migration).not.toContain(
      "grant update on public.builder_connections",
    );
  });

  it("enforces adult eligibility, blocking and allow-listed discovery", () => {
    expect(migration).toContain("profile.age_band in ('18_24', '25_plus')");
    expect(migration).toContain("safeguarding_review_required");
    expect(migration).toContain("stage11_builder_pair_blocked");
    expect(migration).toContain("connect.visibility='discoverable'");
    expect(connectPage).toContain("Builder World protected by safeguarding");
    expect(normalizedConnectPage).toContain(
      "Public discovery and direct contact sharing stay closed for younger Builders.",
    );
    expect(detailPage).toContain("Block Builder");
    expect(detailPage).toContain("Submit Report");
    expect(detailPage).toContain("Decline");
    expect(migration).toContain(
      "private.stage11_builder_connect_eligible(other_profile.id)",
    );
    expect(migration).toContain("CONNECT_ADULT_REQUIRED");
  });

  it("ships requests and consented contact sharing without messaging", () => {
    for (const functionName of [
      "send_stage11_connection_request",
      "respond_stage11_connection_request",
      "close_stage11_connection",
      "share_stage11_contact",
    ]) {
      expect(migration).toContain(functionName);
    }
    expect(normalizedConnectPage).toContain(
      "deliberate relationship and consent controls—not unrestricted private messaging.",
    );
    expect(connectPage).not.toContain("followerCount");
    expect(connectPage).not.toContain("popularityScore");
    expect(migration).not.toContain("message_body");
    expect(migration).not.toContain("chat_message");
    expect(migration).toContain("::public.builder_connection_status");
  });

  it("turns the completed Builder loop into renewable Journey cycles", () => {
    expect(enumMigration).toContain("add value if not exists 'continue'");
    expect(migration).toContain("cycle_number");
    expect(migration).toContain("JOURNEY_PROJECT_REQUIRED");
    expect(generation).toContain(
      'kind: "initial" | "regenerate" | "refine" | "continue"',
    );
    expect(journeyPage).toContain("Next route available");
    expect(journeyPage).toContain("Open growth cycle {state.nextCycleNumber}");
    expect(journeyPage).toContain('kind="continue"');
    expect(progress).toContain('label: "Build your next Journey"');
    expect(progressDal).toContain('.eq("journey_id", journey.id)');
  });
});
