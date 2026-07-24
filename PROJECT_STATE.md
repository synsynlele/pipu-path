# PipuPath project state

**Current stage:** Stage 2.6 external verification

**Stage status:** BLOCKED

**Completed stages:** Stage 0, Stage 1

**Infrastructure:** Supabase staging `kvjcswnmhwegpakbtvlh`; Vercel staging
`https://pipu-path.vercel.app`

**Current Git baseline:** `cd011cdc897e32e807d2ca66e2e45f4bd8c42e6c`

**Last verified:** 2026-07-24

## Verification

Migrations, clean replay, catalog security, remote generated types, pgTAP,
anonymous and authenticated API/RLS, signup, confirmation, login, delivered
recovery email, recovery callback, password update, invalid credentials,
duplicate signup, refresh, logout, Google OAuth, identity checkpoint,
dashboard access, HTTP smoke, unit/integration tests, production build, audit
and secret scan pass.

## Security findings

Inherited Supabase default table grants allowed protected-column updates and
default function grants exposed security-definer entry points. Append-only
migrations `202607240002` and `202607240003` repaired both findings. The
repeatable RLS matrix now passes.

The first Vercel browser verification found that dynamic access to the
`process.env` object prevented Next.js from inlining the public Supabase
configuration. Public variables now use explicit build-time references and the
regression is covered by a unit test.

The repaired build then exposed invalid nested home links in the authentication
shell. The invalid wrapper was removed so React can hydrate authentication
controls, with component regression coverage.

OAuth initiation now runs through a server action rather than browser-side
configuration. This keeps PKCE cookie handling and provider redirects inside
the server boundary and removes a deployment-specific client configuration
dependency.

Live recovery verification found that the redirect allowlist omitted
`/reset-password`, causing a valid recovery session to fall back to `/app`.
The recovery destination is now explicitly allowlisted with regression
coverage. A fresh delivered recovery link reached the password form; a new
password was accepted, subsequent login passed and logout cleared the session.
The provider rejects reuse of the existing password, so the public error mapper
now gives a safe, actionable instruction for that case.

## Technical debt and blockers

- Install a supported Playwright browser in CI or another controlled runner and
  execute the committed browser suite against staging. The current sandbox
  receives an empty browser archive from the Playwright CDN.
- Expand the repeatable browser suite to cover the complete authenticated
  email, recovery, OAuth, checkpoint, preference, consent and isolation matrix
  without personal credentials or uncontrolled inbox state.
- Replace in-process rate limiting before production.
- Complete legal, privacy and child-safeguarding review.

## Exact next slice

Remain in Stage 2.6: run the complete deterministic browser matrix from a
controlled runner with installed browsers, record the results and close Stage
2 only if every mandatory gate passes. Stage 3 remains locked.

## Reproduction

```sh
npm ci
npm run verify:remote:read-only
npm run verify:staging:auth
npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" --schema public
npm run test:coverage
npm run test:integration
E2E_BASE_URL=https://pipu-path.vercel.app npm run test:e2e
npm run validate
npm audit --audit-level=high
```
