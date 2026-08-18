# Implementation status

**Current stage:** Stage 21 — Builder Passport/API  
**Stage status:** Release candidate — complete static and live Supabase gates passed; permanent browser proof is being canonicalized before the single deliberate Preview  
**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API  
**Last updated:** 2026-08-18

## Released and verified stages

Stages 0–12 are complete and released. Stage 13 has its PipuPath cohort/privacy boundary verified; the final real KHP-OS cross-product pairing remains a separate integration gate. Stages 14–20 are complete and released in PipuPath.

Stage 19 Institution Workspace was squash-merged through PR #35 as `e2dd36bd6756492c7c89d3cddb5afee762c83082` after complete static, Supabase, authenticated Preview and production verification.

Stage 20 Opportunity Marketplace was squash-merged through PR #36 as `11af1f10c15b82ba7ff7504d5eee9f5a8fadda70`. Final cleaned-head CI #926 passed. Production deployment `dpl_3DU6RMNFRfbbiPLiTn7LiWv4iUb9` reached READY on the exact merge commit, the canonical health endpoint returned `status: ok`, and no production error/fatal logs were found after release.

Stage 21 Builder Passport/API is now a release candidate on `agent/stage-21-builder-passport-api` with draft PR #37.

## Stage 21 authority

The locked authority is `docs/stages/stage-21-builder-passport-api.md`; live database/release evidence is recorded in `docs/stages/stage-21-release-proof.md`.

Stage 21 is a Builder-controlled proof-portability layer, not a public profile directory or formal academic/government/employment credential system.

## Static validation evidence — passed

Complete repository validation passed before Stage 21 database deployment:

- formatting;
- zero-warning lint;
- strict TypeScript;
- 56 unit-test files / 286 unit tests;
- all global coverage thresholds without lowering or excluding any threshold: statements 87.12%, branches 79.25%, functions 88.65%, lines 88.92%;
- 185 integration/regression tests;
- production build.

Focused Stage 21 tests cover cryptographic helpers, authenticated-owner/service-role DAL separation, hash-only share creation, server-action fail-closed behavior, fragment-to-bearer public verification, issuance consent, dependent-proof removal and adult eligibility.

## Supabase release evidence — passed

Authorised project: `kvjcswnmhwegpakbtvlh`.

Live and repository-reconciled Stage 21 migrations:

- `20260818173546_stage_21_builder_passport_api.sql`
- `20260818173828_index_stage_21_builder_passport_foreign_keys.sql`

Verified live:

- RLS enabled across all eight Stage 21 tables;
- no direct `anon` or `authenticated` table CRUD;
- share storage contains only `secret_hash`, not a raw bearer secret;
- owner workspace/issue/share RPCs remain authenticated boundaries;
- public share resolver and durable rate limiter are service-role-only;
- both new composite foreign keys have covering indexes;
- rollback-only lifecycle proof passed issuance, immutable snapshot enforcement, wrong/right bearer behavior, durable rate limiting, live Portfolio integrity downgrade and link removal, share revocation, Passport supersession and Passport revocation;
- post-proof verification shows zero Stage 21 test residue and the borrowed public Portfolio source restored to `published`.

## Stage 21 privacy boundary

Passport snapshots do not silently include Discovery answers, Human Potential Profile prose, reflection prose, private Project fields, private evidence routes, contact details, network state, safeguarding/moderation data, provider application notes, unrelated evidence, hidden scores or rankings.

No permanent public Builder profile, searchable credential registry, government-ID verification, academic credential issuance, employment/income verification, general partner API credentials, OAuth clients, bulk export, webhooks or payments enter Stage 21.

## Deployment control

- Branch: `agent/stage-21-builder-passport-api`.
- Automatic Vercel Preview deployment remains disabled.
- No Stage 21 Preview has been consumed during implementation or the database gate.
- The permanent Playwright release proof now covers anonymous private-route denial, invalid bearer fail-closed behavior, authenticated issuance, one-time share creation, direct API verification, fresh anonymous public verification, share revocation and Passport revocation.
- That E2E file is being canonicalized before one exact-head static CI run and the single deliberate Preview.

## Remaining Stage 21 release gate

1. reconciled release-candidate head passes complete CI with the permanent E2E spec;
2. one deliberate Vercel Preview reaches READY on that exact head;
3. authenticated Builder issuance/share plus anonymous valid/invalid share/API proof passes;
4. all temporary release fixture data/workflows are removed and Preview suppression restored;
5. final cleaned-head CI passes;
6. PR #37 is intentionally squash-merged; and
7. production deployment health is verified on the exact merge commit.
