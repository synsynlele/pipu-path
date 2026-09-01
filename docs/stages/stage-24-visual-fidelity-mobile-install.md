# Stage 24 — Visual Fidelity & Mobile Install Experience

**Status:** IN PROGRESS  
**Base:** `a2b50dcf23bc437086d842d684d06af5ed76160a`  
**Branch:** `agent/stage-24-visual-fidelity-mobile-install`  
**Started:** 2026-09-01

## Why this stage exists

Stage 23 successfully released the five-destination navigation model, onboarding/Admin integration and installable PWA foundation, but production visual fidelity remained materially below the approved mobile concept. The product also exposed installation only when the browser fired `beforeinstallprompt`, making installation difficult to discover on mobile browsers that use menu/share based installation.

Stage 24 corrects both gaps without changing PipuPath's domain engine.

## Visual target

PipuPath becomes **bright-first, calm, premium and social-grade**:

- bright neutral canvas rather than full-screen dark navy;
- white elevated cards with soft shadows;
- deep navy typography;
- indigo/bright-blue primary actions;
- restrained warm-gold accents;
- rounded social-style modules;
- highly visible thumb-friendly bottom navigation;
- bounded horizontal progress/lens rails rather than feeds;
- one dominant next action;
- dark navy/indigo used deliberately as an accent, not the entire interface;
- the same visual grammar across public access, onboarding and the authenticated application.

The goal is emotional comfort and immediate comprehension, not decorative novelty.

## Return-to-action design

PipuPath should give a Builder a reason to return because something meaningful is waiting:

- resume exactly where work stopped;
- show the current Mission and next real-world action immediately;
- surface truthful momentum from evidence, Quest, Project and level state;
- make the installed app one tap away from the Home Screen;
- avoid shame streaks, fake urgency, popularity metrics and infinite feeds.

## Mobile installation contract

Installation must no longer depend on `beforeinstallprompt` being available.

- Chromium browsers may use the captured native install prompt when available.
- iPhone/iPad users receive clear Share → Add to Home Screen guidance when a native programmatic prompt is unavailable.
- Android users receive Install app / Add to Home screen guidance when the browser does not expose a native event.
- Public and authenticated shells expose an install entry.
- Authenticated Home exposes an install card focused on one-tap return.
- Installed standalone mode hides redundant install entries through display-mode CSS.
- `/continue` remains the PWA start route so installed PipuPath resumes the correct onboarding or product state.

## Privacy and architecture

No Supabase migration is required.

No service worker may cache private Builder evidence merely to simulate an offline app. Identity, Discovery, evidence, reflections, capability state and authorization remain server-authoritative.

## Release gates

Stage 24 is not complete until:

- canonical `npm run validate` is green;
- visual/installation structural regressions are green;
- one deliberate exact-head Vercel Preview is READY;
- deployed authenticated desktop/mobile checks prove the five-destination shell, Home, Discover, onboarding and mobile install affordance;
- production merge/deployment is followed by health, PWA manifest, auth/admin-isolation and runtime-error smoke checks.
