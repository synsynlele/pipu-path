# Stage 13 — Institutional Cohort Bridge

Status: **candidate implementation on branch; not released until PipuPath database migration and live pairing are verified.**

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

## Validation required before release

1. Apply `20260814211700_stage_13_khpos_school_cohort_bridge.sql` to the authorised PipuPath Supabase project.
2. Regenerate/check linked database types if the project workflow requires it.
3. Run full `npm run validate` and migration/database checks.
4. Perform one real KHP-OS → PipuPath pairing using a test institution.
5. Confirm fewer-than-five suppression and five-member aggregate behaviour against the real database.
6. Confirm withdrawal removes the learner from future aggregate counts.
7. Confirm no learner-level payload appears in KHP-OS or application logs.
