# PipuPath project state

**Current stage:** Stage 8 — Builder Project MVP

**Stage status:** COMPLETE

**Completed stages:** Stage 0, Stage 1, Stage 2, Stage 3, Stage 4,
Stage 5, Stage 6, Stage 7 and Stage 8

**Current Git baseline:** `agent/stage8-builder-project-mvp` at the
verified Stage 8 closure, stacked on the proven Stage 7 branch

**Review surface:** GitHub pull request #9 (closure review)

**Infrastructure:** authorised disposable non-production Supabase staging
`kvjcswnmhwegpakbtvlh`; matching Vercel Preview deployment
`dpl_2KU8RfiEgCJ9Uf9K9BqdkvQ5g2tL`

**Last verified:** 2026-08-04

## Stage 8 completion

Stage 8 turns one completed, evidence-backed HQLS Quest into one private
Builder Project. The Project preserves its Mission, Journey and Quest
provenance; defines one reachable useful outcome; and advances through exactly
three ordered execution milestones.

Every Project update is append-only and records real progress, proof and the
next practical action. A milestone completes only through a valid proof update.
Completing a milestone unlocks the next one, and completing the third milestone
completes the Project. PipuPath allows one active Project per Builder.

Migration `202608040018` is applied and verified on disposable staging. The
three Stage 8 tables have RLS with owner-only authenticated reads. Direct
browser table writes are not granted. The two controlled lifecycle RPCs enforce
authentication, ownership, completed-Quest evidence/reflection provenance,
one-active-Project focus, ordered milestone progression and valid state.

GitHub Actions run `30935515692` passed full `validate` and authenticated
`staging-e2e` against the matching Stage 8 Preview. The repository gate passed
formatting, zero-warning lint, strict TypeScript, 85 unit tests, 65
structural/integration checks, coverage thresholds and production build.
Playwright ran 22 cases with one shared approved fixture: 17 passed and five
duplicate full-flow cases were intentionally skipped.

The browser flow created a fresh private Project from completed Quest proof,
completed all three milestones through three durable proof updates, recovered
100% completion after refresh, denied anonymous access and verified the mobile
Project navigation. Database reconciliation confirmed one completed Project,
three completed milestones, three append-only updates and a completion
timestamp.

## Security findings

- Project creation requires an owned completed Quest with evidence and
  Nortnspoil reflection.
- Project records, milestones and updates remain private and owner-readable.
- Anonymous and direct browser table writes are denied.
- Only authenticated, service-role and database-owner roles can execute Stage 8
  lifecycle RPCs.
- One completed Quest may seed only one Project.
- One active Project per Builder and ordered milestone progression are enforced
  in the database.
- Stage 8 creates no public credibility claim from private proof.

## Known technical debt

- Resolve recorded development-toolchain dependency advisories when compatible
  patched dependency lines are available; Stage 8 changed no dependency
  versions.
- Replace the Stage 2 in-process rate limiter before production.
- Complete legal, privacy, retention and child-safeguarding review.
- Optimise CI browser installation and build caching without weakening gates.
- Consolidate the isolated Stage 7/8 Supabase adapters into the canonical
  generated database client during a dedicated type-generation maintenance
  slice.

## Exact next vertical slice

Stage 9 is the exact next boundary and has not started. Public Project
presentation, selective portfolio publishing, Builder discovery, collaboration,
mentor assessment, team Projects, leaderboards, opportunity matching and
external deployment remain outside Stage 8.

## Reproduction

```sh
npm ci
npm run validate
npm run test:e2e
```

Remote proof: GitHub Actions run `30935515692` and Vercel deployment
`dpl_2KU8RfiEgCJ9Uf9K9BqdkvQ5g2tL`.
