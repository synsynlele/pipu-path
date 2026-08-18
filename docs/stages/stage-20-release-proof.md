# Stage 20 — Release Proof Ledger

## Static validation

- CI #887 passed the split Stage 20 migration package.
- CI #889 passed after the foreign-key index corrective migration was added to Supabase and the repository.
- CI #893 passed the formatted permanent Stage 20 authenticated Playwright release proof.
- CI #895 passed after the release-proof deployment guard was added.
- CI #899 passed the cleaned Stage 20 head after temporary deployment/credential diagnostics were removed.
- CI #903 passed after correcting the provider-directory browser assertion and Vercel project ledger.
- CI #904 passed the first release-trigger preparation.
- CI #906 passed after separating provider membership provisioning from direct database authorization writes.
- CI #912 passed the corrective admin-boundary implementation and regression coverage.
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

An early automatic Stage 20 Preview exists for commit `a794b523e2e65f95e11493489ab83c6586b50347` (`docs(stage20): lock opportunity marketplace scope`), deployment `dpl_GQP81W1wwMpuo8BF6p1T1xq5tTsP`. It predates the release candidate and is not accepted as release proof.

The first deliberate release Preview was deployment `dpl_2QBRJ7dpZaX8MGSX7zuASNkBZf4x` from exact commit `d9bfe2f5de8e0a5979653212d165c28698e229ef` on PR #36. It reached READY and the proof workflow resolved the exact Preview URL successfully. Anonymous provider-workspace protection passed.

The authenticated proof then exposed two release-gate facts:

1. the reusable Stage 3 CI identities have intentionally revoked `platform_admins` records, so they correctly cannot operate the provider trust registry;
2. `/admin/providers` was matching the obsolete error discriminator `PLATFORM_ADMIN_REQUIRED`, while the authoritative Stage 18 admin boundary raises `OPPORTUNITY_ADMIN_REQUIRED`. This caused a revoked/non-admin identity to redirect to `provider_registry_unavailable` instead of the intended hidden 404 boundary.

The admin-boundary bug is fixed and now has permanent integration coverage. Preview suppression was restored before corrective code changes, so no second Preview was consumed by the fix commits. CI #912 passed the corrected implementation.

The first deliberate Preview therefore served as a defect-discovery gate and is **not** accepted as the final exact-head release proof. A corrective exact-head Preview is required after the least-privilege provider test membership is granted through the real admin boundary.

## Current release fixture

Temporary release-only provider and published opportunity records exist for the final authenticated proof:

- provider: `Stage 20 Release Fixture Provider`;
- opportunity: `Stage 20 Release Fixture Opportunity`;
- CI Builder/provider test identity username: `stage20_ci_owner`.

The fixture currently has zero applications and zero provider memberships. The second unused CI identity has been restored to its previous null username/display-name state.

Direct database/provider-role authorization writes were intentionally not used. Provider membership must be granted through the authenticated platform-admin boundary so the release proof exercises the real trust path.

## Remaining release gates

1. grant `stage20_ci_owner` temporary **Operator** membership on `Stage 20 Release Fixture Provider` through `/admin/providers` using an active platform owner/operator account;
2. create one corrective exact-head Preview from the current Stage 20 branch on `copyartint-2860s-projects/pipu-path`;
3. run the authenticated non-admin denial + Builder application + provider application-review proof against that exact Preview;
4. revoke the temporary provider membership and delete all Stage 20 release fixture/application/audit/state rows;
5. restore the CI fixture profile fields and re-check zero synthetic marketplace rows;
6. restore Preview suppression and run final cleaned-head CI;
7. intentionally squash-merge PR #36 and verify production from the exact merged source.
