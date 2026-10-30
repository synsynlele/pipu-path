# Hands-on city building

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
