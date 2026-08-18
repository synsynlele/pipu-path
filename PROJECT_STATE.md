# PipuPath project state

**Current stage:** Stage 18 — Capability Verification (corrective roadmap release)

**Stage status:** RELEASE CANDIDATE — DATABASE, EXACT-HEAD VALIDATION, VERCEL PREVIEW AND AUTHENTICATED BROWSER PROOF VERIFIED; MERGE/PRODUCTION GATES REMAIN

**Released product baseline:** Stages 0–17 are released. The already-released Curated Opportunity implementation remains in production and is now treated as an early Stage 20 Opportunity Marketplace seed rather than the authoritative Stage 18 definition.

**Current `main` baseline:** `c4c13f69fa853a61899ac9b6ff28b7ed97217503`

**Review surface:** PR #34 — `agent/stage-18-capability-verification-corrective`

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`. Corrective Stage 18 migrations are live as `20260818092629_stage_18_capability_verification_corrective` and `20260818092651_harden_stage_18_capability_verification_workspace`.

**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API.

**Last updated:** 2026-08-18

## Product loop

PipuPath currently moves a Builder through:

`Discovery → Human Potential Profile → Possible Paths → Practical Mission → Journey → HQLS Quests + Evidence → Builder Project → reflection → Portfolio / Connect → structured collaboration → Living Builder Profile → AI Personal Builder Guide → capability verification → larger developmental opportunity`

The released Curated Opportunity surface remains valid product work. Stage 20 will extend and formally own that opportunity layer; it is not being rolled back or duplicated.

## Stage 18 — Capability Verification

Stage 18 adds private, evidence-bound human confirmation on top of the Living Builder Profile.

A verification is not a rating, endorsement, popularity signal or generic recommendation. A Builder can request confirmation only for a capability tied to exact completed collaboration evidence, and the verifier must be the actual partner from that collaboration.

The release candidate includes:

- private `/profile/verification` workspace;
- exact claim, evidence and completed-collaboration provenance;
- actual-collaborator-only verification;
- current Connect eligibility, accepted relationship and block checks at request/response time;
- pending, confirmed, declined, withdrawn and revoked lifecycle states;
- stable historical provenance across Living Builder Profile refreshes;
- safe Builder/verifier projection without raw HPP, reflection, private project or contact fields;
- privacy-safe verification telemetry;
- no public badges, ratings, unrestricted messaging, institution roles or marketplace changes.

## Verified Stage 18 evidence

- Full repository validation passed on implementation head `81ddb51f08d94efca3bf891c9937f710a3a13bbf`, and again after roadmap/migration reconciliation on `eebb2fe8ee39fab41f411800503b2f3e052d4f32` and deliberate Preview head `2a770b3d3cc958e78e06c9287e8e910ba2683b42`.
- Validation includes formatting, zero-warning lint, strict TypeScript, 237 unit tests, structural/integration checks, coverage thresholds and production build.
- Supabase RLS is enabled on `builder_capability_verifications`.
- `anon` and `authenticated` have no direct table select/insert/update grants; service-role access remains server-side.
- Only the five intended public Stage 18 RPCs are executable by authenticated users; the private relationship helper is not browser-executable.
- A rollback-only two-person lifecycle proof passed request, duplicate rejection, unrelated-user rejection, collaborator confirmation, safe workspace projection, revocation, removed-relationship suppression and response rejection after connection removal.
- The rollback proof left zero synthetic verification, collaboration and Living Profile rows.
- Generated Supabase types confirm the Stage 18 table, enums and RPC signatures are live. The Stage 18 DAL intentionally remains on the repository's existing untyped-RPC adapter boundary; no claim is made that the tracked generated type file was regenerated.
- Deliberate Vercel Preview commit `2a770b3d3cc958e78e06c9287e8e910ba2683b42` received a successful matching Vercel deployment.
- Preview proof run `32127540044`, job `95681332511`, resolved that exact Preview and passed 2/2 Chromium checks: anonymous route denial and authenticated private capability-verification workspace rendering with raw private field names excluded.

## Remaining Stage 18 release gate

Stage 18 must not be called released until:

1. the final cleaned PR head passes `npm run validate`;
2. PR #34 is intentionally merged;
3. merged-main CI passes; and
4. the production Vercel deployment is confirmed healthy.

No Stage 19 product scope enters this PR. After Stage 18 releases, the next implementation stage is **Stage 19 — Institution Workspace**.
