# Stage 18 — Opportunity MVP

**Status:** Verified stacked release candidate — awaiting Stage 17 release sequence  
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

Closed or withdrawn opportunities are not recommended again. If a Builder previously marked one as applied, it remains visible only for self-reported outcome completion and its external link is disabled.

## Matching inputs

Stage 18 may use only:

- declared `age_band` and `is_minor`;
- `country_code` when already present on the private profile;
- the Builder's currently selected Economic Pathway name and skill labels;
- capability labels/levels from the current Living Builder Profile;
- administrator-authored opportunity tags and eligibility fields.

When exact age or geography cannot be resolved from stored data, Stage 18 reports the uncertainty instead of inferring it. Matching is deterministic and explainable; Stage 18 does not use an AI opportunity score or selection probability.

## Supply workflow

`/admin/opportunities` is restricted to active PipuPath platform administrators. Owner/operator roles can create and edit supply, explicitly review it, publish approved items and withdraw publication. Analyst/moderator roles may inspect but cannot mutate supply in Stage 18.

Any material edit resets the item to pending review and draft publication. Database-side validation normalises country codes and tags and rejects unsafe get-rich, gambling, speculative-trading or borrowing copy even if the UI is bypassed.

## Persistence

Stage 18 adds:

- `opportunities` — administrator-controlled vetted supply;
- `builder_opportunity_state` — private save/application/outcome state.

Both tables have RLS enabled and no direct `public`, `anon` or `authenticated` table grants. All Builder and admin behavior passes through allow-listed authenticated RPCs with server-side role/ownership checks.

The Builder catalog does not contain `official_url`. That URL is resolved only through the authenticated tracked redirect RPC while the opportunity is still reviewed, published and active.

## Analytics

Stage 18 extends the existing `product_events` vocabulary with bounded opportunity interaction events and the `opportunities` feature key. It does not introduce another analytics table.

## Safety and privacy

- HTTPS official URLs only.
- Definite minor/adult-only conflicts are excluded.
- No betting, gambling, speculative trading, borrowing or get-rich opportunity copy is accepted by the application or database contract.
- No provider receives private Builder profile/pathway/evidence data.
- No automatic applications, messages or contact sharing.
- Saved/application/outcome state remains private.
- Outcomes are labelled self-reported unless a future verification process proves them.
- Normal authenticated Builders receive the PipuPath not-available boundary rather than Opportunity Supply data when attempting `/admin/opportunities`.

## Verification completed

- Full repository validation passed on the Stage 18 candidate, including formatting, zero-warning lint, strict TypeScript, **233 unit tests**, structural/integration checks, coverage thresholds and the production build.
- Stage 18 migrations and the append-only review-enum correction are applied to authorised Supabase project `kvjcswnmhwegpakbtvlh`.
- Both Stage 18 tables have RLS enabled; browser roles have no direct table read/write privileges and public RPC execution is restricted to authenticated users.
- A rollback-only database lifecycle proof passed unsafe-copy rejection, normalisation, create → review → publish → save → apply → outcome, material-edit review reset, inactive applied-opportunity outcome continuity, catalog URL redaction and admin audit generation. Cleanup confirmed zero synthetic proof rows.
- A single deliberate Vercel Preview was produced from Git tree `6b245597b5d62093bc91bf00eae9d7591dd8274d`, identical to the verified Stage 18 application candidate tree.
- The permanent Stage 18 Chromium browser proof passed **3/3** against that Preview: anonymous `/opportunities` denial, authenticated non-admin Opportunity Supply denial, and authenticated Builder evaluate → save → apply → self-reported outcome flow.
- The browser fixture and its cascading Builder state were deleted after verification; cleanup confirmed zero remaining fixture rows.
- The Stage 18 development branch remains Vercel-disabled so documentation/test commits do not consume additional Preview quota.

## Remaining release gate

Stage 18 is **not released** and must remain stacked behind Stage 17. Remaining gates are:

1. release Stage 17 intentionally;
2. retarget/reconcile Stage 18 onto the released `main` history without losing the verified candidate;
3. obtain final exact-head CI/Vercel evidence only where required;
4. merge Stage 18 intentionally;
5. confirm merged-main CI and production Vercel health.
