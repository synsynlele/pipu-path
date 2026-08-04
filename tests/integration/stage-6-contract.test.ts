import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608030014_stage_6_practical_builder_journey.sql",
  "utf8",
);
const indexes = readFileSync(
  "supabase/migrations/202608030015_index_stage_6_journey_foreign_keys.sql",
  "utf8",
);
const generation = readFileSync(
  "src/modules/journey/application/journey-generation.ts",
  "utf8",
);
const provider = readFileSync(
  "src/modules/journey/infrastructure/gemini-journey-provider.ts",
  "utf8",
);
const boundary = readFileSync("src/app/journey/complete/page.tsx", "utf8");

describe("Stage 6 structural contract", () => {
  it.each([
    "journey_generation_requests",
    "user_journeys",
    "journey_milestones",
  ])("enables RLS for %s", (table) =>
    expect(migration).toContain(
      `alter table public.${table} enable row level security`,
    ),
  );
  it("allows only owned reads and no direct browser writes", () => {
    expect(migration).toContain("journeys_own_select");
    expect(migration).toContain("journey_milestones_own_select");
    expect(migration).not.toMatch(
      /grant (insert|update|delete)[\s\S]{0,140}(user_journeys|journey_milestones)/i,
    );
  });
  it("keeps AI persistence service-role-only", () => {
    expect(migration).toContain(
      "grant execute on function public.persist_stage6_journey(uuid,jsonb) to service_role",
    );
    expect(migration).toContain("from public,anon,authenticated");
    expect(generation).toContain('import "server-only"');
  });
  it("enforces consent, three attempts, active mission and one active Journey", () => {
    expect(migration).toContain("consent_type='ai_processing'");
    expect(migration).toContain("attempt_count >= 3");
    expect(migration).toContain("user_journeys_one_active_mission_idx");
    expect(migration).toContain("status='active'");
  });
  it("uses server-only Gemini configuration", () => {
    expect(provider).toContain("requireGeminiEnvironment");
    expect(provider).toContain('"x-goog-api-key"');
    expect(provider).not.toContain("NEXT_PUBLIC_GEMINI");
  });
  it("activates only the first milestone and stops before Quests", () => {
    expect(migration).toMatch(/sequence_order\s*=\s*1[\s\S]{0,120}'available'/);
    expect(boundary).toMatch(/Stage[\s\S]{0,20}7 Quests[\s\S]{0,100}built yet/);
    expect(boundary).not.toMatch(/awardXp|completeQuest|submitEvidence/);
  });
  it("covers Stage 6 ownership and replacement foreign keys", () => {
    expect(indexes).toContain("journey_requests_mission_idx");
    expect(indexes).toContain("journey_requests_source_idx");
    expect(indexes).toContain("user_journeys_user_status_idx");
    expect(indexes).toContain("user_journeys_replaces_idx");
  });
});
