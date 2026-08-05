# ADR — Stage 7 HQLS Quest Execution MVP

**Status:** Accepted  
**Stage:** 7  
**Date:** 2026-08-04

## Context

Stage 6 produces one active private Builder Journey with four-to-six ordered
milestones. Stage 7 must turn the current milestone into real, evidenced action
without pretending that opening a screen, uploading a file or receiving AI text
is meaningful progress.

## Decisions

1. A milestone receives exactly three ordered HQLS Quests as one validated pack.
   Quest 1 creates a small useful result, Quest 2 tests and improves it, and
   Quest 3 demonstrates stronger capability and completes the milestone.
2. Gemini uses the existing server-only configuration. It receives only the
   active Journey and milestone projection, age band, minor posture and general
   resource constraints. Contact details, OAuth data and raw Discovery evidence
   are excluded.
3. Provider output is untrusted. The domain contract validates exactly three
   ordered Quests, realistic duration, action steps, low-resource alternatives,
   evidence requirements, safety guidance, completion criteria and reflection
   prompts before service-role persistence.
4. One Quest may be active for a user at a time. Starting Quest 1 marks its
   milestone active. Quest 2 and Quest 3 remain locked until the previous Quest
   is completed.
5. Completion requires durable evidence and a complete Nortnspoil reflection.
   Evidence may contain private text, an optional HTTPS link and one optional
   image in an owner-scoped private Storage bucket.
6. XP is an append-only transaction, not a mutable display counter. Each Quest
   awards exactly 50 XP once, enforced by a unique Quest reference and an
   idempotent completion function.
7. Completing the third Quest completes its milestone and unlocks the next
   milestone. Completing the final milestone completes the Journey.
8. Generated records are service-role writes. Authenticated users receive only
   owner-scoped reads and narrowly controlled lifecycle RPCs that verify
   `auth.uid()`, active Journey ownership and valid state transitions.
9. Evidence and reflections remain private. Stage 7 does not create public
   portfolios, mentor assessment, team Quests, leaderboards, projects,
   opportunity matching or Builder Network sharing.

## HQLS lifecycle

```text
active Journey milestone
→ generate three validated Quests
→ start one available Quest
→ act in the real world
→ submit private evidence
→ complete Nortnspoil reflection
→ complete Quest and award XP once
→ unlock next Quest or milestone
→ refresh-safe recovery
→ Stage 8 boundary
```

## Experience direction

The Quest experience is a calm Builder focus environment rather than a school
assignment portal. It keeps PipuPath's black-and-gold visual system, generous
spacing, strong typography, narrow-screen usability, truthful progress, clear
state language and reduced-motion support.

## Consequences

- Progress is earned through evidenced action and reflection, not clicks.
- The three-Quest pack keeps generation cost bounded while allowing learning to
  develop across one milestone.
- Image evidence is optional so constrained connectivity never blocks the core
  developmental loop.
- Stage 8 may consume completed milestones, verified evidence, reflections and
  XP transactions, but Stage 7 does not infer public credibility or create a
  Project automatically.
