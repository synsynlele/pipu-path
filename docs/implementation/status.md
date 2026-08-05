# Implementation status

**Current stage:** Stage 9 — Selective Project Portfolio (final verification)  
**Last verified:** 2026-08-05  
**Next boundary:** Stage 10 — locked until Stage 9 closure

| Stage                           | Status             | Evidence                                                                        |
| ------------------------------- | ------------------ | ------------------------------------------------------------------------------- |
| 0 — Governance and architecture | Complete           | Constitution, stage boundaries, quality attributes, ADRs and ledger             |
| 1 — Engineering foundation      | Complete           | Application foundation, design system, config, logging, tests and CI            |
| 2 — Identity and access         | Complete           | Database/RLS/email/recovery/OAuth and staging browser E2E pass                  |
| 3 — Discovery                   | Complete           | Persistent evidence, review, RLS/API verification and browser E2E pass          |
| 4 — Human Potential Profile     | Complete           | Live Gemini, private persistence, feedback, refresh, RLS and staging CI pass    |
| 5 — Practical Mission           | Complete           | Live Gemini, refinement, activation, refresh, RLS and staging CI pass           |
| 6 — Practical Builder Journey   | Complete           | Live Gemini, milestones, activation, refresh, RLS and staging CI pass           |
| 7 — HQLS Quest Execution        | Complete           | Action, evidence, reflection, XP, progression and staging CI pass               |
| 8 — Builder Project MVP         | Complete           | Quest-linked Project, milestones, proof updates, completion and staging CI pass |
| 9 — Selective Project Portfolio | Final verification | Private studio, safe projection, consent, publish/withdraw and public proof     |

## Stage 9 verification state

Stage 9 is implemented on draft PR #11. It converts one completed private
Project into one selective public proof while keeping Quest evidence,
Nortnspoil reflections, raw Project updates, contact information and internal
identifiers private.

Migration `202608040019_stage_9_selective_project_portfolio.sql` is applied and
verified on authorised disposable staging. The portfolio table has RLS and an
owner-read policy. Authenticated users receive SELECT only; all mutations use
controlled RPCs. Anonymous access is limited to an eleven-field public-safe RPC
projection. Publishing is adult-only in this MVP, requires explicit versioned
consent, uses a stable slug and can be withdrawn without deleting private
history.

Repository validation has passed formatting, zero-warning ESLint, strict
TypeScript, 91 unit tests, 77 structural/integration checks, coverage thresholds
and the Next.js production build.

The first live browser run proved private draft creation, exact preview,
publication, anonymous safe access and successful database withdrawal. It
identified one stale public response after withdrawal. The repaired source now
forces `/proof/[slug]` to check live state, disables route revalidation caching,
invalidates the exact slug during withdrawal and includes permanent regression
checks.

Vercel deployment capacity has been restored and exact-head Preview verification
resumed on 2026-08-05. Stage 9 remains open until the repaired flow proves:
publish, anonymous view, withdrawal to 404, republish on the same slug, mobile
recovery, runtime reconciliation and durable database state.

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

Stage 9 does not introduce Builder discovery, search, social mechanics,
collaboration, mentor assessment, opportunity matching, employment, funding or
marketplace behavior. Stage 10 remains locked until Stage 9 passes its exact
Preview and authenticated E2E closure gates.
