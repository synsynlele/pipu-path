# ADR — Stage 16 Living Builder Profile

**Status:** Release candidate — staging and authenticated Preview verified  
**Stage:** 16  
**Date:** 2026-08-17

## Context

PipuPath already has a private Human Potential Profile generated from Discovery evidence and now has durable evidence from HQLS Quests, Builder Projects and mutually confirmed Builder collaboration. The product must distinguish between what Discovery suggests and what completed action actually demonstrates.

Stage 16 therefore adds a private Living Builder Profile. It preserves the Human Potential Profile as the Discovery baseline and builds versioned capability claims only from completed product evidence.

## Decisions

1. The Human Potential Profile remains intact and is never silently rewritten by Stage 16.
2. Every Living Builder Profile refresh creates a new private version linked to the active Human Potential Profile baseline.
3. Capability labels for Quest and Project evidence come from the `capabilities_to_develop` attached to the originating Journey milestone. Stage 16 does not use AI or free-form semantic classification to invent a new capability taxonomy.
4. A completed Quest counts only when its required evidence and Nortnspoil reflection are present.
5. A completed Builder Project is stronger evidence than one completed Quest and also proves Project execution.
6. A completed collaboration proves Collaboration only when both participants contributed and mutually confirmed completion.
7. Capability progression is deterministic and explainable: one Quest-strength signal is `practicing`; strength of at least two is `demonstrated`; strength of at least four across at least two evidence records is `repeatedly_demonstrated`.
8. Every capability claim retains exact private links to the product evidence that supports it.
9. Builders can mark a current claim `accurate`, `needs_context` or `not_representative`. Feedback records agency but does not erase historical evidence.
10. No Living Builder Profile claim is published automatically. Public proof remains governed by the separate Selective Project Portfolio consent boundary.

## Evidence weights

- Completed HQLS Quest with evidence and reflection: strength 1.
- Completed Builder Project: strength 2 for its originating milestone capabilities and strength 2 for Project execution.
- Mutually completed Builder collaboration: strength 2 for Collaboration.

Weights are product rules, not psychological scores. They exist only to make progression reproducible and testable.

## Privacy and safety

- Stage 16 tables have RLS enabled and no direct browser table access.
- Authenticated reads and mutations use allow-listed RPCs that operate only on `auth.uid()`.
- Evidence projections store safe summaries and private in-product links rather than duplicating raw Quest evidence, Project updates, reflections or collaboration narratives.
- No deterministic personality label, diagnosis, employability score, popularity score or public ranking is introduced.
- No capability claim becomes public without a future explicit product decision and consent boundary.

## Stage boundary

Stage 16 is complete only when the deterministic domain rules, persistence, RPC authorization, profile UI, feedback, version history, migration verification, exact-head repository validation, authenticated Preview verification, merged-main CI and production Vercel health all pass.

Stage 17 — AI Personal Builder Guide remains deferred. It may later consume the Living Builder Profile as evidence, but Stage 16 introduces no generic chatbot or AI-driven identity mutation.
