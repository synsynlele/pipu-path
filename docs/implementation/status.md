# Implementation status

**Current stage:** Stage 22 — Human Potential Adventure & Reliability  
**Stage status:** Active — first reliability/adventure batch implemented; validation in progress  
**Released baseline:** Stages 0–21  
**Stage authority:** `docs/stages/stage-22-human-potential-adventure.md`  
**Product direction authority:** `docs/product/human-potential-adventure-direction.md`  
**Draft PR:** #38 — Stage 22 — Human Potential Adventure & Reliability  
**Last updated:** 2026-08-19

## Released baseline

Stage 21 Builder Passport/API was squash-merged through PR #37 as `ee09f96d02adb72079b4ce4a29a3e2f872f618db`. Final clean-head CI passed and production reached READY on that exact merge commit.

The complete released developmental engine remains authoritative:

`Discovery → Human Potential Profile → Possible Paths → Mission → Journey → Quest → Evidence → Reflection → Capability → Project → Portfolio / Connect → Collaboration → Living Builder Profile → AI Builder Guide → Capability Verification → Institution / Opportunity → Builder Passport`

## Stage 22 product decision

Stage 22 is **not** Mentor Network and is not another major MVP feature layer.

Stage 22 transforms the released engine into the locked Human Potential Adventure experience while correcting reliability problems exposed during real user testing.

Core doctrine:

> **The screen is not the game. Life is the game.**

The existing Mission/Journey/Quest structure must be preserved. Experience changes sit over the domain and make real-world progress feel spatial, consequential, intriguing and rewarding without fabricating development.

## Deployment control

Branch: `agent/stage-22-human-potential-adventure`

Automatic Vercel Preview deployment is suppressed for the implementation branch. Vercel quota must be conserved; one deliberate exact-head Preview is reserved for the final authenticated/mobile browser gate after static CI readiness.

No Stage 22 Supabase schema change has been introduced. The first experience batch reuses released data and authorization.

## Gate A — Authority and audit

### Completed

- locked `docs/product/human-potential-adventure-direction.md`;
- created `docs/stages/stage-22-human-potential-adventure.md`;
- updated `AGENTS.md` so future implementation must read the Human Potential Adventure direction;
- advanced `PROJECT_STATE.md` to Stage 22;
- preserved Mission → Journey → Quest → Evidence → Reflection → Capability → Project → Portfolio → Opportunity → Passport as the non-negotiable engine;
- classified Mentor Network as post-MVP;
- confirmed the application already has a server-authorised Mission Control admin surface but the normal Builder shell did not expose it;
- confirmed `/proof/[slug]` exists as a public selective Portfolio proof route;
- inspected the live owner test state and found the recent MagicPen/HQLS Portfolio was a valid **draft**, not a published public proof;
- verified the Stage 9 publish RPC returns the public proof slug and the owner is adult-eligible, so the observed proof experience was not caused by an RPC return-type mismatch or age safeguard.

## Gate B — Reliability foundation

### Implemented; static/browser validation pending

- unavailable `/proof/[slug]` state now resolves to an explanatory proof-unavailable recovery screen rather than a generic dead 404;
- proof-unavailable recovery offers Portfolio and PipuPath exits while preserving privacy;
- successful Portfolio publishing now returns first to the authenticated Portfolio Studio so publication state can be confirmed before the Builder deliberately opens the public page;
- draft Portfolio language no longer presents an unopenable public slug as though it were already live;
- invalid/private Portfolio detail and preview states recover to safe parent routes;
- deterministic contextual Back navigation added for deep Quest, Project, Portfolio, Opportunity, Connect, Profile, Passport and onboarding routes;
- active platform-admin role lookup added without changing backend authorization;
- Adventure Home now exposes Mission Control only when an active platform-admin role is present;
- contextual-navigation and Builder-level unit tests added.

The exact user-reported proof path still requires final authenticated browser reproduction on the deliberate Stage 22 Preview before the bug is considered closed.

## Gate C — Adventure Home

### First implementation complete; validation/refinement pending

- removed the equal-weight dashboard hierarchy and the layout-level Opportunities promo;
- Home now leads with current Campaign/Mission and one dominant Next Move;
- current Quest is preferred as the next action when one exists, including evidence-submitted reflection state;
- active Builder Project becomes the next move when appropriate;
- truthful XP is converted to visible Builder-level progression using the existing locked level thresholds;
- level progress never awards XP for page views or screen time;
- Adventure Path is represented spatially rather than as a large stack of feature cards;
- recent achievement is shown only from saved completed Quest/Project state;
- Builder Guide and the broader toolset remain available but subordinate to the current adventure;
- active owner/admin sees a role-aware Mission Control entrance.

## Gate D — Journey and Quest transformation

### First implementation complete; validation/refinement pending

Journey:
- active/draft/completed Journey uses a horizontal Adventure Map;
- milestones show cleared/current/ready/locked states from saved lifecycle state;
- long Journey explanation and chapter detail moved behind progressive disclosure;
- current chapter/outcome/capabilities are prioritised;
- active Journey goes directly toward current Quests rather than making the Builder read the full route repeatedly;
- reduced-motion-safe progress movement is used.

Quest:
- Quest experience now communicates `Understand → Act → Prove → Reflect → Reveal`;
- only the current lifecycle phase dominates the page;
- long why/proof/resources material is progressively disclosed;
- action steps remain visible and scannable;
- existing private evidence and reflection forms remain authoritative;
- completed Quest has a dedicated truthful reveal moment using real XP and the real next unlocked Quest when one exists;
- no fake unlock is shown when the saved state does not provide one.

## Gate E — Build and capability transformation

Pending implementation:

- major Build/Boss Build experience framing over existing Project semantics;
- evidence-backed capability/skill-tree presentation where released data supports it;
- no fabricated scores, rankings or achievements.

## Validation ledger

Draft PR #38 opened from the Preview-suppressed Stage 22 branch.

CI #1013 ran against head `148c1e4bb425d332aefccf4f9332dd50525c38f8` and failed at the **first gate only: Prettier format check**. Six new Stage 22 source files require repository-standard formatting. Because validation stops at formatting, lint, TypeScript, coverage, integration and production build have **not yet been proven** for this batch.

A temporary branch-only formatter-diff workflow is being used to obtain the repository's exact Prettier/Tailwind formatting before continuing. It will be removed after the formatting correction; it does not deploy to Vercel.

## Gate F — Release proof

Not started. Required before release:

- formatting;
- zero-warning lint;
- strict TypeScript;
- unit/integration/regression tests;
- unchanged coverage thresholds;
- production build;
- authenticated Builder E2E;
- authenticated owner/admin E2E;
- mobile viewport/navigation proof;
- reduced-motion/accessibility proof;
- one deliberate exact-head Vercel Preview;
- intentional merge and exact production verification.
