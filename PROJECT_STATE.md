# PipuPath project state

**Current stage:** Stage 23 — Social-Grade Mobile UX & Installable PWA

**Stage status:** IN PROGRESS — first vertical slice under validation

**Released baseline entering Stage 23:** Stages 0–22 plus post-release Stage 22 hotfixes are released.

**Latest released main baseline:** `7002c4652700a9fd7812c804f88203446efd2999`.

**Stage 23 branch:** `agent/stage-23-social-grade-mobile-pwa`.

**Stage 23 authority:** `docs/stages/stage-23-social-grade-mobile-pwa.md`.

**Social-grade mobile authority:** `docs/product/social-grade-mobile-experience-direction.md`.

**Underlying Human Potential Adventure authority:** `docs/product/human-potential-adventure-direction.md`.

**Growth Pack authority:** `docs/product/growth-pack-direction.md`.

**Infrastructure:** authorised Supabase project `kvjcswnmhwegpakbtvlh`; Vercel project `copyartint-2860s-projects/pipu-path` linked to `synsynlele/pipu-path`.

**Last updated:** 2026-09-01

## Product doctrine now in force

> **The screen is not the game. Life is the game.**

> **Make building feel as natural as socialising. Keep life as the game.**

PipuPath remains a **Human Potential Adventure System**. Stage 23 makes the interface dramatically easier to understand and navigate without turning the product into conventional social media.

The released developmental engine remains authoritative:

`Discovery → Human Potential Profile → Possible Paths → Mission → Journey → Quest → Evidence → Reflection → Capability → Project → Portfolio / Connect → Collaboration → Living Builder Profile → AI Personal Builder Guide → Capability Verification → Institution / Opportunity → Builder Passport`

Stage 23 changes presentation, navigation grouping and installability. It does not replace domain terminology, persistence, privacy, safeguarding, evidence or authorization boundaries.

## Stage 23 navigation model

Five human destinations now govern the primary experience:

- **Home** — current Mission, progress and one dominant next move;
- **Discover** — Discovery, Mission, self-understanding and contextual growth;
- **Build** — Journey, Quest, proof, reflection and Projects;
- **Connect** — Builder network, collaboration and Opportunities;
- **Profile** — Living Profile, Builder Vault, Growth Library, Builder Guide and Passport.

Deep routes remain available and are oriented beneath these destinations rather than removed.

## Stage 23 first slice

The active first slice includes:

- five-destination desktop/mobile application navigation;
- an elevated thumb-friendly Build action on mobile;
- a redesigned Home using only real saved Builder state;
- a new authenticated Discover hub;
- PWA manifest, generated install icons and standalone app metadata;
- browser installation affordance where supported;
- preserved sign-out, safe-area, reduced-motion and authenticated-shell behaviour;
- no new Supabase schema;
- no service-worker cache of private authenticated Builder data;
- Vercel implementation-branch deployment suppression until validation is green.

## Safety / anti-dark-pattern boundary

Stage 23 explicitly rejects using social-product familiarity as permission to build social-media addiction mechanics.

PipuPath does not introduce:

- manipulative infinite feeds;
- fabricated social activity;
- child popularity leaderboards;
- shame-based streaks;
- screen-time rewards;
- fake urgency;
- unrestricted minor/adult messaging;
- dark-pattern notifications;
- public leakage of private evidence;
- AI pretending to be a human friend or mentor.

The goal is comfort, clarity and return-to-action — not compulsive screen consumption.

## Validation posture

Stage 23 is not released yet. The first candidate must pass `npm run validate`, then one deliberate exact-head Vercel Preview and authenticated browser/mobile proof before release consideration.

Until then, the operating state is:

**build → validate → exact Preview → browser proof → release decision**.
