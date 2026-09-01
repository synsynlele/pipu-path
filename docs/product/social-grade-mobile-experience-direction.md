# PipuPath Social-Grade Mobile Experience Direction v1.0

**Status:** LOCKED PRODUCT EXPERIENCE ADDENDUM  
**Authority:** User-authorised product direction after Stage 22  
**Effective:** 2026-09-01  
**Product:** PipuPath  
**Company:** KAEC-NG

## Decision

PipuPath should feel as effortless to understand and navigate as the world's best social products while remaining a fundamentally different kind of system.

The target is **social-grade ease without social-media addiction**.

A Builder should feel comfortable opening PipuPath, immediately knowing where they are, seeing one meaningful next action and moving forward with minimal cognitive load. Familiar mobile interaction patterns may be used, but engagement must remain tied to real development rather than screen time.

This addendum supersedes the Stage 22 **six-destination presentation model**. It does **not** replace the Stage 0–22 developmental engine, persistence model, privacy model, evidence lifecycle or safeguarding rules.

> **Make building feel as natural as socialising. Keep life as the game.**

## Five human destinations

Primary navigation is now organised around five concepts a Builder can understand without learning PipuPath's internal architecture:

1. **Home** — what matters now and the next meaningful move.
2. **Discover** — identity, strengths, interests, direction, Mission and contextual growth insight.
3. **Build** — Journey, Quests, proof, reflection, Projects and real-world action.
4. **Connect** — relevant Builders, collaboration and deployment opportunities within safeguarding boundaries.
5. **Profile** — Living Builder Profile, Builder Vault/Portfolio, Growth Library, Builder Guide and Passport.

The underlying routes and domain entities remain authoritative. Navigation groups them into human mental models rather than exposing the technical product architecture.

### Route orientation

- `/app` → Home
- `/discover`, `/mission`, Discovery flows → Discover
- `/build`, `/journey`, `/quests`, `/projects`, authenticated proof flows → Build
- `/connect`, `/opportunities` → Connect
- `/profile`, `/portfolio`, `/growth`, `/guide`, `/passport` → Profile

Deep routes retain contextual Back/Close/recovery behaviour and remain inside the authenticated `AppShell` where required.

## Interaction grammar

PipuPath should consistently use:

- fixed thumb-friendly bottom navigation on mobile;
- one dominant primary action per important screen;
- short, scannable copy;
- horizontal rails for bounded choices and progress, not infinite feeds;
- clear cards that communicate state and consequence;
- progressive disclosure instead of long explanation stacks;
- familiar icons and predictable placement;
- large touch targets and safe-area support;
- immediate visual feedback after meaningful action;
- compact personalised state derived from real Builder data;
- responsive desktop layouts that preserve the same mental model.

The experience should be mature enough for young adults while remaining immediately understandable to younger Builders.

## Home rule

Home is not a dashboard catalogue and not a social feed.

Priority:

1. greeting and truthful Builder progress;
2. current Mission/Campaign;
3. one dominant **Next Move**;
4. bounded adventure shortcuts;
5. truthful momentum from Quest, Project, evidence, achievement or level state;
6. Builder Guide support;
7. relevant Builder world/Connect entry.

No fabricated activity may be used to make Home feel busy.

## Discover rule

Discover is a living self-understanding surface, not a one-time personality test.

It may surface current evidence-backed identity, interests, Mission direction, Growth Pack and Builder Guide support. It must make clear that the Builder is not being reduced to an AI label and that the picture evolves with real evidence.

## Build rule

Build is the action centre. Journey, Quest, proof, reflection and Projects should feel like one continuous progression rather than separate software modules.

The current real-world action must dominate the screen. Completion feedback is earned only from truthful developmental work.

## Connect rule

Connect borrows the comfort of social discovery without becoming a popularity network.

Useful signals include Mission, interests, evidence-backed capabilities, `can help with`, `needs help with`, collaboration state and safe relevant opportunities.

Do not optimise for followers, likes, viral reach or compulsive consumption.

## Profile rule

Profile is the Builder's evolving identity and proof centre. It may gather Living Profile, evidence-backed capability, Builder Vault, Growth Library, Builder Guide and Passport access without making private evidence public by default.

## Installable web application

PipuPath remains one platform and one codebase.

The web application should be installable to supported phones as a Progressive Web App using web-app metadata, appropriate icons and standalone display behaviour. Store distribution may be added later without creating a second product architecture.

Initial PWA work must **not** cache authenticated Builder evidence or sensitive private state merely to claim offline support. Server-authoritative privacy and freshness are more important than decorative offline capability.

## Engagement boundary

PipuPath may use familiar engagement affordances only when they support real development.

Allowed examples:

- current-progress indicators;
- truthful XP and levels;
- bounded recent momentum;
- meaningful milestone celebration;
- relevant action reminders;
- safe suggestions based on current developmental context.

Prohibited:

- manipulative infinite feeds;
- fabricated social activity;
- follower or child popularity leaderboards;
- shame-based streaks;
- fake urgency or countdowns;
- engagement rewards for page views or screen time;
- unrestricted minor-to-adult messaging;
- dark-pattern notifications;
- public leakage of private evidence;
- AI pretending to be a human friend or mentor.

## Measurement

The redesign succeeds when it improves movement through the developmental engine, especially:

- time to identify the next meaningful action;
- Quest start and completion;
- proof submission quality;
- reflection completion;
- Project progression;
- useful collaboration;
- return-to-action rate;
- evidence-backed capability growth;
- successful deployment into opportunities.

Screen time, scrolling depth and raw session duration are not primary success metrics.

## Scale principle

One design system, one navigation grammar and one domain engine should serve web, installed PWA and any later store-distributed wrapper.

Do not fork PipuPath into separate web and mobile products. The scalable architecture is:

**one PipuPath intelligence and data layer → multiple delivery surfaces.**
