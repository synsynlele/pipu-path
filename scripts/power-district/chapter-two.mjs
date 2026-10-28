import assert from "node:assert/strict";
import { CITY_CASES, FOUNDATION_CASE_COUNT, CASE_DISTRICTS, getChoice, caseProgress, saveDecision } from "../../public/games/city/cases.mjs";
import { GROWING_CITY_CASES, GROWTH_CASE_COUNT, chapterPressure } from "../../public/games/city/chapter-two.mjs";
import { OUTER_DISTRICTS } from "../../public/games/city/districts.mjs";
import { deriveBuilderCity, CONNECTIONS } from "../../public/games/city/city-growth.mjs";
import { foundationComplete, chapterForCase, isChapterTransition, nextPlayableAfter, recoverJourney } from "../../public/games/city/journey-flow.mjs";
import { CASE_BUILD_SITES } from "../../public/games/city/feedback.mjs";
import { choicesForCase } from "../../public/games/city/case-flow.mjs";
assert.equal(CITY_CASES.length, 36);
assert.equal(FOUNDATION_CASE_COUNT, 16);
assert.equal(GROWTH_CASE_COUNT, 20);
assert.equal(CASE_DISTRICTS.length, 14);
assert.equal(OUTER_DISTRICTS.length, 10);
for (const d of OUTER_DISTRICTS) {
  const selected = GROWING_CITY_CASES.filter(c => c.district === d.id);
  assert.equal(selected.length, 2, d.id + " should have two playable scenarios");
  for (const c of selected) {
    assert.equal(c.chapter, 2);
    assert(CASE_BUILD_SITES[c.id], c.id + " missing construction site");
    assert.equal(chapterForCase(c.id), 2);
    assert(CASE_DISTRICTS.includes(c.dependsOn), c.id + " missing linked district");
    assert(c.situation.length > 60 && c.bridge.length > 20);
    assert.equal(c.options.length, 3);
    assert.equal(new Set(c.options.map(o=>o.id)).size,3);
    for (const o of c.options) {
      assert(o.title.length > 8 && o.tradeoff.length > 30);
      assert(o.result.length > 50);
      assert(getChoice(c.id,o.id));
    }
  }
}
assert.equal(chapterForCase(CITY_CASES[15].id),1);
assert.equal(chapterForCase(CITY_CASES[16].id),2);
assert(isChapterTransition(CITY_CASES[15].id));
let decisions={};
assert(!foundationComplete(decisions));
assert.equal(chapterPressure(GROWING_CITY_CASES[0],deriveBuilderCity(decisions)).includes("not yet built"),true);
for(const c of CITY_CASES.slice(0,16)) decisions=saveDecision(decisions,c.id,c.options[0].id);
assert(foundationComplete(decisions));
assert.equal(caseProgress(decisions),16);
assert.equal(nextPlayableAfter(CITY_CASES[15].id,decisions)?.id,CITY_CASES[16].id);
const chapterCursor=recoverJourney({caseId:CITY_CASES[15].id,stage:"chapter",decisions});
assert.equal(chapterCursor.stage,"chapter");
const city=deriveBuilderCity(decisions);
assert.equal(city.activeDistricts,4);
assert.equal(city.districtCount,14);
assert(chapterPressure(GROWING_CITY_CASES.find(c=>c.dependsOn==="workshop"),city).length>35);
for(const c of CITY_CASES.slice(16)) decisions=saveDecision(decisions,c.id,c.options[0].id);
const evolved=deriveBuilderCity(decisions);
assert.equal(caseProgress(decisions),36);
assert.equal(evolved.activeDistricts,14);
assert.equal(evolved.visibleBuildings,36);
assert.equal(nextPlayableAfter(CITY_CASES[35].id,decisions),null);
assert.equal(recoverJourney({decisions,stage:"invalid"}).stage,"complete");
const revised={...decisions,[CITY_CASES[0].id]:CITY_CASES[0].options[1].id};
assert.notEqual(deriveBuilderCity(revised).districts.workshop.direct,evolved.districts.workshop.direct);
assert(CONNECTIONS.some(link=>link.from==="water" && link.to==="health"));
assert(CONNECTIONS.some(link=>link.from==="transport" && link.to==="market"));
for(const seed of [0,1,2]) {
  const slots=[0,0,0];
  for(const c of CITY_CASES) {
    const options=choicesForCase(c.id,seed);
    slots[options.findIndex(o=>o.id===c.options[0].id)]++;
  }
  assert.deepEqual(slots,[12,12,12]);
}
console.log("PASS: 14 districts, 20 new stories, 36 reversible builds, Chapter 1→2 unlock, 14-service interdependence and old-save continuity.");
