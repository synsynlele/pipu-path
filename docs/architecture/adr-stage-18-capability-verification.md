# ADR — Stage 18 Capability Verification

Status: corrective implementation decision

## Context

The agreed roadmap is Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport / API.

A prior release used the Stage 18 label for the curated Opportunity MVP. That implementation remains valid product work and is preserved as an early Stage 20 seed; this ADR does not rewrite Git history or remove the released opportunity surface. It restores the missing Capability Verification layer before institutional expansion.

## Decision

Stage 18 introduces a separate human-verification record over the existing Living Builder Profile evidence model.

A verification is not a like, recommendation, rating or popularity signal. It is a bounded statement that a real collaborator confirms a specific capability against a specific completed collaboration that already exists in the Builder's evidence graph.

### Verification substrate

Each verification records:

- the Builder;
- the capability key and label at the time of request;
- the exact Living Builder Profile claim and evidence record used at request time;
- the stable collaboration source id behind that evidence;
- the actual collaboration partner as verifier;
- request and response lifecycle timestamps;
- optional bounded context from the Builder and verifier; and
- an immutable audit trail through status changes rather than destructive deletion.

The stable source id means a confirmed verification survives normal Living Builder Profile version refreshes without pretending that a historical claim row is the current profile.

### Trust rule

A Builder may request verification only when all of these are true:

1. the capability claim belongs to the Builder's active Living Builder Profile;
2. the chosen evidence belongs to that claim;
3. the evidence source is a completed collaboration with mutual contribution evidence;
4. the requested verifier is the other participant in that exact collaboration;
5. both people remain eligible for Builder Connect;
6. the pair is not blocked; and
7. the accepted connection still exists.

The verifier may confirm or decline only while the same relationship boundary is valid. Ending or blocking the relationship makes an unresolved request non-actionable.

### Meaning of verification

Stage 18 keeps two concepts separate:

- **PipuPath action evidence** — system provenance showing that the platform has durable action evidence; and
- **Collaborator confirmed** — a human participant in the exact completed collaboration confirms the capability against that work.

Stage 18 does not create a universal score, star rating, peer popularity count or "PipuPath certified" label.

## Privacy and safeguarding

- Verification is private by default and appears only to the Builder and the actual verifier.
- The verifier sees only the capability label, bounded request context and safe collaboration-derived evidence summary needed for the decision.
- Discovery answers, Human Potential Profile text, reflections, private project fields, contact details and unrelated evidence are never projected into the verification request.
- Capability verification does not create new direct messaging.
- Minor users are not routed into collaborator verification because Stage 11/15 Connect eligibility remains the gating boundary.
- Stage 19 may add institution verification by extending this trust substrate with explicit institutional roles and data grants; it must not bypass Builder ownership or private-data boundaries.

## Explicit exclusions

Stage 18 does not add:

- Institution Workspace or institution memberships;
- employer/provider verification;
- public badges or public rankings;
- endorsements detached from evidence;
- unrestricted comments or messaging;
- paid verification;
- opportunity matching changes;
- credential export or APIs.

## Completion gate

Stage 18 is complete only when the database lifecycle, RLS/grants, exact-evidence provenance, relationship/safeguarding boundaries, private Builder/verifier workspace, audit events, tests, production build and authenticated browser proof are all verified.
