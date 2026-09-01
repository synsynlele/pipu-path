# Implementation status

**Current stage:** Stage 24 — Visual Fidelity & Mobile Install Experience  
**Stage status:** RELEASE CANDIDATE — application validation and exact-tree Preview proof are complete; final PR validation, merge and production smoke verification remain.  
**Stage 24 base:** `a2b50dcf23bc437086d842d684d06af5ed76160a`  
**Validated application head:** `53ab9cc2303bb4b02160108f343837db2090d419`  
**Stage 24 branch:** `agent/stage-24-visual-fidelity-mobile-install`  
**Stage authority:** `docs/stages/stage-24-visual-fidelity-mobile-install.md`  
**Last updated:** 2026-09-01

## Released baseline

Stage 23 — Social-Grade Mobile UX & Installable PWA is released in production from merge commit `a2b50dcf23bc437086d842d684d06af5ed76160a` and remains the production baseline until Stage 24 is merged and verified.

Stage 24 retains that complete developmental engine, privacy model, RLS, safeguarding, evidence lifecycle, five-destination information architecture and resume-first PWA architecture while replacing the remaining dark-first visual treatment and fixing mobile-install discoverability.

## Stage 24 release-candidate visual system

The shared product candidate uses:

- `#f7f8fc` bright neutral background;
- white application surfaces;
- deep navy text;
- indigo/blue actions;
- restrained gold accents;
- soft borders/shadows;
- rounded social-style cards;
- dark navy/indigo as deliberate accents rather than the global canvas.

Shared `Surface`, `Button`, public shell, auth shell, onboarding shell, application shell and navigation use the same visual grammar so deep routes inherit the experience without duplicating domain logic.

### Home

Home is organized around:

- clear personal greeting and Builder progress;
- Mission context;
- one high-contrast Next Move card;
- circular horizontally scrollable path stages;
- truthful momentum rows;
- Builder Guide and Connect support;
- an explicit install card that turns return-to-action into one tap.

### Discover

Discover uses:

- bounded circular lenses;
- living evidence-led insight;
- direction/Journey context;
- lightweight personalised cards;
- no endless feed or personality-ranking mechanics.

## Mobile installation

Installation is always discoverable.

- If `beforeinstallprompt` is available, PipuPath triggers the browser-native install prompt from a user action.
- Otherwise, PipuPath opens a platform-aware instruction sheet.
- iOS guidance uses Share → Add to Home Screen / Open as Web App.
- Android fallback guidance uses Install app / Add to Home screen.
- public and authenticated shells expose an install entry;
- authenticated Home exposes a full install card;
- installed standalone mode hides redundant install entries through display-mode CSS.

The web manifest remains resume-first at `/continue` and uses the bright Stage 24 background/theme colors plus five-destination shortcuts.

## Release validation ledger

The application tree at `53ab9cc2303bb4b02160108f343837db2090d419` passed:

- Prettier ✅
- zero-warning ESLint ✅
- strict TypeScript ✅
- **335 unit/coverage tests** ✅
- **225 integration/regression tests** ✅
- production build ✅

The exact application tree was then deployed once through Preview carrier commit `9f4a168d01b89da0db796447376eb8ce0e1e81e6`. The carrier commit contains no file changes and has the same tree SHA as the validated application head.

One deliberate exact-head Vercel Preview is READY: `dpl_BRewpb2UroYufZjKMn3CZaTcLpp7` reached READY and deployed verification confirmed:

- bright rendered public and authentication surfaces;
- light theme metadata;
- always-visible public Install control;
- valid `standalone` manifest;
- `/continue` installed-app start URL;
- 192/512 any + maskable icons;
- Home, Discover, Build, Connect and Profile shortcuts;
- unauthenticated `/app` protection with return target preserved;
- no error/fatal Preview runtime logs during release proof.

The branch now requires one final canonical CI pass for the release-ledger/test-only edits. Production smoke verification follows the PR #52 merge and is the final operational release check.

## Data / migration state

No Supabase migration is required. Existing RLS, onboarding, evidence, progression, safeguarding, Connect, Living Profile, Opportunities, Passport and Admin authorization remain unchanged.

## Release posture

Stage 24 changes presentation and installation discoverability, not developmental truth or data authority. Production is not declared until the merge deployment and smoke checks pass.

> **The screen is not the game. Life is the game.**

> **Make building feel as natural as socialising. Keep life as the game.**
