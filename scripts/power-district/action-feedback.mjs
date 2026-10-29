import assert from "node:assert/strict";
import { CITY_CASES } from "../../public/games/city/cases.mjs";
import {
  CASE_BUILD_SITES,
  visualTone,
  feedbackCopy,
} from "../../public/games/city/feedback.mjs";

assert.equal(Object.keys(CASE_BUILD_SITES).length, 36);
for (const c of CITY_CASES) {
  const site = CASE_BUILD_SITES[c.id];
  assert(site, c.id + " must build something visibly in the 3D scene");
  assert.equal(site.district, c.district);
  assert(Number.isFinite(site.x) && Number.isFinite(site.z));
  assert(site.label.length >= 5);
  for (const option of c.options) {
    const tone = visualTone(option);
    assert(["improving", "mixed", "strained"].includes(tone));
    assert(feedbackCopy(site.kind, tone).length > 20);
  }
}
assert.equal(visualTone(null), null);
console.log(
  "PASS: every authored choice has a district build site and consequence copy.",
);
