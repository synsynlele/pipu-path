# The Unbuilt City — choice-linked consequences

This release makes prior decisions inspectable in the same 3D plots.
It changes **presentation**, not game progression, Quests, scoring, or saved schema.

- All 108 authored choice contracts are read from \`construction-plans.mjs\`.
- Working outcomes show no problem marker.
- Limited plans get an amber, bounded-service signal; no invented hazards.
- Failed outcomes show thematic signals only where supported by the selected
  plan's authored asset (waste, flood, incomplete work, safety or access).
- No-build outcomes get a small unmet-service marker, not a fake building.
- The markers follow the actual 36 case locations, use cached primitive geometry
  and shared materials, ignore avatar collisions, and are culled away from the
  player on mobile. They reconstruct from the current decision IDs.
- In **View My City**, inspect a district, select an unresolved consequence,
  and revise the underlying decision. Returning to the journey retains the
  previous position and chapter.
- Selecting a working revision clears that case's marker. Other problems remain
  until their own decisions are revised.
- Existing links between district services are recalculated by \`city-growth.mjs\`;
  no speculative city-wide physical damage is invented.

Quality gate: \`node scripts/power-district/consequences.mjs\` checks all 108
contracts, revisions, distant culling, aerial inspection and save restoration.
The normal full GitHub CI validates formatting, TypeScript, tests, integration
and build. Browser and real Android visual/performance testing remain distinct
from headless geometry tests.
