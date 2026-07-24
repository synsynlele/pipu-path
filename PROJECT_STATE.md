# PipuPath project state

**Current stage:** Stage 2.6 external verification

**Stage status:** BLOCKED

**Completed stages:** Stage 0, Stage 1

**Infrastructure:** Supabase staging `kvjcswnmhwegpakbtvlh`; Vercel staging
`https://pipu-path.vercel.app`

**Current Git baseline:** `63c1e93727dc5a79d5b36aca541ef30273cdfc18`

**Last verified:** 2026-07-24

## Verification

Migrations, clean replay, catalog security, remote generated types, pgTAP,
anonymous and authenticated API/RLS, signup, confirmation, login, recovery
tokens, password update, invalid credentials, duplicate signup, refresh,
logout, HTTP smoke, unit/integration tests, production build, audit and secret
scan pass.

## Security findings

Inherited Supabase default table grants allowed protected-column updates and
default function grants exposed security-definer entry points. Append-only
migrations `202607240002` and `202607240003` repaired both findings. The
repeatable RLS matrix now passes.

The first Vercel browser verification found that dynamic access to the
`process.env` object prevented Next.js from inlining the public Supabase
configuration. Public variables now use explicit build-time references and the
regression is covered by a unit test.

## Technical debt and blockers

- Complete actual recovery-email delivery after the hosted email quota resets
  or configure staging SMTP.
- Complete Google OAuth callback with the approved test account.
- Run browser E2E when a browser runtime is available.
- Replace in-process rate limiting before production.
- Complete legal, privacy and child-safeguarding review.

## Exact next slice

Remain in Stage 2.6: finish recovery-email delivery, Google OAuth callback and
browser verification; update records and close Stage 2 only if every mandatory
gate passes. Stage 3 remains locked.

## Reproduction

```sh
npm ci
npm run verify:remote:read-only
npm run verify:staging:auth
npm run test:coverage
npm run test:integration
npm run test:e2e
npm run validate
npm audit --audit-level=high
```
