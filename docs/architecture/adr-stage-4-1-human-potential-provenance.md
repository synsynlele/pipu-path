# ADR — Stage 4.1 Human Potential evidence and provenance foundation

**Status:** Accepted  
**Stage:** 4.1  
**Date:** 2026-07-30

## Context

Stage 3 produces completed, private Discovery evidence. Stage 4.1 establishes the
persistent, private and explainable foundation for future interpretation without
calling a model or generating user-visible Human Potential conclusions.

## Decisions

1. Evidence, inference and user-confirmed truth are separate records. Discovery
   answers remain the source of truth; normalized evidence preserves a stable
   source pointer and never replaces the answer.
2. Evidence normalization is idempotent. A deterministic hash of user, source,
   source version, question key, response type and structured value prevents
   duplicate eligible evidence records.
3. Interpretation requests snapshot evidence through an append-only join table.
   Historical request inputs are never mutated; changed source evidence requires
   a new evidence record and request.
4. Potential insights are private, versioned machine inferences. They begin in
   `draft`, require matching evidence links, and cannot become active through
   a browser write.
5. Confidence is conservative: `low`, `emerging`, `moderate`, or
   `strong`. Numeric scores are bounded support indicators, never certainty.
   Every insight retains uncertainty records.
6. User feedback is append-only. It records confirmation, correction, rejection
   or uncertainty without rewriting the machine inference.
7. Human Potential Profile versions are private drafts. Activation and public
   Builder Profile projection are explicitly outside Stage 4.1.
8. Provider execution is behind a provider-neutral contract. Stage 4.1 contains
   no provider SDK, credentials, prompt execution or live model call.
9. Sensitive evidence is minimized in interpretation input, never logged, and
   cannot be exposed anonymously or through future public-builder boundaries.
10. Minor status, consent and safeguarding restrictions are server-enforced
    eligibility and output-validation constraints, not prompt-only guidance.

## Lifecycle

```
completed Discovery response -> normalized evidence -> immutable request snapshot
-> validated synthetic output (tests only) -> draft insight + provenance
-> optional user feedback -> private draft profile version
```

## Consequences

- Reprocessing creates a new interpretation request; it never changes an older
  evidence snapshot or profile history.
- Raw provider payloads are discarded by default. Only validated structured
  results and safe failure metadata are persisted.
- Stage 4.2 may implement an adapter only after it satisfies the contracts and
  safeguards established here.
