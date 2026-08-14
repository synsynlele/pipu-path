import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260814211700_stage_13_khpos_school_cohort_bridge.sql"),
  "utf8",
);

describe("Stage 13 Institutional Cohort Bridge structure", () => {
  it("keeps cohort and membership tables server-owned", () => {
    expect(migration).toContain("alter table public.khpos_school_cohorts enable row level security");
    expect(migration).toContain("revoke all on public.khpos_school_cohorts, public.khpos_school_cohort_memberships from public, anon, authenticated");
    expect(migration).toContain("to service_role");
  });

  it("requires explicit learner consent and supports withdrawal", () => {
    expect(migration).toContain("join_stage13_khpos_school_cohort");
    expect(migration).toContain("withdraw_stage13_khpos_school_cohort");
    expect(migration).toContain("khpos-cohort-aggregate-v1");
    expect(migration).toContain("khpos_school_cohort_one_active_user_idx");
  });

  it("enforces privacy before aggregate data leaves PipuPath", () => {
    expect(migration).toContain("get_stage13_khpos_cohort_aggregate_server");
    expect(migration).toContain("if member_count < minimum_count then");
    expect(migration).toContain("return query select false,0,0,0,0,0,0,0,0,0");
    expect(migration).toContain("revoke all on function public.get_stage13_khpos_cohort_aggregate_server(uuid,timestamptz,timestamptz) from public,anon,authenticated");
  });

  it("counts participation without selecting private content columns", () => {
    for (const forbidden of [
      "possible_paths",
      "earn_from_strengths",
      "evidence_text",
      "what_i_learned",
      "problem_statement",
      "progress_note",
    ]) {
      const functionBody = migration.split("create or replace function public.get_stage13_khpos_cohort_aggregate_server")[1] ?? "";
      expect(functionBody).not.toContain(forbidden);
    }
  });
});
