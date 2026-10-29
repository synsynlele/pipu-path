# Visible decision feedback: learner-driven iteration

Date: 28 October 2026. Status: development-preview candidate.

## Feedback

KNS learners report:

1. The line drawn during walking is distracting.
2. Choosing a decision only shows more text. Nothing apparently happens
   in the city, making the experience feel less like a game.

## What this iteration implements

- Remove the navigation route mesh and curve. Point-and-go navigation,
  avatar movement, obstacles and the destination marker remain.
- On **every** case option, briefly clear the panels and zoom/focus the
  actual 3D site. Build or alter a thematic model (repair queue, inventory
  shelf, training bench, recycling collection, batteries, maintenance,
  clinic backup, demand meter, harvest crates, payment desk, sorting,
  delivery route, fraction board, learning lights, accessible supplies,
  feedback board). Buildings rise into place, lightweight sparks scatter,
  and nearby characters react. Respect reduced-motion preferences.
- Restore a concrete cause/effect/trade-off explanation after the visual
  beat. Add Watch the city change and Try another controls.
- Do **not** silently commit preview decisions. Close/retry reverts
  unkept objects. Keep this approach persists the selected fictional
  object and its case choice; optional browser-only save works as before.
- Use neutral, positive or warning visual tones according to authored
  four-signal scenario impact. A poor decision is not a no-op.

## Guardrails

These constructions are simplified representations of scenario responses,
not new economy mechanics. The two-day power and food evaluation remains
authoritative for that simulation, and no choice issues verifiable XP or
claims a real-world solution is approved. A case interaction should never
promote unsafe electrical, damaged-food or waste handling.

## Verify before rollout

Regression: all 16 build sites and all 48 options produce a scene change;
no line mesh is drawn; replay and abort/retry work; existing 14 districts,
auto-walk and economy still function; phone controls remain legible; device
saving only follows user opt-in. Observe actual students to measure whether
they notice the 3D change, can interpret the consequence, and voluntarily
try more than one option. Rendering failure on low-end Android must degrade
gracefully without breaking case selection.
