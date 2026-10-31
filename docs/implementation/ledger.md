# Implementation ledger

Append entries; do not rewrite history.

## 2026-07-24 — Stage 0–1 foundation

### Authorized scope

Create a new PipuPath repository and complete Stage 0 and Stage 1 only.

### Implemented

- Locked Engineering Constitution and developmental loop
- Stage map, capability boundaries, quality attributes, and initial ADRs
- Next.js App Router and strict TypeScript foundation
- PipuPath design tokens, primitives, public shell, and application shell
- Environment schema and structured logging boundary
- Error, loading, and not-found experience foundations
- Unit/component test harness with coverage gates
- Formatting, lint, type, test, build, and CI quality gates

### Explicitly not implemented

- Authentication, user records, authorization, consent, or safeguarding flows
- Database, persistence, migrations, or product entities
- AI providers, prompts, recommendations, or generated profiles
- Journeys, quests, evidence, projects, networks, impact, or opportunity data

### Validation evidence

- `npm run format:check` — passed
- `npm run lint` — passed with zero warnings
- `npm run typecheck` — passed
- `npm run test:coverage` — 11/11 tests passed
- Coverage — 92.59% statements, 94.73% branches, 87.5% functions, 92.59% lines
- `npm run build` — passed; `/`, `/app`, and `/api/health` generated
- Production runtime smoke — `/`, `/app`, and `/api/health` returned HTTP 200
- Security headers — verified on the health endpoint
- `npm audit --audit-level=high` — zero known vulnerabilities after safe
  transitive dependency overrides

### Stage boundary

Stage 0 and Stage 1 are complete. Work stops before identity, authentication,
persistence, consent, or onboarding implementation.

## 2026-07-24 — Stage 2 reconstruction and staging verification

- Reconstructed real email/Google authentication, SSR sessions, protected
  routes, private identity, preferences, append-only consent and checkpoint.
- Applied three ordered migrations to authorised disposable staging.
- Generated and reconciled database types from staging.
- Found and repaired inherited table and security-definer function privileges.
- Passed 19/19 pgTAP RLS assertions and anonymous API denial probes.
- Created two approved users; confirmation remains pending.
- Production build and dependency audit passed.

Status: PARTIAL. Stage 3 remains locked.

### Stage 2.6 continuation evidence

- Both approved inbox aliases confirmed successfully.
- Authenticated API suite passed 19/19 assertions.
- Recovery token, callback, password update and invalid-token behavior passed.
- Actual recovery delivery hit the hosted email quota after signup delivery.
- Google initiation passed; interactive callback completion remains blocked.
- Three migrations replayed successfully from an empty transaction.
- HTTP route smoke, production build, audit and secret scan passed.
- Browser installation failed because the permitted download returned an empty
  artifact; browser E2E remains unexecuted.

Status: BLOCKED. No Stage 3 work is authorised.

### Stage 2.6 deployment verification

- Published the clean three-commit repository to private GitHub.
- Deployed the application to `https://pipu-path.vercel.app` with staging-only
  Supabase infrastructure.
- Verified public routes and anonymous protected-route redirects over HTTPS.
- Browser verification exposed dynamic `process.env` access that prevented
  Next.js from inlining `NEXT_PUBLIC_*` values.
- Replaced the dynamic browser lookup with explicit build-time references and
  added regression coverage.
- Live verification of that fix exposed an invalid nested brand link that
  prevented React from hydrating the OAuth control. Removed the duplicate link
  wrapper and added component regression coverage.
- Moved Google OAuth initiation from a client handler to a server action so
  PKCE state, callback construction and provider redirects use the server
  boundary consistently across deployment environments.
- A delivered recovery link completed authentication but fell back to the
  dashboard because `/reset-password` was absent from the safe redirect
  allowlist. Added only that controlled destination and regression coverage.
- Local validation and dependency audit pass after the correction.

Status: BLOCKED pending deployment verification, OAuth callback, recovery
delivery and the complete browser matrix.

### Stage 2.6 live authentication continuation

- Verified Google OAuth initiation, callback, profile reconciliation, identity
  checkpoint, dashboard access, session restoration, repeated sign-in, logout
  and protected-route behavior with the approved staging account.
- Verified delivered password-recovery email, corrected callback destination,
  password update, login with the new password and logout.
- Added a privacy-safe actionable error for attempted password reuse.
- Regenerated database types from confirmed staging; the generated result
  matches the committed types exactly.
- Re-ran anonymous boundary verification, full repository validation and
  dependency audit successfully.
- Corrected Playwright configuration so an explicit `E2E_BASE_URL` targets
  staging without launching a local server.
- A genuine four-test staging E2E run now fails explicitly because browser
  executables are unavailable; installation returns a zero-byte archive.

Status: BLOCKED only on the mandatory repeatable browser matrix. Stage 3
remains locked.

### Stage 2 closure

- Added a dedicated GitHub Actions staging E2E job with controlled Chromium and
  WebKit installation.
- Upgraded GitHub-maintained workflow actions to Node 24-compatible releases.
- `validate` passed remotely.
- `staging-e2e` passed all four committed desktop/mobile browser tests against
  `https://pipu-path.vercel.app`.
- Vercel deployment passed.

Status: COMPLETE. Stage 0, Stage 1 and Stage 2 are complete. Work stops at the
Stage 3 boundary.

## 2026-07-24 — Stage 3 Discovery and persistent onboarding

### Authorized scope

Implement Stage 3 completely and stop before Stage 4 interpretation.

### Implemented

- Evidence-first ADR and complete Discovery architecture
- Versioned seven-section question set with four response types
- Server-enforced age variants and optional sensitive evidence
- Private persistent sessions/responses with idempotent resume
- Controlled save, skip, progress, review and completion state machine
- Optimistic concurrency and stable safe error mapping
- Mobile-first focused question, review/edit and completion routes
- Typed completed-only Stage 4 handoff without AI interpretation
- Privacy-safe audit events, RLS, API verification and documentation maps

### Verification evidence

- Migrations `202607240004`–`006` dry-run and applied to authorised disposable
  staging `kvjcswnmhwegpakbtvlh`
- 24/24 pgTAP Stage 3 RLS assertions passed
- 12/12 repeatable staging API assertions passed with fixture cleanup
- Remote generated types exactly match committed generated types
- `npm run validate` passed: 25 unit tests, 21 integration assertions,
  formatting, zero-warning lint, strict TypeScript, coverage and production
  build
- Dependency audit found zero vulnerabilities
- Secret scan found no credential values in tracked source

### Issues found and repaired

- Changed intentional stale-write conflicts from retryable SQLSTATE `40001` to
  stable application error `P0001`, preventing client retry hangs.
- Moved a plain initial form-state export out of a `"use server"` module after
  the production build correctly rejected the boundary violation.

### Boundary

Stage 3 gathers and preserves evidence only. It does not interpret answers,
generate a Human Potential Profile or start Journeys/Quests. Stage 4 is locked
until the Stage 3 deployment browser matrix passes.

## 2026-07-30 — Stage 3 deployed closure

### Issues found and repaired

- Replaced the hanging server-action form transport with a controlled HTTP POST
  and server-side 303 redirect while retaining the validated application action.
- Removed a malformed obsolete navigation action introduced during remote repair.
- Corrected the final-answer resume rule so zero missing required answers exposes
  the review transition instead of redirecting back to question 15.
- Made the staging browser test wait for streamed controls, support persisted
  review state and use the implemented review/completion language.
- Increased only the full 15-question test budget to 120 seconds.

### Closure evidence

- Confirmed target: disposable non-production Supabase
  `kvjcswnmhwegpakbtvlh`.
- Reset exactly one approved synthetic CI fixture session.
- GitHub Actions run
  [30546184628](https://github.com/synsynlele/pipu-path/actions/runs/30546184628)
  passed both `validate` and `staging-e2e`.
- The browser flow passed login, start, all questions, persistence, resume,
  review, edit, completion, refresh recovery, anonymous protection and mobile
  access checks.
- Production dependencies audit clean with `--omit=dev`; current full-audit
  findings are confined to the development lint/glob toolchain and remain
  recorded technical debt.

Status: COMPLETE. Stage 0 through Stage 3 are complete. Work stops at the Stage
4.1 interpretation-contract boundary.

## 2026-07-30 — Stage 4.1 Human Potential provenance foundation

### Authorized scope

Implement the interpretation contract and evidence-provenance foundation only.
Do not execute a live AI provider or begin Stage 4.2.

### Implemented

- Evidence, inference and user-confirmed truth as separate persistent records
- Versioned evidence normalization with deterministic fingerprints
- Immutable interpretation-request evidence snapshots and idempotent lifecycle
- Provider-neutral validated interpretation contracts
- Explicit confidence and uncertainty representation
- Evidence-linked insight integrity and private profile versioning
- Append-only user feedback foundation
- Consent, age and safeguarding eligibility enforcement
- Sensitive-evidence projection redaction
- RLS, privilege and controlled-function boundaries
- Generated TypeScript reconciled from confirmed staging

### Verification and repairs

- Applied migrations `202607300007`–`010` to disposable staging
  `kvjcswnmhwegpakbtvlh`.
- Verified the generated-type SHA-256
  `bee7a507d78254520dae1811652ae9163f129103367a93a62516dade3b6fbc28`.
- Added provenance guards preventing active insights without same-request,
  same-owner evidence.
- Corrected evidence replacement to supersede older eligible records.
- Corrected request idempotency and duplicate-active-request behavior.
- Removed sensitive values from the interpretation projection while retaining
  change detection.
- Traced deployed authentication failure to an old Vercel Preview lacking
  Preview-scoped public Supabase variables.
- Forced a new branch deployment and added explicit runtime-failure diagnostics.
- Made authenticated Discovery E2E repeatable for both fresh and already
  persisted valid completion state.
- GitHub Actions run
  [30570086797](https://github.com/synsynlele/pipu-path/actions/runs/30570086797)
  passed `validate` and `staging-e2e`.
- Vercel Preview deployment `HvTW1zNiYvBwyTeRHyGWuaKCDLsp` passed.
- Production dependency audit remains clean; nine full-audit development
  toolchain findings remain recorded debt.

### Boundary

Status: COMPLETE. Stage 4.1 contains no live provider call, generated user
conclusion, public Builder projection, Journey or Quest implementation. Work
stops before Stage 4.2 controlled interpretation execution.

## 2026-08-02 — Stage 4 Human Potential Profile MVP closure

### Authorized scope

Complete the private six-section Human Potential Profile using server-only
Google Gemini. Persist the profile and feedback, verify refresh/mobile/security,
and stop before Mission or other Stage 5 behavior.

### Implemented

- Server-only Gemini Flash adapter behind the provider-neutral contract
- Six-section cautious profile prompt and strict post-generation validation
- Evidence-linked, versioned private profile persistence
- Truthful processing, duplicate-request prevention, safe retry and timeout
- Mobile-first profile cards and persistent per-insight feedback
- Refresh recovery and an explicit Stage 5 boundary
- Privacy-safe provider failure classification without prompts or response bodies

### Verification and repairs

- Applied Stage 4 execution migration `202607300011` to disposable staging.
- Applied `202608020012` to include the Supabase `extensions` schema in the
  evidence-normalization function search path.
- Verified privileged Stage 4 functions remain executable only by
  `service_role`; anonymous and ordinary authenticated roles are denied.
- Reconciled persisted structured evidence with the provider input contract.
- Seeded only the approved disposable CI identity with the same four active
  consent records required by normal onboarding.
- Corrected Preview Gemini environment scope and model configuration.
- Added bounded timeout handling and allowlisted provider diagnostics.
- Removed an incompatible Gemini transport-schema option and made every output
  enum and required provenance field explicit in the prompt; the full server
  validator remains authoritative.
- Verified a live Gemini interpretation request completed and persisted.
- GitHub Actions run
  [30768699971](https://github.com/synsynlele/pipu-path/actions/runs/30768699971)
  passed both full `validate` and authenticated `staging-e2e`.
- Browser E2E passed anonymous protection, login, completed Discovery recovery,
  live profile rendering, refresh, feedback persistence, Continue and mobile
  access checks.

### Boundary

Status: COMPLETE. Stage 4 is complete. Mission, Journey, Quests, Reflection,
Builder Network, public profiles, multi-provider execution, advanced analytics,
queues and multi-agent AI have not started.

## 2026-08-02 — Stage 5 Practical Mission closure

### Authorized scope

Generate one practical, private mission from the completed Human Potential
Profile, allow bounded refinement/regeneration, activate one mission, preserve
refresh state and stop at the Stage 6 Journey boundary.

### Implemented

- Evidence-linked nine-field Practical Mission domain contract
- Permanent-purpose, inflated-scope, diagnosis and minor-safety validation
- Existing server-only Gemini configuration with a 45-second bound
- Three requests per profile version and duplicate-request prevention
- Private mission history and database-enforced one-active-mission invariant
- Ready, processing, review, refinement, regeneration and active UI states
- Controlled activation and service-role-only generated persistence
- Anonymous/cross-user/direct-write structural and pgTAP coverage
- Honest Stage 6 boundary without Journey, Quest or XP behavior

### Verification

- Formatting, zero-warning lint and strict TypeScript pass.
- 60 unit tests and 30 structural integration checks pass.
- Coverage thresholds and production build pass.
- Migration `202608020013` is applied to disposable staging; generated remote
  types, RLS, ownership policies, function grants and uniqueness controls pass.
- GitHub Actions run `30771864073` passes full validation and authenticated
  staging E2E through live Gemini generation, refinement, activation, refresh,
  anonymous/mobile protection and the Stage 6 boundary.

Status: COMPLETE. Stage 5 is complete. Stage 6 Journey has not started.

## 2026-08-03 — Stage 6 Practical Builder Journey

- Added a provider-neutral Journey contract with four-to-six ordered milestones,
  realistic duration, safety, anti-inflation and anti-Quest validation.
- Added migration `202608030014` for private Journey requests, Journeys and
  milestones with RLS, ownership reads, consent and three-attempt enforcement,
  atomic service-only persistence, explicit activation and one active Journey.
- Added server-only Gemini generation, refinement/regeneration, durable review
  and active Journey UI, refresh recovery, truthful progress and first-milestone
  availability.
- Added deterministic domain/orchestration tests, structural security tests and
  authenticated staging browser coverage through the Stage 7 boundary.

Status: IMPLEMENTED LOCALLY. Full repository validation passes; staging migration,
database verification and live Gemini browser proof remain before completion.

### Stage 6 deployed closure — 2026-08-04

- Confirmed migrations `202608030014` and `202608030015` are applied and verified
  on authorised disposable staging, including Journey tables, ownership, RLS,
  RPC permissions, foreign-key indexes, consent checks, lifecycle invariants and
  service-role-only generated persistence.
- Repaired inherited invalid file suffixes that prevented CI from parsing the
  Prettier and Playwright configuration without changing Stage 6 behavior.
- Published and verified Vercel Preview deployment
  `dpl_CL6igtitZf2ay2bAiUoP6Bzdm25A` for the Stage 6 branch.
- GitHub Actions run
  [30921147078](https://github.com/synsynlele/pipu-path/actions/runs/30921147078)
  passed full `validate` and authenticated `staging-e2e` against the matching
  Stage 6 Preview.
- The repository gate passed formatting, zero-warning lint, strict TypeScript,
  70 unit tests, 39 structural/integration checks, coverage thresholds and the
  production build.
- The authenticated browser flow passed Profile → Mission → Journey, initial
  live Gemini Journey generation, live Gemini refinement, explicit activation,
  refresh recovery, milestone-one access and the honest Stage 7 boundary.
- Vercel runtime logs recorded `journey_generation_completed` for both `initial`
  and `refine` requests, proving the flow did not merely recover old persisted
  Journey state.
- Anonymous private-route protection and focused narrow-screen authentication,
  Discovery and Mission access checks passed. The duplicate mobile full-flow
  test remained intentionally skipped because the complete flow ran once in
  Chromium and mobile controls have focused coverage.
- Stage 6 changed no dependency versions; its `package-lock.json` diff was only
  a final newline. Full-audit development-toolchain findings remain previously
  recorded technical debt and were not introduced by this stage.

Status: COMPLETE. Stage 6 is complete. Work stops at the Stage 7 Quests boundary.

## 2026-08-04 — Stage 7 HQLS Quest Execution closure

### Authorized scope

Turn the active Journey milestone into a complete private HQLS Quest loop:
generation, action, evidence, Nortnspoil reflection, exactly-once XP and
truthful Quest/milestone progression. Preserve all completed stages and stop
at the Stage 8 boundary.

### Implemented

- Exactly three validated ordered Quests per current Journey milestone
- Existing server-only Gemini configuration and provider-neutral contract
- Realistic steps, low-resource alternatives, evidence requirements,
  completion criteria, reflection prompts and age-aware safety guidance
- One-active-Quest lifecycle with refresh-safe ready, active, evidence,
  reflection and completed states
- Private text evidence, optional HTTPS link and optional owner-scoped image
- Mandatory Nortnspoil reflection before completion
- Append-only, idempotent 50-XP transaction per completed Quest
- Automatic next-Quest, next-milestone and final-Journey progression
- Premium black-and-gold focus, evidence, reflection and completion screens
- Authenticated Builder shell and focused desktop/mobile browser coverage

### Database and security verification

- Applied migrations `202608040016` and `202608040017` to authorised
  disposable staging `kvjcswnmhwegpakbtvlh`.
- Verified RLS and owner-only reads on `quest_generation_requests`,
  `user_quests`, `quest_evidence`, `quest_reflections` and
  `builder_xp_transactions`.
- Verified no direct authenticated browser writes to Stage 7 tables.
- Verified generated persistence RPCs remain `service_role`-only and
  lifecycle RPCs validate `auth.uid()`, ownership and valid state.
- Verified the private `quest-evidence` bucket is owner-folder scoped,
  image-only and limited to 5 MB.
- Reconciled generated remote tables, enums, relationships and RPC signatures
  with the Stage 7 implementation contract.

### Validation and deployed proof

- Matching Vercel Preview deployment
  `dpl_86KTj6DUaAPJXkPmApTbTcneaNrA` reached READY on the final code head.
- GitHub Actions run `30930702481` passed `validate` and authenticated
  `staging-e2e` against the matching Preview.
- Formatting, zero-warning lint, strict TypeScript, 81 unit tests,
  53 structural/integration checks, coverage thresholds and production build
  passed.
- Playwright passed 13 tests with three intentional duplicate full-flow skips,
  including anonymous denial and the focused mobile Quest path.
- The authenticated browser generated a fresh live Gemini pack, started
  Quest 1, submitted private evidence, completed the Nortnspoil reflection,
  received exactly 50 XP, unlocked Quest 2 and recovered state after refresh.
- Vercel logs recorded `quest_pack_generation_completed` on the exact Preview.
- Database reconciliation confirmed one completed request, exactly three
  Quests, Quest 1 completed, Quest 2 available, Quest 3 locked, one evidence
  record, one reflection and one 50-XP transaction.

### Repairs completed during closure

- Updated the inherited Stage 6 boundary test for the authorised Stage 7
  handoff without weakening Stage 6's first-milestone invariant.
- Removed cache invalidation before the Quest generation redirect after the
  live trace proved Gemini and persistence succeeded but the client remained
  in its pending Server Action state.
- Serialised shared-fixture browser flows to prevent concurrent mutations of
  the same disposable user.
- Wrapped Quest routes in the Builder application shell so desktop and mobile
  navigation reflect the real completed path.
- Removed all temporary one-shot formatter and closure workflow files.

### Boundary

Status: COMPLETE. Stage 0 through Stage 7 are complete. Work stops at the
Stage 8 boundary. Public evidence, portfolios, Projects, mentor assessment,
team Quests, leaderboards, opportunity matching and Builder Network sharing
have not started.

## 2026-08-04 — Stage 8 Builder Project MVP closure

### Authorized scope

Turn completed private HQLS Quest proof into one focused private Builder
Project with exactly three execution milestones, append-only progress proof and
truthful completion. Preserve all completed stages and stop at Stage 9.

### Implemented

- One private active Project per Builder
- Completed Quest, evidence and Nortnspoil reflection provenance requirement
- Mission, Journey and Quest references retained on every Project
- Specific problem, people served, useful outcome, smallest version, success
  signal and bounded target date
- Exactly three ordered, measurable execution milestones
- Append-only progress, proof, optional HTTPS link and next-action records
- Database-controlled milestone unlocking and final Project completion
- Premium black-and-gold creation, command-centre and completion experience
- Complete desktop and narrow-screen Builder OS navigation

### Database and security verification

- Applied migration `202608040018` to authorised disposable staging
  `kvjcswnmhwegpakbtvlh`.
- Verified RLS on `builder_projects`, `builder_project_milestones` and
  `builder_project_updates`, with one owner-read policy per table.
- Verified no direct authenticated browser writes to Stage 8 tables.
- Verified `create_stage8_builder_project` and
  `add_stage8_builder_project_update` are unavailable to `anon` and `PUBLIC`.
- Verified one active Project per Builder, one Project per source Quest,
  completed-Quest proof requirements, ordered milestones and unique completion
  updates are database-enforced.
- Reconciled live generated tables, relationships, RPC signatures and enums
  with the Stage 8 implementation contract.

### Validation and deployed proof

- Matching Vercel Preview deployment
  `dpl_2KU8RfiEgCJ9Uf9K9BqdkvQ5g2tL` reached READY on commit
  `09f862a1aaee65e8c6d048f548333d60f084fbd0`.
- GitHub Actions run `30935515692` passed `validate` and authenticated
  `staging-e2e` against the matching Preview.
- Validation passed formatting, zero-warning lint, strict TypeScript, 85 unit
  tests, 65 structural/integration checks, coverage thresholds and production
  build.
- Playwright ran 22 tests with one shared approved staging fixture: 17 passed
  and five duplicate full-flow cases were intentionally skipped.
- The browser created a fresh evidence-linked Project, completed all three
  milestones through three proof updates, recovered 100% completion after
  refresh, denied anonymous access and passed mobile navigation checks.
- Database reconciliation confirmed one completed Project with three completed
  milestones, three append-only completion updates and a completion timestamp.

### Repairs completed

- Retargeted CI to the matching Stage 8 Vercel Preview.
- Applied the repository's exact formatter to Stage 8 source and tests.
- Repaired a Playwright race that could inspect the next milestone before the
  durable redirect and page recovery completed.
- Removed all one-time formatting and closure workflows after use.

### Boundary

Status: COMPLETE. Stage 8 is complete. Stage 9 has not started. Project proof
remains private; no public portfolio, sharing, collaboration, mentor assessment,
team Project, leaderboard, opportunity matching or Builder Network discovery
has been implemented.

## 2026-08-05 — Stage 9 Selective Project Portfolio closure

### Authorized scope

Convert one owned completed private Project into one selective,
consent-driven public proof of work. Preserve private evidence and stop
before Builder discovery, social, collaboration or opportunity mechanics.

### Implemented

- Private Portfolio Studio with public-safe preparation and exact preview
- Adult-only publication for eligible non-flagged Builders
- Explicit versioned publication consent and stable public slug
- Eleven-field anonymous public-safe RPC projection
- Withdrawal without deletion and republishing on the same slug
- Pre-stream public authorization returning HTTP 404 for withdrawn or
  unknown proof slugs
- Desktop and mobile Portfolio navigation and recovery
- RLS, owner-only reads and controlled lifecycle RPCs

### Verification evidence

- Migration `202608040019_stage_9_selective_project_portfolio.sql` applied
  and verified on authorised disposable staging `kvjcswnmhwegpakbtvlh`.
- Verified implementation commit:
  `4627036f03844237c28011268c413906f4180bf5`.
- GitHub Actions run
  [30993330779](https://github.com/synsynlele/pipu-path/actions/runs/30993330779)
  passed full `validate` and authenticated `staging-e2e`.
- Repository validation passed formatting, zero-warning lint, strict
  TypeScript, 91 unit tests, 77 structural/integration checks, coverage
  thresholds and the production build.
- Authenticated browser coverage passed 21 tests with 7 intentional
  duplicate-flow skips across Chromium and mobile.
- Matching Vercel Preview deployment:
  `dpl_EP4S38KVbzmf6oG1T15At7XsUXZ3`.
- The live flow proved publication, anonymous safe reading, withdrawal to
  transport-level HTTP 404, republishing on the same slug, refresh
  recovery, anonymous private-route denial and mobile usability.
- Vercel runtime logs recorded the stable slug
  `neighbourhood-reading-proof-1dd2ebd1` transitioning `200 → 404 → 200`.
- Final staging reconciliation confirmed one published portfolio and an
  anonymous projection containing only the approved eleven fields.
- Production resources were not touched.

### Boundary

Status: COMPLETE. Stage 0 through Stage 9 are complete. Stage 10 has not
started. Builder discovery, search, social mechanics, collaboration,
mentor assessment, opportunity matching, funding, employment and
marketplace behavior remain outside this closure.

## 2026-08-17 — Stage 18 Curated Opportunity MVP verified candidate

### Implemented

- Added curated administrator-controlled opportunity supply with separate review
  and publication state.
- Added deterministic Strong Match / Possible Match / Eligibility Check guidance
  from known Builder age/country, selected Economic Pathway and Living Builder
  Profile capability labels without AI scoring or inferred missing eligibility.
- Added private save, self-reported application and self-reported outcome state.
- Kept official URLs behind an authenticated tracked redirect and out of the
  Builder catalog payload.
- Kept primary navigation unchanged and reused the central product-event stream.
- Added database-authoritative unsafe-copy, country-code and tag validation.

### Verification evidence

- Full repository validation passed including formatting, zero-warning lint,
  strict TypeScript, 233 unit tests, integration checks, coverage thresholds and
  production build.
- Stage 18 migrations plus the append-only review-enum correction are live on
  authorised Supabase staging `kvjcswnmhwegpakbtvlh`.
- RLS, browser table-grant denial, authenticated RPC grants and admin audit
  behavior were verified directly.
- Rollback lifecycle proof passed unsafe-copy rejection, normalisation, create →
  review → publish → save → apply → outcome, material-edit review reset, closed
  application outcome continuity and cleanup.
- One deliberate Vercel Preview was built from a Git tree identical to the
  verified Stage 18 application candidate.
- Permanent Chromium browser proof passed 3/3: anonymous opportunity denial,
  authenticated non-admin Opportunity Supply denial and authenticated Builder
  evaluate/save/apply/self-reported-outcome flow.
- Temporary browser fixture and cascading Builder state were deleted and zero
  verification fixture rows remain.

### Boundary

Status: VERIFIED STACKED RELEASE CANDIDATE. Stage 18 is not released and must not
merge before Stage 17 completes its release sequence. Automatic Vercel deployment
remains disabled for the Stage 18 development branch.

# 9 October 2026 — Play release foundation

Follow-up: owner supplied `copyartint@gmail.com` for public privacy requests.
The public fallback and environment template now use that address, with the
online form still disabled. GitHub CI #1316 passed on published head `36c0292`.
Remote staging verification is blocked: Vercel returned a scope-access denial
for the recorded PipuPath team; the connected Supabase project list did not
include the recorded PipuPath database. No unrelated project was modified.

Added public web and Profile entry points for account-deletion requests, durable
server-only persistence and an owner/operator review queue. Requests cannot
target another account, bypass authentication or claim deletion completion.
Enablement requires a valid monitored contact and a staging-verified migration.
Added action and persistence boundary tests and database privilege tests.
Guarded browser-storage access in optional analytics, clarified Home stage
position and Build next-action copy, corrected the active AI-provider notice,
and added Android target-SDK artifact validation and Play signing compatibility
guidance. Implementation and outstanding release gates are recorded in
`docs/release/play-release-foundation.md`; no production changes are claimed.

## 2026-10-09 — Android verification before publication

The signed Android workflow now defaults manual runs to artifact-only verification.
Publication requires `publish=true`; the existing RELEASE_NOW trigger remains
a release action. Signing and APK target SDK gates still run before artifact upload.
No signed workflow run, AAB inspection or physical-device result is claimed.

## 2026-10-09 — Verified AAB and launch/impact pack

Uploaded candidate ce6a4f0 artifact hashes match. AAB manifest confirms package,
version 1.0.2/code 3 and SDK 36. Production certificate matches; CMS signature,
manifest and 465 signed payload digests verify. APK signing schemes and device
behavior remain unverified. Play account is restricted for identity; owner
screenshots show a replacement document under review. Launch listing, data
safety evidence worksheet, age/Families gates, device checks and a facilitator
pilot are recorded in docs/release/play-launch-and-impact-pack.md. No store
submission, final policy approval or measured impact is claimed.

## 2026-10-09 — Game of life first cycle candidate

Implemented a versioned eight-question Discovery (seven required plus optional
age-specific support), concise onboarding, one-at-a-time Quest action guidance
and five-step reflection with Back/answer preservation and guarded final submit.
Safety is visible before starting. Guide navigation earns no progress. Existing
authentication, evidence, completion and XP rules are unchanged. Documentation:
docs/product/life-game-first-cycle.md. Full validation passed: 375 unit/component
tests, 242 integration tests, coverage, lint, types, format and production build.
Migration executed successfully in Supabase rollback with eight eligible
questions per age; database still version 1 afterwards. No live migration,
production deployment or newly measured user impact is claimed.

## Preview Google sign-in redirect repair — 9 October 2026

Confirmed a synthetic Google authorization request for the preview callback
stored the production site URL as its referrer in Auth flow state. No Google
account was authenticated in this probe. The preview callback is not accepted
by the hosted redirect allow list; its configuration remains pending.

Proxy redirects now preserve refreshed and cleared session cookies, including
cookie options. Three regression tests cover rotation, expiry and account
deletion continuation. Full validation is required before release. This code
repair does not replace the required hosted Auth redirect configuration.

## Play readiness tidy-up — 9 October 2026

Delivered service-only, read-only account deletion dependency inventory and
owner/operator inspection route. Database fixture and execution grants passed
in rollback; no real user data changed. Applied account_deletion_preflight.
Full local validation passed: 392 unit/component tests, 242 integration tests,
format, lint, types and production build. Updated Quest E2E for sequential
reflection; formatting/types passed, authenticated execution remains blocked
by missing test credentials. See docs/release/play-readiness-gates.md for
remaining release gates. No deletion executor or Play submission is claimed.

## Account deletion fulfilment candidate — 9 October 2026

Implemented operator-confirmed, retryable deletion with exclusive renewable
leases, atomic linked-record purge, Storage API removal and Auth Admin removal.
Only verified absence can fulfil a request; failed jobs retain phase and retry
state. Backup takeover cannot interrupt an active lease. Protected organisation,
admin and safeguarding cases require manual review. Added stale-JWT evidence
guard. Applied fulfilment and review-handover migrations; both rollout flags
remain disabled. No real account was deleted.

Full local validation passed: 416 unit/component tests, 242 integration tests,
format, lint, types and production build. Rollback database fixtures proved
circular Mission/Journey and Passport removal, role/report guards, exclusive
leases, incomplete-verification denial, retry after Auth removal, backup takeover
and unrelated-account preservation. External Auth Admin and Storage APIs were
mocked in adapter tests, not exercised live. See the account-deletion operations
runbook for activation, policy and provider/backup gates. No public release or
Google Play submission is claimed.

### Deletion hardening verification

The fulfilment code passed exact GitHub CI run 1329. Added a reviewed FK-graph
guard at claim, purge, storage and completion checkpoints, plus current operator
role rechecks. A changed graph requires engineering privacy review before
processing. Applied account_deletion_schema_guard and re-ran rollback fixtures,
including Passport records and a revoked-operator denial. Processing flags remain
disabled; no live Storage/Auth API deletion or real-user deletion was performed.

## 2026-10-10 — Repeatable deletion API proof harness

Added a dedicated opt-in live test using the actual runDeletionJob adapter with
real Supabase Auth and Storage clients. It can target only an account newly
created by the test; requires an exact project-host match, explicit fixture mode
and an existing verified active privacy operator. Checks login, file round trip,
Auth/file/profile removal, receipt and job identity clearing, login rejection and
operator preservation. Failed fixtures retain incomplete-job evidence for review;
successful fixture receipts are removed. Ordinary CI excludes this live test.

The missing-credentials preflight failed before network mutations as intended.
No live API test, production enablement or Play submission is claimed. Workspace
server credentials remain absent. The runbook records secure injection, execution
and the limits of this proof; readiness instructions now refer to the implemented
workflow rather than requesting it again.

Full npm run validate passed: 416 unit/component tests, 242 integration tests,
format, lint, typecheck, coverage and production build. External API proof is
still pending and is not included in those passing totals.

## 2026-10-10 — Operator-run deletion proof workflow

Added a manual-only GitHub workflow for the disposable Auth/Storage test with a
separate privacy-verification environment, exact reviewed-commit gate, read-only
repository permission, bounded runtime and serial execution without cancelling
an active run. The runbook maps every required secret/config value and records
that the workflow is candidate-only and unexecuted. Vercel metadata confirmed the
service key is protected and returned no value; it was not extracted, changed or
reclassified. Live API proof and production activation remain pending.

A read-only database check found one verified active privacy owner/operator. A
second authorised operator has not been appointed; no roles were granted by
this work. Backup coverage remains an operational activation requirement.

## 2026-10-10 — Real account deletion API proof passed

Owner-uploaded project credentials were injected only into the test process.
Both JWT project references/roles and API hostname matched PipuPath. The initial
run deleted the fixture and produced a verified receipt, but a warmed cached
image response failed immediate-download verification. Supabase documents CDN
invalidation latency. The harness now verifies the origin with a unique
cacheNonce; test timeout accommodates real API latency. The second real-API test
passed: fixture login/upload, Auth/file/profile removal, fulfilled receipt,
cleared target identity, rejected login and operator preservation. Fixture
receipts were cleaned up and a database check found zero fixture accounts.
No existing user was targeted, no key printed/committed, and no production flag
was enabled. Full local validation passed (416 unit/component and 242 integration
tests plus format, lint, types, coverage and build). Retention/guardian approval,
backup operator, browser/login and Android proofs remain release blockers.

## 2026-10-10 — Retention and youth-handling proposal

Prepared a concrete policy decision for owner review: 7-day acknowledgement,
30-day service target and 90-day minimal receipt retention, all proposed rather
than implemented or legally certified. Preserves adult-only Connect/minor public
proof restrictions and the youth purpose; defines privacy/backup/exception roles,
minimal external ownership checks and safeguarding-aware guardian requests.
Provider durations, child onboarding authorisation and receipt cleanup remain
explicit implementation gates. No notice, role, audience or production flag was
changed. This proposal is in docs/release/privacy-retention-decision.md.

## 2026-10-10 — Approved retention controls

Owner approved the 7/30/90-day operating schedule. Applied the private receipt
expiry migration and active daily pg_cron job (03:10 UTC), bounded to 1,000
verified identity-cleared expired receipts. Rollback fixtures preserved fresh,
failed, linked and recently completed cases and verified client denial. Added
operator deadline/escalation flags without pretending acknowledgement was sent.
No public privacy promise, deletion flag or admin role was changed. Guardian,
provider inventory and backup/exception ownership remain pending.

## 2026-10-10 — Signed-link proof and consolidated release closure

Extended the real deletion proof with a previously issued, still-valid signed
file link: fetch succeeded before deletion and failed at the origin after
deletion. The live test passed and cleaned up the fixture receipt. Recorded
verified provider facts: Responses store:false, Supabase project/region and
protected Vercel credentials; actual retention settings remain unverified.
Prepared an explicit Home/reload/narrow Discovery login regression, but browser
installation failed with invalid archives; no E2E pass is claimed. Consolidated
all completion evidence and remaining gates in docs/release/release-closure.md.
Guardian verification, named backup, provider settings, Google callback, full
Quest/browser, Android and Console submission remain incomplete. No flags,
audience, roles, credentials or production deployment changed.

## 2026-10-10 — Reviewer nomination and backup account verification

Recorded Oluwatosin Adebayo as the owner-nominated guardian reviewer. A targeted
Auth/admin check confirmed the supplied email is the verified active owner, so
it does not establish independent backup coverage. No role was granted or
changed; a distinct adult account remains required. The nomination does not
verify guardian authority or complete the child authorisation release gate.

## 2026-10-10 — Named backup operator granted

Owner identified Adewale Ayanfe as the distinct handler of kaecng@gmail.com.
Verified confirmed Auth account and matching profile, then granted the existing
operator role with owner attribution and a success audit event in one SQL
statement. Read-back confirmed active operator status and verified email. No
owner privilege, deletion feature flag or public release was enabled. Actual
backup sign-in and handover remain unproven; guardian workflow remains incomplete.

## 2026-10-10 — Controlled operator handover preparation

Owner reported Adewale signed in and Mission Control opened. Added preview-only
fixture scope to private request/queue/inventory/review/takeover and worker
boundaries; mismatched target is refused before destructive operations. Prepared
a server-only disposable adult fixture provisioning script and repeatable human
handover checklist. Production remains disabled; human drill not yet completed.

Provisioned disposable adult bc5c55d2-3955-4f35-b03a-4841be50889d and pending
request 90bf9f41-8a9d-44af-bc29-d54c1404e236 with one harmless owned image.
Preview branch alone receives the five fixture/activation settings; production
and other preview branches remain unactivated. Local validation passed with
424 unit/component + 242 integration tests and production build.

The exact fixture-scoped preview 16a36927236897b4f873df4f0d592ed5f755b5c8 is
READY at pipu-path-cotckwv45-copyartint-2860s-projects.vercel.app, deployment
dpl_3miwTYw4phUGcmgAFvhPuudzTTY4. CI 1341 validate succeeded; E2E skipped.
Preflight confirms the pending adult fixture and one file. Human takeover and
completion remain pending; preview email/password avoids unresolved Google
callback routing. Existing deployment environment snapshots must be removed
after practice, not assumed disabled by editing project variables alone.

## 2026-10-10 — Handover authentication blocker

Owner reported preview email login and attempted new-account signup failed,
then asked to continue. Targeted existing-account Auth checks confirmed verified
Google-only identities without password credentials. Human handover remains
incomplete; no belief-based pass recorded. Set preview branch request and
fulfilment flags false and retire the untouched disposable fixture. Existing
deployment snapshots do not change with project environment edits. No password
change, email, new operator or Google callback change was made. Hosted callback
configuration and actual Google preview-return proof remain required.

Fixture cleanup completed through Storage/Auth APIs. Read-back confirmed Auth,
profile, owned file and unused pending request absent; both active operator
accounts preserved. This is fixture retirement, not a passed human handover.

## 2026-10-10 — Founder-operated pilot decision and sign-in clarity

Owner explicitly waived backup handover as a release blocker and accepted
interim operations. Updated release records without inventing a handover pass;
prepared adult recruitment scope, three-question feedback register and weekly
Quest outcome review. No age restriction or new audience declaration was
implemented. Login now distinguishes Google sign-in from account-password
sign-in; signup identifies separate email account creation. No password,
provider configuration, public deployment or deletion flag changed. Public
candidate deletion contact route was observed in the cloud browser; full
authenticated lifecycle remains unverified.

Local canonical validation passed with 424 unit/component and 242 integration
tests, coverage, formatting, lint, TypeScript and production build. React review
kept both auth pages server-rendered, adding no client state, dependencies or
authorisation changes. Hosted Auth setup instructions scope redirects to the
reviewed branch origin, preserve production and remain unapplied.

## 2026-10-10 — Google preview sign-in observed

Candidate da6cfed1ec0f9f7986127f7060118480a0c968c9, reviewed branch alias:
Google phone approval returned to the authenticated Quest page; reload retained
the session. Navigating Home and reloading displayed the owner Home with Sign
out, Mission Control and Continue Quest. Owner reported adding the Supabase
redirect. No password was set, no learning data was submitted and no XP was
created by this verification. Full Quest lifecycle, provider retention settings,
guardian authorisation for child recruitment, latest physical Android proof and
Play submission remain unverified. Operator handover remains owner-waived.

## 2026-10-10 — Quest navigation and repeatable QA

Observed action Next/Previous, private Prove form and Back recovery on reviewed
preview candidate da6cfed1ec0f9f7986127f7060118480a0c968c9. No learning mutations
were made on the owner account. Added operator-owned quest-qa-checklist.md;
full proof/reflection/exactly-once XP/next-unlock browser proof remains pending
a disposable QA account. Updated closure with observed Google persistence.
Documentation only; no production deployment or Play submission.

## 2026-10-10 — Live learner API Quest proof

Ran scripts/verify-live-quest.mjs against the connected backend using two freshly
created disposable adult Auth accounts. Synthetic fixture setup used service
permissions; lifecycle mutations and privacy reads used normal authenticated
learner API clients. All 18 checks passed: foreign Quest/evidence hidden, foreign
and locked starts denied, no XP for starting/evidence, premature completion and
invalid evidence/reflection rejected, evidence/reflection persisted, exactly one
50-XP transaction after repeat completion, next Quest unlocked and started, later
Quest stayed locked, both fixture Auth accounts removed. No existing account was
targeted. Fixtures and dependencies were retired; no credentials retained.

This is live API proof, not browser/server-action E2E or AI-generation proof.
Sequential-reflection Back-state has component coverage; full candidate browser
submission and physical Android regression remain pending. Standard validation
passed: 424 unit/component + 242 integration, coverage, formatting, lint, types
and build. No production promotion or Play submission occurred.

## 2026-10-10 — Final release reconciliation

CI 38058203597 on e6867dcb6b1d4bb3a7f0b35d78f2513d58797a91: validate passed,
staging-e2e skipped. Rechecked uploaded APK/AAB hashes and packaged badging: both
match recorded Android 1.0.2/code 3, package ng.name.pipupath.lite, target SDK 36.
Documented TWA update model: new web interface is not embedded in the wrapper
and remains candidate-only until production promotion. Added exact outstanding
actions in final-release-actions.md; no production merge or Console submission.

## 2026-10-10 — Owner browser completion observed

The owner manually submitted their own proof and reflection on the reviewed
candidate. A fresh visit showed Quest 1 Completed, all five phases complete,
and the reveal displaying +50 XP. Quest 2 was observed In action and retained
that state after reload. The agent did not submit learning content or start
Quest 2. No private proof/reflection narrative is retained in this record.
Browser Back-state preservation was not independently exercised during this
completion; existing component coverage remains its evidence. Exactly-once XP
and negative cases remain supported by the separate disposable learner API run.
This closes the observed happy-path browser completion gate, not Android,
provider controls, child authorisation, production promotion or Play submission.

## 2026-10-10 — Provider and youth release audit

Read-only provider queries verified healthy shared Supabase project and no drains
reported by the project-scoped Vercel API. Actual backup/PITR windows, Vercel
plan/add-on and OpenAI organisation/project controls remain unexposed by available
connectors. Live identity/interpretation functions verify learner AI consent but
not guardian authority. Current OpenAI under-18 guidance additionally requires
verified Zero Data Retention before processing relevant child personal data;
store:false alone is insufficient. Six provider paths share the Responses adapter.
See provider-and-youth-release-audit.md for exact settings evidence and the
unimplemented guardian acceptance contract. No live setting, role, user data,
release flag or deployment changed. Public/youth release remains pending.

## 2026-10-10 — Scheduled backup screenshot evidence

Owner screenshot confirms the exact Supabase project is on Free and the scheduled
backup page states project backups are not included. No restore points shown;
PITR tab and external exports unverified. No plan upgrade or backup generated.
See provider-and-youth-release-audit.md.

## 2026-10-10 — Youth-and-adult release scope confirmed

Owner chose to keep youth and adults and instructed completion/release. Supabase
Free remains; paid backups are optional recovery work, not a publishing blocker.
CI run 38060531896 passed on 0eec2c8f8c663b3bc39ef34535bd2e5540a76285.
Remaining guardian functionality/provider settings are not verified complete.
Console access remains automatically rejected; no bypass, submission or public
release is claimed.

## 2026-10-15 — Plain-language guidance candidate

Owner clarified that PipuPath serves the general public, not only students.
Added shared audience-aware conversational prompt instructions across six
capabilities and retained Gemini providers. Versioned new generation requests.
Replaced repeated planning-only Quest fallback with milestone-named research,
practice and making templates; kept minors out of external AI and preserved all
consent/evidence/XP rules. Simplified key Guide fallback instructions. Separated
legacy Quest questions from fixed reflection field hints to avoid mismatches.

Validation passed: npm run validate (428 unit/component tests, 250 integration
tests, coverage thresholds, formatting, zero-warning lint, TypeScript and the
production build). No live AI samples, user comprehension result, database mutation,
production deployment or Play update is claimed. See
`docs/product/plain-language-guidance.md` for evaluation and limitations.

## 2026-10-16 — Parent-on-device declaration and repeated loading checks

Implemented a parent declaration on the young person's own device, with explicit
unchecked approval, named parent/relationship and persisted policy/date/scope in
the existing consent ledger. Distinct parent_declared status unlocks private
learning only; withdrawal is available from Account and privacy. Independently
signed-in guardian/networking authority and minor external-AI restrictions stay
separate. Added request-scoped identity/guardian/home memoization and reuse;
OpenAI retries share one 45-second budget. Added action, real React request-cache
and embedded PostgreSQL boundary tests. See parent-approval-and-loading.md.
PipuPath database access is unavailable in the current connector; no live
migration, deployment or production latency claim is made.

## 2026-10-18 — Play signing trust repair

Owner supplied three Play app-signing SHA-256 fingerprints after reporting a
Chrome Custom Tab toolbar in the installed Play Store app. Added all three to
the existing production package entry in public/.well-known/assetlinks.json,
retaining the direct-download signing certificate and development entry. No
Android binary, package identity or signing key changes. Google previously read
the www endpoint with only the direct-download certificate; the apex endpoint
redirects and is not used by the current Android host configuration. Production
verification must check the new associations through Google Digital Asset Links
and a fresh launch of the Play-installed app. Android may cache verification.

## 27 October 2026 — The Unbuilt City first episode candidate

User authorised a real game using the current PipuPath template. Added a Build
entry and authenticated `/build/play` episode using existing AppShell and UI
primitives. Pure simulation rules and separate React presentation provide a
seven-part curiosity-to-reflection flow, clear/rain attempts, three orientation
roles, resource feedback and an optional downloadable experiment. No backend,
XP, learner profile, evidence or safeguarding change. No automatic persistence
or real-world completion is claimed. See product/unbuilt-city-first-episode.md.
Validation and release evidence follow below.

Validation: formatting, zero-warning lint, TypeScript, 446 unit/component tests
with coverage and 251 integration tests passed. The initial build encountered
an executor-only external node_modules symlink; a local dependency tree resolved
it and the unmodified Next.js production build passed. Managed browser preview
could not start because its launcher passes Vite-only `--host`/`--strictPort`
flags to Next.js. No application workaround was added. Temporary QA route was
removed; visual/mobile browser verification remains incomplete. Production is
unchanged. The React checklist found no new server fetch, SDK, animation or
cross-user state; stage transitions focus headings and controls are labelled.

Final `npm run validate` passed in full after the dependency-path repair:
format, lint, types, 446 unit/component tests with coverage, 251 integration tests
and production build. Commit is retained locally. Automatic approval review
rejected pushing new feature source to the public GitHub repository because
explicit authorisation for that publication was not established. No push, PR,
Vercel Preview or production deployment is claimed.

## 27 October — visual city and connected Quest slice

Authority: user requested more graphics, less writing and one PipuPath journey.
Added a generated dusk environment, live illustrated build sites, consistent
resource/action icons, short character voices, visual meters/targets, rain and
crowd feedback. Removed the old diagram and duplicate text-heavy build cards.
All primary controls remain semantic buttons with costs/effects in their labels.
Motion respects reduced-motion; background is a 284 KB WebP, no video/3D engine.

Shared JourneyPlayCard reads current Quest state on Home, Build, Journey and
Quest. Owned Quest context is resolved on the server and carried into the game;
its final CTA returns to the real Quest, never to an invented completion. Evidence
and completed states prioritise real reflection/progression over practice.
Regression tests cover malformed/foreign/locked context, exact destination
continuity, changed-plan feedback, complete flow and the exact auth-return path.
No schema, learner writes, XP rule or evidence contract changed. Game state is
still tab-local; no cloud save, multiple episode catalogue or broad potential
assessment is claimed. Full validation and browser evidence follow.

Validation: npm run validate passed: formatting, zero-warning lint, strict types,
452 unit/component tests with coverage, 251 integration tests and the production
build. Focused city/redirect tests passed (20). Exact new-preview browser proof
is pending; the previous plain episode's browser success does not certify the
new visuals. No production promotion or phone-device pass is claimed.

## 27 October — contrast repair and adaptive world decisions

User reported matching text/background colours and repetitive worlds. Root cause:
unlayered global `.bg-white`, anchor inheritance and button theme rules can override
Tailwind game surfaces and intended CTA colours. Added scoped adventure light/dark
rules with explicit foreground/background pairs; protected photograph labels with
dark plates and fixed field/placeholder/primary/secondary states. No global theme
was changed. Shared JourneyPlayCard now advertises all six worlds.

Added five curated first-scene twists using the existing runner, not five copies
of the UI. A successful plan unlocks a disruption. Choices remain present; the
player adapts to new requirements or blocked options. Blocked selected options
can be removed but not re-added and contribute no fictional benefit. Result
feedback compares the latest test with the previous test in the same conditions.
Resources have plain-language errors. Progressbar accessible values are bounded.
No timer, lost lives, AI inference, XP or real completion was added. Practice stays
tab-local. These are richer variations of the planning mechanic, not five new
genres or validated retention improvements.

Focused tests passed: 26, including every possible selection for each disruption,
changed-solution requirements and the garden flow through initial success,
disruption, revision and later scenes. Full validation and exact-preview visual
proof follow; no live release is implied.

Full npm run validate passed: format, zero-warning lint, TypeScript, 470
unit/component tests with coverage, 251 integration tests and production build.
No browser contrast or new-twist walkthrough pass is implied by automated tests.

Exact-preview screenshot caught a second AppShell rule (`.pp-app-experience main`)
forcing dark headings/numbers even after action labels were fixed. Added the
more-specific dark-game main scope and summary foreground. Readable label/CTA
pairs and the complete garden disruption/revision path were observed; full-screen
contrast verification is repeated after this cascade correction.

## 27 October — connected neighbourhood story slice

Authority: user approved the proposed life-simulation-inspired direction. Added
one original neighbourhood with tap/keyboard character movement, recurring
fictional neighbours, three linked interaction types, visible creations and
references to the earlier invitation motif. The opening sign, assembly and route
puzzles introduce the new controls; entertainment/retention is not measured.

Implemented a versioned, bounded, opt-in browser save scoped to authenticated user
ID. Parse rejects malformed/oversized/invalid/inconsistent records. Saves contain
only fictional enum/coordinate/tile/route state. Opt-out removes the save; unavailable
storage never blocks play. No user profile/evidence/reflection/Quest narrative is
stored. No cloud save, backend migration, multiplayer, XP or capability write.
Actual Quest continuation is obtained server-side through the existing identity
and progress DAL. An exact auth-return entry supports the protected new route.

Focused city tests passed (32): full linked story, sequential gates, route blocking,
assembly, corruption recovery, opt-in save/resume/opt-out, keyboard movement and
storage failure. Types passed. Full validation and exact-preview checks follow.

Full npm run validate passed: formatting, zero-warning lint, strict types, 476
unit/component tests with coverage, 251 integration tests and production build.
No physical-device, retention or real-life transfer result is claimed.

Exact initial-preview walkthrough completed Ada's art invitation, Timi's assembly,
and Mama Jo's five-move supply route. Earlier choices appeared in later dialogue;
all three encounters resolved without any real Quest action. Opt-in device save
reported success. Screenshot inspection found player/location-label overlap;
spawn/arrival points now stand beside labels and neighbours have visible character
markers. Full validation passed again (476 + 251 tests and production build).
Save restoration and corrected-layout verification follow on the final preview.

## 27 October — game discoverability and direct manipulation

User requested visible game access, movement and building by moving objects.
Added authenticated Games shortcuts and a complete directory across Build routes.
The hub's first action enters the neighbourhood. Extracted reusable pointer-based
stall workbench with touch capture, drag ghost, snap placement, swaps, outside-drop
recovery and keyboard/tap parity. Added hold-to-walk controls, walking/arrival and
placement motion, and an animated vehicle along the chosen delivery route.
Reduced-motion alternatives preserve controls and route outcomes. No XP, evidence,
profile, database or save-schema changes. Other worlds retain planning mechanics.
Validation and deployed-browser results follow; no production release claimed.

Full npm run validate passed: 478 unit/component tests, 251 integration tests,
formatting, zero-warning lint, types and production build. Pointer tests cover
material placement, swaps and outside drops; hold-control tests cover repeated
movement, cancellation and timer cleanup. Existing linked-story/save tests pass.
Deployed browser/touch/Android verification remains distinct from these checks.

Authenticated preview fa706041: all seven game destinations and Games shortcut
were present. Holding Walk right for 640ms moved the visible player from x42 to
x60; releasing stopped the control. Native pointer drag placed a roof into cell
1; dragging that placed roof to cell 2 moved it and emptied cell 1. No learner
records were changed. Browser review caught low-contrast header shortcut text;
explicit foreground fixes it. Drag threshold now measures from the gesture origin,
so slow movements accumulate correctly. Final full validation and exact-preview
review apply to these corrections; physical touch/Android proof remains pending.

## 27 October — current game selection

The neighbourhood link was permanently styled as selected. Replaced static styling
with a small pathname-aware link boundary. Exactly the current game receives the
gold marker, filled background and aria-current; /build/play does not also match
its chapter routes. The server still owns catalogue composition. Regression walks
all seven routes and returns to the hub without a false game selection.

Full npm run validate passed: 479 unit/component and 251 integration tests,
formatting, zero-warning lint, types and production build. Deployed route-switch
proof follows separately. No production release or new level is implied.

## 27 October — meaningful build systems across seven worlds

User rejected static, basic neighbourhood puzzles despite improved path navigation.
Added a shared pure simulation engine with distinct world briefs and rules for
community backup services, flood-ready city infrastructure, irrigated food systems,
riverbank treatment/wetlands, powered learning campuses, circular manufacturing
and refrigerated food distribution. Replaced default world-route content with a
live editable construction scene; preserved earlier runners/saves as Story practice.
The existing 19-node path now projects only evaluated new-build proofs; legacy
story progress is preserved separately and never relabelled as new completion.

Supports construction, moving/swapping, refunds, camera pan/zoom, keyboard/tap
alternatives, normal-operation tests followed by disruption/repair, capacity,
network reach, energy, ecology and waste diagnostics. Motion represents connected
service traffic and declared weather. This remains simplified 2D simulation; no
claim of 3D realism, proven difficulty, retention or learning transfer.

Added bounded opt-in user/world-scoped device saves with re-evaluated blueprint
proofs; no schema, dependency, Quest/evidence/XP change. See product/world-build-
simulations.md. Full validation and deployed browser evidence follow separately.

Full npm run validate passed: 520 unit/component tests, 251 integration tests,
formatting, zero-warning lint, strict types and production build. Reviewed fixture
blueprints pass every mission under normal and disrupted conditions; alternate
solutions pass. Negative cases cover lost access/power, incorrect river placement,
unprocessed waste, drought/heat/flood consequences, reserved terrain and forged
save proofs. UI coverage verifies two-stage completion, pause, save/resume,
keyboard placement, diagnostics and path projection. Exact browser/mobile proof
is reported independently; no engagement or real-world outcome is inferred.

Browser review confirmed failed-plan diagnostics and manual construction of a
connected access network. Review identified an asynchronous save opt-out race:
a pending result could use the earlier save preference. The result now reads the
current explicit preference; a regression opts out during the pending simulation
and verifies that the removed save is not recreated.

Deployed initial candidate walkthrough: built a district through UI placement,
passed normal capacity/power/three-zone access, observed the flood disable two
shelters and access, then placed two barriers to restore the same system. Visual
review found three SVG face coordinates using scene origin instead of module
origin; corrected them so facilities remain within their own construction tiles.
Final checks and corrected-preview review follow. No real Quest action was taken.

Corrected-preview inspection confirmed building faces are local to their tiles,
but found one remaining solar-panel path closing to the scene origin. Corrected
that coordinate too, and gave grid coordinates dark plates for readability over
light roads. Browser geometry bounds and final visual proof must be checked after
this correction; earlier gameplay proof remains separate from final art proof.

## 28 October — Power District 3D integration candidate

Implemented user-requested tap-once travel, obstacle-aware routes, station arrival
interactions, Stop/re-target, and shared manual collision. Solid scene geometry
and newly installed equipment determine clearance. Added authenticated
`/build/power-district` with Hub/navigation entry and same-origin game frame.
Real Quest links use existing server state; embedded reflection is in-session
only. No practice XP/evidence writes, migrations, production promotion or changes
to the existing seven-world simulations. See product/power-district-3d.md.
Validation and exact-preview browser results will be recorded separately.

Local validation: format check, zero-warning ESLint, strict TypeScript, 523
unit/component tests with coverage and 251 integration tests passed. The build
step initially rejected a workspace dependency symlink; replaced that local-only
symlink with a real dependency directory and reran `npm run build` successfully.
Navigation/model checks passed, including every energy configuration and both
reduced-service plans. Browser software-3D review verified a single station tap
starts travel, Ama and Bisi dialogue opens on arrival, and Stop cancels travel.
GPU/mobile and authenticated deployed app checks remain separate.

## 28 October — Replace the Unbuilt City entry and campaign

Owner authorised GitHub source upload and Vercel preview deployment, then clarified
this is a replacement game rather than a parallel app feature. Replaced the
canonical city runner and published mission map, retired earlier challenge entry
routes through authenticated recovery, preserved owned Quest validation and the
real developmental return link. Kept a prototype URL alias. The only playable
new mission is Power District; food and learning are explicitly planned.
Fixed same-origin frame restrictions narrowly for the canonical game document.
No database migration, save conversion, verified reward write or production push.

Replacement validation: canonical `npm run validate` passed formatting,
zero-warning lint, strict types, pure energy/navigation checks, 527 unit/component
tests with coverage, 251 integration tests and the production Next.js build.
New regressions cover canonical city replacement, planned/unplayable mission
briefs, retired-route recovery, owned Quest context and scoped framing policy.
The existing preview browser has an authenticated session for exact-deployment
checks; preview publication and browser results are recorded separately.

Exact-preview browser found inherited document CSP after client-side Hub → Play
navigation. A route-only frame-src exception cannot update an already loaded
parent document. Corrected the app's frame-src to permit self across navigation;
frame-ancestors none and X-Frame-Options DENY still protect every application page
except the explicitly bundled game document, which permits same-origin only.
No external frame host is added. Updated the policy regression accordingly.

Final authenticated-preview traversal confirmed campaign replacement, standard
client-side entry, a working same-origin game frame, one-click station travel and
arrival evidence, plus focus-view expansion. Corrected an observed dark-route
anchor rule that made the light frame's real-Quest return link low contrast; the
campaign CTA now uses the established readable action scope. These are shared
surface fixes, not changes to Quest state or game rules. Physical phones and
GPU rendering remain separate verification work; browser review used software 3D.

## 28 October — One connected city and unified game identity

Replaced the playable standalone workshop challenge with one city document at the
existing /build/play entry. Power, market, collection/cooling and learning club
share a clock, plan and city fund. Tested operating days commit evaluated results
once; the disruption affects the existing city. Added financial timing, power
interdependence, learning diagnostics, alternate agreements and handover. No game
writes real XP, Quest proof or cloud state. Extracted renderer/navigation/theme
and vendor assets into games/shared; preserved the old energy/navigation tests.
Removed the alternative P logo and PipuPath brand from game documents. App and
game controls share the established navy/blue/gold family. See the connected-world
product contract for limitations, ownership and scale. Browser and release proof
follow validation separately.

Connected-city local validation passed: formatting, zero-warning lint, strict
TypeScript, 527 unit/component tests, 251 integration tests, the production build
and the new shared-city model checks alongside the existing energy/navigation
checks. A later small intro-visibility correction passed syntax and targeted lint.
Browser review confirmed the sole city wordmark and navy/gold interface, travel
between the power station, market and school in the same scene, shared asset
spending, collection configuration and the learning activity. Operating-day and
exact-preview verification remain separate below/at handoff.

## 28 October 2026 — Mobile resident animation crash isolated locally

On `investigate/android-city-stability`, based on PR #100 head
`75e5a5863b155af2a3a0db6762e15ba4c0680bc2`, reproduced a deterministic
TypeError without WebGL: low-power scenes allocate one pedestrian per district,
while thriving domain activity requests two. The animation indexed the missing
second actor and read its position. An all-first-option path fails at decision 3
(`repair-training`); timing depends on choices. The outer frame handler catches
this before `renderer.render`, causing the graphics interruption banner. Recovery
re-synchronises the same state and cannot repair the missing visual actor.

Animation now bounds iteration by both domain residents and allocated actors.
No extra mobile actors, domain changes, save changes or quality reduction.
The former 36-decision mixed-path test passes before the fix, while the new
regression fails with the reproduced TypeError before the fix and passes after.
Coverage includes all 243 opening five-decision paths in each graphics mode,
reduced motion, all three uniform 36-decision paths per mode and revisions.
`npm run test:power-district` passes after the fix.

This proves a mobile-specific logic defect and its correction, not the absence
of separate GPU/context or memory faults. Physical Android, real WebGL endurance
and exact-preview acceptance remain pending. No push, PR creation, Vercel build,
deployment, production change or live student-data operation was performed.
Repository Vercel config disables selected named branches only; this local branch
is not covered. Do not push it assuming automatic previews are disabled.

### Next acceptance gate — QA facilitator owned

After local validation and one deliberately authorised preview, a QA facilitator
should test the previously failing Android phone and a second ordinary Android
phone. Record candidate commit, browser/version, device model, selected choices,
first failure/error if any and whether the canvas continues drawing. Complete
all 36 decisions, inspect the full city, revise early choices, rotate the phone,
background/restore the page, and verify opt-in save/reload separately. Capture
console/render errors where available. Do not call a fast model sequence a GPU
endurance test. Escalate any recurrence with the exact choice path; the founder
should not have to diagnose or approve each test run. No claim of 100x capacity
or physical-device reliability follows from these local regressions.

Local validation completed: `npm run validate` passed (formatting, lint, types,
city regressions, 527 unit/component tests with coverage, 251 integration tests,
and local production build). Build emitted two `authenticated_progress_load_failed`
diagnostics while prerendering without live authentication; it exited successfully.
No authenticated live-flow verification is inferred from the build.

## 28 October 2026 — Street layout, answer-built infrastructure and continuous journeys

Branch `feat/city-streets-and-construction` follows the owner-reported successful
Android stability test of PR #101. User then reported teleporting between cases,
poor city arrangement, generic decision props, traffic clipping, trees on roads
and a blurry aerial view.

A shared layout reserves streets; ten outer districts now have separate blocks
with two empty development plots rather than completed buildings before choices.
Scenery excludes street reservations. Deliveries use that street graph, separate
lanes and continuous end turns. Vehicles yield with swept clearance checks around
characters; guided walking can detour around a waiting vehicle. Long guided trips
walk continuously instead of timed teleportation. Exceptional invalid-position
recovery remains separate from normal travel.

All 108 authored answers map to explicit physical consequences in
`infrastructure.mjs`: e.g. housing plans build homes/drainage, rushed housing shows
unfinished structures/water, safe crossings build crossings/lighting, and burning
waste shows a burn site. Non-construction decisions install relevant equipment,
desks or information boards rather than inventing unrelated buildings. Components
assemble in height order; revision changes the same plot. Choice IDs and saves
remain authoritative and backward-compatible. Foundation projects remain compact
within existing premises; outer projects use larger reserved footprints.

City inspection uses an angled orthographic camera, district focus, functional
pinch/button/wheel zoom, no overview fog and restores the play camera afterward.
Rendering stays capped at one device pixel per CSS pixel during overview rather
than escalating to high-DPI buffers. Flat boxes no longer carry unnecessary
subdivision. Software rendering now includes horizontal streets that its old
wide-mesh filter incorrectly skipped. Lighting exposure is reduced for contrast.

New geometry tests cover all 108 project footprints and street clearance, layout
reservations, overview framing and a real simulated vehicle stop/resume. A JSDOM
harness loads actual game setup and checks 108 full guided journeys, static tree/
house street clearance, zoom and camera restoration. Canvas is stubbed in that
harness: it is navigation/integration proof, not rendered WebGL or Android proof.
Existing mobile resident regressions remain in place.

The next acceptance gate is the same Android phone: walk across districts,
inspect the whole and focused city, watch live builds and revisions, cross a
traffic route, finish all 36 choices and open Chapter 3 enterprise operations.
Chapter 3 already exists; this change does not claim Chapter 4 or a new economic
simulation. No production merge or learner-data change is authorised here.

Layout audit also moved the pre-existing market off the main road and relocated
power decision equipment away from the traffic corridor. The runtime test now
checks every static collision rectangle against streets, not just tree/house
labels. Project geometry tests update world transforms before measuring bounds.

Validation: final `npm run validate` passed formatting, lint, types, all city
checks (including actual-runtime navigation and all-option plot checks), 527
unit/component tests with coverage, 251 integration tests and local production
build. The runtime harness deliberately falls back to a stub canvas and logs
WebGL creation failure; it does not establish WebGL rendering performance.
Build logged two unauthenticated progress-load diagnostics and exited 0.
Courtyard planting, ambient people and enterprise stalls now use separate
pedestrian/service anchors rather than the former road-crossing offsets.
A single controlled preview is the next verification step; production is unchanged.

## 28 October 2026 — Close-view software road correction

Visual verification on preview `a62b3d1` exercised software rendering because
cloud Chrome has WebGL disabled. Whole-city orthographic view, first answer's
physical assembly and journey arrival worked. Close perspective revealed long
road triangles disappearing at the camera clipping boundary after flattening
box geometry. The software renderer discards a triangle when a vertex is beyond
the clip plane; ordinary WebGL clipping does not have this limitation.

Only software-mode surfaces longer than 40 world units now receive four-unit
segments; buildings and WebGL boxes keep simple geometry. The fallback continues
to skip broad ground slabs while retaining long narrow roads. A real software
raster test samples a known road pixel: it fails with the unsegmented road
(233,226,210 background) and passes with segmented geometry. This is pixel
raster proof, independent of the stubbed navigation harness. A second controlled
preview build is necessary to include this correction; no production change.

Correction validation: `npm run validate` passed again, including the new real
software raster pixel regression, 527 unit/component tests, 251 integration
tests and local production build.

## 28 October 2026 — Relevant construction and honest no-build consequences

Owner rejected the prior iteration's generic miniatures and automatic construction
for poor answers. Branch `feat/meaningful-city-infrastructure` changes the
construction contract: 108 explicit stable choice-ID mappings now distinguish
working, limited, failed and no-construction outcomes. Thirty promises, ignored
needs, cancellations and other non-building choices add no asset at all. An
advert may appear without counting as a clinic; hazardous piles or burn sites
are physical consequences, not useful infrastructure.

Recognisable, plot-sized health centres, pharmacies, public technology hubs,
offline service centres, waterworks, housing courts, industrial machinery bays,
training workshops, civic halls and arts facilities replace generic tiny houses
and props. Foundation tools now use equipment scale in their existing premises.
Good and poor technology choices visibly differ: a usable hub versus unfinished
steel framing or a registration gate. Models use shared low-poly geometry and
no downloaded assets or new texture maps. Local actual-software-raster review
verified health/technology/water/manufacturing/housing and no-build examples.

A safe crossing is now built on its designated road in the transport district;
it is a walkable surface rather than a miniature road placed in a courtyard.
Normal project collision reservations and street clearance remain in force.

Answered-decision progression and existing saves remain unchanged. City summaries
now distinguish physical infrastructure, working solutions and unresolved needs.
Service capacity is reduced by limited plans; districts with no productive
solution have zero service, attract no new ambient residents or deliveries and
have no automatic enterprise production capacity. Revising removes the old
consequence from the same plot and updates the same city, rather than rewarding
every answer with another completed building. This is fictional simulation,
not verified learning, health outcomes, money or XP.

New policy checks cover all 108 mappings, thirty empty outcomes, intended sector
assets, zero usefulness for promises and negative revision effects. Existing
scene/geometry tests now assert the requested absence of construction as well
as its presence. The real software-road pixel check and 108 actual-runtime
journeys remain acceptance tests. Physical Android and actual GPU performance
must be checked separately; no production release is implied.

Validation: final `npm run validate` passed formatting, lint, types, all city
checks including semantic/no-build contracts, 108 navigation journeys and the
actual software-road pixel regression, 527 unit/component tests with coverage,
251 integration tests and production build. The build emitted two unauthenticated
progress-load diagnostics and exited successfully. No physical Android or GPU
performance claim is inferred. One preview build is planned for visual review.

## 29 October 2026 — Repair decision-16 Chapter 2 handoff

User reported that questions stopped after the 16 foundation decisions. The
actual Chapter 2 reveal referenced `summary.working` and `summary.unresolved`,
but only `city` existed in that function. Rendering threw `summary is not
defined` after setting the chapter cursor and before creating its start button
or auto-advance timer. The earlier summary UI update introduced the error.

Use `city.workingSolutions`, `city.unresolvedNeeds` and the actual infrastructure
count in the reveal. Its wording no longer claims new residents are arriving
regardless of the player's choices. Same-device saves and chapter prerequisites
are unchanged.

The real-runtime regression reproduced the precise decision-16 exception before
the fix. It now executes answer clicks, construction callbacks, outcome timers,
chapter start controls and travel through two full 36-answer playthroughs, using
both manual and automatic starts. It also pauses/resumes the chapter and checks
background-tab recovery. Unlike the old route tests, this exercises the actual
handoff UI and callbacks instead of jumping straight to each case.

ESLint now keeps `no-undef` enabled for the standalone JavaScript city runner,
with its explicit browser globals. This catches an undefined summary variable
before a rarely visited screen reaches students. The framework TypeScript rules
remain unchanged. Runtime canvas is stubbed; physical Android/GPU checks remain
separate. Preview only, no production merge or learner-record mutation.

Validation: `npm run validate` passed all gates, 527 unit/component tests,
251 integration tests, the full city suite and local production build. The
new static check also rejects the previous runner with two `summary is not
defined` errors. Pre-fix runtime proof fails at decision 16; post-fix manual,
automatic and background-resume handoffs continue through all 36 answers.

## 29 October 2026 — Better lives city inspection

- Added a pure, reusable human-purpose projection for all fourteen districts,
  derived from existing allowlisted choice IDs and construction statuses.
- My City exposes exact authored results and trade-offs in expandable sections,
  distinguishes working plans from unmet needs, and links directly into the
  existing revision controller without losing the original journey.
- Updated entry and inspection copy around building a city that improves life.
  No extra scene objects, animation loops, saved fields, account records or XP.
- Added all-108-choice projection checks, revision checks and actual DOM/runtime
  coverage for inspection, revision entry and returning without changes.
- Full `npm run validate` passed: formatting, lint, types, city suite,
  527 unit/component tests, 251 integration tests and local production build.
  Known unauthenticated build diagnostics remain; build exited successfully.
- Scope: fictional game outcomes, not measured wellbeing or a new resident
  simulation. Preview-only delivery; production remains separate.

## 29 October 2026 — Clearer city view and Chapter 4 handoff

- Replaced the navigation strip with a native City menu disclosure; selecting
  an option closes it, opening pauses the journey, Escape restores focus.
- Construction response occupies the question's existing bottom corner with
  identical responsive width/position limits, rather than a second central card.
- Added the seven-day Chapter 3 completion CTA and gated permanent Chapter 4
  entry. Three resilience rounds allocate actual finite supplies across care,
  food and repairs with maintenance effects on later disruptions.
- Deterministic seed/choice replay preserves results; backward-compatible
  opt-in device saves store no personal text. Isolated Chapter 4 restart keeps
  the city/Chapter 3; restarting Chapter 3 clears its dependent attempt.
- Shared renderer consumes calculated Chapter 4 shipments/request signals;
  no extra scene assets or animation pools. No real health/learning/XP claims.
- Targeted checks passed: 27 policy sequences, resource conservation, actual
  seven-day UI handoff, three-round UI flow, reopening, city inspection and reset.
  Full `npm run validate` passed formatting, lint, types, all city checks,
  527 unit/component tests, 251 integration tests and local production build.
  Known unauthenticated build diagnostics emitted; exit status was successful.

### Browser proof and viewport correction

The actual browser completed 36 choices, all seven Chapter 3 days and the
Chapter 4 handoff; it saved/reloaded after one challenge and completed all three.
DOM measurements confirmed question/feedback width and right/bottom coordinates
match. Dropdown, pause and Escape dismissal worked. Visual review then found
focus could scroll the hidden-overflow game container: projected labels extended
its scroll area far below the viewport. Clip the world and label layer so only
the bounded panels scroll. This requires one corrective preview build after the
initial preview; production remains untouched. Full checks rerun for the CSS fix.

## 2026-10-29 — Game to real-world release review

Owner authorises full journey review and production release after verification.
Use latest compact-controls source c75b576, preserving newer preview fixes rather
than replacing them with the older local integration draft. Correct public play
handoff, district-preserving sign-in, shared Real Quests navigation and account-
authoritative next steps including identity, Discovery review and active Projects.
Fourteen safe inspirations remain separate from generated Quests and earned XP.
Use a native save modal, correct failed-save reporting and private session cache
headers. No schema/RLS changes, real learner mutations or fabricated evidence.
See `docs/product/game-to-real-world-release.md`. Release validation and live
browser acceptance are pending; no production success is asserted here.

Pre-release dependency audit found six affected production packages, including
critical Next.js exposure. The release candidate updates and pins the patched
framework, validator and affected transitive dependencies in the lockfile;
full validation and dependency audit must pass on that exact set. Installed
web-app entry now respects public free play and signed-in Play-first Home.

The patched production dependency audit (`npm audit --omit=dev`) reports zero
known vulnerabilities. New framework lint rules retain explicit, documented
exceptions for native APK downloads; switching those actions to App Router
navigation would change download behaviour.

Compatible development-tool patches, including Vitest and coverage 4.1.12,
are also locked. The complete `npm audit` now reports zero known vulnerabilities
across production and development dependencies.

Final local validation passed: formatting, lint, types, city runtime/endurance,
541 unit/component tests, 251 integration tests and the production build on
Next.js 16.4.3. Complete dependency audit: zero known vulnerabilities. Live
learner browser acceptance remains pending; this is not yet a production release.

## 29 October 2026 — Live-city opening invitation

Owner authorised an exciting, minimal-word landing screen as the first website
and installed-app entry, with free play and returning-player continuation.
Root now mounts the actual existing city frame, rather than a separate marketing
page. The city intro shows the living scene, The Unbuilt City, one short promise,
Play free and Continue my journey, plus small sign-in/policy links. A validated
existing device save changes Play free to Continue my city. No demonstration
buildings, invented saves, XP or account writes are introduced.

Play enters the same mounted scene; a same-origin, same-frame entered signal
reveals the existing Quest handoff and focus controls. Signed-in root visits
remain on this invitation; login returns, protected routes and actual next-step
resolution remain unchanged. Reduced-motion, graphics budgets, saving and
recovery retain the current game implementation. Source is based on production
merge e1f1050. Full validation and live visual verification follow.

Validation: format, lint, types, city runtime/endurance and the local production
build passed. CI passed 542 unit/component tests with coverage and found one
obsolete integration assertion requiring the old signed-in root redirect;
updated it to preserve the new universal welcome while retaining /continue for
sign-in. The focused 15-test launch contract passes. Browser preview verified
the live-city backdrop and same-frame Play transition; old game header labels
showed through the intro and are now hidden only while that intro is visible.
A single successful preview build was used; one earlier request was skipped by
the configured ignore rule before compilation. Final CI and production checks
remain required. Physical Android/GPU reliability is not claimed.

## 29 October 2026 — Existing Android launch compatibility

Installed Android packages still start at `/continue`, a protected legacy resume
route, so signed-out users reached sign-in despite the new public root welcome.
Redirect that exact legacy entry to `/` before authentication, with no-store and
query removal. The route fallback also redirects to root. Real Quests and all
private work retain their authentication and ownership boundaries. Future TWA
manifests and the generated manifest use `/`. Existing signed APK/AAB downloads
are unchanged; the server redirect supports them without reinstalling. Unit
checks cover both session states and untrusted query removal. Full validation
and production verification are pending.

Clean full validation passed: formatting, lint, types, city runtime checks,
544 unit/component tests, 251 integration tests and production build. An initial
build used stale generated chunks after switching branches; rebuilding from a
fresh build directory passed. No extra Vercel preview build is needed for this
public-launch compatibility correction. Production confirmation follows release.

## 29 October 2026 — Clear real-world flow and AI validation repair

Owner authorises simplifying the non-game journey and fixing repetitive AI
results. Based on current main 5a30b11, preserving the released city consequences
and installed-app welcome. Production logs confirm invalid-profile fallback
and youth external-AI-disabled fallback. Fix narrow false-positive safety
checks, align profile generation with saved text/provenance limits, and log
only validation paths/codes. Keep existing external-processing boundaries.
Guided youth profiles explain their actual mode and offer no futile AI retry.

Internal onboarding/guardian completion now reaches Real Quests rather than
legacy /continue, which remains the public installed-app entry. Real Quests
leads with actual next work; inspiration, explanations and Project help are
secondary. You groups optional support tools; onboarding removes repeated
explanations, and direction/plan copy becomes simpler. Required saved answers,
actual Quest proof/reflection and all ownership/lifecycle gates remain. No new
schema, AI recipient, data rewrites or fake progress. See
product/real-world-guided-flow.md. Focused regression checks passed; full
validation and live authenticated acceptance follow.

## 29 October 2026 — Real Quest AI recovery and consistent light journey

Owner's live test still showed an adult guided fallback. Production logs on
963bfbe confirm provider output reached validation and was rejected with no rule
diagnostic. Exact previous rule is unproved. Enforce all six profile sections in
the provider schema, with exact counts and evidence IDs, translate into the
unchanged saved contract, and attach safe rule IDs to every business rejection.
A rejected adult profile/goal/plan/Quest gets one correction inside the same
45-second provider budget. Adult provider/validation failure now returns an
explicit error without silently replacing saved work with a template. Missing
configuration consumes no generation attempt. Under-18 guided generation remains
local and validated. Existing consent, attempts, ownership and proof gates remain.

Apply the reference blue/violet-and-white canvas to deep onboarding/profile and
authentication pages; use matching gradient heroes across goal, plan, Quest and
Project screens. Add a shared five-step orientation, explicit Quest generation,
plain evidence CTA, and a concrete real-world-use guide. Publishing remains
optional and private proof is preserved. Replace the cryptic header arrow with
Sign out, expose pending/error state and use current-session sign-out. The game
welcome sign-in link moves to the owning app layer (standalone game keeps its
link), with /real-quests as the explicit post-login target. Plain login also uses
that target for Google, rather than the old /app catalog.

No migration, learner-data rewrite, new provider or dependency. The previous
production sign-in link worked in this cloud browser; the owner-reported phone
failure is addressed by removing the embedded-frame navigation dependency, not
claimed independently reproduced. Synthetic tests do not prove live AI quality;
a fresh authenticated generation and physical Android interaction remain live
acceptance items. Full validation and deployment results belong in the release PR.

## 29 October 2026 — Targeted profile-language recovery

Owner's fresh profile update on production 94a98d1 failed. The new diagnostics
identify prose:fixed_identity_or_shaming, followed by OPENAI_TIMEOUT during the
full-profile correction. Request 88a56792-74f5-4f5d-9246-62171183111c: first result
rejected at 19:26:04 UTC, correction timed out at 19:26:17 UTC. No saved learner
work changed. The exact rejected wording was deliberately not logged.

Inspection and regression tests confirm that ordinary process wording such as
work broken into smaller steps was rejected by the broad broken keyword. Exempt
only the literal process construction; retain rejection of direct shaming and
fixed-identity claims. Validate each field independently, recording only field
paths and rule IDs. This also avoids a caution in one field exempting another.

For a structurally valid profile with rejected wording, request a short patch of
only those existing display fields from the same provider. Keep evidence IDs,
references, confidence and all other fields immutable. Reject extra, missing or
oversized patch fields; validate the complete patched profile before persistence.
Structural failures retain the bounded full retry. Both paths share the existing
45-second budget, with no additional attempt or provider. Report actual timeout
as timeout rather than mislabelling it as a content-check failure. Ask for concise
initial prose to reduce latency and reading burden.

No migration, new dependency, consent/age change or proof/progress write. The
blue-and-white screens and sign-in repairs from PR116 remain. A real signed-in
provider result is still required for live acceptance; mocked transport tests
prove recovery boundaries, not provider availability or live output quality.

## 30 October 2026 — Hands-on Build Lab and single city title

Owner reports students enjoy the city but need challenge beyond choosing answers,
and overlapping city-name labels in some chapters. Add a bounded hands-on prototype
worksite inside the same city game, accessible directly from the welcome and City
menu. Three increasingly demanding networks: route supply around a protected tree,
serve school and clinic within a weighted piece budget, then retain supply after
every single-link failure. Place/rotate straight, bend and junction pieces; remove,
test, inspect actual flow/failure feedback and revise. Multiple designs can work;
there are no answer options or timers. This is a first hands-on layer, not a claim
that all existing chapter questions have been replaced by direct 3D construction.

Pause/cancel travel before the modal opens, retain the existing journey cursor and
show Resume on return. Native buttons support touch and keyboard, with cell and
opening labels, visible connection/fault states, live feedback and dialog recovery.
Do not steal keyboard focus out of the embedded game when the player enters.
Optional device saves retain only allowlisted prototype placements; older saves
restore empty boards. Prototypes never alter city decisions, fictional city fund,
real Quests, evidence or verified XP. No new backend, dependency or learner rewrite.

Keep the compact in-game city title during play. Hide the redundant legacy header,
rename the enclosing app control strip Play & build, and remove the repeated city
name from the chapter-guide eyebrow. Existing sound, pause, menu, overview and
previous-decision controls remain. The welcome retains its main game name.

Validation: model checks cover two different solutions, orientation, protected
cells, shared supply, weighted budget, exhaustive single-link failures and save
round-trip/privacy. DOM tests build a working network through the real controls,
remove a piece and observe failure, switch/restore layouts and close safely. Full
validation, deployed browser review and production state recorded in the release PR.

## 30 October 2026 — Welcome action cleanup

Move Build Lab entry to City menu only at the owner’s request. Remove the
welcome button, its handler and unused layout styles; keep the existing menu
entry and all prototype layouts. Set explicit white surface, dark text and
WebView text-fill colour for both app-owned and standalone welcome sign-in
links. Preserve full-app login routing and keyboard focus visibility.
No data, progress, authentication or game-state contracts change.

## 30 October 2026 — Clean onboarding foundation

Keep onboarding as a compact private setup. Shared onboarding shell uses blue
and white, a single heading and section navigation without invented completion
percentages or checkmarks. Back to play remains visible. Identity setup asks
for name, editable suggested username, age group and explicit privacy choices.
Keep entered details through failed submissions and ask the learner to recheck
consent before retrying; remove the
blocking save overlay and show saving inline. Preserve server validation, guardian
authorization, policy version and current AI eligibility. This is the onboarding
foundation of the Real Quests rebuild, not a claim that its generation and
continuation architecture have been replaced. No schema or learner-data rewrite.

## 30 October 2026 — Simple real-world replacement candidate

Owner explicitly replaces the non-game experience. New Real Quests asks only
catalogue topic and time after current account/private-learning authorization.
No Discovery/profile/Mission/Journey prerequisite for this loop. Existing records
and routes remain reachable under Earlier work on the new You page. City is unchanged.

New server-only AI authoring receives generic catalogue parameters and public
challenge titles; no names, account IDs, private answers, photos or reflections.
Validated templates are reused across accounts, with private independently owned
attempts. A global authoring lease prevents duplicate provider work; per-user
request accounting includes failures and bounds spend. Failed AI does not create
an attempt or a disguised fallback. One current attempt, optimistic version
checks, draft saves, optional private photo/link and honest unsuccessful outcomes.
Recording requires evidence and reflection; no XP or capability is invented.
Try my improvement creates a fresh blank attempt with a link to the prior lesson;
choose another Quest continues without a terminal cycle. Blue/white UI, recovery,
privacy copy, pagination, private photo signing and deletion-worker coverage are
part of the slice. Photos are bounded to 3 MB under the 4 MB action body limit.

Additive migration: 20261030080345_simple_real_world_builds.sql. PostgreSQL tests
verify grants, ownership, active uniqueness, recording constraints, authoring
leases and request limits; application/interaction tests cover retry and saved
state boundaries. Local full validation passed with 611 unit/component tests,
252 integration tests, city runtime checks and production build; CI and final
release evidence belong in the PR.

Production gate: the current Supabase connector denies access to PipuPath project
kvjcswnmhwegpakbtvlh. No migration was applied, no other project's database was
changed, and no frontend deployment was requested for this candidate. Apply and
verify the migration on the actual PipuPath database before releasing the new
routes. Live AI, authenticated evidence writes and physical Android acceptance
are not proved by mocked or embedded tests.

## 30 October 2026 — Smart Quest Discovery and tailored stages

Owner authorises building and releasing the discovery-to-action loop. Reuse PR
131's five-stage guide and evidence-safe explicit tailoring for old starters.
New discovery has four short screens: exact goal and kind, adaptive obstacle and
setting, available resources and first-session time, then an editable review.
Follow-ups are deterministic and cost no AI calls. Only the disclosed goal and
validated catalogue answers enter the bounded provider request; no identity,
evidence or reflections are forwarded. The generated Quest reflects the brief.

Cache keys include all discovery constraints and a new content version. Existing
schema is unchanged: private goal stays in its owner attempt, discovery options
shape the generated guide and are not written as new attempt columns. New AI
failures and exhausted allowance preserve answers and return an error, without
automatically creating an unrelated generic starter. Existing reviewed work and
evidence remain intact. Exact structured text bounds reduce avoidable validation
failures; validation and all safety checks still apply. No new database migration,
dependency, learner rewrite or verified achievement. Full validation and release
results follow below; physical Android and fresh signed-in AI acceptance remain
separate from deterministic checks.

## 30 October 2026 — Construction guidance and stage contrast

Owner's live test confirms AI generation works but produces personal coaching
instead of teaching construction of socially useful solutions. Reframe authoring
around an actual tool, working service or reusable process, a real beneficiary,
concrete implementation and a measured test. Each of five stages now requires
2–4 executable numbered actions (up to 700 characters per stage), rendered as
an ordered list. Reject one-line advice-only outputs at the provider boundary.
Legacy saved paragraphs remain readable. Discovery defaults to building a useful
solution; habit problems become solution briefs. New versioned cache keys avoid
reusing the previous coaching-style templates. No existing evidence is replaced.

The global dark-theme bg-white and text-white overrides conflict with the light
Quest guide. Add scoped stage-tab/secondary colours with WebView text-fill and
use the established build-primary class for Next and the result link. Shared
link colour rules therefore no longer turn the result link blue on blue. No
migration or dependency changes. Full validation and live release recorded in PR.

## 30 October 2026 — One clean journey and purple/white reference design

Owner expands the release to remove old-page links, repair the mobile Account
backup panel, and restore the supplied purple/white non-game visual direction.
Keep Play / Real Quests / You as the only primary destinations. Remove the
Previous profile, Previous Quests and old collaboration catalogue links from
current surfaces. Account privacy returns to You. Temporary exact redirects
retire old landing pages, while owned deep evidence/project links and all stored
records remain. Play no longer loads the replaced Mission/Journey context.

Reuse the existing mountain/lighthouse artwork, purple illustrated heroes,
white rounded cards, violet actions and a raised central Quest control. Apply
matching public/auth/setup treatments without adding the old five destinations,
fake XP, completion claims or decorative activity. The game scene is unchanged.
Account backup has explicit WebView-safe button/text colours, stacked actions,
a viewport-contained mobile panel, close/Escape focus recovery and loading only
when opened. No database migration or dependency change. Full checks and release
verification belong in the release PR; no live generation quality is inferred
from synthetic content checks.

## 30 October 2026 — Practical-generation recovery and stronger city audio

Live logs confirm AI returns content but the app rejects it as
BUILD_NOT_PRACTICAL; the previous diagnostic cannot identify which of its three
rules failed. Narrow paperwork detection to actual paper projects and drawings,
not phone gestures or incidental materials, honour explicit cautions, and accept
more real implementation verbs. Preserve dangerous-instruction checks and reject
observation/notes-only Quests. Log the exact safe rule ID. A rejected practicality
or stage-format draft gets one correction inside a shared 45-second deadline and
the same accounted request; revalidate the full result without a fallback.

Replace the quiet single-note city loop with an original 120 BPM layered melody,
bass, chords and light percussion. Raise effect amplitude, bound summed output,
and offer independent music/effect levels (85%/100% defaults) stored on the device.
Keep verified gesture unlock, independent mute and background suspension. Volume
sliders sit inside City menu so the compact mobile HUD gains no extra button.
No audio downloads, additional providers, migrations or dependencies. Physical
speaker loudness and a fresh signed-in generation remain live acceptance items.

## 30 October 2026 — Schema-owned Quest stages and assignment-scoped paper checks

New production traces prove two failed corrections: GUIDE_ACTIONS at 20:22 UTC
and PAPER_ONLY at 20:24 UTC. Replace free-text numbered-line instructions with
an enforced provider JSON schema: exactly five stage arrays, each containing
2–4 bounded action strings. Validate those arrays and format the saved numbered
steps deterministically in the adapter. The saved challenge contract and existing
UI remain compatible; no evidence or stored Quests are rewritten. Formatting
is now app-owned rather than an unreliable prose requirement on the model.

Judge paper-only assignments from the actual title and construction stage, not
an example in discovery, incidental materials or later advice. Recognise explicit
no/instead-of/rather-than cautions without weakening dangerous-instruction checks.
Log safe field locations (title/steps.2), never generated text or learner goals.
One schema/practicality correction still shares the 45-second total deadline.
Regression tests exercise unnumbered arrays, redundant numbering, negative
paper wording, discovery examples, genuine paper assignments, malformed shape,
safety and privacy. No migration, dependency or music change in this release.
Live signed-in AI acceptance remains distinct from deterministic CI checks.

## 30 October 2026 — Complete AI prompts and shared builder slogan

Quest generation now supplies ready-to-use words and actions for carrying out the work: actual interview questions, invitations, participant instructions, feedback/test scripts and concrete setup sequences. It must not delegate missing instructions to the Builder or another AI. Scripts fit existing action bounds and omit private information; follow-up actions explain how to use the answers. The template content version advances so new requests do not reuse older templates missing these instructions; active Quests and evidence remain intact.

The shared brand mark, mobile app header, metadata and Android download copy now use “Build a Better World,” matching the game. The brand subtitle is also visible on the real-Quest mobile header. No database migration or game runtime changes. Validation and production deployment follow the existing CI gate.

## 30 October 2026 — AI-guided continuation of recorded Quests

After recording a real-world attempt, Builders can continue the same solution with AI or start a separate Quest. The continuation form previews the saved written result, reported outcome, lesson and planned change and asks explicitly to use those notes. No photo, evidence link, account identifier or unrelated history is sent. A strict allowlisted brief includes the immediately previous solution and those notes, bounded by the existing field limits. AI treats them as unverified observations, repairs failed/partial attempts before expansion, reuses completed work and supplies concrete next build/test actions. The existing five-stage response schema, validation, safety rules and shared 45-second correction budget apply.

The next guide is saved only in an owner-scoped attempt linked through the existing previous_attempt_id. The template FK remains the original public starting point; personal continuation guides never enter the shared template pool. Evidence starts empty, prior records remain unchanged and previous-attempt navigation preserves the history. The Real Quests home offers the latest recorded solution alongside the new-Quest form. Difficulty and XP are not automatically increased by continuation.

An owner/parent-scoped generation lease, a second successor check after lease acquisition, existing-successor reuse, the existing user AI allowance and one-active-attempt uniqueness protect concurrent requests and avoid repeated AI charges. Failures retain the recorded work and allow retry. Targeted service, action, provider and UI tests cover ownership, explicit note use, exact context/correction, public-pool exclusion, empty evidence, existing work, allowance, lease release, repeated/unsafe output, save/AI failures and active-insert races. Read-only checks against pipupath-staging confirm owner RLS, previous-attempt/template FKs and one-current uniqueness; no database migration is needed. Full npm run validate/CI and one production deployment remain the release gate. Signed-in live AI output still requires acceptance by a real user.

## 30 October 2026 — Chapter 4 visible consequences and chapter ending

Committing a tested response now closes the brief, opens an aerial view of the actual city and focuses the relevant service. A compact outcome card shows the real simulated supplied/requested counts, waiting requests and completed repairs, with four district inspection buttons. Existing computed shipments drive the existing vehicle pool; service lamps remain green/amber according to actual requests. A selected-service pulse uses existing meshes, with a static emphasis for reduced motion. Zero-supply outcomes explain the blockage rather than invent deliveries or success. The test-plan result is scrolled into view before deployment; previews remain non-mutating.

The city response view has an explicit Next disruption action, or Chapter complete / What next after the third response. Returning through either action or the top back button restores Chapter 4. The completed panel explains the four-chapter story boundary and offers a real-world solution link, district suggestion based on the final unmet request, city inspection and replay with existing foundations. The top-level Real Quests link works both standalone and embedded; it does not award real evidence/XP or imply a fifth chapter exists. Saved format, city choices, supply simulation and opt-in saves are unchanged.

Actual mobile runtime tests now check each deployment's camera, visible result, service lamps, moving delivery pool, explicit next action, final instructions and top-level Real Quests link, alongside existing resume/reopen/restart checks. Individual vehicles may yield to another vehicle or pedestrian; movement assertions cover the active delivery pool instead of requiring every vehicle to move every frame. Canvas/GPU and physical-device rendering still require live acceptance. Full validate/CI and one production build gate release; branch previews are disabled to conserve quota.

## 31 October 2026 — Same-city Chapters 5–12 and one exact-resume invitation

The Chapter 4 completion panel now unlocks Chapters 5–12 on the existing 14-district city: Repair and Upgrade, A Growing City, Connected Crises, Build for Everyone, Use Less / Serve More, Lead Through Pressure, Design for Reliability and The Final Challenge. Sixteen authored missions each require a diagnosis, interactive configuration, successful simulation test and explicit deployment. Allocation puzzles enforce supply limits, essential minimums and reserves. Relay-network puzzles reject the broken direct link, enforce a connection budget and eventually require independent backup routes. Answer order rotates; wrong diagnoses and failed tests neither deploy nor advance. The shared deterministic engine uses starting water capacity and earlier tested upgrades in the supply budget and makes no AI calls.

Deployed upgrades are derived from validated records and applied over the existing city without rewriting Chapters 1–4 decisions or enterprise/resilience supplies. Bounded blue-and-gold service installations use the existing plaza pool; delivery/request feedback derives from the tested allocations or the repaired service alongside the prior crisis report. The existing city reveal shows each deployed result, then explicitly continues to the next mission. Chapter 12 ends in a city showcase, exploration, optional replay of Chapters 5–12 and a top-level Real Quests link. The guide explains this flow and keeps fictional practice separate from real evidence/XP.

The additive advanced save field contains only bounded numeric plans, a starting-capacity value and an allowlisted diagnosis/configuration/result cursor. Old saves load with no advanced record; invalid advanced progress is discarded without replacing the foundation city. Device save consent and existing 18 KB backup boundaries remain unchanged. The shared server/client sanitizer already backs account save/restore; no schema migration is required. Resetting earlier chapters warns when later upgrades will be reset.

The welcome screen retains one large primary Continue my city control using the saved-game handler. The smaller duplicate is hidden, and the separate outgoing link is explicitly Real-world Quests rather than another Continue invitation. The actual runtime test restores the same configuration values and result from sanitized state via the large control, preserving city and enterprise values.

Validation includes all 16 missions at weak/medium/strong starting capacities, bad allocations, reserves, broken links, redundancy, invalid records, old saves, in-budget backup size, and the full actual mobile controller journey through all eight chapters, visual upgrade presence, restore/configuration/result and existing Chapters 1–4/repair regressions. Canvas/GPU and physical-device usability still require live acceptance. Full npm run validate and clean CI gate the release. Branch previews are disabled; one main-branch production build is intended.

## 31 October 2026 — Ordered chapter menu and transparent app controls

City menu now lists all 12 chapters in sequence under the four progression tiers, with Completed, Current, Ready and Locked states computed from existing decisions, required builds, operating days, crisis choices and advanced records. A primary Resume current chapter action uses the current saved flow. Later chapters remain locked. Completed Chapters 5–11 open read-only saved-result reviews; returning to the active challenge preserves its configuration and records. Chapter 12 opens its completed showcase. Existing Chapter 1–2 reviews and Chapter 3–4 panels retain their original rules.

Separate collapsible groups contain city inspection/review, build/repair tools, music/sound and save/help. Device save settings leads to the existing save control; Real-world Quests is explicitly separate from the story. Existing control IDs and action handlers are retained, and chapter selection never resets or skips progress. Menu height is bounded for narrow/short screens.

The embedded app's Real Quest and focus controls now float transparently over the full city canvas. The opaque top strip and adjacent Play & build label are removed; the duplicate embedded city title is hidden. Text shadows, borders, focus outlines and 44px targets retain readability. The same iframe remains mounted on focus changes. A bounded numeric same-origin parent message reserves the measured control height in the in-game HUD and city view so controls do not overlap; ResizeObserver and resize cleanup keep it aligned, including wrapped account controls. Account backup's expanded panel remains readable and its mobile position follows the measured control height. No saved-state or database change.

Tests cover all 12 chapter states/locks, result-chapter highlighting, the actual completed-chapter review and return with unchanged state, Chapter 4 resume staying open, the height-message origin/type boundary, transparent frame controls and iframe preservation. Existing full runtime journey and save compatibility checks remain required. Full validate/CI and one production build gate release; branch previews are disabled. Physical-device appearance remains live acceptance.

## 31 October 2026 — Readable city identity and icon-only return to entrance

The Unbuilt City corner title is restored in embedded play as a 21–28px serif signature with a gold City accent and transparent background. The name and an adjacent icon-only home control remain visible while inspecting city results; the navigation row stays out of that view and its panel is positioned below the title. The home control has a screen-reader label and a 44px touch target, without visible Back to entrance wording.

Returning to the welcome entrance pauses the current flow, cancels travel/automatic advancement and transient feedback, closes panels, suspends audio and focuses the existing large Continue button. It never resets the city or clears device saves, never turns on saving, and retains the current advanced configuration/result and foundation state. Continue uses the existing recovery path and resumes audio on its user gesture. A welcome note explains that returning did not restart anything and points to optional device saving.

The parent frame now honours an own-iframe, same-origin entered:false signal to hide floating play controls at the entrance, closes any open backup panel, and restores the controls on Continue without remounting the city. Tests cover entrance/continue from an unfinished advanced configuration and deployed result, icon-only naming, unchanged progress and parent-frame false/true signals. Existing full game, save/restore and chapter checks remain required. Full validate/CI and one production deployment gate release; branch previews are disabled. Physical-device typography/placement remains live acceptance.

## 31 October 2026 — Feedback clear of controls and credits in City menu

Transient outcome/status messages now appear at the centre of the city viewport instead of at the top HUD. The toast stays above in-game controls, has a bounded width, wrapping text and no pointer events, so it cannot block interaction. Reduced-motion preferences remove its transition. The existing message timing and content are unchanged.

The shared city fund control moves into City menu → My city / explore and review. Its existing credits count and explanation dialog remain available through the same IDs and handler, with an in-flow compact layout replacing the floating panel. It no longer competes with the title, sound buttons or top app controls. No credit arithmetic, chapter progression, save or account changes. Runtime checks assert menu containment and that the existing fund dialog opens/closes. Full validate/CI and one production deployment gate release; branch previews are disabled. Physical-device placement remains live acceptance.

## 31 October 2026 — Focused mobile puzzles, visible-play wake lock and menu-contained backup

Build Lab now uses a full-viewport phone/short-screen workspace with fixed heading/actions and an independently scrolling work area. 3D drawing pauses behind a covered phone puzzle and resumes on return. Its board scales within usable height, tools stay reachable, objective text remains visible and extra instructions/options are collapsible. Short landscape layouts use two columns. Hint, Test and Back to city remain accessible; Back retains the existing layout. On phones a successful validated test closes the workspace and invokes the existing city reveal once. The reveal captures its mission/result before closing and repeat clicks cannot duplicate the stage completion. Desktop retains a spacious city-side worksite.

Advanced allocation/relay configurations use the same focused-screen principle: scrollable work area, persistent Test / Deploy / Back controls and retained numeric cursor. Diagnosis and completed-result reviews remain compact. The game reports focused-puzzle state through its existing same-origin frame signal so outer app controls are hidden during a mobile workspace or Build Lab modal, then restored without remounting the city.

The platform Screen Wake Lock API is requested during visible entered play, including puzzle reading, and released on entrance return, hidden document or page exit. Visibility/page return reacquires it when play is still active. A menu switch permits disabling it and reports actual lock status. Unsupported devices and denied/system-released locks do not claim protection. Pending requests are guarded against exit races and duplicates; there is no polling/video workaround. The same-origin frame and Permissions-Policy explicitly permit screen-wake-lock. Device/battery policy can still override the request.

Account backup controls are rendered by the existing authenticated parent component into a same-origin City menu slot. The original revision-safe export/import/delete flows and owner API remain unchanged. A portal keeps auth handling in the app while placing the trigger and inline panel inside Save and help rather than over the city. Styling is self-contained in the child document; one viewport-bounded menu scroller contains the full backup UI. Native menu handlers leave backup interactions open.

Menu placement is clamped from its anchor into the viewport on open/resize, with bounded width and available height, horizontal clipping prevention and vertical scrolling. Runtime checks cover narrow widths/short landscape, all existing chapters, phone auto-reveal without duplicate repair completion and existing recovery. Thirteen focused UI tests cover the portal, modal/focus behavior and frame preservation. Wake-controller tests cover acquire/release/reacquire, disabled/unsupported/denied cases and a pending-exit race. Existing saves and database schema are unchanged. Full validate/CI and one production build gate release; previews are disabled. Physical-device layout and actual OS wake-lock support remain live acceptance.

## 31 October 2026 — Tap-to-toggle puzzle rotation

Rotate now cycles the next connector through quarter turns every 700 ms after one tap. The same button becomes Stop rotation; placing a piece also stops at the current orientation. Changing tools or missions, testing, clearing, closing or hiding the page cancels the timer. The live direction text and aria-pressed state expose the current orientation and running state. Existing placement, scoring and saves are preserved.

## 31 October 2026 — Recover the playable challenge across all chapters

Resume no longer trusts a stale running flag: it cancels orphaned transition/walk callbacks and restores the pending question or required build from retained progress. Recovering travel opens the question directly, independently of 3D frames. A completed foundation resumes Chapter 3 even before its first day. Resume controls route later chapters through their existing chapter-specific state machines. Background/page lifecycle pauses running foundation work and restores it on return without overriding an intentional pause, open menu, inspection or dialog.

Regression coverage reproduces the missing-panel bug before the fix, then checks all 36 decisions in two playthroughs for stale running recovery, pause/entrance return, background return and interrupted travel; all seven enterprise days, all three crisis rounds and all 16 advanced configurations return without changing retained progress. Existing puzzle resume and chapter handoff checks remain. Full validate and CI gate one production release, with previews disabled.
