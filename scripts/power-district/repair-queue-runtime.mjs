import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const root = process.cwd() + "/";
const dom = new JSDOM(
  readFileSync(root + "public/games/city/index.html", "utf8"),
  {
    url: "https://example.test/games/city/index.html?workshop=hands-on",
    pretendToBeVisual: true,
  },
);
const w = dom.window;
// jsdom does not implement modal dialogs. Verify the real game handlers
// against the same open/close lifecycle used by the browser, without WebGL.
if (!w.HTMLDialogElement.prototype.showModal) {
  w.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new w.Event("close"));
  };
}
const scheduled = new Map();
let timerId = 0;
const schedule = (callback, delay) => {
  const id = ++timerId;
  scheduled.set(id, { callback, delay });
  return id;
};
const ctx = new Proxy(
  { canvas: {} },
  { get: (o, k) => (k in o ? o[k] : () => {}) },
);
w.HTMLCanvasElement.prototype.getContext = function (type) {
  return type === "2d" ? ctx : null;
};
for (const [key, value] of Object.entries({
  window: w,
  document: w.document,
  innerWidth: 390,
  innerHeight: 844,
  devicePixelRatio: 2,
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  requestAnimationFrame: () => {},
  setTimeout: schedule,
  clearTimeout: (id) => scheduled.delete(id),
  localStorage: w.localStorage,
  confirm: () => true,
}))
  Object.defineProperty(globalThis, key, {
    value,
    configurable: true,
    writable: true,
  });
let code = readFileSync(root + "public/games/city/game.mjs", "utf8").replace(
  /from "(\.\.?\/[^\"]+)"/g,
  (_, p) =>
    "from " +
    JSON.stringify(
      new URL(p, pathToFileURL(root + "public/games/city/game.mjs")).href,
    ),
);
code +=
  "\nexport {autoAdvanceTimer, feedbackTimer, proceedAfterCase, showCaseOutcome, pauseJourney, resumeJourney, navigationObstacles, scene, state, player, navigator, approaches, animateWorld, runCaseWorldAction, openBuiltCityView, closeBuiltCityView, renderer, goToJourneyCase, caseScenes, livingScene, rebuildNavigation, render, camera, route, journey, workshopBlueprint, firstBuildMode, buildMilestoneScene, cityDevelopment, getHandoffTopic, goTo, cancelWalk, beginManualExplore, keys, target, distance, yaw, pitch, repairQueue};";
const game = await import(
  "data:text/javascript;base64," + Buffer.from(code).toString("base64")
);

const $ = (id) => w.document.getElementById(id);
game.renderer.render = () => {};
let now = performance.now();
function step(seconds) {
  for (let i = 0; i < seconds * 50; i++) {
    now += 20;
    game.animateWorld(now);
  }
}
$("start").click();
assert(game.repairQueue.active);
assert($("detail").hidden);
assert($("repair-welcome").open);
$("repair-welcome").close();
function visit(id) {
  game.repairQueue.visit(id);
  step(12);
  assert.equal(game.repairQueue.busy, false, $("repair-message").textContent);
}
function click(text) {
  const b = [...$("repair-actions").querySelectorAll("button")].find(
    (b) => b.textContent === text,
  );
  assert(b, `button ${text}`);
  assert(!b.disabled);
  b.click();
  step(12);
}
for (const id of ["pump", "cold", "cart", "radio", "lamp", "chair"]) visit(id);
assert.equal(game.repairQueue.state.inspected.length, 6);
visit("workflow");
click("Organise the tools");
assert(game.repairQueue.state.workflow);
for (const id of ["pump", "cold", "cart", "radio", "lamp", "chair"]) {
  visit(id);
  click("Carry this job");
  assert.equal(game.repairQueue.state.held, id);
  click("Carry to queue desk");
  assert.equal(game.repairQueue.state.held, null);
}
assert.equal(game.repairQueue.state.queue.length, 6);
click("Run the shift");
step(30);
assert.equal(game.repairQueue.state.result.success, true);
assert.equal(
  Object.keys(game.state.decisions).length,
  0,
  "pilot does not fabricate production decisions or network builds",
);
click("Improve this workshop");
assert.equal(game.repairQueue.state.time, 0);
assert(game.repairQueue.state.workflow);
visit("pump");
click("Carry this job");
visit("queue");
assert.equal(game.repairQueue.state.held, "pump");
game.repairQueue.close();
assert(!game.repairQueue.active);
assert($("intro").hidden === false);
assert(!w.document.body.classList.contains("repair-pilot"));
console.log(
  "PASS: actual production scene/controller reaches six inspections, organises tools, carries every job, completes the shift, preserves production progress and returns to the entrance.",
);
