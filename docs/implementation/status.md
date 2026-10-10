# Implementation status

## 10 October 2026 — Named reviewer

Oluwatosin Adebayo is nominated as guardian reviewer. The supplied email is the
existing verified active owner; independent operator backup remains unfilled.
No role or release flag changed. See `docs/release/release-closure.md`.

## 9 October 2026 — Play release foundation candidate

User authorised the release-readiness improvements after identifying the correct
repository. The isolated candidate adds an authenticated deletion-request flow
and an owner/operator queue, gated by a monitored contact and explicit server
enablement. It also protects optional analytics from browser-storage exceptions,
clarifies journey-position copy, corrects AI-provider disclosure and strengthens
Android package/trust checks. See `docs/release/play-release-foundation.md`.

This is not a production deployment or Play submission. Staging database proof,
the actual monitored privacy address, an approved retention/fulfilment procedure,
authenticated browser and physical Android proof remain release gates. The
historical Stage 26 notes below are prior evidence, not the current release head.

**Current stage:** Stage 26 — Exact Mobile Experience Rebuild  
**Stage status:** MOBILE RENDERER STABILITY RELEASE CANDIDATE — repeated Android Lite renderer crashes are now a release blocker; the correction is isolated for CI and exact-Preview proof.
**Stage 26 production:** `e5fbee6ccf503c77ae006b2da116eb1d6497a190`
**Correction branch:** `agent/stage-26-mobile-renderer-stability`
**Stage authority:** `docs/stages/stage-26-exact-mobile-experience-rebuild.md`  
**Last updated:** 2026-09-01

## Released baseline

Stage 26 — Exact Mobile Experience Rebuild is released in production from merge commit `a31f950b478b7e3a9d483c351865e72c884d5bc2`.

Stage 25 preserves the complete Stage 0–24 developmental engine and leaves PipuPath as one installable responsive Next.js/PWA product. Android/Chromium installation continues to use the browser-native prompt when available, iOS continues to require explicit Add to Home Screen guidance, and `/continue` remains the installed-app start URL.

## Stage 26 direction

The approved mobile concept is now a release specification rather than inspiration. Stage 26 therefore rebuilds screen composition and interaction hierarchy instead of decorating the former dashboard layouts.

The mobile experience is organised around:

- Home — real Builder state, Mission, next move and truthful momentum;
- Discover — living evidence-led self-understanding;
- Build — Journey, Quest, evidence, reflection and Projects presented as one action centre;
- Connect — safe relevant Builder discovery and collaboration without popularity mechanics or unrestricted messaging;
- Profile — the Living Builder identity, proof, Vault, Passport, Projects and developmental signals;
- Onboarding — Account → Identity → Discovery → Direction → first meaningful Home state;
- Admin / Mission Control — preserved as a separate operator layer.

## First implementation slice

The first Stage 26 implementation slice is intentionally presentation-first and does not add Supabase migrations.

It includes:

- a scoped light consumer-product surface system under the authenticated AppShell while preserving the PipuPath indigo/navy identity;
- premium mobile top chrome and a white fixed five-tab bottom navigation with elevated Build action;
- custom concept-matched vector illustration assets;
- a recomposed Home screen using only saved Builder state;
- a recomposed Discover screen;
- a new unified `/build` action centre rather than a redirect-only route;
- upgraded shared onboarding shell;
- route skeleton/loading treatment for the five primary Builder destinations;
- reduced-motion and safe-area support.

Connect and Profile already inherit the new authenticated surface grammar in this slice; any remaining structural mismatch identified during Stage 26 visual proof must be corrected before release.

## Data / migration state

No Supabase migration is introduced by this slice. Existing RLS, onboarding, Human Potential Profile, Mission, Journey, Quest, evidence, reflection, progression, Projects, Connect, collaboration, Opportunities, Living Profile, Portfolio, Passport, safeguarding and Admin authorization remain authoritative.

## Release posture

Canonical CI #1225 passed on repaired application/test head `5bf1e49e2acf845a274f3bae985245a703cd3d72` after stale presentation assertions and nondeterministic React test teardown were corrected.

Exact application Preview deployment `dpl_C31pZv8xczmqC49tWVjb12z4gjeH` reached READY at `https://pipu-path-ma0g7xpk1-copyartint-2860s-projects.vercel.app`.

Authenticated Preview CI #1226 passed the release browser matrix on desktop Chrome and iPhone 13. It verified the five primary destinations, onboarding privacy, safeguarding, Admin isolation, deep product routes, horizontal overflow boundaries and PWA manifest behaviour. Public browser inspection also confirmed install access, protected `/app` routing with its return target and no PipuPath-originated console errors.

No Supabase migration is required.

## Visual perfection correction

Post-release visual inspection identified that Stage 23 inline fallback colours in the shared Button and Surface primitives were overriding Stage 26 CSS on deep routes. Build and Guide also lacked the shared authenticated shell, while Connect and Profile layouts added redundant secondary navigation above their concept-matched pages.

The correction:

- removes inline visual authority from Button and Surface primitives so CSS scopes can work predictably;
- resolves shared panel, raised-panel, soft-surface, foreground, muted and border semantics through the Stage 26 AppShell scope;
- preserves the Stage 23 dark identity for public/auth surfaces outside AppShell;
- restores the five-tab AppShell to Build, Guide and Institution;
- removes redundant Connect/Profile layout toolbars without removing destination access;
- keeps every Supabase action, DAL, domain rule, route and safeguard unchanged.

Local evidence: formatting, zero-warning lint, strict TypeScript, 335 unit/coverage tests, 226 integration/regression tests and the Next.js production build pass.

## Mobile QA correction

Direct production use identified four phone-specific presentation defects and one transient client crash report. The correction restores the gold-P brand mark in the mobile shell, keeps a compact Install control visible in browser mode, gives light actions an explicit high-contrast variant, moves personalised hero progress into normal document flow and stacks action rows below 430px. Authenticated browser traversal now fails on uncaught client page errors in addition to route, overflow and application-error checks. Production server telemetry showed no runtime error cluster or 5xx response during the reported crash window.

## Mobile renderer stability correction

Repeated Android Lite `tab crashed / reload` reports on 2026-09-01 elevate the earlier transient report to a release blocker. Android Lite is a Chromium Trusted Web Activity, so this message represents loss of the browser renderer process rather than a normal Next.js error boundary.

Production telemetry during the repeat-crash window showed successful application traffic and no 5xx cluster, but it did expose `refresh_token_not_found` from Supabase middleware for a stale client session. The Stage 26 authenticated surface also kept a live `backdrop-filter: blur(22px)` on the fixed mobile navigation and a second large CSS `filter: blur(34px)` hero layer, both of which force extra compositing on constrained Android renderers.

The isolated correction therefore:

- removes live backdrop filtering from fixed mobile navigation while preserving the same opaque white visual hierarchy;
- replaces the phone hero CSS filter with a non-filtered radial gradient;
- treats only Supabase `refresh_token_not_found` as an expired local session, clears stale Supabase auth cookies and returns the user to the normal signed-out routing path;
- preserves all other auth failures as errors rather than swallowing them;
- changes no domain, persistence, safeguarding or migration contract.

Canonical CI and exact-Preview phone proof are required before this correction can merge.

> **The screen is not the game. Life is the game.**

> **Make building feel as natural as socialising. Keep life as the game.**

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

## 2026-10-10 — Privacy proof operator handover

The disposable deletion proof now has a manual GitHub runner with scoped
credentials and an exact reviewed-commit gate. No automatic trigger can run it.
An authorised secret custodian must configure privacy-verification before an
operator can execute it. Existing protected Vercel secrets returned no readable
value. No live proof, flag enablement, merge or Play submission is claimed.

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

## 2026-10-10 — Concrete privacy decision ready for review

The proposed retention/guardian operating rules are documented for owner review.
The proposed 7/30/90-day schedule is not active or a claimed legal deadline.
Provider inventory, backup operator, child authorisation and cleanup controls
remain pending. API deletion proof remains passed; production remains disabled.

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
