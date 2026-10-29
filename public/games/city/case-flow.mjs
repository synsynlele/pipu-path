import { CITY_CASES, getCase } from "./cases.mjs";

// The first authored option used to appear in slot one in every scenario.
// Choose a balanced position for it while varying distractor order.
// 'seed' is set once per active game session; no personal data is needed.
export function choicesForCase(caseId, seed = 0) {
  const c = getCase(caseId);
  if (!c) return [];
  const index = CITY_CASES.findIndex((entry) => entry.id === caseId);
  const offset = (((index + seed) % 3) + 3) % 3;
  const hash = [...caseId].reduce(
    (n, char) => (Math.imul(n, 31) + char.charCodeAt(0)) | 0,
    7,
  );
  const rest = c.options.slice(1);
  if ((hash + seed) & 1) rest.reverse();
  rest.splice(offset, 0, c.options[0]);
  return rest;
}

export function nextCaseAfter(caseId) {
  const index = CITY_CASES.findIndex((c) => c.id === caseId);
  return index < 0 || index >= CITY_CASES.length - 1
    ? null
    : CITY_CASES[index + 1];
}
export function caseNumber(caseId) {
  const index = CITY_CASES.findIndex((c) => c.id === caseId);
  return index < 0 ? 0 : index + 1;
}
export const OUTCOME_VIEW_MS = 7200; // Hands-free unless the player pauses it.
