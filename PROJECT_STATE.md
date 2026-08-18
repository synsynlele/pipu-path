# PipuPath project state

**Current stage:** Stage 21 — Builder Passport/API

**Stage status:** RELEASE CANDIDATE — STATIC, SUPABASE AND CORRECTIVE AUTHENTICATED/PUBLIC PREVIEW GATES PASSED; FINAL CLEAN-HEAD CI, MERGE AND PRODUCTION VERIFICATION REMAIN

**Released product baseline:** Stages 0–20 are released.

**Stage 20 release:** PR #36 squash-merged on 2026-08-18 as `11af1f10c15b82ba7ff7504d5eee9f5a8fadda70`. Final cleaned-head CI #926 passed and production deployment `dpl_3DU6RMNFRfbbiPLiTn7LiWv4iUb9` reached READY on the exact merge commit.

**Current Stage 21 branch:** `agent/stage-21-builder-passport-api`

**Stage 21 PR:** #37

**Stage 21 authority:** `docs/stages/stage-21-builder-passport-api.md`

**Stage 21 release proof:** `docs/stages/stage-21-release-proof.md`

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`; Vercel project `copyartint-2860s-projects/pipu-path` linked to `synsynlele/pipu-path`.

**Deployment control:** automatic Vercel Preview deployment is restored to disabled for `agent/stage-21-builder-passport-api`; temporary Preview-proof workflow is removed.

**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API.

**Last updated:** 2026-08-18

## Product loop

`Discovery → Human Potential Profile → Possible Paths → Practical Mission → Journey → HQLS Quests + Evidence → Builder Project → reflection → Portfolio / Connect → structured collaboration → Living Builder Profile → AI Personal Builder Guide → Capability Verification → Institution / Opportunity deployment → Builder Passport portability`

## Stage 21 — Builder Passport/API

Stage 21 makes selected, already-proven PipuPath evidence portable without creating a public Builder directory or overstating evidence as formal credentials.

Implemented and verified boundaries include:

- private `/passport` workspace and `/passport/preview` exact issuance surface;
- immutable versioned Passport snapshots owned by the Builder;
- exact selected capability/evidence/institution/Portfolio projections only;
- adult-only external issuance/sharing in Stage 21;
- server-generated high-entropy share secrets stored only as hashes;
- revocable and expiring shares;
- public no-index `/passport/share/[shareId]` shell using fragment-secret transfer;
- bearer-authorised `/api/passport/v1/shares/[shareId]` verification API;
- service-role-only share resolution after durable rate limiting;
- live integrity overlay for institution confirmation and Portfolio withdrawal/revocation;
- no raw private evidence routes, Discovery answers, HPP prose, reflections, contact data, network state or safeguarding/moderation fields in portable output;
- Builder Passport explicitly remains distinct from government identity, academic credentials and employment verification.

## Static gate — passed

The corrected Stage 21 application head passed the complete repository gate after the first Preview exposed a timestamp-shape defect:

- formatting;
- zero-warning lint;
- strict TypeScript;
- 56 unit-test files / 287 unit tests;
- all global coverage thresholds without lowering or exclusions;
- Stage 0–21 integration/regression suite;
- production build.

CI #1003 passed on corrected head `485f34e4aeb498320fa5b648cbd41be035a7a34d`. The timestamp regression explicitly accepts Supabase/PostgreSQL offset timestamps such as `2026-08-13T11:44:37.334053+00:00` while rejecting zone-less values.

## Supabase gate — passed

Live and repository-reconciled migrations:

- `20260818173546_stage_21_builder_passport_api.sql`
- `20260818173828_index_stage_21_builder_passport_foreign_keys.sql`

Verified live:

- RLS enabled across all eight Stage 21 tables;
- no direct `anon` or `authenticated` table CRUD;
- share storage contains `secret_hash` only, never the raw bearer secret;
- owner workspace/issue/share RPCs are authenticated boundaries;
- resolver and durable rate limiter are service-role-only;
- covering indexes exist for the Stage 21 composite foreign keys;
- rollback-only lifecycle proof passed issuance, immutable snapshot enforcement, wrong/right bearer behavior, rate limiting, live Portfolio integrity downgrade/link removal, share revocation, Passport supersession and Passport revocation;
- rollback cleanup left zero synthetic Stage 21 residue.

## Preview/browser gate — passed after one real defect correction

First deliberate Preview `dpl_3J1qNifcBfHK4pJCsiuSUucQ2aFu` on `55b6074f25600db7df0ec08e94ea95394bdaade5` reached READY. Anonymous private-route denial and invalid-bearer fail-closed behavior passed, but authenticated `/passport` failed with `PASSPORT_WORKSPACE_INVALID`.

Runtime investigation proved the database was returning valid PostgreSQL offset timestamps while the Stage 21 Zod contract accepted only the stricter UTC form. The contract was corrected systematically for both private workspace and public Passport timestamps and regression-tested against the exact live `+00:00` shape. Full CI #1003 then passed.

Corrective Preview `dpl_FwvJdLM1ZQT1zcdgLU3zShLGztu7` on exact source `ecb8f16f027b4ac7e8ae10d458391fc04ac8ee34` reached READY. Stage 21 Final Preview Proof run `32170096576` passed completely:

- anonymous `/passport` denial;
- invalid bearer API/shell fail-closed behavior;
- authenticated exact Passport issuance;
- one-time hash-backed share creation;
- direct bearer API verification;
- fresh anonymous human verification with the fragment removed from browser history;
- private/internal fields absent from public output;
- share revocation followed by bearer rejection;
- Passport revocation.

All temporary release records were removed afterward. Final verification shows 0 fixture Passport versions, 0 shares, 0 Passport events, 0 release rate-limit buckets, and the CI Builder display name restored to `null`.

## Remaining Stage 21 release gate

1. final restored-suppression PR head passes complete repository CI;
2. PR #37 is intentionally squash-merged;
3. production Vercel reaches READY on the exact merge commit;
4. canonical production health and runtime errors are verified.

Stage 22 work must not enter PR #37. The next roadmap stage must be determined from the repository/product roadmap after Stage 21 is released rather than invented in advance.
