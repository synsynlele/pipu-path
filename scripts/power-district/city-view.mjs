import assert from "node:assert/strict";
import {
  CITY_CASES,
  casesFor,
  saveDecision,
} from "../../public/games/city/cases.mjs";
import {
  cityViewSummary,
  findCityViewDistrict,
} from "../../public/games/city/city-view.mjs";
import { deriveBuilderCity } from "../../public/games/city/city-growth.mjs";
const empty = cityViewSummary();
assert.equal(empty.total, 14);
assert.equal(empty.active, 0);
assert.equal(empty.built, 0);
assert.equal(empty.possible, 36);
assert.equal(empty.districts.length, 14);
assert.equal(findCityViewDistrict(empty, "unknown"), null);
let decisions = {};
const first = CITY_CASES[0];
decisions = saveDecision(decisions, first.id, first.options[0].id);
const partial = cityViewSummary(decisions);
assert.equal(partial.built, 1);
assert.equal(partial.active, 1);
assert.equal(findCityViewDistrict(partial, "workshop").built, 1);
assert.equal(findCityViewDistrict(partial, "water").built, 0);
assert.equal(
  findCityViewDistrict(partial, "workshop").possible,
  casesFor("workshop").length,
);
const variant = cityViewSummary({
  ...decisions,
  [first.id]: first.options[1].id,
});
assert.equal(
  variant.built,
  0,
  "An unfinished repair backlog is not useful infrastructure",
);
assert.notEqual(
  deriveBuilderCity(decisions).districts.workshop.direct,
  deriveBuilderCity({ ...decisions, [first.id]: first.options[1].id }).districts
    .workshop.direct,
  "Viewing must reflect the existing revised construction decisions",
);
for (const c of CITY_CASES.slice(1))
  decisions = saveDecision(decisions, c.id, c.options[0].id);
const full = cityViewSummary(decisions);
assert.equal(full.built, 36);
assert.equal(full.active, 14);
for (const district of full.districts) {
  assert.equal(district.built, district.possible);
  assert(Number.isFinite(district.x) && Number.isFinite(district.z));
}
assert.deepEqual(
  cityViewSummary(decisions),
  cityViewSummary(decisions),
  "View cannot invent a second city or mutate progress",
);
console.log(
  "PASS: aerial view reads the same 14-district construction, updates from revisions, and never writes new learner data.",
);
