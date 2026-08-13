# ADR — Stage 12 Economic Pathways MVP

**Status:** Proposed implementation  
**Stage:** 12  
**Date:** 2026-08-13

## Context

PipuPath already turns completed Discovery evidence into a private Human Potential
Profile, one Practical Mission, renewable Builder Journeys, HQLS Quests, private
Quest evidence and reflection, Builder Projects and selective Portfolio proof.
The next product question is not another identity layer. It is: **now that I
understand myself, what can I actually do with this knowledge to build a better
life?**

Stage 12 therefore adds a small Economic Pathways layer without replacing or
duplicating the existing execution engine.

## MVP decisions

1. **Possible Paths** and **Earn From Your Strengths** are private, versioned
   recommendations attached to the exact active Human Potential Profile version.
   They do not mutate the original profile inference records.
2. One new private `economic_pathway_recommendations` table stores 3–5 Possible
   Paths, 3–5 value/earning suggestions and one optional selected path. Browser
   users receive owner-only SELECT; generation and selection writes remain
   server-only.
3. A Possible Path explicitly separates observed pattern, possible
   interpretation, path to test and evidence needed. Paths are possibilities,
   never destiny, permanent career decisions or income promises.
4. The selected path becomes additional context for the existing Practical
   Mission. New users must select a path before generating a Mission. Existing
   active Mission/Journey history remains valid and is not rebuilt.
5. The existing Journey becomes the **30-Day Pathway** when a selected path is
   present. Its contract requires exactly four weeks: **Learn → Practice → Build
   → Test**. Existing Stage 11 renewable Journey cycles remain the persistence
   and continuation mechanism.
6. The existing Stage 8 Builder Project becomes the **First Value Challenge** for
   path-aware users. Its current problem, reachable people, smallest useful
   version, proof updates and reflection lineage already model the intended
   create-value-first experiment. No `value_experiments` table is introduced.
7. Existing Quest evidence, Project updates and Portfolio proof remain the raw
   foundation for a later Capability Portfolio and Opportunity Readiness stage.
   Stage 12 does not create those systems before engagement evidence justifies
   them.
8. OpenAI remains server-side behind a provider adapter. A deterministic,
   evidence-grounded fallback prevents provider failures from stranding the
   user.
9. Minor users receive learning-first, supervised and trusted-channel tests.
   The domain contract rejects guaranteed income, quick-money language,
   gambling, speculative trading, borrowing and unsafe minor contact.
10. A private `product_events` table records the MVP funnel: path generation and
    views, selection/change, pathway start and First Value Challenge
    start/completion. It is intentionally separate from security audit events.

## User flow

```text
Discovery
  → Human Potential Profile
  → Possible Paths + Earn From Your Strengths
  → Choose a Path
  → Practical Mission
  → 30-Day Pathway (Learn → Practice → Build → Test)
  → HQLS Quests + Evidence
  → First Value Challenge (existing Builder Project)
  → Reflect and continue the next Journey cycle
```

## Deferred from this MVP

- separate Opportunity Readiness persistence/UI
- separate Capability Portfolio persistence/UI
- opportunity marketplace or automated opportunity matching
- income estimates, pricing predictions or earnings guarantees
- new mission, quest or project engines

These remain candidates only after the MVP produces evidence that users select
paths, complete pathway work and return to continue building.
