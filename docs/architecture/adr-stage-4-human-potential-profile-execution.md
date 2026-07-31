# ADR — Stage 4 Human Potential Profile execution

**Status:** Accepted  
**Stage:** 4  
**Date:** 2026-07-31

## Context

Stage 4.1 provides private, versioned Discovery evidence, immutable interpretation
request snapshots, provenance-linked potential insights, append-only feedback and
private Human Potential Profile versions. Stage 4 turns that verified foundation
into a user-visible private profile. No public Builder projection, Mission,
Journey, Quest or downstream capability is introduced.

The repository has no separate document named `Human Potential Ontology`.
The controlled ontology for this slice is therefore the accepted Stage 4.1
`hpi_insight_type`, confidence and uncertainty vocabulary, augmented only by
the six user-facing profile sections specified for Stage 4.

## Decisions

1. Gemini is an infrastructure adapter behind the existing
   `InterpretationProvider` port. It receives only the approved,
   server-side interpretation projection and returns structured JSON. Its API
   key is never public, logged or included in a client bundle.
2. The configured default is the current stable Flash model
   `gemini-3.6-flash`; `GEMINI_MODEL` remains explicit so an operator can
   pin an approved stable Flash model without a code change.
3. A server use case claims a ready request, calls the adapter with a bounded
   timeout, validates the output, then atomically persists the request outcome,
   insights, provenance links, uncertainties and one private profile version.
   Raw provider text is discarded.
4. Exactly six private profile sections are materialized: emerging strengths,
   what draws you, problems you care about, how you can contribute, current
   constraints and best next direction. The summary and section ordering are
   version metadata; claims remain individual provenance-linked insights.
5. A profile is displayed only after validated persistence succeeds. Duplicate
   generation is prevented by the request lifecycle and active-request
   idempotency constraint. Refresh reads the saved private profile.
6. Per-section feedback uses the existing append-only insight feedback model:
   Accurate → `confirmed`, Partly accurate → `partly_true`, Not accurate →
   `not_true`. An optional comment is recorded as the reason.
7. Prompt and response validation prohibit diagnosis, certainty, fixed identity,
   life-purpose claims, permanent career assignment, invented evidence and
   unsafe advice. Constraints use supportive language. Safeguarding remains a
   server eligibility rule, not a prompt-only rule.
8. Tests use a deterministic adapter double. A live staging verification is
   required before Stage 4 can be marked complete and requires a configured
   server-only Gemini key.

## Lifecycle

```
completed Discovery → evidence snapshot → ready request → claimed processing
→ Gemini structured response → validation → private version + insights + links
→ feedback → saved profile refresh → Stage 5 boundary
```

## Validation note

A fresh CI run must evaluate the final formatted branch head before staging is changed.

## Consequences

- One provider is implemented, but the domain remains replaceable.
- A provider outage, timeout, malformed output or missing configuration fails
  the request with a safe error and permits a new retry request.
- The user can disagree without rewriting machine inference or its provenance.
- Stage 4 completion is blocked until the actual staging adapter call, migration,
  generated types, RLS and browser flow are verified.
