# Unbuilt City — fourteen-district experience contract

Status: preview candidate, 28 October 2026. All places belong to one navigable
city. No separate game, account system, currency or Quest progression is created.

## What exists
- Four **playable** districts share the existing two-day service/cash/learning
  simulation: Repair & Maintenance, Power & Energy, Agriculture & Food, and
  Education & Skills. Repair and Power intentionally share the original
  repair/electricity panel, rather than claiming independent advanced missions.
- Ten **explorable** district landmarks: Housing & Construction; Water &
  Sanitation; Healthcare; Transport & Logistics; Technology & Innovation;
  Business & Finance; Environment & Climate; Community & Governance; Creative
  Economy; Industry & Manufacturing. Each contains buildings, props, a guide
  character and an authored example problem. Dedicated gameplay is not yet
  implemented; the interaction says this plainly.
- A Places (14) directory lists active and explorable areas. Selecting a place
  routes the avatar there automatically; collision-safe movement shares a
  single 3D world. Labels appear when near, not everywhere. City map gives a
  city-wide overview. Guidance and construction remain collapsible.

## Next vertical slices, in order
1. Prove a phone can enter, reach all fourteen areas without clipping or
   freezing, and still run the original two evaluated operating days.
2. Add reusable versioned problem, solution, simulation and consequence
   contracts rather than handwritten mission panels per district.
3. Make the four active districts deep enough for a consented engagement pilot
   (target 12–20 meaningful scenarios); observe comprehension, voluntary return,
   retries and transfer to safe real-world questions. Until then, the current
   two-day city must be described as a prototype, not a complete test game.
4. Introduce durable per-account city state only with an explicit privacy,
   retention, authorization, recovery and minor-safeguarding design. Existing
   session-only practice must not be presented as persistent cloud state.
5. Activate additional district simulation models only after this shared
   architecture is tested. Prefer reusable, licensed low-poly/LOD 3D assets
   over adding unbounded meshes that overwhelm affordable Android devices.

## Truth & safeguarding
The city economy, time, energy, crate, cash and agreements are fictional
learning rules. Real-world decisions require relevant expertise. Reading a
district brief or winning a fictional test does not award XP, verify a skill or
alter an actual Quest. The app's authenticated Quest/evidence controls remain
the authority. Players can explore all fourteen places but only four provide
the existing shared playable service systems.

## Test gates
- CI: formatting, lint, TypeScript, city/navigation/model regressions,
  unit/integration tests and Next.js build.
- Browser: first step to Ama; full city map, Places directory, all ten future
  briefs, obstacle avoidance, simulation panels disappearing during run,
  mobile portrait safe areas, keyboard and screen-reader labels.
- Field: Android phone thermal/load stability; scene performance, voluntary
  engagement, comprehension, return intent, independent problem-solving.
- No production promotion until evidence is recorded.
