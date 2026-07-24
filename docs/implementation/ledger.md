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
- Local validation and dependency audit pass after the correction.

Status: BLOCKED pending deployment verification, OAuth callback, recovery
delivery and the complete browser matrix.
