import assert from "node:assert/strict";
import { CITY_CASES } from "../../public/games/city/cases.mjs";
import { CITY_DISTRICTS } from "../../public/games/city/districts.mjs";
import { initialPlan } from "../../public/games/city/model.mjs";
import {
  emptyOperations,
  facilityContract,
  simulateService,
  testFacility,
  applyFacility,
  sanitizeOperations,
  operationsActivity,
  STRATEGIES,
} from "../../public/games/city/facility-operations.mjs";
import {
  sanitizePractice,
  savePractice,
  loadPractice,
} from "../../public/games/city/practice-save.mjs";
import { deriveLivingCity } from "../../public/games/city/living-city.mjs";
const base = {
  day: 1,
  cash: 18,
  config: initialPlan(),
  owned: initialPlan(),
  seen: [],
  history: [],
  decisions: Object.fromEntries(CITY_CASES.map((c) => [c.id, c.options[0].id])),
};
assert.equal(
  testFacility({ ...base, decisions: {} }, "workshop", {
    strategy: "balanced",
    units: [4, 3, 1],
  }).ok,
  false,
);
let full = structuredClone(base);
full.operations = emptyOperations();
for (const district of CITY_DISTRICTS)
  for (const difficulty of ["guided", "standard", "expert"]) {
    let state = { ...base, operations: emptyOperations() };
    state.operations.settings.difficulty = difficulty;
    for (let round = 0; round < 4; round++) {
      const c = facilityContract(state, district.id),
        viable = [];
      for (const strategy of STRATEGIES) {
        let found = null;
        for (let crew = 0; crew <= 8 && !found; crew++)
          for (let energy = 0; energy <= 8 && !found; energy++)
            for (
              let maintenance = 0;
              maintenance <= 3 && !found;
              maintenance++
            ) {
              const plan = {
                strategy: strategy.id,
                units: [crew, energy, maintenance],
              };
              if (simulateService(c, plan).ok) found = plan;
            }
        if (found) viable.push(found);
      }
      assert(
        viable.length >= 2,
        `${district.id}/${difficulty}/${round} needs more than one viable strategy`,
      );
      const before = JSON.stringify(state);
      assert.equal(
        testFacility(state, district.id, {
          strategy: "balanced",
          units: [0, 0, 0],
        }).ok,
        false,
      );
      assert.equal(
        JSON.stringify(state),
        before,
        "Testing must not mutate city progress",
      );
      const applied = applyFacility(
        state,
        district.id,
        viable[round % viable.length],
        c.round,
      );
      assert(applied);
      state = { ...state, operations: applied.operations };
      assert.equal(
        applyFacility(state, district.id, viable[0], c.round),
        null,
        "Stale/double Apply must not advance a second round",
      );
      assert.equal(
        state.operations.districts[district.id].completed,
        round + 1,
      );
      assert.deepEqual(sanitizeOperations(state.operations), state.operations);
      assert.equal(state.cash, base.cash);
      assert.equal("xp" in state, false);
    }
    full.operations.districts[district.id] =
      state.operations.districts[district.id];
  }
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
assert(savePractice(full, storage));
assert.deepEqual(loadPractice(storage).operations, full.operations);
assert.equal(
  sanitizePractice(base).operations.version,
  1,
  "Old saves must get an empty compatible workshop",
);
const corrupt = structuredClone(full);
corrupt.operations.districts.workshop.last.plan.units = [999, 999, 999];
assert.equal(
  sanitizeOperations(corrupt.operations).districts.workshop,
  undefined,
);
assert.deepEqual(sanitizePractice(corrupt).decisions, base.decisions);
const before = deriveLivingCity(base.decisions),
  after = deriveLivingCity(
    base.decisions,
    operationsActivity({}, full.operations),
  );
assert(
  after.districts.some((d, i) => d.service > before.districts[i].service),
  "Applied plans must affect the actual living city model",
);
assert.equal(
  operationsActivity({}, emptyOperations()).operationServices.workshop,
  undefined,
);
console.log(
  "PASS: all 14 districts, three difficulties, changing replay conditions, multiple viable strategies, tested service consequences, duplicate protection, old saves and safe persistence.",
);
