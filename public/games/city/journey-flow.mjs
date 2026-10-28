// Unbuilt City: a single recoverable journey, distinct from the legacy
// optional two-day city simulation. Pure helpers are used by UI and tests.
import { CITY_CASES, getChoice } from "./cases.mjs";

export const JOURNEY_STAGES = Object.freeze([
  "travelling", "question", "building", "outcome", "complete",
]);
export function firstUnanswered(decisions = {}) {
  return CITY_CASES.find((c) => !getChoice(c.id, decisions[c.id])) ?? null;
}
export function recoverJourney({ caseId, stage, choiceId, decisions = {} } = {}) {
  const current = CITY_CASES.find((c) => c.id === caseId);
  if (current && stage === "travelling")
    return { caseId, stage: "travelling", choiceId: null };
  if (current && stage === "question")
    return { caseId, stage: "question", choiceId: null };
  if (current && ["building", "outcome"].includes(stage) &&
      getChoice(caseId, choiceId) && decisions[caseId] === choiceId)
    return { caseId, stage, choiceId };
  const next = firstUnanswered(decisions);
  return next
    ? { caseId: next.id, stage: "travelling", choiceId: null }
    : { caseId: CITY_CASES[CITY_CASES.length - 1].id, stage: "complete", choiceId: null };
}
