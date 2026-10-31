import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import * as T from "../../public/games/shared/vendor/three.module.js";
import { mountBuilderRewards } from "../../public/games/city/builder-rewards-ui.mjs";
import { createBuilderCosmetics } from "../../public/games/city/builder-cosmetics.mjs";
import {
  BUILDER_ITEMS,
  builderBalance,
  sanitizeBuilderRewards,
} from "../../public/games/city/builder-rewards.mjs";
import {
  sanitizePractice,
  savePractice,
  loadPractice,
} from "../../public/games/city/practice-save.mjs";
import { initialPlan } from "../../public/games/city/model.mjs";

const dom = new JSDOM(readFileSync("public/games/city/index.html", "utf8"), {
  url: "https://example.test/games/city/index.html",
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
let state = sanitizePractice({
  day: 1,
  cash: 18,
  config: initialPlan(),
  owned: initialPlan(),
  seen: [],
  history: [],
  decisions: {},
  rewards: {
    version: 2,
    awards: Array.from({ length: 12 }, (_, i) => ({
      chapter: i + 1,
      tier: "thriving",
      credits: 50,
    })),
    purchases: [],
    equipped: [],
    viewed: Array.from({ length: 12 }, (_, i) => i + 1),
  },
});
const plazas = new Map(
  ["workshop", "market"].map((id) => [id, { root: new T.Group() }]),
);
const player = { g: new T.Group() };
const cosmetics = createBuilderCosmetics({ T, plazas, player, lowPower: true });
let time = 0,
  tones = 0;
const shop = mountBuilderRewards({
  getState: () => state,
  setRewards: (rewards) => {
    state.rewards = rewards;
    cosmetics.sync(rewards);
  },
  getChapterItems: () => [],
  getBuiltDistrictIds: () => [...plazas.keys()],
  getChapterImpact: () => "Tested city",
  isJourneyRunning: () => false,
  isPlaying: () => true,
  isBlockingCelebration: () => false,
  pauseForReward() {},
  continueBuilding() {},
  viewCity() {},
  playSuccess: () => tones++,
  now: () => time,
});
const $ = (id) => document.getElementById(id);
function buyButton(name) {
  return [...document.querySelectorAll(".builder-shop-product")]
    .find((card) => card.querySelector("strong").textContent === name)
    .querySelector("button");
}
shop.openShop();
const cash = state.cash,
  initial = builderBalance(state.rewards);
const first = buyButton("Flower Garden");
first.click();
first.click(); // An event queued for a detached pre-render button cannot charge again.
buyButton("Flower Garden").click(); // Nor can a double tap hit its replacement.
assert.equal(state.rewards.purchases.length, 1);
assert.equal(builderBalance(state.rewards), initial - 20);
assert.equal(tones, 1);
time += 700;
buyButton("Flower Garden").click();
assert.equal(state.rewards.purchases.length, 2);
assert.equal(
  plazas.get("workshop").root.children.filter((g) => g.visible).length,
  2,
);
assert.notDeepEqual(
  plazas.get("workshop").root.children[0].position.toArray(),
  plazas.get("workshop").root.children[1].position.toArray(),
);

for (const item of BUILDER_ITEMS.filter(
  (i) => i.category === "city" && i.id !== "flowers",
)) {
  const district = ["trees", "benches"].includes(item.id)
    ? "workshop"
    : "market";
  $("shop-district").value = district;
  $("shop-district").dispatchEvent(new w.Event("change"));
  for (let count = 0; count < 2; count++) {
    time += 700;
    const before = builderBalance(state.rewards);
    buyButton(item.name).click();
    assert.equal(builderBalance(state.rewards), before - item.cost);
    assert.equal(state.rewards.purchases.at(-1).district, district);
  }
}
assert.equal(
  plazas.get("workshop").root.children.filter((g) => g.visible).length,
  6,
);
assert.equal(
  plazas.get("market").root.children.filter((g) => g.visible).length,
  4,
);
$("shop-builder-tab").click();
time += 700;
buyButton("Builder Helmet").click();
const unlocked = builderBalance(state.rewards);
buyButton("Builder Helmet").click(); // Take off, then put on; no second purchase.
buyButton("Builder Helmet").click();
assert.equal(builderBalance(state.rewards), unlocked);
assert.equal(
  state.rewards.purchases.filter((p) => p.id === "helmet").length,
  1,
);
assert.equal(state.rewards.equipped.includes("helmet"), true);
assert.equal(
  state.cash,
  cash,
  "Builder Credits must not spend city operating funds",
);
assert.equal("xp" in state, false);

assert(savePractice(state, w.localStorage));
$("shop-close").click();
state = loadPractice(w.localStorage);
assert(state);
assert.equal(state.rewards.purchases.length, 11);
cosmetics.sync(state.rewards);
shop.openShop();
assert.equal(builderBalance(state.rewards), unlocked);
assert.equal(
  plazas.get("workshop").root.children.length,
  6,
  "Reopening cannot duplicate meshes",
);
assert.equal(plazas.get("market").root.children.length, 4);
const secondPlazas = new Map(
  [...plazas.keys()].map((id) => [id, { root: new T.Group() }]),
);
createBuilderCosmetics({
  T,
  plazas: secondPlazas,
  player: { g: new T.Group() },
  lowPower: true,
}).sync(state.rewards);
assert.equal(secondPlazas.get("workshop").root.children.length, 6);
assert.equal(secondPlazas.get("market").root.children.length, 4);
assert.deepEqual(sanitizeBuilderRewards(state.rewards), state.rewards);
$("shop-close").click();
const originalTimeout = globalThis.setTimeout;
let scheduledCelebration = null;
globalThis.setTimeout = (callback) => {
  scheduledCelebration = callback;
  return 1;
};
state.rewards.viewed = [];
shop.schedule();
for (let chapter = 1; chapter <= 12; chapter++) {
  assert(scheduledCelebration, "Every earned chapter needs a celebration");
  const reveal = scheduledCelebration;
  scheduledCelebration = null;
  reveal();
  assert.equal($("chapter-celebration").open, true);
  assert.match(
    $("celebration-kicker").textContent,
    new RegExp("CHAPTER " + chapter + " COMPLETE"),
  );
  $("celebration-continue").click();
  assert.equal($("chapter-celebration").open, false);
}
assert.equal(scheduledCelebration, null);
assert.equal(
  builderBalance(state.rewards),
  unlocked,
  "Celebrating cannot award credits twice",
);
globalThis.setTimeout = originalTimeout;
console.log(
  "PASS: actual shop repeat purchases, double-tap protection, exact costs, selected-district 3D decor, one-time accessories and close/reload persistence.",
);
dom.window.close();
