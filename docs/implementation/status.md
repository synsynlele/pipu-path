# Implementation status

**Current stage:** Stage 26 — Exact Mobile Experience Rebuild  
**Stage status:** MOBILE RENDERER STABILITY RELEASE CANDIDATE — repeated Android Lite renderer crashes are now a release blocker; the correction is isolated for CI and exact-Preview proof.
**Stage 26 production:** `e5fbee6ccf503c77ae006b2da116eb1d6497a190`
**Correction branch:** `agent/stage-26-mobile-renderer-stability`
**Stage authority:** `docs/stages/stage-26-exact-mobile-experience-rebuild.md`  
**Last updated:** 2026-09-01

## Released baseline

Stage 26 — Exact Mobile Experience Rebuild is released in production from merge commit `a31f950b478b7e3a9d483c351865e72c884d5bc2`.

Stage 25 preserves the complete Stage 0–24 developmental engine and leaves PipuPath as one installable responsive Next.js/PWA product. Android/Chromium installation continues to use the browser-native prompt when available, iOS continues to require explicit Add to Home Screen guidance, and `/continue` remains the installed-app start URL.

## Stage 26 direction

The approved mobile concept is now a release specification rather than inspiration. Stage 26 therefore rebuilds screen composition and interaction hierarchy instead of decorating the former dashboard layouts.

The mobile experience is organised around:

- Home — real Builder state, Mission, next move and truthful momentum;
- Discover — living evidence-led self-understanding;
- Build — Journey, Quest, evidence, reflection and Projects presented as one action centre;
- Connect — safe relevant Builder discovery and collaboration without popularity mechanics or unrestricted messaging;
- Profile — the Living Builder identity, proof, Vault, Passport, Projects and developmental signals;
- Onboarding — Account → Identity → Discovery → Direction → first meaningful Home state;
- Admin / Mission Control — preserved as a separate operator layer.

## First implementation slice

The first Stage 26 implementation slice is intentionally presentation-first and does not add Supabase migrations.

It includes:

- a scoped light consumer-product surface system under the authenticated AppShell while preserving the PipuPath indigo/navy identity;
- premium mobile top chrome and a white fixed five-tab bottom navigation with elevated Build action;
- custom concept-matched vector illustration assets;
- a recomposed Home screen using only saved Builder state;
- a recomposed Discover screen;
- a new unified `/build` action centre rather than a redirect-only route;
- upgraded shared onboarding shell;
- route skeleton/loading treatment for the five primary Builder destinations;
- reduced-motion and safe-area support.

Connect and Profile already inherit the new authenticated surface grammar in this slice; any remaining structural mismatch identified during Stage 26 visual proof must be corrected before release.

## Data / migration state

No Supabase migration is introduced by this slice. Existing RLS, onboarding, Human Potential Profile, Mission, Journey, Quest, evidence, reflection, progression, Projects, Connect, collaboration, Opportunities, Living Profile, Portfolio, Passport, safeguarding and Admin authorization remain authoritative.

## Release posture

Canonical CI #1225 passed on repaired application/test head `5bf1e49e2acf845a274f3bae985245a703cd3d72` after stale presentation assertions and nondeterministic React test teardown were corrected.

Exact application Preview deployment `dpl_C31pZv8xczmqC49tWVjb12z4gjeH` reached READY at `https://pipu-path-ma0g7xpk1-copyartint-2860s-projects.vercel.app`.

Authenticated Preview CI #1226 passed the release browser matrix on desktop Chrome and iPhone 13. It verified the five primary destinations, onboarding privacy, safeguarding, Admin isolation, deep product routes, horizontal overflow boundaries and PWA manifest behaviour. Public browser inspection also confirmed install access, protected `/app` routing with its return target and no PipuPath-originated console errors.

No Supabase migration is required.

## Visual perfection correction

Post-release visual inspection identified that Stage 23 inline fallback colours in the shared Button and Surface primitives were overriding Stage 26 CSS on deep routes. Build and Guide also lacked the shared authenticated shell, while Connect and Profile layouts added redundant secondary navigation above their concept-matched pages.

The correction:

- removes inline visual authority from Button and Surface primitives so CSS scopes can work predictably;
- resolves shared panel, raised-panel, soft-surface, foreground, muted and border semantics through the Stage 26 AppShell scope;
- preserves the Stage 23 dark identity for public/auth surfaces outside AppShell;
- restores the five-tab AppShell to Build, Guide and Institution;
- removes redundant Connect/Profile layout toolbars without removing destination access;
- keeps every Supabase action, DAL, domain rule, route and safeguard unchanged.

Local evidence: formatting, zero-warning lint, strict TypeScript, 335 unit/coverage tests, 226 integration/regression tests and the Next.js production build pass.

## Mobile QA correction

Direct production use identified four phone-specific presentation defects and one transient client crash report. The correction restores the gold-P brand mark in the mobile shell, keeps a compact Install control visible in browser mode, gives light actions an explicit high-contrast variant, moves personalised hero progress into normal document flow and stacks action rows below 430px. Authenticated browser traversal now fails on uncaught client page errors in addition to route, overflow and application-error checks. Production server telemetry showed no runtime error cluster or 5xx response during the reported crash window.

## Mobile renderer stability correction

Repeated Android Lite `tab crashed / reload` reports on 2026-09-01 elevate the earlier transient report to a release blocker. Android Lite is a Chromium Trusted Web Activity, so this message represents loss of the browser renderer process rather than a normal Next.js error boundary.

Production telemetry during the repeat-crash window showed successful application traffic and no 5xx cluster, but it did expose `refresh_token_not_found` from Supabase middleware for a stale client session. The Stage 26 authenticated surface also kept a live `backdrop-filter: blur(22px)` on the fixed mobile navigation and a second large CSS `filter: blur(34px)` hero layer, both of which force extra compositing on constrained Android renderers.

The isolated correction therefore:

- removes live backdrop filtering from fixed mobile navigation while preserving the same opaque white visual hierarchy;
- replaces the phone hero CSS filter with a non-filtered radial gradient;
- treats only Supabase `refresh_token_not_found` as an expired local session, clears stale Supabase auth cookies and returns the user to the normal signed-out routing path;
- preserves all other auth failures as errors rather than swallowing them;
- changes no domain, persistence, safeguarding or migration contract.

Canonical CI and exact-Preview phone proof are required before this correction can merge.

> **The screen is not the game. Life is the game.**

> **Make building feel as natural as socialising. Keep life as the game.**
