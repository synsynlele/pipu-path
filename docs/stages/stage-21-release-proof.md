# Stage 21 — Builder Passport/API release proof

**Stage:** 21 — Builder Passport/API  
**Status:** Release candidate gates in progress  
**Date:** 2026-08-18

## Static gate — passed before database deployment

Complete repository validation passed on the implemented Stage 21 application surface before the first Stage 21 Supabase migration was applied.

Verified:

- repository formatting;
- zero-warning lint;
- strict TypeScript;
- 56 unit-test files / 286 unit tests;
- global coverage thresholds without lowering or excluding any threshold: statements 87.12%, branches 79.25%, functions 88.65%, lines 88.92%;
- 185 integration/regression tests;
- production build.

Focused Stage 21 tests cover cryptographic share-secret handling, hash-only persistence boundaries, authenticated-owner versus service-role DAL separation, server-action fail-closed behavior, fragment-to-bearer public verification, exact issuance consent, dependent-proof removal and adult eligibility.

## Supabase migration ledger — passed

Authorised project: `kvjcswnmhwegpakbtvlh`.

Live Stage 21 migrations:

- `20260818173546_stage_21_builder_passport_api`
- `20260818173828_index_stage_21_builder_passport_foreign_keys`

The repository migration filenames are reconciled to those exact remote versions.

## Database security boundary — passed

Live verification confirms:

- RLS is enabled on all eight Stage 21 Passport tables;
- `anon` and `authenticated` have no direct table CRUD grants;
- only `service_role` has direct Stage 21 table privileges;
- the share table stores `secret_hash` and has no raw share-secret column;
- Builder workspace/issue/share lifecycle RPCs are executable by `authenticated` and `service_role`, not `anon`;
- `resolve_stage21_passport_share(uuid,text)` is not executable by `anon` or `authenticated` and is executable only by `service_role`;
- `consume_stage21_passport_rate_limit(text,integer,integer)` is not executable by `anon` or `authenticated` and is executable only by `service_role`.

This preserves the intended architecture: the public Next.js verification endpoint is the only browser-facing resolver boundary, and it must pass durable rate limiting before server-only resolution.

## Database performance boundary — passed

The Supabase performance advisor identified two new Stage 21 composite foreign keys without covering indexes. The corrective migration added:

- `builder_passport_evidence_passport_claim_idx`
- `builder_passport_institution_passport_claim_idx`

A direct live catalog check confirms both indexes exist.

## Rollback-only lifecycle proof — passed

A live transaction used the existing non-production adult test Builder `stage_builder_a` and rolled back every write.

The proof verified:

1. private workspace exposes one exact synthetic capability/evidence source and does not expose private `sourceHref`;
2. Passport v1 is issued through the real Stage 21 RPC;
3. selected evidence is snapshotted without the private PipuPath route;
4. snapshot identity fields reject mutation through `PASSPORT_SNAPSHOT_IMMUTABLE`;
5. a share stores only a 64-hex hash;
6. a wrong bearer hash resolves to no Passport;
7. the correct bearer resolves `builder-passport.v1` and increments access count;
8. the durable rate limiter allows two attempts and rejects the third in the configured proof window;
9. an existing published Portfolio source is attached to the rollback snapshot solely to prove live integrity behavior;
10. while the source is published, the resolver marks it current and includes its public proof link;
11. after source withdrawal inside the transaction, the resolver reports `integrity=changed`, marks the proof non-current and returns `proofHref=null`;
12. revoking the share makes the bearer unusable;
13. issuing Passport v2 supersedes v1 and automatically revokes an outstanding v1 share;
14. revoking v2 makes its share unusable;
15. privacy-safe `share_resolved` audit events record current/changed integrity state without bearer material.

The transaction then rolled back.

Post-proof verification confirms:

- 0 Stage 21 Passport versions for the test Builder;
- 0 Stage 21 shares for the test Builder;
- 0 Stage 21 Passport audit events for the test Builder;
- 0 synthetic active Living Builder Profile versions left behind;
- the borrowed Portfolio source is restored to `published`;
- both Stage 21 composite-FK indexes remain present.

## Vercel discipline

Automatic Preview deployment remains disabled for `agent/stage-21-builder-passport-api`. No Stage 21 Preview has been consumed during implementation or the Supabase gate.

The next deployment gate is one deliberate exact-head Preview after the reconciled release-candidate head passes complete CI. The permanent Playwright proof must then verify authenticated issuance/sharing plus anonymous valid/invalid bearer behavior before merge.
