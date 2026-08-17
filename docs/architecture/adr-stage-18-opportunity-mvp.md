# ADR — Stage 18 Opportunity MVP

**Status:** Implementation candidate  
**Stage:** 18  
**Date:** 2026-08-17

## Context

PipuPath now has Economic Pathways, evidence-backed capability state, structured collaboration and a bounded Personal Builder Guide. The next developmental step is to help a Builder discover larger real-world opportunities without turning PipuPath into an unvetted marketplace or an opaque AI matching engine.

## Decisions

1. Stage 18 introduces a private `/opportunities` workspace and an administrator-controlled `/admin/opportunities` supply workflow.
2. Supply is curated by PipuPath administrators. Ordinary Builders and external providers cannot publish opportunities in Stage 18.
3. Supported categories are competitions, scholarships, internships, challenges, grants, apprenticeships, volunteer projects and entrepreneurship opportunities.
4. Review and publication are separate states. A material edit resets review and publication so changed eligibility, deadlines or links cannot inherit an old approval.
5. Builder matching is deterministic and explainable. It may use declared age band, country when present, the selected Economic Pathway and labels from the Living Builder Profile. It does not use AI scoring.
6. Missing geography or exact-age information is never guessed. The UI reports the eligibility item that still needs checking.
7. Definite age, geography or deadline conflicts are filtered from the active Builder catalog.
8. Opportunity providers never receive Human Potential Profile content, Living Builder Profile evidence, contact details or other private Builder data from Stage 18.
9. Official external URLs must be HTTPS and are opened through an authenticated PipuPath boundary so click-through can be recorded without exposing private recommendation context.
10. Save, applied and outcome state is private to the Builder. Application status and outcomes are self-reported unless a future explicit verification mechanism proves otherwise.
11. Stage 18 reuses the Stage 14 product-event stream and Stage 12 Economic Pathway state. It does not create parallel analytics or readiness engines.
12. Opportunity telemetry records bounded identifiers/status metadata only; it does not copy private profile, pathway or evidence prose into general analytics.
13. Stage 18 does not add payments, escrow, open provider accounts, user-generated listings, guaranteed-income claims, speculative finance opportunities or unrestricted messaging.
14. `/opportunities` is linked contextually before it earns a primary navigation slot. Primary navigation remains unchanged during this MVP.
15. Automatic Vercel deployment is disabled for the Stage 18 development branch. A single deliberate Preview is reserved for the release-candidate browser proof.

## Stage boundary

Stage 18 is a curated opportunity discovery and readiness MVP. It is not a labor marketplace, scholarship application processor, employer portal, payment system, ranking service or autonomous matching agent.
