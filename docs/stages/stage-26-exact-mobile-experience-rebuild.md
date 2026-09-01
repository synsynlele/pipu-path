# Stage 26 — Exact Mobile Experience Rebuild

**Status:** IN PROGRESS  
**Authority:** User-authorised Stage 26 execution  
**Base production commit:** `ebbc4e54dd8408b8392eea55f4e36c026b428cc9`  
**Branch:** `agent/stage-26-exact-mobile-experience`  
**Effective:** 2026-09-01

## Objective

Rebuild the PipuPath presentation layer so the approved mobile concept is the visual and interaction specification, not loose inspiration, while preserving the released developmental engine and one responsive Next.js/PWA codebase.

> **Make building feel as natural as socialising. Keep life as the game.**

## Release gates

Stage 26 is not complete until all of the following are true:

1. Home, Discover, Build, Connect and Profile clearly express the approved mobile grammar.
2. Onboarding uses the same premium one-action-at-a-time experience.
3. Admin / Mission Control remains isolated from normal Builder complexity.
4. Existing onboarding, Mission, Journey, Quest, evidence, reflection, Projects, Connect, Opportunities, Living Profile, Portfolio, Passport, safeguarding, progression and Supabase authority remain intact.
5. PWA behaviour from Stage 25 remains intact, including `/continue`, browser-native install prompting when available, always-visible install access and explicit iOS Add to Home Screen guidance.
6. Core authenticated routes have bounded skeleton/loading treatment and reduced-motion compatibility.
7. Canonical `npm run validate` is green.
8. One deliberate exact-head Vercel Preview is visually inspected against the approved concept on a phone-sized viewport.
9. Authenticated Builder flows, onboarding, Admin isolation and installation are verified on that Preview.
10. Every meaningful visual or interaction mismatch found in deployed proof is fixed before merge.

## Stage 26 visual grammar

The approved concept establishes:

- indigo/navy premium top regions with lighter content surfaces;
- strong mobile hierarchy and compact conversational copy;
- large illustrated next-action cards;
- horizontal circular/story-style progress navigation;
- clean modular white cards with soft elevation;
- five fixed destinations: Home / Discover / Build / Connect / Profile;
- an elevated central Build control;
- thumb-sized controls and safe-area handling;
- contextual Pipu / MagicPen assistance rather than global AI clutter;
- bounded rails instead of infinite feeds;
- truthful Builder state only — never fabricated feed activity.

## First implementation slice

The first Stage 26 implementation slice:

- adds a scoped consumer-mobile visual system without changing public/admin data authority;
- rebuilds the authenticated shell and five-tab mobile navigation;
- recomposes Home around real Mission, progress, next move and truthful momentum;
- recomposes Discover around living evidence-led self-understanding;
- turns `/build` from a redirect into the unified Builder action centre while keeping existing deep routes authoritative;
- upgrades the shared onboarding shell;
- adds custom Stage 26 vector illustrations and bounded loading skeletons;
- leaves Stage 25 PWA implementation untouched.

Further visual proof and any remaining Connect/Profile recomposition are release work inside this same stage, not a new product stage.
