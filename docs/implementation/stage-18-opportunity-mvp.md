# Stage 18 — Opportunity MVP

**Status:** Implementation candidate  
**Date:** 2026-08-17

## Goal

Connect a Builder's existing development evidence to curated real-world opportunities through transparent eligibility and readiness logic, while keeping supply vetted, private data protected and application outcomes truthful.

## Builder experience

`/opportunities` presents active reviewed opportunities that are not definitely incompatible with the Builder's declared age/country or already past deadline. Each card shows:

- provider and opportunity category;
- eligibility and benefit summary;
- deadline and geography;
- a deterministic match tier;
- why the opportunity may fit;
- eligibility/readiness items still to check;
- save state;
- self-reported application and outcome state;
- a controlled link to the official opportunity page.

Match tiers are **Strong match**, **Possible match** and **Eligibility check**. These are product navigation labels, not employability scores or guarantees.

## Matching inputs

Stage 18 may use only:

- declared `age_band` and `is_minor`;
- `country_code` when already present on the private profile;
- the Builder's currently selected Economic Pathway name and skill labels;
- capability labels/levels from the current Living Builder Profile;
- administrator-authored opportunity tags and eligibility fields.

When exact age or geography cannot be resolved from stored data, Stage 18 reports the uncertainty instead of inferring it.

## Supply workflow

`/admin/opportunities` is restricted to active PipuPath platform administrators. Owner/operator roles can create and edit supply, explicitly review it, publish approved items and withdraw publication. Analyst/moderator roles may inspect but cannot mutate supply in Stage 18.

Any material edit resets the item to pending review and draft publication.

## Persistence

Stage 18 adds:

- `opportunities` — administrator-controlled vetted supply;
- `builder_opportunity_state` — private save/application/outcome state.

Both tables have RLS enabled and no direct `public`, `anon` or `authenticated` table grants. All Builder and admin behavior passes through allow-listed authenticated RPCs with server-side role/ownership checks.

## Analytics

Stage 18 extends the existing `product_events` vocabulary with bounded opportunity interaction events and the `opportunities` feature key. It does not introduce another analytics table.

## Safety and privacy

- HTTPS official URLs only.
- Definite minor/adult-only conflicts are excluded.
- No betting, gambling, speculative trading, borrowing or get-rich opportunity copy is accepted by the application contract.
- No provider receives private Builder profile/pathway/evidence data.
- No automatic applications, messages or contact sharing.
- Saved/application/outcome state remains private.
- Outcomes are labelled self-reported unless a future verification process proves them.

## Release gate

Stage 18 is complete only after repository validation, authorised migration/security verification, curated-supply lifecycle proof, deterministic matching tests, one deliberate authenticated Vercel Preview proof, exact-head CI/Vercel checks, intentional merge after Stage 17 release, merged-main CI and production health all pass.
