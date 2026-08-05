# Implementation status

**Current stage:** Stage 9 — Selective Project Portfolio complete  
**Last verified:** 2026-08-05  
**Next boundary:** Stage 10 — not started

| Stage                           | Status   | Evidence                                                                        |
| ------------------------------- | -------- | ------------------------------------------------------------------------------- |
| 0 — Governance and architecture | Complete | Constitution, stage boundaries, quality attributes, ADRs and ledger             |
| 1 — Engineering foundation      | Complete | Application foundation, design system, config, logging, tests and CI            |
| 2 — Identity and access         | Complete | Database/RLS/email/recovery/OAuth and staging browser E2E pass                  |
| 3 — Discovery                   | Complete | Persistent evidence, review, RLS/API verification and browser E2E pass          |
| 4 — Human Potential Profile     | Complete | Live Gemini, private persistence, feedback, refresh, RLS and staging CI pass    |
| 5 — Practical Mission           | Complete | Live Gemini, refinement, activation, refresh, RLS and staging CI pass           |
| 6 — Practical Builder Journey   | Complete | Live Gemini, milestones, activation, refresh, RLS and staging CI pass           |
| 7 — HQLS Quest Execution        | Complete | Action, evidence, reflection, XP, progression and staging CI pass               |
| 8 — Builder Project MVP         | Complete | Quest-linked Project, milestones, proof updates, completion and staging CI pass |
| 9 — Selective Project Portfolio | Complete | Consent, safe projection, publish, HTTP 404 withdrawal, republish and E2E pass  |

## Stage 9 completion

Stage 9 converts one completed private Project into one selective public proof
while preserving PipuPath's evidence and safeguarding boundaries.

The Builder uses a private Portfolio Studio to prepare public-safe copy, review
an exact preview, explicitly consent to publication, publish through a stable
slug, withdraw the proof and republish the same record. Publishing is adult-only
in this MVP and unavailable to safeguarding-flagged accounts.

Migration `202608040019_stage_9_selective_project_portfolio.sql` is applied and
verified on authorised disposable staging. The private table has RLS and an
owner-read policy. Authenticated users receive SELECT only and lifecycle writes
use controlled RPCs. Anonymous access is limited to an eleven-field public-safe
projection that excludes Quest evidence, Nortnspoil reflections, raw Project
updates, contact information, private profile fields and internal identifiers.

Unknown or withdrawn public slugs are checked before React streaming and return
a real HTTP 404. The public page repeats the live-state check and withdrawal
invalidates the exact slug as defence in depth.

## Final verification

- Verified implementation commit:
  `4627036f03844237c28011268c413906f4180bf5`
- GitHub Actions run `30993330779`: `validate` passed and `staging-e2e` passed.
- Repository gate: formatting, zero-warning ESLint, strict TypeScript, 91 unit
  tests, 77 structural/integration checks, coverage thresholds and production
  build passed.
- Browser matrix: 21 passed, 7 intentional duplicate-flow skips.
- Matching Vercel Preview:
  `dpl_EP4S38KVbzmf6oG1T15At7XsUXZ3`.
- Live flow: publish → anonymous 200 → withdraw → anonymous 404 → republish the
  same slug → anonymous 200.
- Runtime logs recorded the stable slug transitioning `200 → 404 → 200` with
  cache misses on the published responses and middleware-level 404 enforcement
  while withdrawn.
- Final staging reconciliation confirmed the portfolio is published and the
  public RPC returns only the approved eleven fields.
- Anonymous private Portfolio access and mobile Portfolio/public-proof behavior
  passed.
- Production resources were not touched.

## Stage 8 completion

Stage 8 converts one owned completed HQLS Quest into one private Builder Project.
Creation requires durable Quest evidence and a Nortnspoil reflection. Projects
retain Mission, Journey and Quest provenance and contain exactly three ordered
milestones.

Project updates are append-only. A milestone completes only through a valid
proof update; completion unlocks the next milestone, and the third completed
milestone completes the Project. One active Project is permitted per Builder,
and progress is calculated from completed milestones only.

Migration `202608040018_stage_8_builder_project_mvp.sql` is applied and verified
on authorised disposable staging. The final Stage 8 repository gate passed 85
unit tests, 65 structural/integration checks, coverage thresholds, production
build and authenticated staging E2E. Database reconciliation confirmed one
completed Project, three completed milestones and exactly three append-only
completion updates.

## Boundary

Stage 9 introduced no Builder directory, discovery search, social mechanics,
collaboration, mentor assessment, opportunity matching, employment, funding or
marketplace behavior. Stage 10 has not started and requires an accepted scope
before implementation.
