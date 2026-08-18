# PipuPath project state

**Current stage:** Stage 20 — Opportunity Marketplace

**Stage status:** ACTIVE IMPLEMENTATION — PRODUCT/PRIVACY AUTHORITY LOCKED; DATABASE/APPLICATION VERTICAL SLICE NEXT

**Released product baseline:** Stages 0–19 are released. The Curated Opportunity MVP already released in Stage 18 is preserved as the Stage 20 marketplace seed and will be extended rather than rebuilt.

**Stage 19 release:** PR #35 squash-merged on 2026-08-18 as `e2dd36bd6756492c7c89d3cddb5afee762c83082`. Final cleaned-head CI passed, the deliberate authenticated Preview proof passed 2/2 Chromium checks, and the exact Stage 19 production deployment completed successfully.

**Current Stage 20 branch:** `agent/stage-20-opportunity-marketplace`

**Stage 20 authority:** `docs/stages/stage-20-opportunity-marketplace.md`

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`. Stage 19 remains live through migrations `20260818113113_stage_19_institution_workspace`, `20260818113125_harden_stage_19_workspace_audit_volatility`, `20260818114223_fix_stage_19_workspace_provisioning_ambiguity` and `20260818114754_fix_stage_19_verification_request_ambiguity`. Stage 20 has not yet added a production migration.

**Deployment control:** automatic Vercel Preview deployment is disabled for `agent/stage-20-opportunity-marketplace`. GitHub CI and Supabase verification are the development gates; one deliberate Preview is reserved for the final authenticated browser proof.

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

Locked direction:

- create a trusted provider registry with platform-controlled approval/suspension/revocation;
- allow approved provider operators to manage their own opportunity drafts while preserving independent platform review/publication;
- preserve deterministic age/geography/path/capability matching and explain readiness rather than produce hidden employability scores;
- let eligible adult Builders create an exact, previewable, consented application packet using only selected deployment-safe capability/evidence/portfolio/institution projections;
- prevent provider browsing of Builders or unrelated private development data;
- create a durable application lifecycle from draft/submitted through provider decisions and Builder withdrawal;
- feed final deployment outcomes back into future guidance without silently rewriting capability evidence or Human Potential Profile claims.

## Stage 20 non-goals

No payments, escrow, payroll, fees, bidding, gig marketplace, provider Builder search, open messaging, rankings, automated AI selection/rejection or Stage 21 credential/API work enters this stage.

## Stage 20 release gate

Stage 20 is not complete until:

1. provider and application persistence/RLS/RPC boundaries are implemented and verified;
2. provider self-approval/self-publication and cross-provider application access are proven impossible;
3. Builder application packets share only explicitly selected projections and adult/safeguarding rules are enforced;
4. full `npm run validate` passes on the exact implementation head;
5. live Supabase lifecycle/security proof passes with no synthetic residue;
6. exactly one deliberate Vercel Preview passes authenticated Builder, provider and admin browser proof;
7. temporary Preview machinery is removed and deployment suppression restored;
8. final cleaned-head CI passes;
9. the Stage 20 PR is intentionally squash-merged; and
10. production deployment health is confirmed.
