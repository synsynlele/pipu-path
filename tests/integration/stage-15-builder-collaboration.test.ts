import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260817170000_stage_15_builder_collaboration_mvp.sql",
  ),
  "utf8",
);
const actions = readFileSync(
  join(
    process.cwd(),
    "src/modules/collaboration/application/collaboration-actions.ts",
  ),
  "utf8",
);
const listPage = readFileSync(
  join(process.cwd(), "src/app/connect/collaborations/page.tsx"),
  "utf8",
);
const detailPage = readFileSync(
  join(
    process.cwd(),
    "src/app/connect/collaborations/[collaborationId]/page.tsx",
  ),
  "utf8",
);

describe("Stage 15 Builder Collaboration MVP structure", () => {
  it("keeps collaboration persistence behind authenticated RPCs", () => {
    expect(migration).toContain(
      "alter table public.builder_collaborations enable row level security",
    );
    expect(migration).toContain(
      "alter table public.builder_collaboration_contributions enable row level security",
    );
    expect(migration).toContain(
      "revoke all on public.builder_collaborations, public.builder_collaboration_contributions",
    );
    expect(migration).not.toMatch(
      /grant\s+(select|insert|update|delete)[^;]*builder_collaborations[^;]*authenticated/i,
    );
    expect(migration).toContain(
      "grant execute on function public.get_stage15_collaboration_state() to authenticated",
    );
  });

  it("requires adult eligibility, accepted connection state and no block", () => {
    expect(migration).toContain("private.stage11_builder_connect_eligible(actor)");
    expect(migration).toContain("private.stage15_connection_for_pair");
    expect(migration).toContain("connection.status = 'accepted'");
    expect(migration).toContain("private.stage11_builder_pair_blocked");
    expect(migration).toContain("COLLABORATION_CONNECTION_REQUIRED");
  });

  it("does not grant collaborators access to raw Project or developmental narratives", () => {
    const projection =
      migration
        .split("create or replace function private.stage15_collaboration_item")[1]
        ?.split("create or replace function public.get_stage15_collaboration_state")[0] ??
      "";
    for (const forbidden of [
      "problem_statement",
      "people_served",
      "smallest_useful_version",
      "progress_note",
      "proof_text",
      "evidence_text",
      "what_i_learned",
      "nortnspoil_reflection",
      "possible_paths",
      "contact_email",
      "contact_whatsapp",
    ]) {
      expect(projection).not.toContain(forbidden);
    }
    expect(projection).toContain("project.title");
    expect(projection).toContain("collaboration.objective");
    expect(projection).toContain("collaboration.expected_contribution");
  });

  it("requires contribution evidence and mutual confirmation before completion", () => {
    expect(migration).toContain("COLLABORATION_CONTRIBUTION_REQUIRED");
    expect(migration).toContain("owner_confirmed_at is not null");
    expect(migration).toContain("collaborator_confirmed_at is not null");
    expect(migration).toContain("set status = 'completed'");
    expect(detailPage).toContain("Record at least one real contribution");
    expect(detailPage).toContain("Confirm My Contribution");
  });

  it("cancels unfinished collaboration when relationship safety changes", () => {
    expect(migration).toContain(
      "stage15_cancel_collaboration_on_connection_change",
    );
    expect(migration).toContain("stage15_cancel_collaboration_on_block");
    expect(migration).toContain("status in ('pending', 'accepted')");
  });

  it("uses structured evidence instead of a chat system", () => {
    expect(listPage).toContain("unrestricted chat");
    expect(detailPage).toContain("evidence record, not a message thread");
    expect(detailPage).toContain("contributionSummary");
    expect(detailPage).toContain("evidenceNote");
    expect(detailPage).not.toContain("messageText");
    expect(actions).not.toContain("sendMessage");
  });

  it("records collaboration lifecycle events in the shared product event system", () => {
    for (const event of [
      "collaboration_invited",
      "collaboration_accepted",
      "collaboration_contribution_added",
      "collaboration_completed",
    ]) {
      expect(migration).toContain(`'${event}'`);
      expect(actions).toContain(`"${event}"`);
    }
  });
});
