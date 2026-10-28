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
  OWNED_ENTERPRISES,
  ENTERPRISE_ACTIONS,
  chooseOwnedEnterprise,
  chooseEnterpriseAction,
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
  assert.equal(Object.keys(next.last.requests).length, 4);
  assert.equal(
    Object.values(next.last.requests).reduce(
      (total, request) => total + request.requested - request.served,
      0,
    ),
    next.last.unserved,
    "The board must show only requests backed by the simulated shortages",
  );
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
// Owned enterprise outcomes must be caused by player decisions, not animation.
assert.equal(OWNED_ENTERPRISES.length, 4);
assert.equal(ENTERPRISE_ACTIONS.length, 3);
assert.equal(chooseOwnedEnterprise(fresh, "fake"), null);
assert.equal(chooseEnterpriseAction(fresh, "tools"), null);
const owner = chooseOwnedEnterprise(fresh, "water");
assert.equal(owner.enterprise.id, "water");
assert.equal(owner.enterprise.action, "steady");
const improvedOwner = chooseEnterpriseAction(owner, "tools");
assert.equal(improvedOwner.enterprise.action, "tools");
const baseline = runOpportunityDay(decisions, owner);
const improved = runOpportunityDay(decisions, improvedOwner);
assert.equal(improved.last.enterprise.id, "water");
assert(improved.last.enterprise.workers > 0);
assert(improved.last.water >= baseline.last.water);
assert(
  improved.stocks.parts <= baseline.stocks.parts,
  "Tool upgrades use finite parts",
);
assert.deepEqual(sanitizeOpportunityState(improved), improved);
const active = deriveLivingCity(decisions, improved).enterpriseActivity;
assert.equal(active.district, "water");
assert.equal(active.workers, improved.last.enterprise.workers);
assert.equal(active.customers, Math.min(2, improved.last.enterprise.customers));
for (const business of OWNED_ENTERPRISES) {
  const founded = chooseOwnedEnterprise(fresh, business.id);
  const result = runOpportunityDay(decisions, founded);
  assert.equal(result.last.enterprise.id, business.id);
  assert.equal(
    deriveLivingCity(decisions, result).enterpriseActivity.district,
    business.district,
  );
}
assert.equal(
  runOpportunityDay(decisions, fresh).last.enterprise,
  null,
  "Older Chapter 3 journeys remain playable without forcing new ownership",
);
const reached = runOpportunityDay(
  decisions,
  chooseEnterpriseAction(chooseOwnedEnterprise(fresh, "shop"), "reach"),
);
assert(
  reached.last.unserved >=
    runOpportunityDay(decisions, chooseOwnedEnterprise(fresh, "shop")).last
      .unserved,
  "Inviting customers cannot magically create stock",
);
assert.equal(
  chooseOwnedEnterprise(state, "shop"),
  null,
  "Do not alter completed history",
);
assert.equal(
  sanitizeOpportunityState({
    ...improved,
    enterprise: { id: "<img>", action: "tools" },
  }),
  null,
);
assert.equal(
  sanitizeOpportunityState({
    ...improved,
    history: [
      {
        ...improved.history[0],
        enterprise: { ...improved.last.enterprise, workers: 999 },
      },
    ],
  }),
  null,
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
const legacyBoardlessSave = {
  ...improved,
  history: improved.history.map(({ requests: _requests, ...row }) => row),
  last: { ...improved.last },
};
delete legacyBoardlessSave.last.requests;
assert.equal(
  sanitizeOpportunityState(legacyBoardlessSave).last.requests,
  null,
  "Older Chapter 3 saves without a request board must still load",
);
assert.equal(
  sanitizeOpportunityState({
    ...improved,
    history: improved.history.map((row) => ({
      ...row,
      requests: {
        ...row.requests,
        clinic: { requested: 0, served: 999 },
      },
    })),
  }),
  null,
  "Forged customer demand is rejected",
);
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
