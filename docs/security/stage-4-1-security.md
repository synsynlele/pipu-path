# Stage 4.1 Human Potential security boundary

**Status:** Verified  
**Environment:** disposable staging `kvjcswnmhwegpakbtvlh`  
**Date:** 2026-07-30

## Access model

- Stage 4.1 data is private by default.
- Anonymous roles cannot read, count, insert, update, delete or execute Stage
  4.1 relations and functions.
- Authenticated users may read only explicitly granted root records owned by
  `auth.uid()`.
- Browser clients receive no direct grants to provenance-link tables.
- Ownership is derived server-side; client-supplied ownership is not trusted.
- Service-role capability remains server-side only.

## Integrity model

- Evidence retains source identity, source version and deterministic content
  fingerprint.
- Replaced evidence supersedes an earlier eligible source record rather than
  mutating historical request snapshots.
- Interpretation requests are idempotent and cannot duplicate an active request
  for the same completed evidence contract.
- Request creation requires completed Discovery, active AI-processing consent,
  profile state and applicable safeguarding eligibility.
- An active insight must link to evidence contained in its request snapshot and
  owned by the same user.
- Profile items cannot cross ownership boundaries or include rejected/archived
  insights.
- User feedback is append-only and does not silently rewrite inference history.

## Data minimization

Sensitive Discovery responses are represented to future interpretation through
a redacted structured projection. Their raw value contributes only to the
content fingerprint needed to detect a changed source. Safe audit events record
operations and identifiers, not private answer narratives.

## Explicit exclusions

Stage 4.1 does not authorize live model execution, public profile projection,
blanket profile visibility, client-side service credentials, prompt-only
safeguarding or inference without evidence provenance.
Ÿ®8