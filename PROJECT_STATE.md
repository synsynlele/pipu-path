# PipuPath project state

**Current stage:** Stage 18 — Curated Opportunity MVP

**Stage status:** RELEASE CANDIDATE — FUNCTIONAL, DATABASE AND AUTHENTICATED BROWSER PROOF VERIFIED; CLEAN MAIN-BASED RELEASE GATES IN PROGRESS

**Released product stages:** Stage 0 through Stage 17

**Current `main` baseline:** `c4bd6be6d5a257ed72c6a8cea7f33168c2475d6c`

**Stage 17 release:** PR #30, squash-merged and production-verified on 2026-08-17

**Review surface:** clean Stage 18 release branch `agent/stage-18-opportunity-mvp-release`

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`. Stage 17 is live in production. Stage 18 migrations `20260817210000`, `20260817210100` and `20260817210200` are applied and verified on authorised staging. Stage 18 database security/lifecycle proof and authenticated browser proof are complete. Stage 18 is not yet released to production.

**Last updated:** 2026-08-17

## Released operating loop

PipuPath currently moves a Builder through:

`Discovery → Human Potential Profile → Possible Paths → Choose a Path → Practical Mission → 30-Day Pathway / Journey → HQLS Quests + Evidence → First Value Challenge / Builder Project → reflection → Portfolio / Connect → structured collaboration → Living Builder Profile → Personal Builder Guide → next growth cycle`

Stage 17 is released on `main`. The Personal Builder Guide is private, evidence-aware and bounded to four structured questions. It uses PipuPath evidence and current development state, provides explicit uncertainty, falls back to deterministic rules when needed, and cannot mutate the Living Builder Profile or operate as unrestricted chat.

Stage 13's privacy-thresholded PipuPath cohort boundary remains present in production, while the final real KHP-OS → PipuPath cross-product pairing remains a separate outstanding integration gate.

## Stage 18 release candidate

Stage 18 connects existing Builder development evidence to curated real-world opportunities without creating an open marketplace or opaque AI scoring system.

The candidate adds:

- `/opportunities` as a private Builder opportunity workspace;
- curated competitions, scholarships, internships, challenges, grants, apprenticeships, volunteer projects and entrepreneurship opportunities;
- deterministic `Strong Match`, `Possible Match` and `Eligibility Check` guidance;
- use only of already-known age/country information, selected Economic Pathway and Living Builder Profile capability labels;
- explicit uncertainty when age or geography is unknown rather than guessing;
- `/admin/opportunities` as owner/operator-controlled supply management;
- create → review → publish → withdraw lifecycle with material edits resetting approval;
- private save, self-reported application and self-reported outcome state;
- authenticated tracked redirects to official HTTPS opportunity pages without exposing raw provider URLs in the Builder catalog;
- central Stage 14 product-event telemetry reuse;
- no payments, escrow, user-generated opportunity supply, guaranteed outcomes or speculative-finance opportunities;
- no change to the six-item primary navigation.

## Stage 18 verified evidence

- Full repository validation passed on the verified implementation candidate: formatting, zero-warning lint, strict TypeScript, 233 unit tests, integration checks, coverage thresholds and production build.
- Stage 18 migrations and the append-only enum-cast correction are live on authorised staging.
- RLS, direct browser table-grant denial, authenticated RPC grants and admin audit boundaries were verified.
- Rollback lifecycle proof passed unsafe-copy rejection, normalisation, create → review → publish → save → apply → outcome, material-edit review reset, closed-application outcome continuity and fixture cleanup.
- One deliberate authenticated Vercel Preview browser proof passed 3/3: anonymous opportunity denial, authenticated non-admin Opportunity Supply denial and authenticated Builder evaluate → save → apply → self-reported outcome flow.
- All temporary Stage 18 browser/database verification fixtures were removed.
- After Stage 17 released, Stage 18 was reconstructed as a clean delta directly on released `main` so squash-history duplication cannot enter production.

## Remaining Stage 18 release gate

Stage 18 must not be called released until:

1. the exact clean release head passes GitHub validation;
2. the exact clean release head receives a successful Vercel check;
3. the clean Stage 18 PR is merged intentionally;
4. merged-main CI passes; and
5. the production Vercel deployment is confirmed healthy.

No additional product scope is authorised inside this release gate.
