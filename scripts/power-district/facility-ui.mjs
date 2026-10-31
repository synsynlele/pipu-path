import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { CITY_CASES } from "../../public/games/city/cases.mjs";
import { emptyOperations } from "../../public/games/city/facility-operations.mjs";
import { mountFacilityDesk } from "../../public/games/city/facility-ui.mjs";
const dom = new JSDOM(readFileSync("public/games/city/index.html", "utf8"), {
  url: "https://example.test",
  pretendToBeVisual: true,
});
const w = dom.window;
globalThis.document = w.document;
w.HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
w.HTMLDialogElement.prototype.close = function () {
  this.open = false;
  this.dispatchEvent(new w.Event("close"));
};
const state = {
  decisions: Object.fromEntries(CITY_CASES.map((c) => [c.id, c.options[0].id])),
  operations: emptyOperations(),
};
let selectedDistrict = null;
let revealed = 0,
  settings = null;
const desk = mountFacilityDesk({
  read: () => state,
  write: (operations) => {
    state.operations = operations;
  },
  prepare() {},
  reveal: () => revealed++,
  saveStatus: () => "Session only",
  onSettings: (value) => (settings = value),
  onCue() {},
  onNote() {},
  onDistrict: (id) => (selectedDistrict = id),
});
const $ = (id) => document.getElementById(id);
desk.open("health");
assert.equal(selectedDistrict, "health");
assert($("facility-desk").open);
assert.match($("facility-story").textContent, /Bisi/);
assert.match($("facility-dependencies").textContent, /Water/);
$("facility-test").click();
assert($("facility-apply").disabled);
assert.match($("facility-result").textContent, /Try another approach/);
const setPlan = (units) =>
  [...$("facility-units").querySelectorAll("input")].forEach((input, i) => {
    input.value = String(units[i]);
    input.dispatchEvent(new w.Event("input"));
  });
setPlan([4, 3, 1]);
$("facility-test").click();
assert.equal($("facility-apply").disabled, false);
setPlan([0, 0, 0]);
assert(
  $("facility-apply").disabled,
  "Changing a tested plan must invalidate Apply",
);
setPlan([4, 3, 1]);
$("facility-test").click();
$("facility-apply").click();
$("facility-apply").click();
assert.equal(revealed, 1);
assert.equal(state.operations.districts.health.completed, 1);
desk.open("health");
assert.match($("facility-progress").textContent, /Completed service rounds: 1/);
assert.match($("facility-conditions").textContent, /Rain/);
for (const [key, value] of [
  ["difficulty", "guided"],
  ["text", "large"],
  ["contrast", "solid"],
  ["quality", "battery"],
]) {
  $("facility-" + key).value = value;
  $("facility-" + key).dispatchEvent(new w.Event("change"));
  assert.equal(settings[key], value);
}
assert.equal($("facility-hint").hidden, false);
setPlan([2, 1, 1]);
desk.close();
assert.equal($("facility-desk").open, false);
desk.open("health");
assert.deepEqual(
  [...$("facility-units").querySelectorAll("input")].map((input) =>
    Number(input.value),
  ),
  [2, 1, 1],
  "Untested service configurations must survive leaving and returning",
);
desk.close();
dom.window.close();
console.log(
  "PASS: actual service controls, bad-plan feedback, edit invalidation, exactly-once apply, resident reaction, replay and saved difficulty/display settings.",
);
