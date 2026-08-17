# Implementation status

**Current stage:** Stage 18 — Curated Opportunity MVP  
**Stage status:** Verified stacked release candidate — Stage 17 must release first  
**Last updated:** 2026-08-17

| Stage                                   | Status                     | Evidence                                                                                                                       |
| --------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 0 — Governance and architecture         | Complete / released        | Constitution, boundaries, ADRs and implementation discipline                                                                   |
| 1 — Engineering foundation              | Complete / released        | Runtime, design system, config, logging, tests and CI                                                                          |
| 2 — Identity and access                 | Complete / released        | Auth, private identity, consent, recovery and RLS                                                                              |
| 3 — Discovery                           | Complete / released        | Fifteen-question evidence, review and persistence                                                                              |
| 4 — Human Potential Profile             | Complete / released        | Private synthesis, feedback and provenance                                                                                     |
| 5 — Practical Mission                   | Complete / released        | Generation, refinement, activation and recovery                                                                                |
| 6 — Practical Builder Journey           | Complete / released        | Ordered milestones, activation and recovery                                                                                    |
| 7 — HQLS Quest Execution                | Complete / released        | Action, evidence, Nortnspoil reflection, XP and progression                                                                    |
| 8 — Builder Project MVP                 | Complete / released        | Quest-linked Project and proof-backed milestones                                                                               |
| 9 — Selective Project Portfolio         | Complete / released        | Consent, safe projection, publish, withdraw and republish                                                                      |
| 10 — MVP Launch Readiness               | Complete / released        | Production-aligned shell, OAuth hardening and release operations                                                               |
| 11 — Connect + Growth Cycles            | Complete / released        | Adult-safe discovery, requests, accepted network, contact consent, blocking/reporting and renewable Journey cycles             |
| 12 — Economic Pathways MVP              | Complete / released        | Possible Paths, strength-to-value guidance, path selection, 30-Day Pathway and First Value Challenge integration               |
| 13 — KHP-OS Institutional Cohort Bridge | PipuPath boundary verified | Privacy-thresholded cohort bridge live; final real cross-product KHP-OS pairing remains outstanding                            |
| 14 — Retention Intelligence Foundation  | Complete / released        | Mission Control, private feature telemetry, admin authorization/audit and production verification                              |
| 15 — Builder Collaboration MVP          | Complete / released        | Project collaboration, contribution evidence, mutual completion, relationship safety and production validation                 |
| 16 — Living Builder Profile             | Complete / released        | Private versioned evidence profile, deterministic capability progression, feedback, staging/Preview/main/production validation |
| 17 — AI Personal Builder Guide          | Release candidate          | Migration, validator and authenticated Preview verified; exact final-head release sequence remains outstanding                 |
| 18 — Curated Opportunity MVP            | Verified stacked candidate | Supabase lifecycle/security proof, deterministic matching, one deliberate Preview and 3/3 authenticated browser proof passed   |

## Stage 16 release evidence

- PR #29 was squash-merged to `main` as `b6dc00458ca3bf264e40f1ce92551b50f9a5708f`.
- Migration `20260817191000_stage_16_living_builder_profile` is live and behaviorally verified.
- The rollback-only database lifecycle proof passed evidence derivation, version supersession, exact evidence links, Builder feedback and privacy-safe projection checks.
- Authenticated Preview verification passed 3/3 Playwright checks.
- The exact release candidate passed the complete repository validator and matching Vercel check.
- Merged-main CI passed and the production Vercel deployment was confirmed healthy.

## Stage 17 release-candidate evidence

Stage 17 adds a private Personal Builder Guide that interprets existing PipuPath evidence without becoming an unrestricted chatbot or an identity authority.

- `/guide` exposes exactly four structured questions and no free-form prompt box.
- Context is grounded in the Human Potential Profile baseline, Living Builder Profile, selected Economic Pathway and current Mission/Journey/Quest/Project state.
- OpenAI structured output is checked against valid Living Builder Profile claim IDs and a closed set of trusted PipuPath destinations.
- Provider failure or invalid/unsafe output falls back to deterministic evidence rules.
- Current AI-processing consent and safeguarding status are enforced before new guidance or cached reuse.
- Fixed-identity claims, guaranteed money/outcomes, risky finance and unsafe minor-contact advice are rejected.
- Unchanged intent/context may reuse a recent six-hour result; new generations are limited to 12 per rolling 24 hours per Builder.
- Guide runs and feedback are private and provenance-backed; recommendation bodies are not copied into general product telemetry.
- The established `feature_viewed` telemetry contract remains `stage14-v1`; Stage 17 extends only the allowed event/feature vocabulary.

## Stage 17 verification completed

- Full repository validation passed on implementation commit `ab58ca5b44dc15e1206d532c3c6a6e7ccdf7e30a` in CI run `32061598753`: formatting, zero-warning lint, strict TypeScript, unit coverage, structural integration checks and production build.
- Supabase migration `stage_17_ai_personal_builder_guide` is applied on authorised project `kvjcswnmhwegpakbtvlh` under registry version `20260817192833`; the repository source migration is `20260817200000_stage_17_ai_personal_builder_guide.sql`.
- Both Stage 17 persistence tables have RLS enabled. `anon` and `authenticated` have no direct select/insert privileges; `service_role` has the intended trusted access.
- Stage 17 intent/feedback enums and the extended privacy-safe product-event constraints are live.
- A controlled persistence proof created and removed a Guide run and feedback record; cleanup confirmed zero verification rows remained.
- A fresh authenticated Preview request successfully persisted an OpenAI-backed `gpt-5-mini` Guide run with prompt version `stage17.v1`.
- Authenticated Preview run `32061593484`, job `95483882748`, passed **2/2 Playwright checks**: anonymous denial and the authenticated bounded evidence-aware Guide flow, including rendered next action, uncertainty, feedback controls and raw-private-field exclusion.
- The temporary Preview verification workflow was removed after proof.
- Cleanup candidate `42792fe25bbf8326a733783eb2d7514a1eaa5dfc` received a successful matching Vercel deployment check, proving the cleaned application candidate could deploy. The final documentation-only head still requires its deliberate release-sequence Vercel confirmation before merge.

## Stage 18 verification completed

Stage 18 adds a controlled opportunity layer without turning PipuPath into an open marketplace or exposing private Builder evidence to providers.

- `/opportunities` uses deterministic Strong Match / Possible Match / Eligibility Check logic from known age/country, selected Economic Pathway and Living Builder Profile capability labels.
- Missing age or geography is surfaced as uncertainty rather than guessed.
- `/admin/opportunities` separates creation, review, publication and withdrawal; material edits reset approval.
- Unsafe opportunity copy, country-code and tag validation is enforced in Postgres as well as the application boundary.
- The Builder catalog omits the raw official URL; active links are resolved only through the authenticated tracked redirect RPC.
- Applied opportunities that later close remain available only for self-reported outcome completion and are not re-recommended.
- Stage 18 reuses the central product-event stream and does not add a primary navigation item.
- Stage 18 migrations plus the append-only review-enum correction are live on authorised Supabase staging.
- RLS, browser privilege denial, authenticated RPC grants and the admin audit boundary were verified directly.
- The rollback lifecycle proof passed create → review → publish → save → apply → outcome, unsafe-copy rejection, normalisation, edit reset, inactive outcome continuity and cleanup.
- One deliberate Vercel Preview was built from the same application Git tree as the verified Stage 18 candidate.
- The permanent Chromium proof passed **3/3** against that Preview: anonymous opportunity denial, authenticated non-admin admin-supply denial and authenticated Builder evaluate/save/apply/outcome flow.
- The temporary browser fixture and Builder state were deleted; zero fixture rows remain.

## Remaining release sequence

Neither Stage 17 nor Stage 18 is released yet.

1. obtain the final Stage 17 Vercel release-gate confirmation and intentionally merge PR #30;
2. confirm merged-main CI and production health for Stage 17;
3. reconcile/retarget Stage 18 onto the released Stage 17 `main` history;
4. preserve Stage 18's verified application candidate while obtaining only the final release evidence required;
5. intentionally merge Stage 18, then confirm merged-main CI and production health.

Automatic Vercel deployment remains disabled for the Stage 18 development branch so ordinary documentation/test commits do not consume Preview quota.
