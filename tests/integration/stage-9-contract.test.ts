import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608040019_stage_9_selective_project_portfolio.sql",
  "utf8",
);
const actions = readFileSync(
  "src/modules/portfolio/application/portfolio-actions.ts",
  "utf8",
);
const dal = readFileSync(
  "src/modules/portfolio/infrastructure/portfolio-dal.ts",
  "utf8",
);
const portfolioPage = readFileSync("src/app/portfolio/page.tsx", "utf8");
const studioPage = readFileSync(
  "src/app/portfolio/[projectId]/page.tsx",
  "utf8",
);
const previewPage = readFileSync(
  "src/app/portfolio/[projectId]/preview/page.tsx",
  "utf8",
);
const publicPage = readFileSync("src/app/proof/[slug]/page.tsx", "utf8");
const publicView = readFileSync(
  "src/modules/portfolio/ui/public-proof-view.tsx",
  "utf8",
);
const withdrawForm = readFileSync(
  "src/modules/portfolio/ui/portfolio-withdraw-form.tsx",
  "utf8",
);
const shell = readFileSync("src/components/shells/app-shell.tsx", "utf8");
const adr = readFileSync(
  "docs/architecture/adr-stage-9-selective-project-portfolio.md",
  "utf8",
);

describe("Stage 9 selective Project portfolio structural contract", () => {
  it("enables RLS and owner-only reads on the private portfolio table", () => {
    expect(migration).toContain(
      "alter table public.builder_project_portfolios enable row level security",
    );
    expect(migration).toContain("builder_project_portfolios_own_select");
    expect(migration).toContain(
      "grant select on public.builder_project_portfolios to authenticated",
    );
    expect(migration).not.toMatch(
      /grant (insert|update|delete)[\s\S]{0,160}builder_project_portfolios/i,
    );
  });

  it("keeps anonymous users away from the base table", () => {
    expect(migration).toContain(
      "revoke all on public.builder_project_portfolios",
    );
    expect(migration).not.toMatch(
      /grant select on public\.builder_project_portfolios to anon/i,
    );
  });

  it("exposes only a public-safe RPC projection", () => {
    expect(migration).toContain("get_stage9_public_portfolio");
    expect(migration).toContain(
      "grant execute on function public.get_stage9_public_portfolio(text)",
    );
    expect(migration).toContain("to anon, authenticated");
    expect(migration).not.toMatch(
      /returns table[\s\S]{0,500}(user_id|project_id|portfolio_id|quest)/i,
    );
    expect(dal).toContain('client.rpc("get_stage9_public_portfolio"');
    expect(publicPage).toContain("getPublicPortfolioBySlug");
  });

  it("requires an owned completed Project with all three milestones", () => {
    expect(migration).toContain("project.status = 'completed'");
    expect(migration).toContain("status = 'completed'");
    expect(migration).toContain(") <> 3 then");
    expect(migration).toContain("project.user_id = actor");
  });

  it("limits public publishing to adult non-flagged Builders", () => {
    expect(migration).toContain("age_band not in ('18_24', '25_plus')");
    expect(migration).toContain("safeguarding_review_required");
    expect(portfolioPage).toContain("Public Project proof is adult-only");
    expect(adr).toContain("adult-only");
  });

  it("requires preview and explicit versioned consent", () => {
    expect(previewPage).toContain("Private preview");
    expect(previewPage).toContain("PortfolioPublishForm");
    expect(migration).toContain("project-portfolio-v1");
    expect(migration).toContain("PORTFOLIO_CONSENT_REQUIRED");
    expect(actions).toContain("consentConfirmed");
  });

  it("creates stable slugs and one published proof per Builder", () => {
    expect(migration).toContain("slug extensions.citext not null unique");
    expect(migration).toContain(
      "builder_project_portfolios_one_published_user_idx",
    );
    expect(migration).toContain("where status = 'published'");
    expect(migration).toContain("gen_random_uuid()");
  });

  it("supports withdrawal without deleting private history", () => {
    expect(migration).toContain("withdraw_stage9_project_portfolio");
    expect(migration).toContain("status = 'withdrawn'");
    expect(migration).not.toMatch(
      /delete from public\.builder_project_portfolios/i,
    );
    expect(withdrawForm).toContain("Withdraw Public Proof");
  });

  it("rechecks live publication state and invalidates the withdrawn slug", () => {
    expect(publicPage).toContain('export const dynamic = "force-dynamic"');
    expect(publicPage).toContain("export const revalidate = 0");
    expect(actions).toContain(
      'client.from("builder_project_portfolios").select("slug")',
    );
    expect(actions).toContain("revalidatePath(`/proof/${portfolio.slug}`)");
  });

  it("keeps private source proof out of public presentation", () => {
    expect(publicView).toContain("Quest evidence, reflections");
    expect(publicView).toContain("raw Project updates");
    expect(publicView).not.toContain("progress_note");
    expect(publicView).not.toContain("proof_text");
    expect(publicView).not.toContain("what_i_learned");
  });

  it("integrates Portfolio into the complete Builder shell", () => {
    expect(shell).toContain('{ label: "Portfolio", href: "/portfolio" }');
    expect(portfolioPage).toContain(
      "Present proof without surrendering privacy.",
    );
    expect(studioPage).toContain("Private Portfolio Studio");
  });

  it("stops before discovery, social and opportunity mechanics", () => {
    expect(adr).toContain("Builder discovery directories or search");
    expect(adr).toContain("follows, likes, comments");
    expect(adr).toContain("opportunity, funding or employment matching");
  });
});
