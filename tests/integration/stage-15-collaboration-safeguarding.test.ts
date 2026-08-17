import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const hardening = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260817171000_harden_stage_15_collaboration_safeguarding.sql",
  ),
  "utf8",
);

describe("Stage 15 collaboration safeguarding hardening", () => {
  it("returns no cross-user state when the current account becomes ineligible", () => {
    expect(hardening).toContain(
      "if not eligible then\n    return jsonb_build_object(",
    );
    for (const key of [
      "availableConnections",
      "incoming",
      "sent",
      "active",
      "completed",
    ]) {
      expect(hardening).toContain(`'${key}', '[]'::jsonb`);
    }
  });

  it("re-checks live relationship safety before active detail or completion", () => {
    expect(hardening).toContain("private.stage11_builder_pair_blocked");
    expect(hardening).toContain("private.stage15_connection_for_pair");
    expect(hardening).toContain(
      "not private.stage11_builder_connect_eligible(target.owner_id)",
    );
    expect(hardening).toContain(
      "not private.stage11_builder_connect_eligible(target.collaborator_id)",
    );
    expect(hardening).toContain("COLLABORATION_CONNECTION_REQUIRED");
  });

  it("keeps completed evidence durable while hiding unfinished unsafe relationships", () => {
    expect(hardening).toContain("target.status in ('pending', 'accepted')");
    expect(hardening).toContain("collaboration.status = 'completed'");
  });
});
