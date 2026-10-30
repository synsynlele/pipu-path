# The Unbuilt City — Chapter 4: The Resilient City

Date: 29 October 2026. Status: first playable development slice, preview only.

## Authorised slice

After the seven Chapter 3 operating days, offer Continue to Chapter 4. The
City menu also provides a locked-until-ready entry, then a permanent return.
Use the same player-built city and existing shipment/need indicators. No new
3D assets or per-frame simulation are needed for this slice.

Three consecutive disruptions: heavy rain, an interruption to power, and a hot
market day. Choose care, food or maintenance priorities. Available water and
parts come from the Chapter 3 closing inventory and actual city capacity.
Growers convert delivered water to bounded food production. Every repair uses
one unit each of water and parts. Maintenance prioritises those inputs before
other services; other priorities attempt at most one repair after allocations.
Two completed repairs reduce the next round's outage/food spoilage effect.
Requests remain the same across priorities, so choosing a policy cannot erase
unmet needs. Service capacity and route capacity limit fulfilment.

## Consequences and retention

The shared city renderer shows only calculated Chapter 4 shipments and its
actual served/unmet service requests once a challenge has run. Results expose
water, parts, food, spoilage and storage overflow. All supplies are conserved,
with a maximum of 30 stored units per resource. No monetary rewards, XP,
measured wellbeing, real healthcare or employment claims are made.

Chapter 4 snapshots its starting city capacity and closing Chapter 3 stocks.
It stores only bounded, allowlisted numeric seed fields and up to three stable
priority IDs; results are replayed deterministically. Revisions do not silently
rewrite completed history. Restart only Chapter 4 to apply newer city choices;
this preserves Chapter 3 and all construction decisions. Restarting Chapter 3
also clears the dependent Chapter 4 attempt. Legacy saves load with no Chapter
4 record; invalid new records are discarded without erasing the city.
With existing opt-in device saving, returning reopens the recorded Chapter 4
attempt. No cloud data or personal reflection is stored.

## Clear city view

The immediate construction response replaces the question at the same bottom
corner and uses the same width. Its height is capped and scrollable. The
question stays hidden during construction, followed by the existing outcome
panel in that same location. Narrow portrait and short landscape receive the
same footprint rules as questions.

All city navigation options sit inside one native keyboard-accessible City
menu disclosure. Opening pauses the journey; selecting an action collapses it.
Escape returns focus to the menu; clicking elsewhere closes it. The separate
Pause/Resume journey control stays available. City view retains its own return
control. This is one navigation grammar rather than separate mobile controls.

## Acceptance

- Chapter 4 locked before 36 choices and seven Chapter 3 days.
- Actual UI executes seven operating days, opens Chapter 4 and runs all rounds.
- All 27 policy sequences conserve resources; shortages, repairs and spoilage
  respond to choices; zero service never invents production or deliveries.
- Existing routes/signals agree with Chapter 4 recorded transfers and requests.
- Close/reopen, device save/reload, inspection and restart preserve the city.
- Chapter 1/2 transitions and the existing 108 navigation journeys still work.
- Browser proof checks the dropdown and question/feedback footprint. Physical
  Android/GPU stability still needs device testing; automated tests do not
  establish it.

This is a bounded first Chapter 4, not an unlimited urban simulation. Richer
resident routines, spatial drainage/flood effects and collaboration remain
future work. Expand these only after the current student journey is stable.

## Chapter 4 rescue lab refinement — 30 October 2026 (preview candidate)

Student feedback: the original policy buttons advanced a round immediately,
which felt like selecting an answer rather than solving a crisis. Preserve the
existing 36 build decisions, Chapter 3 enterprise days, 3D city, route
animations, resource conservation and previously saved Chapter 4 plans.

Each unlocked crisis now exposes its actual requests and stock pressure, plus
a small, clear rescue objective. The player may test care, food and repair
priorities before committing. A test is a deterministic, read-only forecast
from the exact existing simulation; it shows delivered/required service
requests, waiting totals, future repair-buffer implications and a trade-off
against the other simulated policies. If all three strategies have the same
effect, disclose the infrastructure bottleneck instead of pretending the
choice matters. Tested options remain in transient UI memory only; closing,
reloading and switching plans never spends supplies or advances the crisis.

Only **Put this plan into action** writes an allowlisted Chapter 4 choice,
updates saved progress, triggers the existing city scene and exposes actual
consequences. The player can continue to the next crisis, inspect delivered
routes in the city, or restart Chapter 4 without losing prior chapters. The
current device save schema is unchanged.

Acceptance:

- First two chapters and Chapter 3 still play exactly as before.
- All 27 completed Chapter 4 sequences conserve resources and restore.
- Each test equals the committed simulation without mutating progress.
- A no-capacity city shows honest bottleneck feedback, not invented success.
- Tests and commit are distinct keyboard- and touch-accessible actions.
- Mobile emergency panel stays scrollable within the existing small footprint.
- Existing completed Chapter 4 histories remain viewable and replayable.
- No cloud account, real wellbeing metric, XP or proof is invented.
