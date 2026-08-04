# ADR: Stage 8 Builder Project MVP

**Status:** Accepted and verified  
**Date:** 2026-08-04  
**Stage boundary:** Stage 8 only

## Context

Stage 7 proves that a Builder can complete a real HQLS Quest, preserve private
evidence, reflect and earn truthful progress. The next constitutional step is
to turn that verified action into a larger but still realistic Project.

A Project must not be a public claim, an AI-generated fantasy or a generic task
list. It must retain a direct link to completed Quest proof and advance only
when the Builder records real progress.

## Decision

Stage 8 introduces one private Builder Project vertical slice.

A Builder may create a Project only when:

- the source Quest belongs to the authenticated Builder;
- the source Quest is completed;
- the source Quest has durable evidence and a Nortnspoil reflection; and
- the Builder has no other active Project.

Each Project records:

- the problem being addressed;
- the people the Project is intended to help;
- the desired practical outcome;
- the smallest useful version;
- one honest success signal;
- a realistic target date; and
- exactly three ordered execution milestones.

Project updates are append-only. An update records progress, proof, an optional
HTTPS link and the next action. A milestone may move from available to active
without completion, but it becomes complete only through an update that
explicitly marks it complete and includes valid proof. Completing a milestone
unlocks the next one. Completing the third milestone completes the Project.

## Persistence and authorization

Stage 8 owns:

- `builder_projects`;
- `builder_project_milestones`; and
- `builder_project_updates`.

All records are private. RLS exposes owner-only authenticated reads. Browser
table writes are denied. Controlled `security definer` RPCs enforce identity,
ownership, completed-Quest provenance, ordered progression and state
transitions.

Project records retain source Quest, Journey and Mission identifiers so future
capabilities can explain where the Project came from without reconstructing
history.

## Product experience

The Project experience remains consistent with PipuPath's premium black-and-
gold Builder OS:

- a calm Project command centre;
- a guided creation experience grounded in completed proof;
- three clear execution milestones;
- a focused progress-and-proof update surface;
- truthful progress percentages;
- refresh-safe recovery;
- keyboard, narrow-screen and constrained-connectivity support; and
- meaningful completion without inflated celebration or public claims.

## Explicit non-goals

Stage 8 does not include:

- public Projects or evidence portfolios;
- Builder Network discovery or sharing;
- collaborators, teams, mentors or external assessment;
- likes, rankings, leaderboards or competitive scoring;
- opportunity matching, funding or marketplace behavior;
- AI-generated Project definitions; or
- Project XP awards.

## Consequences

The Project is evidence-linked and developmentally coherent. The one-active-
Project rule protects focus. Three milestones create enough structure to prove
execution without introducing a general-purpose project-management system.

## Verification

Migration `202608040018` is applied on authorised disposable staging. GitHub
Actions run `30935515692` passed full validation and authenticated staging E2E
against the matching READY Vercel Preview. The live fixture completed one
Project through three ordered proof updates, and anonymous and narrow-screen
boundaries passed.

Stage 9 remains locked. Stage 8 does not authorise public presentation,
collaboration, assessment, opportunity matching or Builder Network behavior.
