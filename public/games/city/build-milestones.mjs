// Explicit, reviewer-selected instructional formats for the connected city.
// Default chapter cases remain decisions; these five pair judgment with a
// hands-on *implementation* test. Never select a puzzle merely by question count.
export const CITY_BUILD_MILESTONES = Object.freeze([
  {
    id: "workshop-link",
    caseId: "repair-queue",
    district: "workshop",
    x: -3.3,
    z: -2.7,
    title: "Workshop supply station",
    result: "Your tested network now powers a new supply station beside Ama's workshop.",
    short: "WORKSHOP",
    color: 0x55c9ad,
    type: "power",
  },
  {
    id: "clinic-power",
    caseId: "power-clinic",
    district: "health",
    x: 18,
    z: -32,
    title: "Clinic backup power",
    result: "You built a backup connection for the community clinic.",
    short: "BACKUP POWER",
    color: 0x9ad2d4,
    type: "power",
  },
  {
    id: "shared-services",
    caseId: "learn-dark-class",
    district: "school",
    x: -15,
    z: 12.3,
    title: "Shared learning and care link",
    result: "Your network now links two essential service points.",
    short: "SHARED LINK",
    color: 0xf1d38d,
    type: "services",
  },
  {
    id: "backup-water",
    caseId: "water-breakdown",
    district: "water",
    x: -18,
    z: -32,
    title: "Resilient water junction",
    result: "Your double-route design keeps water flowing after a link fails.",
    short: "WATER BACKUP",
    color: 0x5bc7e5,
    type: "water",
  },
  {
    id: "shared-recovery",
    caseId: "clinic-supply",
    district: "market",
    x: 19,
    z: 14.2,
    title: "Supply recovery hub",
    result: "Your shared recovery network links essential supplies and community needs.",
    short: "SUPPLY HUB",
    color: 0xe0bc78,
    type: "services",
  },
]);
const byCase = new Map(CITY_BUILD_MILESTONES.map((m) => [m.caseId, m]));
const byId = new Map(CITY_BUILD_MILESTONES.map((m) => [m.id, m]));
export function formatForCase(caseId) {
  const milestone = byCase.get(caseId);
  return milestone
    ? { format: "decide-then-build", missionId: milestone.id }
    : { format: "decision", missionId: null };
}
export function milestoneForCase(caseId) {
  return byCase.get(caseId) ?? null;
}
export function milestoneForMission(id) {
  return byId.get(id) ?? null;
}
export function completedMilestones(lab, evaluateLab, labMission) {
  return CITY_BUILD_MILESTONES.filter(({ id }) =>
    evaluateLab(labMission(id), lab?.boards?.[id]).success,
  );
}
