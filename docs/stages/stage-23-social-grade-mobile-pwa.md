# Stage 23 — Social-Grade Mobile UX & Installable PWA

**Status:** IN PROGRESS  
**Authority:** `docs/product/social-grade-mobile-experience-direction.md`  
**Branch:** `agent/stage-23-social-grade-mobile-pwa`  
**Base:** `7002c4652700a9fd7812c804f88203446efd2999`  
**Started:** 2026-09-01

## Goal

Make PipuPath immediately understandable, comfortable and thumb-friendly without weakening the Human Potential Adventure engine.

The Stage 0–22 developmental model remains authoritative:

`Discovery → Human Potential Profile → Possible Paths → Mission → Journey → Quest → Evidence → Reflection → Capability → Project → Portfolio / Connect → Collaboration → Living Builder Profile → Builder Guide → Capability Verification → Institution / Opportunity → Builder Passport`

Stage 23 changes the presentation grammar and installability of the web product. It does not create a second app architecture.

## First vertical slice

1. Replace the six technical primary destinations with five human destinations: Home, Discover, Build, Connect and Profile.
2. Preserve all existing deep routes by orienting them under the appropriate human destination.
3. Rebuild authenticated Home around Mission, one dominant Next Move and truthful recent momentum.
4. Add a new authenticated Discover hub using real Builder state only.
5. Add installable web-app metadata, app icons and browser installation affordance.
6. Preserve mobile safe areas, accessibility, reduced motion, sign-out, authenticated shells and route recovery.
7. Keep implementation-branch Vercel deployments suppressed until canonical validation is green.

## PWA boundary

This slice adds installation metadata and standalone display support. It does not add an authenticated-data service-worker cache.

Private Builder evidence, reflection, profile state and authorization remain server-authoritative. Offline private-data support requires a separate explicit security and lifecycle design before implementation.

## No database migration

This slice changes no Supabase schema, RLS policy, RPC, evidence lifecycle, progression rule or AI persistence contract.

## Safety boundary

The redesign must not introduce:

- infinite feeds;
- fake social activity;
- follower counts or popularity leaderboards;
- shame-based streaks;
- empty screen-time rewards;
- unrestricted messaging;
- public exposure of private evidence;
- manipulative notification patterns.

Familiarity and comfort come from interaction quality, not addiction mechanics.

## Acceptance criteria

- the mobile shell exposes exactly five primary human destinations;
- Journey/Quest/Project/proof remain oriented under Build;
- Mission/Discovery remain oriented under Discover;
- Portfolio/Growth/Guide/Passport remain oriented under Profile;
- Opportunities remain oriented under Connect;
- Home makes one real Next Move obvious within seconds;
- Home momentum is derived only from saved Builder state;
- Discover uses real authenticated Builder context and contains no simulated insight;
- the application exposes a valid web manifest, standalone display metadata and install icons;
- install support does not cache private authenticated state;
- mobile touch targets and safe-area navigation remain protected by tests;
- Stage 22 authenticated-shell safety continues to pass;
- `npm run validate` passes before this stage is declared complete;
- one deliberate Vercel Preview is used only after the static/CI gate is green and browser proof is ready.

## Next slices after first gate

Once the shell/Home/Discover/PWA foundation is proven, apply the same interaction grammar to:

- Build/Journey/Quest continuity;
- Connect builder discovery and collaboration presentation;
- Profile/Vault/Passport consolidation;
- responsive desktop parity;
- install guidance for browsers that do not expose `beforeinstallprompt`;
- controlled-pilot telemetry focused on real developmental outcomes.

No later slice is considered released merely because this foundation lands.
