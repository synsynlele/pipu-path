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
7. Integrate the existing Identity → Discovery → Direction onboarding flow into one mobile-first Stage 23 shell without changing progression or persistence contracts.
8. Integrate the existing role-gated Mission Control dashboard into a distinct operator mode with Overview, Institutions, Opportunities and Providers exposed in navigation.
9. Keep implementation-branch Vercel deployments suppressed until canonical validation is green.

## Onboarding integration

`/continue` remains the single progression router for both new and returning Builders.

It must continue to route incomplete accounts through:

`Identity → Discovery → Discovery Review → Human Potential Profile → Mission → Journey / Quest / Build`

Stage 23 changes only the experience grammar around those steps:

- visible three-part entry progress: Identity, Discover, Direction;
- one focused action per screen;
- clear saved-progress signals;
- mobile-first touch targets;
- explicit privacy reassurance;
- no instant personality labels, scores or AI judgement during Discovery;
- pause/resume behaviour remains authoritative from saved server state.

A new Builder must never be dropped into the general Home experience before the progression resolver says the required onboarding state is complete.

## Mission Control integration

Mission Control remains a separate operator surface rather than a sixth Builder destination.

The authenticated Home checks the active platform-admin role and reveals the Mission Control entry only when that role exists. Mission Control itself remains server-authorised against active `platform_admins` state.

Operator navigation exposes:

- Overview;
- Institutions;
- Opportunities;
- Providers;
- an explicit Exit to PipuPath action.

The dashboard remains aggregate-only. Private Discovery answers, Human Potential Profile prose, reflections, evidence and contact details are not part of Mission Control analytics.

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
- `/continue` still routes incomplete users to the exact unfinished onboarding stage;
- Identity and Discovery use the shared Stage 23 onboarding shell while retaining existing server persistence and resume behaviour;
- Mission Control remains active-role-only and separate from Builder primary navigation;
- Mission Control exposes every released operator workspace, including Providers;
- Mission Control remains aggregate-only and does not expose private developmental content;
- the application exposes a valid web manifest, standalone display metadata and install icons;
- install support does not cache private authenticated state;
- mobile touch targets and safe-area navigation remain protected by tests;
- Stage 22 authenticated-shell safety continues to pass;
- `npm run validate` passes before this stage is declared complete;
- one deliberate Vercel Preview is used only after the static/CI gate is green and browser proof is ready.

## Next slices after first gate

Once the shell/Home/Discover/onboarding/admin/PWA foundation is proven, apply the same interaction grammar to:

- Build/Journey/Quest continuity;
- Connect builder discovery and collaboration presentation;
- Profile/Vault/Passport consolidation;
- responsive desktop parity;
- install guidance for browsers that do not expose `beforeinstallprompt`;
- controlled-pilot telemetry focused on real developmental outcomes.

No later slice is considered released merely because this foundation lands.
