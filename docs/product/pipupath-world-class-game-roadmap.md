# PipuPath 2.0 · Four-phase game programme

**Status:** Phase 1 preview candidate, 30 October 2026. The other phases below
are scoped commitments, not released features.

## Coverage of ten improvements

| Improvement                     | Phase | Release definition                                                                       |
| ------------------------------- | ----- | ---------------------------------------------------------------------------------------- |
| 1. Hands-on building            | 1, 2  | Two new playable worksite prototypes now; city-connected build mechanics next            |
| 2. Visible consequences         | 2     | Direct projects change service state and visuals using verified rules                    |
| 3. Excellent first five minutes | 1     | First useful action is obvious; existing guided journey and optional hands-on invitation |
| 4. Reliable saving              | 1, 4  | Preserve safe device saves; optional authorized cross-device saves later                 |
| 5. Adaptive difficulty          | 2     | Difficulty changes with demonstrated tests and repairs, not taps                         |
| 6. Continuing challenges        | 3     | Reviewed, validated, replayable scenario catalogue                                       |
| 7. Meaningful progression       | 2, 3  | Repairs, systems served, improvements and truthful prototype evidence                    |
| 8. Real Quest handoff           | 4     | Contextual in-game problem inspires practical AI Real Quest                              |
| 9. Accessible performance       | 1–3   | Android low-end play, readable interface, keyboard and reduced-motion/2D alternative     |
| 10. Safe team challenges        | 4     | Supervised collaboration, no public stranger chat                                        |

## Phase 1 · implemented for preview

- The existing single city, 36 decisions, Chapter 3 and Chapter 4 remain unchanged.
- Five deterministic optional Build Lab missions, including two newly authored
  safe, solvable networks: clinic-power and shared-recovery.
- The first workshop outcomes offer a voluntary hands-on worksite shortcut;
  unmodified automatic journey continues if ignored.
- A successful board is labelled a **prototype**, never an actual upgrade to
  city services, verified XP or real-world evidence.
- Optional numerical local counts (starts, first action, decisions, retries,
  test success and revisions) accessible under Help; never sent to a server,
  saved as analytics, or associated with a name or device ID.
- No backend migrations, cookies, profile information or user-data rewriting.

## Phase 1 · remaining acceptance

Physical Android 360–428px, low-power testing; first-run player comprehension;
save/close/restart; screen reader and keyboard audit; and review of
first-action duration and retained learning. Current numeric targets are
hypotheses, not measured PipuPath outcomes.

## Phase 2 · direct city systems

Convert the prototype engine into authored, versioned repair/placement work
in the actual world. Changes to the city simulation must have genuine
resource consequences; keep old plans compatible and safely restorable.
Tie increasingly difficult constraints to attempts, tests and revisions.

## Phase 3 · replayable engine

Approved templates for adaptive demand, disruptions, repairs and resources,
with solvability, safety, resource conservation and anti-repetition tests.
AI may author proposals for review but may not fabricate hidden physics.

## Phase 4 · platform scale

Optional RLS-authorized cross-device progress for signed-in users, safe
multi-school collaboration with human moderation and child privacy controls,
and contextual transition from in-game interests to real life evidence-backed
Quests. Real actions alone earn verified development progress.

## Architecture guardrails

One game and one evolving simulation, not one app per level or district.
No mandatory signup just to play; no forced tutorial; no monetization gimmicks.
Founder-independent engine: approved scenarios, automatic validation, anonymized
pilot feedback, teacher review, release quality gates and rollback.

## Corrective first-entry experience (30 October 2026)

User validation identified a fundamental implementation error: the Play
button still entered the 36 multiple-choice campaign. Optional Build Lab
links appearing after a decision cannot satisfy "build before answering".

The first Play action now starts inside the existing 3D city with an
immediately editable workshop-supply network puzzle. Learners place,
rotate, test, revise and inspect a visibly illuminated **prototype**
connection in their city. The label must clearly distinguish a
successful prototype from an actual change to city services, XP,
progress or real-world evidence. A compact post-test control allows a
harder hands-on challenge; the legacy authored story opens only by an
explicit choice. Returning players with local saved practice can resume
the original journey directly. The old 36-choice, seven-day enterprise,
Chapter 4 crises and saved-game structure remain unchanged.

Regression gate: the first real Play click produces _zero answer-choice
buttons_, successful UI-built networks illuminate the prototype layer,
and the original story remains fully playable without data loss.

## Phase 1 continuation · chosen question/puzzle formats and compact worksite

Questions teach priorities, empathy, resource trade-offs and decisions. Puzzles
teach physical implementation, resilience and testing. The 36 authored case
texts remain available; five _specific_ decisions launch one relevant
hands-on construction if the player is on the new integrated adventure path.
A completed puzzle now installs an identifiable piece of fictional 3D city
infrastructure only while its network stays solvable. A short, celebratory
city reveal happens after the worksite closes. Other city-simulation metrics,
real-world evidence and XP remain unchanged. The story-only resume path remains
available for older players, as does nonmandatory access to all puzzles.

Mobile workspace: at most 60% of the viewport height, anchored at the bottom;
5x5 board and its controls scroll internally, city remains visible above,
backdrop is light, no artificial fullscreen cover. Low-end device and real
mobile checks remain conditions of production approval.


## Phase 2 · first playable service-consequence and repair slice

New work is on the separate stacked `preview/game-world-class-phase2` branch,
not on production. The production-safe architecture keeps all 36 questions,
five built puzzle milestones, existing save versions, and all Chapter 3–4
mechanics unchanged.

1. Five real constructed districts each have a deterministic, fictional
   per-day service request load. Only a successfully tested built solution
   serves its endpoints. Totals describe simulation capacity, not actual
   people served or school learner grades.
2. A compact in-city **City services** monitor focuses each facility and
   displays before/after requests. The player can initiate a bounded
   single-link failure drill. A tested facility remains physically built,
   but its status light turns amber and it serves fewer simulated requests.
3. The same compact 5×5 Build Lab highlights the failed connector. The
   player taps the damaged piece to repair, and then must successfully
   retest to restore service and see the celebration in the 3D city.
   A resilient two-route system can withstand a single break.
4. A deterministic recommendation engine uses actual certified builds,
   tests, retries and requested hints to recommend a gentler next challenge
   or a harder authored mission. The player retains full choice; no
   age restrictions, punitive scores or unverifiable XP.
5. All saved simulation inputs are bounded and allowlisted, remain
   optional on-device, and never call an AI model for city physics.

This completes the **first vertical slice of Phase 2**, not the entire
phase: further district interactions, citywide resident behaviour,
advanced challenge tiers, a device-performance pilot and accessibility
verification remain future gates. Neither an automated integration test
nor a successful Vercel build proves performance on student Android devices.
