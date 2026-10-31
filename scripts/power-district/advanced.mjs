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
} from "../../public/games/city/advanced.mjs";
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
for (const capacity of [0, 5, 10]) {
  let state = newAdvanced({ seed: { capacity: { water: capacity } } });
  for (let i = 0; i < 16; i++) {
    const before = JSON.stringify(state),
      m = advancedMission(state),
      r = advancedRules(state);
    assert.equal(m.index, i);
    assert(m.answers.includes(m.diagnosis));
    assert.equal(new Set(m.answers).size, 3);
    const failed = Array(m.kind === "allocate" ? 3 : 5).fill(0);
    assert.equal(testAdvanced(state, failed).ok, false);
    assert.equal(deployAdvanced(state, failed), null);
    assert.equal(JSON.stringify(state), before);
    const plan =
      m.kind === "allocate"
        ? [...r.minimum]
        : r.redundant
          ? [1, 1, 1, 1, 0]
          : [1, 1, 0, 0, 0];
    assert.equal(testAdvanced(state, plan).ok, true);
    if (m.kind === "network") {
      assert.equal(testAdvanced(state, [1, 1, 0, 0, 1]).ok, false);
      if (r.redundant)
        assert.equal(testAdvanced(state, [1, 1, 0, 0, 0]).ok, false);
    } else {
      const over = [...r.minimum];
      over[0] = r.budget;
      assert.equal(testAdvanced(state, over).ok, false);
    }
    state = deployAdvanced(state, plan);
    assert.equal(state.records.length, i + 1);
    assert.deepEqual(
      sanitizeAdvanced({ ...state, privateText: "discard me" }),
      state,
    );
    const activity = advancedCityActivity({ day: 7, last: {} }, null, state);
    assert(activity.upgrades[m.district] > 0);
    assert(activity.last.shipments.every((s) => s.units >= 0));
    assert(Object.values(activity.upgrades).every((n) => n >= 0 && n <= 16));
  }
  assert.equal(advancedMission(state), null);
  assert.equal(deployAdvanced(state, [1, 1, 1]), null);
  assert.equal(state.records.length, 16);
  assert(advancedUpgrades(state).transport > 0);
  assert.equal(
    sanitizeAdvanced({ ...state, records: [...state.records, {}] }),
    null,
  );
  const bad = structuredClone(state);
  bad.records[0].plan = [0, 0, 0, 0, 0];
  assert.equal(sanitizeAdvanced(bad), null);
}
const partial = {
  ...newAdvanced(),
  cursor: { phase: "configure", plan: [1, 0, 0, 0, 0] },
};
assert.deepEqual(sanitizeAdvanced(partial).cursor, partial.cursor);
assert.equal(
  sanitizeAdvanced({ version: 1, records: [{ plan: [0, 0, 0, 0, 0] }] }),
  null,
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
  "PASS: all 16 same-city advanced missions, 8 chapters, weak/strong starting capacity, allocation reserves, broken routes, redundancy, invalid-plan guards, bounded cursor and old-save compatibility.",
);
