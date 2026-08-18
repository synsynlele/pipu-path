# Implementation status

**Current stage:** Stage 21 — Builder Passport/API  
**Stage status:** Active — all unit/coverage thresholds are green; one historical Stage 20 compatibility test is being repository-formatted before the complete integration/build gate reruns  
**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API  
**Last updated:** 2026-08-18

## Released and verified stages

Stages 0–12 are complete and released. Stage 13 has its PipuPath cohort/privacy boundary verified; the final real KHP-OS cross-product pairing remains a separate integration gate. Stages 14–20 are complete and released in PipuPath.

Stage 19 Institution Workspace was squash-merged through PR #35 as `e2dd36bd6756492c7c89d3cddb5afee762c83082` after complete static, Supabase, authenticated Preview and production verification.

Stage 20 Opportunity Marketplace was squash-merged through PR #36 as `11af1f10c15b82ba7ff7504d5eee9f5a8fadda70`. Final cleaned-head CI #926 passed. Production deployment `dpl_3DU6RMNFRfbbiPLiTn7LiWv4iUb9` reached READY on the exact merge commit, the canonical health endpoint returned `status: ok`, and no production error/fatal logs were found after release.

Stage 21 Builder Passport/API is now active on `agent/stage-21-builder-passport-api` with draft PR #37.

## Stage 21 authority

The locked authority is `docs/stages/stage-21-builder-passport-api.md`.

Stage 21 is a Builder-controlled proof-portability layer, not a public profile directory or formal academic/government/employment credential system.

Locked implementation boundaries:

- private `/passport` Builder workspace;
- immutable versioned Passport snapshots;
- exact selected deployment-safe capability/evidence/institution/Portfolio projections;
- explicit preview and issuance consent;
- one current issued version, with new issuance superseding the prior version and closing its active shares;
- server-generated high-entropy share secrets stored only as hashes;
- independently revocable, expiring shares;
- human share links using fragment secrets so the secret is absent from the initial HTTP request;
- narrow bearer-authorized read-only verification API;
- no API or page capable of enumerating Builders or Passports;
- live integrity status for revoked institution confirmations and withdrawn Portfolio proofs;
- durable privacy-safe share-resolution rate limiting and access audit;
- adult-only external issuance/sharing in Stage 21.

## Stage 21 privacy exclusions

Passport snapshots must not silently include Discovery answers, Human Potential Profile prose, reflection prose, private Project fields, contact details, network state, safeguarding/moderation data, provider application notes, unrelated evidence, hidden scores or rankings.

No permanent public Builder profile, searchable credential registry, government-ID verification, academic credential issuance, employment/income verification, general partner API credentials, OAuth clients, bulk export, webhooks or payments enter Stage 21.

## Static validation evidence

- Formatting, zero-warning lint and strict TypeScript pass on the implemented Stage 21 surface.
- 56 unit-test files / 286 unit tests pass.
- All global coverage thresholds are green without lowering or excluding any threshold: statements 87.12%, branches 79.25%, functions 88.65%, lines 88.92%.
- Focused Stage 21 tests cover cryptographic helpers, owner/service-role DAL separation, hash-only share creation, server-action fail-closed behavior, fragment-to-bearer public verification, issuance consent, dependent-proof removal and adult eligibility.
- Stage 21's own structural integration suite passes. The remaining integration blocker is an older Stage 20 release assertion that froze retired project-state wording; it has been replaced with the stronger invariant that Stage 20 is released on its exact merge SHA and its Vercel branch remains explicitly disabled.

## Deployment control

- Branch: `agent/stage-21-builder-passport-api`.
- Automatic Vercel Preview deployment is disabled in the branch from its first commit.
- GitHub CI and Supabase verification are the implementation gates.
- A deliberate Preview is reserved until static and database gates are green.

## Stage 21 release gate

Stage 21 remains active until:

1. domain/persistence contracts are complete;
2. snapshot selection, issuance, supersession and revocation are database-enforced;
3. share secrets are hash-only at rest and returned once;
4. expiry, revocation, rate limiting and privacy-safe audit are proven;
5. human/API verification exposes only allow-listed fields;
6. source-integrity changes are surfaced truthfully;
7. full repository validation passes;
8. live Supabase rollback/security/lifecycle proof passes with zero synthetic residue;
9. one deliberate Vercel Preview passes authenticated Builder plus anonymous valid/invalid share/API proof;
10. Preview machinery is removed and final cleaned-head CI passes;
11. the Stage 21 PR is intentionally merged and production health is verified.
