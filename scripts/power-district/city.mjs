import assert from "node:assert/strict";
import {
  initialPlan,
  evaluateCity,
  adoptDay,
  quote,
} from "../../public/games/city/model.mjs";
const plan = {
  ...initialPlan(),
  storage: true,
  schedule: true,
  maintenance: true,
  school: true,
  food: "early",
  diagnosis: "unequal-parts",
  support: "oral-visual",
  transfer: "same-whole",
};
const state = {
  day: 1,
  cash: 18,
  owned: initialPlan(),
  config: plan,
  history: [],
};
const normal = evaluateCity(plan, state);
assert(normal.passed);
assert.equal(normal.usable, 8);
assert.equal(normal.closingCash, 10);
assert(
  !evaluateCity({ ...plan, food: "cooling" }, state).powerReady,
  "cooling shares power; it is not an automatic win",
);
assert(!evaluateCity({ ...plan, transfer: "rotation" }, state).learning);
const adopted = adoptDay(state, normal);
assert.equal(adopted.day, 2);
assert.equal(adopted.cash, 10);
assert.equal(adopted.owned.storage, true);
assert.equal(adoptDay(adopted, normal), null, "no double payout");
assert.equal(
  adoptDay({ ...state, config: { ...plan, solar: true } }, normal),
  null,
  "reject stale test after editing",
);
assert(
  !evaluateCity(adopted.config, adopted).passed,
  "day 2 affects the same city",
);
for (const agreement of ["advance", "shared"]) {
  const changed = {
    ...adopted.config,
    solar: true,
    food: "cooling",
    policy: "protect",
    agreement,
  };
  const r = evaluateCity(changed, adopted);
  assert(r.passed, agreement);
  assert.equal(r.closingCash, 5);
  assert(r.entries.every((e) => e.balance >= 0));
  assert.equal(r.delayedFlexible, 2);
  const next = adoptDay({ ...adopted, config: changed }, r);
  assert.equal(next.day, 3);
  assert.equal(next.history.length, 2);
}
const noAgreement = {
  ...adopted.config,
  solar: true,
  food: "cooling",
  policy: "protect",
};
assert(!evaluateCity(noAgreement, adopted).solvent);
const packaging = { ...plan, food: "packaging" };
assert(
  evaluateCity(packaging, state).passed,
  "alternate normal-day food solution",
);
const dustPower = { ...noAgreement, agreement: "advance", policy: "rotate" };
assert(
  evaluateCity(dustPower, adopted).passed,
  "a second consent-based allocation works",
);
assert(
  quote({ ...plan, solar: true, food: "cooling" }, initialPlan(), 18)
    .available < 0,
  "shared capital guard",
);
console.log(
  "PASS: connected energy, food, learning, shared fund, two days, two payment agreements, alternate plans and stale/double-adoption guards.",
);
