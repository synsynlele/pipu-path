import { CITY_CASES, getChoice } from "./cases.mjs";

// Review a kept decision without losing the checkpoint of the main journey.
export function reviewedCases(decisions = {}) {
  return CITY_CASES.filter((c) => Boolean(getChoice(c.id, decisions[c.id])));
}
export function previousKeptCase(decisions = {}, currentId = null) {
  const reviewed = reviewedCases(decisions);
  if (currentId == null) return reviewed.at(-1) ?? null;
  const index = CITY_CASES.findIndex((c) => c.id === currentId);
  if (index < 0) return reviewed.at(-1) ?? null;
  return reviewed.filter((c) => CITY_CASES.indexOf(c) < index).at(-1) ?? null;
}
export function canRevise(decisions = {}, caseId) {
  return Boolean(getChoice(caseId, decisions?.[caseId]));
}
