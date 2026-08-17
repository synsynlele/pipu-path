# Implementation status

**Current stage:** Stage 15 — Builder Collaboration MVP  
**Stage status:** Implementation candidate  
**Last updated:** 2026-08-17

| Stage                                   | Status                     | Evidence                                                                                                                                  |
| --------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 0 — Governance and architecture         | Complete / released        | Constitution, boundaries, ADRs and implementation discipline                                                                              |
| 1 — Engineering foundation              | Complete / released        | Runtime, design system, config, logging, tests and CI                                                                                     |
| 2 — Identity and access                 | Complete / released        | Auth, private identity, consent, recovery and RLS                                                                                         |
| 3 — Discovery                           | Complete / released        | Fifteen-question evidence, review and persistence                                                                                         |
| 4 — Human Potential Profile             | Complete / released        | Private synthesis, feedback and provenance                                                                                                |
| 5 — Practical Mission                   | Complete / released        | Generation, refinement, activation and recovery                                                                                           |
| 6 — Practical Builder Journey           | Complete / released        | Ordered milestones, activation and recovery                                                                                               |
| 7 — HQLS Quest Execution                | Complete / released        | Action, evidence, Nortnspoil reflection, XP and progression                                                                               |
| 8 — Builder Project MVP                 | Complete / released        | Quest-linked Project and proof-backed milestones                                                                                          |
| 9 — Selective Project Portfolio         | Complete / released        | Consent, safe projection, publish, withdraw and republish                                                                                 |
| 10 — MVP Launch Readiness               | Complete / released        | Production-aligned shell, OAuth hardening and release operations                                                                          |
| 11 — Connect + Growth Cycles            | Complete / released        | Adult-safe discovery, requests, accepted network, contact consent, blocking/reporting and renewable Journey cycles                        |
| 12 — Economic Pathways MVP              | Complete / released        | Possible Paths, strength-to-value guidance, path selection, 30-Day Pathway and First Value Challenge integration                          |
| 13 — KHP-OS Institutional Cohort Bridge | PipuPath boundary verified | Privacy-thresholded cohort bridge live; final real cross-product KHP-OS pairing remains outstanding                                       |
| 14 — Retention Intelligence Foundation  | Complete / released        | Mission Control, private feature telemetry, admin authorization/audit, aggregate analytics, staging/Preview/main/production verification  |
| 15 — Builder Collaboration MVP          | Implementation candidate   | Project-linked invitations, structured contribution evidence, mutual completion, relationship safety and analytics are under verification |

## Stage 14 release evidence

- Release commit `752e4f79f9e711126aa66560b8a3ab307079572b` is on `main`.
- Authorised Stage 14 Supabase migration is live with RLS and service-role-only analytics boundaries.
- The authenticated Stage 14 Preview proof passed 3/3 checks.
- The exact pre-merge candidate passed the complete repository validator.
- Merged-main CI passed.
- The production Vercel deployment check succeeded.

## Stage 15 implementation candidate

Stage 15 is intentionally smaller than a social workspace. It makes accepted connections useful through structured Project-linked collaboration.

- Only Stage 11 eligible adults can participate.
- A Project owner can invite only an accepted, unblocked Builder connection into the current active Project.
- The invite shares a safe working agreement and Project title, not raw private Project or developmental content.
- Connection acceptance and collaboration acceptance are separate consent decisions.
- Active collaboration records structured contribution evidence rather than chat messages.
- Both participants must contribute and confirm before the collaboration can become completed evidence.
- Removing the accepted connection or blocking either participant cancels unfinished collaboration automatically.
- Completed collaboration remains durable evidence for the participant's future development history.
- Collaboration lifecycle events extend the existing private product analytics boundary.
- Collaboration is surfaced under Connect; primary Builder navigation remains unchanged.

## Stage 15 verification still required

- Pass unit tests, structural Stage 15 checks and the complete repository validator.
- Apply both Stage 15 migrations to authorised staging and verify RLS, grants and lifecycle behavior.
- Regenerate linked Supabase TypeScript definitions.
- Verify the matching authenticated Preview with two real staging Builder fixtures.
- Confirm no collaboration payload leaks private Project, Quest, reflection, Human Potential Profile, Economic Pathway or contact fields.
- Merge the exact approved head and confirm main CI plus production Vercel health.

## Next authorised stage

After Stage 15 is released, Stage 16 is **Living Builder Profile**: evidence-backed profile evolution and capability verification without deterministic personality labelling.
