import assert from "node:assert/strict";
import { initialPlan } from "../../public/games/city/model.mjs";
import { newOpportunityState } from "../../public/games/city/opportunities.mjs";
import {
  PRACTICE_KEY,
  sanitizePractice,
  loadPractice,
  savePractice,
  clearPractice,
} from "../../public/games/city/practice-save.mjs";
const store = new Map();
const fake = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, v) => store.set(key, v),
  removeItem: (key) => store.delete(key),
};
const state = {
  day: 1,
  cash: 18,
  config: initialPlan(),
  owned: initialPlan(),
  seen: ["workshop", "power", "fake", "workshop"],
  history: [],
  handedOver: false,
  reflection: "A learner's sensitive personal account should never be saved",
  name: "NO PERSONAL DATA",
  decisions: { "repair-queue": "first", fake: "invalid" },
  journey: {
    caseId: "repair-queue",
    stage: "outcome",
    choiceId: "first",
    status: "running",
  },
};
assert.equal(loadPractice(fake), null, "explicit consent required");
assert.equal(savePractice(state, fake), true);
const raw = fake.getItem(PRACTICE_KEY);
assert(
  !raw.includes("sensitive personal account") &&
    !raw.includes("NO PERSONAL DATA"),
);
const restored = loadPractice(fake);
assert.deepEqual(restored.seen, ["workshop", "power"]);
assert.equal(restored.reflection, "");
assert.deepEqual(restored.decisions, { "repair-queue": "first" });
assert.equal(restored.day, 1);
assert.deepEqual(restored.economy, newOpportunityState());
assert.deepEqual(restored.journey, {
  caseId: "repair-queue",
  stage: "outcome",
  choiceId: "first",
  status: "paused",
});
assert.equal(
  sanitizePractice({
    ...state,
    journey: { caseId: "fake", stage: "question", status: "paused" },
  }).journey,
  null,
);
assert.equal(
  sanitizePractice({
    ...state,
    journey: {
      caseId: "repair-queue",
      stage: "building",
      choiceId: "rush",
      status: "paused",
    },
  }).journey,
  null,
);
assert.equal(
  sanitizePractice({
    ...state,
    journey: {
      caseId: "repair-queue",
      stage: "question",
      choiceId: null,
      status: "paused",
    },
  }).journey.stage,
  "question",
);
const firstEconomy = { ...newOpportunityState(), policy: "people" };
assert.equal(savePractice({ ...state, economy: firstEconomy }, fake), true);
assert.deepEqual(
  loadPractice(fake).economy,
  firstEconomy,
  "Optional seven-day practice settings restore without leaking details",
);
assert.deepEqual(
  sanitizePractice({
    ...state,
    economy: {
      day: 999,
      policy: "unsafe",
      stocks: null,
      history: [],
    },
  }).economy,
  newOpportunityState(),
  "Invalid enterprise state resets safely while 36 choices survive",
);
assert.equal(clearPractice(fake), true);
assert.equal(loadPractice(fake), null);
assert.equal(sanitizePractice({ ...state, day: 7 }), null);
assert.equal(sanitizePractice({ ...state, decisions: null }), null);
assert.equal(
  sanitizePractice({ ...state, config: { ...state.config, food: "unsafe" } }),
  null,
);
assert.equal(sanitizePractice({ ...state, day: 2, history: [] }), null);
assert.equal(savePractice({ ...state, day: 3 }, fake), false);
const broken = {
  getItem() {
    throw new Error("blocked");
  },
  setItem() {
    throw new Error("blocked");
  },
  removeItem() {
    throw new Error("blocked");
  },
};
assert.equal(loadPractice(broken), null);
assert.equal(savePractice(state, broken), false);
assert.equal(clearPractice(broken), false);
assert.equal(savePractice(state, fake), true);
fake.setItem(
  PRACTICE_KEY,
  JSON.stringify({ version: 999, consent: true, savedAt: Date.now(), state }),
);
assert.equal(loadPractice(fake), null);
console.log(
  "PASS: opt-in same-device saves, bounded restoration, reset, invalid saves, blocked storage and no private-text persistence.",
);
