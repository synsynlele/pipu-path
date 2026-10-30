// PipuPath Phase 3 / Stage 3: reviewed, repeatable service-disruption stories.
// This is not free-form AI or hidden game physics. Each story is paired with
// a REAL previously tested network and a verified solvable repair action.
import { integratedStep } from "./integrated-journey.mjs";
import { labMission, evaluateLab, sanitizeLab } from "./build-lab.mjs";
import { serviceFor } from "./city-service-system.mjs";

const TIMES = Object.freeze([
  { id: "morning", name: "Morning shift", period: "At opening time" },
  {
    id: "afternoon",
    name: "Afternoon rush",
    period: "During a busy afternoon",
  },
  { id: "evening", name: "Evening demand", period: "Before the day closes" },
]);
const REVIEWED_CASES = Object.freeze([
  {
    id: "workshop-pump",
    missionId: "workshop-link",
    title: "A pump repair cannot wait",
    problem:
      "Ama's repair shop loses its supply while a community pump is waiting. Neighbours need a clear recovery plan.",
  },
  {
    id: "clinic-cold",
    missionId: "clinic-power",
    title: "Keep the clinic ready",
    problem:
      "The clinic's backup connection stops during a vital shift. Staff need help avoiding a longer service interruption.",
  },
  {
    id: "school-care",
    missionId: "shared-services",
    title: "Two places need one network",
    problem:
      "The school and clinic share a service connection. A damaged link leaves some needs unmet.",
  },
  {
    id: "market-delivery",
    missionId: "shared-recovery",
    title: "Supplies stuck between the market and clinic",
    problem:
      "A distribution link fails and essential supplies stop reaching one of the places that need them.",
  },
  {
    id: "workshop-orders",
    missionId: "workshop-link",
    title: "The growing repair queue",
    problem:
      "A sudden equipment failure interrupts Ama's repair queue as more customers arrive.",
  },
  {
    id: "clinic-appointment",
    missionId: "clinic-power",
    title: "A clinic day with no backup",
    problem:
      "A power route fails while the clinic is serving scheduled visitors.",
  },
  {
    id: "learning-twilight",
    missionId: "shared-services",
    title: "Learning and care after sunset",
    problem:
      "The shared network goes down just when a learning group and clinic need it most.",
  },
  {
    id: "market-shortage",
    missionId: "shared-recovery",
    title: "Protect the essential stock",
    problem:
      "The link moving critical stock fails. The market and clinic are left with a difficult choice about what to do first.",
  },
  {
    id: "workshop-tools",
    missionId: "workshop-link",
    title: "A silent workshop",
    problem:
      "A failed connector cuts Ama's tools off from the supply. Someone must protect the urgent repairs.",
  },
  {
    id: "clinic-safety",
    missionId: "clinic-power",
    title: "A difficult clinic interruption",
    problem:
      "A backup connection stops unexpectedly. The clinic must keep people informed while repairs are made.",
  },
  {
    id: "shared-warning",
    missionId: "shared-services",
    title: "Warning signs in two buildings",
    problem:
      "A connection supplying both school and clinic becomes unreliable. It must be tested before the next demand surge.",
  },
  {
    id: "market-logistics",
    missionId: "shared-recovery",
    title: "A distribution system under pressure",
    problem:
      "A failed junction interrupts delivery to essential neighbourhood services. A tested repair is needed.",
  },
]);
export const STAGE_THREE_CASES = REVIEWED_CASES;
export const STAGE_THREE_CHOICES = Object.freeze([
  {
    id: "protect",
    label: "Warn people, protect urgent needs, then repair",
    response:
      "You make a clear priority list and keep affected people informed, but coordination needs extra effort.",
    assumedPeriods: 1,
  },
  {
    id: "inspect",
    label: "Inspect available resources before organising repairs",
    response:
      "You use time to inspect the network before committing people and materials; the interruption lasts longer.",
    assumedPeriods: 3,
  },
]);
export function stageThreeAvailable(decisions = {}, lab = null) {
  return integratedStep(decisions, lab).kind === "complete";
}
export function stageThreeCase(round = 0) {
  const safe = Number.isInteger(round) && round >= 0 ? round : 0;
  const story = REVIEWED_CASES[safe % REVIEWED_CASES.length];
  const shift = TIMES[Math.floor(safe / REVIEWED_CASES.length) % TIMES.length];
  return {
    ...story,
    shift: shift.name,
    situation: shift.period + ", " + story.problem,
    cycle: Math.floor(safe / REVIEWED_CASES.length) + 1,
    number: safe + 1,
    question: "How would you respond before physically repairing the link?",
  };
}
export function sanitizeStageThree(input, labInput) {
  const lab = sanitizeLab(labInput);
  const round =
    Number.isInteger(input?.round) && input.round >= 0 && input.round <= 99_999
      ? input.round
      : 0;
  const target = stageThreeCase(round);
  const id = input?.active?.id;
  const choice = STAGE_THREE_CHOICES.find(
    (c) => c.id === input?.active?.choiceId,
  );
  const cell = input?.active?.cell;
  const active =
    id === target.id &&
    choice &&
    Number.isInteger(cell) &&
    cell >= 0 &&
    cell < 25 &&
    Boolean(lab.boards[target.missionId][cell])
      ? { id, choiceId: choice.id, cell }
      : null;
  return { round, active };
}
export function criticalServiceLinks(labInput, missionId) {
  const mission = labMission(missionId);
  if (mission.id !== missionId) return [];
  const lab = sanitizeLab(labInput);
  if (
    !lab.tested.includes(missionId) ||
    !evaluateLab(mission, lab.boards[missionId]).success
  )
    return [];
  const original = evaluateLab(mission, lab.boards[missionId]).served;
  const results = [];
  for (let cell = 0; cell < 25; cell++) {
    if (!lab.boards[missionId][cell]) continue;
    const board = lab.boards[missionId].slice();
    board[cell] = null;
    const after = evaluateLab(mission, board).served;
    if (after < original) results.push({ cell, loss: original - after });
  }
  return results.sort((a, b) => b.loss - a.loss || a.cell - b.cell);
}
export function beginStageThree(stageInput, decisions, labInput, choiceId) {
  const lab = sanitizeLab(labInput);
  const stage = sanitizeStageThree(stageInput, lab);
  const scenario = stageThreeCase(stage.round);
  if (!stageThreeAvailable(decisions, lab))
    return { status: "locked", stage, lab, scenario };
  if (stage.active) return { status: "in-progress", stage, lab, scenario };
  const choice = STAGE_THREE_CHOICES.find((c) => c.id === choiceId);
  if (!choice) return { status: "choose-plan", stage, lab, scenario };
  if (lab.faults[scenario.missionId] !== null)
    return { status: "repair-existing", stage, lab, scenario };
  const links = criticalServiceLinks(lab, scenario.missionId);
  if (!links.length) {
    // A resilient, genuinely tested build can withstand every one-link
    // failure: recognise it instead of inventing an impossible repair.
    return { status: "already-resilient", stage, lab, scenario };
  }
  // Deterministic and varied, without using user identities or random AI.
  // 12 cases run before the same title may return, and the day shift rotates.
  const cell = links[Math.floor(stage.round / 4) % links.length].cell;
  const before = serviceFor(lab, scenario.missionId);
  lab.faults[scenario.missionId] = cell;
  const after = serviceFor(lab, scenario.missionId);
  const lostPerPeriod = Math.max(0, before.served - after.served);
  return {
    status: "repair-required",
    stage: {
      round: stage.round,
      active: { id: scenario.id, choiceId: choice.id, cell },
    },
    lab,
    scenario,
    choice,
    before,
    after,
    estimate: {
      lostPerPeriod,
      assumedPeriods: choice.assumedPeriods,
      unmetRequestPeriods: lostPerPeriod * choice.assumedPeriods,
    },
  };
}
export function finishStageThree(stageInput, labInput, missionId) {
  const lab = sanitizeLab(labInput);
  const stage = sanitizeStageThree(stageInput, lab);
  const scenario = stageThreeCase(stage.round);
  if (
    !stage.active ||
    scenario.missionId !== missionId ||
    lab.faults[missionId] !== null ||
    !lab.tested.includes(missionId) ||
    !evaluateLab(labMission(missionId), lab.boards[missionId]).success
  )
    return { status: "not-finished", stage };
  const selected = STAGE_THREE_CHOICES.find(
    (c) => c.id === stage.active.choiceId,
  );
  return {
    status: "complete",
    scenario,
    choice: selected,
    stage: { round: (stage.round + 1) % 100_000, active: null },
  };
}
