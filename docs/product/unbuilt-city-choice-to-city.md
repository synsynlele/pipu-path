# Choice-to-City v1 — first integrated builder-city contract

Date: 28 October 2026 · Status: development preview · Not production

## Purpose

Every fictional decision must be reflected in the city a player has
built. The same empty four-district core can turn into a coordinated
service city, a crowded overbuilt city, or a struggling underused city,
depending on choice. This is not another success/failure quiz: every
option alters a physical structure, with visible compromises.

## Behaviour

- **16 sites × 3 options = 48 structural states.** Each case keeps its
  authored functional props, and adds a distinct built architecture
  selected by its choice ID. The coordinated option produces a staffed,
  sheltered facility; the second produces crowded/overbuilt structures;
  the third produces underused or incomplete infrastructure. Props,
  silhouettes, equipment and resident activity change, not only colour.
- When a player changes an earlier choice, the previous structure is
  replaced (not stacked). A construction animation plays, and the
  change remains visible in that session and on returning to the same
  browser after the player opts into local saving.
- Four district civic sites display service condition through building
  development and activity of small workers. These use a fictional
  deterministic model derived from all currently chosen case options.
- Power has effects on Food, Learning and Repair; Repair helps Power
  and Food; Learning helps Repair; Food helps Repair and Learning.
  The `My City` panel shows how completed choices and connected
  influences contribute to its current fictional operating profile.
- The automatic problem-to-problem journey and the balanced shuffled
  answer positions remain unchanged; the player only chooses.

## State and privacy

`deriveBuilderCity(decisions)` is pure and versionable. The existing
optional browser save records the allowlisted `decisions` keys and
the original day/economy state. Physical geometry, service meters and
district residents are reconstructed from those validated IDs at
start or reload; **no additional stored identifiers, location,
personal reflections, uploads or tracking**. There is no cloud sync.

## Reality boundary

These service bars are simplified fictional heuristics for learning
interdependence; not empirical predictions or professional advice.
Changing a case choice does NOT silently change the earlier
two-day energy/cash evaluation, nor award verifiable Quest XP, nor
activate the ten additional district economic models. This is an
initial, reproducible choice-to-world engine; deeper economic
simulation coupling requires a separately tested integrated
simulation contract and calibration.

## Release gates

- All 16 sites show three unique, stable architectural variants.
- A revision replaces the prior variant, updates district service
  and relevant connected districts, and survives a save/reload.
- Same decisions always rebuild the same city.
- No new permissions or personal-data storage are introduced.
- Android WebGL and software fallback visual, motion-reduction,
  automatic navigation, load-time, frame-rate and screen layout
  must be tested on physical devices.
- Obtain real comprehension/engagement evidence from consented
  learners before production.
