# Implementation status

**Current stage:** Stage 20 — Opportunity Marketplace  
**Stage status:** Release candidate — application, Supabase and authenticated browser gates passed; final cleaned-head CI, merge and production verification remain  
**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API  
**Last updated:** 2026-08-18

## Released and verified stages

Stages 0–12 are complete and released. Stage 13 has its PipuPath cohort/privacy boundary verified; the final real KHP-OS cross-product pairing remains a separate integration gate. Stages 14–19 are complete and released in PipuPath.

Stage 19 Institution Workspace was squash-merged through PR #35 as `e2dd36bd6756492c7c89d3cddb5afee762c83082`. Its final cleaned PR head passed complete validation, its database/RLS/lifecycle proof passed, its authenticated Vercel Preview proof passed, and production Vercel completed successfully on the release commit.

Stage 20 Opportunity Marketplace is now at the final release gate on PR #36. Stage 21 Builder Passport/API remains planned and must not enter PR #36.

## Stage 20 implemented and verified scope

The authority remains `docs/stages/stage-20-opportunity-marketplace.md` and the detailed release evidence is in `docs/stages/stage-20-release-proof.md`.

Stage 20 implements and verifies:

- trusted provider persistence with `pending`, `approved`, `suspended` and `revoked` states;
- scoped provider `owner` / `operator` memberships;
- provider-owned opportunity drafts that cannot self-approve or self-publish;
- platform provider-trust administration with a hidden boundary for non-admins;
- provider `/provider`, `/provider/opportunities` and `/provider/applications` surfaces with no Builder directory/search;
- extension of the released Stage 18 opportunity catalog and matching behavior rather than duplicate supply;
- Builder opportunity detail with approved-provider trust context;
- private draft → exact packet preview → explicit consent → submission application flow;
- exact selected capability, evidence, institution-confirmation and published Portfolio proof snapshots;
- application lifecycle `draft`, `submitted`, `viewed`, `shortlisted`, `accepted`, `not_selected`, `withdrawn`;
- Builder withdrawal authority preserved after listing/provider closure where lifecycle rules allow;
- database-level provider/listing integrity enforcement;
- provider application projection excluding internal Builder UUIDs and private evidence routes;
- direct browser table access revoked with bounded authenticated RPCs and service-role direct access only;
- minor/safeguarding submission exclusion for the Stage 20 provider application path.

## Supabase release evidence

Connected project: `kvjcswnmhwegpakbtvlh`.

Stage 20 migrations are live through:

- `20260818141201_stage_20_opportunity_marketplace.sql`
- `20260818141248_stage_20_opportunity_marketplace_provider.sql`
- `20260818141319_stage_20_opportunity_marketplace_catalog.sql`
- `20260818141400_stage_20_opportunity_marketplace_application.sql`
- `20260818141444_stage_20_opportunity_marketplace_provider_application.sql`
- `20260818141524_harden_stage_20_marketplace_privacy_v2.sql`
- `20260818142148_index_stage_20_marketplace_foreign_keys.sql`

Live proofs confirm RLS, closed direct browser CRUD, bounded RPC authorization, provider/listing integrity, privacy-safe provider projections, complete FK indexing, rollback lifecycle behavior and zero persistent synthetic release data.

## Vercel and browser release evidence

Connected Vercel project: `copyartint-2860s-projects/pipu-path` (`prj_EijX6BCMKdWZTMCJDMevLFj1TjmK`), correctly linked to `synsynlele/pipu-path`.

The first deliberate Preview was used as a defect-discovery gate. A corrective exact-head Preview, deployment `dpl_5yFRKsa7FDb5pEkaFfYhjf844Vfi`, reached READY from source commit `82b4cd4cafa5c3e24dfe737806a386d0deddd770`.

The corrected Playwright suite was rerun against that same READY Preview after fixing a test-only HTTP-status assumption. Final run `32157112775` passed all three browser checks:

- anonymous provider workspace denial;
- authenticated non-admin provider-registry denial through the rendered PipuPath not-found boundary;
- complete Builder → exact consent packet → provider queue → viewed → Builder withdrawal flow, with private/internal fields absent from provider output.

All Stage 20 release fixtures and test profile labels were removed afterward. The reusable CI identities are restored to their original revoked platform-admin state.

## Deployment control

- Branch: `agent/stage-20-opportunity-marketplace`.
- Draft PR: #36.
- Automatic Vercel Preview deployment is restored to disabled for the branch.
- Temporary Preview-proof workflows are removed.
- No further Stage 20 Preview is expected before merge.

## Remaining Stage 20 release gate

1. final cleaned PR head passes complete repository CI;
2. PR #36 is intentionally squash-merged; and
3. production Vercel is confirmed healthy on the exact merged commit.

After Stage 20 releases, the next implementation stage is **Stage 21 — Builder Passport/API**.
