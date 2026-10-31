// Optional device-only save for fictional practice. Never store names,
// reflections, evidence, photos, credentials, or real PipuPath Quest state.
import { sanitizeAdvanced, canStartAdvanced } from "./advanced.mjs";
import { sanitizeLab } from "./build-lab.mjs";
import { sanitizeStageThree } from "./stage-three-scenarios.mjs";
import { initialPlan } from "./model.mjs";
import { getCase, getChoice } from "./cases.mjs";
import { JOURNEY_STAGES } from "./journey-flow.mjs";
import { sanitizeResilience } from "./resilience.mjs";
import { sanitizeBuilderRewards } from "./builder-rewards.mjs";
import {
  newOpportunityState,
  sanitizeOpportunityState,
} from "./opportunities.mjs";

export const PRACTICE_KEY = "unbuilt-city:practice:v1";
const VERSION = 1;
const MAX_BYTES = 18_000;
const maxAgeDays = 365;
const allowed = {
  food: ["none", "early", "packaging", "cooling"],
  diagnosis: ["", "unequal-parts", "speed"],
  support: ["", "oral-visual", "copy"],
  transfer: ["", "same-whole", "rotation"],
  policy: ["", "protect", "rotate"],
  agreement: ["", "advance", "shared"],
};
function validPlan(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const shape = initialPlan();
  return Object.keys(shape).every((key) =>
    typeof shape[key] === "boolean"
      ? typeof value[key] === "boolean"
      : allowed[key].includes(value[key]),
  );
}
function validObject(obj) {
  return obj && typeof obj === "object" && !Array.isArray(obj);
}
export function sanitizePractice(state) {
  if (
    !validObject(state) ||
    !Number.isInteger(state.day) ||
    state.day < 1 ||
    state.day > 3 ||
    !Number.isInteger(state.cash) ||
    state.cash < 0 ||
    state.cash > 1000 ||
    !validPlan(state.config) ||
    !validPlan(state.owned) ||
    !Array.isArray(state.seen) ||
    !Array.isArray(state.history) ||
    !validObject(state.decisions)
  )
    return null;
  const allowedSeen = ["power", "workshop", "market", "school", "council"];
  const seen = [
    ...new Set(state.seen.filter((id) => allowedSeen.includes(id))),
  ];
  const history = state.history.slice(0, 2).map((h) => {
    if (
      !validObject(h) ||
      ![1, 2].includes(h.day) ||
      !Number.isInteger(h.closingCash) ||
      h.closingCash < 0 ||
      !Number.isInteger(h.usable) ||
      h.usable < 0 ||
      h.usable > 10
    )
      return null;
    return { day: h.day, closingCash: h.closingCash, usable: h.usable };
  });
  if (
    history.some((h) => !h) ||
    history.length !== state.day - 1 ||
    history.some((h, i) => h.day !== i + 1)
  )
    return null;
  const decisions = {};
  for (const [caseId, choiceId] of Object.entries(state.decisions)) {
    if (getChoice(caseId, choiceId)) decisions[caseId] = choiceId;
  }
  // An optional, allowlisted journey cursor restores the exact interrupted
  // question/travel/build/outcome when device saving was explicitly enabled.
  const cursor = state.journey;
  const journey =
    validObject(cursor) &&
    getCase(cursor.caseId) &&
    JOURNEY_STAGES.includes(cursor.stage) &&
    ["running", "paused", "complete"].includes(cursor.status) &&
    (cursor.stage === "building" || cursor.stage === "outcome"
      ? Boolean(getChoice(cursor.caseId, cursor.choiceId)) &&
        decisions[cursor.caseId] === cursor.choiceId
      : cursor.choiceId == null)
      ? {
          caseId: cursor.caseId,
          stage: cursor.stage,
          choiceId: cursor.choiceId ?? null,
          status: "paused",
        }
      : null;
  return {
    day: state.day,
    cash: state.cash,
    config: { ...state.config },
    owned: { ...state.owned },
    seen,
    history,
    handedOver: state.day === 3 && state.handedOver === true,
    reflection: "", // Never persist personal text or unreviewed user content.
    decisions,
    journey,
    // Existing saves without a Chapter 3 record restore as a fresh
    // enterprise practice, without affecting the student's city decisions.
    economy: sanitizeOpportunityState(state.economy) ?? newOpportunityState(),
    resilience: sanitizeResilience(state.resilience),
    advanced: canStartAdvanced(state.resilience)
      ? sanitizeAdvanced(state.advanced)
      : null,
    lab: sanitizeLab(state.lab),
    stageThree: sanitizeStageThree(state.stageThree, state.lab),
    rewards: sanitizeBuilderRewards(state.rewards),
  };
}
function getStorage(storage) {
  try {
    return (
      storage ?? (typeof localStorage !== "undefined" ? localStorage : null)
    );
  } catch {
    return null;
  }
}
export function loadPractice(storage) {
  const store = getStorage(storage);
  if (!store) return null;
  try {
    const raw = store.getItem(PRACTICE_KEY);
    if (!raw || raw.length > MAX_BYTES) return null;
    const envelope = JSON.parse(raw);
    if (
      !validObject(envelope) ||
      envelope.version !== VERSION ||
      envelope.consent !== true ||
      !Number.isFinite(envelope.savedAt) ||
      envelope.savedAt < Date.now() - maxAgeDays * 86_400_000 ||
      envelope.savedAt > Date.now() + 86_400_000
    )
      return null;
    return sanitizePractice(envelope.state);
  } catch {
    return null;
  }
}
export function savePractice(state, storage) {
  const store = getStorage(storage);
  const safe = sanitizePractice(state);
  if (!store || !safe) return false;
  try {
    const raw = JSON.stringify({
      version: VERSION,
      consent: true,
      savedAt: Date.now(),
      state: safe,
    });
    if (raw.length > MAX_BYTES) return false;
    store.setItem(PRACTICE_KEY, raw);
    return store.getItem(PRACTICE_KEY) === raw;
  } catch {
    return false;
  }
}
export function clearPractice(storage) {
  const store = getStorage(storage);
  if (!store) return false;
  try {
    store.removeItem(PRACTICE_KEY);
    return store.getItem(PRACTICE_KEY) === null;
  } catch {
    return false;
  }
}
