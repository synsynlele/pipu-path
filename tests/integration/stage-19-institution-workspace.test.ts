import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const migration = read(
  "supabase/migrations/20260818112000_stage_19_institution_workspace.sql",
);
const adr = read("docs/architecture/adr-stage-19-institution-workspace.md");

describe("Stage 19 Institution Workspace structure", () => {
  it("stores workspace roles behind RLS with no direct browser grants", () => {
    expect(migration).toContain("create table public.institution_workspaces");
    expect(migration).toContain(
      "create table public.institution_workspace_members",
    );
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("from public, anon, authenticated");
    expect(migration).not.toMatch(
      /grant select[^;]+institution_workspace_members[^;]+authenticated/i,
    );
  });

  it("reuses the Stage 13 aggregate boundary instead of exposing learner rows", () => {
    expect(migration).toContain(
      "public.get_stage13_khpos_cohort_aggregate_server",
    );
    expect(adr).toContain(
      "Cohort membership alone does not permit learner-level browsing",
    );
    expect(adr).toContain("no user IDs, names or learner rows");
  });

  it("requires Builder-initiated exact claim and evidence sharing", () => {
    expect(migration).toContain(
      "request_stage19_institution_capability_verification",
    );
    expect(migration).toContain("version.status = 'active'");
    expect(migration).toContain("claim_id = claim_row.id");
    expect(migration).toContain("user_id = actor");
    expect(migration).toContain("institution-capability-share-v1");
  });

  it("limits decisions to active owner or verifier roles", () => {
    expect(migration).toContain(
      "private.stage19_institution_member_role(target.workspace_id, actor)",
    );
    expect(migration).toContain("actor_role not in ('owner','verifier')");
    expect(migration).toContain(
      "INSTITUTION_VERIFICATION_RELATIONSHIP_REQUIRED",
    );
  });

  it("closes pending individual shares when cohort consent is withdrawn", () => {
    expect(migration).toContain(
      "create or replace function public.withdraw_stage13_khpos_school_cohort()",
    );
    expect(migration).toContain("institution_pending_shares_closed");
    expect(migration).toContain("status = 'withdrawn', withdrawn_at = now()");
  });

  it("keeps institution verification private and out of ranking/public badge scope", () => {
    expect(adr).toContain("does not score, rank or label individual learners");
    expect(adr).toContain("does not create “PipuPath certified”");
    expect(adr).toContain("No new primary Builder navigation item is added");
  });
});
