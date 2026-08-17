# ADR — Stage 14 Retention Intelligence Foundation

**Status:** Implementation candidate  
**Stage:** 14  
**Date:** 2026-08-17

## Context

PipuPath now has a coherent development loop through Discovery, the Human Potential Profile, Possible Paths, Practical Mission, 30-Day Pathway/Journey, HQLS Quests, Builder Projects, selective Portfolio proof, Builder Connect and the Stage 13 institutional cohort bridge.

The next product decision is not which feature looks most impressive. PipuPath needs reliable evidence about which parts of the loop make Builders return, take meaningful action and create proof. At the same time, platform operations need a protected Mission Control surface before Collaboration, Living Profile, the AI Builder Guide and Opportunity MVP expand the operating footprint.

Stage 14 therefore introduces a small, privacy-safe product intelligence boundary and an administrator-only overview. It does not create a surveillance dashboard, expose private development content, or add social engagement mechanics.

## Decisions

1. `product_events` remains the private product-telemetry store. Stage 14 extends it with a typed `feature_viewed` event and an allow-listed `feature_key`; browser clients still receive no direct access.
2. Top-level product surfaces record privacy-safe feature use server-side. Event metadata must not contain Discovery answers, profile prose, reflections, evidence text, contact details or institutional learner payloads.
3. Builder Progress Events are measured from existing truthful Quest completion state because a completed HQLS Quest already requires evidence and Nortnspoil reflection. Stage 14 does not duplicate this evidence in analytics storage.
4. A protected `platform_admins` registry is the authorization source for PipuPath administration. It is server-owned and independent from ordinary Builder profile visibility.
5. `/admin` is the first PipuPath Mission Control route. Every dashboard query re-checks authenticated admin membership at the server boundary before using service-role aggregate functions.
6. The first dashboard exposes aggregate product health only: total/new Builders, active Builders, repeat use, Builder Progress Events, a developmental funnel, and feature-level usage/repeat signals.
7. Admin analytics functions never select or return private profile sections, Discovery responses, Quest evidence text, reflections, Project prose, contact details or learner-level KHP-OS data.
8. Admin actions are auditable. Stage 14 creates the audit boundary now even though user management, moderation actions, content operations and AI operations are later slices.
9. Telemetry begins at Stage 14 for general feature usage. Historical product tables may support all-time funnel counts, but feature retention must not pretend to pre-date instrumentation.
10. The primary user navigation remains unchanged. Admin is an operational surface, not a Builder feature.

## Initial feature keys

- `home`
- `profile`
- `journey`
- `build`
- `portfolio`
- `connect`

Economic Pathways retain their existing dedicated events and are reported separately until the later Opportunity slice.

## Metrics

The Stage 14 Mission Control overview reports:

- total Builders;
- Builders created in the selected window;
- weekly and monthly active Builders from private product telemetry;
- repeat Builders with activity on at least two distinct days in the selected window;
- completed Quest count in the selected window as Builder Progress Events;
- all-time funnel participation across Discovery, Human Potential Profile, path selection, Mission, Journey, Quest completion, Project creation/completion and accepted Builder connections; and
- feature views, distinct Builders and repeat Builders per instrumented feature.

The dashboard labels repeat usage truthfully. It does not call a metric "retention" until a complete cohort-retention definition and sufficient observation window exist.

## Privacy and safety

- No browser INSERT or SELECT access to `product_events`, `platform_admins` or `admin_audit_events`.
- No direct authenticated access to aggregate admin functions.
- Service-role execution occurs only after server-side admin authorization.
- Aggregate functions return counts, not user IDs.
- Private narrative fields are excluded by design and covered by structural tests.
- Admin authorization failures do not reveal the administrator registry.

## Authorised staging database verification

The Stage 14 migration is applied to the authorised PipuPath staging project as
`20260817162335_stage_14_retention_intelligence_foundation`.

Verified on 17 August 2026:

- `platform_admins`, `admin_audit_events` and `product_events` have RLS enabled;
- `anon` and `authenticated` have no direct table privileges on the Stage 14
  administration or telemetry boundaries;
- both Stage 14 aggregate functions are executable by `service_role` only;
- the dashboard aggregate returned coherent counts across the existing Builder
  funnel without selecting private narrative fields; and
- the initial owner administrator membership was bootstrapped through the
  server-owned registry and recorded in the administrator audit boundary.

Generated Supabase types confirm the new tables, enums and aggregate RPCs are
present in the live schema. Application CI and authenticated Preview verification
remain release gates.

## Deferred

Stage 14 does not yet add:

- Builder user-management actions;
- moderation queues/actions;
- Journey/Quest content administration;
- AI-generation review;
- AI cost/latency operations;
- notifications administration;
- collaboration;
- Living Profile inference;
- AI Personal Builder Guide;
- Opportunity Marketplace; or
- long-window cohort-retention experimentation.

Those remain later vertical slices in the locked PipuPath Retention MVP roadmap.

## Stage boundary

Stage 14 is complete only when the migration, authorization boundary, product-event instrumentation, aggregate Mission Control query, `/admin` overview, structural tests, full repository validation, authorised staging database verification and authenticated Preview verification all pass on one exact branch head.
