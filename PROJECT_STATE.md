# PipuPath project state

**Current stage:** Stage 4.1 — Human Potential interpretation contract and evidence provenance

**Stage status:** COMPLETE

**Completed stages:** Stage 0, Stage 1, Stage 2, Stage 3, Stage 4.1

**Current Git baseline:** Stage 4.1 implementation `e523c5dcc3bdcd767545e6c3f59fedc7c561a964`;
closure records through `4576bbbdea6c85e1ffd321b49c2259cd12ac3e1e`

**Infrastructure:** disposable non-production Supabase staging
`kvjcswnmhwegpakbtvlh`; Vercel branch Preview deployment
`HvTW1zNiYvBwyTeRHyGWuaKCDLsp`

**Last verified:** 2026-07-30

## Verification status

Stage 4.1 migrations `202607300007`–`010` are applied to confirmed staging.
Generated TypeScript was produced from the remote schema and reconciled
(SHA-256
`bee7a507d78254520dae1811652ae9163f129103367a93a62516dade3b6fbc28`).
RLS, grants, controlled functions, ownership, consent, safeguarding,
idempotency, evidence lifecycle and provenance guards pass their repository and
staging verification.

GitHub Actions run
[30570086797](https://github.com/synsynlele/pipu-path/actions/runs/30570086797)
passed both `validate` and the repeatable authenticated staging browser suite
against the matching Vercel Preview. The browser suite proves anonymous
protection, login, persisted Discovery boundary, refresh recovery and
narrow-screen controls without generating an invented profile.

## Outstanding blockers

None for Stage 4.1. Stage 4.2 has not started.

## Security findings

- Stage 4.1 relations have RLS and deny anonymous access.
- Authenticated browser reads are limited to explicitly granted own-root data.
- Provenance children are not directly accessible from browser roles.
- Ownership is derived from `auth.uid()`; service-role capability remains
  server-side.
- Request creation requires completed Discovery, active consent and applicable
  age/safeguarding state.
- Active insights require same-request and same-owner evidence provenance.
- Sensitive evidence is redacted from interpretation projection.
- No live provider credential, provider SDK or private evidence narrative is
  present in client output.

## Known technical debt

- Resolve nine high-severity development-only lint/glob dependency advisories
  when compatible patched dependency lines are available. Production audit is
  clean.
- Replace the Stage 2 in-process rate limiter before production.
- Complete legal, privacy, retention and child-safeguarding review.
- Stage 4.1 creates private drafts only; activation and public projection require
  separately approved lifecycle work.
- Provider execution, retry/backoff, cost controls and operational metrics are
  intentionally deferred to Stage 4.2.

## Exact next vertical slice

Stage 4.2 — controlled interpretation execution. Implement the first
replaceable provider adapter behind the approved contract, with explicit consent
and safeguarding checkpoints, idempotent claim/execute/fail/complete lifecycle,
validated structured output, evidence-linked persistence, privacy-safe logging,
cost limits and deterministic provider doubles for tests. Do not expose a public
profile or begin Journeys/Quests in that slice.

## Reproduction

```sh
npm ci
npm run validate
npm run verify:remote:read-only
npx supabase db push --linked
npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" --schema public
E2E_BASE_URL=https://pipu-path-git-agent-stage4-1-p-49159a-copyartint-2860s-projects.vercel.app npm run test:e2e
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
```

Remote proof: GitHub Actions run `30570086797`.
