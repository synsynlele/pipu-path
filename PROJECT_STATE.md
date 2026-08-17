# PipuPath project state

**Current stage:** Stage 16 — Living Builder Profile

**Stage status:** RELEASE CANDIDATE — STAGING VERIFIED, AUTHENTICATED PREVIEW PENDING

**Released product stages:** Stage 0 through Stage 15

**Current `main` baseline:** `496d558047fe735317eed6cb73e45b23b5feaa82`

**Stage 15 release:** PR #28, squash-merged and production-verified on 2026-08-17

**Review surface:** GitHub pull request #29

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`. Stage 15 is live. Stage 16 migration `20260817191000_stage_16_living_builder_profile` is applied and behaviorally verified. Authenticated Preview verification remains the next release gate.

**Last updated:** 2026-08-17

## Released operating loop

PipuPath currently moves a Builder through:

`Discovery → Human Potential Profile → Possible Paths → Choose a Path → Practical Mission → 30-Day Pathway / Journey → HQLS Quests + Evidence → First Value Challenge / Builder Project → reflection → Portfolio / Connect → structured collaboration → next growth cycle`

Stage 15 is released on `main`. Its structured Builder Collaboration layer passed authorised Supabase verification, authenticated Preview proof, exact-head validation, merged-main CI and production Vercel health.

Stage 13's privacy-thresholded PipuPath cohort boundary remains present in production, while the final real KHP-OS → PipuPath cross-product pairing remains a separate outstanding integration gate.

## Stage 16 release candidate

Stage 16 adds a private Living Builder Profile that distinguishes Discovery potential from demonstrated action.

The candidate adds:

- `/profile` as the primary private Profile destination while preserving the original Human Potential Profile as the Discovery baseline;
- versioned Builder Profile snapshots rather than destructive overwrite;
- capability evidence from completed HQLS Quests only when evidence and Nortnspoil reflection exist;
- stronger capability evidence from completed Builder Projects, plus Project execution;
- mutually verified Collaboration evidence only after both participants contribute and confirm completion;
- deterministic capability states: `practicing`, `demonstrated` and `repeatedly_demonstrated`;
- exact private evidence links behind every capability claim;
- Builder feedback: `accurate`, `needs_context` or `not_representative`;
- no AI identity mutation and no automatic publication.

## Stage 16 authorised staging verification

- Migration `20260817191000_stage_16_living_builder_profile` is applied.
- All four Stage 16 persistence tables have RLS enabled.
- `anon` and `authenticated` have no direct table select, insert or update privileges.
- Authenticated users have execute access only to the allow-listed Stage 16 profile, refresh and feedback RPCs.
- A rollback-only authenticated database proof created version 1, derived capability claims from completed action, verified a Project execution claim and exact `/projects/...` evidence link, recorded Builder feedback, created version 2 and preserved two-version history.
- The proof asserted that raw Project, Quest/reflection and contact-field names were absent from the safe profile projection.
- The proof transaction rolled back completely; cleanup checks returned zero Stage 16 profile versions, claims and feedback for the verification fixture.
- Generated Supabase TypeScript output confirms the Stage 16 tables, enums and RPC signatures exist in the live schema.

## Stage 16 evidence rule

The existing Journey milestone `capabilities_to_develop` is the vocabulary source for Quest and Project capability evidence. Stage 16 does not perform free-form AI classification. Completed Quests carry strength 1. Completed Projects carry strength 2 for their source milestone capabilities and strength 2 for Project execution. Mutually completed collaboration carries strength 2 for Collaboration.

Progression is conservative and reproducible:

- one strength point → Practicing;
- at least two strength points → Demonstrated;
- at least four strength points across at least two evidence records → Repeatedly demonstrated.

These are product evidence rules, not psychological scores or deterministic labels.

## Stage 16 non-goals

Stage 16 does not add a generic chatbot, employability score, personality diagnosis, public capability ranking, automatic portfolio publication, mentor matching or automatic Human Potential Profile mutation.

## Release gate

Stage 16 must not be called released until:

1. authenticated Preview verification proves the private profile and evidence projection boundary;
2. the exact approved PR head passes the complete repository validator and matching Vercel check;
3. PR #29 is merged intentionally;
4. merged-main CI passes; and
5. the production Vercel deployment is confirmed healthy.

Stage 17 — AI Personal Builder Guide remains deferred until Stage 16 is released and explicitly authorised.
