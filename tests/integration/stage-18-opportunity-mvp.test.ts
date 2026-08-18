import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read(
  "supabase/migrations/20260817210000_stage_18_opportunity_mvp.sql",
);
const hardeningMigration = read(
  "supabase/migrations/20260817210100_stage_18_opportunity_mvp_hardening.sql",
);
const reviewEnumRepair = read(
  "supabase/migrations/20260817210200_fix_stage_18_review_enum_cast.sql",
);
const contract = read(
  "src/modules/opportunities/domain/opportunity-contract.ts",
);
const dal = read("src/modules/opportunities/infrastructure/opportunity-dal.ts");
const marketplaceDal = read(
  "src/modules/opportunities/infrastructure/marketplace-dal.ts",
);
const builderPage = read("src/app/opportunities/page.tsx");
const trackedCard = builderPage.slice(
  builderPage.indexOf("function TrackedApplicationCard"),
  builderPage.indexOf("export default async function OpportunitiesPage"),
);
const adminPage = read("src/app/admin/opportunities/page.tsx");
const navigation = read("src/components/navigation/app-navigation.tsx");
const homeLayout = read("src/app/app/layout.tsx");
const productEvents = read(
  "src/modules/analytics/infrastructure/product-events.ts",
);

describe("Stage 18 Opportunity MVP", () => {
  it("keeps vetted supply and private Builder state behind RLS with no browser table grants", () => {
    expect(migration).toContain("create table public.opportunities");
    expect(migration).toContain(
      "create table public.builder_opportunity_state",
    );
    expect(migration).toContain(
      "alter table public.opportunities enable row level security",
    );
    expect(migration).toContain(
      "alter table public.builder_opportunity_state enable row level security",
    );
    expect(migration).toMatch(
      /revoke all on public\.opportunities, public\.builder_opportunity_state\s+from public, anon, authenticated;/,
    );
    expect(dal).not.toContain('.from("opportunities")');
    // Stage 20 intentionally supersedes the Stage 18 catalog transport while
    // preserving the curated supply/private-state contract.
    expect(dal).toContain("getMarketplaceCatalog");
    expect(marketplaceDal).toContain('rpc("get_stage20_marketplace_catalog")');
  });

  it("separates review from publication and invalidates approval after edits", () => {
    expect(migration).toContain("opportunity_review_status");
    expect(migration).toContain("opportunity_publication_status");
    expect(migration).toContain("review_status = 'pending'");
    expect(migration).toContain("publication_status = 'draft'");
    expect(migration).toContain("OPPORTUNITY_REVIEW_REQUIRED");
    expect(reviewEnumRepair).toContain(
      "'approved'::public.opportunity_review_status",
    );
    expect(reviewEnumRepair).toContain(
      "'rejected'::public.opportunity_review_status",
    );
    expect(adminPage).toContain("Review and publication are separate");
    expect(adminPage).toContain("reviewed item resets it to draft");
  });

  it("makes supply mutations owner/operator only while preserving read-only admin roles", () => {
    expect(migration).toContain("private.stage18_require_supply_editor");
    expect(migration).toContain("admin_role not in ('owner', 'operator')");
    expect(adminPage).toContain('workspace.role === "owner"');
    expect(adminPage).toContain('workspace.role === "operator"');
    expect(adminPage).toContain(
      "Moderator and analyst roles can inspect supply",
    );
  });

  it("makes supply safety authoritative below the UI", () => {
    expect(hardeningMigration).toContain(
      "private.stage18_validate_opportunity_supply",
    );
    expect(hardeningMigration).toContain("OPPORTUNITY_COPY_UNSAFE");
    expect(hardeningMigration).toContain("OPPORTUNITY_COUNTRY_CODE_INVALID");
    expect(hardeningMigration).toContain("OPPORTUNITY_TAG_INVALID");
    expect(hardeningMigration).toContain(
      "before insert or update on public.opportunities",
    );
    expect(hardeningMigration).toContain(
      "alter function public.get_stage18_admin_opportunities() volatile",
    );
  });

  it("uses deterministic evidence matching rather than an AI opportunity score", () => {
    expect(contract).toContain("matchOpportunity");
    expect(contract).toContain("strong_match");
    expect(contract).toContain("eligibility_check");
    expect(contract).toContain("selectedPathSkills");
    expect(contract).toContain("capabilities");
    expect(contract).not.toMatch(/openai|gemini|anthropic/i);
    expect(contract).not.toContain("probability");
  });

  it("never guesses missing age or geography eligibility", () => {
    expect(contract).toContain(
      "Confirm the exact age requirement before applying",
    );
    expect(contract).toContain("Confirm location eligibility");
    expect(builderPage).toContain("Missing details are shown as");
    expect(builderPage).toContain("eligibility checks rather than guessed");
  });

  it("keeps closed applications outcome-trackable without re-recommending them", () => {
    expect(hardeningMigration).toContain("'isActive'");
    expect(hardeningMigration).toContain(
      "builder_state.applied_at is not null",
    );
    expect(hardeningMigration).not.toContain(
      "'officialUrl', opportunity.official_url",
    );
    expect(contract).toContain("if (!opportunity.isActive) return null");
    expect(dal).toContain("trackedApplications");
    expect(trackedCard).toContain("Tracked application");
    expect(trackedCard).toContain("Opportunity no longer active");
    expect(trackedCard).toContain("will not treat it as an active match");
    expect(trackedCard).not.toContain("openOpportunityAction");
    expect(trackedCard).not.toContain("Open official opportunity");
  });

  it("labels applications and outcomes as self-reported rather than verified", () => {
    expect(builderPage).toContain("Application — self-reported");
    expect(builderPage).toContain("PipuPath has not independently verified");
    expect(builderPage).toContain("Save self-reported outcome");
  });

  it("reuses the central product-event stream and adds no primary navigation item", () => {
    expect(productEvents).toContain('"opportunity_saved"');
    expect(productEvents).toContain('"opportunity_external_clicked"');
    expect(productEvents).toContain('"opportunities"');
    expect(migration).toContain("alter table public.product_events");
    expect(navigation).not.toMatch(/href:\s*["']\/opportunities["']/);
    expect(homeLayout).toContain('href="/opportunities"');
  });
});
