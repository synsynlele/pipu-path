# ADR: Stage 9 Selective Project Portfolio

**Status:** Accepted  
**Date:** 2026-08-04  
**Stage boundary:** Stage 9 only

## Context

Stage 8 proves that a Builder can complete one private, evidence-linked Project
through three ordered milestones and durable progress updates. The next useful
boundary is not a social network, marketplace or public activity feed. It is a
carefully controlled way for a Builder to present one completed Project as a
truthful public proof of work.

Private Quest evidence, Nortnspoil reflections and Project updates may contain
personal information, child data, contact details, third-party identities or
context that must not become public automatically. Public presentation must
therefore be explicit, selective, redactable and reversible.

## Decision

Stage 9 introduces one selective public Project portfolio vertical slice.

A Builder may publish a Project only when:

- the Project belongs to the authenticated Builder;
- the Project is completed;
- all three Project milestones are completed;
- the Builder explicitly confirms publication consent; and
- the Builder provides a public-safe presentation that does not expose private
  Quest evidence, Nortnspoil reflections or raw Project updates.

The Builder chooses and controls:

- a public title;
- a short public summary;
- the problem addressed;
- the people or community served, expressed without exposing private persons;
- the useful outcome achieved;
- one truthful impact or completion signal;
- selected milestone summaries rewritten for public presentation;
- an optional public-safe HTTPS proof link; and
- whether the portfolio entry is published or withdrawn.

Publishing creates a stable public slug and a public read model. Withdrawal
must make the public page unavailable without deleting the Builder's private
Project history. Republishing may restore the same portfolio record and slug.

## Privacy and authorization

Stage 9 must keep the private Stage 8 data model authoritative.

Public portfolio records may reference the completed private Project, but the
public read path must expose only explicitly approved portfolio fields. It must
not expose:

- Quest evidence text, links or files;
- Nortnspoil reflections;
- private Project progress updates;
- private Mission or Journey text;
- contact information;
- unpublished profile fields;
- third-party names or identifiers; or
- internal database identifiers.

Authenticated lifecycle writes must use controlled server-side boundaries that
enforce ownership, completed-Project eligibility, consent state and valid
publication transitions. Anonymous users receive read access only to currently
published portfolio records through the public-safe projection.

## Product experience

The Stage 9 experience should extend PipuPath's calm black-and-gold Builder OS:

- a private portfolio preparation studio;
- clear warnings about what remains private;
- public-safe field guidance and validation;
- preview before publication;
- explicit publish and withdraw controls;
- a polished public proof page;
- refresh-safe and mobile-usable behavior; and
- honest empty, draft, published and withdrawn states.

The public page should communicate what the Builder actually completed without
inflated claims, gamification or social-pressure mechanics.

## Explicit non-goals

Stage 9 does not include:

- Builder discovery directories or search;
- public profiles beyond the single Project proof page;
- follows, likes, comments, reactions or messaging;
- rankings, leaderboards or popularity metrics;
- collaborators, teams or mentor assessment;
- opportunity, funding or employment matching;
- automatic AI publication copy;
- automatic publication of private evidence; or
- external deployment and marketplace integrations.

## Consequences

The Builder can convert verified private execution into a controlled public
proof of work while preserving privacy and developmental integrity. The public
surface remains deliberately narrow and reversible.

Stage 9 is complete only after publication, anonymous public reading,
withdrawal, refresh recovery, mobile usability, RLS/grant verification and
matching staging E2E pass. Work stops before Builder discovery or opportunity
matching.
