# Implementation status

**Current stage:** Stage 18 — Curated Opportunity MVP  
**Stage status:** Release candidate — clean main-based release gates in progress  
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
| 16 — Living Builder Profile             | Complete / released        | Private versioned evidence profile, deterministic capability progression, feedback and production validation                   |
| 17 — AI Personal Builder Guide          | Complete / released        | Bounded evidence-aware Guide, Supabase verification, authenticated browser proof, merged-main CI and production Vercel success |
| 18 — Curated Opportunity MVP            | Release candidate          | Supabase lifecycle/security proof, deterministic matching, deliberate Preview and 3/3 authenticated browser proof passed       |

## Stage 17 release evidence

- PR #30 was squash-merged to `main` as `c4bd6be6d5a257ed72c6a8cea7f33168c2475d6c`.
- The Stage 17 migration and RLS/privilege boundaries are live and verified.
- A real authenticated Preview generation persisted OpenAI-backed `gpt-5-mini` guidance.
- Permanent authenticated browser verification passed 2/2.
- The exact final pre-merge head passed GitHub validation and Vercel after the daily deployment quota cleared.
- Merged-main CI run `32071722620` passed.
- Vercel Production deployment `5951764007` completed successfully.

## Stage 18 candidate evidence

Stage 18 adds a curated and explainable opportunity layer that connects Builder evidence to larger real-world tests without becoming an unvetted marketplace.

- `/opportunities` is private and authenticated.
- `/admin/opportunities` is limited to active platform administrators; only owner/operator roles mutate supply.
- Opportunity supply uses separate review and publication state, and material edits reset approval.
- Match tiers are deterministic `Strong Match`, `Possible Match` and `Eligibility Check`, not employability scores or selection probabilities.
- Missing exact age/geography is surfaced as uncertainty rather than inferred.
- Private save/application/outcome state is stored separately from opportunity supply.
- Application and outcome claims are labelled self-reported unless a future verification process proves otherwise.
- Official provider URLs remain behind authenticated tracked redirects rather than the Builder catalog payload.
- Unsafe financial/get-rich opportunity copy is rejected by the application contract and database-authoritative checks.
- Stage 18 reuses the central `product_events` stream instead of introducing duplicate analytics infrastructure.

## Stage 18 verification completed

- Full repository validation passed on the verified implementation candidate: formatting, zero-warning lint, strict TypeScript, 233 unit tests, integration checks, coverage thresholds and production build.
- Migrations `20260817210000_stage_18_opportunity_mvp`, `20260817210100_stage_18_opportunity_mvp_hardening` and `20260817210200_fix_stage_18_review_enum_cast` are applied to authorised staging.
- RLS, browser table-grant denial, authenticated RPC execution and admin audit boundaries were verified directly.
- Rollback lifecycle proof passed unsafe-copy rejection, normalisation, create → review → publish → save → apply → outcome, material-edit reset, inactive applied-opportunity outcome continuity and cleanup.
- Permanent Chromium browser proof passed **3/3** against one deliberate Vercel Preview.
- Temporary browser opportunity and cascading Builder state were deleted; zero verification fixture rows remain.
- After Stage 17 released, a clean Stage 18 release tree was reconstructed directly on the released Stage 17 `main` commit using the already-verified Stage 18 file blobs and excluding the temporary branch-only Vercel quota control.

## Remaining Stage 18 release gate

Stage 18 is **not released** until the clean main-based release candidate:

1. passes exact-head GitHub validation;
2. receives a successful exact-head Vercel check;
3. is intentionally merged;
4. passes merged-main CI; and
5. receives a successful Vercel Production deployment.

No additional Stage 18 product scope is permitted during this release gate.
