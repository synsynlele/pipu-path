// Choice-to-City v1: deterministic fictional district operating indicators.
// This is NOT the original two-day budget/power simulator, verified XP,
// personal assessment, or advice for real infrastructure operations.
import { CITY_CASES, getChoice } from "./cases.mjs";

export const CITY_SYSTEMS = Object.freeze([
  { id: "workshop", name: "Repair", icon: "🔧" },
  { id: "power", name: "Power", icon: "⚡" },
  { id: "market", name: "Food", icon: "🌱" },
  { id: "school", name: "Learning", icon: "🎓" },
]);
export const CONNECTIONS = Object.freeze([
  {
    from: "power",
    to: "market",
    reason: "Power affects food storage",
    weight: 0.13,
  },
  {
    from: "power",
    to: "school",
    reason: "Reliable lighting supports lessons",
    weight: 0.12,
  },
  {
    from: "power",
    to: "workshop",
    reason: "Electricity supports repairs",
    weight: 0.1,
  },
  {
    from: "school",
    to: "workshop",
    reason: "Skilled learners help repair teams",
    weight: 0.11,
  },
  {
    from: "workshop",
    to: "power",
    reason: "Maintenance helps power systems",
    weight: 0.11,
  },
  {
    from: "market",
    to: "workshop",
    reason: "Healthy enterprises support trades",
    weight: 0.08,
  },
  {
    from: "workshop",
    to: "market",
    reason: "Repair capacity supports delivery equipment",
    weight: 0.09,
  },
  {
    from: "market",
    to: "school",
    reason: "More stable livelihoods support participation",
    weight: 0.07,
  },
]);
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, Math.round(n)));
const DIMENSIONS = Object.freeze([
  "reliability",
  "access",
  "resources",
  "trust",
]);
export function choiceStructure(caseId, choiceId) {
  const scenario = CITY_CASES.find((c) => c.id === caseId);
  const option = getChoice(caseId, choiceId);
  if (!scenario || !option) return null;
  const index = scenario.options.findIndex((c) => c.id === choiceId);
  return {
    caseId,
    choiceId,
    district: scenario.district,
    // These stable silhouettes are not dependent on shuffled answer positions.
    variant: ["coordinated", "overloaded", "neglected"][index],
    condition:
      option.impact.reduce((sum, n) => sum + n, 0) >= 3
        ? "improving"
        : option.impact.reduce((sum, n) => sum + n, 0) >= 0
          ? "mixed"
          : "strained",
  };
}
export function deriveBuilderCity(decisions = {}) {
  const districts = Object.fromEntries(
    CITY_SYSTEMS.map(({ id, name, icon }) => [
      id,
      {
        id,
        name,
        icon,
        built: 0,
        impact: [0, 0, 0, 0],
        structures: [],
        direct: 0,
        service: 0,
        reliability: 0,
        access: 0,
        resources: 0,
        trust: 0,
        links: [],
        activity: "waiting",
      },
    ]),
  );
  for (const scenario of CITY_CASES) {
    const option = getChoice(scenario.id, decisions[scenario.id]);
    if (!option) continue;
    const district = districts[scenario.district];
    district.built++;
    option.impact.forEach((value, i) => {
      district.impact[i] += value;
    });
    district.structures.push(choiceStructure(scenario.id, option.id));
  }
  // Baseline only represents a fictional starting neighbourhood. Buildings
  // cannot increase capacity merely because a question was viewed.
  for (const d of Object.values(districts)) {
    d.direct = d.built
      ? clamp(
          12 + d.built * 9 + d.impact.reduce((a, b) => a + b, 0) * 1.6,
          5,
          100,
        )
      : 0;
    DIMENSIONS.forEach((axis, i) => {
      d[axis] = d.built ? clamp(38 + d.impact[i] * 8 + d.built * 3, 0, 100) : 0;
    });
  }
  for (const d of Object.values(districts)) {
    const influences = CONNECTIONS.filter((link) => link.to === d.id)
      .map((link) => {
        const source = districts[link.from];
        const delta = source.built
          ? Math.round((source.direct - 50) * link.weight)
          : 0;
        return { ...link, change: delta };
      })
      .filter((link) => link.change !== 0);
    const inherited = influences.reduce((sum, link) => sum + link.change, 0);
    d.links = influences;
    d.service = d.built ? clamp(d.direct + inherited, 0, 100) : 0;
    d.activity =
      d.built === 0
        ? "waiting"
        : d.service >= 65
          ? "thriving"
          : d.service >= 42
            ? "active"
            : "struggling";
  }
  const all = Object.values(districts);
  const completed = all.reduce((sum, d) => sum + d.built, 0);
  const thriving = all.filter((d) => d.activity === "thriving").length;
  const serviceTotal = all.reduce((sum, d) => sum + d.service, 0);
  return {
    districts,
    completed,
    totalCases: CITY_CASES.length,
    cityHealth: completed ? Math.round(serviceTotal / 4) : 0,
    thriving,
    visibleBuildings: completed,
    // Stored snapshot is the choice IDs; city geometry and indicators derive
    // from them on every render/reload, avoiding inconsistent duplicate saves.
  };
}
