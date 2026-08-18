# Implementation status

**Current stage:** Stage 19 — Institution Workspace  
**Stage status:** Implementation in progress — architecture locked  
**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API  
**Last updated:** 2026-08-18

## Released and verified stages

Stages 0–12 are complete and released. Stage 13 has its PipuPath cohort/privacy boundary verified; the final real KHP-OS cross-product pairing remains a separate integration gate. Stages 14–18 are complete and released in the PipuPath product.

Stage 18 Capability Verification was squash-merged as `5ef298e68b1a75541e1e1e9cd9248f6751469d9f`. Its final PR tree passed full validation, its database/RLS/lifecycle proof passed, its matching authenticated Vercel Preview proof passed 2/2 checks, and production Vercel is green on the merged commit.

Stage 19 Institution Workspace is now active implementation work.

Stage 20 Opportunity Marketplace remains planned; the already-released Curated Opportunity MVP is its seed rather than duplicate work.

Stage 21 Builder Passport/API remains planned.

## Stage 19 locked scope

- explicit Institution Workspace bound to an existing Stage 13 cohort;
- platform-admin-provisioned institution operator roles: owner, verifier and analyst;
- aggregate-only cohort intelligence using the existing Stage 13 privacy-thresholded server function;
- Builder-authorised, exact-evidence institutional capability verification extending the Stage 18 trust substrate;
- institution verifier identity and workspace provenance on each institutional verification;
- withdrawal/revocation and safeguarding behavior;
- private `/institution` workspace and `/admin/institutions` provisioning surface;
- institution request/history integrated into `/profile/verification`;
- privacy-safe audit and lifecycle telemetry.

## Stage 19 non-goals

No SIS/LMS, attendance, fees, grading, timetables, learner rankings, institutional rankings, broad learner profile browser, direct messaging, private HPP/reflection/raw-evidence access, public badges, payments, marketplace changes or credential API enters this stage.

## Stage 19 next gate

Implement the database/application vertical slice on `agent/stage-19-institution-workspace`, run `npm run validate`, then apply and verify the migration on the authorised Supabase project before the single deliberate Preview release gate.
