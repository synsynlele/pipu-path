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

## Phase 3 · continuing reviewed builder challenges (first implemented slice)

The first Phase 3 preview is stacked onto the **validated Phase 2 branch**,
not deployed to production. It introduces 12 _authored, reviewed_ service
failure narratives (three per district across four districts). They rotate
through morning, afternoon and evening shift variants to avoid consecutive
repeats. There is **no AI free-form hidden physics** or fabricated engineering.

Progression gate: all 36 decisions and the five tested construction milestones
must be complete before continuing challenges unlock. The scenario is
presented **inside the existing compact City Services desk**, not a new
independent overlay. Players must choose a response before the model selects
an actual vulnerable link from their own working prototype. Their saved
structure remains built while a visible outage occurs. They must tap its
broken connector and pass the same independent network test, then choose
See my city, before their replay round advances. The sole city celebration
now announces the result and leads to the next authored challenge.

The stage's `round` and active choice/cell are small allowlisted values in
the optional device-only practice save; a suspended repair survives reopening.
Existing saves have a safe default. No money, verified XP, real-world
engineering promises, personal data or backend migrations have been added.

The **?** guide has been rewritten for the actual game, with a live next-step
prompt, decide/build/test loop, rotation, blocked cells, repair,
consequences, navigation, pause/resume, device save, sound, music and
continuing challenges. It uses expandable optional controls so the main
instruction is concise on phones.

## Phase 4 · context-aware real Quest handoff (first preview slice)

Branch `preview/game-world-class-phase4` stacks on Phase 3 and makes the
existing Play & build → Real Quests action genuinely contextual. The embedded
city sends only a fixed, allowlisted service ID alongside the already-used
non-identifying district hint. The parent validates the iframe origin/source,
and the Real Quests route resolves one of five reviewed safe starter prompts.
It preselects the matching topic and offers an editable focus; the Builder
must still choose, submit and complete an actual Quest with evidence.
No game answer, identity, evidence, AI prompt or progress is transferred;
no server-side game completion, XP or cloud save is invented.

The public game remains playable without login; the existing Real Quests
account/privacy boundary remains authoritative. A current saved real Quest
is never replaced by a game handoff. The invitation adds no game card,
blocking overlay, backend migration, social contact or commercial incentive.

**Not yet delivered in Phase 4:** signed-in optional cross-device city saves
with owner-scoped RLS and conflict recovery; moderated classroom teams;
student Android acceptance; and a production-verified AI Quest journey.
The existing real-world candidate's database migration and environment
must be verified independently before a production rollout. Stage 3's
unfinished content-diversity gates still apply to this stacked preview.

**Remaining Phase 3 gates:** genuinely new validated topologies and demands,
automated content review/solvability testing beyond the first catalogue,
student testing on low-end Android, moderation and safe AI-authored
proposals only after human approval. A replayable finite template catalogue
must never be described as limitless new, unique AI scenarios.

## Phase 4 continuation · hands-on Real Quests standard

The Real Quests authoring prompt previously required paper plans and fictional
simulations. The new `hands-on-v2` standard requires an actual useful change,
real-world test, feedback and honest evidence. Every generated challenge is
validated before saving, and the versioned goal cache prevents retired
paperwork templates from being selected for new attempts. Existing user history
is not rewritten; older active paper tasks can be set aside without deleting
evidence. All 14 topic starting points and five city handoffs are practical.

Topic and outcome dropdown menus now explicitly request white backgrounds and
dark text in Android native menus. Provider calls are not automatically retried;
existing per-account request limits, template reuse and generation leases remain.
No new backend tables, services or automatic Vercel deployments are required.
Physical Android testing and school-safe multi-user features are still release
gates; no claim of completing the full Phase 4 platform scope.
