# Stage 29 — Builder Network

**Status:** IMPLEMENTATION CANDIDATE — VALIDATION IN PROGRESS  
**Authority:** User-authorised Builder Network evolution  
**Base production commit:** `49617325eeed2ea743fe993ee08efee3fdd16b71`  
**Branch:** `agent/stage-29-builder-network`  
**Effective:** 2026-09-03

## Objective

Turn Connect into a purposeful Builder Network without replacing PipuPath's developmental engine or turning the product into an addictive social feed.

> **Build → Share → Discover → Connect → Message → Collaborate → Produce Evidence → Grow.**

The network exists to increase the probability that a Builder takes useful real-world action with other people. It does not exist to maximise passive screen time.

## Product decisions

1. **Builder World becomes the primary Connect destination.** The released Stage 11 Connect directory remains preserved at `/connect` and is reachable from Builder World.
2. **Home remains action-first.** Stage 29 does not turn authenticated Home into a social feed.
3. **The feed is finite.** Server retrieval is bounded and no infinite-scroll contract is introduced.
4. **No popularity economy.** Stage 29 introduces no followers, public follower counts, popularity leaderboard or vanity like mechanic.
5. **Reactions are purposeful:** `Useful`, `I can help`, and `Keep building`.
6. **Private developmental evidence stays private.** Builder World receives only activity deliberately posted into the network.
7. **Arbitrary photo/video uploads are deferred.** Native user-generated media requires a separate moderation and retention authority before release.

## School Builder Network

The existing Stage 11 Connect contract remains adult-safe and is not weakened.

Stage 29 adds a separate school social scope:

- eligible school Builders are ages 13–17 only;
- under-13 accounts remain outside Builder World;
- school participation requires an active school cohort and an active Institution Workspace;
- the school owner must deliberately enable School Builder Network;
- school Builders and adult Builders are never mixed into one social scope;
- same-school Builders may see each other when the school network is active;
- cross-school discovery works only when both schools independently enable it;
- direct messages for school Builders require both schools to enable messaging when the pair is cross-school;
- all messaging still requires an accepted Builder connection and live block/safeguarding checks.

School owners manage these controls through `/institution/network`:

1. Enable School Builder Network.
2. Allow cross-school Builder discovery.
3. Allow direct Builder messages.

Turning the main school network off withdraws active school social participation immediately without deleting the learner's private PipuPath development record.

## Persistence

Stage 29 introduces:

- `builder_network_school_settings`
- `builder_network_participation`
- `builder_network_posts`
- `builder_network_comments`
- `builder_network_reactions`
- `builder_network_conversations`
- `builder_network_messages`
- `builder_network_message_reads`
- `builder_network_reports`

All Stage 29 tables have RLS enabled. Browser roles receive no direct CRUD grants. Authenticated product behavior runs through allow-listed `SECURITY DEFINER` RPCs.

## Interaction model

### Feed posts

Allowed post kinds:

- Build update
- Milestone
- I need help
- Builder insight

Posts are bounded to 20–1000 characters. The persistence contract supports linking an owned Builder Project without exposing private Project narratives.

### Connections

Stage 29 reuses the existing `builder_connections` relationship graph but adds separate network-safe mutation RPCs. This avoids weakening Stage 11 adult contact-sharing eligibility while keeping one relationship graph for later collaboration.

### Messaging

A conversation is authorised only while:

- both users retain live Builder Network participation;
- the pair belongs to compatible adult/adult or school/school scopes;
- neither Builder has blocked the other;
- an accepted Builder connection exists;
- school messaging policy remains enabled where applicable.

Loss of any live condition removes messaging authority even if historical messages remain persisted.

### Reporting and blocking

Stage 29 adds network reporting persistence and reuses the existing Builder block graph. Blocking closes pending/accepted Builder relationships and therefore also removes messaging eligibility.

## Deliberate Stage 29 sequencing

The first vertical slice proves:

- school/adult scope separation;
- finite Builder Feed;
- purposeful reactions and comments;
- network-specific connection mutations;
- direct messages behind accepted relationships;
- school self-service policy controls;
- mobile-first Builder World composition;
- preservation of legacy Connect.

The existing Stage 15 Collaboration system remains unchanged in this first slice. A later Stage 29 hardening slice must extend collaboration eligibility for protected school-to-school Builder pairs without weakening Stage 15's existing adult safety and evidence requirements.

## Release gates

Stage 29 must not merge until all applicable gates are green:

1. Migration applies cleanly to authorised staging.
2. RLS is enabled on every Stage 29 table.
3. Authenticated browser roles have no direct CRUD access to Stage 29 tables.
4. Adult-to-school social visibility is denied at the database boundary.
5. Under-13 Builder Network participation is denied.
6. Cross-school visibility requires both school policies.
7. Messaging requires an accepted connection and live school messaging policy.
8. Blocking removes relationship/message eligibility.
9. Canonical formatting, lint, strict TypeScript, unit coverage, integration checks and production build pass.
10. One deliberate Vercel Preview is created only after static/CI gates are green.
11. Authenticated desktop and narrow-screen Builder World flows pass on that exact Preview.
12. Production remains untouched until the exact-head Preview is accepted.

## Scale doctrine

Stage 29 must remain a compounding network asset rather than an operations burden:

- schools control their own network permissions;
- Builders opt in and withdraw themselves;
- relationship and messaging authority is deterministic in the database;
- social activity is derived from real Builders, never fabricated;
- one shared relationship graph compounds into collaboration and future opportunity matching;
- the social layer remains inside the existing modular monolith until scale or regulation justifies separation.
