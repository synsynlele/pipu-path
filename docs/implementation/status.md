# Implementation status

**Current stage:** Stage 4.1 — Human Potential interpretation contract and provenance  
**Last verified:** 2026-07-30  
**Next boundary:** Stage 4.2 — controlled interpretation execution

| Stage                                      | Status      | Evidence                                                                  |
| ------------------------------------------ | ----------- | ------------------------------------------------------------------------- |
| 0 — Governance and architecture            | Complete    | Constitution, stage plan, overview, quality attributes, ADRs, ledger      |
| 1 — Engineering foundation                 | Complete    | Application foundation, shells, design system, config, logging, tests, CI |
| 2 — Identity and access                    | Complete    | DB/RLS/email/recovery/OAuth and staging browser E2E pass                  |
| 3 — Discovery                              | Complete    | Staging migrations, RLS/API verification, validation and browser E2E pass |
| 4.1 — HPI contract and provenance          | Complete    | Schema, provenance, lifecycle, RLS, generated types and staging CI pass   |
| 4.2–9                                      | Not started | No live interpretation or downstream capability exists                    |

## Stage 4.1 completion

Stage 4.1 establishes a private, persistent and provider-neutral Human
Potential foundation. Completed Discovery responses can be normalized into
versioned evidence. Interpretation requests snapshot eligible evidence,
preserve consent and age context, and retain idempotent lifecycle state.
Potential insights, uncertainty, user feedback and private profile versions
have explicit provenance and integrity rules.

Migrations `202607300007`–`010` are applied to disposable staging
`kvjcswnmhwegpakbtvlh`. Generated TypeScript was regenerated from that
confirmed schema and reconciled. Anonymous access is denied, users can read
only approved own-root records, provenance children have no direct browser
grants, and controlled functions enforce ownership, consent, safeguarding,
request snapshots and active-insight provenance.

GitHub Actions run
[30570086797](https://github.com/synsynlele/pipu-path/actions/runs/30570086797)
passed both `validate` and repeatable authenticated staging E2E against Vercel
Preview deployment `HvTW1zNiYvBwyTeRHyGWuaKCDLsp`. The E2E fixture now
handles both fresh Discovery and an already-persisted completion without
inventing or resetting product state.

Stage 4.1 contains no provider SDK, live model call, generated user conclusion,
public Builder projection, Journey or Quest behavior.

## Boundary

Stage 4.2 may add controlled interpretation execution behind the approved
provider-neutral contract: explicit consent and safeguarding checks, idempotent
request lifecycle, validated structured output, evidence-linked persistence and
safe operational logging. Stage 4.2 has not begun.
