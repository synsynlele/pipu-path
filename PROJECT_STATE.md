# PipuPath project state

**Current stage:** Stage 3 — Discovery and persistent onboarding

**Stage status:** COMPLETE

**Completed stages:** Stage 0, Stage 1, Stage 2, Stage 3

**Current Git baseline:** `7626b8be5dd83115ee720f00096de296ba85f278`

**Infrastructure:** disposable non-production Supabase staging
`kvjcswnmhwegpakbtvlh`; Vercel staging
`https://pipu-path.vercel.app`

**Last verified:** 2026-07-30

## Verification status

Stage 3 migrations `202607240004`–`006` are applied to confirmed staging.
The 24-assertion pgTAP RLS suite and 12-check synthetic API flow pass.
Generated TypeScript matches the verified remote schema. GitHub Actions run
[30546184628](https://github.com/synsynlele/pipu-path/actions/runs/30546184628)
passed `validate` and the staging browser matrix after an exact synthetic
fixture reset. The browser run covered login, start, all 15 questions,
server-confirmed persistence, resume, review, edit, completion, refresh
recovery, anonymous boundaries, mobile controls and the honest Stage 4
boundary.

## Outstanding blockers

None for Stage 3. Stage 4 has not started.

## Security findings

- Discovery tables deny anonymous and cross-user access.
- Direct mutation, sensitivity downgrade and forced completion are denied.
- Age eligibility, progress, ownership and response validation are server-side.
- Intentional stale-write conflicts use stable application errors rather than
  retryable transaction errors.
- Service credentials remain server-side and no private answer narratives are
  emitted in audit events.
- Production dependency audit (`--omit=dev`) reports zero vulnerabilities.
  The full audit currently reports high-severity advisories confined to the
  ESLint/minimatch/brace-expansion development toolchain; track upgrades
  without forcing incompatible runtime changes.

## Known technical debt

- Resolve the development-only ESLint/minimatch/brace-expansion advisories when
  compatible patched dependency lines are available.
- The interface uses explicit server-confirmed save, not debounced background
  autosave.
- Reopening, deletion/retention automation and consented analytics require
  approved complete lifecycles.
- Replace the Stage 2 in-process rate limiter before production.
- Complete legal, privacy and child-safeguarding review.

## Exact next vertical slice

Stage 4.1 is the Human Potential Profile interpretation contract and provenance
model consuming `Stage4DiscoveryHandoff`. Define explainability, uncertainty,
safety and evidence provenance before any strength, purpose or recommendation
generation. No Stage 4 implementation has begun.

## Reproduction

```sh
npm ci
npm run validate
npm run verify:remote:read-only
npm run verify:staging:discovery
npx supabase test db supabase/tests/stage_3_rls.sql
npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" --schema public
E2E_BASE_URL=https://pipu-path.vercel.app npm run test:e2e
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
```
