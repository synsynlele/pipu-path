import assert from "node:assert/strict";
import { CITY_CASES } from "../../public/games/city/cases.mjs";
import {
  BUILDER_ITEMS,
  CITY_DECOR_SLOTS,
  emptyBuilderRewards,
  sanitizeBuilderRewards,
  builderBalance,
  chapterRating,
  awardCompletedChapters,
  purchaseBuilderItem,
  toggleBuilderItem,
  acknowledgeChapter,
  nextCelebration,
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
const another = purchaseBuilderItem(planted.rewards, "flowers", "workshop", ["workshop"]);
assert.equal(another.ok, true, "Flowers can be bought repeatedly in the same district");
assert.deepEqual(another.rewards.purchases.filter((p) => p.district === "workshop")
 .map((p) => p.slot), [0, 1], "Each repeat must occupy a distinct location");
const moreCity = purchaseBuilderItem(another.rewards, "trees", "market", ["workshop", "market"]);
assert.equal(moreCity.ok, true, "Decorations may be placed in different districts");
const allCredits = awardCompletedChapters(early, allChapters, scene).rewards;
let districtFull = allCredits;
for(let i=0;i<CITY_DECOR_SLOTS;i++){
 const next=purchaseBuilderItem(districtFull, "flowers", "workshop", ["workshop"]);
 assert.equal(next.ok,true,"Placement "+i+" must remain available");
 districtFull=next.rewards;
}
assert.equal(purchaseBuilderItem(districtFull, "flowers", "workshop", ["workshop"]).ok,false,
 "A full district must not let two decorations overwrite one slot");
assert.equal(purchaseBuilderItem(districtFull, "flowers", "market", ["workshop","market"]).ok,true,
 "Full districts must not block buying in other built districts");
const restoredLegacy = sanitizeBuilderRewards({version:1,awards:allCredits.awards,
 purchases:[{id:"flowers",district:"workshop"},{id:"trees",district:"workshop"}],
 equipped:[],viewed:[]});
assert.deepEqual(restoredLegacy.purchases.map((p)=>p.slot),[0,1],
 "Existing decorations without slots remain visible after the upgrade");

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
    { chapter: 1, tier: "thriving", credits: 50 },
    { chapter: 1, tier: "thriving", credits: 50 },
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
assert.equal(safe.purchases.length, 2);
assert.deepEqual(safe.purchases.map((p)=>p.slot),[0,0],
 "Existing same-item ornaments in different districts are preserved");
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
  1,
  "old saves must remain valid",
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
  "PASS: chapters award once, fair tiers, virtual-only shop, equip/unequip, safe restores, and old-save compatibility.",
);
