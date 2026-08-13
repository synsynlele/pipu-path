import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260813084234_stage_12_economic_pathways_mvp.sql",
  "utf8",
);
const profilePage = readFileSync(
  "src/app/onboarding/discovery/profile/page.tsx",
  "utf8",
);
const pathwayContract = readFileSync(
  "src/modules/economic-pathways/domain/economic-pathway-contract.ts",
  "utf8",
);
const pathwayProvider = readFileSync(
  "src/modules/economic-pathways/infrastructure/openai-economic-pathway-provider.ts",
  "utf8",
);
const missionProvider = readFileSync(
  "src/modules/mission/infrastructure/openai-mission-provider.ts",
  "utf8",
);
const journeyContract = readFileSync(
  "src/modules/journey/domain/journey-contract.ts",
  "utf8",
);
const journeyProvider = readFileSync(
  "src/modules/journey/infrastructure/openai-journey-provider.ts",
  "utf8",
);
const projectPage = readFileSync("src/app/projects/new/page.tsx", "utf8");
const projectActions = readFileSync(
  "src/modules/project/application/project-actions.ts",
  "utf8",
);

describe("Stage 12 Economic Pathways structural contract", () => {
  it("adds one private profile-linked recommendation table without duplicating Journey or Project", () => {
    expect(migration).toContain(
      "create table public.economic_pathway_recommendations",
    );
    expect(migration).toContain(
      "human_potential_profile_id uuid not null references public.human_potential_profile_versions",
    );
    expect(migration).not.toContain("create table public.pathway_plans");
    expect(migration).not.toContain("create table public.value_experiments");
    expect(migration).not.toContain("create table public.capability_evidence");
  });

  it("keeps recommendations private and browser writes disabled", () => {
    expect(migration).toContain(
      "alter table public.economic_pathway_recommendations enable row level security",
    );
    expect(migration).toContain(
      "create policy economic_pathway_recommendations_own_select",
    );
    expect(migration).toContain(
      "revoke all on public.economic_pathway_recommendations from public, anon, authenticated",
    );
    expect(migration).not.toMatch(
      /grant (insert|update|delete)[\s\S]{0,100}economic_pathway_recommendations to authenticated/i,
    );
  });

  it("keeps product analytics private and records the MVP funnel", () => {
    expect(migration).toContain("create table public.product_events");
    for (const event of [
      "possible_paths_generated",
      "possible_paths_viewed",
      "path_selected",
      "path_changed",
      "pathway_started",
      "first_value_challenge_started",
      "first_value_challenge_completed",
    ]) {
      expect(migration).toContain(`'${event}'`);
    }
    expect(migration).toContain(
      "revoke all on public.product_events from public, anon, authenticated",
    );
  });

  it("surfaces Possible Paths and Earn From Your Strengths inside the existing profile", () => {
    expect(profilePage).toContain("Possible Paths");
    expect(profilePage).toContain("Earn From Your Strengths");
    expect(profilePage).toContain("Observed Pattern");
    expect(profilePage).toContain("Possible Interpretation");
    expect(profilePage).toContain("Evidence Needed");
    expect(profilePage).toContain("Choose This Path");
  });

  it("blocks quick-money, risky finance and unsafe minor recommendations in code and prompt", () => {
    expect(pathwayContract).toMatch(/get rich|guaranteed income|quick money/i);
    expect(pathwayContract).toMatch(/gambling|betting|speculative trading/i);
    expect(pathwayContract).toMatch(/contact strangers|unknown adults/i);
    expect(pathwayProvider).toContain("never promise income");
    expect(pathwayProvider).toContain("trusted people");
  });

  it("makes the existing Mission explicitly test the selected Possible Path", () => {
    expect(missionProvider).toContain("selected Possible Path");
    expect(missionProvider).toContain("Create value first");
    expect(missionProvider).toContain("never promise money");
  });

  it("turns the existing Journey into a strict four-week Learn Practice Build Test pathway", () => {
    expect(journeyContract).toContain('"four_weeks"');
    expect(journeyContract).toContain("milestones.length !== 4");
    expect(journeyContract).toContain(
      'const economicPhases = ["learn", "practice", "build", "test"]',
    );
    expect(journeyProvider).toContain("Week 1");
    expect(journeyProvider).toContain("Week 2");
    expect(journeyProvider).toContain("Week 3");
    expect(journeyProvider).toContain("Week 4");
  });

  it("reuses Builder Project as the First Value Challenge", () => {
    expect(projectPage).toContain("First Value Challenge");
    expect(projectPage).toContain("Create value first");
    expect(projectActions).toContain("create_stage8_builder_project");
    expect(projectActions).toContain("first_value_challenge_started");
    expect(projectActions).toContain("first_value_challenge_completed");
  });
});
