import assert from "node:assert/strict";
import { CITY_CASES } from "../../public/games/city/cases.mjs";
import {
  BUILDER_ITEMS,
  emptyBuilderRewards,
  sanitizeBuilderRewards,
  builderBalance,
  chapterRating,
  awardCompletedChapters,
  purchaseBuilderItem,
  toggleBuilderItem,
  acknowledgeChapter,
  nextCelebration,
  decorationCount,
  MAX_DISTRICT_DECOR,
  MAX_ITEM_PER_DISTRICT,
} from "../../public/games/city/builder-rewards.mjs";
import { sanitizePractice } from "../../public/games/city/practice-save.mjs";
import { initialPlan } from "../../public/games/city/model.mjs";
import { newOpportunityState } from "../../public/games/city/opportunities.mjs";

const early = emptyBuilderRewards();
assert.equal(builderBalance(early), 0);
assert.equal(nextCelebration(early), null);
const choices = Object.fromEntries(
  CITY_CASES.map((c) => [c.id, c.options[0].id]),
);
const scene = {
  decisions: choices,
  economy: {
    day: 7,
    history: [
      { day: 1, meals: 12, patients: 9, repairs: 3, unserved: 1 },
      { day: 2, meals: 8, patients: 9, repairs: 4, unserved: 2 },
    ],
  },
  resilience: null,
};
assert.equal(chapterRating(3, scene).tier, "thriving");
assert.equal(
  chapterRating(3, {
    ...scene,
    economy: { history: [{ meals: 0, patients: 0, repairs: 0, unserved: 20 }] },
  }).tier,
  "repair",
);
const completed = [1, 2, 3].map((chapter) => ({ chapter, completed: true }));
const earned = awardCompletedChapters(early, completed, scene);
assert.equal(earned.newly.length, 3);
assert.equal(earned.rewards.awards.length, 3);
const allChapters = Array.from({ length: 12 }, (_, i) => ({
  chapter: i + 1,
  completed: true,
}));
assert.equal(
  awardCompletedChapters(early, allChapters, scene).newly.length,
  12,
  "all chapters must have independent, once-only milestones",
);
assert.equal(
  awardCompletedChapters(earned.rewards, completed, scene).newly.length,
  0,
  "replaying, refreshing, and revising must not award the chapter twice",
);
assert(builderBalance(earned.rewards) > 50);
assert.equal(nextCelebration(earned.rewards).chapter, 1);
const seen = acknowledgeChapter(earned.rewards, 1);
assert.equal(nextCelebration(seen).chapter, 2);
const notBuilt = purchaseBuilderItem(earned.rewards, "flowers", "power", []);
assert.equal(notBuilt.ok, false);
const planted = purchaseBuilderItem(earned.rewards, "flowers", "workshop", [
  "workshop",
]);
assert.equal(planted.ok, true);
assert.equal(
  builderBalance(planted.rewards),
  builderBalance(earned.rewards) - 20,
);
assert.equal(planted.rewards.purchases[0].district, "workshop");
const plantedAgain = purchaseBuilderItem(
  planted.rewards,
  "flowers",
  "workshop",
  ["workshop"],
);
assert.equal(
  plantedAgain.ok,
  true,
  "repeatable city decoration should be purchasable more than once",
);
assert.equal(decorationCount(plantedAgain.rewards, "workshop", "flowers"), 2);
assert.notEqual(
  plantedAgain.rewards.purchases[0].serial,
  plantedAgain.rewards.purchases[1].serial,
);

const worn = purchaseBuilderItem(planted.rewards, "helmet", null);
assert.equal(worn.ok, true);
assert(worn.rewards.equipped.includes("helmet"));
const removed = toggleBuilderItem(worn.rewards, "helmet");
assert(!removed.equipped.includes("helmet"));
assert(toggleBuilderItem(removed, "helmet").equipped.includes("helmet"));
assert.equal(purchaseBuilderItem(early, "helmet", null).ok, false);
assert.equal(purchaseBuilderItem(earned.rewards, "real-money", null).ok, false);
assert(
  BUILDER_ITEMS.every((item) => ["city", "builder"].includes(item.category)),
);
const safe = sanitizeBuilderRewards({
  version: 1,
  awards: [
    { chapter: 1, tier: "growing", credits: 30 },
    { chapter: 1, tier: "growing", credits: 30 },
    { chapter: 2, tier: "thriving", credits: 10000 },
  ],
  purchases: [
    { id: "flowers", district: "workshop" },
    { id: "flowers", district: "market" },
    { id: "unknown", district: "power" },
  ],
  equipped: ["helmet", "unknown"],
  viewed: [1, 1, 12],
});
assert.equal(safe.awards.length, 1);
assert.equal(safe.purchases.length, 1);
assert.equal(safe.equipped.length, 0);
assert.deepEqual(safe.viewed, [1]);
const base = {
  day: 1,
  cash: 18,
  config: initialPlan(),
  owned: initialPlan(),
  seen: [],
  history: [],
  decisions: {},
  economy: newOpportunityState(),
};
assert.equal(
  sanitizePractice(base).rewards.version,
  2,
  "old saves must migrate to the new purchase ledger",
);
assert.equal(safe.version, 2);
assert.equal(
  safe.purchases[0].serial,
  1,
  "old single-purchase saves receive stable identities",
);
const rewardBank = awardCompletedChapters(
  early,
  Array.from({ length: 12 }, (_, i) => ({ chapter: i + 1, completed: true })),
  {
    ...scene,
    advanced: { records: Array.from({ length: 16 }, () => ({ score: 100 })) },
  },
).rewards;
let decorating = rewardBank;
for (let i = 0; i < MAX_ITEM_PER_DISTRICT; i++) {
  const r = purchaseBuilderItem(decorating, "flowers", "workshop", [
    "workshop",
  ]);
  assert(r.ok, "each district allows three matching gardens");
  decorating = r.rewards;
}
assert.equal(
  purchaseBuilderItem(decorating, "flowers", "workshop", ["workshop"]).ok,
  false,
  "per-type capacity stops visual overlap",
);
for (let i = 3; i < MAX_DISTRICT_DECOR; i++) {
  const r = purchaseBuilderItem(decorating, "trees", "workshop", ["workshop"]);
  assert(r.ok);
  decorating = r.rewards;
}
assert.equal(
  purchaseBuilderItem(decorating, "benches", "workshop", ["workshop"]).ok,
  false,
  "district decoration cap prevents overload",
);
assert.equal(
  purchaseBuilderItem(decorating, "flowers", "market", ["market"]).ok,
  true,
  "new district unlocks new decoration space",
);
assert.equal(
  sanitizeBuilderRewards(decorating).purchases.length,
  MAX_DISTRICT_DECOR,
);
assert.equal(
  chapterRating(5, {
    ...scene,
    advanced: { records: [{ score: 100 }, { score: 90 }] },
  }).tier,
  "thriving",
);
assert.equal(
  chapterRating(5, {
    ...scene,
    advanced: { records: [{ score: 75 }, { score: 75 }] },
  }).tier,
  "repair",
);
assert.equal(
  chapterRating(5, {
    ...scene,
    advanced: { records: [{ score: 85 }, { score: 100 }] },
  }).tier,
  "growing",
);

const withRewards = sanitizePractice({ ...base, rewards: planted.rewards });
assert.deepEqual(
  withRewards.rewards.purchases,
  planted.rewards.purchases,
  "cosmetics must survive optional saving and cloud backup sanitization",
);
assert.deepEqual(
  sanitizePractice(withRewards).rewards,
  withRewards.rewards,
  "saving repeatedly must not duplicate purchases or credits",
);
console.log(
  "PASS: chapters award once, challenge-based tiers, repeatable district decor and 3D identities, character equip, safe restores, v1 migration.",
);
