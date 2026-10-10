# PipuPath project state

## Current delivery candidate — 9 October 2026

Play release foundation is implemented on an isolated branch from main `19509ee`.
It adds a gated deletion-request flow and operator queue, mobile reliability and
copy corrections, and Android release checks. Local canonical validation passed:
371 unit/coverage tests, 242 integration tests, lint, types, formatting and build.
Thirteen PostgreSQL migration/privilege/constraint checks passed in PGlite; this
does not replace staging Supabase verification. No migration or deployment has
been applied remotely. Formal policies, monitored contact, fulfilment proof,
authenticated browser and physical Android gates remain open. See
`docs/release/play-release-foundation.md`. Stage 26 notes below are historical.

**Current stage:** Stage 26 — Exact Mobile Experience Rebuild

**Stage status:** MOBILE QA CORRECTION RELEASE CANDIDATE — Stage 26 and its shared-design correction are released; gold-P branding, install visibility, narrow-screen collision and client-error gates are locally green and await exact-Preview proof.

**Latest released baseline:** Stage 26 visual consistency correction merged to `main` as `e5fbee6ccf503c77ae006b2da116eb1d6497a190`.

**Stage 26 production application head:** `a31f950b478b7e3a9d483c351865e72c884d5bc2`.

**Mobile QA branch:** `agent/stage-26-mobile-polish`.

**Stage 26 authority:** `docs/stages/stage-26-exact-mobile-experience-rebuild.md`.

**Infrastructure:** Supabase project `kvjcswnmhwegpakbtvlh`; Vercel project `copyartint-2860s-projects/pipu-path`; repository `synsynlele/pipu-path`.

**Last updated:** 2026-09-01

## Product doctrine

> **The screen is not the game. Life is the game.**

> **Make building feel as natural as socialising. Keep life as the game.**

Stage 26 rebuilds the presentation and interaction hierarchy around Home, Discover, Build, Connect and Profile while preserving the Stage 0–25 developmental engine, server authority, privacy, safeguarding, Admin isolation and installable-web architecture. The visual-perfection correction removes legacy inline theme overrides, resolves all authenticated semantic tokens through one light consumer system and restores missing AppShell coverage without changing domain behaviour.

## Release evidence

- Stage 26 production merge `a31f950b478b7e3a9d483c351865e72c884d5bc2` is READY on Vercel;
- visual-perfection local canonical validation passed;
- 334 unit/coverage tests passed;
- 225 integration/regression tests passed;
- strict TypeScript, zero-warning lint, formatting and production build passed;
- shared Button and Surface primitives no longer carry legacy inline colours;
- Build, Guide and Institution now inherit the authenticated five-tab AppShell;
- redundant Connect and Profile secondary navigation bars were removed while their destinations remain available in the page experience;
- protected-route, onboarding privacy, five-destination navigation, safeguarding, Admin isolation, PWA manifest and horizontal-overflow checks passed;
- no Supabase migration is required.

## Final release gates

1. Build and inspect one exact-head Preview on authenticated mobile and desktop routes.
2. Merge the verified visual-perfection pull request into `main`.
3. Confirm the matching Vercel production deployment reaches READY and smoke-test production telemetry.
