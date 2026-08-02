# PipuPath project state

**Current stage:** Stage 5 — Practical Mission MVP

**Stage status:** COMPLETE

**Completed stages:** Stage 0, Stage 1, Stage 2, Stage 3, Stage 4, Stage 5

**Current Git baseline:** Stage 5 implementation and closure through `fe9440a42e178fd4c51b648b1124c09ab6dc48d9`

**Infrastructure:** disposable non-production Supabase staging
`kvjcswnmhwegpakbtvlh`; Vercel branch Preview for
`agent/stage5-practical-mission`

**Last verified:** 2026-08-02

## Verification status

Stage 4 reuses the Stage 4.1 private evidence, consent, safeguarding,
provenance, feedback and profile-version structures. Migrations
`202607300007`–`010`, Stage 4 execution migration `202607300011`, and
pgcrypto search-path repair `202608020012` are applied to confirmed staging.

Google Gemini runs only on the server. A completed Discovery now generates the
six-section private Human Potential Profile, persists it with evidence links and
model metadata, survives refresh, accepts persistent per-insight feedback and
stops at the Stage 5 boundary. Provider timeouts, unavailable service, invalid
JSON/output, missing configuration, unauthenticated access and incomplete
Discovery fail safely.

GitHub Actions run
[30768699971](https://github.com/synsynlele/pipu-path/actions/runs/30768699971)
passed both full `validate` and authenticated staging E2E against the matching
Vercel Preview. The browser suite proves anonymous protection, login, persisted
Discovery recovery, live profile rendering, refresh, feedback persistence,
Continue behavior and narrow-screen access.

## Stage 5 completion

The Stage 5 source implements a private practical mission contract, the existing
server-only Gemini adapter path, a three-attempt request lifecycle per profile,
validated evidence references, refinement/regeneration, one-active-mission
activation, refresh recovery and an honest Stage 6 boundary. Migration
`202608020013` is applied to disposable staging (recorded remotely as
`20260802223224_stage_5_practical_mission`). RLS, ownership policies,
service-role grants and the one-active-mission indexes are verified.

GitHub Actions run
[30771717930](https://github.com/synsynlele/pipu-path/actions/runs/30771717930)
passed full validation and authenticated staging E2E. The live suite proves
Gemini generation, bounded refinement, persistence, activation, refresh,
anonymous/mobile protection and the Stage 6 boundary. The repository gate
includes 60 unit tests and 30 structural integration checks.

## Security findings

- Profile generation and Gemini credentials remain server-side.
- Stage 4 relations retain RLS and deny anonymous access.
- Privileged execution functions remain restricted to `service_role`.
- Ownership, active consent, completed Discovery and safeguarding eligibility
  are checked before interpretation.
- Sensitive evidence remains redacted from provider projection.
- Persisted insights retain same-owner, same-request evidence provenance.
- Provider diagnostics persist only allowlisted status codes; prompts, answers,
  credentials and provider response bodies are not logged.

## Known technical debt

- Resolve the recorded development-only dependency advisories when compatible
  patched dependency lines are available; production dependencies remain clean.
- Replace the Stage 2 in-process rate limiter before production.
- Complete legal, privacy, retention and child-safeguarding review.

## Exact next vertical slice

Stage 6 Journey is the exact next boundary and has not started. Journey, Quests,
XP, Reflection, Builder Network, public sharing, analytics and queues remain
outside scope.

## Reproduction

```sh
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run validate
```

Remote proof: GitHub Actions run `30771717930`.
