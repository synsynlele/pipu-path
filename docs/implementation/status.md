# Implementation status

**Current stage:** Stage 19 — Institution Workspace  
**Stage status:** Release candidate — database/security/lifecycle and authenticated Preview proof verified; final clean-head/merge/production gates remain  
**Authoritative roadmap:** Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API  
**Last updated:** 2026-08-18

## Released and verified stages

Stages 0–12 are complete and released. Stage 13 has its PipuPath cohort/privacy boundary verified; the final real KHP-OS cross-product pairing remains a separate integration gate. Stages 14–18 are complete and released in the PipuPath product.

Stage 18 Capability Verification was squash-merged as `5ef298e68b1a75541e1e1e9cd9248f6751469d9f`. Its final PR tree passed full validation, its database/RLS/lifecycle proof passed, its matching authenticated Vercel Preview proof passed 2/2 checks, and production Vercel is green on the merged commit.

Stage 19 Institution Workspace is the current release candidate.

Stage 20 Opportunity Marketplace remains planned; the already-released Curated Opportunity MVP is its seed rather than duplicate work.

Stage 21 Builder Passport/API remains planned.

## Stage 19 delivered scope

- explicit Institution Workspace bound to an existing Stage 13 cohort;
- platform-admin-provisioned institution operator roles: owner, verifier and analyst;
- aggregate-only cohort intelligence using the existing Stage 13 privacy-thresholded server function;
- Builder-authorised, exact-evidence institutional capability verification extending the Stage 18 trust substrate;
- institution verifier identity and workspace provenance on each institutional verification;
- pending, confirmed, declined, withdrawn and revoked lifecycle plus cohort-withdrawal closure of pending shares;
- private `/institution` workspace and `/admin/institutions` provisioning surface;
- institution request/history integrated into `/profile/verification`;
- privacy-safe audit and lifecycle telemetry;
- permanent Stage 19 E2E regression covering anonymous protection and bounded authenticated institution/Builder surfaces.

## Stage 19 verified evidence

- Supabase migrations are live as `20260818113113_stage_19_institution_workspace`, `20260818113125_harden_stage_19_workspace_audit_volatility`, `20260818114223_fix_stage_19_workspace_provisioning_ambiguity` and `20260818114754_fix_stage_19_verification_request_ambiguity`.
- RLS is enabled on all four institution tables and no direct `public`, `anon` or `authenticated` table grants remain.
- Platform provisioning functions remain service-role only; authenticated execution is limited to the bounded institution/Builder RPCs.
- The audited institution workspace read function is correctly `VOLATILE`.
- Controlled runtime proof found and fixed two PL/pgSQL ambiguity defects before release: provisioning workspace resolution and Builder request workspace resolution.
- Rollback lifecycle proof passed owner/analyst/verifier separation, privacy-threshold aggregate suppression, exact evidence request, duplicate rejection, analyst decision denial, verifier confirmation, Builder revoke/withdraw, and Stage 13 cohort-withdrawal closure of pending institution shares.
- Generated live Supabase types contain the Stage 19 tables, enums and RPC signatures; no claim is made that the tracked repository type file was regenerated.
- Clean pre-Preview branch head `bcaff37aafd034d2b6e70d3c8c9d7dfac8a9804b` passed complete validation in CI run `32134797075`.
- Deliberate Preview head `18b1c454f671d548716cfe54f7eb7a25226f63cb` received a successful matching Vercel Preview.
- Preview proof run `32135152478`, job `95704613239`, passed 2/2 Chromium checks: anonymous `/institution` denial and authenticated Institution Workspace plus Builder institutional-share rendering with protected raw field names excluded.
- Temporary Preview workflow and database fixtures were removed after proof; cleanup confirmed zero synthetic Stage 19 workspace/member/verification/cohort-membership rows remained.
- Branch-specific Vercel Preview suppression is restored after the one deliberate Preview.

## Stage 19 non-goals

No SIS/LMS, attendance, fees, grading, timetables, learner rankings, institutional rankings, broad learner profile browser, direct messaging, private HPP/reflection/raw-evidence access, public badges, payments, marketplace changes or credential API enters this stage.

## Remaining Stage 19 release gate

1. Final cleaned PR head passes exact-head `npm run validate`.
2. PR #35 is intentionally squash-merged.
3. Merged-main CI passes.
4. Production Vercel deployment is confirmed healthy.

No Stage 20 code enters PR #35.
