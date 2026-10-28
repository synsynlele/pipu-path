import assert from "node:assert/strict";
import { CITY_CASES } from "../../public/games/city/cases.mjs";
import { deriveBuilderCity } from "../../public/games/city/city-growth.mjs";
import { deriveLivingCity } from "../../public/games/city/living-city.mjs";
import {
  ENTERPRISE_DAYS,
  DAY_EVENTS,
  OPPORTUNITY_POLICIES,
  newOpportunityState,
  sanitizeOpportunityState,
  runOpportunityDay,
  selectOpportunityPolicy,
  foundationForOpportunities,
} from "../../public/games/city/opportunities.mjs";

const fresh = newOpportunityState();
assert.equal(ENTERPRISE_DAYS, 7);
assert.equal(DAY_EVENTS.length, 7);
assert.equal(OPPORTUNITY_POLICIES.length, 4);
assert.deepEqual(sanitizeOpportunityState(fresh), fresh);
assert.equal(foundationForOpportunities({}), false);
assert.equal(
  runOpportunityDay({}, fresh),
  null,
  "Cannot run before 36 city decisions",
);
const decisions = {};
for (const c of CITY_CASES) decisions[c.id] = c.options[0].id;
assert(foundationForOpportunities(decisions));
assert(deriveBuilderCity(decisions).activeDistricts === 14);
let state = fresh;
const history = [];
for (let day = 1; day <= 7; day++) {
  const policy = ["balanced", "people", "growth", "repair"][day % 4];
  state = selectOpportunityPolicy(state, policy);
  assert(state);
  const next = runOpportunityDay(decisions, state);
  assert(next, "Each enterprise day must run");
  assert.equal(next.day, day);
  assert.equal(next.history.length, day);
  assert.equal(next.history.at(-1).policy, policy);
  assert(next.last.shipments.every((s) => s.units > 0));
  assert(next.last.shipments.length <= 6);
  assert(Object.values(next.stocks).every((v) => v >= 0 && v <= 30));
  assert.deepEqual(sanitizeOpportunityState(next), next);
  history.push(next.last);
  state = next;
}
assert.equal(
  runOpportunityDay(decisions, state),
  null,
  "No eighth day without restart",
);
assert.equal(selectOpportunityPolicy(state, "not-a-policy"), null);
assert(state.history.every((r) => r.day >= 1 && r.day <= 7));
assert(
  history.some((day) => day.meals > 0),
  "Market should serve residents",
);
assert(
  history.some((day) => day.patients > 0),
  "Clinic should receive supplies",
);
assert(
  history.some((day) => day.repairs > 0),
  "Parts should reach the workshop",
);
const scene = deriveLivingCity(decisions, state);
assert(scene.deliveries.length > 0 && scene.deliveries.length <= 5);
assert(
  scene.deliveries.every((item) => item.units > 0),
  "Vehicles represent actual shipments",
);
assert(
  scene.deliveries.every((item) =>
    state.last.shipments.some(
      (s) => s.from === item.from && s.to === item.to && s.units === item.units,
    ),
  ),
  "No animation of phantom goods after Chapter 3 begins",
);
const noShipments = { ...state, last: { ...state.last, shipments: [] } };
assert.equal(
  deriveLivingCity(decisions, noShipments).deliveries.length,
  0,
  "No goods means no supply vehicles",
);
const revised = { ...decisions };
const waterCase = CITY_CASES.find((c) => c.district === "water");
revised[waterCase.id] = waterCase.options[2].id;
assert.notEqual(
  deriveBuilderCity(decisions).districts.water.service,
  deriveBuilderCity(revised).districts.water.service,
);
const afterRevision = runOpportunityDay(revised, {
  ...state,
  day: 6,
  history: state.history.slice(0, 6),
  last: { ...state.last, day: 6 },
});
assert(afterRevision, "New operating day adapts to revised city decisions");
const unhealthy = {
  ...state,
  history: [
    {
      day: 1,
      policy: "growth",
      water: 1,
      food: 1,
      parts: 1,
      meals: 1,
      patients: 1,
      repairs: 1,
      jobs: 2,
      unserved: 1,
    },
  ],
};
assert.equal(
  sanitizeOpportunityState(unhealthy),
  null,
  "Tampered history is rejected",
);
assert.equal(sanitizeOpportunityState({ ...state, policy: "<script>" }), null);
assert.equal(
  sanitizeOpportunityState({
    ...state,
    stocks: { water: 9999, parts: 0, food: 0 },
  }),
  null,
);
assert.equal(
  sanitizeOpportunityState({
    ...state,
    last: {
      ...state.last,
      shipments: [{ from: "outside", to: "health", units: 5 }],
    },
  }),
  null,
);
console.log(
  "PASS: Chapter 3 unlock, seven supply-chain days, 4 priorities, inventory, shortages, reversible city dependencies, visual shipments and bounded saving.",
);
