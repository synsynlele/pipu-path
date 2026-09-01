# PipuPath project state

**Current stage:** Stage 24 — Visual Fidelity & Mobile Install Experience

**Stage status:** IN PROGRESS — implementation candidate under validation

**Latest released baseline:** Stage 23 merged to `main` as `a2b50dcf23bc437086d842d684d06af5ed76160a` and is live in production.

**Stage 24 branch:** `agent/stage-24-visual-fidelity-mobile-install`.

**Stage 24 authority:** `docs/stages/stage-24-visual-fidelity-mobile-install.md`.

**Social-grade product authority:** `docs/product/social-grade-mobile-experience-direction.md`.

**Underlying Human Potential Adventure authority:** `docs/product/human-potential-adventure-direction.md`.

**Infrastructure:** Supabase project `kvjcswnmhwegpakbtvlh`; Vercel project `copyartint-2860s-projects/pipu-path`; repository `synsynlele/pipu-path`.

**Last updated:** 2026-09-01

## Product doctrine

> **The screen is not the game. Life is the game.**

> **Make building feel as natural as socialising. Keep life as the game.**

Stage 23 proved the navigation, onboarding/Admin integration and installable-web architecture. Stage 24 closes the remaining fidelity gap between that released structure and the approved premium mobile concept.

## Stage 24 target

PipuPath becomes bright-first and visually consistent across public access, onboarding and the authenticated application:

- bright neutral canvas;
- white cards;
- deep navy type;
- indigo/blue primary actions;
- restrained gold accents;
- softer borders/shadows;
- rounded social-style modules;
- highly legible fixed bottom navigation;
- bounded horizontal progress/lens rails;
- one dominant next action;
- dark sections only as deliberate accents.

## Mobile install correction

The Stage 23 install button depended on the browser firing `beforeinstallprompt`, which is not universally available on mobile. Stage 24 makes install visible regardless of that event and provides platform-appropriate guidance when a native prompt cannot be triggered.

The installed app still starts at `/continue` so PipuPath resumes the correct onboarding or developmental state.

## Safety / anti-dark-pattern boundary

Return motivation must come from meaningful progress and one-tap resumption, not compulsion. Stage 24 does not add infinite feeds, fake activity, shame streaks, popularity metrics, screen-time rewards or dark-pattern notifications.

## Data state

No Supabase migration is required. Existing RLS, evidence, onboarding, authorization, progression, safeguarding and AI persistence contracts remain unchanged.

## Validation posture

Stage 24 remains unreleased until canonical CI, one exact Preview, deployed mobile/browser proof and production smoke checks all pass.
