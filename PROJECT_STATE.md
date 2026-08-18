# PipuPath project state

**Current stage:** Stage 21 — Builder Passport/API

**Stage status:** ACTIVE — AUTHORITY LOCKED; DOMAIN, DATABASE, APPLICATION AND RELEASE IMPLEMENTATION IN PROGRESS

**Released product baseline:** Stages 0–20 are released.

**Stage 20 release:** PR #36 squash-merged on 2026-08-18 as `11af1f10c15b82ba7ff7504d5eee9f5a8fadda70`. Final cleaned-head CI #926 passed, Supabase security/lifecycle/performance verification passed with zero release-fixture residue, authenticated browser proof passed against the corrective Vercel Preview, and production deployment `dpl_3DU6RMNFRfbbiPLiTn7LiWv4iUb9` reached READY on the exact merge commit. The canonical production health endpoint returned `status: ok` and no production error/fatal logs were found after release.

**Current Stage 21 branch:** `agent/stage-21-builder-passport-api`

**Stage 21 authority:** `docs/stages/stage-21-builder-passport-api.md`

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`; Vercel project `copyartint-2860s-projects/pipu-path` linked to `synsynlele/pipu-path`.

**Deployment control:** automatic Vercel Preview deployment is disabled for `agent/stage-21-builder-passport-api`. Stage 21 uses GitHub CI and Supabase verification until the final deliberate Preview gate.

**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API.

**Last updated:** 2026-08-18

## Product loop

`Discovery → Human Potential Profile → Possible Paths → Practical Mission → Journey → HQLS Quests + Evidence → Builder Project → reflection → Portfolio / Connect → structured collaboration → Living Builder Profile → AI Personal Builder Guide → Capability Verification → Institution / Opportunity deployment → Builder Passport portability`

## Released Stage 19 — Institution Workspace

Stage 19 provides the controlled institution-facing surface for privacy-thresholded cohort intelligence and Builder-authorised institution capability confirmation.

## Released Stage 20 — Opportunity Marketplace

Stage 20 extends the Curated Opportunity seed into a trusted deployment marketplace with:

- platform-controlled provider trust lifecycle;
- provider-scoped opportunity supply with independent review/publication;
- deterministic explainable Builder matching;
- Builder-controlled exact application packets;
- provider access limited to deliberately submitted packets;
- adult/safeguarding boundaries;
- database-enforced provider/listing integrity;
- private-field exclusion from provider projections;
- audited application lifecycle and Builder withdrawal authority.

Stage 20 does not create a Builder directory, open messaging, payments, ranking or automated selection.

## Stage 21 — Builder Passport/API

Stage 21 makes selected proof portable outside PipuPath without converting PipuPath into a public-profile directory or formal credential issuer.

Locked direction:

- private `/passport` workspace;
- immutable versioned Builder Passport snapshots;
- exact Builder-selected capability/evidence/institution/Portfolio projections only;
- explicit preview and issuance consent;
- server-generated high-entropy share secrets stored only as hashes;
- independently revocable and expiring shares;
- fragment-secret human share links so secrets do not enter initial request URLs/logs;
- narrow bearer-authorized machine verification API;
- no Builder/Passport enumeration API;
- live integrity overlay for revoked institution confirmations and withdrawn Portfolio proofs;
- durable privacy-safe access rate limiting/audit;
- adult-only external issuance/sharing for Stage 21.

## Stage 21 non-goals

No permanent public Builder profile, searchable credential registry, government-ID verification, academic credential issuance, employment/income verification, provider/institution Builder search, arbitrary file uploads, blockchain credentials, general partner API keys/OAuth, bulk export, webhooks or payments enter Stage 21.

## Stage 21 release gate

Stage 21 must not be called released until:

1. domain and persistence contracts are complete;
2. exact snapshot selection/issuance/supersession/revocation is database-enforced;
3. share secrets are hash-only at rest and returned once;
4. share expiry/revocation/rate-limit/access-audit boundaries are proven;
5. human and machine verification projections expose only allow-listed fields;
6. live source-integrity changes are surfaced truthfully;
7. full repository validation passes;
8. live Supabase RLS/grant/lifecycle rollback proof passes with zero synthetic residue;
9. one deliberate Vercel Preview passes authenticated Builder plus anonymous valid/invalid share and API proof;
10. Preview machinery is removed, deployment suppression restored, final cleaned-head CI passes;
11. the Stage 21 PR is intentionally merged and production health is verified.
