# Stage 13 — Institutional Cohort Bridge

Status: **live PipuPath database verified; cross-product pairing remains before release.**

## Purpose

Stage 13 lets a school connect PipuPath to KHP-OS without changing PipuPath into a school-management product and without exposing learner-level data.

## Consent model

- KHP-OS creates the institutional connection.
- PipuPath generates one school development cohort and a high-entropy learner invitation.
- Learners voluntarily join the cohort while signed in to their own PipuPath account.
- One learner can contribute to only one active institutional cohort at a time.
- Learners may withdraw cohort participation at any time.
- Joining does not change PipuPath profile visibility and does not grant the school access to the learner account.

## Privacy model

The minimum reporting cohort is five active participants. The database aggregate function is the privacy boundary:

- fewer than five active participants → `reportingEligible=false` and every detailed count is zero;
- five or more → only distinct participant counts are returned;
- the function returns one aggregate row and never returns user IDs;
- profile content, pathway details, mission/reflection prose, quest evidence text, project text, contacts and network data are not selected.

## Aggregate contract

The 90-day signal contains only:

- cohort member count;
- active Human Potential Profile participant count;
- explicit path-selection participant count;
- practical quest participant count;
- evidence-backed completed-quest participant count;
- Builder Project participant count;
- completed-project participant count;
- continuation-eligible participant count; and
- participants who progressed beyond Journey cycle 1.

These support four KHP-OS institutional signals: potential direction, capability practice, value creation and development continuity. PipuPath does not compute a school readiness score or rank learners.

## Cross-service trust

- Initial KHP-OS pairing uses a 15-minute one-time secret.
- KHP-OS binds the exact PipuPath cohort UUID.
- Later refreshes use new 15-minute one-time sync secrets.
- No persistent cross-service connector secret is stored in PipuPath.
- PipuPath has no KHP database credentials and KHP-OS has no PipuPath database credentials.

## Authority boundary

PipuPath signals are contextual institutional intelligence. They cannot resolve a KSHC priority, change reassessment state or declare Verified Institutional Improvement.

## Live database verification — 14 August 2026

Applied migration: `20260814205826_stage_13_khpos_school_cohort_bridge.sql`.

Verified against the authorised PipuPath Supabase project:

- Stage 13 tables and functions are live with RLS enabled and direct table access revoked from `anon` and `authenticated`.
- The aggregate function is executable by `service_role` only.
- Four active cohort members produce `reportingEligible=false` and zero across every detailed counter.
- Five active cohort members make reporting eligible.
- Withdrawing one learner immediately drops the cohort below the threshold and restores full suppression.
- Join and withdrawal are authenticated learner operations tied to `auth.uid()`.
- All transaction-scoped test records were rolled back; the live database contains zero Stage 13 cohorts and zero memberships after verification.

## Remaining release gate

1. Perform one real KHP-OS → PipuPath pairing using a controlled test institution.
2. Confirm the paired PipuPath aggregate is accepted by KHP-OS without any learner-level payload crossing the boundary.
3. Confirm application/runtime logs contain no learner-level integration payload.

The current Supabase connection exposes the PipuPath/KSI organisation but not the separate KHP/KSHC Supabase project, so this final cross-product handshake must wait until both sides are addressable in the same execution context.
