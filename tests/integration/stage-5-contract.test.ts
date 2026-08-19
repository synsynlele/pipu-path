import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608020013_stage_5_practical_mission.sql",
  "utf8",
);
const generation = readFileSync(
  "src/modules/mission/application/mission-generation.ts",
  "utf8",
);
const provider = readFileSync(
  "src/modules/mission/infrastructure/gemini-mission-provider.ts",
  "utf8",
);
const boundary = readFileSync("src/app/mission/complete/page.tsx", "utf8");
const missionDal = readFileSync(
  "src/modules/mission/infrastructure/mission-dal.ts",
  "utf8",
);

describe("Stage 5 structural contract", () => {
  it.each(["mission_generation_requests", "user_missions"])(
    "enables RLS for %s",
    (table) => {
      expect(migration).toContain(
        `alter table public.${table} enable row level security`,
      );
    },
  );

  it("allows only own reads and no direct browser writes", () => {
    expect(migration).toContain("missions_own_select");
    expect(migration).toContain("(select auth.uid()) = user_id");
    expect(migration).not.toMatch(
      /grant (insert|update|delete)[\s\S]{0,120}(user_missions|mission_generation_requests)/i,
    );
  });

  it("keeps generated writes service-role-only", () => {
    expect(migration).toContain(
      "grant execute on function public.persist_stage5_mission(uuid, jsonb) to service_role",
    );
    expect(migration).toContain("from public, anon, authenticated");
    expect(generation).toContain('import "server-only"');
  });

  it("enforces consent, three attempts and one active mission in the database", () => {
    expect(migration).toContain("consent_type = 'ai_processing'");
    expect(migration).toContain("attempt_count >= 3");
    expect(migration).toContain("user_missions_one_active_idx");
  });

  it("allows a newer profile to replace an older active mission safely", () => {
    expect(migration).toMatch(
      /human_potential_profile_id = profile_id_input[\s\S]{0,80}status = 'active'/,
    );
    expect(missionDal).toContain(
      'activeQuery.eq("human_potential_profile_id", profileId)',
    );
    expect(migration).toContain(
      "where user_id = actor and status = 'active' and id <> target.id",
    );
  });

  it("uses the existing Gemini environment only on the server", () => {
    expect(provider).toContain("requireGeminiEnvironment");
    expect(provider).toContain('"x-goog-api-key"');
    expect(provider).not.toContain("NEXT_PUBLIC_GEMINI");
  });

  it("hands the completed mission into the authorized Stage 6 Journey", () => {
    expect(boundary).toContain('href="/journey"');
    expect(boundary).toContain("Campaign activated");
    expect(boundary).toContain("Open Journey Map");
    expect(boundary).toContain("practical chapters");
    expect(boundary).not.toMatch(/generateQuest|awardXp/);
  });
});
