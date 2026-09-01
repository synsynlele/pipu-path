import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const migrationFiles = fs
  .readdirSync(path.join(root, "supabase/migrations"))
  .filter((file) => file.includes("stage_21_builder_passport_api"))
  .sort();
const migrationFile = migrationFiles.at(-1);
if (!migrationFile) throw new Error("Stage 21 Passport migration missing");
const migration = read(`supabase/migrations/${migrationFile}`);

const indexMigrationFile = fs
  .readdirSync(path.join(root, "supabase/migrations"))
  .find((file) =>
    file.includes("index_stage_21_builder_passport_foreign_keys"),
  );
if (!indexMigrationFile) {
  throw new Error("Stage 21 Passport index migration missing");
}
const indexMigration = read(`supabase/migrations/${indexMigrationFile}`);

const authority = read("docs/stages/stage-21-builder-passport-api.md");
const projectState = read("PROJECT_STATE.md");
const implementationStatus = read("docs/implementation/status.md");
const vercelConfig = read("vercel.json");

describe("Stage 21 Builder Passport/API structure", () => {
  it("persists immutable Passport snapshots and bounded proof selections", () => {
    expect(migration).toContain(
      "create table public.builder_passport_versions",
    );
    expect(migration).toContain(
      "create table public.builder_passport_capabilities",
    );
    expect(migration).toContain(
      "create table public.builder_passport_evidence",
    );
    expect(migration).toContain(
      "create table public.builder_passport_institution_verifications",
    );
    expect(migration).toContain(
      "create table public.builder_passport_portfolio_proofs",
    );
    expect(migration).toContain("builder_passport_immutable_snapshot");
    expect(migration).toContain("builder_passport_one_issued_per_builder_idx");
  });

  it("stores only share hashes and never a recoverable raw bearer secret", () => {
    expect(migration).toContain("secret_hash text not null unique");
    expect(migration).toContain("secret_hash ~ '^[a-f0-9]{64}$'");
    expect(migration).not.toMatch(/\bsecret\s+text\b/i);
    expect(migration).not.toMatch(/raw_secret/i);
    expect(authority).toContain("only the **hash** of that secret persisted");
  });

  it("keeps public resolution and rate limiting service-role only", () => {
    expect(migration).toContain("resolve_stage21_passport_share");
    expect(migration).toContain("consume_stage21_passport_rate_limit");
    expect(migration).toContain(
      "revoke all on function public.resolve_stage21_passport_share(uuid, text)\n  from public, anon, authenticated;",
    );
    expect(migration).toContain(
      "grant execute on function public.resolve_stage21_passport_share(uuid, text)\n  to service_role;",
    );
    expect(migration).toContain(
      "revoke all on function public.consume_stage21_passport_rate_limit(text, integer, integer)\n  from public, anon, authenticated;",
    );
  });

  it("never snapshots private evidence routes into Passport evidence", () => {
    const evidenceTableStart = migration.indexOf(
      "create table public.builder_passport_evidence",
    );
    const evidenceTableEnd = migration.indexOf(
      "create table public.builder_passport_institution_verifications",
      evidenceTableStart,
    );
    const evidenceTable = migration.slice(evidenceTableStart, evidenceTableEnd);
    expect(evidenceTable).not.toContain("source_href");

    const publicResolverStart = migration.indexOf(
      "create or replace function public.resolve_stage21_passport_share",
    );
    const publicResolver = migration.slice(publicResolverStart);
    expect(publicResolver).not.toContain("sourceHref");
    expect(publicResolver).not.toContain("builder_user_id");
  });

  it("supersedes the current Passport and closes its active shares", () => {
    expect(migration).toContain("set status = 'superseded'");
    expect(migration).toContain("superseded_at = now()");
    expect(migration).toContain("where passport_id = current_passport_id");
    expect(migration).toContain("revoked_at = coalesce(revoked_at, now())");
  });

  it("surfaces live integrity changes without reviving withdrawn proof links", () => {
    expect(migration).toContain("integrity_state_value := 'changed'");
    expect(migration).toContain(
      "case when portfolio.status = 'published' then item.proof_href else null end",
    );
    expect(migration).toContain("Institution confirmation changed:");
    expect(migration).toContain("Portfolio proof no longer published:");
  });

  it("locks the adult safeguarding boundary for external issuance", () => {
    expect(migration).toContain("private.stage21_require_adult_builder");
    expect(migration).toContain("coalesce(profile.is_minor, true) = false");
    expect(migration).toContain("profile.safeguarding_review_required = false");
    expect(authority).toContain(
      "Stage 21 external Passport issuance/sharing is limited to eligible adults",
    );
  });

  it("locks fragment-secret sharing and non-enumeration", () => {
    expect(authority).toContain("/passport/share/[shareId]#<secret>");
    expect(authority).toContain(
      "There is **no API for enumerating Builders, Passports or shares**.",
    );
    expect(authority).toContain("Authorization: Bearer <secret>");
  });

  it("records the reconciled live migration and foreign-key index hardening", () => {
    expect(migrationFile).toBe(
      "20260818173546_stage_21_builder_passport_api.sql",
    );
    expect(indexMigrationFile).toBe(
      "20260818173828_index_stage_21_builder_passport_foreign_keys.sql",
    );
    expect(indexMigration).toContain(
      "builder_passport_evidence_passport_claim_idx",
    );
    expect(indexMigration).toContain(
      "builder_passport_institution_passport_claim_idx",
    );
  });

  it("keeps Stage 21 Preview deployment suppressed after later-stage evolution", () => {
    expect(vercelConfig).toContain(
      '"agent/stage-21-builder-passport-api": false',
    );
    expect(projectState).toContain("Current stage:** Stage 23");
    expect(projectState).toContain("Stages 0–22");
    expect(implementationStatus).toContain("Stages 0–22 are released");
    expect(implementationStatus).toContain(
      "A deliberate Preview is reserved for the exact green release candidate",
    );
  });
});
