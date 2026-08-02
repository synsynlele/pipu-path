# PipuPath project state

**Current stage:** Stage 4 — Human Potential Profile MVP

**Stage status:** COMPLETE

**Completed stages:** Stage 0, Stage 1, Stage 2, Stage 3, Stage 4

**Current Git baseline:** Stage 4 implementation and closure through `099c59c8c3f954413fd0d2c81de2f96def7ddb3e`

**Infrastructure:** disposable non-production Supabase staging
`kvjcswnmhwegpakbtvlh`; Vercel branch Preview for
`agent/stage4-1-provenance`

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

## Outstanding blockers

None for Stage 4. Stage 5 has not started.

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

Stage 5 boundary only. Mission, Journey, Quests, Reflection, Builder Network,
public profiles, multi-provider execution, analytics and queue infrastructure
have not started and require separate authorization.

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

Remote proof: GitHub Actions run `30768699971`.
