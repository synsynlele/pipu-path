import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608040018_stage_8_builder_project_mvp.sql",
  "utf8",
);
const actions = readFileSync(
  "src/modules/project/application/project-actions.ts",
  "utf8",
);
const projectPage = readFileSync("src/app/projects/page.tsx", "utf8");
const detailPage = readFileSync(
  "src/app/projects/[projectId]/page.tsx",
  "utf8",
);
const createForm = readFileSync(
  "src/modules/project/ui/project-create-form.tsx",
  "utf8",
);
const updateForm = readFileSync(
  "src/modules/project/ui/project-update-form.tsx",
  "utf8",
);
const navigation = readFileSync(
  "src/components/navigation/app-navigation.tsx",
  "utf8",
);
const adr = readFileSync(
  "docs/architecture/adr-stage-8-builder-project-mvp.md",
  "utf8",
);

describe("Stage 8 Builder Project structural contract", () => {
  it.each([
    "builder_projects",
    "builder_project_milestones",
    "builder_project_updates",
  ])("enables RLS for %s", (table) => {
    expect(migration).toContain(
      `alter table public.${table} enable row level security`,
    );
  });

  it("allows owner reads without direct browser table writes", () => {
    expect(migration).toContain("builder_projects_own_select");
    expect(migration).toContain("builder_project_milestones_own_select");
    expect(migration).toContain("builder_project_updates_own_select");
    expect(migration).not.toMatch(
      /grant (insert|update|delete)[\s\S]{0,180}builder_project/i,
    );
  });

  it("requires completed Quest evidence and reflection provenance", () => {
    expect(migration).toContain("quest.status = 'completed'");
    expect(migration).toContain("from public.quest_evidence");
    expect(migration).toContain("from public.quest_reflections");
    expect(migration).toContain("source_quest_id uuid not null unique");
  });

  it("enforces one active Project and exactly three ordered milestones", () => {
    expect(migration).toContain("builder_projects_one_active_user_idx");
    expect(migration).toContain("where status = 'active'");
    expect(migration).toContain("jsonb_array_length(milestones_input) <> 3");
    expect(migration).toContain("sequence_order between 1 and 3");
    expect(createForm).toContain("Three-step execution path");
  });

  it("keeps updates append-only and completion unique", () => {
    expect(migration).toContain("builder_project_updates_one_completion_idx");
    expect(migration).toContain("where marks_milestone_complete");
    expect(migration).not.toMatch(/update public\.builder_project_updates/i);
    expect(updateForm).toContain("This milestone is genuinely complete");
  });

  it("unlocks milestones only through ordered completion", () => {
    expect(migration).toContain(
      "sequence_order < milestone_row.sequence_order",
    );
    expect(migration).toContain("status <> 'completed'");
    expect(migration).toContain(
      "sequence_order = milestone_row.sequence_order + 1",
    );
    expect(migration).toContain("status = 'available'");
  });

  it("completes the Project only after the final milestone", () => {
    expect(migration).toMatch(
      /if next_milestone_id is not null[\s\S]{0,500}else[\s\S]{0,220}status = 'completed'/,
    );
    expect(detailPage).toContain("You built something with an evidence trail.");
  });

  it("uses controlled authenticated RPCs for all mutations", () => {
    expect(migration).toContain(
      "grant execute on function public.create_stage8_builder_project",
    );
    expect(migration).toContain(
      "grant execute on function public.add_stage8_builder_project_update",
    );
    expect(migration).toContain("to authenticated");
    expect(actions).toContain("requireAuthenticatedIdentity");
  });

  it("integrates Projects into the complete Builder shell", () => {
    expect(navigation).toContain('label: "Build"');
    expect(navigation).toContain('href: "/build"');
    expect(navigation).toContain('pathname.startsWith("/quests")');
    expect(navigation).toContain('pathname.startsWith("/projects")');
    expect(projectPage).toContain("Projects prove what you can build.");
    expect(detailPage).toContain("Major Build · Private");
  });

  it("preserves private Stage 8 proof while allowing the authorised Portfolio handoff", () => {
    expect(adr).toContain("Stage 9 remains locked");
    expect(adr).toContain("public Projects or evidence portfolios");
    expect(detailPage).toContain("The full Project remains private.");
    expect(detailPage).toContain("Prepare Builder Vault Proof");
  });
});
