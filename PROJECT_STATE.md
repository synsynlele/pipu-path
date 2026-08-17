# PipuPath project state

**Current stage:** Stage 15 — Builder Collaboration MVP

**Stage status:** IMPLEMENTATION CANDIDATE

**Released product stages:** Stage 0 through Stage 14

**Current `main` baseline:** `752e4f79f9e711126aa66560b8a3ab307079572b`

**Stage 14 release:** PR #27, squash-merged and production-verified on 2026-08-17

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`; Stage 14 is live. Stage 15 database migrations are not yet applied and must pass static validation before authorised staging execution.

**Last updated:** 2026-08-17

## Released operating loop

PipuPath currently moves a Builder through:

`Discovery → Human Potential Profile → Possible Paths → Choose a Path → Practical Mission → 30-Day Pathway / Journey → HQLS Quests + Evidence → First Value Challenge / Builder Project → reflection → Portfolio / Connect → next growth cycle`

Stage 14 added the protected PipuPath Mission Control and privacy-safe product telemetry needed to measure which product surfaces earn repeat use. Its release commit passed merged-main CI and production Vercel deployment checks.

Stage 13's privacy-thresholded PipuPath cohort boundary remains present in production, while the final real KHP-OS → PipuPath cross-product pairing is still a separate outstanding integration gate.

## Stage 15 implementation candidate

Stage 15 turns an accepted Builder connection into structured productive work.

The candidate adds:

- Project-linked collaboration invitations between eligible adult accepted connections;
- a separate accept/decline decision after connection acceptance;
- an allow-listed collaboration projection that exposes the Project title and working agreement but not raw Project, Quest, reflection, profile, pathway or contact data;
- a collaboration workspace based on structured contribution evidence rather than unrestricted messaging;
- durable contribution records with summary, evidence note, optional proof link and next action;
- mutual completion confirmation, requiring each participant to record at least one contribution first;
- automatic cancellation of unfinished collaboration when the accepted connection is closed or either participant blocks the other;
- additional safeguarding hardening when an account becomes ineligible;
- collaboration lifecycle events in the existing private product-event system; and
- Connect-level navigation into collaboration without adding another primary app tab.

## Stage 15 non-goals

Stage 15 does not add unrestricted direct messaging, feeds, followers, likes, comments, popularity scores, broad communities, payments, escrow, group collaboration, mentor matching, AI ranking or automatic Human Potential Profile changes.

## Release gate

Stage 15 must not be called complete until:

1. static unit/integration tests and the complete repository validator pass;
2. Stage 15 migrations are applied and behaviorally verified on authorised staging;
3. generated database types reflect the live schema;
4. the matching authenticated Vercel Preview proves the two-Builder collaboration lifecycle and privacy boundaries;
5. the exact approved PR head is merged intentionally;
6. merged-main CI passes; and
7. the production Vercel deployment is confirmed healthy.

After Stage 15, the next locked slice is **Stage 16 — Living Builder Profile**.
