# Implementation status

**Current stage:** Stage 24 — Visual Fidelity & Mobile Install Experience  
**Stage status:** IN PROGRESS — implementation candidate under validation  
**Stage 24 base:** `a2b50dcf23bc437086d842d684d06af5ed76160a`  
**Stage 24 branch:** `agent/stage-24-visual-fidelity-mobile-install`  
**Stage authority:** `docs/stages/stage-24-visual-fidelity-mobile-install.md`  
**Last updated:** 2026-09-01

## Released baseline

Stage 23 — Social-Grade Mobile UX & Installable PWA is released in production from merge commit `a2b50dcf23bc437086d842d684d06af5ed76160a`.

Stage 23 release proof included canonical CI, a deliberate exact-head Preview, deployed Chromium/mobile release checks, production health/PWA/auth/admin-isolation smoke tests and a clean runtime-error scan.

## Why Stage 24 is required

Stage 23 solved information architecture and installability foundation, but the released application remained visually too close to the pre-Stage-23 dark interface and did not match the approved bright premium concept closely enough.

The Stage 23 install control also appeared only when the browser exposed `beforeinstallprompt`, leaving mobile installation difficult to discover on platforms that use Share/menu installation flows.

## Active Stage 24 slice

### Bright-first visual system

The shared theme is being moved to:

- `#f7f8fc` bright neutral background;
- white application surfaces;
- deep navy text;
- indigo/blue actions;
- restrained gold accents;
- soft borders/shadows;
- rounded social-style cards;
- dark navy/indigo as an accent rather than the global canvas.

Shared `Surface`, `Button`, public shell, auth shell, onboarding shell, application shell and navigation are being aligned to this visual grammar so deep routes inherit the change without reimplementing domain logic.

### Home fidelity

Home is being rebuilt around:

- clear personal greeting and Builder progress;
- Mission context;
- one high-contrast gradient Next Move card;
- circular horizontally scrollable path stages;
- truthful momentum rows;
- Builder Guide and Connect support;
- an explicit install card that turns return-to-action into one tap.

### Discover fidelity

Discover is being rebuilt around:

- bounded circular lenses;
- living evidence-led insight;
- direction/Journey context;
- lightweight personalised cards;
- no endless feed or personality-ranking mechanics.

### Mobile installation

Installation becomes always discoverable.

- If `beforeinstallprompt` is available, PipuPath triggers the browser-native install prompt from a user action.
- Otherwise, PipuPath opens a platform-aware instruction sheet.
- iOS guidance uses the browser Share menu → Add to Home Screen path.
- Android fallback guidance uses Install app / Add to Home screen.
- public and authenticated shells expose an install entry;
- authenticated Home exposes a full install card;
- installed standalone mode hides redundant install entries through display-mode CSS.

### PWA visual metadata

The web manifest remains resume-first at `/continue` while adopting the bright Stage 24 background/theme colors and five-destination shortcuts.

### Data / migration state

No Supabase migration is required. Existing RLS, onboarding, evidence, progression, safeguarding, Connect, Living Profile, Opportunities, Passport and Admin authorization remain unchanged.

## Validation requirement

Stage 24 cannot be released until:

- Prettier passes;
- zero-warning ESLint passes;
- strict TypeScript passes;
- unit and integration regression suites pass;
- production build passes;
- the Stage 24 install/visual contracts pass;
- one deliberate exact-head Vercel Preview is READY;
- deployed authenticated desktop/mobile checks prove the changed experience;
- production release receives health, manifest, auth/admin-isolation and runtime-error verification.
