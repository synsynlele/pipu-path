# Implementation status

**Current stage:** Stage 21 — Builder Passport/API  
**Stage status:** Release candidate — static, live Supabase and corrective authenticated/public Preview gates passed; final clean-head CI, merge and production verification remain  
**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API  
**Last updated:** 2026-08-18

## Released and verified stages

Stages 0–20 are released in PipuPath. Stage 20 Opportunity Marketplace was squash-merged through PR #36 as `11af1f10c15b82ba7ff7504d5eee9f5a8fadda70` and its exact production deployment completed successfully.

Stage 21 Builder Passport/API is the active release candidate on `agent/stage-21-builder-passport-api`, draft PR #37.

## Stage 21 product boundary

The locked authority is `docs/stages/stage-21-builder-passport-api.md`; detailed evidence is in `docs/stages/stage-21-release-proof.md`.

Stage 21 provides Builder-controlled proof portability through immutable selected snapshots, hash-only revocable/expiring shares, a fragment-secret human verification flow and a narrow bearer API. It does not create a public Builder directory or claim government identity, academic credential or employment-verification status.

## Static validation — passed

The final corrected application code passed complete repository validation on head `485f34e4aeb498320fa5b648cbd41be035a7a34d` in CI #1003:

- formatting;
- zero-warning lint;
- strict TypeScript;
- 56 unit-test files / 287 unit tests;
- global coverage thresholds unchanged and green;
- full integration/regression suite;
- production build.

The corrected regression suite includes the exact PostgreSQL/Supabase offset timestamp format that the first Preview exposed.

## Supabase validation — passed

Authorised project: `kvjcswnmhwegpakbtvlh`.

Live and repository-reconciled migrations:

- `20260818173546_stage_21_builder_passport_api.sql`
- `20260818173828_index_stage_21_builder_passport_foreign_keys.sql`

RLS/grants, service-role-only share resolution/rate limiting, hash-only secret storage, FK indexing, immutable snapshot behavior, wrong/right bearer handling, live integrity overlay, revocation and supersession were verified live. The rollback-only DB proof left zero synthetic residue.

## Preview/browser validation — passed

First deliberate Preview `dpl_3J1qNifcBfHK4pJCsiuSUucQ2aFu` reached READY and passed anonymous private-route denial plus invalid bearer denial. Its authenticated Passport workspace exposed a real runtime contract defect: Supabase returned offset-aware timestamps that were rejected by the initial Zod schema.

The timestamp contract was corrected across private and public Passport projections and fully revalidated in CI #1003.

Corrective Preview `dpl_FwvJdLM1ZQT1zcdgLU3zShLGztu7` reached READY from exact source `ecb8f16f027b4ac7e8ae10d458391fc04ac8ee34`. Stage 21 Final Preview Proof run `32170096576` passed the complete Builder/public loop: private-route denial, invalid bearer fail-closed, issuance, one-time share creation, direct API verification, anonymous human verification, private-field exclusion, share revocation and Passport revocation.

## Release cleanup — passed

Preview suppression is restored and the temporary Preview-proof workflow is removed.

The CI Builder fixture is fully restored:

- 0 Passport versions;
- 0 Passport shares;
- 0 Passport audit events;
- 0 release-created rate-limit buckets;
- display name restored to `null`.

## Remaining Stage 21 release gate

1. final clean restored-suppression head passes complete CI;
2. PR #37 is marked ready and intentionally squash-merged;
3. production Vercel is READY on the exact merge SHA;
4. canonical production health and runtime logs are verified.
