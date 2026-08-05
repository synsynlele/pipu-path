# PipuPath project state

**Current stage:** Stage 10 — MVP Launch Readiness

**Stage status:** RELEASE CANDIDATE READY — MANUAL GOOGLE OAUTH COMPLETION PENDING

**Completed stages:** Stage 0, Stage 1, Stage 2, Stage 3, Stage 4,
Stage 5, Stage 6, Stage 7, Stage 8 and Stage 9

**Current Git baseline:** `agent/stage10-mvp-launch-readiness`, created from
verified Stage 9 head `9d0071273654a89d14fe6f60b03a13dc65532ba1`

**Review surface:** GitHub pull request #13, draft and unmerged

**Infrastructure:** authorised disposable non-production Supabase staging
`kvjcswnmhwegpakbtvlh`; production untouched

**Last verified:** 2026-08-05

## Stage 10 release candidate

Stage 10 is the final MVP stage. It hardens and integrates the complete Stage
0–9 Builder loop without expanding the product.

The release candidate includes:

- one shared first-incomplete progression resolver for Google OAuth, email login
  and returning users;
- PKCE callback exchange with session cookies copied to the redirect response;
- trusted Preview origins, safe internal redirects and password-recovery routing;
- a University for Human Potential landing page;
- white, royal-blue, navy and restrained-gold shared design primitives;
- five-item authenticated navigation: Home, Journey, Build, Portfolio, Profile;
- a real-data Home and contextual Build route;
- shared loading, safe error, retry and not-found experiences;
- accessible focus, reduced-motion and mobile bottom-navigation behavior;
- deterministic system-font builds with no Google Font network dependency;
- security headers, robots and application manifest;
- an atomic Supabase authentication limiter suitable for Vercel scaling; and
- route, service, domain, security, OAuth, release, rollback and debt records.

## Verified release evidence

- Stage 10 migrations `202608050020` and `202608050021` are recorded on
  authorised staging.
- `auth_rate_limit_buckets` has RLS, no client policies and no direct browser
  table grants.
- The bounded limiter RPC allows attempts one and two, denies attempt three for
  a two-attempt test window, rejects invalid inputs and stores only SHA-256
  bucket keys.
- GitHub Actions run `31007512086` passed the complete repository validator and
  authenticated desktop/mobile staging E2E on application head
  `1cd75350086d39fbbc8ea8211e56e6f05349f8de`.
- Repository validation passed formatting, zero-warning lint, strict
  TypeScript, 109 unit tests, 92 structural/integration checks, coverage
  thresholds and the Next.js production build.
- The authenticated browser matrix passed Stage 0–9 recovery, email login,
  anonymous denial, simplified mobile navigation and the public Portfolio
  lifecycle against the exact branch Preview.
- Matching READY Preview deployment:
  `dpl_3rb1Qz2Kf2xoFUiBqmxZnzQdAvzu`.
- The exact Preview emitted no warning, error or fatal runtime logs during the
  verification window.
- Supabase contains two Google identities, proving the configured staging
  provider has completed real Google sign-in historically. The final release
  candidate also includes a live browser assertion that the Google handoff
  reaches Google with the exact environment callback URL.
- Production resources were not touched.

## Remaining launch gate

A human must complete Google account selection once on the final release
candidate and confirm that the callback establishes a session and routes the
account to identity setup, its next incomplete stage or authenticated Home.
PipuPath cannot automate or impersonate this credential-controlled step.

Stage 10 must remain a release candidate—not COMPLETE—until that manual result is
recorded in PR #13. After it passes, no additional product build is expected;
the release candidate may be approved for deliberate production promotion.

## Boundary

Do not add Builder directories, search, messaging, followers, likes, comments,
rankings, communities, mentors, team Projects, opportunities, employment,
funding, payments, marketplaces, new AI providers, native apps or enterprise
analytics. Stage 10 finishes the MVP.
