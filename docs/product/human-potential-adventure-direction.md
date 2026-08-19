# PipuPath Human Potential Adventure Direction v1.0

**Status:** LOCKED PRODUCT DIRECTION  
**Authority:** Product experience authority after Stage 21  
**Effective:** 2026-08-19  
**Product:** PipuPath  
**Company:** KAEC-NG

## The decision

PipuPath is no longer to be designed or described as a conventional youth-development dashboard with game decoration added to it.

PipuPath is a **Human Potential Adventure System**: a real-life developmental adventure in which the screen gives structure, challenge, feedback, suspense and proof, while the Builder's actual life is the primary game world.

> **The screen is not the game. Life is the game.**

The product must make a young person want to discover, attempt, build, prove, reflect, improve and return—not because the interface is loud or childish, but because meaningful progress feels alive.

This direction is not optional styling. It governs experience architecture, interaction design, navigation, progression feedback, copy density, animation, gamification and future product decisions.

## What must never be broken

The developmental engine already built through Stages 0–21 remains authoritative.

The core loop is preserved:

`Discovery → Human Potential Profile → Possible Paths → Mission → Journey → Quest → Evidence → Reflection → Capability → Project → Portfolio → Collaboration / Verification → Opportunity → Builder Passport`

Stage 22 must **not** flatten, replace or trivialise this architecture.

Instead, the same engine is experienced as:

- **Mission = Campaign** — the meaningful direction the Builder is pursuing.
- **Journey = Adventure Map** — the route through developmental milestones.
- **Quest = Real-World Challenge** — the current action to complete outside the screen.
- **Evidence = Proof of Action** — truthful proof that something was attempted or achieved.
- **Reflection = Learn & Power Up** — convert experience, including failure, into insight.
- **Capability = Skill Tree** — evidence-backed abilities that emerge and strengthen over time.
- **Project = Major Build / Boss Build** — combine capabilities to create something useful.
- **Portfolio = Builder Vault** — selected proof of what the Builder has actually built.
- **Opportunity = New World / Deployment Door** — a real place to use demonstrated capability.
- **Passport = Portable Builder Identity** — selected, credible proof the Builder can carry outside PipuPath.

These experience names may appear selectively in the UI, but the underlying domain terminology and persistence contracts remain stable unless a future explicit migration changes them.

## Product promise

Every meaningful session should help the Builder answer at least one of these questions:

1. **Where am I going?**
2. **What is my next move?**
3. **What have I unlocked?**
4. **What am I becoming better at?**
5. **What did I prove in the real world?**
6. **What new possibility has opened because I acted?**

The first authenticated screen must prioritise **the next meaningful action**, not a catalogue of features.

## Experience principles

### 1. Action before explanation

PipuPath should reveal enough context to act, then offer deeper explanation on demand.

Long explanatory stacks are a failure mode. Use progressive disclosure, focused steps, cards, maps, stages, drawers, accordions and contextual help so the Builder does not have to read an essay before moving.

### 2. Progress must be felt

A completed real-world action must visibly change something:

- the Journey path advances;
- XP moves;
- a capability can strengthen;
- a milestone can unlock;
- the next Quest can reveal itself;
- a Project can enter the Builder Vault;
- an Opportunity can become eligible;
- the Builder identity can become more credible.

Never award progress for meaningless taps, page views or compulsive return behavior.

### 3. Curiosity without manipulation

Use honest suspense:

- partially revealed Journey paths;
- locked future nodes;
- meaningful `???` unlock previews;
- milestone reveals;
- occasional surprise challenges;
- capability discoveries based on evidence.

Do not use fake scarcity, loot-box mechanics, deceptive countdowns, gambling patterns or dark patterns.

### 4. Real life is where points come from

XP, levels, achievements and capability growth must be connected to verified developmental action such as:

- completing a Quest;
- submitting meaningful evidence;
- reflecting on an attempt;
- completing a Project milestone;
- collaborating safely;
- creating useful value;
- demonstrating a capability;
- deploying work into a real opportunity.

### 5. Failure is developmental data

PipuPath must not treat an honest failed attempt as a dead end.

A Builder who tested an idea and discovered that nobody wanted it may have strengthened experimentation, market understanding or resilience.

Use the **Nortnspoil** philosophy to turn failure into a next move without fabricating achievement.

### 6. Choice creates ownership

Where the domain allows it, give Builders meaningful choices between valid next actions rather than an endless `Next → Next → Next` tunnel.

Choices must remain bounded by safety, prerequisites and the developmental model.

### 7. Mature, not childish

The target experience should be compelling to a 12-year-old and still credible to an 18–25-year-old.

Avoid nursery aesthetics, excessive cartoonisation and noisy colour. Energy comes from hierarchy, movement, spatial structure, challenge, interaction, reveal, feedback and accomplishment.

### 8. Motion communicates consequence

Animation is functional:

- path opens when progression changes;
- progress ring/bar moves when evidence earns progress;
- capability node pulses when strengthened;
- completion reveal pauses before the next unlock;
- a completed Project visibly moves into Portfolio;
- celebration marks rare meaningful milestones.

Respect `prefers-reduced-motion`; every state must remain understandable without animation.

### 9. No dead ends

Every authenticated screen must provide an obvious escape or continuation path.

A Builder must never depend on the browser Back button to recover from a normal product flow.

Deep screens require contextual navigation such as `Back`, `Close`, current-step context or a persistent application navigation escape.

### 10. Reliability is part of the experience

A broken proof link, inaccessible expected route, disappearing state or dead CTA destroys the adventure more than an imperfect visual design.

Stage 22 treats route integrity, state integrity, loading, error recovery and mobile usability as first-class product work.

## Adventure mechanics

### Builder level

The existing XP/level foundation becomes visible and meaningful.

Current level names remain:

- Explorer
- Learner
- Problem Solver
- Builder
- Founder Ready

Level advancement should increasingly require **developmental proof**, not XP alone. Exact requirements must be deterministic and versioned before enforcement changes are introduced.

### Journey map

Journeys should be represented spatially as a path of milestone/Quest nodes instead of primarily as vertical prose.

States should be visually unmistakable:

- completed;
- current;
- available choice;
- locked;
- hidden/reveal-later;
- major milestone.

The map must still work accessibly as semantic ordered content.

### Quest focus mode

A Quest should feel like a challenge, not an article.

Preferred interaction:

`Understand → Act → Prove → Reflect → Reveal`

Show the current phase prominently and place secondary information behind deliberate expansion.

### Skill tree

Capabilities should eventually be experienced as a living evidence-backed skill tree. Strength is never invented. Every visible claim must remain grounded in existing profile/evidence/version provenance.

### Boss Builds

Builder Projects are the natural place for major challenge framing. A Boss Build combines previously developed capabilities into something real and useful.

The term is an experience layer; Builder Project remains the authoritative domain concept.

### Achievements

Achievements must represent meaningful human-development events, for example:

- first real-world Quest completed;
- first honest evidence submitted;
- first public presentation;
- first useful artefact built;
- first productive failure reflected on;
- first collaboration completed;
- first real customer/user/value signal;
- first verified capability;
- first opportunity deployment.

Do not create achievements for opening the app repeatedly or other empty activity.

### Daily and weekly rhythm

PipuPath may create return rhythm through meaningful developmental actions:

- short Builder check-in;
- current Quest continuation;
- weekly real-world challenge;
- reflection prompt;
- progress recap;
- a new relevant opportunity;
- a meaningful unlock.

Streaks must reflect useful behavior and must not punish young users for ordinary life interruptions.

### Builder world

Social proof should communicate movement without becoming popularity competition.

Useful examples:

- Builders who took meaningful action this week;
- Projects completed;
- community challenge participation;
- collaboration activity;
- relevant builders working on similar missions where safeguarding rules permit.

Do not introduce follower counts, popularity rankings or unrestricted youth social networking.

## Youth safety and ethics

Because PipuPath serves young people, engagement must never be optimised at the expense of wellbeing.

Non-negotiables:

- no gambling mechanics;
- no paid random rewards;
- no manipulative infinite feeds;
- no popularity leaderboard for children;
- no shame-based streak recovery;
- no fabricated social activity;
- no unrestricted minor-to-adult messaging;
- no dark-pattern notifications;
- no public exposure of private developmental evidence;
- no AI pretending to be a human mentor.

The goal is **urge to build**, not compulsion to stare at a screen.

## Stage 22 reliability corrections

The following user-reported failures are mandatory Stage 22 work, not backlog polish:

### Proof flow

Trace and repair every proof/evidence CTA and lifecycle transition across Quest, Project, Portfolio, Verification and Passport. Expected proof actions must never land on an unexplained 404/unavailable page.

The fix must preserve privacy and lifecycle rules; do not make private proof public merely to avoid an error.

### Navigation

Audit every authenticated route. Add contextual escape/continuation where absent. No normal workflow should trap a user.

### Owner/admin discoverability

An authenticated active PipuPath platform administrator must receive a visible role-aware route into **Mission Control**. UI visibility is not authorization; server/data authorization remains authoritative.

Normal Builders must not receive privileged data through this change.

### Mobile experience

The adventure experience is mobile-first. Primary actions, maps, proof forms, navigation, progress and reveals must work comfortably on narrow screens and safe-area devices.

## Home experience target

Authenticated Home should feel like returning to an adventure already in progress.

Priority order:

1. identity/greeting and Builder level;
2. current Mission/Campaign;
3. one dominant **Next Move**;
4. current Journey progress/map preview;
5. XP / next level / meaningful achievement;
6. capability growth or evidence-backed insight;
7. current Project/Build when applicable;
8. relevant Builder Guide prompt;
9. world/activity signal when truthful data exists;
10. secondary product surfaces.

Do not restore a grid where every feature has equal visual weight.

## Copy standard

Default youth-facing copy should be:

- short;
- active;
- specific;
- encouraging without flattery;
- developmentally mature;
- easy to scan.

Long explanations belong behind `Why this matters`, `How it works`, detail panels or help surfaces.

AI responses in high-frequency Builder flows should prefer concise actionable output unless the Builder requests depth.

## Admin experience target

Mission Control is a distinct operational mode, not another Builder tab.

Active administrators should have a visible, role-aware entry from the authenticated shell/profile menu. The admin surface should expose aggregate operation, trust/safety and controlled review capabilities already authorised by the backend.

Do not mix private Builder development narratives into aggregate Mission Control merely for convenience.

## What Stage 22 is not

Stage 22 does **not** introduce:

- Mentor Network;
- communities as a new social product;
- unrestricted chat;
- new economic marketplace concepts;
- payments;
- new credential claims;
- a redesign of the underlying Mission/Journey/Quest domain model;
- decorative gamification disconnected from evidence.

Mentorship remains post-MVP until mentor supply, safeguarding operations and real user evidence justify it.

## Implementation order

1. Lock this product authority and Stage 22 acceptance contract.
2. Audit and repair broken proof/evidence routes and states.
3. Establish universal contextual navigation and role-aware Mission Control entry.
4. Rebuild authenticated Home as the Adventure Home.
5. Transform Journey presentation into an adventure map while preserving Journey data and lifecycle.
6. Transform Quest presentation into focused challenge phases with reveal/progress feedback.
7. Surface meaningful XP, Builder levels, unlocks and achievements using truthful existing state.
8. Improve Project presentation toward major Build/Boss Build framing without changing Project semantics.
9. Introduce capability/skill-tree presentation only from existing evidence-backed profile state.
10. Perform complete mobile, accessibility, reduced-motion, loading/error and authenticated E2E validation.
11. Run one deliberate Vercel Preview only after static/CI gates are green and the browser proof is ready.

## Acceptance test for every redesigned screen

Before a screen is accepted, answer yes to all applicable questions:

- Is the Builder's next meaningful action obvious within seconds?
- Is the screen lighter on reading than the previous version?
- Is the underlying developmental structure still intact?
- Does progress feel spatial, consequential or reveal-based rather than form-based?
- Is any reward tied to truthful developmental activity?
- Is there curiosity without manipulation?
- Can the user leave or recover without browser navigation?
- Does it work on mobile?
- Does it work with reduced motion?
- Does it preserve privacy and safeguarding boundaries?
- Does failure lead to a useful next move where appropriate?
- Does the experience make the Builder want to **do something in real life**, rather than merely remain on the screen?

If the final answer is no, the experience is not yet PipuPath-quality.

## Final product doctrine

PipuPath must become the place where a young person can watch their potential turn into evidence.

The best version of PipuPath is not the application with the most features or the most visual effects. It is the application that makes real growth feel like an unfolding adventure:

> **Choose a Mission. Enter a Journey. Take a Quest. Act in the real world. Bring back proof. Learn from what happened. Grow capability. Build something useful. Unlock a larger opportunity. Carry credible evidence of who you are becoming.**

Future chats, agents and implementation stages must preserve this direction unless the user explicitly replaces this authority.
