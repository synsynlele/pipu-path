# PipuPath project state

**Current stage:** Stage 10 — MVP Launch Readiness

**Stage status:** IN PROGRESS

**Completed stages:** Stage 0, Stage 1, Stage 2, Stage 3, Stage 4,
Stage 5, Stage 6, Stage 7, Stage 8 and Stage 9

**Current Git baseline:** `agent/stage10-mvp-launch-readiness`, created from
verified Stage 9 head `9d0071273654a89d14fe6f60b03a13dc65532ba1`

**Verified Stage 9 implementation:**
`4627036f03844237c28011268c413906f4180bf5`

**Stage 9 review surface:** GitHub pull request #11, ready and unmerged

**Infrastructure:** authorised disposable non-production Supabase staging
`kvjcswnmhwegpakbtvlh`; production untouched

**Last local verification:** 2026-08-05

## Stage 10 objective

Stage 10 is the final MVP stage. It hardens and integrates the complete Stage
0–9 Builder loop; it does not expand the product.

The current integration candidate includes:

- one shared first-incomplete progression resolver for Google OAuth, email login
  and returning users;
- PKCE callback exchange with session cookies copied to the redirect response;
- trusted Preview origins, safe internal redirects and password-recovery routing;
- a new University for Human Potential landing page;
- white, royal-blue, navy and restrained-gold shared design primitives;
- five-item authenticated navigation: Home, Journey, Build, Portfolio, Profile;
- a real-data Home and contextual Build route;
- complete shared loading, safe error, retry and not-found experiences;
- accessible focus, reduced-motion and mobile bottom-navigation behavior;
- deterministic system-font builds with no Google Font network dependency;
- security headers, robots and application manifest;
- an atomic Supabase authentication limiter suitable for Vercel scaling; and
- route, service, domain, security, OAuth, release, rollback and debt records.

Migrations `202608050020` and `202608050021` are applied on authorised staging.
The rate-limit table has RLS and no browser table privileges. The narrow consume
RPC accepts only allow-listed actions and SHA-256 keys. Staging verification
proved attempts one through three are allowed, attempt four is denied, and
invalid actions or raw keys are rejected.

Local validation passes formatting, zero-warning lint, strict TypeScript, 106
unit tests, coverage thresholds, 80 structural/integration checks and the
Next.js production build.

## Remaining Stage 10 gates

- Publish the coherent integration candidate on the Stage 10 branch.
- Build the first matching Vercel Preview and run visual/browser review.
- Verify email authentication and live Google OAuth separately on configured
  staging.
- Run fresh-user, returning-user, refresh, mobile, accessibility, RLS and full
  Portfolio lifecycle matrices.
- Repair every discovered issue in one controlled batch, avoiding unnecessary
  Preview deployments.
- Reconcile runtime logs, staging state and final dependency/debt disposition.
- Prepare one exact release candidate with checklist and rollback evidence.

## Boundary

Do not add Builder directories, search, messaging, followers, likes, comments,
rankings, communities, mentors, team Projects, opportunities, employment,
funding, payments, marketplaces, new AI providers, native apps or enterprise
analytics. Stage 10 finishes the MVP.
