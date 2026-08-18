# PipuPath project state

**Current stage:** Stage 19 — Institution Workspace

**Stage status:** IMPLEMENTATION IN PROGRESS — ARCHITECTURE LOCKED; DATABASE/APPLICATION SLICE NEXT

**Released product baseline:** Stages 0–18 are released. The Curated Opportunity implementation already in production is preserved as an early Stage 20 Opportunity Marketplace seed.

**Current `main` baseline:** `5ef298e68b1a75541e1e1e9cd9248f6751469d9f`

**Stage 18 release:** PR #34 squash-merged on 2026-08-18. The merged tree exactly matches the final validated PR tree and the matching production Vercel deployment is green.

**Current branch:** `agent/stage-19-institution-workspace`

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`. Stage 13 cohort privacy boundaries and Stage 18 capability verification are live.

**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API.

**Last updated:** 2026-08-18

## Product loop

`Discovery → Human Potential Profile → Possible Paths → Practical Mission → Journey → HQLS Quests + Evidence → Builder Project → reflection → Portfolio / Connect → structured collaboration → Living Builder Profile → AI Personal Builder Guide → Capability Verification → Institution / Opportunity deployment`

## Stage 19 goal

Create a controlled institution-facing workspace that can use PipuPath development signals without weakening Builder ownership or privacy.

Stage 19 combines:

- explicit institution workspaces and operator roles;
- Stage 13 privacy-thresholded cohort intelligence;
- Builder-authorised institutional capability verification extending Stage 18;
- platform-admin provisioning and auditable role management;
- strict separation between aggregate analytics and individual verification shares.

An institution does not receive a learner browser. Individual identity appears only when the Builder explicitly sends one exact capability/evidence item for verification.

## Locked privacy model

- Cohort membership alone grants no learner-level profile access.
- Aggregate analytics reuse the Stage 13 minimum-reporting boundary and never return learner IDs.
- Institution verification is per-request, Builder-initiated and evidence-specific.
- Institution verifiers see only the bounded verification projection, not Discovery answers, HPP prose, pathway detail, mission/reflection prose, raw evidence, private Project fields, contacts, network state or unrelated capabilities.
- No rankings, ratings, public badges, chat or school-management features enter Stage 19.

## Stage 18 release evidence carried forward

- final PR head `e84788676533f365580a5860b0e885b55b039a78` passed exact-head `npm run validate`;
- deliberate Preview head `2a770b3d3cc958e78e06c9287e8e910ba2683b42` passed full validation and a matching Vercel Preview;
- authenticated Preview proof run `32127540044`, job `95681332511`, passed 2/2 Chromium checks;
- corrective Stage 18 migrations are live as `20260818092629_stage_18_capability_verification_corrective` and `20260818092651_harden_stage_18_capability_verification_workspace`;
- Stage 18 rollback lifecycle/security proof left zero synthetic data;
- production Vercel is green on merged commit `5ef298e68b1a75541e1e1e9cd9248f6751469d9f`.

## Stage 19 next execution gate

1. Implement institution workspace/role persistence and bounded RPCs.
2. Extend Stage 18 verification with institution verifier provenance and Builder consent.
3. Implement platform-admin provisioning and the `/institution` workspace.
4. Extend `/profile/verification` for institution requests/history.
5. Run repository validation before applying the Stage 19 migration.
6. Verify database security and lifecycle in rollback transactions.
7. Run one deliberate authenticated Vercel Preview proof before release.
