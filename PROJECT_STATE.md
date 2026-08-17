# PipuPath project state

**Current stage:** Stage 15 — Builder Collaboration MVP

**Stage status:** RELEASE CANDIDATE — STAGING + AUTHENTICATED PREVIEW VERIFIED

**Released product stages:** Stage 0 through Stage 14

**Current `main` baseline:** `752e4f79f9e711126aa66560b8a3ab307079572b`

**Stage 14 release:** PR #27, squash-merged and production-verified on 2026-08-17

**Review surface:** GitHub pull request #28

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`; Stage 15 migrations are live and behaviorally verified. The authenticated Stage 15 Vercel Preview proof passed. Final exact-head repository validation, merge and production health confirmation remain release gates.

**Last updated:** 2026-08-17

## Released operating loop

PipuPath currently moves a Builder through:

`Discovery → Human Potential Profile → Possible Paths → Choose a Path → Practical Mission → 30-Day Pathway / Journey → HQLS Quests + Evidence → First Value Challenge / Builder Project → reflection → Portfolio / Connect → next growth cycle`

Stage 14 added the protected PipuPath Mission Control and privacy-safe product telemetry needed to measure which product surfaces earn repeat use. Its release commit passed merged-main CI and production Vercel deployment checks.

Stage 13's privacy-thresholded PipuPath cohort boundary remains present in production, while the final real KHP-OS → PipuPath cross-product pairing is still a separate outstanding integration gate.

## Stage 15 release candidate

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

## Stage 15 verification evidence

- Migrations `20260817172612_stage_15_builder_collaboration_mvp` and `20260817172635_harden_stage_15_collaboration_safeguarding` are applied to authorised staging.
- Collaboration and contribution tables have RLS enabled and no direct `anon` or `authenticated` table privileges.
- Authenticated RPC boundaries were verified for invitation, response, closure, contribution, mutual completion, state and detail.
- A rollback-only two-actor database proof passed the complete lifecycle from invitation through mutual completion and verified that the first confirmation alone cannot complete collaboration.
- The safe cross-user projection excluded private Project, Quest, reflection, Human Potential Profile, Economic Pathway and contact fields.
- Connection removal and block transitions cancelled unfinished collaboration.
- Safeguarding ineligibility suppressed unfinished cross-user collaboration state.
- The verification transaction rolled back completely, leaving zero test collaborations and contributions.
- Generated Supabase TypeScript reflects the Stage 15 schema.
- The authenticated Vercel Preview proof passed **3/3 Playwright checks** on branch head `6826d2765585f92278dd4672fe0472f53e1ee38f`.
- Preview verification proved anonymous denial, the authenticated structured collaboration surface and the privacy-safe detail projection.
- Synthetic Preview relationship/collaboration data and the temporary fixture username were removed after verification; cleanup checks returned zero remaining synthetic collaboration records.
- The complete repository validator passed on the formatted Stage 15 candidate before final verification documentation/cleanup. The exact final PR head must pass the same validator before merge.

## Stage 15 non-goals

Stage 15 does not add unrestricted direct messaging, feeds, followers, likes, comments, popularity scores, broad communities, payments, escrow, group collaboration, mentor matching, AI ranking or automatic Human Potential Profile changes.

## Immediate release gate

Stage 15 must not be called released until:

1. the exact final PR head passes the complete repository validator;
2. the matching Vercel deployment check is green;
3. PR #28 is merged intentionally;
4. merged-main CI passes; and
5. the production Vercel deployment is confirmed healthy.

After Stage 15, the next locked slice is **Stage 16 — Living Builder Profile**.
