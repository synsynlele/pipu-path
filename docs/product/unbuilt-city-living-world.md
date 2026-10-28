# Unbuilt City — Living & Beautiful City, visual simulation v1

Date: 28 October 2026. Development preview.

## Experience

Students make the same 36 authored decisions and own the same one
city. The growing 14-district city becomes an inviting place worth
visiting. Courtyard trees, flowers, warm seating and small lamps
bring visual identity to each neighbourhood. Only completed
construction makes the gathering spaces glow and attracts people.

The full-city aerial mode shows the same structures and residents.
When two districts depend on one another _and both have buildings_,
small stylised delivery vehicles may move between road intersections:

- transport to food, water to healthcare, manufacturing to repair;
- business to housing, creative work to business and
  education to manufacturing.

These are deliberately simplified, authored demonstration routes,
never claims about real businesses or economic conditions.
District condition controls whether a delivery is relatively fast,
careful or slow. Revising a choice can change its service state
and activity without adding or removing unrelated structures.

## Engineering guardrails

- The underlying builder cases, answer review, game flow, optional
  same-device save and backend contracts remain unchanged.
- Delivery paths use the existing north–south/east–west road lattice.
  No diagonal shortcuts through structures; decorative meshes are
  explicitly ignored by player navigation.
- Canvas movement is visual only; no collision physics or autonomous
  vehicle AI is claimed.
- Static, low-poly props use existing shared materials and no added
  downloads. Low-power phones show fewer pedestrians and vehicles.
- Reduced-motion settings preserve the scene without animation.
- Existing aerial city inspection, compact choice cards, automatic
  guided play and read-only city dashboards stay accessible.

## Acceptance tests

1. Brand-new city: landscaped public areas exist, but workers and
   deliveries do not falsely appear at unbuilt services.
2. Finish several choices: see people near completed areas and
   the first qualified inter-district delivery.
3. View My City: see the planted courtyards and moving activity,
   then Return restores the existing journey checkpoint.
4. Revise any decision: affected district changes without erasing
   the saved buildings. Connected route pace can change.
5. Simulate reduced motion and weaker devices: no user-blocking
   jank, runaway memory or overlapping touch controls.
6. Test Android and tablet portrait/landscape and the software
   renderer, especially long sessions and zoomed-out aerial mode.

## Future work

Chapter 3 needs functioning enterprises, jobs, production,
customer demand and two-way goods/finance mechanics. Chapter 4
needs an actual evolving city simulation with agents, growth
pressure, maintenance and stewardship. Neither exists merely
because these scenic elements now move.
