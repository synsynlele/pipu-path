# Implementation status

**Current stage:** Stage 10 — MVP launch readiness in progress  
**Last verified locally:** 2026-08-05  
**MVP boundary:** Stage 10 is final

| Stage                           | Status      | Evidence                                                            |
| ------------------------------- | ----------- | ------------------------------------------------------------------- |
| 0 — Governance and architecture | Complete    | Constitution, boundaries, ADRs and ledger                           |
| 1 — Engineering foundation      | Complete    | Runtime, design system, config, logging, tests and CI               |
| 2 — Identity and access         | Complete    | Auth, private identity, consent, recovery and RLS                   |
| 3 — Discovery                   | Complete    | Fifteen-question evidence, review and persistence                   |
| 4 — Human Potential Profile     | Complete    | Private Gemini synthesis, feedback and provenance                   |
| 5 — Practical Mission           | Complete    | Generation, refinement, activation and recovery                     |
| 6 — Practical Builder Journey   | Complete    | Ordered milestones, activation and recovery                         |
| 7 — HQLS Quest Execution        | Complete    | Action, evidence, reflection, XP and progression                    |
| 8 — Builder Project MVP         | Complete    | Quest-linked Project and proof-backed milestones                    |
| 9 — Selective Project Portfolio | Complete    | Consent, safe projection, publish, withdraw and republish           |
| 10 — MVP Launch Readiness       | In progress | OAuth repair, redesign, integration, security and release candidate |

## Current Stage 10 evidence

- Correct branch based on final Stage 9 head.
- Google/email progression resolver covers every major persisted checkpoint.
- OAuth callback exchanges PKCE code and persists response cookies.
- Safe redirect and Preview-origin tests pass.
- Landing page and authenticated shell use the approved launch design system.
- Primary navigation is Home, Journey, Build, Portfolio and Profile.
- Home displays only persisted current data and one primary next action.
- Loading, error, retry, not-found, metadata, robots and manifest are present.
- External Google Font build dependency is removed.
- Migrations `020` and `021` are applied and verified on authorised staging.
- Local gate: 106 unit tests, 80 structural/integration checks, coverage
  thresholds and production build pass.

## Required before completion

Stage 10 is not complete until the exact matching Preview passes live Google
OAuth, email authentication, full fresh/returning user routing, complete Stage
0–9 browser recovery, mobile/accessibility, RLS, console/runtime review and the
public Portfolio 200 → 404 → 200 lifecycle. Production remains untouched.
