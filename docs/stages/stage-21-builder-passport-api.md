# Stage 21 — Builder Passport/API

**Status:** Locked implementation authority  
**Base:** Released Stage 20 Opportunity Marketplace  
**Goal:** Give Builders a portable, verifiable and revocable proof bundle that can be shared outside PipuPath without turning private development data into a public profile or pretending PipuPath is an academic, government or employment credential issuer.

## Product principle

A Builder Passport is **Builder-controlled proof portability**, not a résumé scraper and not a universal identity record.

PipuPath already knows more about a Builder than an external recipient should ever receive. Stage 21 therefore starts from an allow-list: nothing leaves PipuPath unless the Builder deliberately selects it, previews the exact snapshot, issues the Passport, and creates a specific share.

## Trust substrate to reuse

Stage 21 must extend—not duplicate—the evidence already produced by:

- Living Builder Profile capability claims and provenance;
- PipuPath action evidence;
- collaborator capability verification;
- institution capability confirmation;
- published public-safe Portfolio proofs;
- Stage 20 deployment/application outcomes as internal guidance signals.

Stage 21 must not silently convert any of those sources into stronger claims than they already support.

## Locked Stage 21 scope

### 1. Private Builder Passport workspace

Add a private `/passport` workspace where an authenticated Builder can see what is currently eligible for a Passport and prepare a new version.

The workspace must clearly distinguish:

- self-described Builder information;
- PipuPath evidence-backed capability claims;
- collaborator-confirmed capability evidence;
- institution-confirmed capability evidence;
- published Portfolio proof links.

No external share is created merely by opening or preparing the workspace.

### 2. Immutable versioned Passport

Issuing a Passport creates an immutable snapshot with a monotonically increasing Builder-owned version number.

Passport version states:

- `issued`
- `superseded`
- `revoked`

Issuing a newer Passport supersedes the previously current version and closes its active shares. Historical versions remain available privately to the Builder for provenance/audit purposes.

The snapshot must include an `issued_at` timestamp and preserve the exact labels/summaries that were consented to at issuance.

### 3. Exact Builder-selected projection

A Passport may contain only explicitly selected deployment-safe fields:

- display name;
- optional public-safe Builder summary;
- optional selected pathway label;
- selected Living Builder Profile capability claims;
- selected supporting evidence summaries belonging to those claims;
- selected currently confirmed institution verifications;
- selected currently published Portfolio proofs.

Selection limits must be bounded.

A Passport must never silently include:

- Discovery answers;
- Human Potential Profile prose;
- private reflection prose;
- private Project fields;
- email, phone or WhatsApp data;
- network/connection state;
- safeguarding or moderation fields;
- provider application notes;
- unrelated capabilities/evidence;
- hidden scores, rankings or AI selection probabilities.

### 4. Explicit preview and issuance consent

Before issuance, the Builder sees the exact Passport snapshot.

Issuance requires explicit consent to a versioned policy such as `builder-passport-v1`.

The Builder can revoke the current Passport at any time. Revocation invalidates every active share derived from that version.

### 5. Revocable, expiring share capability

A Builder may create one or more share capabilities for the current issued Passport.

Each share has:

- a public share ID that is not itself an authorization secret;
- a high-entropy secret generated server-side;
- only the **hash** of that secret persisted;
- an optional Builder label such as `Scholarship application` or `Partner school`;
- a bounded expiry of 1, 7, 30 or 90 days;
- created, expiry, last-access and revocation timestamps;
- an access counter/audit trail that contains no raw secret.

The raw secret is returned only at creation time. If it is lost, the Builder creates a new share rather than recovering the stored secret.

### 6. Human verification page without secret leakage

Public verification uses a URL shaped like:

`/passport/share/[shareId]#<secret>`

The fragment prevents the secret from being sent in the initial HTTP request, server access logs or referrer headers.

The server-rendered share route contains only a no-index verification shell. A client component reads the fragment and calls the machine endpoint using an `Authorization: Bearer <secret>` header.

The page must use `robots: { index: false, follow: false }`, `Cache-Control: no-store` and must never write the raw secret to application telemetry.

### 7. Machine-readable verification API

Add a narrow read-only endpoint:

`GET /api/passport/v1/shares/[shareId]`

Authorization is the Builder-created bearer secret for that exact share.

The endpoint returns only the issued Passport projection for that share plus verification metadata such as:

- Passport version;
- issued timestamp;
- share expiry;
- PipuPath proof type/source labels;
- current integrity state;
- machine-readable schema version.

There is **no API for enumerating Builders, Passports or shares**.

Stage 21 does not introduce general partner API keys, OAuth clients, bulk export or write APIs. Those require a later explicit platform-integration design.

### 8. Live integrity overlay

The Passport is an immutable historical snapshot, but external verification must not present revoked external proofs as if they were still current.

At share resolution time PipuPath checks live revocable sources:

- institution confirmations that were selected at issue;
- published Portfolio proofs that were selected at issue.

The response exposes an `integrityState`:

- `current` — selected revocable sources remain valid;
- `changed` — one or more selected revocable sources have since been revoked/withdrawn/unpublished.

A changed Passport may still show the historical snapshot, but it must clearly mark the changed source and must not expose a withdrawn Portfolio link as currently available.

### 9. Safeguarding boundary

Stage 21 external Passport issuance/sharing is limited to eligible adults with no safeguarding review hold.

A minor may retain all existing private PipuPath development features, but unsupervised external Passport sharing is not introduced in Stage 21. A future supervised/guardian/institution flow requires its own safeguarding design.

### 10. Abuse and rate-limit boundary

Public share resolution must use a durable rate-limit keyed from a one-way fingerprint of share ID + request identity. Raw IP addresses and bearer secrets must never be stored in the rate-limit or audit tables.

Invalid, expired, revoked or rate-limited share requests return a privacy-safe unavailable response and never reveal whether a Builder account exists.

## Planned Stage 21 routes

Add:

- `/passport` — private Builder Passport workspace, current version and share management;
- `/passport/preview` — exact private pre-issuance preview/consent surface;
- `/passport/share/[shareId]` — public no-index verification shell with fragment-secret resolution;
- `/api/passport/v1/shares/[shareId]` — narrow bearer-authorized machine verification endpoint.

No new public Builder directory or search route is introduced.

## Expected durable entities

- `builder_passport_versions`
- `builder_passport_capabilities`
- `builder_passport_evidence`
- `builder_passport_institution_verifications`
- `builder_passport_portfolio_proofs`
- `builder_passport_shares`
- `builder_passport_access_events`
- `builder_passport_rate_limits`

Browser roles must receive no direct CRUD access to these tables. Authenticated Builder operations and public share resolution use bounded RPC/server boundaries.

## Authorization model

- Builder owns Passport preparation, issuance, supersession, share creation and revocation.
- No provider or institution automatically receives Passport access because of an existing relationship.
- A share grants read access only to the specific issued version and only while its secret, expiry and revocation checks pass.
- Platform administrators do not receive a general Passport browser. Any operational access must be through privacy-safe audit/abuse controls, not private Builder content browsing.
- Database/RPC boundaries are authoritative; route hiding is not authorization.

## Non-goals

No permanent public Builder profile, searchable credential registry, government-ID verification, academic credential issuance, employment verification, salary/income proof, background checks, provider/institution Builder search, arbitrary custom fields, file uploads, blockchain credentials, API client marketplace, OAuth partner access, bulk export, webhooks, payments or Stage 22 work enters Stage 21.

## Definition of done

Stage 21 is complete only when:

1. Passport versions and exact selected snapshot entities are durable and owner-bound;
2. issuing a new version supersedes the old current version and closes its active shares;
3. only eligible adults can issue/share externally;
4. raw share secrets are generated server-side, returned once and stored only as hashes;
5. public verification requires share ID + bearer secret and cannot enumerate Builders;
6. external projection contains only allow-listed snapshot fields;
7. expiry, revocation, rate limiting and privacy-safe access audit are enforced;
8. changed institution/Portfolio source integrity is surfaced truthfully;
9. unit/integration tests, formatting, zero-warning lint, strict TypeScript, coverage and production build pass;
10. live Supabase RLS/grant/lifecycle/rollback proof passes with zero synthetic residue;
11. one deliberate Vercel Preview passes authenticated Builder issuance/share management plus anonymous valid/invalid share and API verification proof;
12. Preview machinery is removed, deployment suppression restored, final clean-head CI passes, PR merges intentionally and production health is verified.

## Vercel discipline

Automatic Preview deployment remains disabled for `agent/stage-21-builder-passport-api` during implementation. GitHub CI and Supabase verification are the continuous gates. A deliberate Preview is created only after static and database gates are green.
