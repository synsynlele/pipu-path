# PipuPath project state

**Current stage:** Stage 7 — HQLS Quest Execution MVP

**Stage status:** COMPLETE

**Completed stages:** Stage 0, Stage 1, Stage 2, Stage 3, Stage 4,
Stage 5, Stage 6 and Stage 7

**Current Git baseline:** `agent/stage7-hqls-quest-execution` at the
verified Stage 7 closure, stacked on the proven Stage 6 branch

**Review surface:** GitHub pull request #8

**Infrastructure:** authorised disposable non-production Supabase staging
`kvjcswnmhwegpakbtvlh`; matching Vercel Preview deployment
`dpl_86KTj6DUaAPJXkPmApTbTcneaNrA`

**Last verified:** 2026-08-04

## Stage 7 completion

Stage 7 turns the active Journey milestone into a private, evidence-based
HQLS execution loop. Gemini generates exactly three validated, ordered
Quests. A Builder starts one Quest, acts in the real world, submits private
evidence, completes a Nortnspoil reflection and receives exactly 50 XP once.
The next Quest or milestone unlocks only after valid completion.

Migrations `202608040016` and `202608040017` are applied and verified on
disposable staging. The five Stage 7 tables have RLS and owner-only reads;
generated persistence remains service-role-only. The `quest-evidence`
Storage bucket is private, owner-folder scoped, image-only and limited to
5 MB. Controlled RPCs enforce authentication, ownership and lifecycle state.

GitHub Actions run `30930702481` passed full `validate` and authenticated
`staging-e2e` against the matching Stage 7 Preview. The repository gate
passed formatting, zero-warning lint, strict TypeScript, 81 unit tests,
53 structural/integration checks, coverage thresholds and production build.
Playwright passed 13 tests with three intentional duplicate full-flow skips.

A fresh live Gemini request completed on the matching Preview. Persisted
verification confirmed exactly three Quests: Quest 1 completed with one
evidence record, one Nortnspoil reflection and one 50-XP transaction;
Quest 2 available; Quest 3 locked. Refresh, anonymous protection and mobile
usability passed.

## Security findings

- Gemini credentials and generated-record persistence remain server-side.
- Anonymous access to private Quest routes and Stage 7 relations is denied.
- Direct browser writes to Quest tables are not granted.
- Evidence text, links, images and reflections remain private.
- XP is append-only and idempotent by unique Quest reference.
- Stage 7 does not infer public credibility from private evidence.

## Known technical debt

- Resolve recorded development-toolchain dependency advisories when
  compatible patched dependency lines are available; Stage 7 changed no
  dependency versions.
- Replace the Stage 2 in-process rate limiter before production.
- Complete legal, privacy, retention and child-safeguarding review.
- Optimise CI browser installation and build caching without weakening gates.

## Exact next vertical slice

Stage 8 is the exact next boundary and has not started. Public evidence,
portfolios, Projects, mentor assessment, team Quests, leaderboards,
opportunity matching and Builder Network sharing remain outside Stage 7.

## Reproduction

```sh
npm ci
npm run validate
npm run test:e2e
```

Remote proof: GitHub Actions run `30930702481` and Vercel deployment
`dpl_86KTj6DUaAPJXkPmApTbTcneaNrA`.
