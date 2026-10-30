// One journey across all city questions and selected practical builds.
// The gate is DERIVED from existing, allowlisted decision and prototype data:
// no second cursor that can drift after a restart, review, or puzzle revision.
import { CITY_CASES, getChoice } from "./cases.mjs";
import { formatForCase, milestoneForMission } from "./build-milestones.mjs";
import { labMission, evaluateLab, sanitizeLab } from "./build-lab.mjs";

export function integratedStep(decisions = {}, labInput = null) {
  const lab = sanitizeLab(labInput);
  for (let index = 0; index < CITY_CASES.length; index++) {
    const scenario = CITY_CASES[index];
    if (!getChoice(scenario.id, decisions[scenario.id])) {
      return { kind: "question", caseId: scenario.id, index, missionId: null };
    }
    const missionId = formatForCase(scenario.id).missionId;
    if (
      missionId &&
      (!lab.tested.includes(missionId) ||
        !evaluateLab(labMission(missionId), lab.boards[missionId]).success)
    ) {
      return { kind: "build", caseId: scenario.id, index, missionId };
    }
  }
  return {
    kind: "complete",
    caseId: CITY_CASES.at(-1).id,
    index: CITY_CASES.length,
    missionId: null,
  };
}
export function canEnterQuestion(caseId, decisions = {}, labInput = null) {
  const index = CITY_CASES.findIndex((c) => c.id === caseId);
  if (index < 0) return false;
  const step = integratedStep(decisions, labInput);
  return (
    (step.kind === "question" && step.caseId === caseId) ||
    (index < step.index && Boolean(getChoice(caseId, decisions[caseId])))
  );
}
export function canOpenWorksite(missionId, decisions = {}, labInput = null) {
  const mapped = milestoneForMission(missionId);
  if (!mapped || !getChoice(mapped.caseId, decisions[mapped.caseId]))
    return false;
  const step = integratedStep(decisions, labInput);
  const index = CITY_CASES.findIndex((c) => c.id === mapped.caseId);
  return index <= step.index;
}
export function remainingSteps(decisions = {}, labInput = null) {
  const current = integratedStep(decisions, labInput);
  return {
    current,
    decisions: CITY_CASES.length,
    built: CITY_CASES.filter((c) => {
      const id = formatForCase(c.id).missionId;
      if (!id) return false;
      const lab = sanitizeLab(labInput);
      return (
        lab.tested.includes(id) &&
        evaluateLab(labMission(id), lab.boards[id]).success
      );
    }).length,
  };
}
