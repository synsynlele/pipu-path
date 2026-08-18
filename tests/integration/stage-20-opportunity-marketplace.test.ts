import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const migration = fs
  .readdirSync(path.join(root, "supabase/migrations"))
  .filter(
    (file) =>
      file.includes("stage_20_opportunity_marketplace") &&
      !file.includes("harden_stage_20_marketplace_privacy"),
  )
  .sort()
  .map((file) => read(`supabase/migrations/${file}`))
  .join("\n");
const hardeningFile = fs
  .readdirSync(path.join(root, "supabase/migrations"))
  .find((file) => file.includes("harden_stage_20_marketplace_privacy_v2"));
if (!hardeningFile) throw new Error("Stage 20 hardening migration missing");
const hardening = read(`supabase/migrations/${hardeningFile}`);
const authority = read("docs/stages/stage-20-opportunity-marketplace.md");
const projectState = read("PROJECT_STATE.md");
const implementationStatus = read("docs/implementation/status.md");
const vercelConfig = read("vercel.json");
const routeMap = read("docs/implementation/route-map.md");

describe("Stage 20 Opportunity Marketplace structure", () => {
  it("creates trusted provider and application persistence behind RLS", () => {
    expect(migration).toContain("create table public.opportunity_providers");
    expect(migration).toContain(
      "create table public.opportunity_provider_members",
    );
    expect(migration).toContain("create table public.opportunity_applications");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("from public, anon, authenticated");
  });

  it("extends rather than duplicates the released Stage 18 opportunity supply", () => {
    expect(migration).toContain("alter table public.opportunities");
    expect(migration).toContain("add column provider_id");
    expect(authority).toContain(
      "Stage 20 extends this vertical slice. It does not rebuild it.",
    );
  });

  it("keeps provider approval independent from provider listing ownership", () => {
    expect(migration).toContain(
      "private.stage20_require_approved_provider_operator",
    );
    expect(migration).toContain("upsert_stage20_provider_opportunity");
    expect(migration).toContain("review_status = 'pending'");
    expect(migration).toContain("publication_status = 'draft'");
    expect(migration).toContain("OPPORTUNITY_PROVIDER_NOT_APPROVED");
  });

  it("enforces adult and safeguarding boundaries before application sharing", () => {
    expect(migration).toContain("private.stage20_active_adult_builder");
    expect(migration).toContain("coalesce(profile.is_minor, true) = false");
    expect(migration).toContain("profile.safeguarding_review_required = false");
    expect(authority).toContain(
      "Stage 20 defaults provider application submission to eligible adults only",
    );
  });

  it("snapshots only exact Builder-selected deployment-safe evidence", () => {
    expect(migration).toContain("opportunity_application_capabilities");
    expect(migration).toContain("opportunity_application_evidence");
    expect(migration).toContain(
      "opportunity_application_institution_verifications",
    );
    expect(migration).toContain("opportunity_application_portfolio_proofs");
    expect(migration).toContain(
      "MARKETPLACE_APPLICATION_EVIDENCE_NOT_ELIGIBLE",
    );
    expect(migration).toContain("claim.id = any(claim_ids)");
  });

  it("keeps application lifecycle authority separated by actor", () => {
    expect(migration).toContain("submit_stage20_opportunity_application");
    expect(migration).toContain("withdraw_stage20_opportunity_application");
    expect(migration).toContain("transition_stage20_provider_application");
    expect(migration).toContain(
      "MARKETPLACE_APPLICATION_PROVIDER_TRANSITION_INVALID",
    );
  });

  it("enforces listing/provider integrity again at the database trigger boundary", () => {
    expect(hardening).toContain(
      "private.stage20_enforce_application_provider_match",
    );
    expect(hardening).toContain("opportunity_application_provider_match");
    expect(hardening).toContain("MARKETPLACE_APPLICATION_PROVIDER_MISMATCH");
  });

  it("lets operators discover only provider workspaces they actually belong to", () => {
    expect(hardening).toContain("list_stage20_provider_workspaces");
    expect(hardening).toContain("member.user_id = actor");
    expect(hardening).toContain("member.status = 'active'");
  });

  it("never exposes the internal Builder UUID in the provider application projection", () => {
    const projectionStart = hardening.indexOf(
      "create or replace function private.stage20_application_projection",
    );
    const projectionEnd = hardening.indexOf(
      "revoke all on function private.stage20_application_projection",
      projectionStart,
    );
    const projection = hardening.slice(projectionStart, projectionEnd);
    expect(projection).not.toContain("builderUserId");
    expect(projection).not.toContain("builder_user_id");
    expect(projection).not.toContain("sourceHref");
    expect(projection).not.toContain("source_href");
    expect(projection).toContain("displayName");
    expect(projection).toContain("capabilities");
    expect(projection).toContain("institutionVerifications");
  });

  it("preserves Builder application history and withdrawal access after supply closes", () => {
    expect(hardening).toContain("application_status_value");
    expect(hardening).toContain(
      "if application_status_value is null and not can_edit",
    );
    expect(hardening).toContain("'canEdit', can_edit");
    expect(routeMap).toContain(
      "Eligible adult Builder / existing application owner",
    );
  });

  it("never gives providers a Builder directory", () => {
    expect(authority).toContain("No provider receives a Builder directory.");
    expect(authority).toContain("No broad Builder browsing.");
    expect(migration).not.toMatch(/provider_[a-z_]*builder_directory/i);
  });

  it("keeps Stage 20 Preview suppression locked after release proof", () => {
    expect(projectState.toLowerCase()).toContain(
      "stage 20 branch preview suppression is restored",
    );
    expect(vercelConfig).toContain(
      '"agent/stage-20-opportunity-marketplace": false',
    );
    expect(implementationStatus).toContain(
      "No further Stage 20 Preview is expected before merge.",
    );
  });
});
