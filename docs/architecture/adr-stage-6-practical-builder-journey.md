# ADR: Stage 6 practical Builder Journey

**Status:** Accepted  
**Date:** 2026-08-03

## Decision

Stage 6 turns one active Practical Mission into one private, provisional Builder
Journey containing four to six ordered milestones. Gemini is called only from
the server through a provider boundary. Its output is untrusted until the
Journey domain contract validates structure, order, distinct milestones,
safety, realistic scale and the absence of Quest-level instructions.

Users may review, refine or regenerate a draft within a three-attempt limit and
must explicitly activate it. Supabase owns the lifecycle, consent check,
ownership, one-active invariant and atomic Journey-plus-milestone persistence.
Direct browser writes are denied; generation persistence is service-role-only.

Activation makes only milestone one available. Stage 6 calculates truthful
progress from completed milestones but provides no milestone completion action.
Quest execution, evidence, reflection and XP remain at the Stage 7 boundary.

## Consequences

- The Journey survives refresh and can be recovered from any authenticated
  device.
- A newer draft safely replaces an older draft for the same active mission.
- AI cannot silently activate a pathway or invent completed progress.
- Stage 7 can add Quest execution without changing the Stage 6 Journey contract.
