# Stage 20 — Release Proof Ledger

## Status

**Stage 20 is a release candidate.** Product implementation, Supabase migration/security/lifecycle verification, and authenticated browser proof are complete. Remaining gates are final cleaned-head CI, intentional squash merge of PR #36, and production deployment verification.

## Static validation

Stage 20 reached repeated complete repository validation while defects were corrected. Important final checkpoints include:

- CI #913 passed on the corrected Stage 20 application head after the non-admin admin-boundary hardening;
- CI #915 validated the corrective exact-head Preview trigger;
- CI #918 validates the corrected Playwright release-proof assertion/workflow cleanup path;
- the permanent Stage 20 integration/regression suite preserves Stage 18 Curated Opportunity behavior while testing Stage 20 provider/application boundaries.

The repository validation gate covers formatting, zero-warning lint, strict TypeScript, unit tests, coverage, integration/regression tests and production build.

## Supabase gate — passed

Connected project: `pipupath-staging` (`kvjcswnmhwegpakbtvlh`).

Applied migration ledger:

- `20260818141201_stage_20_opportunity_marketplace.sql`
- `20260818141248_stage_20_opportunity_marketplace_provider.sql`
- `20260818141319_stage_20_opportunity_marketplace_catalog.sql`
- `20260818141400_stage_20_opportunity_marketplace_application.sql`
- `20260818141444_stage_20_opportunity_marketplace_provider_application.sql`
- `20260818141524_harden_stage_20_marketplace_privacy_v2.sql`
- `20260818142148_index_stage_20_marketplace_foreign_keys.sql`

Verified live:

- all Stage 20 tables have RLS enabled;
- `anon` and `authenticated` have no direct Stage 20 table CRUD privileges;
- authenticated Stage 20 RPCs enforce actor-specific Builder/provider/admin authorization;
- private Stage 20 helper functions are not browser-callable;
- provider/listing integrity is enforced at the database boundary;
- provider application projection excludes the internal Builder UUID and private evidence href;
- every Stage 20 foreign key has a covering index.

Transactional rollback proof passed provider/listing mismatch rejection, invalid submission rejection, provider suspension withdrawal, post-suspension Builder withdrawal authority, provider projection privacy and zero persistent synthetic data.

## Vercel gate — passed

Connected Vercel team: `copyartint-2860s-projects` (`team_BVKFc6kjlaazTmHWc1vXv6RK`).

Connected project: `pipu-path` (`prj_EijX6BCMKdWZTMCJDMevLFj1TjmK`), correctly linked to GitHub repository `synsynlele/pipu-path`.

An early automatic Stage 20 Preview existed before branch deployment suppression and is not counted as release proof.

The first deliberate release Preview, `dpl_2QBRJ7dpZaX8MGSX7zuASNkBZf4x` from `d9bfe2f5de8e0a5979653212d165c28698e229ef`, served as a defect-discovery gate. It confirmed anonymous provider protection and exposed two fixture/test issues: the reusable CI identities had intentionally revoked platform-admin records, and the original cleanup helper assumed two provider memberships.

Those issues were corrected without weakening production authorization. The CI identity remained non-admin and received only temporary membership in the fixed release provider fixture.

The corrective exact-head Preview is:

- deployment: `dpl_5yFRKsa7FDb5pEkaFfYhjf844Vfi`;
- Vercel source SHA: `82b4cd4cafa5c3e24dfe737806a386d0deddd770`;
- state: `READY`;
- project: `copyartint-2860s-projects/pipu-path`.

Its first Playwright run proved the complete Builder/provider flow but exposed one test-only mismatch: Next.js rendered the correct not-found boundary for `/admin/providers` while returning an HTTP 200 streamed response. The captured page was the PipuPath 404 surface: `404 — This path is not available.` The registry heading was absent.

The test was corrected to assert the rendered authorization boundary rather than transport status. With Vercel deployment suppression restored, GitHub reran the corrected Playwright suite against the **same READY Preview URL**, consuming no additional Preview deployment.

Final browser proof run `32157112775` passed all three Chromium checks:

1. anonymous users cannot enter `/provider`;
2. authenticated non-admin users receive the PipuPath not-available boundary for `/admin/providers` and cannot see the provider registry;
3. an authenticated Builder with membership only in the release provider can discover the opportunity, save a private draft, preview the exact consent packet, submit it, view it from the provider queue, transition it to `viewed`, and withdraw it, while private/internal fields remain absent from provider output.

## Fixture cleanup — passed

After browser proof:

- fixture providers: `0`;
- fixture opportunities: `0`;
- fixture applications: `0`;
- fixture provider memberships: `0`;
- fixture marketplace audit events: `0`;
- fixture Builder opportunity state: `0`.

The two reusable CI profiles were restored to their original null username/display-name state. Their platform-admin records are again `analyst / revoked`; no temporary platform-admin privilege remains.

## Deployment control

`agent/stage-20-opportunity-marketplace` has Vercel deployment suppression restored. Temporary Preview-proof workflows are removed. No further Stage 20 Preview is expected before merge.

## Remaining release gates

1. final cleaned PR head passes complete CI;
2. PR #36 is intentionally squash-merged; and
3. the resulting production Vercel deployment is confirmed healthy on the exact merged commit.

Stage 21 work must not enter PR #36.
