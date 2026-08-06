# ADR — Stage 11 Builder Connect and Journey Continuity

## Decision

Stage 11 is one bulk release containing two connected systems:

1. **Builder Connect MVP** — opt-in adult Builder discovery, safe public-network fields, purpose-bound connection requests, request lifecycle, blocking and reporting.
2. **Journey Continuity** — completed Journeys remain immutable history and may create numbered next cycles for the same active Mission.

## Safety boundary

- Directory participation is limited to active adult accounts (`18_24` and `25_plus`) without safeguarding review flags.
- Discoverability requires explicit versioned consent.
- Minors are not listed.
- No unrestricted messaging, free-text request notes or automatic contact-detail sharing is introduced.
- Connections can be cancelled, removed or blocked. Reports are private.

## Continuity boundary

- Existing Journeys become Cycle 1.
- A completed Journey can create one draft continuation cycle.
- Each cycle has its own milestones, Quests, evidence and completion state.
- Completed cycles are not overwritten or marked replaced.
- OpenAI remains the preferred generator; a validated evidence-based continuation prevents provider failure from blocking progress.

## Release economy

The migration, application code, focused tests and deployment are batched. Setup-only commits use Vercel's ignored-build command. One final application head receives one Preview deployment, one authenticated release proof and one production promotion.
