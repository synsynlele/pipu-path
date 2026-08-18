# Stage 20 — Release Proof Ledger

## Static validation

- CI #887 passed the split Stage 20 migration package.
- CI #889 passed after the foreign-key index corrective migration was added to Supabase and the repository.
- CI #893 passed the formatted permanent Stage 20 authenticated Playwright release proof.
- CI #895 passed after the release-proof deployment guard was added.
- CI #899 passed the cleaned Stage 20 head after all temporary deployment/credential diagnostics were removed.
- The permanent Stage 20 authenticated Playwright release proof is opt-in and requires `E2E_STAGE20_EXPECT_MARKETPLACE=true`.

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
- public Stage 20 RPCs are executable only by authenticated/service-role callers and enforce actor-specific authorization internally;
- private Stage 20 helper functions are not browser-callable;
- the application provider/listing integrity trigger is enabled;
- the provider application projection excludes the internal Builder UUID and private evidence href;
- migration deployment created no provider, provider-member, application or provider-owned opportunity fixture rows;
- every Stage 20 foreign key has a covering index.

Transactional rollback proof passed:

- mismatched application provider/listing IDs were rejected;
- invalid submitted application state without consent/submission metadata was rejected;
- provider suspension automatically withdrew a published provider-owned listing;
- an existing Builder application remained withdrawable after provider suspension;
- provider projection privacy assertions passed;
- all synthetic providers/listings/applications were rolled back to zero rows.

## Vercel gate — correct project verified

Connected Vercel team: `copyartint-2860s-projects` (`team_BVKFc6kjlaazTmHWc1vXv6RK`).

Connected Vercel project: `pipu-path` (`prj_EijX6BCMKdWZTMCJDMevLFj1TjmK`).

Live Vercel deployment metadata proves this project is correctly connected to GitHub repository `synsynlele/pipu-path` (repository ID `1311277909`). Production deployments track `main`, and Preview deployments track PipuPath release branches and PRs.

An early automatic Stage 20 Preview exists for commit `a794b523e2e65f95e11493489ab83c6586b50347` (`docs(stage20): lock opportunity marketplace scope`), deployment `dpl_GQP81W1wwMpuo8BF6p1T1xq5tTsP`. It predates the release candidate and is not accepted as the Stage 20 release proof.

Automatic Preview deployment remains disabled for `agent/stage-20-opportunity-marketplace`. The final release gate will enable exactly one deliberate exact-head Preview, run the authenticated Builder/provider/admin proof, then restore branch deployment suppression before merge.

## Remaining release gates

1. pass full CI after the final browser-proof correction;
2. enable one deliberate exact-head Stage 20 Preview on `copyartint-2860s-projects/pipu-path`;
3. create temporary marketplace fixture records scoped to the existing authenticated CI identities;
4. run authenticated Builder + provider + admin browser proof against the matching Preview;
5. remove fixture records and re-check zero synthetic marketplace rows;
6. restore Stage 20 branch deployment suppression and run cleaned-head CI;
7. intentionally squash-merge PR #36 and verify production from the exact merged source.
