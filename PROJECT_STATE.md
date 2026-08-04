# PipuPath project state

**Current stage:** Stage 9 — Selective Project Portfolio

**Stage status:** IN PROGRESS

**Completed stages:** Stage 0, Stage 1, Stage 2, Stage 3, Stage 4,
Stage 5, Stage 6, Stage 7 and Stage 8

**Current Git baseline:** `agent/stage9-selective-project-portfolio` at the
Stage 9 contract commit, stacked on the verified Stage 8 closure
`ea129d141458e1916b5eadd129482a6bc3706747`

**Review surface:** Stage 9 draft pull request to be opened against
`agent/stage8-builder-project-mvp`

**Infrastructure:** authorised disposable non-production Supabase staging
`kvjcswnmhwegpakbtvlh`; Stage 9 matching Vercel Preview pending

**Last verified:** 2026-08-04

## Verified starting point

Stage 8 is complete. It turns one completed, evidence-backed HQLS Quest into
one private Builder Project with exactly three ordered milestones and
append-only proof updates. The verified Stage 8 branch passed formatting,
zero-warning lint, strict TypeScript, 85 unit tests, 65 structural/integration
checks, coverage thresholds, production build and authenticated staging E2E.

Stage 9 starts from the exact Stage 8 closure commit. No Stage 8 data,
security boundary, private evidence or lifecycle rule may be weakened.

## Stage 9 contract

Stage 9 introduces one narrow public capability: a Builder may selectively
publish one completed Project as a truthful public proof of work.

Publication must be:

- available only for an owned completed Project with all three milestones
  completed;
- explicit and consent-driven;
- based only on public-safe fields chosen by the Builder;
- isolated from private Quest evidence, Nortnspoil reflections and raw Project
  updates;
- previewable before publication;
- addressable through a stable public slug;
- withdrawable without deleting private Project history; and
- recoverable after refresh on desktop and mobile.

The Stage 9 ADR is authoritative for the complete data, privacy, experience and
non-goal boundary.

## Required implementation proof

Stage 9 cannot be marked complete until all of the following pass on the exact
final branch head:

- database migration and generated-schema reconciliation;
- owner-only authenticated portfolio lifecycle writes;
- anonymous reads limited to currently published public-safe records;
- publication and withdrawal transition enforcement;
- no exposure of private evidence, reflections, updates or internal IDs;
- polished preparation, preview and public proof pages;
- refresh-safe and narrow-screen behavior;
- structural security and domain tests;
- strict repository validation and production build;
- matching Vercel Preview; and
- authenticated staging E2E covering publish, anonymous read and withdrawal.

## Explicit boundary

Stage 9 does not introduce Builder directories, search, follows, likes,
comments, messaging, rankings, collaboration, mentor assessment, team Projects,
opportunity matching, funding, employment or marketplace behavior.

Work stops after selective Project publication is fully verified.

## Known technical debt carried forward

- Resolve recorded development-toolchain dependency advisories when compatible
  patched dependency lines are available.
- Replace the Stage 2 in-process rate limiter before production.
- Complete legal, privacy, retention and child-safeguarding review.
- Optimise CI browser installation and build caching without weakening gates.
- Consolidate the isolated Stage 7/8 Supabase adapters into the canonical
  generated database client during a dedicated maintenance slice.

## Reproduction baseline

```sh
npm ci
npm run validate
npm run test:e2e
```
