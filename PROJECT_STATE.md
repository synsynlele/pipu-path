# PipuPath project state

**Current stage:** Stage 17 — AI Personal Builder Guide

**Stage status:** RELEASE CANDIDATE — ALL PRE-MERGE GATES VERIFIED

**Released product stages:** Stage 0 through Stage 16

**Current `main` baseline:** `b6dc00458ca3bf264e40f1ce92551b50f9a5708f`

**Stage 16 release:** PR #29, squash-merged and production-verified on 2026-08-17

**Review surface:** GitHub pull request #30

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`. Stage 16 is live. Stage 17 migration `stage_17_ai_personal_builder_guide` is applied under Supabase registry version `20260817192833` from repository source migration `20260817200000_stage_17_ai_personal_builder_guide.sql`. Database security/persistence checks, authenticated Preview proof, repository validation and matching Vercel candidate checks have passed.

**Last updated:** 2026-08-17

## Released operating loop

PipuPath currently moves a Builder through:

`Discovery → Human Potential Profile → Possible Paths → Choose a Path → Practical Mission → 30-Day Pathway / Journey → HQLS Quests + Evidence → First Value Challenge / Builder Project → reflection → Portfolio / Connect → structured collaboration → Living Builder Profile → next growth cycle`

Stage 16 is released on `main`. The Living Builder Profile distinguishes Discovery potential from demonstrated action using private, versioned, deterministic evidence from completed Quests, Projects and mutually completed collaboration. Its migration, database lifecycle proof, authenticated Preview proof, exact-head validation, merged-main CI and production Vercel health all passed.

Stage 13's privacy-thresholded PipuPath cohort boundary remains present in production, while the final real KHP-OS → PipuPath cross-product pairing remains a separate outstanding integration gate.

## Stage 17 release candidate

Stage 17 adds a private Personal Builder Guide that turns existing PipuPath evidence into bounded next-step guidance without becoming a generic chatbot.

The candidate adds:

- `/guide` as a private evidence-aware guidance workspace;
- four structured questions only: `next_move`, `improvement`, `missing_evidence` and `weekly_focus`;
- context from the Human Potential Profile baseline, Living Builder Profile, selected Economic Pathway and current Mission/Journey/Quest/Project state;
- OpenAI structured output through the existing server-only provider boundary;
- deterministic evidence-rule fallback when the AI provider is unavailable or its output fails safety validation;
- exact Living Builder Profile claim-ID grounding for evidence observations;
- trusted product destinations only, mapped server-side rather than accepting arbitrary model URLs;
- current `ai_processing` consent and safeguarding checks;
- explicit uncertainty, fixed-identity rejection, income-promise/risky-finance rejection and minor-contact safety rules;
- six-hour reuse for unchanged intent/context and a 12-generation rolling 24-hour limit;
- private Guide run provenance and helpful/not-helpful Builder feedback;
- privacy-safe Guide telemetry;
- a Home entry point without adding the Guide to primary navigation.

## Stage 17 verified evidence

- Complete repository validation passed on implementation commit `ab58ca5b44dc15e1206d532c3c6a6e7ccdf7e30a` in GitHub Actions run `32061598753`.
- Stage 17 persistence is live on the authorised Supabase project with RLS enabled and no direct `anon` or `authenticated` table access.
- A controlled persistence lifecycle check passed and its verification rows were removed.
- A real authenticated Preview request persisted OpenAI-backed `gpt-5-mini` guidance with prompt version `stage17.v1`.
- Preview run `32061593484`, job `95483882748`, passed 2/2 Playwright checks covering anonymous protection and authenticated bounded guidance rendering, next action, uncertainty, feedback controls and exclusion of raw private field names.
- Cleanup candidate `42792fe25bbf8326a733783eb2d7514a1eaa5dfc` received a successful matching Vercel deployment check after the earlier account quota limit cleared.
- The permanent Stage 17 E2E regression spec remains in the repository; the one-time Preview workflow is removed after proof.

## Stage 17 privacy boundary

The Guide provider receives bounded private context. Raw Quest reflections, raw Project narratives, contact details and another Builder's private data are excluded. AI may interpret existing evidence but cannot create, delete or upgrade Living Builder Profile capability claims.

`builder_guide_runs` and `builder_guide_feedback` have RLS enabled and no direct `public`, `anon` or `authenticated` table grants. Trusted server code performs authenticated, user-scoped access. Recommendation bodies are not copied into general product telemetry.

## Stage 17 non-goals

Stage 17 does not add unrestricted chat, psychological diagnosis, therapy, mentor matching, automated opportunity matching, autonomous task execution, public AI advice, employability scores, public capability ranking or automatic Human Potential Profile / Living Builder Profile mutation.

## Remaining release gate

Stage 17 must not be called released until:

1. PR #30 is merged intentionally;
2. merged-main CI passes; and
3. the production Vercel deployment is confirmed healthy.

All implementation, database, authenticated Preview and pre-merge deployment gates have passed. Stage 18 remains deferred until Stage 17 is released and explicitly authorised.
