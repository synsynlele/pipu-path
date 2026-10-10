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
