# Implementation status

**Current stage:** Stage 23 — Social-Grade Mobile UX & Installable PWA  
**Stage status:** IN PROGRESS — integrated shell/onboarding/admin candidate under validation  
**Stage 23 base:** `7002c4652700a9fd7812c804f88203446efd2999`  
**Stage 23 branch:** `agent/stage-23-social-grade-mobile-pwa`  
**Stage authority:** `docs/stages/stage-23-social-grade-mobile-pwa.md`  
**Product experience authority:** `docs/product/social-grade-mobile-experience-direction.md`  
**Underlying adventure authority:** `docs/product/human-potential-adventure-direction.md`  
**Last updated:** 2026-09-01

## Current release position

Stages 0–22 are released. Stage 23 is an experience and installability layer over the released developmental engine; it does not replace domain persistence, evidence, privacy, authorization or progression contracts.

The authoritative developmental engine remains:

`Discovery → Human Potential Profile → Possible Paths → Mission → Journey → Quest → Evidence → Reflection → Capability → Project → Portfolio / Connect → Collaboration → Living Builder Profile → AI Builder Guide → Capability Verification → Institution / Opportunity → Builder Passport`

The governing doctrine remains:

> **The screen is not the game. Life is the game.**

Stage 23 adds:

> **Make building feel as natural as socialising. Keep life as the game.**

## Stage 23 active slice

### Five human destinations

Primary navigation is being simplified from six architecture-facing destinations to five user-facing destinations:

- **Home** — current context and one dominant next move;
- **Discover** — Discovery, Mission, identity and contextual growth insight;
- **Build** — Journey, Quest, proof, reflection and Projects;
- **Connect** — Builder network, collaboration and Opportunities;
- **Profile** — Living Profile, Builder Vault/Portfolio, Growth Library, Guide and Passport.

This is presentation consolidation only. Existing deep routes and domain entities remain authoritative.

### Social-grade Home

Authenticated Home is being rebuilt around:

- truthful Builder level/XP;
- current Mission/Campaign;
- one dominant Next Move;
- bounded adventure shortcuts;
- truthful momentum from saved Quest, Project, achievement and level state;
- Builder Guide and Connect as secondary support;
- a Mission Control entry that appears only when an active platform-admin role is present.

No fabricated social feed, streak, activity or popularity signal is introduced.

### Discover hub

A new authenticated `/discover` surface uses the existing Home/progression state to present evolving self-understanding, Mission direction, Growth Pack and Builder Guide access without simulating new AI claims or persistence.

### Onboarding integration

The existing `/continue` resolver remains the single routing authority for new and returning Builders. Stage 23 does not bypass or duplicate progression logic.

Identity and Discovery now share a mobile-first onboarding shell with:

- visible `Identity → Discover → Direction` progress;
- one focused task per screen;
- clear saved-progress feedback;
- privacy reassurance;
- no score-chasing or instant personality labels;
- Discovery questions still saved and resumed through the existing server-authoritative flow.

A Builder with incomplete onboarding continues to be routed to the exact unfinished stage before general Home access.

### Mission Control integration

The released Admin dashboard remains a separate role-gated operator surface, not a sixth Builder destination.

Mission Control now exposes its released workspaces in a consistent operator navigation:

- Overview;
- Institutions;
- Opportunities;
- Providers;
- Exit to PipuPath.

Admin authorization still reads active `platform_admins` state. Dashboard intelligence remains aggregate-only and explicitly excludes private Discovery answers, Human Potential Profile prose, reflections, evidence and contact details.

### Installable PWA foundation

The existing Next.js web product is gaining:

- a web-app manifest;
- install icons;
- standalone display metadata;
- a browser installation affordance when the platform exposes it;
- phone safe-area support retained in the shared shell.

No service worker caches private Builder state in this slice. Sensitive authenticated data remains server-authoritative.

### Data / migration state

No Supabase migration is required. Existing RLS, evidence lifecycle, onboarding persistence, profile state, authorization and progression rules remain unchanged.

### Resource control

`agent/stage-23-social-grade-mobile-pwa` remains Vercel-deployment suppressed during implementation. A deliberate Preview is reserved for the exact green release candidate after canonical validation.

## Validation ledger — current Stage 23 candidate work

- Prettier passed on the previous Stage 23 candidate;
- zero-warning ESLint passed after making PWA installation state event-driven;
- strict TypeScript passed after aligning manifest icon-purpose metadata with Next.js 16 types;
- unit/coverage suite passed: **62 files / 331 tests**;
- six integration failures were identified as obsolete presentation/status assertions that still froze Stage 9/10/16/18/20/21 to old labels or the Stage 22 current-stage string;
- those legacy assertions are being superseded to preserve the released capabilities while accepting Stage 23's explicit presentation authority;
- a new Stage 23 onboarding/Admin integration regression contract now protects `/continue`, the shared onboarding experience, active-role Mission Control access, aggregate-only analytics and operator workspace navigation.

A fresh canonical validation run is required after these corrections.

## Stage 22 released baseline

Stage 22 — Human Potential Adventure & Reliability is released and remains the underlying experience/domain authority where Stage 23 does not explicitly supersede presentation.

Key Stage 22 release facts:

- Stage 22 release PR #38 merged as `cae7533cd2616c52547389612e9644773fc7eae0`;
- final premium proof-flow correction landed through PR #40;
- post-release Path-switch and Quest-handoff hotfixes advanced main through `7002c4652700a9fd7812c804f88203446efd2999`;
- the evidence lifecycle remains private by default;
- Quest follows `Understand → Act → Prove → Reflect → Reveal`;
- Builder Projects remain Major Builds/Boss Builds at the experience layer;
- Portfolio remains the private-by-default Builder Vault;
- Connect remains safeguarding-bounded;
- Opportunity and Passport semantics remain unchanged;
- Growth Pack remains contextual and does not become a generic content feed.

## Validation requirement

Stage 23 cannot be declared complete until the exact candidate passes the repository's canonical validation chain:

- Prettier format check;
- zero-warning lint;
- strict TypeScript;
- unit/coverage thresholds;
- integration/regression tests;
- production build;
- authenticated mobile/browser proof on one deliberate exact-head Preview.

Until those gates pass, Stage 23 remains **IN PROGRESS**.
