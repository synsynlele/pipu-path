# Implementation status

**Current stage:** Stage 17 — AI Personal Builder Guide  
**Stage status:** Implementation candidate — validation pending  
**Last updated:** 2026-08-17

| Stage                                   | Status                     | Evidence                                                                                                                                     |
| --------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 — Governance and architecture         | Complete / released        | Constitution, boundaries, ADRs and implementation discipline                                                                                 |
| 1 — Engineering foundation              | Complete / released        | Runtime, design system, config, logging, tests and CI                                                                                        |
| 2 — Identity and access                 | Complete / released        | Auth, private identity, consent, recovery and RLS                                                                                            |
| 3 — Discovery                           | Complete / released        | Fifteen-question evidence, review and persistence                                                                                            |
| 4 — Human Potential Profile             | Complete / released        | Private synthesis, feedback and provenance                                                                                                   |
| 5 — Practical Mission                   | Complete / released        | Generation, refinement, activation and recovery                                                                                              |
| 6 — Practical Builder Journey           | Complete / released        | Ordered milestones, activation and recovery                                                                                                  |
| 7 — HQLS Quest Execution                | Complete / released        | Action, evidence, Nortnspoil reflection, XP and progression                                                                                  |
| 8 — Builder Project MVP                 | Complete / released        | Quest-linked Project and proof-backed milestones                                                                                             |
| 9 — Selective Project Portfolio         | Complete / released        | Consent, safe projection, publish, withdraw and republish                                                                                    |
| 10 — MVP Launch Readiness               | Complete / released        | Production-aligned shell, OAuth hardening and release operations                                                                             |
| 11 — Connect + Growth Cycles            | Complete / released        | Adult-safe discovery, requests, accepted network, contact consent, blocking/reporting and renewable Journey cycles                           |
| 12 — Economic Pathways MVP              | Complete / released        | Possible Paths, strength-to-value guidance, path selection, 30-Day Pathway and First Value Challenge integration                             |
| 13 — KHP-OS Institutional Cohort Bridge | PipuPath boundary verified | Privacy-thresholded cohort bridge live; final real cross-product KHP-OS pairing remains outstanding                                          |
| 14 — Retention Intelligence Foundation  | Complete / released        | Mission Control, private feature telemetry, admin authorization/audit and production verification                                            |
| 15 — Builder Collaboration MVP          | Complete / released        | Project collaboration, contribution evidence, mutual completion, relationship safety and production validation                               |
| 16 — Living Builder Profile             | Complete / released        | Private versioned evidence profile, deterministic capability progression, feedback, staging/Preview/main/production validation               |
| 17 — AI Personal Builder Guide          | Implementation candidate   | Bounded four-question Guide, evidence grounding, provider/fallback, consent/safety, persistence, feedback and cost controls under validation |

## Stage 16 release evidence

- PR #29 was squash-merged to `main` as `b6dc00458ca3bf264e40f1ce92551b50f9a5708f`.
- Migration `20260817191000_stage_16_living_builder_profile` is live and behaviorally verified.
- The rollback-only database lifecycle proof passed evidence derivation, version supersession, exact evidence links, Builder feedback and privacy-safe projection checks.
- Authenticated Preview verification passed 3/3 Playwright checks.
- The exact release candidate passed the complete repository validator and matching Vercel check.
- Merged-main CI passed and the production Vercel deployment was confirmed healthy.

## Stage 17 implementation candidate

Stage 17 adds a private Personal Builder Guide that interprets existing PipuPath evidence without becoming an unrestricted chatbot or an identity authority.

- `/guide` offers exactly four structured questions: What should I do next? Where am I improving? What evidence am I missing? What should I focus on this week?
- Context is assembled server-side from the Human Potential Profile baseline, Living Builder Profile, selected Economic Pathway and current Mission/Journey/Quest/Project state.
- OpenAI structured output is validated against exact Living Profile claim IDs and a closed set of trusted application destinations.
- Provider failure or invalid/unsafe AI output falls back to deterministic evidence rules.
- Current AI-processing consent and safeguarding status are checked before new guidance is generated or reused.
- Fixed-identity claims, guaranteed money/outcomes, risky finance and unsafe minor-contact advice are rejected.
- Results include an explicit uncertainty statement and cannot mutate Human Potential Profile or Living Builder Profile data.
- Unchanged intent/context can reuse a recent six-hour result; new generations are limited to 12 per rolling 24 hours per Builder.
- Guide runs and feedback are private and provenance-backed; recommendation bodies are not copied into general product telemetry.
- The Guide is surfaced from Home but remains outside primary navigation.

## Stage 17 verification still required

- Pass formatting, lint, strict TypeScript, unit coverage, structural integration checks and production build.
- Apply migration `20260817200000_stage_17_ai_personal_builder_guide` to the authorised Supabase project and verify RLS, privileges and persistence behavior.
- Prove bounded generation/fallback, evidence grounding, provenance and feedback in an authenticated Vercel Preview.
- Pass the exact final PR-head validator and matching Vercel check.
- Merge PR #30, confirm merged-main CI and production Vercel health.

## Next stage

Stage 18 remains deferred until Stage 17 is released and explicitly authorised.
