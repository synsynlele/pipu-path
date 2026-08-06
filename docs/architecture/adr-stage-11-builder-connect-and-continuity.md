# ADR: Stage 11 Builder Connect and Renewable Growth Cycles

**Status:** Accepted  
**Date:** 2026-08-06  
**Stage boundary:** Stage 11 only

## Context

The released application completed a private Builder development loop but did
not include the original Builder Network. It also treated a completed Project as
the end of progression. That contradicts PipuPath's operating-system purpose:
development should compound through repeated action and relevant human
connections.

PipuPath includes young users. A generic social network, public directory or
unrestricted messaging system would create unacceptable privacy, moderation and
safeguarding risk.

## Decision

Stage 11 adds two connected capabilities in one release.

### Builder Connect

- Only users in eligible adult age bands can activate Connect.
- Discovery is private by default and requires deliberate opt-in.
- Public discovery is not anonymous; all Connect pages require authentication.
- Discovery fields are allow-listed and omit contact details and private
  evidence.
- Connection state is explicit: pending, accepted, declined, cancelled or
  removed.
- Either party can block. Blocking removes discovery visibility between the
  pair and closes active connection state.
- Reporting is private and does not expose the reporter to the reported user.
- Accepted Builders may share selected contact channels through explicit,
  reversible consent.
- No chat, inbox or free-text private messaging is added.

### Renewable growth cycles

- Every Journey has a positive cycle number.
- A next Journey cycle requires a completed prior Journey and completed Builder
  Project.
- The next Journey links to its source Journey and receives a fresh bounded
  generation budget.
- Generation receives prior Journey context and must create a distinct next
  developmental cycle rather than repeat milestones.
- Portfolio publication remains optional proof distribution, not a progression
  gate.

## Data and authorization

All Stage 11 tables use RLS. Direct authenticated access is read-only and limited
to the owner or relationship participant. Cross-user discovery and every write
use authenticated, allow-listed RPCs. Helper predicates are kept in the
non-exposed `private` schema. Security-definer functions use an empty search
path, derive the actor from `auth.uid()` and have explicit execution grants.

## Consequences

PipuPath becomes a compounding loop rather than a one-time course. Network value
can grow with each eligible Builder while the product avoids the operational
and safeguarding burden of a general social platform.

## Non-goals

Minors' discovery, anonymous directories, search engines, feeds, followers,
likes, comments, messaging, group chats, teams, mentors, rankings,
opportunities, employment, funding, payments and marketplaces remain excluded.
