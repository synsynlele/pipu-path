import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608040016_stage_7_hqls_quest_execution.sql",
  "utf8",
);
const indexes = readFileSync(
  "supabase/migrations/202608040017_index_stage_7_quest_foreign_keys.sql",
  "utf8",
);
const generation = readFileSync(
  "src/modules/quest/application/quest-generation.ts",
  "utf8",
);
const provider = readFileSync(
  "src/modules/quest/infrastructure/gemini-quest-provider.ts",
  "utf8",
);
const actions = readFileSync(
  "src/modules/quest/application/quest-actions.ts",
  "utf8",
);
const evidenceForm = readFileSync(
  "src/modules/quest/ui/quest-evidence-form.tsx",
  "utf8",
);
const reflectionForm = readFileSync(
  "src/modules/quest/ui/quest-reflection-form.tsx",
  "utf8",
);
const completionPage = readFileSync(
  "src/app/quests/[questId]/complete/page.tsx",
  "utf8",
);
const adr = readFileSync(
  "docs/architecture/adr-stage-7-hqls-quest-execution.md",
  "utf8",
);

describe("Stage 7 HQLS Quest structural contract", () => {
  it.each([
    "quest_generation_requests",
    "user_quests",
    "quest_evidence",
    "quest_reflections",
    "builder_xp_transactions",
  ])("enables RLS for %s", (table) => {
    expect(migration).toContain(
      `alter table public.${table} enable row level security`,
    );
  });

  it("allows only owned reads and controlled mutations", () => {
    expect(migration).toContain("user_quests_own_select");
    expect(migration).toContain("quest_evidence_own_select");
    expect(migration).toContain("quest_reflections_own_select");
    expect(migration).toContain("builder_xp_own_select");
    expect(migration).not.toMatch(
      /grant (insert|update|delete)[\s\S]{0,180}(user_quests|quest_evidence|quest_reflections|builder_xp_transactions)/i,
    );
  });

  it("keeps Gemini and generated persistence server-side", () => {
    expect(generation).toContain('import "server-only"');
    expect(provider).toContain("requireGeminiEnvironment");
    expect(provider).toContain('"x-goog-api-key"');
    expect(provider).not.toContain("NEXT_PUBLIC_GEMINI");
    expect(migration).toContain(
      "grant execute on function public.persist_stage7_quest_pack(uuid, jsonb) to service_role",
    );
    expect(migration).toContain("from public, anon, authenticated");
  });

  it("creates a private image-only evidence bucket with ownership RLS", () => {
    expect(migration).toContain("'quest-evidence'");
    expect(migration).toMatch(/'quest-evidence'[\s\S]{0,100}false/);
    expect(migration).toContain("5242880");
    expect(migration).toContain("'image/jpeg'");
    expect(migration).toContain("quest_evidence_images_insert");
    expect(migration).toContain(
      "(storage.foldername(name))[1] = (select auth.uid())::text",
    );
    expect(actions).toContain("maximumImageBytes = 5 * 1024 * 1024");
  });

  it("checks ownership before locking a milestone row", () => {
    expect(migration).toMatch(
      /join public\.user_journeys journey[\s\S]{0,260}journey\.user_id = actor[\s\S]{0,140}for update of milestone/,
    );
  });

  it("enforces exactly one active Quest and three ordered Quests", () => {
    expect(migration).toContain("user_quests_one_active_idx");
    expect(migration).toContain("status in ('active', 'evidence_submitted')");
    expect(migration).toContain(
      "jsonb_array_length(quest_pack_input -> 'quests') <> 3",
    );
    expect(migration).toContain("sequence_order between 1 and 3");
  });

  it("requires evidence and reflection before completion", () => {
    expect(migration).toContain("QUEST_EVIDENCE_REQUIRED");
    expect(migration).toContain("quest_reflections");
    expect(evidenceForm).toContain("Submit Evidence");
    expect(reflectionForm).toContain("Nortnspoil reflection");
  });

  it("awards exactly-once XP through an append-only transaction", () => {
    expect(migration).toContain("quest_id uuid not null unique");
    expect(migration).toContain("amount smallint not null check (amount = 50)");
    expect(migration).toContain("on conflict (quest_id) do nothing");
    expect(completionPage).toContain("Proof created. Progress earned.");
  });

  it("indexes the Stage 7 foreign keys", () => {
    expect(indexes).toContain("quest_generation_requests(journey_id)");
    expect(indexes).toContain("user_quests(generation_request_id)");
  });

  it("preserves the Stage 8 boundary", () => {
    expect(adr).toContain("Stage 8");
    expect(adr).toMatch(/does not create public[\s\S]{0,220}projects/i);
  });
});
