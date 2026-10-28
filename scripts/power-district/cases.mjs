import assert from "node:assert/strict";
import {
  CITY_CASES,
  FOUNDATION_CASE_COUNT,
  CASE_DISTRICTS,
  IMPACT_LABELS,
  getCase,
  getChoice,
  casesFor,
  saveDecision,
  caseProgress,
  districtProgress,
} from "../../public/games/city/cases.mjs";
assert.equal(CITY_CASES.length, 36);
assert.equal(FOUNDATION_CASE_COUNT, 16);
assert.equal(CASE_DISTRICTS.length, 14);
assert.equal(IMPACT_LABELS.length, 4);
assert.equal(new Set(CITY_CASES.map((c) => c.id)).size, 16);
for (const district of CASE_DISTRICTS) {
  assert.equal(casesFor(district).length, ["workshop","power","market","school"].includes(district) ? 4 : 2, district);
}
for (const c of CITY_CASES) {
  assert(c.title.length > 5 && c.situation.length > 40);
  assert(c.bridge.length > 20);
  assert.equal(c.options.length, 3);
  assert.equal(new Set(c.options.map((o) => o.id)).size, 3);
  assert.equal(getCase(c.id), c);
  for (const o of c.options) {
    assert(o.result.length > 50);
    assert(o.tradeoff.length > 30);
    assert(o.links.length > 10);
    assert.equal(o.impact.length, 4);
    assert(o.impact.every((n) => Number.isInteger(n) && n >= -2 && n <= 2));
    assert.deepEqual(getChoice(c.id, o.id), o);
  }
}
let decisions = {};
for (const caseFile of CITY_CASES)
  decisions = saveDecision(decisions, caseFile.id, caseFile.options[0].id);
assert.equal(caseProgress(decisions), 36);
for (const d of CASE_DISTRICTS) assert.equal(districtProgress(decisions, d), ["workshop","power","market","school"].includes(d) ? 4 : 2);
const before = decisions;
assert.equal(saveDecision(decisions, "fake-id", "fake"), before);
assert.equal(saveDecision(decisions, CITY_CASES[0].id, "invalid"), before);
const changed = saveDecision(
  decisions,
  CITY_CASES[0].id,
  CITY_CASES[0].options[1].id,
);
assert.equal(changed[CITY_CASES[0].id], CITY_CASES[0].options[1].id);
assert.equal(decisions[CITY_CASES[0].id], CITY_CASES[0].options[0].id);
console.log(
  "PASS: 36 authored cases, 3 reversible choices each, across all 14 playable districts.",
);
