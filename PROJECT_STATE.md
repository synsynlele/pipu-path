# PipuPath project state

**Current stage:** Stage 20 — Opportunity Marketplace

**Stage status:** RELEASE CANDIDATE — PRODUCT, DATABASE, PRIVACY, LIFECYCLE AND AUTHENTICATED BROWSER GATES PASSED; FINAL CLEAN-HEAD CI, MERGE AND PRODUCTION VERIFICATION REMAIN

**Released product baseline:** Stages 0–19 are released. The Curated Opportunity MVP already released in Stage 18 is preserved as the Stage 20 marketplace seed and has been extended rather than rebuilt.

**Stage 19 release:** PR #35 squash-merged on 2026-08-18 as `e2dd36bd6756492c7c89d3cddb5afee762c83082`. Final cleaned-head CI passed, the deliberate authenticated Preview proof passed, and the exact Stage 19 production deployment completed successfully.

**Current Stage 20 branch:** `agent/stage-20-opportunity-marketplace`

**Stage 20 PR:** #36

**Stage 20 authority:** `docs/stages/stage-20-opportunity-marketplace.md`

**Stage 20 release proof:** `docs/stages/stage-20-release-proof.md`

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`. Stage 20 migrations are live through `20260818142148_index_stage_20_marketplace_foreign_keys.sql`. Live RLS/grant/lifecycle/privacy/index proofs passed and all release fixtures were removed after browser verification.

**Deployment control:** Vercel project `copyartint-2860s-projects/pipu-path` is correctly linked to `synsynlele/pipu-path`. Stage 20 branch Preview suppression is restored. Corrective release Preview `dpl_5yFRKsa7FDb5pEkaFfYhjf844Vfi` is READY from exact source commit `82b4cd4cafa5c3e24dfe737806a386d0deddd770`. The corrected authenticated browser suite passed against that same Preview without another deployment.

**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API.

**Last updated:** 2026-08-18

## Product loop

`Discovery → Human Potential Profile → Possible Paths → Practical Mission → Journey → HQLS Quests + Evidence → Builder Project → reflection → Portfolio / Connect → structured collaboration → Living Builder Profile → AI Personal Builder Guide → Capability Verification → Institution / Opportunity deployment`

## Released Stage 19 — Institution Workspace

Stage 19 created the controlled institution-facing surface that can use PipuPath development signals without weakening Builder ownership or privacy.

Released scope includes:

- Institution Workspaces bound one-to-one to Stage 13 cohorts;
- platform-admin-provisioned `owner`, `verifier` and `analyst` roles;
- private `/institution` and `/admin/institutions` surfaces;
- aggregate-only cohort intelligence reusing the Stage 13 minimum-reporting boundary;
- Builder-authorised confirmation of one exact Living Builder Profile capability/evidence item;
- institution verification history and controls inside `/profile/verification`;
- pending, confirmed, declined, withdrawn and revoked lifecycle;
- automatic closure of pending institution shares when Stage 13 cohort consent is withdrawn;
- privacy-safe audit and telemetry boundaries;
- no learner directory, ranking, rating, public badge, direct messaging, SIS/LMS, fees, grading, attendance or timetable expansion.

## Stage 20 — Opportunity Marketplace

Stage 20 turns PipuPath's existing curated opportunity seed into a trusted deployment marketplace rather than an open jobs board.

Implemented and verified:

- trusted provider registry with platform-controlled approval, suspension and revocation;
- approved provider operators can manage their own opportunity drafts while independent PipuPath review/publication remains authoritative;
- deterministic age/geography/path/capability matching and explainable readiness are preserved;
- eligible adult Builders can create an exact, previewable, consented application packet using only selected deployment-safe capability/evidence/portfolio/institution projections;
- providers cannot browse Builders or unrelated private development data;
- application lifecycle covers draft, submitted, viewed, shortlisted, accepted, not-selected and withdrawn states;
- provider/listing integrity is enforced in the database;
- Builder withdrawal authority survives provider/listing closure where lifecycle rules allow it;
- provider application projections exclude internal Builder IDs and private evidence routes;
- all browser table CRUD remains closed behind bounded authenticated RPCs;
- release fixtures were removed after proof, leaving zero synthetic marketplace residue.

## Stage 20 non-goals

No payments, escrow, payroll, fees, bidding, gig marketplace, provider Builder search, open messaging, rankings, automated AI selection/rejection or Stage 21 credential/API work enters this stage.

## Stage 20 release gate

Completed:

1. provider/application persistence, RLS and RPC boundaries implemented and verified;
2. provider self-approval/self-publication and cross-provider application access prevented;
3. Builder application packets limited to explicitly selected projections with adult/safeguarding rules;
4. full repository validation passed on corrected Stage 20 application heads;
5. live Supabase lifecycle/security/performance proof passed with zero synthetic residue;
6. corrective exact-head Vercel Preview reached READY and authenticated Builder/provider/non-admin browser proof passed;
7. temporary Preview machinery removed and deployment suppression restored.

Remaining:

8. final cleaned-head CI passes;
9. PR #36 is intentionally squash-merged; and
10. production deployment health is confirmed.

Stage 21 implementation must not enter PR #36.
