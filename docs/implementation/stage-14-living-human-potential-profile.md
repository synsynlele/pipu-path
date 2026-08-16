# Stage 14 — Living Human Potential Profile

Status: **implementation candidate**

## Purpose

Stage 14 turns the Human Potential Profile from a one-time Discovery synthesis into a living, evidence-backed profile that can evolve when the Builder creates new real-world proof or explicitly corrects PipuPath.

This stage deliberately reuses the existing Stage 4 evidence, provenance and immutable profile-version architecture. It does not create a second capability-profile system.

## Why this stage now

The released product already has the ingredients needed for compounding personal intelligence:

- Discovery evidence;
- a versioned private Human Potential Profile;
- explicit profile feedback;
- HQLS Quest evidence and reflections;
- completed Builder Projects;
- renewable Journey cycles; and
- Economic Pathways.

The missing link is feedback from action back into self-understanding. Without that link, each new Journey creates activity but does not make the core profile materially smarter.

Stage 14 closes that loop.

## Stage 14 vertical slice

### 1. Completed Builder Project evidence

When a Builder Project moves to `completed`, PipuPath captures one private, provenance-linked Human Potential evidence record containing a bounded summary of:

- the project;
- the problem addressed;
- the people served;
- the intended outcome;
- the smallest useful version;
- the success signal; and
- milestone completion evidence.

The evidence remains private and system-managed. Stage 14 does not publish project evidence or change Portfolio visibility.

### 2. Explicit Builder feedback becomes future evidence

When a Builder confirms, partly agrees with, rejects, contextualises or edits a prior profile insight, that first-person correction is normalised into private Human Potential evidence.

An `unsure` response is intentionally excluded because uncertainty is not a correction.

This prevents PipuPath from repeatedly defending an old inference after the Builder has supplied better first-person context.

### 3. Bounded longitudinal evidence snapshot

The existing interpretation-request RPC remains the single request path. Stage 14 updates its snapshot policy so every profile pass receives:

1. the Discovery baseline; then
2. the newest eligible Builder-work and profile-feedback evidence;
3. with an absolute limit of 100 records, matching the provider contract.

This avoids creating an unbounded prompt-history system as Journey cycles compound.

### 4. Deliberate profile evolution

PipuPath does not silently rewrite a Builder's profile.

The Profile page exposes **Evolve my profile** only when new Stage 14 evidence has been captured since the current active profile version. The Builder chooses when to run the evolution pass.

After a successful evolution:

- a new immutable Human Potential Profile version is created;
- the previous active version is superseded through the existing Stage 4 persistence function;
- provenance remains attached to exact evidence IDs; and
- the new profile remains private and provisional.

### 5. Evolution-specific AI contract

The evolution prompt explicitly distinguishes:

- original Discovery evidence;
- `completed_builder_project` as observed real-world behaviour; and
- `profile_feedback` as direct first-person correction or confirmation.

The model is instructed not to treat one completed project as proof of a strong permanent capability and not to overrule explicit Builder feedback merely to preserve an earlier interpretation.

## Privacy and safeguarding boundary

Stage 14 does **not**:

- make the Human Potential Profile public;
- add institution access to individual profile content;
- export profile evolution into the KHP-OS cohort bridge;
- create public capability scores or rankings;
- infer diagnosis, destiny, permanent personality or permanent career;
- expose private project evidence in Builder Connect; or
- create a new cross-user data surface.

Existing AI-processing consent and safeguarding restrictions remain authoritative.

## Existing systems reused

Stage 14 reuses:

- `evidence_records`;
- `interpretation_requests` and request-evidence snapshots;
- `potential_insights` and insight provenance;
- `human_potential_profile_versions`;
- `persist_stage4_human_potential_profile`;
- existing Builder Projects; and
- existing profile feedback.

No duplicate capability portfolio, journey engine, project engine or AI memory store is introduced.

## Acceptance criteria

Stage 14 is complete only when:

1. A completed Builder Project automatically creates exactly one eligible private evidence record for its immutable completion state.
2. New explicit profile feedback automatically creates one private evidence record, excluding `unsure`.
3. Existing completed Projects and qualifying feedback are backfilled without user re-entry.
4. Direct browser mutation of Human Potential evidence remains closed.
5. The interpretation snapshot never exceeds 100 evidence records and preserves the Discovery baseline.
6. A Builder with no new evolution evidence cannot trigger unnecessary profile regeneration through the Stage 14 action.
7. A Builder with new evidence can deliberately evolve the profile and receive a new immutable version.
8. The evolution prompt treats project evidence and explicit feedback according to their different epistemic weight.
9. The current profile page shows the active profile version and explains that evolution remains private and provisional.
10. `npm run validate` passes on the exact branch head before merge.

## Stage boundary

Stage 14 does not add team collaboration, private messaging, public capability verification, opportunity matching, mentor access, payments, an opportunity marketplace, a Builder Passport or an AI Personal Builder Guide.

Those features should consume the stronger longitudinal evidence model only after Stage 14 is proven.
