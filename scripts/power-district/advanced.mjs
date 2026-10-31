import assert from "node:assert/strict";
import {
  ADVANCED_CHAPTERS,
  newAdvanced,
  sanitizeAdvanced,
  advancedMission,
  advancedRules,
  testAdvanced,
  deployAdvanced,
  advancedUpgrades,
  advancedCityActivity,
  advancedPerformance,
} from "../../public/games/city/advanced.mjs";
import {
  ALL_ADVANCED_MISSIONS,
  SAMPLE_SOLUTIONS,
  newPlan,
  validPlanShape,
} from "../../public/games/city/advanced-challenges.mjs";
import {
  newAdvanced as legacyNew,
  deployAdvanced as legacyDeploy,
  advancedMission as legacyMission,
  advancedRules as legacyRules,
} from "../../public/games/city/advanced-legacy.mjs";
import {
  sanitizePractice,
  savePractice,
  loadPractice,
} from "../../public/games/city/practice-save.mjs";
import { initialPlan } from "../../public/games/city/model.mjs";
assert.deepEqual(
  ADVANCED_CHAPTERS.map((c) => c.number),
  [5, 6, 7, 8, 9, 10, 11, 12],
);
assert.equal(ALL_ADVANCED_MISSIONS.length, 16);
assert.equal(
  new Set(ALL_ADVANCED_MISSIONS.map((m) => m.kind)).size,
  16,
  "Every higher mission must require a genuinely distinct player action",
);
assert(
  !ALL_ADVANCED_MISSIONS.some((m) => ["network", "allocate"].includes(m.kind)),
  "No cloned link-switch or water allocation scenarios",
);
for (const capacity of [0, 5, 10]) {
  let state = newAdvanced({ seed: { capacity: { water: capacity } } });
  for (let i = 0; i < 16; i++) {
    const before = JSON.stringify(state),
      m = advancedMission(state),
      plan = SAMPLE_SOLUTIONS[m.id];
    assert.equal(m.index, i);
    assert(validPlanShape(m, plan), "Valid solved plan for " + m.id);
    assert.equal(advancedRules(state).kind, m.kind);
    const result = testAdvanced(state, plan);
    assert.equal(result.ok, true, m.id + ": " + result.message);
    assert(
      result.score >= 75,
      "Solved tasks award strong but not automatic perfect scores",
    );
    assert.equal(
      deployAdvanced(state, newPlan(m)),
      null,
      "Empty plan cannot advance " + m.id,
    );
    assert.equal(JSON.stringify(state), before, "Testing cannot mutate state");
    state = deployAdvanced(state, plan);
    assert.equal(state.records.length, i + 1);
    assert.deepEqual(
      sanitizeAdvanced({ ...state, privateText: "discard" }),
      state,
    );
    const activity = advancedCityActivity(
      {
        day: 7,
        last: {
          requests: { clinic: { requested: 5, served: 3 } },
          shipments: [],
        },
      },
      null,
      state,
    );
    assert(activity.upgrades[m.district] > 0);
    assert.deepEqual(
      activity.last.requests,
      { clinic: { requested: 5, served: 3 } },
      "Planning and leadership tasks must not fabricate restored water shipments",
    );
    assert(activity.last.shipments.length === 0);
    assert(
      Object.values(advancedUpgrades(state)).every((n) => n >= 0 && n <= 16),
    );
  }
  assert.equal(advancedMission(state), null);
  assert.equal(deployAdvanced(state, []), null);
  assert.equal(state.records.length, 16);
  assert(advancedPerformance(state, 12) >= 75);
  assert.equal(
    sanitizeAdvanced({ ...state, records: [...state.records, {}] }),
    null,
  );
  const bad = structuredClone(state);
  bad.records[0].plan = [0, 0, 0, 0];
  assert.equal(sanitizeAdvanced(bad), null);
}
const partial = {
  ...newAdvanced(),
  cursor: { phase: "configure", plan: [0, 1] },
};
assert.deepEqual(
  sanitizeAdvanced(partial).cursor.plan,
  [0, 1],
  "Order-in-progress must survive pause",
);
const pathStage = {
  version: 2,
  seed: 0,
  records: [
    { plan: [0, 1, 2, 3], score: 95 },
    { plan: [1, 0, 1, 1, 0], score: 95 },
    { plan: [1, 0, 1, 0, 1, 0, 0, 0, 0], score: 95 },
  ],
  cursor: { phase: "configure", plan: [0, 4, 8] },
};
assert.deepEqual(
  sanitizeAdvanced(pathStage).cursor.plan,
  [0, 4, 8],
  "Partial route persists",
);
assert.equal(
  sanitizeAdvanced({
    version: 2,
    records: [{ plan: [0, 1, 2, 3] }],
    cursor: {},
  })?.version,
  2,
);
const old = newAdvanced();
assert.equal(old.version, 2);
for (const at of [0, 1, 5, 10, 16]) {
  let historic = legacyNew({ seed: { capacity: { water: 5 } } });
  for (let i = 0; i < at; i++) {
    const mission = legacyMission(historic),
      rules = legacyRules(historic);
    const plan =
      mission.kind === "allocate"
        ? [...rules.minimum]
        : rules.redundant
          ? [1, 1, 1, 1, 0]
          : [1, 1, 0, 0, 0];
    historic = legacyDeploy(historic, plan);
    assert(historic);
  }
  const migrated = sanitizeAdvanced(historic);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.records.length, at);
  assert(migrated.records.every((r) => Array.isArray(r.legacyPlan)));
  assert.equal(advancedMission(migrated)?.index, at === 16 ? undefined : at);
  assert.deepEqual(sanitizeAdvanced(migrated), migrated);
  if (at < 16) {
    const updated = deployAdvanced(
      migrated,
      SAMPLE_SOLUTIONS[advancedMission(migrated).id],
    );
    assert.equal(
      updated.records.length,
      at + 1,
      "Old progress continues with new mechanics",
    );
  }
}
const base = {
  day: 1,
  cash: 18,
  config: initialPlan(),
  owned: initialPlan(),
  seen: [],
  history: [],
  decisions: {},
};
assert.equal(sanitizePractice(base).advanced, null);
const storage = {
  value: null,
  setItem(k, v) {
    this.value = v;
  },
  getItem() {
    return this.value;
  },
  removeItem() {
    this.value = null;
  },
};
assert(savePractice(base, storage));
assert.equal(loadPractice(storage).advanced, null);
console.log(
  "PASS: sixteen unique mechanics, nontrivial plans, impact without invented shipments, partial resume, legacy migration, old-save compatibility.",
);
