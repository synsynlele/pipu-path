# Simple real-world building — replacement authority

The owner explicitly requests replacing the non-game learner experience. Preserve
the city and saved records. Replace the prerequisite-heavy learner journey with
one repeatable loop: choose a useful problem → one achievable Quest → act → private
evidence → honest reflection → improve or choose another Quest. The older
Mission/Journey/Profile engine remains available as previous work; it no longer
blocks this new loop. This is explicit product authority for that separation.

## Contract

- Account setup and existing private-learning authorization remain. No Discovery,
  generated profile, Mission or Journey prerequisite for new Quests.
- Ask only topic and time. AI receives allowlisted generic parameters and public
  challenge titles, never identity, account IDs, answers, photos or reflections.
  This is template authoring, not private learner interpretation. Explain it.
- Reuse validated AI templates across learners. A learner's attempts and evidence
  remain private and independently owned. Cache is not evidence or achievement.
- One current attempt, explicit save, resumable evidence and reflection, revision
  conflict protection, no completion until evidence and reflection are saved.
- Honest failed attempts count as recorded attempts, never verified capability,
  XP, successful deployment or proof of impact. No automatic awards.
- After recording an attempt, improve it or choose a fresh challenge. No terminal
  level or forced restart, and no unbounded provider calls.
- Show AI failure and a usable retry. Never label authored fallback as generated.
- Keep older work reachable in a secondary section. Do not purge student records.
- Any production release requires the additive migration, ownership/transition
  tests, full validation and live configuration checks. Database access is a real
  gate, not a reason to substitute another connected school's database.

## 30 October 2026 — Branded navigation and progressive difficulty

- Restore the existing PipuPath brand mark in the new Real Quests header. Use
  consistent three-tab iconography and readable blue/gold active navigation
  across the simple build shell and the shared application shell.
- Complexity progresses from level 1 to 5 **per chosen topic**. Level 1 uses
  one simple prototype and familiar tester; later levels introduce alternatives,
  constraints, measured comparisons, stakeholder trade-offs and connected
  systems. All levels remain low-risk, no-cost, time-bounded and age-safe.
- A server-only database function calculates the next level from **recorded,
  self-reported practice**: worked = 2 practice points, partly = 1, not yet = 0.
  Levels unlock at 2, 6, 12 and 20 points. Failure remains a valid recorded
  attempt and does not force premature escalation. This is practice-based
  challenge selection, **not** independently verified mastery.
- The AI receives only allowlisted topic, minutes, anonymous difficulty tier,
  public challenge design and prior public template titles. Never include a
  learner's identity, private evidence, reflections or other personal prose.
- Cache/reuse challenge templates by topic, minutes and difficulty. Preserve
  the one-current-attempt rule, former learner records and the original
  difficulty of a retry/improvement attempt. New Quests read the current level.
- Release via an additive migration and protected branch. Migration, API
  grants, privacy, current-attempt handling, persistence and mobile navigation
  require validation before production deployment.

## Goal-specific real-life Quests (30 October refinement)

The learner chooses a broad improvement area **and** writes a short practical
goal. The app must disclose that the voluntary goal text is sent to AI to
tailor the Quest. The app rejects obvious contact information and sensitive
disclosures and never sends account IDs, private answers, photos or reflections.
The goal remains private in its owner's attempt row. A reusable public-template
row stores only a normalized goal fingerprint, not the original goal text.
Authenticated clients cannot read template rows directly.

Even the first Quest has to require observing a real problem, comparing two
approaches, testing a safe small solution and describing an observable result.
Difficulty rises for new Quests in that topic as actual new attempts are
recorded. All outcomes count as honest practice (1 point); reported success
adds one bonus point. Levels unlock at 3, 7, 13 and 21 practice points. These
are challenge tiers, not proof of mastery. Reworking a past Quest does not
farm higher-level access. Templates are shared only when topic, minutes,
difficulty and normalized goal fingerprint all match.
