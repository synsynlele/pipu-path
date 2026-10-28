# Implementation status

## 28 October 2026 — hands-free case progression and varied answer positions

The branch `feat/unbuilt-city-auto-flow-options` builds on the visible-action
preview. Learners now make **one choice** per authored practice problem.
That single tap records the fictional decision (and saves it on the
current device only if they previously opted in), immediately activates
the physical district effect, shows the outcome, and then automatically
travels to the next case. No "keep", "next", or "return" button is required
between the 16 authored cases. Consequences remain visible for 7.2 seconds,
with a **Pause to read** control for optional extended reading; players
can optionally retry or skip the countdown. The sixteenth case ends
in a deliberate completion panel instead of looping forever.

A stable per-session answer order distributes the **first-authored
option** across positions one, two and three (5–6 occurrences in each
position across the 16 cases, independent of the seed). Distractor order
also varies; replaying the same case within a session preserves the
positions, so retries are understandable. This breaks the misleading
"first answer is always correct" pattern, but does not claim that every
scenario has a single objectively right answer: each choice still
includes authored trade-offs.

The underlying 14-district scene, full navigation, case effects,
two-day city economy, optional device-only save and real Quest separation
are preserved. Preview-only. CI, Android input/reading pace, screen-reader
access, navigation and actual engagement need verification before release.

## 28 October 2026 — visible decision consequences and no walking trail

A separate preview branch `feat/unbuilt-city-visible-actions` directly responds
to learner observations. The auto-walk navigator and collision logic remain
unchanged, but the visible 3D tube/path line is removed completely.

All sixteen authored cases now trigger an immediate **fictional world-action
preview** upon selecting any of their three choices. The game briefly hides
the text detail panel, focuses the camera on the appropriate district,
raises a distinct 3D workplace/service prop, emits a lightweight particle
burst and a nearby character reaction (subject to reduced-motion settings),
then returns the consequence and trade-off explanation. Players can watch
the result again, retry another option, or keep a decision. Until a choice
is explicitly kept, its visible change is reversible. Kept choices remain
on the 3D neighbourhood and are included in the existing optional
device-only practice snapshot. Different outcomes have distinct visual
signal colours and the city HUD spells out the provisional effect; poor
choices also make a visible change rather than silently failing.

**Evidence limits:** These props and signals are fictional illustrations
of the authored scenarios. They do not yet alter power throughput,
market sales, real city economics, XP, PipuPath evidence or skills. Scene
animation is not proof of learning impact or a photorealistic simulation.
CI, actual browser interaction, physical Android performance and a new
consented learner observation are mandatory before production or claims
that students find this genuinely engaging.

## 28 October 2026 — Four-district engagement practice and opt-in device save

The candidate `feat/unbuilt-city-pilot-challenges` adds 16 authored
decision cases: four each for Repair & Maintenance, Power & Energy,
Agriculture & Food and Education & Skills. Every case offers three choices
with distinct consequences, trade-offs and interdependent city sectors.
The single 3D world and 14-location directory remain; choosing a problem
walks to its corresponding district. Players may compare approaches, keep
one, replay, or move to the next. Keeping a fictional practice approach
produces a small coloured landmark in that neighbourhood. These markers
reflect authored practice only; they never write verified XP, complete
Quests, or modify the separate two-day power/food economy.

Practice progression can be **optionally saved to this browser** with an
explicit opt-in in the casebook; only whitelisted fictional plan state,
visited stations and case choices are saved. Names, reflections, uploads,
accounts and genuine Quest evidence are excluded. Schema validation,
bounded restoration, expiry, failure handling and user-controlled clear
are tested. Device/browser clearing or device change loses the record;
there is no cloud backup, cross-device continuation or PipuPath account
sync. The prior two-day operating model and ten not-yet-playable districts
remain unchanged.

This is **preview-only**, not validated engagement or a public release.
Release gates include CI, verified browser playthrough, storage/clear on
Android, collision- and overlay-safe tap navigation, minor safeguarding,
and consented KNS learner testing without coaching.

## 28 October 2026 — The Unbuilt City 14-district pilot world candidate

Branch `feat/unbuilt-city-fourteen-districts` extends the existing single city
rather than making separate challenge screens. The map covers fourteen named
districts: Repair, Power, Food and Education retain the two-day playable city
economy; ten other locations have distinct explorable 3D landmarks and clearly
state that their dedicated challenges remain in development. The city directory
and expanded camera/world bounds give discoverable navigation; the shared A*
navigator now uses a priority queue for longer trips. NPC navigation obstacles
and mobile detail-panel behaviour are preserved. The world and practice
progress remain session-only, and no fabricated mission completion, verified
XP or reward is introduced.

Acceptance requires full CI, confirmed exact-preview loading, playthrough
of the five existing stations, route reachability to the ten new locations,
mobile frame rate and accessibility proof, and pilot feedback. This is an
isolated preview candidate, not production or a finished 14-district game.

## 28 October 2026 — richer city visuals and on-demand controls

On `feat/unbuilt-city-living-visuals` the city now uses detailed masonry houses, pitched roofs, streetside furniture, market awnings and more human-like characters. The guide and construction dock are dismissible and collapse as the player acts; all background controls hide during the test-day animation. The new UI smoke assertions run with the existing power-district checks. Preview, browser interactions, accessibility and physical-device QA must be verified separately; not production.

## 28 October 2026 — Unbuilt City guided expansion candidate

An isolated feature branch, `feat/unbuilt-city-guided-expanded`, extends
the connected city: one-step guided onboarding beginning with Ama, optional
free exploration, larger navigable school and market districts, a map view,
following camera and mobile-first overlay hierarchy. It keeps the two-day
shared fund/power/food/learning simulation and owned Quest link unchanged.
This is **preview-only development**, not a release or a demonstrated
physical-phone pass. CI, browser exploration and navigation reachability
must pass before merging to `feat/unbuilt-city-first-episode` or main.

## 27 October 2026 — Game journey trail preview

The open `feat/unbuilt-city-first-episode` candidate adds an illustrated,
Quest-aware Explore → Act → Prove → Grow trail to the current shared Home,
Build, Journey and Quest experience. Real Quest state determines available
steps and earned progress; city practice never awards XP or completes a Quest.
It reuses the existing authenticated AppShell and the Unbuilt City artwork.
Four new deterministic status tests and a TypeScript check passed locally.
Full GitHub CI, authenticated browser/phone QA and production release are
separate gates. No Supabase migration is required.

## 15 October 2026 — Plain-language guidance candidate

Shared prompts now explicitly serve adults of all ages and younger users, using
short everyday language and supplied life context. Quest fallbacks now vary
by milestone activity rather than repeating three planning exercises. Legacy
reflection questions are separated from fixed form fields. No saved learning
records or minor AI protections are changed. Validation and release evidence
are recorded in the ledger; this candidate is not deployed. See
`docs/product/plain-language-guidance.md`.

## 10 October 2026 — Founder-operated pilot preparation

Owner waived backup practical handover as a release blocker and will operate
privacy/support meanwhile. The handover stays unverified follow-up work. Pilot
recruitment and feedback procedure are prepared; no public rollout, adult-only
software restriction or Play submission is claimed. Core authentication, Quest,
provider and relevant child safeguards remain separate gates. See
`docs/release/founder-operated-pilot.md`.

## 10 October 2026 — Named reviewer

Oluwatosin Adebayo is nominated as guardian reviewer. The supplied email is the
existing verified active owner. Adewale Ayanfe now holds backup responsibility
through the verified company account kaecng@gmail.com, granted the existing
operator role with an audit event. Owner reported successful sign-in and Mission Control access. The controlled
preview drill is paused: Google-only operator accounts cannot use the suggested
email/password login. Operational handover remains pending. See
`docs/release/privacy-operator-handover.md` for the exact URL and test request. No
release flag changed. See `docs/release/release-closure.md`.

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

## 2026-10-16 — Parent approval and loading improvements prepared

Private learning now supports an explicit parent-on-device declaration without a
second account, recorded as self-declared rather than independently verified.
Approval withdrawal, profile/privacy navigation and parent-specific sign-in
recovery are included. Page renders share identity/guardian/home checks within a
request; fresh requests and auth callbacks retain fresh validation. OpenAI retries
share a 45-second total budget. Tests cover persistence boundaries and request
isolation. See parent-approval-and-loading.md for evidence and release order.
Live release awaits restored access to the verified PipuPath database and
verification against the production environment; no live change is claimed.

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

The user authorised the game direction inside the existing PipuPath design.
Implemented a Build entry and protected `/build/play` practice episode with a
shared-first attempt, explicit explanation, independent changed scenario,
reflection and optional real-world experiment download. Uses existing shell and
components. Practice never earns XP or produces a capability claim. Page state
resets on refresh; explicit download is the only export. No database change or
live deployment is claimed. See product/unbuilt-city-first-episode.md and ledger.

## 27 October — visual city and Quest continuity candidate

Replaced prose-heavy card planning with an illustrated interactive scene and
short character dialogue. Home/Build/Journey/Quest share a Play–Act–Prove–Grow
continuation, with owned Quest context passed through the game to its real goal.
Practice cannot write completion, XP or evidence. Added owned-context/locked-ID,
continuation and browser-auth return regression checks. Art is an optimised
static project asset. Validation and exact-preview visual results are recorded
in the ledger; no production deployment is implied.

## 27 October — adventure contrast and adaptive consequences candidate

Added scoped light/dark adventure surfaces to prevent shared global dark-theme
rules from recolouring white cards and gold action links. Photo-backed choice
labels now use solid dark plates; text fields and CTA states have explicit colour
pairs. Hub, city, shared journey card and five chapter runners use the scopes.

The five newer worlds now introduce a curated disruption after their opening
success. Original choices stay visible, changed requirements and unavailable
options are explained, and revised plans must pass the same resource evaluator.
Attempt comparison shows changes in fictional reach/benefit. Practice writes no
Quest evidence or XP. Enumeration verifies solvability and changed-plan demands.
Full validation and exact-preview browser evidence are separate release checks.

## 27 October — connected neighbourhood first story candidate

User approved life-simulation inspiration. Added an original connected map with a
movable/customisable character and Ada → Timi → Mama Jo encounters: invitation
wayfinding, stall assembly and a supply route around a closed bridge. Choices
appear in later dialogue and visible map changes. Adventure Hub/shared journey
card link the new route to the same real Quest. Optional user-scoped device save
supports returning on this browser; cloud saves and verified rewards are absent.
See product/connected-neighbourhood.md. Browser/mobile/release status must be
reported separately from source and automated checks.

## 27 October — direct manipulation candidate

Responding to user feedback, game access is exposed in the authenticated header
and all Build routes. Neighbourhood stall assembly now supports touch/mouse/pen
dragging, rearrangement and keyboard/tap alternatives. Hold-to-walk controls and a
visible delivery vehicle improve motion feedback. These reusable controls are the
foundation for further world conversions; existing six-world planning mechanics
are unchanged. Full checks and preview verification are recorded in the ledger.

## 27 October — game selection correction

Game directory highlighting now follows the current pathname instead of always
highlighting Neighbourhood. A regression covers all seven games and the hub.
This correction adds no levels or changes to progression/save rules.

## 27 October — build-system gameplay candidate

All seven worlds now default to editable build/stress-test simulations with
world-specific infrastructure, constraints and disruptions. The existing winding
path describes 19 new evaluated build missions. Earlier story modes and their
saves remain available; they are not automatically counted as new-build progress.
Original SVG worlds support module dragging/rearrangement, camera controls,
network traffic, weather feedback and reduced-motion alternatives. Opt-in device
saves store bounded blueprints and evaluated proofs only. No verified XP, learner
record, database schema or production release change is claimed. See the build
simulation product contract and ledger for validation/release evidence.

## 28 October — Power District 3D navigation and app-preview candidate

Added the first 3D workshop inside authenticated Build/Adventure navigation at
`/build/power-district`. The same-origin game is isolated from the app bundle and
uses session-only practice state inside the app. Real Quest continuation uses
existing owned home state; no game event awards XP or writes Quest evidence.
One-click destinations and station approaches use obstacle-expanded pathfinding;
keyboard/touch manual movement uses the same swept collision checks. Installed
equipment updates the walkable area. See product/power-district-3d.md and ledger.
This is one workshop prototype, not a completed 12-world platform.

## 28 October — The Unbuilt City replacement, preview authorised

Owner explicitly authorised pushing/deploying the prepared integration to preview
and clarified that new challenges replace the existing Unbuilt City game.
Canonical `/build/play` now opens the 3D Power District mission, preserving owned
Quest context. The Hub uses a new mission path rather than the old simulations;
retired chapter routes recover to that path. Food/learning are planned, not
playable. Same-origin frame loading supports client-side navigation; only the game
document permits embedding, while other app pages remain unframeable. No production release, XP or data migration.

## 28 October — Connected-city direction and identity correction

Owner requested The Unbuilt City as the sole in-game identity, integration with
the app colours, and all building/solutions in the same city. Added a single
3D neighbourhood with linked power, food distribution, cash and learning support,
one fund and two evaluated operating days. Buildings and funds carry forward
within the session; no separate challenge scenes or claimed cloud saves. Shared
rendering/navigation/theme assets now live under games/shared. The game removes
the alternate P logo and PipuPath wordmark; the app shell retains its own identity.
See product/unbuilt-city-connected-world.md. Validation/deployment are separate.
