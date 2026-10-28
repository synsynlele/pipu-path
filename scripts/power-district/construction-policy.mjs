import assert from "node:assert/strict";
import { CITY_CASES } from "../../public/games/city/cases.mjs";
import { infrastructurePlan } from "../../public/games/city/construction-plans.mjs";
import { deriveBuilderCity } from "../../public/games/city/city-growth.mjs";
import { deriveLivingCity } from "../../public/games/city/living-city.mjs";
import {
  newOpportunityState,
  runOpportunityDay,
} from "../../public/games/city/opportunities.mjs";
let actions = 0,
  noBuild = 0;
for (const scenario of CITY_CASES)
  for (const choice of scenario.options) {
    const plan = infrastructurePlan(scenario.id, choice.id);
    assert(plan, scenario.id + "/" + choice.id);
    assert.equal(plan.district, scenario.district);
    assert.equal(plan.title, choice.title);
    assert(["working", "limited", "failed", "none"].includes(plan.status));
    if (plan.status === "none") {
      noBuild++;
      assert.equal(plan.assets.length, 0);
      assert.equal(plan.construction, false);
    }
    if (plan.status === "working") {
      assert(plan.construction);
      assert(plan.assets.length);
    }
    actions++;
  }
assert.equal(actions, 108);
assert(
  noBuild >= 25,
  "Promises and inaction still manufacture too much infrastructure",
);
assert.equal(infrastructurePlan("unknown", "unknown"), null);
for (const [id, choice] of [
  ["power-clinic", "promise"],
  ["clinic-supply", "silence"],
  ["water-sanitation", "announce"],
  ["civic-repairs", "announce"],
  ["green-drainage", "ignore"],
  ["enterprise-trust", "blame"],
]) {
  const plan = infrastructurePlan(id, choice);
  assert.equal(plan.assets.length, 0);
  const city = deriveBuilderCity({ [id]: choice });
  assert.equal(city.completed, 1);
  assert.equal(city.visibleBuildings, 0);
  assert.equal(city.workingSolutions, 0);
  assert.equal(city.activeDistricts, 0);
  assert.equal(city.unresolvedNeeds, 1);
  const living = deriveLivingCity({ [id]: choice });
  assert.equal(living.residents, 0);
  assert.equal(living.deliveries.length, 0);
}
for (const [id, choice, asset] of [
  ["tech-booking", "prototype", "technology-hub"],
  ["clinic-arrival", "access", "health-centre"],
  ["clinic-supply", "track", "pharmacy"],
  ["industry-spares", "test", "manufacturing-workshop"],
  ["water-breakdown", "inspect", "waterworks"],
]) {
  assert.deepEqual(infrastructurePlan(id, choice).assets, [asset]);
}
const good = Object.fromEntries(CITY_CASES.map((c) => [c.id, c.options[0].id]));
const changed = {
  ...good,
  "tech-booking": "features",
  "clinic-arrival": "billboard",
  "clinic-supply": "silence",
};
const best = deriveBuilderCity(good),
  poorer = deriveBuilderCity(changed);
assert.equal(best.completed, poorer.completed);
assert.equal(poorer.workingSolutions, best.workingSolutions - 3);
assert(poorer.visibleBuildings < best.visibleBuildings);
assert(poorer.cityHealth < best.cityHealth);
assert.equal(poorer.districts.health.productive, 0);
assert.equal(poorer.districts.health.service, 0);
const noneWater = {
  ...good,
  "water-breakdown": "guess",
  "water-sanitation": "announce",
};
const day = runOpportunityDay(noneWater, newOpportunityState());
assert(day);
assert.equal(deriveBuilderCity(noneWater).districts.water.productive, 0);
console.log(
  "PASS: 108 semantic construction contracts, " +
    noBuild +
    " no-build outcomes, relevant sector assets, honest city counts and no service/population for empty promises.",
);
