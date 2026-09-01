# PipuPath project state

**Current stage:** Stage 24 — Visual Fidelity & Mobile Install Experience

**Stage status:** RELEASED — PR #52 is the Stage 24 production release after canonical CI and exact-tree Preview proof.

**Released baseline entering Stage 24:** Stage 23 merged to `main` as `a2b50dcf23bc437086d842d684d06af5ed76160a`.

**Stage 24 validated application head:** `53ab9cc2303bb4b02160108f343837db2090d419`.

**Stage 24 branch:** `agent/stage-24-visual-fidelity-mobile-install`.

**Stage 24 authority:** `docs/stages/stage-24-visual-fidelity-mobile-install.md`.

**Social-grade product authority:** `docs/product/social-grade-mobile-experience-direction.md`.

**Underlying Human Potential Adventure authority:** `docs/product/human-potential-adventure-direction.md`.

**Infrastructure:** Supabase project `kvjcswnmhwegpakbtvlh`; Vercel project `copyartint-2860s-projects/pipu-path`; repository `synsynlele/pipu-path`.

**Last updated:** 2026-09-01

## Product doctrine

> **The screen is not the game. Life is the game.**

> **Make building feel as natural as socialising. Keep life as the game.**

Stage 23 proved the five-destination navigation, onboarding/Admin integration and installable-web architecture. Stage 24 closes the remaining fidelity gap between that structure and the approved premium mobile concept while keeping the developmental engine unchanged.

## Stage 24 released experience

PipuPath is now bright-first and visually consistent across public access, authentication, onboarding and the authenticated application:

- bright neutral canvas;
- white cards;
- deep navy type;
- indigo/blue primary actions;
- restrained gold accents;
- softer borders/shadows;
- rounded social-style modules;
- highly legible fixed bottom navigation;
- elevated central Build action;
- bounded horizontal progress/lens rails;
- one dominant next action;
- dark sections only as deliberate accents.

Home and Discover are organized around meaningful return-to-action rather than feed consumption. Current Mission, next action, verified momentum, Projects, guidance and collaboration remain grounded in saved Builder state.

## Mobile install correction

The Stage 23 install control depended on the browser firing `beforeinstallprompt`, which is not universally available on mobile. Stage 24 makes installation discoverable regardless of that event.

- Supporting Chromium browsers receive the native install prompt from a user action.
- iPhone/iPad users receive Share → Add to Home Screen / Open as Web App guidance.
- Android fallback guidance uses Install app / Add to Home screen.
- Public and authenticated shells expose installation.
- Authenticated Home includes a prominent install card.
- Installed standalone mode hides redundant install entries.
- The installed app starts at `/continue` so PipuPath resumes the correct onboarding or developmental state.

## Release evidence

Canonical CI passed on exact application head `53ab9cc2303bb4b02160108f343837db2090d419`:

- Prettier;
- zero-warning ESLint;
- strict TypeScript;
- **335 unit/coverage tests**;
- **225 integration/regression tests**;
- production build.

One deliberate exact-tree Vercel Preview was created through carrier commit `9f4a168d01b89da0db796447376eb8ce0e1e81e6`, which points to the same application tree as the green candidate. Deployment `dpl_BRewpb2UroYufZjKMn3CZaTcLpp7` reached READY.

Deployed proof confirmed:

- bright theme metadata and rendered public/auth surfaces;
- always-visible Install entry on the public product;
- installable manifest with `display: standalone`;
- `/continue` resume-first start URL;
- 192/512 any + maskable icons;
- five product shortcuts;
- unauthenticated `/app` isolation to `/login?next=/app`;
- no Preview error/fatal runtime logs during release verification.

Production smoke verification is the final operational check after PR #52 reaches `main`.

## Safety / anti-dark-pattern boundary

Return motivation comes from meaningful progress and one-tap resumption, not compulsion. Stage 24 does not add infinite feeds, fake activity, shame streaks, popularity metrics, screen-time rewards or dark-pattern notifications.

## Data state

No Supabase migration is required. Existing RLS, evidence, onboarding, authorization, progression, safeguarding and AI persistence contracts remain unchanged.
