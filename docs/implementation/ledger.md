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
