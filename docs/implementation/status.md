# Implementation status

**Current stage:** Stage 18 — Capability Verification  
**Stage status:** Release candidate — final exact-head browser/release gates in progress  
**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API  
**Last updated:** 2026-08-18

| Stage | Status | Evidence |
| --- | --- | --- |
| 0 — Governance and architecture | Complete / released | Constitution, boundaries, ADRs and implementation discipline |
| 1 — Engineering foundation | Complete / released | Runtime, design system, config, logging, tests and CI |
| 2 — Identity and access | Complete / released | Auth, private identity, consent, recovery and RLS |
| 3 — Discovery | Complete / released | Fifteen-question evidence, review and persistence |
| 4 — Human Potential Profile | Complete / released | Private synthesis, feedback and provenance |
| 5 — Practical Mission | Complete / released | Generation, refinement, activation and recovery |
| 6 — Practical Builder Journey | Complete / released | Ordered milestones, activation and recovery |
| 7 — HQLS Quest Execution | Complete / released | Action, evidence, Nortnspoil reflection, XP and progression |
| 8 — Builder Project MVP | Complete / released | Quest-linked Project and proof-backed milestones |
| 9 — Selective Project Portfolio | Complete / released | Consent, safe projection, publish, withdraw and republish |
| 10 — MVP Launch Readiness | Complete / released | Production-aligned shell, OAuth hardening and release operations |
| 11 — Connect + Growth Cycles | Complete / released | Adult-safe discovery, requests, accepted network, contact consent, blocking/reporting and renewable Journey cycles |
| 12 — Economic Pathways MVP | Complete / released | Possible Paths, strength-to-value guidance, path selection, 30-Day Pathway and First Value Challenge integration |
| 13 — KHP-OS Institutional Cohort Bridge | PipuPath boundary verified | Privacy-thresholded cohort bridge live; final real cross-product pairing remains outstanding |
| 14 — Retention Intelligence Foundation | Complete / released | Mission Control, private feature telemetry and admin authorization/audit |
| 15 — Builder Collaboration MVP | Complete / released | Structured collaboration, contribution evidence, mutual completion and safeguarding |
| 16 — Living Builder Profile | Complete / released | Private versioned evidence profile and deterministic capability progression |
| 17 — AI Personal Builder Guide | Complete / released | Bounded evidence-aware Guide with production verification |
| 18 — Capability Verification | Release candidate | Database security and full rollback lifecycle verified; final Preview/release gates pending |
| 19 — Institution Workspace | Next | Not started; begins only after Stage 18 release |
| 20 — Opportunity Marketplace | Planned | Existing released Curated Opportunity MVP is preserved as the Stage 20 seed |
| 21 — Builder Passport/API | Planned | Portable evidence/credential and interoperability layer |

## Roadmap correction

The repository previously released a Curated Opportunity MVP under the label “Stage 18.” That production work remains valid and is not removed. The authoritative product roadmap now classifies it as an early **Stage 20 Opportunity Marketplace seed**. The missing Stage 18 Capability Verification trust layer is being restored before Stage 19.

## Stage 18 candidate evidence

- `/profile/verification` is private and protected by the authenticated `/profile` route boundary.
- Verification can only be requested from exact `mutual_collaboration` evidence on the Builder's active Living Builder Profile claim.
- The verifier is derived from the exact completed collaboration rather than user-selected arbitrarily.
- Request and response require current adult Connect eligibility, no block and a still-accepted Builder relationship.
- Confirmed verification is human confirmation of observed work, not a PipuPath certification, star rating, endorsement or public popularity signal.
- Stage 18 records exact claim/evidence/source provenance and retains lifecycle history through decline, withdrawal and revocation.
- RLS and grants deny direct browser table access; authenticated interaction occurs only through bounded RPCs.
- Rollback database proof passed request → confirmation → revocation and relationship-break rejection with zero synthetic data left behind.
- Generated live Supabase types contain the Stage 18 verification table, enum types and all five public RPCs.
- Repository validation passed before final migration filename/status reconciliation with 237 unit tests plus integration, coverage and production build.

## Remaining release gate

1. Run exact-head `npm run validate` after this reconciliation.
2. Enable one deliberate Vercel Preview and run the permanent Stage 18 E2E proof.
3. Remove any temporary Preview-enabling release control if used.
4. Merge PR #34 intentionally.
5. Verify merged-main CI and production Vercel health.

No Institution Workspace code is permitted inside the Stage 18 PR.
