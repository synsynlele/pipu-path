# The Unbuilt City: one connected world

## 28 October — lived-in streets, characters and disappearing instructions

This isolated candidate adds material-based masonry, pitched roofs with windows and doors, road markings, street lighting, seats, dressed characters with faces and arm animation, and shop/workshop details. Materials reuse a small procedural texture set, and WebGL pixel density is capped to protect low-end Android devices. This is a detailed lightweight 3D scene, **not** a photorealistic asset pipeline, crowd simulation or verified device performance claim.

Guidance is present only at the start or when Next step is opened. After travelling, selecting a map view or testing, the task panel collapses without deleting progression. The advanced construction dock is opt-in through Build and collapses on travel. During the city-day simulation, all overlays except a compact live status indicator are hidden; once it finishes, the result panel explains consequences and users can reopen the guide. A phone retains tap-to-move; the arrow pad appears only in explicit free exploration.

The underlying two-day city model, investment costs, existing PipuPath Quest ownership, progress provenance, safeguarding and backend are unchanged. Build/test regression and independent physical Android testing are still required. The next major visual leap should use versioned, legally cleared optimized GLB assets with performance budgets rather than adding unbounded meshes to each district.

## 28 October — public-browser smoke check

The preview opened the intro screen and displayed the expected opening copy.
The browser check did not complete entering the city, travelling to Ama or
testing map controls; those interactions remain unverified and are not
claimed as passed. Device WebGL and phone layout remain pending.

## 28 October — guided opening and larger districts (isolated preview candidate)

The user reported that the previous city was too small, packed and confusing.
This candidate keeps workshop, power, market, learning and city desk in the
same simulated economy. It expands the ground from 23 × 18 to 52 × 44 world
units and relocates the school district and market with corresponding
characters, labels, arrival points and obstacles. Streets, trees, future
plots and outlying buildings occupy the new space. A camera map toggle lets
players see the larger neighbourhood; normal camera movement follows the
walking character. Click-to-move, routing around obstacles and manual
movement use the same navigator with explicit expanded bounds.

First-time players now receive exactly one next destination: meet Ama,
then inspect power, the market, learning and the city desk. A single
"Take me there" action walks automatically. Construction controls stay
hidden during this guided introduction; "Explore freely" restores the
existing advanced city planning interface without deleting it. Smaller
screens put the task card at the bottom, keep the view uncluttered and make
the map and free-explore controls accessible. Game title is only
"The Unbuilt City", not a second PipuPath wordmark.

This does **not** change the fictional economy, Quest persistence,
safeguarding, XP, evidence or Supabase schema. The guide is derived from
this session's station visits; it is not durable user progress. Mobile
walkability, runtime WebGL fallback, accessible tap targets and pilot
comprehension remain acceptance gates; no production release is claimed.
The founder need not intervene to route each player; the same template can
guide later districts after user validation.

Authority: 28 October 2026. The owner rejected duplicate PipuPath branding inside
the game, requested app/game colour integration and asked for all building and
solutions to happen in the same city rather than separate challenge scenes.

## First connected neighbourhood

The workshop, power station, market, cooling building, collection vehicle and
learning pavilion now occupy one navigable 3D world. The same avatar walks between
places. District panels operate on one plan, fund, four-period power system and
operating-day ledger. The city remains built after a day is adopted. There is no
teleport to a separate mission or separate district wallet.

The first two operating days share a persistent in-session city. Day 1 introduces
power timing, food-loss causes, supplier payments and fictional learning examples.
Day 2 simultaneously reduces generation, delays collection and delays buyer
settlement. Cooling adds a midday power unit; market receipts fund the next city
investment; small suppliers need payment today; the evening club depends on the
service allocation. Learning support requires an equal-parts diagnosis, an oral
and visual activity and an independent rotated-whole example, plus its teaching
kit and the shared service plan.

This is a bounded prototype of two operating days, not an unlimited economy,
procedural city-builder, validated pedagogy or city-management forecast. Timings,
energy units, credit prices, storage windows and contracts are fictional. Food
safety cannot be inferred from these rules. No income promise is made.

## Model and state boundaries

The pure city model evaluates installed assets, recurring costs, usable crates,
served demand, cash at each payment time and learning choices. Multiple day-1 food
solutions and two day-2 payment agreements are tested. Failed rehearsals spend
nothing. Adopting a passed day commits the calculated fund and installed plan to
this session, advances the clock once and records the evaluated result. A stale
result cannot be adopted after editing; a completed day cannot pay out twice.
Payment agreements explicitly identify who consents, who is paid today and who
waits. Shared service deferral is a fictional authored agreement, not automatic
real-world credit access.

All city state and reflection stay in memory in the active game document. Reload
or leaving starts a fresh city; no cloud persistence is claimed. The existing
owned Quest return is preserved. Practice creates no verified XP, evidence,
capability or learner-outcome claim. Reflection is length-checked only.

## Identity and scale

The app shell keeps its existing PipuPath identity. The game uses only a text
wordmark, The Unbuilt City, with no alternate P logo or PipuPath name inside the
canvas document. Navy, blue, gold and light instrument surfaces come from the
app's established colour family; landscape colours remain natural. Shared
navigation, software renderer, Three.js distribution and city theme are extracted
under games/shared rather than copied per district.

The next districts should extend this city model and scene with bounded resource
rules and observed learner feedback. Content authors own district briefs and
fictional evidence; engineering owns the shared model and interactions; QA owns
solvability, ledger integrity, routes, contrast, device performance and regressions.
The founder sets direction rather than approves individual routes or attempts.
Each shared improvement should benefit every future district. Do not mass-produce
100 worlds before observing whether the first connected one teaches useful
judgement and is enjoyable to navigate.

## Verification

Pure tests cover shared cooling load, intake losses, payment timing, learning
prerequisites, capital guards, retained assets, alternate plans, both agreements,
stale results and duplicate adoption. Existing energy/navigation checks remain.
App tests cover one world entry, same-origin frame scope, owned Quest return and
focus recovery. Exact-preview browser, hardware WebGL and physical-phone evidence
must be reported separately from source/model checks.
