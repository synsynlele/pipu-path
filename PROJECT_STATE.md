# PipuPath project state

**Current stage:** Stage 3 — Discovery and persistent onboarding

**Stage status:** BLOCKED only on deployed authenticated browser verification

**Completed stages:** Stage 0, Stage 1, Stage 2

**Current Git baseline:** `058d16793671a4f16fd062ee8025ba6e5a6eaf2`

**Infrastructure:** disposable non-production Supabase staging
`kvjcswnmhwegpakbtvlh`; Vercel staging
`https://pipu-path.vercel.app`

**Last verified:** 2026-07-24

## Verification status

Stage 3 migrations `202607240004`–`006` were dry-run and applied to confirmed
staging. The 24-assertion pgTAP RLS suite and 12-check synthetic API flow pass,
with fixture cleanup. Generated TypeScript exactly matches the remote schema.
Formatting, zero-warning lint, strict TypeScript, 25 unit/component tests,
21 structural integration assertions, coverage and production build pass.
Dependency audit reports zero vulnerabilities and no credential values are
tracked.

## Outstanding blocker

The Stage 3 commit must deploy and the authenticated browser flow must then
prove login, start, persistence, review/edit, completion and refresh recovery.
Stage 3 is not marked complete until this passes.

## Security findings

- Discovery tables deny anonymous and cross-user access.
- Direct mutation, sensitivity downgrade and forced completion are denied.
- Age eligibility, progress, ownership and response validation are server-side.
- Migration `202607240006` translates intentional stale-write conflicts away
  from retryable SQLSTATE `40001`, preventing SDK retry hangs.
- Internal migrated function implementations have execution revoked; only
  stable controlled wrappers are granted.
- Audit events and test output contain no private answer narratives.

## Known technical debt

- The interface uses explicit server-confirmed save, not debounced background
  autosave.
- Reopening, deletion/retention automation and consented analytics require
  approved complete lifecycles.
- Replace the Stage 2 in-process rate limiter before production.
- Complete legal, privacy and child-safeguarding review.

## Exact next vertical slice

After the browser gate closes Stage 3, Stage 4.1 is the Human Potential Profile
interpretation contract and provenance model consuming
`Stage4DiscoveryHandoff`. It must define explainability, uncertainty and safety
before any strength, purpose or recommendation generation. Stage 4 has not
started.

## Reproduction

```sh
npm ci
npm run validate
npm run verify:remote:read-only
npm run verify:staging:discovery
npx supabase test db supabase/tests/stage_3_rls.sql
npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" --schema public
E2E_BASE_URL=https://pipu-path.vercel.app npm run test:e2e
npm audit --audit-level=high
```
