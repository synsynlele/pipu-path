# Implementation status

**Current stage:** Stage 20 — Opportunity Marketplace  
**Stage status:** Vertical slice implemented on draft PR #36 — full static validation gate in progress; production Supabase migration and Vercel Preview remain untouched  
**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API  
**Last updated:** 2026-08-18

## Released and verified stages

Stages 0–12 are complete and released. Stage 13 has its PipuPath cohort/privacy boundary verified; the final real KHP-OS cross-product pairing remains a separate integration gate. Stages 14–19 are complete and released in the PipuPath product.

Stage 19 Institution Workspace was squash-merged through PR #35 as `e2dd36bd6756492c7c89d3cddb5afee762c83082`. Its final cleaned PR head passed complete validation, its database/RLS/lifecycle proof passed, its matching authenticated Vercel Preview proof passed 2/2 checks, and production Vercel completed successfully on the release commit.

Stage 20 Opportunity Marketplace is now the active implementation stage. The already-released Curated Opportunity MVP is its seed rather than duplicate work.

Stage 21 Builder Passport/API remains planned.

## Stage 20 implemented vertical slice

The authority remains `docs/stages/stage-20-opportunity-marketplace.md`.

The current PR implements:

- trusted provider persistence with `pending`, `approved`, `suspended` and `revoked` states;
- scoped provider `owner` / `operator` memberships;
- provider-owned opportunity drafts that reset to independent platform review and cannot self-publish;
- platform `/admin/providers` trust registry and provider-member controls;
- provider `/provider`, `/provider/opportunities` and `/provider/applications` surfaces with no Builder directory;
- extension of the Stage 18 catalog rather than duplicate opportunity supply;
- deterministic age/geography/path/capability matching preserved on the Builder Opportunities surface;
- Builder `/opportunities/[opportunityId]` detail with approved-provider trust context;
- Builder `/opportunities/[opportunityId]/apply` exact application-packet flow: private draft → exact preview → explicit consent → submission;
- exact selected capability, evidence, institution-confirmation and published Portfolio proof snapshots;
- application lifecycle `draft`, `submitted`, `viewed`, `shortlisted`, `accepted`, `not_selected`, `withdrawn`;
- Builder withdrawal authority preserved after listing/provider closure where lifecycle rules still allow withdrawal;
- database-level provider/listing integrity trigger in addition to RPC checks;
- provider application projection that deliberately excludes the internal PipuPath Builder UUID;
- direct browser table access revoked with bounded authenticated RPCs and service-role direct access;
- two Supabase CLI-generated Stage 20 migration files, neither applied to production yet.

## Existing Stage 18 seed preserved

Stage 18 already supplies:

- vetted opportunity categories;
- age and geography eligibility checks;
- pathway/capability matching;
- explainable match tiers and readiness gaps;
- save/open/external-applied/self-reported outcome state;
- admin create/review/publish/withdraw flow;
- official external URL boundary;
- RLS with no direct browser table access.

The live opportunity catalog currently has no production listing rows, so Stage 20 can extend the schema without migrating or rewriting live opportunity supply data.

## Stage 20 migration files

Generated with the repository Supabase CLI rather than invented timestamps:

- `20260818123042_stage_20_opportunity_marketplace`
- `20260818124524_harden_stage_20_marketplace_privacy`

These migrations are code-only until the exact Stage 20 branch passes full `npm run validate`. Production Supabase remains on the released Stage 19 schema.

## Stage 20 deployment control

- Branch: `agent/stage-20-opportunity-marketplace`.
- Draft PR: #36.
- Automatic Vercel Preview deployment is disabled for the branch.
- GitHub CI is the continuous static gate.
- No Stage 20 Vercel Preview has been created.
- Exactly one deliberate Vercel Preview remains reserved for the final authenticated Builder/provider/admin browser proof after static and database gates are green.

## Static validation evidence

- The complete Stage 20 TypeScript/TSX surface passed repository Prettier formatting.
- CI run `32139736943` reached lint and found one zero-warning-policy issue only: an unused `opportunityProviderSchema` import in `marketplace-dal.ts`; the unused import was removed.
- CI run `32139988333` then passed formatting and zero-warning lint, reached strict TypeScript, and found one exported-symbol naming mismatch: the DAL referenced `marketplaceApplicationStatusSchema` while the domain contract exports `opportunityApplicationStatusSchema`; the symbol mismatch was corrected.
- CI run `32140199986` then passed formatting, zero-warning lint and strict TypeScript. All 242 pre-existing unit tests passed, but the new Stage 20 marketplace contract suite could not load because Zod v4 forbids `.omit()` on a refined schema.
- The provider-workspace runtime schema now derives from the released non-refined `opportunityAdminItemSchema` projection instead. The temporary fix workflow removed itself after applying that correction.
- Stage 20 unit assertions, integration tests, coverage and production-build gates remain unclaimed until the next full validation run reaches and passes them.

## Stage 20 non-goals

No payments, escrow, contracts, payroll, fees, bidding, gig marketplace, employer/provider Builder search, open messaging, ranking, automated AI selection/rejection, marketplace recommendation sale or Stage 21 credential/API work enters Stage 20.

## Stage 20 next gate

Run complete static validation on the corrected fully formatted vertical slice. Fix every unit/integration, coverage or production-build issue before applying either Stage 20 migration to Supabase. Only after static green: apply migrations in order, verify RLS/grants/RPCs and run rollback-only provider → opportunity → Builder packet → provider decision → withdrawal/closure lifecycle proofs with zero synthetic residue.
