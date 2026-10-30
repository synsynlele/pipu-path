import assert from "node:assert/strict";
import * as T from "../../public/games/shared/vendor/three.module.js";
import { overlapsRoad } from "../../public/games/city/layout.mjs";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const root = process.cwd() + "/";
const dom = new JSDOM(
  readFileSync(root + "public/games/city/index.html", "utf8"),
  {
    url: "https://example.test/games/city/index.html",
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
  "\nexport {autoAdvanceTimer, feedbackTimer, proceedAfterCase, showCaseOutcome, pauseJourney, resumeJourney, navigationObstacles, scene, state, player, navigator, approaches, animateWorld, runCaseWorldAction, openBuiltCityView, closeBuiltCityView, renderer, goToJourneyCase, caseScenes, livingScene, rebuildNavigation, render, camera, route, journey, workshopBlueprint, firstBuildMode, mixedJourney, buildMilestoneScene};";
const game = await import(
  "data:text/javascript;base64," + Buffer.from(code).toString("base64")
);
// Keep the real game setup, navigation, simulation and DOM; the canvas context
// is a stub. This verifies integration, not WebGL or physical-device performance.
game.renderer.render = () => {};
const { CITY_CASES } = await import(
  pathToFileURL(root + "public/games/city/cases.mjs")
);
let now = performance.now();
// Actual first tap: a hands-on network, never a question panel.
const freshDecisions = JSON.stringify(game.state.decisions);
assert.equal(w.document.getElementById("intro").hidden, false);
w.document.getElementById("start").click();
assert.equal(w.document.getElementById("intro").hidden, true);
assert.equal(w.document.getElementById("build-lab").open, true);
assert.equal(w.document.getElementById("lab-mission").value, "workshop-link");
assert.match(
  w.document.getElementById("lab-title").textContent,
  /first build/i,
);
assert.equal(w.document.querySelectorAll("[data-case-choice]").length, 0);
assert.equal(JSON.stringify(game.state.decisions), freshDecisions);
assert.equal(game.workshopBlueprint.visible, false);
assert.equal(game.firstBuildMode, true);
// Solve an actual playable supply route using its touch-friendly controls.
const pilotCell = (row, col) =>
  w.document.querySelector(
    '[aria-label^="Row ' + row + ", column " + col + ':"]',
  );
w.document.querySelector('[data-lab-tool="bend"]').click();
w.document.getElementById("lab-rotate").click();
pilotCell(2, 1).click();
w.document.querySelector('[data-lab-tool="straight"]').click();
for (const col of [2, 3, 4]) pilotCell(2, col).click();
w.document.querySelector('[data-lab-tool="bend"]').click();
w.document.getElementById("lab-rotate").click();
pilotCell(2, 5).click();
w.document.getElementById("lab-test").click();
assert.match(w.document.getElementById("lab-result").textContent, /It works!/);
assert.equal(w.document.getElementById("lab-see-city").hidden, false);
assert.equal(game.workshopBlueprint.visible, true);
assert(game.workshopBlueprint.children.length > 5, "A physical 3D station must be constructed");
assert(game.state.lab.tested.includes("workshop-link"));
w.document.getElementById("lab-see-city").click();
assert.equal(w.document.getElementById("build-lab").open, false);
assert.equal(w.document.getElementById("build-victory").hidden, false);
assert.match(w.document.getElementById("victory-title").textContent, /built!/);
assert.match(w.document.getElementById("victory-progress").textContent, /1 \/ 5/);
assert.equal(JSON.stringify(game.state.decisions), freshDecisions);
assert.equal(w.document.querySelectorAll("[data-case-choice]").length, 0);
// The default completion button starts the mixed question-and-puzzle adventure.
w.document.getElementById("victory-continue").click();
assert.equal(game.mixedJourney, true);
assert.equal(game.firstBuildMode, false);
assert.equal(w.document.getElementById("build-victory").hidden, true);
// A returning player can still select the legacy authored story.
game.pauseJourney();
w.document.getElementById("pilot-story").click();
assert.equal(game.mixedJourney, false);
assert.equal(w.document.getElementById("pilot-mission").hidden, true);
assert.equal(game.state.lab.boards["workshop-link"].filter(Boolean).length, 5);
assert(game.state.lab.tested.includes("workshop-link"));
game.pauseJourney();
console.log(
  "PASS: first tap builds without questions, tested network glows, and story resumes without resetting.",
);

w.document.getElementById("intro").hidden = true;
for (let option = 0; option < 3; option++) {
  for (const c of CITY_CASES) game.state.decisions[c.id] = c.options[option].id;
  game.render();
  for (const block of game.navigationObstacles) {
    const x = (block.minX + block.maxX) / 2,
      z = (block.minZ + block.maxZ) / 2;
    assert(
      !overlapsRoad(x, z, block.maxX - block.minX, block.maxZ - block.minZ),
      "Collidable structure intrudes into road",
    );
  }
  game.scene.updateMatrixWorld(true);
  game.scene.traverse((object) => {
    if (!object.userData.scenery) return;
    const bounds = new T.Box3().setFromObject(object),
      size = bounds.getSize(new T.Vector3());
    assert(
      !overlapsRoad(
        (bounds.min.x + bounds.max.x) / 2,
        (bounds.min.z + bounds.max.z) / 2,
        size.x,
        size.z,
      ),
      object.userData.scenery + " overlaps road",
    );
  });
  for (const c of CITY_CASES) {
    const initial = game.player.g.position.clone();
    game.goToJourneyCase(c.id);
    assert(
      game.player.g.position.equals(initial),
      "Journey teleported on entry",
    );
    let frames = 0;
    while (game.route.length && frames++ < 1800) {
      const before = game.player.g.position.clone();
      now += 100;
      game.animateWorld(now);
      assert(
        game.player.g.position.distanceTo(before) <= 1.61,
        "Walking frame jumped",
      );
      assert(
        game.navigator.free(game.player.g.position),
        "Walked through a building",
      );
    }
    if (game.route.length)
      console.log(
        "STUCK",
        c.id,
        game.player.g.position.toArray(),
        game.route,
        game.journey,
      );
    assert.equal(game.route.length, 0, c.id + " never arrived");
    assert.equal(
      game.journey.stage,
      "question",
      c.id + " failed to open on arrival",
    );
  }
}
// My City exposes human needs and the exact authored consequence, and its
// repair action opens the existing revision flow without dropping progress.
w.document.getElementById("intro").hidden = true;
game.state.decisions["repair-parts"] = "guess";
game.render();
w.document.getElementById("city-status-toggle").click();
assert.equal(w.document.getElementById("city-status").hidden, false);
assert.equal(w.document.querySelectorAll(".city-life-goal").length, 14);
assert(w.document.querySelectorAll(".city-life-results").length > 0);
const improveWorkshop = w.document.querySelector(".city-life-review");
assert(improveWorkshop);
assert.equal(
  improveWorkshop.getAttribute("aria-label"),
  "Improve a decision in Repair & Maintenance",
);
const preservedDecisions = JSON.stringify(game.state.decisions);
improveWorkshop.click();
assert.equal(w.document.getElementById("city-status").hidden, true);
assert(w.document.querySelector("[data-case-choice]"));
assert.equal(JSON.stringify(game.state.decisions), preservedDecisions);
// Leave revision before exercising the independent full journey regressions.
w.document.getElementById("review-cancel").click();

// Optional city worksite: the first practice result opens the same Build Lab,
// pauses the journey, and leaves its kept decision untouched.
game.goToJourneyCase(CITY_CASES[0].id);
let pilotFrames = 0;
while (game.route.length && pilotFrames++ < 1800) {
  now += 100;
  game.animateWorld(now);
}
const pilotButton = w.document.querySelector("[data-case-choice]");
assert(pilotButton);
pilotButton.click();
const pilotCase = JSON.stringify(game.state.decisions);
const pilotFeedback = scheduled.get(game.feedbackTimer);
assert(pilotFeedback, "Pilot outcome reveal is scheduled");
scheduled.delete(game.feedbackTimer);
pilotFeedback.callback();
assert(w.document.getElementById("case-worksite"));
w.document.getElementById("case-worksite").click();
assert(w.document.getElementById("build-lab").open);
assert.equal(w.document.getElementById("lab-mission").value, "workshop-link");
assert.equal(JSON.stringify(game.state.decisions), pilotCase);
w.document.getElementById("lab-close").click();
assert.equal(JSON.stringify(game.state.decisions), pilotCase);
game.pauseJourney();
for (const key of Object.keys(game.state.decisions))
  delete game.state.decisions[key];
game.render();

// Execute the actual answer -> reveal -> next -> chapter -> travel callbacks.
// Previous navigation tests jumped straight into cases and missed this boundary.
function fireTimer(id) {
  const task = scheduled.get(id);
  assert(task, "Expected a scheduled journey callback");
  scheduled.delete(id);
  task.callback();
}
function arrive() {
  let frames = 0;
  while (game.route.length && frames++ < 1800) {
    now += 100;
    game.animateWorld(now);
  }
  assert.equal(
    game.route.length,
    0,
    "Journey failed to reach the next question",
  );
}
for (const optionIndex of [0, 2]) {
  for (const key of Object.keys(game.state.decisions))
    delete game.state.decisions[key];
  game.render();
  game.goToJourneyCase(CITY_CASES[0].id);
  arrive();
  for (const [index, item] of CITY_CASES.entries()) {
    assert.equal(game.journey.caseId, item.id);
    assert.equal(game.journey.stage, "question");
    const choice = item.options[optionIndex];
    const button = w.document.querySelector(
      '[data-case-choice="' + choice.id + '"]',
    );
    assert(button, "Missing actual answer control at decision " + (index + 1));
    button.click();
    assert.equal(Object.keys(game.state.decisions).length, index + 1);
    fireTimer(game.feedbackTimer);
    assert.equal(game.journey.stage, "outcome");
    let error;
    try {
      fireTimer(game.autoAdvanceTimer);
    } catch (failure) {
      error = failure.message;
    }
    assert.equal(
      error,
      undefined,
      "Advancing after decision " + (index + 1) + " threw",
    );
    if (index === 15) {
      assert.equal(game.journey.stage, "chapter");
      assert(
        w.document.getElementById("chapter-start"),
        "Chapter 2 start control missing",
      );
      // Exercise manual start in one playthrough and automatic start in another.
      if (optionIndex === 0) {
        game.pauseJourney();
        assert.equal(game.journey.status, "paused");
        assert.equal(game.state.journey.stage, "chapter");
        game.resumeJourney();
        assert.equal(game.journey.stage, "chapter");
        w.document.getElementById("chapter-start").click();
      } else {
        Object.defineProperty(w.document, "hidden", {
          configurable: true,
          value: true,
        });
        fireTimer(game.autoAdvanceTimer);
        assert.equal(game.journey.status, "paused");
        assert.equal(game.journey.stage, "chapter");
        Object.defineProperty(w.document, "hidden", {
          configurable: true,
          value: false,
        });
        game.resumeJourney();
        fireTimer(game.autoAdvanceTimer);
      }
      assert.equal(game.journey.caseId, CITY_CASES[16].id);
      assert.equal(
        Object.keys(game.state.decisions).length,
        16,
        "Handoff erased decisions",
      );
    }
    if (index < 35) {
      arrive();
      assert.equal(game.journey.caseId, CITY_CASES[index + 1].id);
      assert.equal(game.journey.stage, "question");
    }
  }
  assert.equal(game.journey.stage, "complete");
  assert.equal(
    w.document.getElementById("opportunities-toggle").disabled,
    false,
  );
}
console.log(
  "PASS: two complete 36-answer journeys execute real callbacks through manual and automatic Chapter 2 handoff and unlock Chapter 3.",
);
// Chapter 3 -> 4 through the actual controls, rather than a direct model jump.
for (const c of CITY_CASES) game.state.decisions[c.id] = c.options[0].id;
game.render();
assert.equal(w.document.getElementById("resilience-toggle").disabled, true);
w.document.querySelector("#city-menu > summary").click();
assert.equal(w.document.getElementById("city-menu").open, true);
w.document.getElementById("opportunities-toggle").click();
assert.equal(w.document.getElementById("city-menu").open, false);
assert.equal(w.document.getElementById("opportunities-panel").hidden, false);
const enterpriseSelect = w.document.getElementById("opportunities-business");
enterpriseSelect.value = "water";
enterpriseSelect.dispatchEvent(new w.Event("change", { bubbles: true }));
for (let day = 0; day < 7; day++) {
  assert.equal(w.document.getElementById("chapter-four-start").hidden, true);
  w.document.getElementById("opportunities-run").click();
  assert.equal(game.state.economy.day, day + 1);
}
assert.equal(w.document.getElementById("chapter-four-start").hidden, false);
assert.equal(w.document.getElementById("resilience-toggle").disabled, false);
const previousEconomy = JSON.stringify(game.state.economy);
const previousCity = JSON.stringify(game.state.decisions);
w.document.getElementById("chapter-four-start").click();
assert.equal(w.document.getElementById("opportunities-panel").hidden, true);
assert.equal(w.document.getElementById("resilience-panel").hidden, false);
for (let round = 0; round < 3; round++) {
  const button = w.document.querySelector("#resilience-choices button");
  assert(button);
  const beforePlan = JSON.stringify(game.state.resilience);
  button.click();
  assert.equal(
    JSON.stringify(game.state.resilience),
    beforePlan,
    "Testing a plan must not advance or overwrite saved Chapter 4 progress",
  );
  assert.equal(w.document.getElementById("resilience-preview").hidden, false);
  assert.equal(w.document.getElementById("resilience-commit").hidden, false);
  if (round === 0) {
    const another = w.document.querySelectorAll(
      "#resilience-choices button",
    )[1];
    another.click();
    assert.equal(JSON.stringify(game.state.resilience), beforePlan);
    assert.equal(
      w.document.querySelectorAll("[aria-pressed=true]").length >= 1,
      true,
    );
  }
  w.document.getElementById("resilience-commit").click();
  assert.equal(game.state.resilience.choices.length, round + 1);
  // A closed/reopened panel resumes; it never seeds another city or chapter.
  w.document.getElementById("resilience-close").click();
  w.document.getElementById("resilience-toggle").click();
  assert.equal(game.state.resilience.choices.length, round + 1);
}
assert.equal(
  w.document.querySelectorAll("#resilience-choices button").length,
  0,
);
assert.equal(JSON.stringify(game.state.economy), previousEconomy);
assert.equal(JSON.stringify(game.state.decisions), previousCity);
w.document.getElementById("resilience-view").click();
assert.equal(game.camera.type, "OrthographicCamera");
game.closeBuiltCityView();
w.document.getElementById("resilience-toggle").click();
w.document.getElementById("resilience-reset").click();
assert.equal(game.state.resilience.choices.length, 0);
assert.equal(JSON.stringify(game.state.economy), previousEconomy);
w.document.getElementById("resilience-close").click();
console.log(
  "PASS: actual dropdown, seven Chapter 3 days, Chapter 4 handoff, three challenges, reopen/resume, city inspection and isolated restart.",
);
game.openBuiltCityView();
now += 100;
game.animateWorld(now);
assert.equal(game.camera.type, "OrthographicCamera");
const oldZoom = game.camera.zoom;
w.document.getElementById("city-view-zoom-in").click();
assert(game.camera.zoom > oldZoom);
game.closeBuiltCityView();
assert.equal(game.camera.type, "PerspectiveCamera");
console.log(
  "PASS: actual mobile game runtime, all 108 journeys without teleportation, road-free trees/houses, overview zoom and camera restoration. Canvas/GPU not tested.",
);
process.exit(0);
