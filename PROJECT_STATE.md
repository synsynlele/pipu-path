# PipuPath project state

**Current stage:** Stage 2.6 external verification  
**Stage status:** IN PROGRESS  
**Completed stages:** Stage 0, Stage 1  
**Infrastructure:** Supabase staging `kvjcswnmhwegpakbtvlh`  
**Last verified:** 2026-07-24

## Verification

Migrations, catalog security, remote generated types, pgTAP, anonymous API,
unit/integration tests, production build and dependency audit pass. Email
confirmation/lifecycle, Google OAuth completion and browser E2E remain open.

## Security findings

Inherited Supabase default table grants allowed protected-column updates and
default function grants exposed security-definer entry points. Append-only
migrations `202607240002` and `202607240003` repaired both findings. The
repeatable RLS matrix now passes.

## Technical debt and blockers

- Complete approved email confirmation, duplicate, recovery and session tests.
- Complete Google OAuth interaction with the approved test account.
- Run browser E2E when a browser runtime is available.
- Replace in-process rate limiting before production.
- Complete legal, privacy and child-safeguarding review.

## Exact next slice

Remain in Stage 2.6: finish email, OAuth and browser verification, perform a
clean deterministic migration replay, update records and close Stage 2 only if
all mandatory gates pass. Stage 3 remains locked.

## Reproduction

```sh
npm ci
npm run verify:remote:read-only
npm run test:coverage
npm run test:integration
npm run test:e2e
npm run validate
npm audit --audit-level=high
```
