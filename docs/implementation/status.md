# Implementation status

**Current stage:** Stage 8 — Builder Project MVP (complete)  
**Last verified:** 2026-08-04  
**Next boundary:** Stage 9 — not started

| Stage                           | Status      | Evidence                                                                        |
| ------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| 0 — Governance and architecture | Complete    | Constitution, stage boundaries, quality attributes, ADRs and ledger             |
| 1 — Engineering foundation      | Complete    | Application foundation, design system, config, logging, tests and CI            |
| 2 — Identity and access         | Complete    | Database/RLS/email/recovery/OAuth and staging browser E2E pass                  |
| 3 — Discovery                   | Complete    | Persistent evidence, review, RLS/API verification and browser E2E pass          |
| 4 — Human Potential Profile     | Complete    | Live Gemini, private persistence, feedback, refresh, RLS and staging CI pass    |
| 5 — Practical Mission           | Complete    | Live Gemini, refinement, activation, refresh, RLS and staging CI pass           |
| 6 — Practical Builder Journey   | Complete    | Live Gemini, milestones, activation, refresh, RLS and staging CI pass           |
| 7 — HQLS Quest Execution        | Complete    | Action, evidence, reflection, XP, progression and staging CI pass               |
| 8 — Builder Project MVP         | Complete    | Quest-linked Project, milestones, proof updates, completion and staging CI pass |
| 9                               | Not started | Public presentation and downstream Builder capabilities remain locked          |

## Stage 8 completion

Stage 8 converts one owned completed HQLS Quest into one private Builder
Project. Project creation requires durable Quest evidence and a Nortnspoil
reflection. The Project retains its Mission, Journey and Quest provenance and
defines a specific problem, reachable people, a practical outcome, the smallest
useful version, one success signal, a target date and exactly three ordered
milestones.

PipuPath permits one active Project per Builder. Project updates are append-only
and preserve progress, proof, an optional HTTPS link and the next practical
action. A milestone completes only through a valid proof update. Completion
unlocks the next milestone, and the third completed milestone completes the
Project. Progress survives refresh and is calculated from completed milestones
only.

Migration `202608040018_stage_8_builder_project_mvp.sql` is applied and verified
on authorised disposable staging. RLS is enabled on `builder_projects`,
`builder_project_milestones` and `builder_project_updates`, each with one
owner-read policy. Authenticated users receive no direct table-write grants.
The two controlled RPCs enforce `auth.uid()`, ownership, completed-Quest proof,
one active Project, one Project per source Quest, ordered milestone progression
and valid lifecycle state.

The matching Vercel Preview deployment
`dpl_2KU8RfiEgCJ9Uf9K9BqdkvQ5g2tL` is READY on the verified code head. GitHub
Actions run `30935515692` passed full `validate` and authenticated
`staging-e2e` against that Preview.

Validation passed Prettier, zero-warning ESLint, strict TypeScript, 85 unit
tests, 65 structural/integration checks, all coverage thresholds and the
Next.js production build. Playwright ran 22 cases with one shared approved
fixture: 17 passed and five duplicate full-flow cases were intentionally
skipped.

The browser flow created a fresh private Project from completed Quest proof,
completed all three milestones through three append-only proof updates,
verified 100% completion after refresh, denied anonymous access and confirmed
narrow-screen navigation. Database reconciliation confirmed one completed
Project with a completion timestamp, three completed milestones and exactly
three completion updates.

Live generated Supabase types were inspected and contain the three Stage 8
tables, their relationships, both RPC signatures and both Project enums exactly
as implemented. Stage 8 keeps its database adapter isolated until a dedicated
canonical generated-client consolidation slice.

## Repairs completed during closure

- Applied the repository's exact Prettier and Tailwind formatting rules.
- Retargeted CI from the Stage 7 Preview to the matching Stage 8 branch alias.
- Added a repeatable Project E2E that supports both fresh creation and durable
  completion recovery.
- Replaced an early non-waiting form probe that could skip a newly unlocked
  milestone with explicit reload-and-wait transition verification.
- Removed all one-time formatting workflows after use.

## Boundary

Stage 8 is complete. Stage 9 has not started. Projects, proof and updates remain
private. Stage 8 does not create public portfolios, sharing, collaboration,
mentor assessment, team Projects, leaderboards, opportunity matching or
Builder Network discovery.
