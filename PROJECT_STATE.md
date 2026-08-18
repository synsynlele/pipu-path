# PipuPath project state

**Current stage:** Stage 21 — Builder Passport/API

**Stage status:** ACTIVE — STATIC VALIDATION HAS PASSED FORMAT/LINT/TYPES/255 UNIT TESTS; COVERAGE RESTORATION TESTS ARE BEING CANONICALIZED BEFORE THE NEXT FULL GATE

**Released product baseline:** Stages 0–20 are released.

**Stage 20 release:** PR #36 squash-merged on 2026-08-18 as `11af1f10c15b82ba7ff7504d5eee9f5a8fadda70`. Final cleaned-head CI #926 passed, Supabase security/lifecycle/performance verification passed with zero release-fixture residue, authenticated browser proof passed against the corrective Vercel Preview, and production deployment `dpl_3DU6RMNFRfbbiPLiTn7LiWv4iUb9` reached READY on the exact merge commit. The canonical production health endpoint returned `status: ok` and no production error/fatal logs were found after release.

**Current Stage 21 branch:** `agent/stage-21-builder-passport-api`

**Stage 21 PR:** #37

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

Stage 20 extends the Curated Opportunity seed into a trusted deployment marketplace with platform-controlled provider trust, provider-scoped supply, deterministic explainable matching, exact Builder-controlled application packets, bounded provider visibility and complete release verification.

## Stage 21 — Builder Passport/API

Stage 21 turns selected, already-proven PipuPath evidence into portable proof without creating a public Builder directory or overstating evidence as formal credentials.

Locked and implemented/in-progress boundaries include:

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
- no raw private evidence routes, Discovery answers, HPP prose, reflections, contact data or safeguarding/moderation fields in portable output;
- Builder Passport remains explicitly distinct from government identity, academic credentials and employment verification.

## Current static validation evidence

- Prettier passes on the implemented Stage 21 product surface after repository canonicalization.
- Zero-warning lint passes after moving time-dependent share status outside React render and removing effect-driven share URL state.
- Strict TypeScript passes.
- 51 unit-test files / 255 unit tests passed before the coverage-restoration batch.
- Initial Stage 21 coverage gate exposed untested DAL/action/UI/security code rather than product failures. Thresholds remain unchanged.
- Focused tests now cover Passport cryptographic helpers, owner/service-role DAL boundaries, server-action validation/fail-closed behavior and public fragment-to-bearer verification UI. These tests are being canonicalized before the next full CI run.

## Stage 21 release discipline

1. canonical formatting and complete repository validation must pass before Supabase deployment;
2. Stage 21 migrations must then be applied and reconciled with the live Supabase ledger;
3. RLS, grants, service-role-only resolution, rate limiting, share lifecycle and zero-residue rollback proof must pass live;
4. one deliberate Vercel Preview is allowed only after static and database gates are green;
5. authenticated Builder issuance/share plus public bearer verification must pass against the exact Preview;
6. temporary release fixtures/workflows must be removed;
7. final cleaned-head CI must pass before PR #37 is intentionally merged;
8. production deployment must be verified on the exact merge commit.
