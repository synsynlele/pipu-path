# Stage 22 — Human Potential Adventure & Reliability

**Status:** ACTIVE  
**Authority:** `docs/product/human-potential-adventure-direction.md`  
**Branch:** `agent/stage-22-human-potential-adventure`  
**Started:** 2026-08-19

## Goal

Transform the released Stage 0–21 PipuPath engine into a compelling, mobile-first Human Potential Adventure without changing the core developmental architecture.

Stage 22 preserves Mission → Journey → Quest → Evidence → Reflection → Capability → Project → Portfolio → Opportunity → Passport, but redesigns how progress is experienced: spatially, interactively, with truthful progression, meaningful unlocks, suspense, consequence and strong navigation.

Stage 22 also closes the user-reported reliability gaps that undermine the experience.

## Mandatory user-reported corrections

1. Trace and fix proof/evidence actions that can lead to unavailable or unopenable pages.
2. Reduce text-heavy vertical-page fatigue without removing developmental substance.
3. Ensure every deep authenticated route has a clear escape/continuation path.
4. Expose a role-aware Mission Control entry to active platform administrators.

## Product-experience scope

### Adventure Home

- one dominant next move;
- current Mission/Campaign context;
- Journey progress/map preview;
- visible truthful XP and Builder level progression;
- recent meaningful achievement/unlock where real data exists;
- contextual Builder Guide entry;
- no equal-weight feature catalogue as the main interaction model.

### Journey Adventure Map

- milestone/Quest nodes represented as a path;
- completed/current/available/locked/reveal-later states;
- accessible semantic fallback;
- no loss of Journey lifecycle or persistence.

### Quest Focus

- phase-based experience: Understand → Act → Prove → Reflect → Reveal;
- progressive disclosure for long explanation;
- current action is visually dominant;
- evidence and reflection remain truthful, private and durable;
- completion creates meaningful feedback and next-unlock reveal.

### Progression layer

- existing XP becomes visible as purposeful progression;
- existing level names remain Explorer, Learner, Problem Solver, Builder and Founder Ready;
- no new advancement rule is enforced until deterministic requirements are explicitly versioned and tested;
- achievements introduced only when backed by real domain state;
- no empty engagement rewards.

### Project experience

- Builder Project may use major Build/Boss Build framing in experience copy;
- Project persistence and lifecycle remain unchanged;
- progress and milestone completion become more spatial/interactive;
- proof remains private unless the existing selective Portfolio publication flow is intentionally completed.

### Capability experience

- capability presentation may evolve toward an evidence-backed skill tree;
- no capability strength, score or claim may be invented;
- all displayed capability state must retain existing provenance and privacy semantics.

### Navigation

- preserve reliable global navigation;
- introduce contextual Back/Close/continuation patterns for deep routes;
- mobile navigation must not become overcrowded;
- no normal authenticated workflow may trap the user.

### Admin discoverability

- active platform admins receive visible Mission Control access;
- server/data authorization remains authoritative;
- Builder users do not gain admin data access;
- admin mode remains operationally distinct from Builder mode.

## Safety constraints

Stage 22 must not add gambling mechanics, manipulative streaks, child popularity rankings, unrestricted messaging, fake urgency, fabricated social activity, fake achievements or public leakage of private proof.

The aim is to increase the urge to **build in real life**, not the urge to remain on screen.

## Explicit non-goals

- Mentor Network;
- new communities product;
- new unrestricted social/messaging layer;
- payments;
- new opportunity marketplace semantics;
- changing the Mission/Journey/Quest domain model;
- major new Supabase schema unless a proven Stage 22 requirement cannot be satisfied from released state;
- cosmetic redesign detached from interaction and progression.

## Delivery order

### Gate A — Authority and audit

- lock Stage 22 product doctrine;
- update repository project/status authority;
- inventory proof/evidence CTAs and deep-route navigation;
- classify each user-reported failure as route, state, authorization, UX or runtime.

### Gate B — Reliability foundation

- repair broken proof/evidence paths;
- add contextual navigation foundation;
- add role-aware Mission Control entry;
- tests for all three.

### Gate C — Adventure Home

- replace equal-weight dashboard model with current-adventure hierarchy;
- surface existing XP/level/progress state truthfully;
- make next move dominant;
- keep secondary product tools discoverable but subordinate.

### Gate D — Journey and Quest transformation

- Journey Adventure Map;
- Quest phase/focus experience;
- reveal/unlock feedback;
- mobile, keyboard and reduced-motion behavior.

### Gate E — Build and capability transformation

- Project/Boss Build experience;
- evidence-backed capability/skill-tree presentation where current data supports it;
- no invented score system.

### Gate F — Full quality proof

- formatting;
- zero-warning lint;
- strict TypeScript;
- unit/integration/regression tests;
- coverage thresholds unchanged;
- production build;
- route/navigation structural audit;
- authenticated E2E for Builder and owner/admin flows;
- mobile viewport proof;
- one deliberate Vercel Preview only after static/CI readiness.

## Release criteria

Stage 22 is not complete merely because screens look better.

Release requires:

1. user-reported broken proof flow reproduced or safely explained and corrected;
2. owner account can visibly enter Mission Control after normal login;
3. deep routes have deterministic escape/continuation paths;
4. Home clearly prioritises the current adventure and next meaningful action;
5. Journey and Quest preserve existing domain state while feeling materially more interactive and progression-led;
6. no reward is fabricated or earned by meaningless interaction;
7. privacy/safeguarding boundaries remain intact;
8. mobile and accessibility gates pass;
9. full repository validation passes;
10. final browser proof passes on one deliberate exact-head Preview before merge.

## Stop boundary

Do not begin Mentor Network or another post-MVP capability inside Stage 22.

When Stage 22 releases, PipuPath should enter controlled pilot/use-measure-improve mode before another major product surface is authorised.
