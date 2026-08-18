# PipuPath project state

**Current stage:** Stage 19 — Institution Workspace

**Stage status:** RELEASE CANDIDATE — DATABASE, SECURITY, LIFECYCLE, EXACT-PREVIEW AND AUTHENTICATED BROWSER PROOF VERIFIED; FINAL CLEAN-HEAD/MERGE/PRODUCTION GATES REMAIN

**Released product baseline:** Stages 0–18 are released. The Curated Opportunity implementation already in production is preserved as an early Stage 20 Opportunity Marketplace seed.

**Current `main` baseline:** `5ef298e68b1a75541e1e1e9cd9248f6751469d9f`

**Stage 18 release:** PR #34 squash-merged on 2026-08-18. The merged tree exactly matches the final validated PR tree and the matching production Vercel deployment is green.

**Review surface:** PR #35 — `agent/stage-19-institution-workspace`

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`. Stage 19 is live in Supabase through migrations `20260818113113_stage_19_institution_workspace`, `20260818113125_harden_stage_19_workspace_audit_volatility`, `20260818114223_fix_stage_19_workspace_provisioning_ambiguity` and `20260818114754_fix_stage_19_verification_request_ambiguity`.

**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API.

**Last updated:** 2026-08-18

## Product loop

`Discovery → Human Potential Profile → Possible Paths → Practical Mission → Journey → HQLS Quests + Evidence → Builder Project → reflection → Portfolio / Connect → structured collaboration → Living Builder Profile → AI Personal Builder Guide → Capability Verification → Institution / Opportunity deployment`

## Stage 19 — Institution Workspace

Stage 19 creates a controlled institution-facing surface that can use PipuPath development signals without weakening Builder ownership or privacy.

The release candidate includes:

- explicit Institution Workspaces bound one-to-one to existing Stage 13 cohorts;
- platform-admin-provisioned `owner`, `verifier` and `analyst` roles;
- private `/institution` and `/admin/institutions` surfaces;
- aggregate-only cohort intelligence reusing the Stage 13 minimum-reporting boundary;
- Builder-authorised institution confirmation of one exact Living Builder Profile capability/evidence item;
- institution verification history and controls integrated into `/profile/verification`;
- pending, confirmed, declined, withdrawn and revoked verification lifecycle;
- automatic closure of pending institution shares when Stage 13 cohort consent is withdrawn;
- institution and identity audit trails plus privacy-safe product telemetry;
- no learner directory, rankings, ratings, public badges, direct messaging, SIS/LMS, fees, grading, attendance, timetable or marketplace expansion.

## Locked privacy model

- Cohort membership alone grants no learner-level profile access.
- Aggregate analytics reuse the Stage 13 minimum-reporting boundary and never return learner IDs.
- Institution verification is per-request, Builder-initiated and evidence-specific.
- Institution verifiers see only the bounded verification projection, not Discovery answers, HPP prose, pathway detail, mission/reflection prose, raw private Project fields, contacts, network state or unrelated capabilities.
- `analyst` can access thresholded aggregate intelligence but cannot access the verification queue or decide verification requests.
- `verifier` can access Builder-shared verification evidence but cannot access cohort aggregate intelligence.
- Institution confirmation means human confirmation of the exact shared evidence; it is not a PipuPath certification, score, rating or popularity signal.

## Verified Stage 19 evidence

- Clean pre-Preview branch head `bcaff37aafd034d2b6e70d3c8c9d7dfac8a9804b` passed complete `npm run validate` in CI run `32134797075`.
- Stage 19 RLS is enabled on all four institution tables, with no direct `public`, `anon` or `authenticated` table access.
- Authenticated execution is limited to the bounded Stage 19 Builder/institution RPCs; platform provisioning RPCs remain service-role only.
- Live database proof found and fixed two PL/pgSQL variable/column ambiguities before release: workspace provisioning and Builder verification request workspace resolution.
- A rollback-only lifecycle proof passed owner/analyst/verifier role boundaries, Stage 13 privacy-threshold suppression, exact evidence request, duplicate rejection, analyst decision denial, verifier confirmation, Builder revocation, Builder withdrawal and automatic pending-share closure on cohort withdrawal.
- The rollback proof and release fixture cleanup left zero synthetic institution workspaces, members, verifications and cohort memberships.
- Generated live Supabase types confirm the Stage 19 tables, enums and RPC signatures. The tracked repository type file is not claimed as regenerated.
- Deliberate Preview head `18b1c454f671d548716cfe54f7eb7a25226f63cb` received a successful matching Vercel Preview.
- Preview proof run `32135152478`, job `95704613239`, resolved the matching Preview and passed 2/2 Chromium checks: anonymous denial and authenticated institution/private Builder-share rendering with protected raw field names excluded.
- The temporary Preview workflow and database fixture were removed immediately after proof, and branch-specific Vercel Preview suppression was restored.

## Remaining Stage 19 release gate

Stage 19 must not be called released until:

1. the final cleaned PR head passes exact-head `npm run validate`;
2. PR #35 is intentionally squash-merged;
3. merged-main CI passes; and
4. the production Vercel deployment is confirmed healthy.

No Stage 20 implementation enters PR #35. After Stage 19 releases, the next implementation stage is **Stage 20 — Opportunity Marketplace**, extending the already-released Curated Opportunity seed rather than rebuilding it.
