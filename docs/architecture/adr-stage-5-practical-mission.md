# ADR — Stage 5 Practical Mission MVP

**Status:** Accepted  
**Stage:** 5  
**Date:** 2026-08-02

## Context

Stage 4 produces one active, private Human Potential Profile with evidence-linked
insights. Stage 5 turns that approved profile into one practical direction the
user can test in real life. It does not create a Journey, milestones, Quests,
XP, public sharing or a permanent identity claim.

## Decisions

1. Mission is a separate capability consuming an explicit profile projection.
   It does not mutate or reinterpret the Human Potential Profile.
2. Gemini uses the existing server-only configuration. The provider receives
   only summary, six approved sections, insight identifiers, age band, life
   stage and general constraints—never contact, OAuth or exact birth data.
3. Provider output is untrusted. A strict domain validator checks all nine
   fields, known profile evidence references, realistic scope, permanent-purpose
   claims, diagnosis and age-aware safeguarding before persistence.
4. Generation uses a request lifecycle. One request may run per user; no more
   than three requests may be created per profile version. Failed requests are
   visible to the limit so retries remain bounded.
5. Generated records are service-role writes behind restricted functions.
   Authenticated users may read only their own records and may activate only an
   owned draft through a controlled function.
6. A partial unique index enforces one active mission per user. Activating a
   draft safely replaces any earlier active mission and other drafts for the
   same profile while retaining history.
7. Refinement accepts one bounded preference, not a prompt editor. The current
   draft and approved profile are revalidated through the same contract.
8. The experience persists ready, processing, draft and active states and stops
   honestly at the Stage 6 Journey boundary.

## Lifecycle

```text
active private profile → bounded generation request → Gemini → validation
→ private draft mission → optional refine/regenerate → accept → active mission
→ refresh recovery → Stage 6 boundary
```

## Consequences

- Mission remains exploratory and reversible rather than becoming a fixed label.
- Cost and duplicate-call protection are enforced in the database, not only UI.
- Historical missions remain available for future lifecycle work but are not
  exposed as analytics or a mission marketplace in Stage 5.
