# Stage 20 — Opportunity Marketplace

**Status:** Locked implementation authority  
**Base:** Released Stage 19 Institution Workspace  
**Goal:** Turn the existing Curated Opportunity seed into a trusted deployment marketplace where vetted providers can publish real opportunities, Builders receive explainable evidence-aware matches, and application outcomes feed the development loop without selling or exposing private Builder data.

## Product principle

PipuPath is not a jobs board and not an open classifieds marketplace. Stage 20 must connect proven development to larger real-world opportunities while preserving Builder agency, privacy, safeguarding and truthful claims.

## Existing seed to preserve

Stage 18 already provides:

- curated opportunity categories;
- age and geography eligibility checks;
- pathway/capability tag matching;
- explainable match tiers and readiness gaps;
- save, open, applied and self-reported outcome state;
- admin create/review/publish/withdraw workflow;
- official external URLs;
- no automatic transfer of private Builder profile data.

Stage 20 extends this vertical slice. It does not rebuild it.

## Locked Stage 20 scope

### 1. Trusted provider registry

Introduce a provider identity and lifecycle separate from opportunity listings.

Provider states:

- `pending`
- `approved`
- `suspended`
- `revoked`

Only approved providers may have active marketplace listings. Platform administrators remain the trust authority for provider approval and revocation.

Minimum provider data:

- organisation name;
- organisation type;
- official website/domain;
- country;
- public description;
- verification status and review provenance;
- created/updated/review timestamps.

No provider receives a Builder directory.

### 2. Provider-managed opportunity supply

Approved provider operators may create and edit their own opportunity drafts through a private provider workspace. Platform review remains required before publication.

Provider operators cannot:

- approve their own provider account;
- approve/review/publish their own listing;
- inspect Builder private profiles;
- search or browse Builders;
- access applications except those a Builder explicitly submits to that provider through the Stage 20 application boundary.

### 3. Explainable marketplace matching

Preserve Stage 18 deterministic age/geography/path/capability matching and extend it with:

- deadline status;
- opportunity provider trust state;
- verified capability evidence availability;
- institution-confirmed evidence availability where the Builder has not revoked it;
- explicit readiness gaps rather than guessed eligibility.

No hidden employability score, probability of selection, popularity ranking or opaque AI ranking enters this stage.

### 4. Builder application packet

A Builder can choose to create a private application packet for one opportunity.

The packet is Builder-controlled and may include only explicitly selected fields from approved public-safe/deployment-safe projections such as:

- display name;
- public-safe Builder summary;
- selected pathway;
- selected capability claims;
- selected supporting evidence references/projections;
- selected institution confirmations;
- selected public Portfolio proof links;
- Builder-written application note.

The Builder sees the exact packet before submission and must consent to submission.

The packet must never silently include:

- Discovery answers;
- Human Potential Profile prose;
- private reflection prose;
- private Project fields;
- contact information not explicitly included;
- network state;
- unrelated capabilities/evidence;
- safeguarding/internal moderation fields.

### 5. Application lifecycle

Application states:

- `draft`
- `submitted`
- `viewed`
- `shortlisted`
- `accepted`
- `not_selected`
- `withdrawn`

Only the Builder can create, submit or withdraw an application. Provider operators may mark submitted applications viewed/shortlisted/accepted/not-selected. Every transition is timestamped and audited.

Provider status is not treated as independent proof of employment, income or performance.

### 6. Outcome feedback into the Builder loop

A final application outcome becomes a deployment signal for PipuPath. It may inform future readiness guidance and opportunity matching, but it must not rewrite capability evidence or Human Potential Profile claims without the normal evidence/provenance rules.

### 7. Privacy, safeguarding and abuse controls

- No broad Builder browsing.
- No provider-to-Builder direct messaging in Stage 20.
- Minors remain excluded from provider submission unless a later safeguarding design explicitly authorises a supervised flow; Stage 20 defaults provider application submission to eligible adults only.
- Provider/operator access is scoped to the provider and applications deliberately submitted to that provider.
- Application packets remain private to the Builder, intended provider operators and authorised platform administrators.
- Revoked/suspended providers cannot receive new applications.
- Withdrawal stops provider workflow mutation but preserves required audit/provenance records.
- Logs and telemetry remain privacy-safe.

## Stage 20 routes

Preserve:

- `/opportunities`
- `/admin/opportunities`

Add:

- `/opportunities/[opportunityId]` — detailed Builder marketplace view and application packet preparation;
- `/opportunities/[opportunityId]/apply` — private Builder-controlled application packet review/submission;
- `/provider` — provider operator workspace;
- `/provider/opportunities` — provider-owned supply drafts/status;
- `/provider/applications` — applications submitted to that provider only;
- `/admin/providers` — platform provider approval/revocation registry.

No new global primary navigation item is required for providers on the Builder shell.

## Stage 20 persistence boundaries

Expected new durable entities:

- `opportunity_providers`
- `opportunity_provider_members`
- `opportunity_applications`
- `opportunity_application_capabilities`
- `opportunity_application_evidence`
- `opportunity_application_institution_verifications`
- application/provider audit events as required.

Existing opportunity supply/state tables must be extended rather than duplicated where safe.

## Authorization model

- Builder owns application draft/submission/withdrawal.
- Provider operators can read and transition only submitted applications belonging to their approved provider.
- Platform admin approves providers and retains marketplace moderation/review authority.
- Provider listing ownership never bypasses platform review/publication controls.
- Database/RPC boundaries are authoritative; UI hiding is not authorization.

## Non-goals

No payments, escrow, contracts, payroll, fees, bidding, gig marketplace, employer search of Builders, open messaging, recommendations sold to providers, institution ranking, Builder ranking, AI-generated selection decisions, automated rejection, credential API or Stage 21 Builder Passport API enters Stage 20.

## Definition of done

Stage 20 is complete only when:

1. provider registry and provider operator authorization are durable and RLS/RPC verified;
2. approved providers can create drafts but cannot self-review/publish;
3. Builders see trusted explainable matches and can prepare an exact application packet;
4. application submission shares only explicitly selected projections;
5. provider operators can access only applications submitted to their provider;
6. lifecycle transitions and withdrawals are enforced and auditable;
7. minors/safeguarding boundaries are proven;
8. unit/integration tests, strict TypeScript, lint, formatting, coverage and production build pass;
9. live Supabase security/lifecycle verification passes without leaving synthetic data;
10. one deliberate Vercel Preview passes authenticated Builder + provider + admin browser proof;
11. the cleaned final head passes CI, then the PR is intentionally merged and production verified.

## Vercel discipline

Automatic Preview deployment remains disabled for the Stage 20 branch. Use GitHub CI and Supabase verification during implementation. Create exactly one deliberate Preview only after the final static/database gates are green.
