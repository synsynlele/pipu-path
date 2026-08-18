import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const migration = read(
  "supabase/migrations/20260818092629_stage_18_capability_verification_corrective.sql",
);

describe("Stage 18 Capability Verification structure", () => {
  it("stores private evidence-bound verification with RLS and no browser table grants", () => {
    expect(migration).toContain(
      "create table public.builder_capability_verifications",
    );
    expect(migration).toContain("enable row level security");
    expect(migration).toContain(
      "revoke all on public.builder_capability_verifications from public, anon, authenticated",
    );
    expect(migration).not.toMatch(/grant select[^;]+to authenticated/i);
  });

  it("requires an active claim and exact completed collaboration evidence", () => {
    expect(migration).toContain("version.status = 'active'");
    expect(migration).toContain("evidence.claim_id = claim_row.id");
    expect(migration).toContain("evidence.source_type = 'collaboration'");
    expect(migration).toContain(
      "evidence.verification = 'mutual_collaboration'",
    );
    expect(migration).toContain("status = 'completed'");
  });

  it("restricts the verifier to the real collaboration partner and current safe relationship", () => {
    expect(migration).toContain(
      "private.stage18_verification_relationship_valid",
    );
    expect(migration).toContain("private.stage11_builder_connect_eligible");
    expect(migration).toContain("private.stage11_builder_pair_blocked");
    expect(migration).toContain("private.stage15_connection_for_pair");
    expect(migration).toContain(
      "when collaboration_row.owner_id = actor then collaboration_row.collaborator_id",
    );
  });

  it("preserves stable provenance across profile refreshes without rating fields or public badges", () => {
    expect(migration).toContain("capability_key");
    expect(migration).toContain("claim_id_at_request");
    expect(migration).toContain("evidence_id_at_request");
    expect(migration).toContain("basis_source_id");
    expect(migration).not.toMatch(
      /\brating(?:_score)?\s+(?:smallint|integer|numeric|text|real|double precision)\b/i,
    );
    expect(migration).not.toContain("public_visibility");
  });

  it("ships a private verification workspace and keeps institution verification out of Stage 18", () => {
    const page = read("src/app/profile/verification/page.tsx");
    const proxy = read("src/proxy.ts");
    const adr = read(
      "docs/architecture/adr-stage-18-capability-verification.md",
    );
    expect(page).toContain("Capability Verification");
    expect(page).toContain(
      "No stars, endorsements, popularity counts or paid verification",
    );
    expect(proxy).toContain('"/profile"');
    expect(adr).toContain("Stage 19 may add institution verification");
    expect(adr).toContain("does not add:\n\n- Institution Workspace");
  });
});
