# ADR — Stage 17 AI Personal Builder Guide

**Status:** Proposed implementation  
**Stage:** 17  
**Date:** 2026-08-17

## Context

PipuPath now has a private Discovery baseline, Economic Pathways, active development state and a versioned Living Builder Profile derived from completed Quest, Project and Collaboration evidence. The next product need is not another generic chatbot. Builders need a bounded guide that can interpret their current evidence, explain what matters now and recommend one useful next move without claiming authority over identity.

## Decisions

1. Stage 17 introduces a private `/guide` workspace called **Your Builder Guide**.
2. The Guide is structured around four intents only: **What should I do next?**, **Where am I improving?**, **What evidence am I missing?**, and **What should I focus on this week?** There is no unrestricted prompt box or open-ended chat history.
3. Guide context is assembled server-side from the authenticated Builder's Human Potential Profile summary, current Living Builder Profile, selected Economic Pathway when present, and current Mission/Journey/Quest/Project state.
4. Raw Quest reflections, raw Project narratives, private contact details and another Builder's private data are never sent to the Guide provider.
5. The Living Builder Profile remains the authority for demonstrated capability evidence. AI may interpret that evidence but may not create, delete or upgrade capability claims.
6. Every AI recommendation must cite valid Living Builder Profile claim IDs when it makes an evidence observation. Unknown claim IDs are rejected.
7. Recommended destinations are selected from a closed product enum and mapped to trusted application URLs after validation. The model cannot provide arbitrary links.
8. Advice must explicitly communicate uncertainty. Fixed-identity claims, guaranteed outcomes, get-rich promises, risky financial schemes and unsafe contact advice for minors are rejected.
9. A deterministic evidence-based fallback is required. Provider failure must not fabricate AI success and must remain visibly distinguishable in persisted provenance.
10. AI processing requires the Builder's current `ai_processing` consent. Safeguarding-review accounts do not receive generated guidance.
11. Guide runs are private, persisted with provenance and context version references, and protected by RLS with no direct browser table access.
12. Repeated requests for the same intent and unchanged development context reuse a recent result before spending another model call. New generations are rate-limited per Builder to control cost and abuse.
13. Builders can record whether a recommendation was helpful or not helpful. Feedback does not mutate their Living Builder Profile.
14. The Guide is surfaced from Home and Profile but is not added to the primary navigation in Stage 17. This preserves the compact product shell.

## Stage boundary

Stage 17 does not add unrestricted chat, therapy, psychological diagnosis, mentor matching, automated opportunity matching, employability scores, autonomous task execution, public AI advice or automatic profile mutation.

Stage 17 is complete only when the domain safety rules, provider/fallback behavior, persistence, cost controls, private UI, feedback, telemetry, migration verification, complete repository validation, authenticated Preview proof, merged-main CI and production Vercel health all pass.
