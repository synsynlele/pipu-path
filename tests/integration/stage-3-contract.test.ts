import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202607240004_stage_3_discovery.sql",
  "utf8",
);
const hardening = readFileSync(
  "supabase/migrations/202607240005_harden_stage_3_discovery.sql",
  "utf8",
);
const actions = readFileSync(
  "src/modules/discovery/application/discovery-actions.ts",
  "utf8",
);
const dal = readFileSync(
  "src/modules/discovery/infrastructure/discovery-dal.ts",
  "utf8",
);

describe("Stage 3 structural contract", () => {
  it.each([
    "discovery_question_sets",
    "discovery_questions",
    "discovery_sessions",
    "discovery_responses",
    "discovery_audit_events",
  ])("enables RLS for %s", (table) => {
    expect(migration).toContain(
      `alter table public.${table} enable row level security`,
    );
  });

  it("does not grant direct Discovery mutation", () => {
    expect(migration).not.toMatch(
      /grant (insert|update|delete)[\s\S]{0,120}discovery_/i,
    );
    expect(migration).toContain(
      "grant execute on function public.save_discovery_response",
    );
  });

  it("derives identity inside controlled functions", () => {
    expect(migration).toContain("actor uuid := auth.uid()");
    expect(actions).not.toMatch(/user_id_input|name="user_id"/);
  });

  it("enforces age eligibility and optimistic versions server-side", () => {
    expect(migration).toContain("actor_age = any(eligible_age_bands)");
    expect(migration).toContain(
      "session_record.version <> expected_version_input",
    );
    expect(hardening).toContain("adult_resources");
    expect(hardening).toContain("learning_support");
  });

  it("keeps data access server-only and returns a typed Stage 4 projection", () => {
    expect(dal).toContain('import "server-only"');
    expect(dal).toContain("Stage4DiscoveryHandoff");
    expect(dal).not.toContain("service-role");
  });

  it("uses the committed save result for deterministic redirects", () => {
    expect(actions).toContain("data: savedVersion");
    expect(actions).toContain("expected_version_input: savedVersion");
    expect(actions).toContain("const nextQuestion = state.questions.find");
    expect(actions).not.toContain("const refreshed = await getDiscoveryState()");
  });

  it("contains no AI, profile claim, Journey or mission generation", () => {
    expect(`${migration}\n${actions}`).not.toMatch(
      /openai|anthropic|generateStrength|generatePurpose|generateMission/i,
    );
  });
});
