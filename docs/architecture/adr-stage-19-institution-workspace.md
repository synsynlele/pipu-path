# ADR — Stage 19 Institution Workspace

Status: implementation decision

## Context

The authoritative roadmap is:

`Stage 18 Capability Verification → Stage 19 Institution Workspace → Stage 20 Opportunity Marketplace → Stage 21 Builder Passport/API`.

Stage 13 already provides a voluntary KHP-OS school cohort bridge with a minimum reporting threshold of five and no learner-level institutional payload. Stage 18 adds private, evidence-bound capability verification by the actual collaboration partner.

Stage 19 must add a useful institutional operating surface without turning PipuPath into a school-management system, weakening Stage 13 privacy, or creating a second disconnected verification system.

## Decision

Stage 19 introduces an **Institution Workspace** tied to an existing Stage 13 institutional cohort. It has two deliberately separate data modes:

1. **Cohort intelligence** — privacy-thresholded aggregate development signals only.
2. **Builder-authorised verification** — an individual Builder explicitly shares one exact capability/evidence item with their institution for a bounded verification decision.

These modes must never be conflated. Cohort membership alone does not permit learner-level browsing.

## Workspace and roles

Each Stage 19 workspace is bound to one `khpos_school_cohorts` record in the MVP.

Institution operators are explicit PipuPath accounts provisioned through the platform administration boundary. Stage 19 uses only three institution roles:

- `owner` — workspace administration plus analyst and verifier permissions;
- `verifier` — respond to Builder-authorised capability verification requests;
- `analyst` — view privacy-thresholded aggregate cohort intelligence.

Institution membership is never inferred from email domain, school name, cohort membership, or KHP-OS data. Browser clients never receive direct table access to institution role records.

There is no open institution self-registration in Stage 19. A platform administrator provisions the workspace and first owner so an unverified organisation cannot create institutional authority over Builders.

## Cohort intelligence boundary

The workspace reuses the Stage 13 aggregate privacy boundary. It does not reproduce its calculations in application code.

- fewer than the cohort reporting minimum (never below five) → `reportingEligible=false` and all detailed values remain suppressed;
- eligible cohorts → only distinct aggregate counts already authorised by Stage 13 are shown;
- no user IDs, names or learner rows are returned through the analytics surface;
- no Human Potential Profile prose, Economic Pathway detail, mission/reflection prose, quest evidence text, project text, contact data, network data or capability-verification requests are included in aggregate analytics.

Stage 19 does not score, rank or label individual learners or institutions.

## Builder-authorised institutional verification

Institution verification extends the Stage 18 trust substrate rather than creating a parallel endorsement system.

A Builder can request institutional verification only when:

1. the Builder has an active Stage 13 membership in the workspace's cohort;
2. the cohort and workspace are active;
3. the Builder account is active and not under safeguarding review;
4. the capability belongs to the Builder's active Living Builder Profile;
5. the selected evidence belongs to that exact capability claim; and
6. the Builder explicitly submits that exact capability/evidence pair to the institution under the Stage 19 consent policy.

The institution does **not** choose a learner from a roster and inspect their profile. The Builder creates the share.

An authorised `owner` or `verifier` may then see only the bounded verification projection needed to decide:

- Builder display name / username needed to identify the request;
- capability label and development level at request time;
- safe source title and evidence summary already present in the Living Builder Profile;
- evidence source type and occurrence date;
- optional bounded Builder context;
- request lifecycle state.

The projection excludes Discovery answers, Human Potential Profile prose, pathway details, mission/reflection prose, raw quest evidence, private Builder Project fields, contact details, Builder Network state and unrelated capabilities.

The verifier records `confirmed` or `declined` with optional bounded observation context. Both the Builder and institution may revoke a confirmed institutional verification later. A Builder may withdraw a pending request.

If the Builder withdraws from the institutional cohort or the workspace is revoked, unresolved institution requests become non-actionable. Historical confirmed records remain traceable unless explicitly revoked; they do not grant continuing access to unrelated Builder data.

## Verification language

Stage 19 adds the truthful label **“Institution confirmed”** for a completed institution verification. It does not create “PipuPath certified”, grades, star ratings, recommendation counts or popularity scores.

A confirmation means only that an authorised verifier from the named institution confirmed the capability against the exact Builder-authorised evidence and their bounded observation context.

## Safeguarding

Institution verification is not routed through adult Builder Connect and may include minors because it belongs to an explicit institutional cohort rather than social discovery. The institutional pathway therefore requires:

- active learner account;
- active voluntary cohort membership;
- no safeguarding review requirement;
- explicit per-request Builder action;
- no contact or network disclosure;
- auditable institutional operator identity;
- no direct messaging.

Stage 19 does not infer parental/legal consent beyond the consent state already represented in PipuPath; deployments that require an additional jurisdiction-specific consent layer must add it before enabling that pathway for affected learners.

## Routes

- `/institution` — role-aware Institution Workspace for aggregate intelligence and authorised verification queue.
- `/profile/verification` — existing Builder verification workspace, extended with institution verification request/history.
- `/admin/institutions` — platform-admin provisioning and role management for Stage 19 workspaces.

No new primary Builder navigation item is added.

## Audit and observability

Provisioning, role changes, verification requests, decisions, withdrawals and revocations produce privacy-safe audit events. Product telemetry records lifecycle event names and stable IDs only; it does not contain private evidence narratives.

## Explicit exclusions

Stage 19 does not add:

- SIS/LMS functionality, attendance, fees, grading or timetables;
- institution-wide learner profile browsing;
- learner rankings, institutional rankings or readiness scores;
- institution access to private HPP, reflections, raw evidence or contacts;
- direct messaging or chat;
- public verification badges;
- marketplace payments, applications or opportunity matching changes;
- portable credentials or public APIs.

## Completion gate

Stage 19 is complete only when workspace roles, aggregate privacy boundaries, Builder-authorised institutional verification, revocation/safeguarding behavior, admin provisioning, private routes, audit events, tests, database security and authenticated browser proof are verified end-to-end.
