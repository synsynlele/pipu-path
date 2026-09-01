# PipuPath project state

**Current stage:** Stage 26 — Exact Mobile Experience Rebuild

**Stage status:** RELEASE CANDIDATE — canonical validation and authenticated desktop/mobile Preview proof are green; merge and production smoke verification remain.

**Latest released baseline:** Stage 25 merged to `main` as `ebbc4e54dd8408b8392eea55f4e36c026b428cc9`.

**Stage 26 validated application head:** `5bf1e49e2acf845a274f3bae985245a703cd3d72`.

**Stage 26 branch:** `agent/stage-26-exact-mobile-experience`.

**Stage 26 authority:** `docs/stages/stage-26-exact-mobile-experience-rebuild.md`.

**Infrastructure:** Supabase project `kvjcswnmhwegpakbtvlh`; Vercel project `copyartint-2860s-projects/pipu-path`; repository `synsynlele/pipu-path`.

**Last updated:** 2026-09-01

## Product doctrine

> **The screen is not the game. Life is the game.**

> **Make building feel as natural as socialising. Keep life as the game.**

Stage 26 rebuilds the presentation and interaction hierarchy around Home, Discover, Build, Connect and Profile while preserving the Stage 0–25 developmental engine, server authority, privacy, safeguarding, Admin isolation and installable-web architecture.

## Release evidence

- canonical CI #1225 passed;
- 334 unit/coverage tests passed;
- 225 integration/regression tests passed;
- strict TypeScript, zero-warning lint, formatting and production build passed;
- exact application Preview `dpl_C31pZv8xczmqC49tWVjb12z4gjeH` reached READY;
- authenticated Preview CI #1226 passed on desktop Chrome and iPhone 13;
- protected-route, onboarding privacy, five-destination navigation, safeguarding, Admin isolation, PWA manifest and horizontal-overflow checks passed;
- no Supabase migration is required.

## Final release gates

1. Merge the verified Stage 26 pull request into `main`.
2. Confirm the matching Vercel production deployment reaches READY.
3. Smoke-test the canonical production domain and check runtime errors.
