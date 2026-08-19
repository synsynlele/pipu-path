import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const migration = read(
  "supabase/migrations/20260817191000_stage_16_living_builder_profile.sql",
);

describe("Stage 16 Living Builder Profile structure", () => {
  it("stores versioned private profile claims, evidence and Builder feedback", () => {
    expect(migration).toContain("create table public.builder_profile_versions");
    expect(migration).toContain(
      "create table public.builder_capability_claims",
    );
    expect(migration).toContain(
      "create table public.builder_capability_evidence",
    );
    expect(migration).toContain(
      "create table public.builder_capability_feedback",
    );
    expect(migration).toContain("enable row level security");
    expect(migration).toContain(
      "revoke all on public.builder_profile_versions",
    );
    expect(migration).not.toMatch(/grant select[^;]+to authenticated/i);
  });

  it("derives capability evidence only from completed proof-bearing action", () => {
    expect(migration).toContain("quest.status = 'completed'");
    expect(migration).toContain("public.quest_evidence");
    expect(migration).toContain("public.quest_reflections");
    expect(migration).toContain("project.status = 'completed'");
    expect(migration).toContain("collaboration.status = 'completed'");
    expect(migration).toContain(
      "contribution.contributor_id = collaboration.owner_id",
    );
    expect(migration).toContain(
      "contribution.contributor_id = collaboration.collaborator_id",
    );
  });

  it("uses explainable conservative progression rules and exact evidence links", () => {
    expect(migration).toContain(
      "sum(evidence.strength) >= 4 and count(*) >= 2",
    );
    expect(migration).toContain("then 'repeatedly_demonstrated'");
    expect(migration).toContain("'/quests/' || quest.id::text");
    expect(migration).toContain("'/projects/' || project.id::text");
    expect(migration).toContain(
      "'/connect/collaborations/' || collaboration.id::text",
    );
  });

  it("preserves the Discovery baseline and introduces no public publication path", () => {
    expect(migration).toContain("source_human_potential_profile_id");
    expect(migration).toContain("BUILDER_PROFILE_DISCOVERY_BASELINE_REQUIRED");
    expect(migration).not.toContain("public_visibility");
    expect(migration).not.toContain("published_at");
  });

  it("ships a private profile route and keeps Discovery accessible as baseline", () => {
    const page = read("src/app/profile/page.tsx");
    const nav = read("src/components/navigation/app-navigation.tsx");
    expect(page).toContain("Living Builder Profile");
    expect(page).toContain("/onboarding/discovery/profile");
    expect(page).toContain("Private development space");
    expect(page).toContain("Nothing here becomes");
    expect(nav).toContain('{ label: "Me", href: "/profile"');
  });
});
