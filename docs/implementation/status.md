# Implementation status

**Current stage:** Stage 16 — Living Builder Profile  
**Stage status:** Release candidate — staging + authenticated Preview verified  
**Last updated:** 2026-08-17

| Stage                                   | Status                     | Evidence                                                                                                                         |
| --------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 0 — Governance and architecture         | Complete / released        | Constitution, boundaries, ADRs and implementation discipline                                                                     |
| 1 — Engineering foundation              | Complete / released        | Runtime, design system, config, logging, tests and CI                                                                            |
| 2 — Identity and access                 | Complete / released        | Auth, private identity, consent, recovery and RLS                                                                                |
| 3 — Discovery                           | Complete / released        | Fifteen-question evidence, review and persistence                                                                                |
| 4 — Human Potential Profile             | Complete / released        | Private synthesis, feedback and provenance                                                                                       |
| 5 — Practical Mission                   | Complete / released        | Generation, refinement, activation and recovery                                                                                  |
| 6 — Practical Builder Journey           | Complete / released        | Ordered milestones, activation and recovery                                                                                      |
| 7 — HQLS Quest Execution                | Complete / released        | Action, evidence, Nortnspoil reflection, XP and progression                                                                      |
| 8 — Builder Project MVP                 | Complete / released        | Quest-linked Project and proof-backed milestones                                                                                 |
| 9 — Selective Project Portfolio         | Complete / released        | Consent, safe projection, publish, withdraw and republish                                                                        |
| 10 — MVP Launch Readiness               | Complete / released        | Production-aligned shell, OAuth hardening and release operations                                                                 |
| 11 — Connect + Growth Cycles            | Complete / released        | Adult-safe discovery, requests, accepted network, contact consent, blocking/reporting and renewable Journey cycles               |
| 12 — Economic Pathways MVP              | Complete / released        | Possible Paths, strength-to-value guidance, path selection, 30-Day Pathway and First Value Challenge integration                 |
| 13 — KHP-OS Institutional Cohort Bridge | PipuPath boundary verified | Privacy-thresholded cohort bridge live; final real cross-product KHP-OS pairing remains outstanding                              |
| 14 — Retention Intelligence Foundation  | Complete / released        | Mission Control, private feature telemetry, admin authorization/audit and production verification                                |
| 15 — Builder Collaboration MVP          | Complete / released        | Project collaboration, contribution evidence, mutual completion, relationship safety, staging/Preview/main/production validation |
| 16 — Living Builder Profile             | Release candidate          | Private versioned profile, deterministic action evidence, feedback, staging DB proof and authenticated Preview verification       |

## Stage 15 release evidence

- PR #28 was squash-merged to `main` as `496d558047fe735317eed6cb73e45b23b5feaa82`.
- Both Stage 15 migrations are live and behaviorally verified on the authorised Supabase project.
- The authenticated Stage 15 Preview proof passed 3/3 checks.
- The exact pre-merge candidate passed the complete repository validator.
- Merged-main CI passed.
- The production Vercel deployment check succeeded.

## Stage 16 release candidate

Stage 16 preserves the Human Potential Profile as a private Discovery baseline and adds a separate evidence-backed profile that evolves through completed action.

- `/profile` becomes the primary Profile destination; the Discovery profile remains accessible as the baseline.
- Every refresh creates a new private version linked to the active Human Potential Profile.
- Completed HQLS Quests count only when evidence and Nortnspoil reflection are present.
- Completed Builder Projects provide stronger evidence for their originating Journey milestone capabilities and Project execution.
- Completed Builder Collaboration provides mutually verified Collaboration evidence only when both participants contributed and confirmed completion.
- Capability progression is deterministic: Practicing → Demonstrated → Repeatedly demonstrated.
- Every claim retains exact private links to the Quest, Project or Collaboration evidence supporting it.
- Builders can record Accurate, Needs context or Not representative feedback without deleting history.
- Stage 16 introduces no AI identity mutation and no public capability publication.

## Stage 16 verification completed

- Migration `20260817191000_stage_16_living_builder_profile` is applied to the authorised Supabase project.
- Stage 16 persistence tables have RLS enabled with no direct `anon` or `authenticated` browser-table privileges.
- Authenticated RPC grants are limited to the profile projection, refresh and feedback boundaries.
- A rollback-only authenticated database proof passed evidence derivation, version supersession, exact evidence links, Builder feedback and privacy-safe projection checks.
- The rollback proof left zero Stage 16 verification rows behind.
- Generated live-schema TypeScript confirms the Stage 16 tables, enums and RPC signatures.
- Authenticated Preview run `32055234944`, job `95463741823`, passed 3/3 Playwright checks with 0 failures.
- Preview proof covered anonymous denial, the private Living Builder Profile surface, Discovery baseline access, Project execution evidence, exact Project evidence links, feedback controls and raw-private-field exclusion.
- The temporary Preview verifier was removed after the proof.

## Final Stage 16 release gate

- Pass the exact final PR-head complete repository validator and matching Vercel deployment check.
- Merge PR #29 intentionally.
- Confirm merged-main CI and production Vercel health.

## Next authorised stage

Stage 17 — **AI Personal Builder Guide** remains deferred. It must not begin until Stage 16 is released and explicitly authorised.
