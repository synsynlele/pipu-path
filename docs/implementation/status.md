# Implementation status

**Current stage:** Stage 15 — Builder Collaboration MVP  
**Stage status:** Release candidate — staging and authenticated Preview verified  
**Last updated:** 2026-08-17

| Stage                                   | Status                                | Evidence                                                                                                                                          |
| --------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 — Governance and architecture         | Complete / released                   | Constitution, boundaries, ADRs and implementation discipline                                                                                      |
| 1 — Engineering foundation              | Complete / released                   | Runtime, design system, config, logging, tests and CI                                                                                             |
| 2 — Identity and access                 | Complete / released                   | Auth, private identity, consent, recovery and RLS                                                                                                 |
| 3 — Discovery                           | Complete / released                   | Fifteen-question evidence, review and persistence                                                                                                 |
| 4 — Human Potential Profile             | Complete / released                   | Private synthesis, feedback and provenance                                                                                                        |
| 5 — Practical Mission                   | Complete / released                   | Generation, refinement, activation and recovery                                                                                                   |
| 6 — Practical Builder Journey           | Complete / released                   | Ordered milestones, activation and recovery                                                                                                       |
| 7 — HQLS Quest Execution                | Complete / released                   | Action, evidence, Nortnspoil reflection, XP and progression                                                                                       |
| 8 — Builder Project MVP                 | Complete / released                   | Quest-linked Project and proof-backed milestones                                                                                                  |
| 9 — Selective Project Portfolio         | Complete / released                   | Consent, safe projection, publish, withdraw and republish                                                                                         |
| 10 — MVP Launch Readiness               | Complete / released                   | Production-aligned shell, OAuth hardening and release operations                                                                                  |
| 11 — Connect + Growth Cycles            | Complete / released                   | Adult-safe discovery, requests, accepted network, contact consent, blocking/reporting and renewable Journey cycles                                |
| 12 — Economic Pathways MVP              | Complete / released                   | Possible Paths, strength-to-value guidance, path selection, 30-Day Pathway and First Value Challenge integration                                  |
| 13 — KHP-OS Institutional Cohort Bridge | PipuPath boundary verified            | Privacy-thresholded cohort bridge live; final real cross-product KHP-OS pairing remains outstanding                                                |
| 14 — Retention Intelligence Foundation  | Complete / released                   | Mission Control, private feature telemetry, admin authorization/audit, aggregate analytics, staging/Preview/main/production verification           |
| 15 — Builder Collaboration MVP          | Release candidate                     | Structured Project collaboration, contribution evidence, mutual completion, relationship safety, staging verification and authenticated Preview |

## Stage 14 release evidence

- Release commit `752e4f79f9e711126aa66560b8a3ab307079572b` is on `main`.
- Authorised Stage 14 Supabase migration is live with RLS and service-role-only analytics boundaries.
- The authenticated Stage 14 Preview proof passed 3/3 checks.
- The exact pre-merge candidate passed the complete repository validator.
- Merged-main CI passed.
- The production Vercel deployment check succeeded.

## Stage 15 release candidate

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

## Verified on authorised staging

- Migrations `20260817172612_stage_15_builder_collaboration_mvp` and `20260817172635_harden_stage_15_collaboration_safeguarding` are applied.
- Collaboration and contribution tables have RLS enabled.
- `anon` and `authenticated` have no direct table privileges on the Stage 15 persistence boundary.
- Invitation, response, closure, contribution, completion, state and detail RPC access was verified.
- A rollback-only two-actor transaction proved invitation → acceptance → contribution by both Builders → first confirmation remains incomplete → second confirmation completes.
- The safe detail projection excluded raw Project, Quest, reflection, Human Potential Profile, Economic Pathway and contact fields.
- Removing the accepted connection cancelled unfinished collaboration.
- Blocking either participant cancelled unfinished collaboration.
- Safeguarding ineligibility returned no unfinished cross-user collaboration state.
- The verification transaction rolled back fully; no staging collaboration proof records remained.
- Generated linked Supabase TypeScript reflects the Stage 15 schema.

## Authenticated Vercel Preview proof

Playwright run `32051548510`, job `95451843408`, passed **3 of 3 checks** with zero failures on branch head `6826d2765585f92278dd4672fe0472f53e1ee38f`:

1. anonymous Builder Collaboration access is rejected;
2. an authenticated eligible Builder can read the structured collaboration experience and contribution evidence; and
3. collaboration detail shows only the safe working agreement and contribution proof while forbidden private product fields stay absent.

All synthetic Preview relationship/collaboration records and the temporary fixture username were removed immediately after verification, and cleanup checks returned zero synthetic collaboration records.

## Final Stage 15 release gate

Before Stage 15 is labelled complete/released:

- pass the complete repository validator on the exact final PR head;
- confirm the matching Vercel deployment check is green;
- merge PR #28 intentionally into `main`;
- confirm merged-main CI; and
- confirm production health.

## Next authorised stage

After Stage 15 is released, Stage 16 is **Living Builder Profile**: evidence-backed profile evolution and capability verification without deterministic personality labelling.
