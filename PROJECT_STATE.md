# PipuPath project state

**Current stage:** Stage 9 — Selective Project Portfolio

**Stage status:** IN PROGRESS

**Completed stages:** Stage 0, Stage 1, Stage 2, Stage 3, Stage 4,
Stage 5, Stage 6, Stage 7 and Stage 8

**Current Git baseline:** `agent/stage9-selective-project-portfolio`, stacked on
the verified Stage 8 closure `ea129d141458e1916b5eadd129482a6bc3706747`

**Review surface:** GitHub pull request #11

**Infrastructure:** authorised disposable non-production Supabase staging
`kvjcswnmhwegpakbtvlh`; matching Stage 9 Vercel Preview pending

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

Stage 9 introduces one narrow public capability: an adult Builder may
selectively publish one completed Project as a truthful public proof of work.

Publication is explicit, previewed, public-safe, version-consented and
withdrawable. The private Project remains authoritative. Anonymous readers use
a controlled public-safe projection that excludes internal identifiers, Quest
evidence, Nortnspoil reflections, raw Project updates, contact details and
private profile fields.

Under-18 Builders retain every private Builder capability. Public publication
for them remains blocked until a dedicated guardian-consent and safeguarding
workflow exists.

## Required implementation proof

Stage 9 cannot be marked complete until all of the following pass on the exact
final branch head:

- database migration and generated-schema reconciliation;
- owner-only authenticated portfolio lifecycle reads and controlled writes;
- adult-only publication safeguards;
- anonymous reads limited to currently published public-safe records;
- draft, preview, publication and withdrawal transition enforcement;
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
- Consolidate the isolated Stage 7/8/9 Supabase adapters into the canonical
  generated database client during a dedicated maintenance slice.

## Reproduction baseline

```sh
npm ci
npm run validate
npm run test:e2e
```
