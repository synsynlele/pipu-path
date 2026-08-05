# PipuPath project state

**Current stage:** Stage 9 — Selective Project Portfolio

**Stage status:** COMPLETE

**Completed stages:** Stage 0, Stage 1, Stage 2, Stage 3, Stage 4,
Stage 5, Stage 6, Stage 7, Stage 8 and Stage 9

**Current Git baseline:** `agent/stage9-selective-project-portfolio`, stacked on
the verified Stage 8 closure `ea129d141458e1916b5eadd129482a6bc3706747`

**Verified implementation commit:**
`4627036f03844237c28011268c413906f4180bf5`

**Review surface:** GitHub pull request #11

**Infrastructure:** authorised disposable non-production Supabase staging
`kvjcswnmhwegpakbtvlh`; matching Vercel Preview deployment
`dpl_EP4S38KVbzmf6oG1T15At7XsUXZ3`

**Last verified:** 2026-08-05

## Stage 9 completion

Stage 9 converts one owned completed private Project into one selective public
proof of work. The Builder prepares public-safe copy in a private Portfolio
Studio, reviews an exact preview, explicitly consents to publication and may
withdraw or republish the same stable public slug.

Publishing is adult-only in this MVP and blocked for safeguarding-flagged
accounts. Under-18 Builders retain every private PipuPath capability; their
public publication remains locked until a dedicated guardian-consent and
safeguarding workflow exists.

The public projection contains only approved presentation fields. Private Quest
evidence, Nortnspoil reflections, raw Project updates, contact information,
private profile fields and internal identifiers remain excluded.

## Verification evidence

- Migration `202608040019_stage_9_selective_project_portfolio.sql` is applied
  and verified on authorised disposable staging.
- `builder_project_portfolios` has RLS and one owner-read policy.
- Authenticated users receive SELECT only; all lifecycle mutations use
  controlled ownership-checking RPCs.
- Anonymous access is limited to an eleven-field public-safe RPC projection.
- Unknown or withdrawn proof slugs are rejected before React streaming and
  return a transport-level HTTP 404.
- GitHub Actions run `30993330779` passed both `validate` and `staging-e2e`.
- Repository validation passed formatting, zero-warning lint, strict
  TypeScript, 91 unit tests, 77 structural/integration checks, coverage
  thresholds and production build.
- Authenticated staging E2E passed 21 tests with 7 intentional duplicate-flow
  skips across Chromium and mobile coverage.
- The browser matrix proved private draft recovery, exact preview, explicit
  publication, anonymous safe viewing, withdrawal to HTTP 404, republishing on
  the same slug, refresh recovery, anonymous private-route denial and mobile
  usability.
- Vercel runtime logs on deployment `dpl_EP4S38KVbzmf6oG1T15At7XsUXZ3`
  recorded the same stable proof slug transitioning `200 → 404 → 200`.
- Final staging reconciliation confirmed the proof is published again through
  the stable slug `neighbourhood-reading-proof-1dd2ebd1` and the public RPC
  returns only the approved eleven fields.
- Production resources were not touched.

## Explicit boundary

Stage 9 does not introduce Builder directories, search, follows, likes,
comments, messaging, rankings, collaboration, mentor assessment, team Projects,
opportunity matching, funding, employment or marketplace behavior.

Stage 10 has not started. Its scope must be locked through an accepted ADR before
implementation begins.

## Known technical debt carried forward

- Resolve recorded development-toolchain dependency advisories when compatible
  patched dependency lines are available.
- Replace the Stage 2 in-process rate limiter before production.
- Complete legal, privacy, retention and child-safeguarding review.
- Optimise CI browser installation and build caching without weakening gates.
- Consolidate the isolated Stage 7/8/9 Supabase adapters into the canonical
  generated database client during a dedicated maintenance slice.

## Reproduction baseline

```sh
npm ci
npm run validate
npm run test:e2e
```
