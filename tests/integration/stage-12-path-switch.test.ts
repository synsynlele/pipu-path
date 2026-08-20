import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260820004500_safe_economic_path_switch.sql",
  "utf8",
);
const hardenedMigration = readFileSync(
  "supabase/migrations/20260820012000_safe_economic_path_switch_project_scope.sql",
  "utf8",
);
const action = readFileSync(
  "src/modules/economic-pathways/application/economic-pathway-actions.ts",
  "utf8",
);
const form = readFileSync(
  "src/modules/economic-pathways/ui/path-selection-form.tsx",
  "utf8",
);
const missionPage = readFileSync("src/app/mission/page.tsx", "utf8");
const projectsPage = readFileSync("src/app/projects/page.tsx", "utf8");
const projectDetailPage = readFileSync(
  "src/app/projects/[projectId]/page.tsx",
  "utf8",
);

describe("safe Economic Path switching", () => {
  it("uses one authenticated atomic RPC and validates ownership and the requested path", () => {
    expect(hardenedMigration).toContain(
      "create or replace function public.switch_economic_path",
    );
    expect(hardenedMigration).toContain("security definer");
    expect(hardenedMigration).toContain("actor uuid := auth.uid()");
    expect(hardenedMigration).toContain("and user_id = actor");
    expect(hardenedMigration).toContain("for update");
    expect(hardenedMigration).toContain(
      "jsonb_array_elements(recommendation.possible_paths)",
    );
    expect(hardenedMigration).toContain(
      "possible_path ->> 'key' = path_key_input",
    );
  });

  it("retires only unfinished current work and preserves completed developmental history", () => {
    expect(hardenedMigration).toContain("quest.status <> 'completed'");
    expect(hardenedMigration).toContain("project.status = 'active'");
    expect(hardenedMigration).toContain("set status = 'locked'");
    expect(hardenedMigration).toContain("set status = 'archived'");
    expect(hardenedMigration).toContain("set status = 'replaced'");
    expect(hardenedMigration).toContain(
      "replaced_at = coalesce(journey.replaced_at, now())",
    );
    expect(hardenedMigration).toContain("mission.id = project.mission_id");
    expect(hardenedMigration).not.toMatch(
      /delete\s+from\s+public\.(user_quests|user_journeys|user_missions|builder_projects|quest_evidence|quest_reflections|builder_xp_transactions)/i,
    );
    expect(hardenedMigration).not.toMatch(
      /update\s+public\.(quest_evidence|quest_reflections|builder_xp_transactions)/i,
    );
  });

  it("does not retire prior work on an initial Path selection", () => {
    expect(migration).toContain(
      "if recommendation.selected_path_key is not null then",
    );
    expect(hardenedMigration).toContain(
      "if recommendation.selected_path_key = path_key_input then",
    );
  });

  it("keeps the RPC unavailable to public and anonymous callers", () => {
    expect(hardenedMigration).toContain(
      "revoke all on function public.switch_economic_path(uuid, text) from public",
    );
    expect(hardenedMigration).toContain(
      "revoke all on function public.switch_economic_path(uuid, text) from anon",
    );
    expect(hardenedMigration).toContain(
      "grant execute on function public.switch_economic_path(uuid, text) to authenticated",
    );
  });

  it("routes Path changes through the RPC rather than the previous Mission blocker", () => {
    expect(action).toContain('"switch_economic_path"');
    expect(action).toContain('revalidatePath("/mission")');
    expect(action).toContain('revalidatePath("/journey")');
    expect(action).toContain('revalidatePath("/proof")');
    expect(action).not.toContain(
      "Finish or replace your current mission before changing the path it is built from.",
    );
  });

  it("requires explicit confirmation and tells the Builder what is preserved", () => {
    expect(form).toContain("Change your Path?");
    expect(form).toContain("Yes, Change Path");
    expect(form).toContain("Keep Current Path");
    expect(form).toContain("archived,");
    expect(form).toContain("not deleted");
    expect(form).toMatch(
      /Completed work, proof, reflections and XP\s+stay saved\./,
    );
  });

  it("makes Path review discoverable from the Mission experience", () => {
    expect(missionPage).toContain("Review / Change Path →");
    expect(missionPage).toContain('href="/onboarding/discovery/profile"');
  });

  it("keeps archived Projects visibly separate from completed Builds", () => {
    expect(projectsPage).toContain("Build history");
    expect(projectsPage).toContain("Past Major Builds");
    expect(projectsPage).toContain('project.status === "completed"');
    expect(projectDetailPage).toContain('project.status === "completed" ? (');
    expect(projectDetailPage).toContain("Archived Build");
    expect(projectDetailPage).toContain(
      "This Build closed without being marked complete.",
    );
    expect(projectDetailPage).toContain(
      "cannot be prepared as Builder Vault proof",
    );
  });
});
