# Stage 17 — AI Personal Builder Guide

**Status:** Implementation candidate  
**Date:** 2026-08-17

## Goal

Turn PipuPath's accumulated private development evidence into bounded, useful next-step guidance without creating a generic chatbot or allowing AI to define a Builder's identity.

## Builder experience

`/guide` offers four structured questions:

1. What should I do next?
2. Where am I improving?
3. What evidence am I missing?
4. What should I focus on this week?

A result contains a concise interpretation, evidence observations tied to valid Living Builder Profile claim IDs, one focus, one proof-bearing next action, an optional challenge and an explicit uncertainty statement.

## Evidence context

The server assembles Guide context from:

- the current Human Potential Profile summary as the Discovery baseline;
- the current Living Builder Profile and its private capability evidence;
- the selected Economic Pathway when present;
- current Mission, Journey, milestone, Quest and Project state.

Raw Quest reflections, raw Project narratives, contact details and another Builder's private data are excluded from provider context.

## Safety and agency

- Current AI-processing consent is required for every new Guide request, including cached reuse.
- Safeguarding-review accounts do not receive generated guidance.
- AI cannot mutate the Human Potential Profile or Living Builder Profile.
- Unknown capability claim IDs and unavailable product destinations are rejected.
- Fixed-identity language, guaranteed outcomes, get-rich claims, risky finance and unsafe minor-contact advice are rejected.
- Arbitrary model-generated URLs are impossible; destinations come from a closed enum and are mapped to trusted PipuPath routes.
- Every result explains what PipuPath is uncertain about.

## Resilience and cost control

- OpenAI structured output is the primary provider using the existing server-only PipuPath provider boundary.
- Any provider failure or invalid output falls back to deterministic evidence rules.
- Identical intent + unchanged development context can reuse a recent six-hour result.
- New Guide generations are capped at 12 per rolling 24 hours per Builder.
- Provider/model/prompt version, source profile IDs and a context fingerprint are persisted for provenance.

## Privacy and persistence

`builder_guide_runs` and `builder_guide_feedback` have RLS enabled. `public`, `anon` and `authenticated` receive no direct table grants. Trusted server code authenticates the Builder and performs user-scoped reads/writes with the service-role client.

Guide recommendation bodies are not copied into general product telemetry. Telemetry records only bounded events such as Guide generation, feedback and feature views.

## Explicit non-goals

Stage 17 does not add unrestricted chat, psychological diagnosis, therapy, mentor matching, opportunity matching, autonomous task execution, public AI advice, public capability ranking or automatic profile mutation.

## Release gate

Stage 17 is not released until:

1. formatting, lint, strict TypeScript, unit coverage, structural integration tests and production build pass;
2. the Stage 17 migration is applied and RLS/grants/persistence behavior are verified on the authorised Supabase project;
3. authenticated Vercel Preview proof verifies the bounded Guide, generation, evidence grounding and feedback flow;
4. the exact approved PR head passes repository CI and the matching Vercel check;
5. the PR is merged intentionally;
6. merged-main CI passes; and
7. production Vercel health is confirmed.
