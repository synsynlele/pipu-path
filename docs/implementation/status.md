# Implementation status

**Current stage:** Stage 22 — Human Potential Adventure & Reliability  
**Stage status:** Active — primary adventure experience plus Growth Pack implemented; canonical validation in progress  
**Released baseline:** Stages 0–21  
**Stage authority:** `docs/stages/stage-22-human-potential-adventure.md`  
**Product direction authority:** `docs/product/human-potential-adventure-direction.md`  
**Growth Pack authority:** `docs/product/growth-pack-direction.md`  
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

The existing Mission/Journey/Quest structure remains intact. The new experience layer makes real-world development feel spatial, consequential, intriguing and rewarding without fabricating progress.

Primary experience language now aligns as:

`Campaign → Adventure Map → Quest Chain → Major Build → Builder Vault → Builder World → Deployment Doors → Skill Tree → Builder Passport`

These are experience labels over the released domain model, not replacement persistence concepts.

Learning support follows a separate locked rule:

> **Growth Pack = what may help this Builder's current adventure now. Growth Library = where earlier contextual suggestions can be revisited.**

Reading, opening a course or viewing a recommendation does not itself earn XP or strengthen a capability claim.

## Deployment control

Branch: `agent/stage-22-human-potential-adventure`

Automatic Vercel Preview deployment is suppressed for the implementation branch. Vercel quota remains conserved; one deliberate exact-head Preview is reserved for the final authenticated/mobile browser gate after static CI readiness.

No Stage 22 Supabase schema change has been introduced. The experience and Growth Pack work reuse released data, JSON advice history, lifecycle and authorization.

## Gate A — Authority and audit

### Completed

- locked `docs/product/human-potential-adventure-direction.md`;
- locked `docs/product/growth-pack-direction.md`;
- created `docs/stages/stage-22-human-potential-adventure.md`;
- updated `AGENTS.md` so future implementation must read both Human Potential Adventure and Growth Pack direction;
- advanced `PROJECT_STATE.md` to Stage 22;
- preserved Mission → Journey → Quest → Evidence → Reflection → Capability → Project → Portfolio → Opportunity → Passport as the non-negotiable engine;
- classified Mentor Network as post-MVP;
- confirmed the application already has a server-authorised Mission Control admin surface but the normal Builder experience did not expose it;
- confirmed `/proof/[slug]` exists as a public selective Portfolio proof route;
- inspected the live owner test state and found the recent MagicPen/HQLS Portfolio was a valid **draft**, not a published public proof;
- verified the Stage 9 publish RPC returns the public proof slug and the owner is adult-eligible, so the observed proof experience was not caused by an RPC return-type mismatch or age safeguard;
- audited the core deep-route shells and confirmed Quest, Project, Portfolio, Opportunities, Profile and private Passport flows inherit or directly wrap `AppShell`.

## Gate B — Reliability foundation

### Implemented; static/browser validation pending

- unavailable `/proof/[slug]` state now resolves to an explanatory proof-unavailable recovery screen rather than a generic dead 404;
- proof-unavailable recovery offers safe Portfolio and PipuPath exits while preserving privacy;
- successful Portfolio publishing now returns first to the authenticated Portfolio Studio so publication state can be confirmed before the Builder deliberately opens the public page;
- draft Portfolio language no longer presents an unopenable public slug as though it were already live;
- invalid/private Portfolio detail and preview states recover to safe parent routes;
- deterministic contextual Back navigation added for deep Quest, Project, Portfolio, Opportunity, Connect, Profile, Growth Library, Passport and onboarding routes;
- active platform-admin role lookup added without changing backend authorization;
- Adventure Home now exposes Mission Control only when an active platform-admin role is present;
- contextual-navigation and Builder-level unit tests added;
- primary navigation keeps six stable destinations but now uses adventure-facing `Vault` and `Me` labels while retaining existing routes.

The exact user-reported proof path still requires final authenticated browser reproduction on the deliberate Stage 22 Preview before the bug is considered closed.

## Gate C — Adventure Home

### Implemented; static/browser validation pending

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

## Gate D — Campaign, Journey and Quest transformation

### Implemented; static/browser validation pending

Mission / Campaign:

- Mission is experienced as a Builder Campaign while Mission persistence remains unchanged;
- active Campaign foregrounds who it helps, first meaningful outcome and time horizon;
- full explanatory content is progressively disclosed;
- Campaign activation now transitions directly into the Journey Map.

Journey:

- active/draft/completed Journey uses a horizontal Adventure Map;
- milestones show cleared/current/ready/locked states from saved lifecycle state;
- long Journey explanation and chapter detail moved behind progressive disclosure;
- current chapter/outcome/capabilities are prioritised;
- active Journey goes directly toward current Quests rather than making the Builder read the full route repeatedly;
- reduced-motion-safe progress movement is used.

Quest chain:

- Quest list is now a three-node unfolding challenge chain rather than a vertical catalogue of full Quest cards;
- future Quest nodes remain visually ahead/unknown until lifecycle state makes them available;
- current Quest is visually dominant and links directly into the challenge;
- capability targets and chapter outcome remain available without dominating the screen.

Quest focus:

- Quest experience now communicates `Understand → Act → Prove → Reflect → Reveal`;
- only the current lifecycle phase dominates the page;
- long why/proof/resources material is progressively disclosed;
- action steps remain visible and scannable;
- existing private evidence and reflection forms remain authoritative;
- completed Quest has a dedicated truthful reveal moment using real XP and the real next unlocked Quest when one exists;
- no fake unlock is shown when the saved state does not provide one.

## Gate E — Build, Vault, World, Doors and Skill Tree

### Implemented; static/browser validation pending

Major Build / Builder Project:

- Builder Projects now carry Major Build/Boss Build experience framing without changing Project semantics;
- active Project uses a three-node evidence-backed milestone path;
- one current milestone dominates the Project detail experience;
- full Project definition and historical evidence remain available through progressive disclosure;
- completed Project transitions toward the Builder Vault rather than directly exposing raw proof.

Builder Vault / Portfolio:

- Portfolio now feels like a Vault of completed real Builds rather than a publication administration page;
- private-by-default rule is explicit but compact;
- completed Builds are horizontal Vault artifacts with Draft/Published/Vault-only state;
- a published proof is framed as deliberately deployed selected proof;
- adult-only/publication safeguarding remains unchanged;
- raw Quest/Project evidence remains private.

Builder World / Connect:

- Connect now leads with complementary Builders rather than profile settings and network administration;
- no follower counts, popularity scores or unrestricted private messaging were introduced;
- Builder discovery is horizontal and activity-oriented;
- accepted connections, requests, privacy settings and blocked users remain controlled but are visually subordinate;
- youth/adult safeguarding boundary remains unchanged.

Deployment Doors / Opportunities:

- Opportunities are now presented as real-world Deployment Doors rather than a dense marketplace dashboard;
- matching guidance remains explicitly non-probabilistic and non-employability-scored;
- eligibility, benefit and readiness detail is progressively disclosed;
- provider-native application and external application lifecycle controls remain intact;
- tracked application history remains available as deployment trails;
- minor application safeguards remain unchanged.

Evidence-backed Skill Tree / Living Builder Profile:

- the Living Builder Profile now presents capability claims as a Skill Tree;
- only existing `practicing`, `demonstrated` and `repeatedly_demonstrated` levels are shown;
- no numeric capability strength was invented;
- every node expands to its real evidence and verification source;
- Builder feedback controls and version history remain available;
- if evidence is insufficient, PipuPath explicitly shows no capability rather than fabricating one.

## Gate E2 — Growth Pack and Growth Library

### Implemented; static/browser validation pending

- added locked `docs/product/growth-pack-direction.md` so future chats/agents cannot turn learning support into a generic content feed;
- extended Builder Guide with backward-compatible `growthPack` advice data and the new `growth_support` intent;
- historical Builder Guide advice without `growthPack` remains parseable with an empty default;
- AI may recommend up to three contextual `book`, `course`, `skill` or `practice` items;
- resource rationale must be grounded in the Builder's current private evidence/workflow context;
- specific books are allowed only when the model is confident the title/author are stable and real;
- course recommendations must not invent URLs, current availability, fees, certificates or age eligibility;
- minors receive an explicit responsible-adult/institution verification boundary where external provider rules matter;
- deterministic fallback recommends what to learn/practise without inventing a specific unverifiable external resource;
- added private `/growth` Growth Library, backed by existing Builder Guide history rather than a new database table;
- Growth Library aggregates earlier Growth Pack suggestions while keeping their original Guide run/context available;
- Profile tools expose Growth Library and main navigation keeps it inside the `Me` navigation context;
- Growth Pack interaction awards no XP and does not independently change capability evidence.

## Validation ledger

Draft PR #38 is open from the Preview-suppressed Stage 22 branch.

CI #1013 ran against head `148c1e4bb425d332aefccf4f9332dd50525c38f8` and failed at the first gate only: Prettier formatting on six initial Stage 22 source files.

A temporary branch-only formatter workflow applied the repository's exact Prettier/Tailwind ordering to those source files, then was removed. The formatter commit was `b4c7c6c5004221ac9ea173f3fda5c8c720f942b5`; the workflow-removal commit was `f5a2a0a430a8e0b539b3a28935e066b52d1c67b0`.

CI #1018 on the human-authored cleanup commit confirmed those source files were formatted and stopped only on `docs/implementation/status.md`, which had been updated after the formatter pass.

CI #1033 on head `3ce8cb44840e1c716743b4793ef47fe6d8b4e1d9` stopped at Prettier only because the newly transformed `src/app/connect/page.tsx` had not yet been included in the temporary formatter list. The validation pipeline therefore still has not proven lint, TypeScript, coverage, integration or production build for the complete Stage 22 batch.

The final formatter workflow has now been expanded to cover Builder World plus the Growth Pack/Library files. It will be removed again before the canonical release-candidate CI. No Vercel Preview should be created until that CI is green.

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
- exact reproduction/closure proof for the reported public-proof failure;
- Growth Library/Growth Pack authenticated browser proof;
- one deliberate exact-head Vercel Preview;
- intentional merge and exact production verification.
