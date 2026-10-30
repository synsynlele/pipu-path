// Phase 2: deterministic, fictional service consequences for structures built
// in the SAME city. The numbers are illustrative service requests per game day,
// never actual residents, municipal outcomes, real XP or learner assessment.
import { CITY_BUILD_MILESTONES } from "./build-milestones.mjs";
import { labMission, evaluateLab, sanitizeLab } from "./build-lab.mjs";

const SIMULATED_REQUESTS = Object.freeze({
  "workshop-link": 6,
  "clinic-power": 8,
  "shared-services": 10,
  "backup-water": 9,
  "shared-recovery": 7,
});
const totalRequests = Object.values(SIMULATED_REQUESTS).reduce(
  (a, b) => a + b,
  0,
);
function certified(lab, id) {
  return (
    lab.tested.includes(id) &&
    evaluateLab(labMission(id), lab.boards[id]).success
  );
}
export function serviceImpact(labInput) {
  const lab = sanitizeLab(labInput);
  const entries = CITY_BUILD_MILESTONES.map((milestone) => {
    const { id, title, district } = milestone;
    const mission = labMission(id);
    const load = SIMULATED_REQUESTS[id];
    const built = certified(lab, id);
    const fault = built ? lab.faults[id] : null;
    const damagedBoard =
      fault === null
        ? lab.boards[id]
        : lab.boards[id].map((piece, index) =>
            index === fault ? null : piece,
          );
    const flow = evaluateLab(mission, damagedBoard);
    const reached = built ? flow.served : 0;
    // Demand is distributed across service endpoints, not invented town data.
    const served = built
      ? Math.floor((load * reached) / mission.targets.length)
      : 0;
    return {
      id,
      title,
      district,
      built,
      fault,
      demand: load,
      served,
      unmet: load - served,
      locations: reached,
      totalLocations: mission.targets.length,
      description: !built
        ? "Not yet built. The network needs a tested solution."
        : fault !== null
          ? "A fictional network break has reduced service. Find and repair the damaged connection."
          : "Your built station is serving all its planned fictional requests.",
    };
  });
  const served = entries.reduce((total, item) => total + item.served, 0);
  return {
    entries,
    served,
    unmet: totalRequests - served,
    demand: totalRequests,
    builtCount: entries.filter((entry) => entry.built).length,
  };
}
export function serviceFor(lab, id) {
  return serviceImpact(lab).entries.find((entry) => entry.id === id) ?? null;
}
// Test a single broken placed connector; never mutate the saved layout.
// Return the most consequential first break; a resilient design survives it.
export function weakestConnection(labInput, id) {
  const lab = sanitizeLab(labInput);
  const mission = labMission(id);
  if (mission.id !== id || !certified(lab, id)) return null;
  const total = mission.targets.length;
  let candidate = null;
  for (let cell = 0; cell < 25; cell++) {
    if (!lab.boards[id][cell]) continue;
    const broken = lab.boards[id].slice();
    broken[cell] = null;
    const loss = total - evaluateLab(mission, broken).served;
    if (candidate === null || loss > candidate.lost) {
      candidate = { cell, lost: loss };
    }
  }
  return candidate;
}
export function startServiceDrill(labInput, id) {
  const lab = sanitizeLab(labInput);
  const before = serviceFor(lab, id);
  const weak = weakestConnection(lab, id);
  if (!before?.built || !weak) {
    return { lab, status: "not-ready", before, after: before };
  }
  if (before.fault !== null) {
    return { lab, status: "already-damaged", before, after: before };
  }
  if (weak.lost === 0) {
    return { lab, status: "protected", before, after: before };
  }
  lab.faults[id] = weak.cell;
  const after = serviceFor(lab, id);
  return { lab, status: "damaged", before, after, cell: weak.cell };
}
export function finishServiceRepair(labInput, id) {
  const lab = sanitizeLab(labInput);
  if (lab.faults[id] === null) return { lab, repaired: false };
  lab.faults[id] = null;
  return { lab, repaired: true };
}
