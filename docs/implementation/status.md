# Implementation status

**Current stage:** Stage 7 — HQLS Quest Execution MVP (complete)  
**Last verified:** 2026-08-04  
**Next boundary:** Stage 8 — not started

| Stage                           | Status      | Evidence                                                                          |
| ------------------------------- | ----------- | --------------------------------------------------------------------------------- |
| 0 — Governance and architecture | Complete    | Constitution, stage boundaries, quality attributes, ADRs and ledger               |
| 1 — Engineering foundation      | Complete    | Application foundation, design system, config, logging, tests and CI              |
| 2 — Identity and access         | Complete    | Database/RLS/email/recovery/OAuth and staging browser E2E pass                    |
| 3 — Discovery                   | Complete    | Persistent evidence, review, RLS/API verification and browser E2E pass            |
| 4 — Human Potential Profile     | Complete    | Live Gemini, private persistence, feedback, refresh, RLS and staging CI pass      |
| 5 — Practical Mission           | Complete    | Live Gemini, refinement, activation, refresh, RLS and staging CI pass             |
| 6 — Practical Builder Journey   | Complete    | Live Gemini, milestones, activation, refresh, RLS and staging CI pass             |
| 7 — HQLS Quest Execution        | Complete    | Live Gemini, action, evidence, reflection, XP, progression and staging CI pass    |
| 8–9                             | Not started | Public/downstream Builder capabilities remain outside the completed Stage 7 scope |

## Stage 7 completion

Stage 7 converts the current active Journey milestone into exactly three
ordered private HQLS Quests. Quest generation uses the existing server-only
Gemini configuration and validates realistic duration, action steps,
low-resource alternatives, evidence requirements, safety guidance,
completion criteria and reflection prompts before atomic persistence.

One Quest may be active at a time. Completion requires durable private
evidence and a complete Nortnspoil reflection. Each Quest awards exactly
50 XP once through an append-only transaction. Completing Quest 1 unlocks
Quest 2; completing Quest 3 completes the milestone and unlocks the next
milestone. The state survives refresh.

Migrations `202608040016_stage_7_hqls_quest_execution.sql` and
`202608040017_index_stage_7_quest_foreign_keys.sql` are applied and verified
on authorised disposable staging. RLS is enabled on all five Stage 7 tables.
Authenticated users receive owner-only reads and controlled lifecycle RPCs;
generated persistence remains restricted to `service_role`. The private
`quest-evidence` bucket accepts only JPG, PNG and WebP images up to 5 MB in
the authenticated owner's folder.

The matching Vercel Preview deployment
`dpl_86KTj6DUaAPJXkPmApTbTcneaNrA` is READY. GitHub Actions run
`30930702481` passed full `validate` and authenticated `staging-e2e` against
that Preview. Validation passed Prettier, zero-warning ESLint, strict
TypeScript, 81 unit tests, 53 structural/integration checks, coverage
thresholds and the Next.js production build.

Playwright ran 16 cases with one worker because authenticated flows share one
approved disposable fixture: 13 passed and three duplicate full-flow cases
were intentionally skipped. The suite proved fresh live Gemini generation,
Quest 1 start, evidence submission, Nortnspoil reflection, exactly-once XP,
Quest 2 unlocking, refresh recovery, anonymous denial and narrow-screen
usability.

Vercel runtime logs recorded `quest_pack_generation_completed` on the exact
Preview. Database reconciliation confirmed a completed Gemini request with
three Quests, Quest 1 completed, Quest 2 available, Quest 3 locked, one
evidence record, one reflection and one 50-XP transaction.

## Repairs completed during closure

- Removed obsolete Stage 6 boundary assertions after Stage 7 became active.
- Removed cache invalidation before the long Quest-generation redirect so
  the browser completes the 303 transition instead of remaining pending.
- Serialised shared-fixture Playwright flows to prevent synthetic-user races.
- Placed all Quest routes inside the authenticated Builder application shell,
  including usable mobile navigation.
- Removed temporary formatting and closure workflows after their one-time use.
- Reconciled the live remote Stage 7 tables, enums, relationships and RPC
  signatures with the implementation contract.

## Boundary

Stage 7 is complete. Stage 8 has not started. Evidence and reflections remain
private; Stage 7 does not create public portfolios, Projects, mentor scoring,
team Quests, leaderboards, opportunity matching or Builder Network sharing.
