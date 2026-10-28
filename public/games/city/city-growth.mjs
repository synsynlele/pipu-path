// Choice-to-City v1: deterministic fictional district operating indicators.
// This is NOT the original two-day budget/power simulator, verified XP,
// personal assessment, or advice for real infrastructure operations.
import { CITY_CASES, getChoice, casesFor } from "./cases.mjs";
import { CITY_DISTRICTS } from "./districts.mjs";

export const CITY_SYSTEMS = Object.freeze(
  CITY_DISTRICTS.map(({ id, name, emoji }) => ({ id, name, icon: emoji })),
);
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
  {
    from: "power",
    to: "water",
    reason: "Pumps depend on energy",
    weight: 0.12,
  },
  {
    from: "water",
    to: "health",
    reason: "Clean water supports health",
    weight: 0.13,
  },
  {
    from: "housing",
    to: "water",
    reason: "Housing growth increases service demand",
    weight: 0.08,
  },
  {
    from: "environment",
    to: "housing",
    reason: "Drainage protects homes",
    weight: 0.12,
  },
  {
    from: "environment",
    to: "transport",
    reason: "Flood prevention protects roads",
    weight: 0.11,
  },
  {
    from: "transport",
    to: "market",
    reason: "Roads support food deliveries",
    weight: 0.12,
  },
  {
    from: "transport",
    to: "health",
    reason: "Road access affects clinic journeys",
    weight: 0.1,
  },
  {
    from: "technology",
    to: "governance",
    reason: "Tools can improve public response",
    weight: 0.08,
  },
  {
    from: "governance",
    to: "water",
    reason: "Clear stewardship helps services",
    weight: 0.09,
  },
  {
    from: "business",
    to: "industry",
    reason: "Demand shapes local manufacturing",
    weight: 0.11,
  },
  {
    from: "industry",
    to: "workshop",
    reason: "Locally made parts support repairs",
    weight: 0.1,
  },
  {
    from: "school",
    to: "industry",
    reason: "Practical skills support safe production",
    weight: 0.1,
  },
  {
    from: "creative",
    to: "business",
    reason: "Culture brings enterprise opportunities",
    weight: 0.08,
  },
  {
    from: "health",
    to: "housing",
    reason: "Healthy neighbours support community life",
    weight: 0.08,
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
    // Two-decision growth districts and four-decision foundation districts
    // must be comparable once their available problems are completed.
    const total = casesFor(d.id).length || 1;
    const progress = d.built / total;
    d.direct = d.built
      ? clamp(12 + progress * 36 +
        d.impact.reduce((a, b) => a + b, 0) * (6.4 / total), 5, 100)
      : 0;
    DIMENSIONS.forEach((axis, i) => {
      d[axis] = d.built
        ? clamp(38 + d.impact[i] * (32 / total) + progress * 12, 0, 100)
        : 0;
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
  const functioning = all.filter((d) => d.built > 0);
  const serviceTotal = functioning.reduce((sum, d) => sum + d.service, 0);
  return {
    districts,
    completed,
    totalCases: CITY_CASES.length,
    cityHealth: functioning.length
      ? Math.round(serviceTotal / functioning.length)
      : 0,
    activeDistricts: functioning.length,
    districtCount: all.length,
    thriving,
    visibleBuildings: completed,
    // Stored snapshot is the choice IDs; city geometry and indicators derive
    // from them on every render/reload, avoiding inconsistent duplicate saves.
  };
}
