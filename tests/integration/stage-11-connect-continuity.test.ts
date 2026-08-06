import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const schema = read(
  "supabase/migrations/20260806084612_stage_11_builder_connect_schema.sql",
);
const mutations = read(
  "supabase/migrations/20260806084702_stage_11_builder_connect_mutations.sql",
);
const queries = read(
  "supabase/migrations/20260806084744_stage_11_builder_connect_queries.sql",
);
const continuityMigration = read(
  "supabase/migrations/20260806084833_stage_11_journey_continuity.sql",
);
const grants = read(
  "supabase/migrations/20260806084852_stage_11_function_grants.sql",
);
const hardenedQueries = read(
  "supabase/migrations/20260806085148_harden_stage_11_connect_state.sql",
);
const navigation = read("src/components/navigation/app-navigation.tsx");
const proxy = read("src/proxy.ts");
const connectPage = read("src/app/connect/page.tsx");
const connectActions = read(
  "src/modules/connect/application/connect-actions.ts",
);
const journeyPage = read("src/app/journey/page.tsx");
const continuation = read(
  "src/modules/journey/application/journey-continuation.ts",
);

describe("Stage 11 Builder Connect and Journey continuity", () => {
  it("creates owner-protected network tables without browser writes", () => {
    for (const table of [
      "builder_connect_profiles",
      "builder_connections",
      "builder_blocks",
      "builder_reports",
      "builder_contact_shares",
    ]) {
      expect(schema).toContain(`create table public.${table}`);
      expect(schema).toContain(
        `alter table public.${table} enable row level security`,
      );
    }
    expect(schema).toMatch(
      /revoke all on public\.builder_connect_profiles,[\s\S]*from public, anon, authenticated;/,
    );
    expect(schema).not.toContain("for insert to authenticated");
    expect(schema).not.toContain("for update to authenticated");
    expect(schema).not.toContain("for delete to authenticated");
  });

  it("limits discovery to consenting adults and excludes blocked pairs", () => {
    expect(schema).toContain("profile.age_band in ('18_24', '25_plus')");
    expect(schema).toContain("profile.safeguarding_review_required");
    expect(schema).toContain("checkpoint.status = 'completed'");
    expect(queries).toContain("connect.visibility='discoverable'");
    expect(hardenedQueries).toContain("stage11_builder_pair_blocked");
    expect(connectPage).toContain("Adult-only launch boundary");
  });

  it("supports the complete connection lifecycle and safety controls", () => {
    for (const name of [
      "send_stage11_connection_request",
      "respond_stage11_connection_request",
      "close_stage11_connection",
      "block_stage11_builder",
      "unblock_stage11_builder",
      "report_stage11_builder",
    ]) {
      expect(mutations).toContain(name);
      expect(grants).toContain(name);
    }
    expect(connectActions).toContain("request-sent");
    expect(connectPage).toContain("Incoming requests");
    expect(connectPage).toContain("My Network");
  });

  it("keeps contact details private until accepted and explicitly shared", () => {
    expect(schema).toContain("builder_contact_shares");
    expect(mutations).toContain("share_stage11_contact");
    expect(hardenedQueries).toContain(
      "case when other_share.share_email then other_connect.contact_email else null end",
    );
    expect(connectPage).toContain(
      "contact details appear only after an accepted connection and an explicit sharing choice",
    );
    expect(schema).not.toMatch(
      /create table public\.(messages|conversations)/i,
    );
  });

  it("adds and protects Connect on desktop and mobile", () => {
    expect(navigation).toContain(
      '{ label: "Connect", href: "/connect", icon: "connect" }',
    );
    expect(navigation).toContain("grid-cols-6");
    expect(proxy).toContain('"/connect"');
  });

  it("preserves completed Journeys and creates Project-gated cycles", () => {
    expect(schema).toContain("cycle_number integer not null default 1");
    expect(schema).toContain("continues_journey_id");
    expect(continuityMigration).toContain("generation_kind_input='continue'");
    expect(continuityMigration).toContain(
      "builder_projects where user_id=actor and journey_id=source_row.id and status='completed'",
    );
    expect(continuityMigration).toContain(
      "target_cycle := source_row.cycle_number + 1",
    );
    expect(continuityMigration).toContain("persist_stage6_journey");
    expect(journeyPage).toContain("Continue moving");
    expect(journeyPage).toContain("continuationEligible");
    expect(continuation).toContain('generation_kind_input: "continue"');
    expect(continuation).toContain("buildContinuingEvidenceJourney");
  });
});
