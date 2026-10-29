import assert from "node:assert/strict";
import {
  CITY_CASES,
  getChoice,
  saveDecision,
} from "../../public/games/city/cases.mjs";
import {
  deriveBuilderCity,
  choiceStructure,
  CITY_SYSTEMS,
  CONNECTIONS,
} from "../../public/games/city/city-growth.mjs";
import { CASE_BUILD_SITES } from "../../public/games/city/feedback.mjs";
import {
  districtLife,
  LIFE_GOALS,
} from "../../public/games/city/better-lives.mjs";
import { infrastructurePlan } from "../../public/games/city/construction-plans.mjs";

assert.equal(Object.keys(LIFE_GOALS).length, CITY_SYSTEMS.length);
for (const district of CITY_SYSTEMS) {
  const life = districtLife(district.id);
  assert(life.goal);
  assert.equal(life.state, "Meet the need");
  assert.equal(life.working.length, 0);
  assert.equal(life.nextReview, null);
}
// Every authored outcome remains tied to its actual choice, including empty
// promises and partial plans. Revision must remove the previous benefit.
for (const scenario of CITY_CASES) {
  for (const choice of scenario.options) {
    const decisions = { [scenario.id]: choice.id };
    const before = JSON.stringify(decisions);
    const life = districtLife(scenario.district, decisions);
    const working =
      infrastructurePlan(scenario.id, choice.id).status === "working";
    assert.equal(life.working.length, Number(working));
    assert.equal(life.needsAttention.length, Number(!working));
    assert.equal(life.nextReview, working ? null : scenario.id);
    const action = [...life.working, ...life.needsAttention][0];
    assert.equal(action.result, choice.result);
    assert.equal(action.tradeoff, choice.tradeoff);
    assert.equal(JSON.stringify(decisions), before);
  }
}
const revisedLife = districtLife("workshop", { "repair-parts": "guess" });
assert.equal(revisedLife.working.length, 0);
assert.equal(revisedLife.nextReview, "repair-parts");
assert.equal(
  districtLife("workshop", { "repair-parts": "track" }).nextReview,
  null,
);

const empty = deriveBuilderCity();
assert.equal(empty.completed, 0);
assert.equal(empty.visibleBuildings, 0);
assert.equal(empty.cityHealth, 0);
assert.equal(Object.keys(empty.districts).length, 14);
assert.equal(CITY_SYSTEMS.length, 14);
assert(CONNECTIONS.some((l) => l.from === "power" && l.to === "market"));
const ids = new Set();
for (const scenario of CITY_CASES) {
  assert(CASE_BUILD_SITES[scenario.id]);
  const variations = scenario.options.map((c) =>
    choiceStructure(scenario.id, c.id),
  );
  for (const shape of variations) {
    assert(shape && shape.district === scenario.district);
    assert(!ids.has(shape.caseId + "_" + shape.choiceId));
    ids.add(shape.caseId + "_" + shape.choiceId);
  }
}
assert.equal(ids.size, 108);
assert.equal(choiceStructure("invalid", "invalid"), null);
let choices = {};
for (const c of CITY_CASES)
  choices = saveDecision(choices, c.id, c.options[0].id);
const positive = deriveBuilderCity(choices);
assert.equal(positive.completed, 36);
assert.equal(positive.visibleBuildings, 36);
assert(positive.thriving >= 4);
assert(positive.cityHealth > 60);
for (const district of Object.values(positive.districts)) {
  const target = ["workshop", "power", "market", "school"].includes(district.id)
    ? 4
    : 2;
  assert.equal(district.built, target);
  assert.equal(district.structures.length, target);
  assert(district.service >= 0 && district.service <= 100);
  assert(["active", "thriving", "struggling"].includes(district.activity));
}
let adverse = {};
for (const c of CITY_CASES) adverse[c.id] = c.options[1].id;
const troubled = deriveBuilderCity(adverse);
assert(
  troubled.cityHealth < positive.cityHealth,
  "Alternative decisions change operating city health",
);
assert(
  troubled.districts.workshop.service < positive.districts.workshop.service,
);
const revised = { ...choices, "power-upkeep": "wait" };
const changed = deriveBuilderCity(revised);
assert.notEqual(
  changed.districts.power.direct,
  positive.districts.power.direct,
);
assert.notEqual(
  changed.districts.market.service,
  positive.districts.market.service,
  "Power decisions must influence the food district even if no food decisions are revised",
);
assert.notEqual(
  changed.districts.school.service,
  positive.districts.school.service,
  "Power decisions must also influence learning",
);
assert.equal(
  positive.districts.power.structures.find((s) => s.caseId === "power-upkeep")
    .variant,
  "working",
);
assert.equal(
  changed.districts.power.structures.find((s) => s.caseId === "power-upkeep")
    .variant,
  "none",
);
assert.equal(
  deriveBuilderCity(revised).cityHealth,
  changed.cityHealth,
  "City must restore deterministically from saved decisions",
);
assert.equal(getChoice("repair-queue", "rush").id, "rush");
console.log(
  "PASS: 108 authored consequences, 36 reserved sites, coupled services and deterministic restoration.",
);
