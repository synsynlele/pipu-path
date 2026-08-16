# PipuPath project state

**Current stage:** Stage 14 — Living Human Potential Profile

**Stage status:** IMPLEMENTATION CANDIDATE — VALIDATION PENDING

**Completed stages:** Stage 0 through Stage 13

**Last released `main`:** `f8029400d3f20e3d0c89febafe572818ecfb9d23`

**Current implementation branch:** `agent/stage14-living-profile`

**Last updated:** 2026-08-16

## Released foundation through Stage 13

PipuPath now has a complete individual Builder loop plus the first network and institutional bridges:

- Identity, consent and safeguarding;
- 15-question Discovery;
- private evidence-grounded Human Potential Profile;
- Practical Mission;
- renewable Builder Journeys;
- HQLS Quests, evidence, reflection, XP and progression;
- evidence-backed Builder Projects;
- selective public Project Portfolio;
- Stage 10 launch hardening;
- Stage 11 Builder Connect with adult-only opt-in discovery, connection lifecycle, block/report and explicit contact sharing;
- Stage 12 Economic Pathways with Possible Paths, Earn From Your Strengths, path selection and the First Value Challenge; and
- Stage 13 KHP-OS Institutional Cohort Bridge with explicit learner participation and privacy-thresholded aggregate reporting.

The released development loop is now:

`Discovery → Human Potential Profile → Possible Paths → Choose a Path → Practical Mission → 30-Day Pathway → HQLS Quests + Evidence → First Value Challenge → reflection → next Journey cycle`

## Stage 14 implementation candidate

Stage 14 closes the missing compounding loop:

`real-world action + explicit Builder feedback → new private evidence → evolved Human Potential Profile`

The candidate implementation:

- adds `builder_project` and `profile_feedback` as Human Potential evidence source types;
- automatically captures bounded private evidence when a Builder Project is completed;
- automatically captures explicit Builder feedback on prior profile insights, excluding `unsure`;
- backfills existing completed Projects and qualifying feedback without requiring user re-entry;
- preserves the original Discovery evidence baseline while adding the newest longitudinal evidence;
- caps each interpretation snapshot at 100 evidence records;
- keeps the existing immutable Human Potential Profile versioning and provenance model;
- adds a deliberate **Evolve my profile** action only when new evidence exists since the active profile version; and
- gives the AI evolution pass explicit rules for weighing observed project evidence versus first-person feedback.

## Privacy and architecture boundary

Stage 14 does not create a public capability score, a second profile store, a new Journey/Project engine, an institution-facing learner profile, open messaging, opportunity matching or an AI personal agent.

The Human Potential Profile remains private and provisional. Existing AI-processing consent and safeguarding rules remain authoritative.

## Validation required before Stage 14 can be called complete

1. Pass formatting, zero-warning lint and strict TypeScript.
2. Pass unit, integration and coverage gates.
3. Pass the production build.
4. Apply and verify Stage 14 migrations on the authorised Supabase environment without weakening RLS or browser-write boundaries.
5. Verify a completed Builder Project creates exactly one private evidence record.
6. Verify explicit profile feedback creates private evidence and `unsure` does not.
7. Verify a Builder with new evidence can evolve the profile into a new immutable version.
8. Verify a Builder with no new evidence cannot trigger redundant evolution.
9. Verify the matching authenticated Vercel Preview on desktop and mobile.
10. Merge only the exact verified branch head.

## Stage boundary

Do not add unrestricted private messaging, a social feed, follower/like counts, an open opportunity marketplace, payments, income predictions, mentor marketplace, public capability rankings, Builder Passport/API or automated opportunity matching in Stage 14.

Those remain future candidates after the longitudinal evidence loop is proven.
