# Implementation ledger

Append entries; do not rewrite history.

## 2026-07-24 — Stage 0–1 foundation

### Authorized scope

Create a new PipuPath repository and complete Stage 0 and Stage 1 only.

### Implemented

- Locked Engineering Constitution and developmental loop
- Stage map, capability boundaries, quality attributes, and initial ADRs
- Next.js App Router and strict TypeScript foundation
- PipuPath design tokens, primitives, public shell, and application shell
- Environment schema and structured logging boundary
- Error, loading, and not-found experience foundations
- Unit/component test harness with coverage gates
- Formatting, lint, type, test, build, and CI quality gates

### Explicitly not implemented

- Authentication, user records, authorization, consent, or safeguarding flows
- Database, persistence, migrations, or product entities
- AI providers, prompts, recommendations, or generated profiles
- Journeys, quests, evidence, projects, networks, impact, or opportunity data

### Validation evidence

- `npm run format:check` — passed
- `npm run lint` — passed with zero warnings
- `npm run typecheck` — passed
- `npm run test:coverage` — 11/11 tests passed
- Coverage — 92.59% statements, 94.73% branches, 87.5% functions, 92.59% lines
- `npm run build` — passed; `/`, `/app`, and `/api/health` generated
- Production runtime smoke — `/`, `/app`, and `/api/health` returned HTTP 200
- Security headers — verified on the health endpoint
- `npm audit --audit-level=high` — zero known vulnerabilities after safe
  transitive dependency overrides

### Stage boundary

Stage 0 and Stage 1 are complete. Work stops before identity, authentication,
persistence, consent, or onboarding implementation.

## 2026-07-24 — Stage 2 reconstruction and staging verification

- Reconstructed real email/Google authentication, SSR sessions, protected
  routes, private identity, preferences, append-only consent and checkpoint.
- Applied three ordered migrations to authorised disposable staging.
- Generated and reconciled database types from staging.
- Found and repaired inherited table and security-definer function privileges.
- Passed 19/19 pgTAP RLS assertions and anonymous API denial probes.
- Created two approved users; confirmation remains pending.
- Production build and dependency audit passed.

Status: PARTIAL. Stage 3 remains locked.

### Stage 2.6 continuation evidence

- Both approved inbox aliases confirmed successfully.
- Authenticated API suite passed 19/19 assertions.
- Recovery token, callback, password update and invalid-token behavior passed.
- Actual recovery delivery hit the hosted email quota after signup delivery.
- Google initiation passed; interactive callback completion remains blocked.
- Three migrations replayed successfully from an empty transaction.
- HTTP route smoke, production build, audit and secret scan passed.
- Browser installation failed because the permitted download returned an empty
  artifact; browser E2E remains unexecuted.

Status: BLOCKED. No Stage 3 work is authorised.

### Stage 2.6 deployment verification

- Published the clean three-commit repository to private GitHub.
- Deployed the application to `https://pipu-path.vercel.app` with staging-only
  Supabase infrastructure.
- Verified public routes and anonymous protected-route redirects over HTTPS.
- Browser verification exposed dynamic `process.env` access that prevented
  Next.js from inlining `NEXT_PUBLIC_*` values.
- Replaced the dynamic browser lookup with explicit build-time references and
  added regression coverage.
- Live verification of that fix exposed an invalid nested brand link that
  prevented React from hydrating the OAuth control. Removed the duplicate link
  wrapper and added component regression coverage.
- Moved Google OAuth initiation from a client handler to a server action so
  PKCE state, callback construction and provider redirects use the server
  boundary consistently across deployment environments.
- A delivered recovery link completed authentication but fell back to the
  dashboard because `/reset-password` was absent from the safe redirect
  allowlist. Added only that controlled destination and regression coverage.
- Local validation and dependency audit pass after the correction.

Status: BLOCKED pending deployment verification, OAuth callback, recovery
delivery and the complete browser matrix.

### Stage 2.6 live authentication continuation

- Verified Google OAuth initiation, callback, profile reconciliation, identity
  checkpoint, dashboard access, session restoration, repeated sign-in, logout
  and protected-route behavior with the approved staging account.
- Verified delivered password-recovery email, corrected callback destination,
  password update, login with the new password and logout.
- Added a privacy-safe actionable error for attempted password reuse.
- Regenerated database types from confirmed staging; the generated result
  matches the committed types exactly.
- Re-ran anonymous boundary verification, full repository validation and
  dependency audit successfully.
- Corrected Playwright configuration so an explicit `E2E_BASE_URL` targets
  staging without launching a local server.
- A genuine four-test staging E2E run now fails explicitly because browser
  executables are unavailable; installation returns a zero-byte archive.

Status: BLOCKED only on the mandatory repeatable browser matrix. Stage 3
remains locked.

### Stage 2 closure

- Added a dedicated GitHub Actions staging E2E job with controlled Chromium and
  WebKit installation.
- Upgraded GitHub-maintained workflow actions to Node 24-compatible releases.
- `validate` passed remotely.
- `staging-e2e` passed all four committed desktop/mobile browser tests against
  `https://pipu-path.vercel.app`.
- Vercel deployment passed.

Status: COMPLETE. Stage 0, Stage 1 and Stage 2 are complete. Work stops at the
Stage 3 boundary.

## 2026-07-24 — Stage 3 Discovery and persistent onboarding

### Authorized scope

Implement Stage 3 completely and stop before Stage 4 interpretation.

### Implemented

- Evidence-first ADR and complete Discovery architecture
- Versioned seven-section question set with four response types
- Server-enforced age variants and optional sensitive evidence
- Private persistent sessions/responses with idempotent resume
- Controlled save, skip, progress, review and completion state machine
- Optimistic concurrency and stable safe error mapping
- Mobile-first focused question, review/edit and completion routes
- Typed completed-only Stage 4 handoff without AI interpretation
- Privacy-safe audit events, RLS, API verification and documentation maps

### Verification evidence

- Migrations `202607240004`–`006` dry-run and applied to authorised disposable
  staging `kvjcswnmhwegpakbtvlh`
- 24/24 pgTAP Stage 3 RLS assertions passed
- 12/12 repeatable staging API assertions passed with fixture cleanup
- Remote generated types exactly match committed generated types
- `npm run validate` passed: 25 unit tests, 21 integration assertions,
  formatting, zero-warning lint, strict TypeScript, coverage and production
  build
- Dependency audit found zero vulnerabilities
- Secret scan found no credential values in tracked source

### Issues found and repaired

- Changed intentional stale-write conflicts from retryable SQLSTATE `40001` to
  stable application error `P0001`, preventing client retry hangs.
- Moved a plain initial form-state export out of a `"use server"` module after
  the production build correctly rejected the boundary violation.

### Boundary

Stage 3 gathers and preserves evidence only. It does not interpret answers,
generate a Human Potential Profile or start Journeys/Quests. Stage 4 is locked
until the Stage 3 deployment browser matrix passes.

## 2026-07-30 — Stage 3 deployed closure

### Issues found and repaired

- Replaced the hanging server-action form transport with a controlled HTTP POST
  and server-side 303 redirect while retaining the validated application action.
- Removed a malformed obsolete navigation action introduced during remote repair.
- Corrected the final-answer resume rule so zero missing required answers exposes
  the review transition instead of redirecting back to question 15.
- Made the staging browser test wait for streamed controls, support persisted
  review state and use the implemented review/completion language.
- Increased only the full 15-question test budget to 120 seconds.

### Closure evidence

- Confirmed target: disposable non-production Supabase
  `kvjcswnmhwegpakbtvlh`.
- Reset exactly one approved synthetic CI fixture session.
- GitHub Actions run
  [30546184628](https://github.com/synsynlele/pipu-path/actions/runs/30546184628)
  passed both `validate` and `staging-e2e`.
- The browser flow passed login, start, all questions, persistence, resume,
  review, edit, completion, refresh recovery, anonymous protection and mobile
  access checks.
- Production dependencies audit clean with `--omit=dev`; current full-audit
  findings are confined to the development lint/glob toolchain and remain
  recorded technical debt.

Status: COMPLETE. Stage 0 through Stage 3 are complete. Work stops at the Stage
4.1 interpretation-contract boundary.
