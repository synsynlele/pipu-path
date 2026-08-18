# Implementation status

**Current stage:** Stage 18 — Capability Verification  
**Stage status:** Release candidate — database, Preview and authenticated browser proof verified; merge/production gates remain  
**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API  
**Last updated:** 2026-08-18

## Released and verified stages

Stages 0–12 are complete and released: Governance and architecture, Engineering foundation, Identity and access, Discovery, Human Potential Profile, Practical Mission, Practical Builder Journey, HQLS Quest Execution, Builder Project MVP, Selective Project Portfolio, MVP Launch Readiness, Connect + Growth Cycles and Economic Pathways MVP.

Stage 13 — KHP-OS Institutional Cohort Bridge has its PipuPath privacy-thresholded boundary verified; the final real cross-product pairing remains outstanding.

Stages 14–17 are complete and released: Retention Intelligence Foundation, Builder Collaboration MVP, Living Builder Profile and AI Personal Builder Guide.

Stage 18 — Capability Verification is the current release candidate. Database security, rollback lifecycle, deliberate Vercel Preview and authenticated browser proof are verified; merge and production gates remain.

Stage 19 — Institution Workspace is next and begins only after Stage 18 releases.

Stage 20 — Opportunity Marketplace is planned. The already-released Curated Opportunity MVP is preserved as the Stage 20 seed.

Stage 21 — Builder Passport/API is planned as the portable evidence, credential and interoperability layer.

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
- Full repository validation passed on the deliberate Preview head `2a770b3d3cc958e78e06c9287e8e910ba2683b42` with 237 unit tests plus structural/integration checks, coverage thresholds and production build.
- The matching Vercel Preview succeeded.
- Preview proof run `32127540044`, job `95681332511`, passed 2/2 Chromium checks against that Preview: anonymous denial and authenticated evidence-bound workspace rendering with raw private field names excluded.

## Remaining release gate

1. Remove the temporary Preview-proof workflow and keep ordinary branch preview suppression.
2. Run exact final-head `npm run validate`.
3. Merge PR #34 intentionally.
4. Verify merged-main CI and production Vercel health.

No Institution Workspace code is permitted inside the Stage 18 PR.
