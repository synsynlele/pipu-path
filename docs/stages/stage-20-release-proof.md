# Stage 20 — Release Proof Ledger

## Static validation

- CI #887 passed the split Stage 20 migration package.
- CI #889 passed after the foreign-key index corrective migration was added to Supabase and the repository.
- CI #893 passed the formatted permanent Stage 20 authenticated Playwright release proof.
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

## Vercel gate — deliberate direct-deploy path

The connected Vercel project `pipupath` is still linked in deployment metadata to the obsolete repository `synsynlele/pipupath`, whose `main` stopped on 15 June 2026. The active Stage 0–20 repository is `synsynlele/pipu-path`.

Git-triggered Preview deployment remains disabled. The deliberate Stage 20 Preview is built from the exact current `synsynlele/pipu-path` commit in GitHub Actions and uploaded as a prebuilt Preview directly to the existing Vercel project. The gate is credential-guarded: if `VERCEL_TOKEN` is absent, it exits before any Vercel call.

## Remaining release gates

1. create the one deliberate direct Preview from the exact current Stage 20 commit;
2. run authenticated Builder + provider + admin browser proof with temporary marketplace fixtures;
3. remove fixtures and re-check zero synthetic marketplace rows;
4. remove the one-shot deployment workflow and run cleaned-head CI;
5. intentionally merge PR #36 and verify production on the exact merged source;
6. correct the stale Vercel Git integration so future Git-triggered releases follow `synsynlele/pipu-path` rather than the obsolete repository.
