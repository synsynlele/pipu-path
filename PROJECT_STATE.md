# PipuPath project state

**Current stage:** Stage 2 — Identity and access

**Stage status:** COMPLETE

**Completed stages:** Stage 0, Stage 1, Stage 2

**Infrastructure:** Supabase staging `kvjcswnmhwegpakbtvlh`; Vercel staging
`https://pipu-path.vercel.app`

**Current Git baseline:** `2d50062c3b1e08a5932535f736aac30d7695547e`

**Last verified:** 2026-07-24

## Verification

Migrations, clean replay, catalog security, remote generated types, pgTAP,
anonymous and authenticated API/RLS, signup, confirmation, login, delivered
recovery email, recovery callback, password update, invalid credentials,
duplicate signup, refresh, logout, Google OAuth, identity checkpoint,
dashboard access, HTTP smoke, unit/integration tests, production build, audit,
secret scan and repeatable desktop/mobile staging browser tests pass.

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

## Outstanding blockers

None for Stage 2.

## Known technical debt

- Expand the repeatable browser suite to cover the complete authenticated
  email, recovery, OAuth, checkpoint, preference, consent and isolation matrix
  without personal credentials or uncontrolled inbox state.
- Replace in-process rate limiting before production.
- Complete legal, privacy and child-safeguarding review.

## Exact next slice

Stage 3.1 — implement the first Potential Signal Discovery vertical slice:
versioned assessment definition, authenticated assessment attempt creation,
durable resumable response capture, ownership/RLS, progress recovery,
accessibility, observability and deterministic tests. Do not implement AI
synthesis until evidence capture is persistent and verified.

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
