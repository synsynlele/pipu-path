# Implementation status

**Current stage:** Stage 14 — Retention Intelligence Foundation  
**Stage status:** Release candidate — staging and authenticated Preview verified  
**Last updated:** 2026-08-17

| Stage                                   | Status                                | Evidence                                                                                                                                         |
| --------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0 — Governance and architecture         | Complete / released                   | Constitution, boundaries, ADRs and implementation discipline                                                                                     |
| 1 — Engineering foundation              | Complete / released                   | Runtime, design system, config, logging, tests and CI                                                                                            |
| 2 — Identity and access                 | Complete / released                   | Auth, private identity, consent, recovery and RLS                                                                                                |
| 3 — Discovery                           | Complete / released                   | Fifteen-question evidence, review and persistence                                                                                                |
| 4 — Human Potential Profile             | Complete / released                   | Private synthesis, feedback and provenance                                                                                                       |
| 5 — Practical Mission                   | Complete / released                   | Generation, refinement, activation and recovery                                                                                                  |
| 6 — Practical Builder Journey           | Complete / released                   | Ordered milestones, activation and recovery                                                                                                      |
| 7 — HQLS Quest Execution                | Complete / released                   | Action, evidence, Nortnspoil reflection, XP and progression                                                                                      |
| 8 — Builder Project MVP                 | Complete / released                   | Quest-linked Project and proof-backed milestones                                                                                                 |
| 9 — Selective Project Portfolio         | Complete / released                   | Consent, safe projection, publish, withdraw and republish                                                                                        |
| 10 — MVP Launch Readiness               | Complete / released                   | Production-aligned shell, OAuth hardening and release operations                                                                                 |
| 11 — Connect + Growth Cycles            | Complete / released                   | Adult-safe discovery, requests, accepted network, contact consent, blocking/reporting and renewable Journey cycles                               |
| 12 — Economic Pathways MVP              | Complete / released                   | Possible Paths, strength-to-value guidance, path selection, 30-Day Pathway and First Value Challenge integration                                 |
| 13 — KHP-OS Institutional Cohort Bridge | Database + PipuPath boundary verified | Privacy-thresholded cohort bridge live in PipuPath; final cross-product KHP-OS pairing remains outstanding                                       |
| 14 — Retention Intelligence Foundation  | Release candidate                     | Mission Control, private feature telemetry, admin authorization/audit, aggregate analytics, staging verification and authenticated Preview proof |

## Stage 14 implementation candidate

The Stage 14 branch adds one product-intelligence boundary rather than a second analytics stack.

- Existing private `product_events` now supports allow-listed `feature_viewed` telemetry.
- Instrumented top-level surfaces are Home, Profile, Journey, Build, Portfolio and Connect.
- `/admin` is a protected PipuPath Mission Control route, not part of normal Builder navigation.
- `platform_admins` is server-owned and checked before any service-role aggregate query.
- `admin_audit_events` records administrator operations without storing private developmental content.
- Mission Control reports total/new Builders, weekly/monthly active Builders, repeat Builders, Builder Progress Events, the developmental funnel and feature repeat-use signals.
- Builder Progress Events use existing completed HQLS Quest truth rather than simulated analytics state.
- Repeat use is labelled separately from cohort retention because general feature telemetry did not exist before Stage 14.
- Private Discovery answers, Human Potential Profile prose, reflection text, Quest evidence, Project prose, contact details and learner-level KHP-OS data are excluded from the analytics functions.

## Verified on authorised staging

- Migration `20260817162335_stage_14_retention_intelligence_foundation` is applied.
- `platform_admins`, `admin_audit_events` and `product_events` have RLS enabled.
- `anon` and `authenticated` have no direct table privileges on the Stage 14 administration/telemetry boundaries.
- Stage 14 dashboard RPCs are executable by `service_role` only.
- The aggregate snapshot returned coherent existing-funnel counts without selecting private narrative columns.
- Generated TypeScript reflects the new Stage 14 schema.
- The persistent owner administrator bootstrap is audit-recorded.
- Temporary fixture administrator access used for Preview proof was revoked after verification.

## Authenticated Vercel Preview proof

Application head `1f7dd554673bd59400f842e8bbfa03a3990938d6` passed a dedicated three-test Playwright proof against the matching Vercel Preview:

1. anonymous `/admin` access redirects to authentication;
2. an authorised operator can read the aggregate Mission Control dashboard and the privacy boundary is visible; and
3. authenticated navigation to Connect records only the allow-listed `connect` feature key through the protected telemetry endpoint with HTTP 204.

Result: **3 passed, 0 failed**.

## Final Stage 14 release gate

Before Stage 14 is labelled complete/released:

- remove temporary verification workflow scaffolding;
- pass the full repository validator on the exact final PR head;
- confirm the matching Vercel deployment check is green;
- merge PR #27 intentionally into `main`;
- confirm merged-main CI; and
- confirm production health.

## Next authorised stage

After Stage 14 is released, Stage 15 is **Builder Collaboration MVP**. It must make accepted connections useful through structured Project-linked collaboration and durable contribution evidence without adding unrestricted private messaging, social feeds or popularity mechanics.
