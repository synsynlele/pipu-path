# ADR — Stage 15 Builder Collaboration MVP

**Status:** Release candidate  
**Stage:** 15  
**Date:** 2026-08-17

## Context

PipuPath already lets eligible adult Builders opt into discovery, form accepted connections, execute private Builder Projects and create evidence-backed proof. Stage 14 added privacy-safe product intelligence and Mission Control. The next product question is whether a trusted connection can become useful work rather than a passive network edge.

Stage 15 therefore adds structured Project-linked collaboration. It deliberately does not introduce unrestricted messaging, feeds, follower mechanics, popularity scores or a broad social workspace.

## Decisions

1. Collaboration is available only to Builders who already satisfy the Stage 11 adult Connect eligibility boundary.
2. A new collaboration can be initiated only by the owner of an active Builder Project and only with an accepted, unblocked Builder connection.
3. The collaboration record is a deliberately safe projection. The collaborator receives the Project title plus the collaboration objective, role needed, expected contribution, owner contribution and commitment note. Raw Project problem statements, private updates, Quest evidence and reflections remain owner-only.
4. Connection acceptance and collaboration acceptance are separate decisions. An accepted connection never silently becomes a collaborator.
5. Collaboration uses structured contribution records rather than chat. Each contribution requires a summary, evidence note and next step, with an optional evidence link.
6. Collaboration completion requires confirmation from both participants. Each participant must first record at least one contribution. Completed collaboration therefore represents mutual evidence, not a unilateral badge.
7. If the accepted connection is removed, or either Builder blocks the other, any pending or active collaboration is cancelled automatically. Historical completed collaboration remains durable evidence.
8. Stage 15 does not mutate the Human Potential Profile. Completed collaboration evidence becomes an input candidate for Stage 16 Living Builder Profile.
9. Collaboration lifecycle events extend the existing private `product_events` store. No second analytics system is introduced.
10. Product surfaces keep the existing navigation model. Collaboration lives under Connect and is linked from an active Builder Project.

## Lifecycle

```text
Accepted Builder connection
  → Project owner sends structured invitation
  → Collaborator accepts or declines
  → Accepted collaboration
  → Both Builders record structured contributions
  → Each Builder confirms completion
  → Completed collaboration evidence
  → Stage 16 may interpret the evidence later
```

Statuses:

- `pending`
- `accepted`
- `declined`
- `withdrawn`
- `cancelled`
- `completed`

## Privacy and safety

- New collaboration tables have RLS enabled and no direct browser access.
- All cross-user reads and writes use allow-listed authenticated RPCs.
- Only participants can read a collaboration detail projection.
- Collaboration RPCs re-check Connect eligibility, accepted relationship state and block state at mutation time.
- Contact details are not part of collaboration payloads. Existing Stage 11 explicit contact-sharing consent remains separate.
- Collaboration does not grant access to raw Project, Quest, reflection, Human Potential Profile or Economic Pathway records.
- If the current account becomes Connect-ineligible, unfinished cross-user collaboration state is suppressed.

## Evidence standard

A completed collaboration must prove:

- who participated;
- the agreed objective;
- the role/contribution expected from the collaborator;
- what the Project owner committed to contribute;
- at least one structured contribution from each participant; and
- explicit completion confirmation from both participants.

No star ratings, likes, popularity scores or public ranking are introduced.

## Authorised staging verification

The Stage 15 database slice is live on the authorised PipuPath staging project through:

- `20260817172612_stage_15_builder_collaboration_mvp`; and
- `20260817172635_harden_stage_15_collaboration_safeguarding`.

Verified on 17 August 2026:

- collaboration and contribution tables have RLS enabled;
- `anon` and `authenticated` have no direct table privileges;
- all seven collaboration RPCs are exposed only through the intended authenticated function boundary;
- a rollback-only two-actor transaction proved invitation → acceptance → contribution by both Builders → first confirmation remains incomplete → second confirmation completes;
- the safe collaboration detail contained the allow-listed agreement and contribution evidence while excluding private Project, Quest, reflection, Human Potential Profile, Economic Pathway and contact fields;
- removing the accepted connection cancelled unfinished collaboration;
- blocking either participant cancelled unfinished collaboration;
- changing one actor into an ineligible safeguarding state suppressed all unfinished cross-user collaboration state; and
- the behavioral transaction rolled back completely, leaving zero verification collaborations and contributions.

Generated Supabase TypeScript confirms the new enum, tables and RPCs exist in the live schema.

## Authenticated Preview verification

The Stage 15 user experience was verified against the matching Vercel Preview on 17 August 2026.

Playwright run `32051548510`, job `95451843408`, passed **3 of 3 tests** with zero failures on branch head `6826d2765585f92278dd4672fe0472f53e1ee38f`:

1. anonymous users cannot enter Builder Collaboration;
2. an authenticated eligible Builder can see the structured collaboration surface and contribution evidence without unrestricted social mechanics; and
3. the collaboration detail renders the allow-listed working agreement while private product fields remain absent.

Synthetic Preview relationship/collaboration data and the temporary fixture username used for this proof were deleted immediately after verification. Post-cleanup checks confirmed zero synthetic Preview collaborations, zero synthetic contributions and restoration of the fixture username.

## Deferred

Stage 15 does not add:

- unrestricted direct messaging;
- group/community collaboration;
- public collaboration feeds;
- payments or escrow;
- mentor matching;
- AI collaborator ranking;
- institution-assigned collaboration;
- public endorsements; or
- automatic Human Potential Profile changes.

## Final release gate

Stage 15 is a release candidate. Before it can be labelled released, the exact final PR head must pass the complete repository validator and Vercel deployment check, PR #28 must be merged intentionally, merged-main CI must pass and the production Vercel deployment must be confirmed healthy.
