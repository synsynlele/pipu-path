// Unbuilt City: a single recoverable journey, distinct from the legacy
// optional two-day city simulation. Pure helpers are used by UI and tests.
import { CITY_CASES, FOUNDATION_CASE_COUNT, getChoice } from "./cases.mjs";

export const JOURNEY_STAGES = Object.freeze([
  "travelling",
  "question",
  "building",
  "outcome",
  "chapter",
  "complete",
]);
export function foundationComplete(decisions = {}) {
  return CITY_CASES.slice(0, FOUNDATION_CASE_COUNT).every((c) =>
    Boolean(getChoice(c.id, decisions[c.id])),
  );
}
export function chapterForCase(caseId) {
  const index = CITY_CASES.findIndex((c) => c.id === caseId);
  return index < 0 ? null : index < FOUNDATION_CASE_COUNT ? 1 : 2;
}
export function isChapterTransition(caseId) {
  return CITY_CASES[FOUNDATION_CASE_COUNT - 1]?.id === caseId;
}
export function nextPlayableAfter(caseId, decisions = {}) {
  const at = CITY_CASES.findIndex((c) => c.id === caseId);
  if (at < 0) return firstUnanswered(decisions);
  const chapter = chapterForCase(caseId);
  // A jump to a past case must not skip unresolved foundation work.
  if (chapter === 1 && !foundationComplete(decisions)) {
    const remaining = CITY_CASES.slice(0, FOUNDATION_CASE_COUNT).find(
      (c) => !getChoice(c.id, decisions[c.id]),
    );
    if (remaining) return remaining;
  }
  const first = CITY_CASES.slice(at + 1).find(
    (c) => !getChoice(c.id, decisions[c.id]),
  );
  return (
    first ?? CITY_CASES.find((c) => !getChoice(c.id, decisions[c.id])) ?? null
  );
}
export function firstUnanswered(decisions = {}) {
  return CITY_CASES.find((c) => !getChoice(c.id, decisions[c.id])) ?? null;
}
export function recoverJourney({
  caseId,
  stage,
  choiceId,
  decisions = {},
} = {}) {
  const current = CITY_CASES.find((c) => c.id === caseId);
  if (current && stage === "travelling")
    return { caseId, stage: "travelling", choiceId: null };
  if (current && stage === "chapter" && foundationComplete(decisions))
    return {
      caseId: CITY_CASES[FOUNDATION_CASE_COUNT - 1].id,
      stage: "chapter",
      choiceId: null,
    };
  if (current && stage === "question")
    return { caseId, stage: "question", choiceId: null };
  if (
    current &&
    ["building", "outcome"].includes(stage) &&
    getChoice(caseId, choiceId) &&
    decisions[caseId] === choiceId
  )
    return { caseId, stage, choiceId };
  const next = firstUnanswered(decisions);
  return next
    ? { caseId: next.id, stage: "travelling", choiceId: null }
    : {
        caseId: CITY_CASES[CITY_CASES.length - 1].id,
        stage: "complete",
        choiceId: null,
      };
}
