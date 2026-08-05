# ADR: Stage 9 Selective Project Portfolio

**Status:** Accepted  
**Date:** 2026-08-04  
**Stage boundary:** Stage 9 only  
**Verification:** Complete on 2026-08-05

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

A Builder may prepare and publish a Project only when:

- the Project belongs to the authenticated Builder;
- the Project is completed;
- all three Project milestones are completed;
- the Builder is in the `18_24` or `25_plus` age band and is not flagged for a
  safeguarding review;
- the Builder explicitly confirms publication consent; and
- the Builder provides a public-safe presentation that does not expose private
  Quest evidence, Nortnspoil reflections or raw Project updates.

The adult-only rule is intentional. PipuPath serves younger Builders, but public
publication for them requires a dedicated guardian-consent, moderation and
safeguarding workflow. Stage 9 does not reduce that requirement to a checkbox.
All private Builder capabilities remain available regardless of age.

The Builder chooses and controls:

- a public Builder name;
- a public Project title;
- a short public summary;
- the problem addressed;
- the people or community served, expressed without exposing private persons;
- the useful outcome achieved;
- one truthful impact or completion signal;
- exactly three milestone summaries rewritten for public presentation;
- an optional public-safe HTTPS proof link; and
- whether the portfolio entry is published or withdrawn.

Publishing creates a stable public slug. One Builder may have only one
currently published Project proof. Withdrawal makes the public page unavailable
without deleting the private Project, portfolio draft or stable slug.
Republishing may restore the same record and slug.

## Persistence and authorization

Stage 9 owns `builder_project_portfolios`.

The base table is private. Authenticated users receive owner-only reads and no
direct table writes. Controlled database functions enforce ownership,
completed-Project eligibility, adult safeguarding, content validation, explicit
versioned consent, one-published-proof focus and valid lifecycle transitions.

Anonymous users receive no base-table grant. Public reads use one controlled
RPC that returns only the approved public-safe columns for a currently
published slug. The public return shape excludes portfolio, Project, Quest,
Mission, Journey and user identifiers.

A public proof request is checked through that same narrow RPC in the request
proxy before React begins streaming. Unknown or withdrawn slugs are rewritten
to a dedicated HTTP 404 response. The public page repeats the live-state check
and withdrawal invalidates the exact slug, providing defence in depth without
broadening anonymous database access.

## Privacy boundary

The public surface must not expose:

- Quest evidence text, links, files or image paths;
- Nortnspoil reflections;
- private Project progress notes, proof text or next actions;
- private Mission or Journey text;
- contact information;
- exact locations, school identifiers or private third-party names;
- unpublished profile fields; or
- internal database identifiers.

A selected external proof link must use HTTPS and is never copied from private
evidence automatically.

## Product experience

The Stage 9 experience extends PipuPath's calm black-and-gold Builder OS:

- a private portfolio preparation studio;
- clear warnings about what remains private;
- public-safe field guidance and validation;
- an exact private preview before publication;
- explicit publish and withdraw controls;
- a polished public proof page;
- refresh-safe and mobile-usable behavior; and
- honest empty, draft, published and withdrawn states.

The public page communicates what the Builder actually completed without
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
surface remains deliberately narrow, adult-only, consent-driven and reversible.

The required draft, preview, publication, anonymous reading, withdrawal to HTTP
404, same-slug republishing, refresh recovery, mobile usability, RLS/grant
verification and matching staging E2E gates passed on 2026-08-05. Work stops
before Builder discovery or opportunity matching.
