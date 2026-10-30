# Implementation status

## 30 October 2026 — Phase 4 practical Quest quality correction

The game-to-Quest handoff now leads to a real-use intervention rather than a
paper-based exercise. All 14 real-world topic hints and 5 city-linked starters
were rewritten. New AI templates must describe a deployed improvement, real
usage test and honest result. Unsafe tasks and paperwork-only simulations fail
server validation. A versioned hash prevents new attempts selecting the old
paperwork template catalogue without changing prior submissions. An active old
paper-only challenge offers a visible set-aside option, retaining history.

Both Real Quest dropdowns now enforce a light background and dark text for
native Android options. Existing AI request caps and shared template reuse are
retained with no automatic AI retries. No Supabase migration is required for
this change. Full CI and mobile acceptance remain mandatory before production.

## 30 October 2026 — Game Phase 4: safe city-to-Quest handoff preview

Development branch `preview/game-world-class-phase4` stacks on Phase 3's
draft PR; it does not alter the main branch or production. A new allowlisted
service-to-action catalogue connects certified fictional city builds and
continuing scenarios to the existing Real Quests creation screen. The same
iframe-parent bridge accepts only same-origin messages from the embedded
city, validates the service ID, and transports no free-text player data.
Real Quests proposes a topic and editable, safe first focus; it neither
starts a Quest without the Builder's decision nor pretends game play earned
XP or real-life proof. If a real Quest is already active, it is preserved.

The in-game guide also explains the transition. Domain tests check every
reviewed mapping, exact value allowlisting and input-length limits. This is
the first Phase 4 slice; account-authorized cloud city saves, supervised
multi-school collaboration, real Android trials and full production QA
remain unshipped. The candidate Real Quests migration/environment gate noted
below still applies.

## 28 October 2026 — Chapter 3, City of Opportunities: operating enterprises

The development branch `feat/unbuilt-city-chapter-three-enterprises` extends the
existing 36-decision, 14-district city. **Chapter 3 unlocks only when all 36
foundation and growth decisions are complete.** The last decision now offers
a clear **Start Chapter 3 — Opportunities** action; a persistent Opportunities
navigation button also unlocks, including for existing saved cities that already
completed Chapter 2.

Chapter 3 introduces the first **playable seven-day enterprise simulation**.
The player chooses among four explicit priorities—balancing services, people
first, enterprise growth, or repair first—then runs a day to see how finite
resources are produced, allocated, carried into tomorrow and delivered:
waterworks supplies clinics and food producers, industry supplies parts
for repairs, food producers supply shops, and clinics and shops serve
residents. Operational capacity is derived from the previously chosen
district construction and linked service conditions. Demand variations,
maintenance benefits, shortages, four independent priorities and seven
authored daily events make choices consequential. Days display water,
parts, food, clinic/market visits, repair activity, shortages, simple
work activity counts and actual outgoing shipments, plus a compact
seven-day history. These numbers are deliberately **fictional illustrative
units**, never claims about real health outcomes, jobs, money, grades,
or the city economy.

The pre-existing 3D delivery layer shows **actual last-day shipment routes**
once a Chapter 3 day has run, instead of the initial ambient illustration.
No new personal data, remote calls or other backend changes are required.
The optional, consented device save has an allowlisted `economy` field,
bounded to seven days and small non-identifying integer values. Existing
v1 saves without this field remain valid and start with an empty
Chapter 3 practice. The player can restart _only_ the enterprise
practice while preserving the 36 decisions, buildings and the entire
city. Decision revision affects subsequent production days; past
fictional days remain historical records and are not rewritten.

This is a meaningful **Chapter 3 vertical slice**, not a completed
autonomous market economy. Chapter 4 remains future work.
Release gate: full CI, Vercel preview and classroom Android tests for
mobile panel space, operating-day resets, reopening a saved game,
live delivery visibility, memory stability and impact of revised choices.
Production remains unchanged.

## 28 October 2026 — Build a more beautiful, visibly living city

Development branch `feat/unbuilt-city-living-beautiful-world`
adds a **decision-driven ambient life layer** on top of the existing
14-district 3D city (36 scenarios). Every neighbourhood gains a
lightweight planted courtyard with flowers, shade trees and an
illuminated gathering seat that activates when that district receives
an actual construction decision. Only built districts attract
animated workers and residents; stronger districts can display more
people, while weak districts show less activity.

Up to five small delivery vehicles travel only along the existing
road lattice between built service districts. Their number, routes
and movement speed derive entirely from the player's selected
decisions (e.g., water and healthcare, manufacturing and repairs,
transport and food). A revised decision recalculates activity
immediately. A new **View My City** subtitle displays how many
illustrative service deliveries are active. This is illustrative,
not a real traffic, population, jobs or economic forecast.

For low-power phones or the software renderer, the scene constructs
one extra resident per built district instead of two, and a
maximum of three delivery vehicles. Decorative meshes do not cast
shadows or obstruct avatar navigation. Reduced-motion preferences
stop the movement but retain a representative still scene;
simulations do not update visually while a tab is hidden.
No additional WebGL textures, third-party services, tracking,
account storage, XP claims or real-world metrics were added.

This is the beginning of a beautiful, responsive living-city
presentation, **not** the fully fledged Chapter 3 operational
enterprise economy or Chapter 4 autonomous population simulator.
Do not describe it as those chapters being shipped. CI plus
physical student Android/tablet scene performance, movement,
readability and long-session stress testing are required before
production promotion. Production remains unchanged.

## 28 October 2026 — Aerial view of the player's actual built city

Branch `feat/unbuilt-city-player-city-view` adds a compact, player-facing
**View My City** action to the existing city navigation. The action
does not reset progress or open a large questionnaire. It pauses the
automatic journey at the current travel, question, building, outcome
or chapter-reveal stage. A dedicated 3D overview camera rises over
the same scene and the same decision-derived construction state.
The player can orbit by dragging, zoom by pinching or +/- buttons,
and select any of the 14 districts to move the camera nearer.
A small, unobtrusive overlay reports built projects and whether
each neighbourhood has started construction. Empty districts
remain visibly unfinished.

**Return to journey** restores the original map mode, camera angle,
field of view and paused card. When a player opened the view during
active auto-play, the original stage resumes; if they had deliberately
paused, the stage remains paused, avoiding surprising advancement.
Review cards remain intact if city viewing begins while reviewing an
older choice. The view explicitly suppresses world-tap navigation
and keyboard movement, so looking around cannot move the character
or trigger another mission. It is transient and read-only: no new
saved state, personal information, images, location or screenshots.
Existing optional same-device saves continue unchanged.

Regression checks validate 14 districts, projects 0/36 to 36/36,
revision-derived changes, and view-pause-return source contracts.
Android portrait, landscape, canvas orbit/zoom, overlay spacing and
software-renderer fallback still require hands-on testing. Production
is unchanged.

## 28 October 2026 — Compact in-city decision cards

The decision and consequence overlays were occupying most of the
mobile scene. The `feat/unbuilt-city-compact-decision-panel` preview
scopes a **small floating question/outcome sheet** to actual case
interactions, leaving normal city, district and map overlays unchanged.
On a phone the question and outcome panel is capped at **46dvh or
355px, whichever is smaller**, anchored bottom-right with scroll
contained inside it. Landscape short screens may use up to 65dvh,
and wider screens cap the sheet to 54dvh / 465px, at a maximum width
of 354px. Long descriptions show their opening sentence and move
the rest, including the existing Chapter 2 connected-city context,
into an expandable **More about this problem** disclosure. The
question and all three existing choice buttons remain on the main
sheet with touch targets of at least 44px. The opening scroll position
is reset for every new question or outcome. Review/retry and the
existing Pause/Resume/Decisions controls are preserved; full original
narratives and consequences remain available, not deleted.

This change is preview-only until student Android portrait/landscape
testing confirms readability, all three options reachable, accessibility
and no collision with the journey controls.

## 28 October 2026 — Chapter 2 expansion across all 14 places

Branch `feat/unbuilt-city-chapter-two-all-districts` extends the original
16-case foundation to a 36-case, two-chapter city-building sequence. The
ten previously decorative/explorable places—Housing, Water, Healthcare,
Transport, Technology, Business, Environment, Governance, Creative
Economy and Industry—now each have **two authored fictional
problem-solving scenarios**, three materially different decision
consequences, visible decision-specific building geometries and district
service activity. All 14 places are represented in the connected-city
model. The new model connects water and healthcare, transport and food,
environment and housing, manufacturing and repairs, and other services.

Chapter 2 is gated on all 16 foundation decisions. Completion reveals
the student's unique city at an elevated camera view, then automatically
opens the first new district with a resumable chapter stage and manual
'Start now' shortcut. Long-distance guided travel skips long empty
walking sections while local walk movement remains unchanged. A Chapter
2 decision contains a concise contextual statement derived from a
related existing district's strength or weakness; dependencies are
fictional scenario heuristics, not new external economic data.

Existing direct click-to-navigate, mobile controls, pause/resume, last
decision and retrospective revisions remain. New case choices are
allowlisted through the existing opt-in browser-only save without new
identifiers or personal data. The legacy two-day operating exercise is
not silently merged into the 36-decision city. Chapter 3
entrepreneurial operations and Chapter 4 continuously operating city
systems remain **future work**, not implied to be shipped in this PR.

Release gate: full tests and Vercel preview; physical Android and
consented classroom end-to-end walk-through must happen before a
production merge, especially long-session WebGL performance and
navigation across the enlarged map.

## 28 October 2026 — restore essential controls and let builders revise decisions

A new preview branch `feat/unbuilt-city-navigation-and-revision`
corrects the over-restriction of navigation in the first guided-journey
iteration. The full essential city toolbar (Decisions, My City, Map, Places,
Build, Explore, Guide) remains **visible throughout automatic play**,
with a touch-friendly horizontally scrollable mobile layout. Activating a
legacy panel now pauses the guided journey first and preserves its case
and stage; the panel no longer competes with an in-flight automatic route.
The always-visible Pause/Resume journey control remains.

Players can **review any previously answered problem**, including after
completing all sixteen. The Decisions panel lists earlier recorded
choices, with an explicit "Change" label, and the journey bar offers
"Last decision" for fast access. Opening a saved decision temporarily
pauses—but does NOT overwrite—the main-journey checkpoint.
Choosing a replacement immediately changes its persistent physical
structure and the connected district health model, shows the resulting
consequence, and then automatically returns to the interrupted
journey if it was previously running. If the player had explicitly
paused, it remains paused until resumed. Returning without a
change preserves the original choice. Revisions use the existing
opt-in same-browser decision save, with no new personal data,
real XP or credential storage.

The 16-case auto flow and the original optional two-day city-economy
activity remain separate. Android pointer, scrolling, panel overlap,
back/revision and resume tests remain mandatory before production.

## 28 October 2026 — one journey controller with pause/resume

The new preview branch `feat/unbuilt-city-journey-resume` addresses observed
learner interruptions. The old station inspector opened a legacy details
panel immediately before auto-running `showCase()`, and legacy movement
and mission controls could cancel an auto-walk and discard its arrival
callback. A separate, visible **Pause journey / Resume journey** control
now owns the progression state. Guided mode bypasses legacy `inspect()`
entirely, drives directly to each question, and temporarily hides legacy
map, guide, build, hotspot and movement controls while running.

The journey tracks `travelling`, `question`, `building`,
`outcome`, and `complete`. Pausing stops route/timers safely without
losing which case or response the student was on. Resuming restarts
the appropriate stage (re-travel, same question, replay building, or
read the outcome) rather than jumping to an unrelated panel. A blocked
route surfaces a resumable state or opens the requested question. A
zero-length route immediately invokes its arrival callback. Closing
a question, tapping Pause while travelling, or choosing an old station
no longer silently loses the continuation path.

If the student has already opted into device-only saving, the same
allowlisted browser snapshot now also stores a restricted journey
cursor (case ID, stage, choice ID, paused status); it never stores text,
identity, private evidence or credentials. Existing saves lacking a
cursor still resume from the first unanswered case. Without opt-in
saving, exact resume works **within the current open session** but is
not promised after app/browser closure.

The legacy two-day operating simulation remains an optional,
separate activity. No new Quest XP or real-world proficiency is
awarded. CI and physical Android interruption/restart verification
are required before shipping.

## 28 October 2026 — Choice-to-City Engine (four-district vertical slice)

The preview branch `feat/unbuilt-city-choice-to-city` turns all 16
authored cases into **persistent, visibly different alternatives**.
Each has three independently modelled 3D arrangements (48 authored
choice-state variants across Repair, Power, Food and Learning): a
coordinated, staffed facility; an overloaded construction; or an
underused/incomplete installation. The structure is selected by the
stable authored choice ID, never by the on-screen answer position.
Revisiting a scenario replaces the prior arrangement, and optional
device-save restoration regenerates the same built city from the
sanitised choices already stored. A district-wide civic hub changes
its shape and resident activity according to aggregated service
conditions; its appearance is driven by the whole district, rather
than merely by the most recent answer.

A pure `city-growth.mjs` model derives four fictional service
profiles from choices, including interdependencies:
Power → Food, Learning and Repair; Learning → Repair;
Repair → Power and Food; Food → Repair and Learning.
"My City" opens a compact panel with 4 live district readouts,
building counts, service bars, and incoming cross-district effects.
No new personal data or parallel mutable city save is introduced:
city state is deterministically reconstructed from the existing
opt-in, validated browser-only saved choice IDs, and can be revised.

The above indicators are **authored fictional feedback**, separate
from the earlier two-day power, food and cash operating simulation.
They are not grade scores, XP, actual market or engineering predictions,
or verified evidence. The remaining ten districts are explorable but
do not yet have their own economic gameplay. Preview only; physical
Android rendering, long-session user experience and consented learner
observations are still required before any production promotion.

## 28 October 2026 — hands-free case progression and varied answer positions

The branch `feat/unbuilt-city-auto-flow-options` builds on the visible-action
preview. Selecting **Enter the city** now starts the next unsolved
practice problem automatically, including walking to that district.
No Problems (16) menu click or manual Take me there step is required.
Returning device-save players resume at the first unanswered problem;
a blocked route falls back to showing the decision rather than trapping
the player. Learners now make **one choice** per authored practice problem.
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

Implemented the first bounded slice of the people-first city direction.
Each district has a concise human purpose. My City explains the player's actual
choice outcomes and trade-offs on demand and offers a direct path to improve
an unresolved decision. Partial and ineffective plans never count as working
benefits; unanswered decisions stay visible. Data derives from current choice
IDs and revisions, preserving device saves and chapter progress.

The shared projection supports further authored neighbourhoods without adding
one-off screens or founder approval steps. It adds no scene geometry, per-frame
work, resident population claims, cloud records or verified developmental XP.
More sophisticated routines and service dependencies are not implemented in
this slice. Targeted model and actual runtime checks passed, including all
108 choice outcomes, revision navigation and both 36-answer chapter handoffs.
Validation: `npm run validate` passed formatting, lint, types, all city checks,
527 unit/component tests, 251 integration tests and the local production build.
The build emitted the known two unauthenticated progress-load diagnostics and
exited successfully. No physical Android/GPU validation or production release
is implied. One deliberate preview build is planned for browser review.

## 29 October 2026 — Clear view and first playable Chapter 4

Implemented the requested City menu dropdown and moved construction feedback
into the same responsive corner used by questions/outcomes. Native disclosure
keyboard behaviour, selection/outside dismissal and Escape focus return are
supported; Pause/Resume remains directly available.

Chapter 3 now reveals Continue to Chapter 4 after its seventh operating day.
Chapter 4, The Resilient City, is a bounded three-disruption first slice using
the existing city: rain, a power interruption and heat. Players prioritise care,
food or repairs using conserved water, parts and food. Maintenance can improve
next-round continuity but competes for today's water. Shipments and request
signals reuse existing scene pools and represent actual calculated transfers.

An allowlisted bounded seed and three priority IDs reconstruct the attempt.
Optional device saves resume Chapter 4; legacy/corrupt records preserve city
choices. Restarting Chapter 4 preserves Chapter 3 and construction; restarting
Chapter 3 clears its dependent attempt. Capacity snapshots prevent silent
history rewrites after city revisions. No extra textures, meshes, frame loops,
account changes, XP or real outcomes are claimed.

Targeted acceptance passed: 27 policy combinations conserve resources, repair
carryover and priority trade-offs, actual Chapter 3 seven-day controls, Chapter
4 handoff/three rounds, close/reopen, city view and isolated reset. Canvas in
runtime tests is stubbed. Full `npm run validate` passed formatting, lint, types, all city checks,
527 unit/component tests, 251 integration tests and local production build.
The known two unauthenticated progress-load diagnostics emitted; build exited
successfully. Physical Android/GPU and student comprehension checks remain
separate. One deliberate preview is planned; no production release.

Browser acceptance completed all 36 choices, seven operating days, the Chapter
4 handoff, a saved one-challenge reload and all three resilience rounds. Question
and feedback have identical measured width and right/bottom coordinates. Native
menu selection/pause and Escape dismissal passed. Visual proof exposed a focus
scroll defect caused by distant projected labels expanding the hidden-overflow
world's scroll area. The world and label layer now use overflow clipping;
independent panels retain scrolling. One corrective preview is needed after the
initial preview. Production remains unchanged; full checks rerun for this fix.

Final validation of the viewport/panel correction: `npm run validate` passed
all gates, including 527 unit/component tests, 251 integration tests, the city
runtime suite and production build. Existing unauthenticated build diagnostics
remain; exit status was successful. The correction is prepared as the second
and final preview build for this iteration.

## 2026-10-29 — Full journey release candidate

Latest owner instruction authorises production after verification. Candidate is
based on c75b576, retaining the newest single-row city controls and mobile/auth
improvements. Public play now hands off to the protected Real Quests route.
Recognised city context survives login. Real Quests uses the shared shell and
actual account prerequisites, current Quest/reflection or active Project. All
fourteen districts offer safe starting ideas, not fabricated assigned Quests.
Native modal saving and cache-safe session redirects are included. No database
migration, learner-data mutation, evidence submission or production release is
claimed. Full repository checks and browser acceptance are pending.

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
