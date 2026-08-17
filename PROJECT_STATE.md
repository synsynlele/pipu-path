# PipuPath project state

**Current stage:** Stage 14 — Retention Intelligence Foundation

**Stage status:** RELEASE CANDIDATE — STAGING + AUTHENTICATED PREVIEW VERIFIED

**Released product stages:** Stage 0 through Stage 12

**Current `main` baseline:** `f8029400d3f20e3d0c89febafe572818ecfb9d23`

**Review surface:** GitHub pull request #27

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`; the Stage 14 migration is applied and verified. The Stage 14 Vercel Preview passed its dedicated authenticated Mission Control and telemetry proof. Final exact-head repository validation, merge and production health confirmation remain release gates.

**Last updated:** 2026-08-17

## Product baseline before Stage 14

PipuPath already moves a Builder through one coherent execution loop:

`Discovery → Human Potential Profile → Possible Paths → Choose a Path → Practical Mission → 30-Day Pathway / Journey → HQLS Quests + Evidence → First Value Challenge / Builder Project → reflection → Portfolio / Connect → next growth cycle`

Released capability through Stage 12 includes identity and access, 15-question Discovery, the private Human Potential Profile, Practical Mission, Builder Journey, HQLS Quest execution, evidence and Nortnspoil reflection, XP/progression, Builder Projects, selective public-safe Portfolio proof, Builder Connect, renewable growth cycles and Economic Pathways.

Stage 13 is present on the current `main` baseline and its PipuPath database boundary is verified. It adds the privacy-thresholded KHP-OS institutional cohort bridge, but its final cross-product KHP-OS → PipuPath pairing remains a separate release gate before Stage 13 can be described as fully cross-product verified.

## Stage 14 delivered in the release candidate

Stage 14 creates the first PipuPath product-intelligence and operations foundation without turning the platform into a surveillance product.

The candidate includes:

- a protected `/admin` **PipuPath Mission Control** overview;
- a server-owned `platform_admins` authorization registry;
- auditable administrator access through `admin_audit_events`;
- extension of the existing private `product_events` store rather than introducing a competing analytics system;
- allow-listed `feature_viewed` telemetry for Home, Profile, Journey, Build, Portfolio and Connect;
- aggregate total, new, active and repeat Builder signals;
- Builder Progress Events measured from truthful completed HQLS Quests;
- an all-time developmental funnel from account creation through accepted Builder connection;
- feature-level views, distinct Builders and repeat-use signals;
- truthful measurement language that separates repeat use from cohort retention; and
- explicit exclusion of Discovery answers, Human Potential Profile prose, reflections, evidence text, Project prose, contact details and learner-level institutional data from Mission Control.

## Stage 14 verification evidence

- Migration `20260817162335_stage_14_retention_intelligence_foundation` is applied to authorised staging.
- RLS is enabled on `platform_admins`, `admin_audit_events` and `product_events`.
- `anon` and `authenticated` have no direct table access to the Stage 14 administration/telemetry boundaries.
- Stage 14 aggregate RPCs are executable by `service_role` only.
- Aggregate dashboard queries returned coherent counts without selecting private narrative fields.
- Generated Supabase types contain the Stage 14 tables, enums and RPCs.
- The initial owner administrator membership is active and its bootstrap was audit-recorded.
- Temporary staging-fixture analyst memberships used for authenticated verification were revoked after testing.
- The matching authenticated Vercel Preview passed **3/3 Stage 14 Playwright checks** on application head `1f7dd554673bd59400f842e8bbfa03a3990938d6`: anonymous admin denial, authorised aggregate Mission Control and privacy-safe Connect telemetry.
- Full repository validation has passed on prior Stage 14 application heads during candidate hardening; the final documentation/test-cleanup head must still pass the same validator before merge.

## Retention MVP roadmap locked after Stage 14

The next authorised vertical slices are:

1. **Stage 15 — Builder Collaboration MVP**: convert accepted Builder connections into structured, evidence-producing work without unrestricted messaging or social feeds.
2. **Stage 16 — Living Builder Profile**: evolve the profile from Discovery-only interpretation toward evidence-backed capability development and verification states.
3. **Stage 17 — AI Personal Builder Guide**: use the Builder's own evidence and current path to recommend explainable next actions across the product.
4. **Stage 18 — Opportunity MVP**: connect Economic Pathways, evidence and readiness to vetted external opportunities without income guarantees or pay-to-win access.
5. **Stage 19 — Retention Experiment Release**: compare activation, return behaviour, Builder Progress Events and real-world outcomes across the completed Retention MVP.

## Explicitly deferred

PipuPath is not adding unrestricted direct messaging, algorithmic feeds, followers/likes, popularity rankings, broad communities, payments/escrow, speculative income systems, public leaderboards, complex AI matching, a mentor marketplace, enterprise APIs, Builder Passport or native mobile applications before the Retention MVP produces evidence that those capabilities are justified.

## Immediate release gate

Stage 14 must not be called released until the exact final PR head passes the full repository validator and deployment checks, PR #27 is merged intentionally, the merged `main` CI succeeds and the production Vercel deployment is confirmed healthy.
