# Connected neighbourhood — first story slice

Authority: 27 October 2026. User approved taking life-simulation inspiration from
Lagos Life: a personal character, connected places, recurring people, consequential
choices and a story that can continue. This implementation uses original code and
PipuPath's existing assets and account. It does not integrate with or copy Lagos
Life's assets, SDK, code or branding.

## Delivered behaviour

`/build/neighbourhood` is an authenticated route in the existing Build AppShell.
Adventure Hub and the shared Home/Build/Journey/Quest card expose it. The existing
six-world catalogue remains available. Sign-in can return to this exact route.
The server reads the current user's real Quest and supplies its continuation;
the game cannot submit evidence or change progress.

A movable character explores one neighbourhood. Ground taps and focused-map arrow
keys change position. Named map buttons are keyboard-accessible travel/talk points.
Jacket colour and invitation motif are player choices, not inferred talent.

Three encounters form a fixed opening story:

1. Ada: turn a wayfinding sign and test where it sends a visitor; choose a music,
   art or food invitation motif. Completing it adds a sign to the shared map.
2. Timi: place roof tiles, supports and a counter on a stall assembly board. The
   invitation choice appears in his dialogue and the completed stall's map icon.
3. Mama Jo: plan a connected supply route that collects supplies and reaches the
   market while avoiding a closed bridge, with an eight-move ceiling. Completed
   delivery lights the square for opening night.

Neighbours remember completed encounters within the current/restored game state.
They direct the player to the next neighbour. This is authored fictional dialogue,
not AI, human multiplayer or an inference about real relationships. The opening
puzzles teach the controls; they are not a claim of deep life simulation yet.
The route board animates the selected path, not a physical traffic simulation.

## Save contract

Device saving is optional and off initially. The user opts in to store a bounded,
versioned record in this browser's localStorage under an authenticated-user-scoped
key. It includes only avatar colour, position, encounter IDs, invitation motif,
sign orientation, tile placement and route node IDs. No profile, proof, reflection
or real Quest narrative is stored. Every subsequent game change saves while opted
in. The Resume button loads only that user's compatible, internally consistent
save. Corrupt data or unavailable storage leaves the current game playable.
Opting out removes that save. Browser clearing removes it. No cloud save or
cross-device continuation is claimed. This is a client-editable practice save,
never a credential or authoritative achievement record.

## Safety, accessibility and performance

No random paid items, timers, lives, strangers, transactions or real-world
instructions are required. Real action uses the existing Quest safety/evidence
workflow. Main controls have text names, focus states, keyboard alternatives and
44-pixel targets; map animations respect reduced motion. One existing optimised
WebP and small SVG/CSS objects are reused; no 3D engine or additional dependency.

## Reuse and ownership

The bounded movement, assembly and route evaluators are independent domain code.
An episode editor can author subsequent connected stories; engineering extends
interaction types, and QA owns solvability, accessibility, save recovery and mobile
checks. The founder is not the default encounter author or learner approver.
A larger character/world inventory, branching careers, NPC schedules, cloud saves,
multiplayer and new verified progression rules are outside this slice.

## Verification

Domain tests cover sequential unlocks, idempotent completion, stall validity,
closed-link/collection/move constraints and corrupt/inconsistent saves. Component
tests complete the three encounters, preserve the real Quest destination, verify
opt-in save/resume/opt-out and storage failure recovery. Full repository validation
and an exact deployed-preview walkthrough must be recorded independently.
