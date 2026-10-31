import assert from "node:assert/strict";
import {
  ADVANCED_CHAPTERS,
  newAdvanced,
  sanitizeAdvanced,
  advancedMission,
  initialAdvancedPlan,
  testAdvanced,
  deployAdvanced,
  advancedCityActivity,
} from "../../public/games/city/advanced.mjs";
import {
  newAdvanced as legacyNew,
  deployAdvanced as legacyDeploy,
} from "../../public/games/city/advanced-legacy.mjs";
import {
  sanitizePractice,
  savePractice,
  loadPractice,
} from "../../public/games/city/practice-save.mjs";
import { initialPlan } from "../../public/games/city/model.mjs";

const passing = [
  [1, 0, 1, 0, 0],
  [1, 2, 3, 0],
  [1, 4],
  [0, 1, 2, 3],
  [0, 1, 2],
  [5, 3, 3],
  [1, 1, 1, 0, 0, 0],
  [4, 5],
  [0, 1, 2, 0, 1],
  [2, 3, 2, 1],
  [1, 1, 1, 0, 0, 0],
  [1, 0, 2],
  [0, 1, 2],
  [0, 1, 2],
  [5, 4, 5],
  [1, 1, 1, 0, 1, 0, 0, 0],
];
assert.deepEqual(
  ADVANCED_CHAPTERS.map((c) => c.number),
  [5, 6, 7, 8, 9, 10, 11, 12],
);
const kinds = ADVANCED_CHAPTERS.flatMap((c) => c.missions.map((m) => m.kind));
assert.equal(kinds.length, 16);
assert(
  new Set(kinds).size >= 12,
  "chapters need genuinely different mechanics",
);
for (const capacity of [0, 5, 10]) {
  let s = newAdvanced({ seed: { capacity: { water: capacity } } });
  assert.equal(s.version, 2);
  for (let i = 0; i < 16; i++) {
    const m = advancedMission(s),
      before = JSON.stringify(s),
      plan = passing[i];
    assert.equal(m.index, i);
    assert(m.answers.includes(m.diagnosis));
    assert.equal(initialAdvancedPlan(s).length, plan.length);
    assert.equal(
      testAdvanced(s, initialAdvancedPlan(s)).ok,
      false,
      "unattempted challenge must not pass immediately",
    );
    assert.equal(testAdvanced(s, Array(plan.length).fill(-1)).ok, false);
    assert.equal(testAdvanced(s, plan).ok, true, m.id);
    assert.equal(JSON.stringify(s), before, "testing cannot mutate the state");
    assert.equal(deployAdvanced(s, Array(plan.length).fill(-1)), null);
    s = deployAdvanced(s, plan);
    assert.equal(s.records.length, i + 1);
    assert(s.records[i].score >= 70);
    assert.deepEqual(sanitizeAdvanced({ ...s, privateText: "discard" }), s);
    const result = advancedCityActivity({ day: 7, last: {} }, null, s);
    assert(result.upgrades[m.district] > 0);
    assert(result.last.shipments.every((v) => v.units >= 0));
    assert(result.last.advancedProject === m.id);
  }
  assert.equal(advancedMission(s), null);
  assert.equal(deployAdvanced(s, [1, 2, 3]), null);
  assert(sanitizeAdvanced(s));
}
let legacy = legacyNew({ seed: { capacity: { water: 5 } } });
legacy = legacyDeploy(legacy, [1, 1, 0, 0, 0]);
assert(legacy);
let migrated = sanitizeAdvanced(legacy);
assert.equal(migrated.version, 2);
assert.equal(migrated.records.length, 1);
assert.equal(migrated.records[0].legacy, true);
assert.equal(advancedMission(migrated).index, 1);
assert.equal(sanitizeAdvanced(migrated).records[0].legacy, true);
migrated = deployAdvanced(migrated, passing[1]);
assert(migrated, "mixed legacy/new progress should remain playable");
assert.equal(sanitizeAdvanced(migrated).records.length, 2);
assert.equal(
  sanitizeAdvanced({
    ...migrated,
    records: [...migrated.records, { legacy: true, plan: [1, 1, 0, 0, 0] }],
  }),
  null,
  "new progress cannot be followed by forged legacy records",
);
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
const realisticResilience = {
  version: 1,
  seed: {
    stocks: { water: 5, parts: 5, food: 5 },
    capacity: {
      water: 4,
      industry: 3,
      market: 3,
      health: 3,
      workshop: 2,
      business: 2,
      transport: 2,
    },
  },
  choices: ["care", "repair", "food"],
};
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
assert(
  savePractice(
    { ...base, resilience: realisticResilience, advanced: migrated },
    storage,
  ),
);
assert.equal(loadPractice(storage).advanced.records.length, 2);
assert.deepEqual(loadPractice(storage).advanced, migrated);
console.log(
  "PASS: 16 varied challenges, 12+ distinct mechanics, tested consequences, v1 migration, resume and opt-in persistence.",
);
