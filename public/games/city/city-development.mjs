// Permanent fictional land development is derived from retained game actions.
// No new save ledger, shop dependency, operating funds or verified XP.
import { CITY_CASES, getChoice } from "./cases.mjs";
import { CITY_DISTRICTS } from "./districts.mjs";
import { CASE_BUILD_SITES } from "./feedback.mjs";
import { overlapsRoad } from "./layout.mjs";
import { infrastructurePlan } from "./construction-plans.mjs";
import { ADVANCED_MISSIONS } from "./advanced-missions.mjs";

export const DEVELOPMENT_TYPES = Object.freeze([
  "homes",
  "skyscraper",
  "stadium",
  "farm",
  "bridge",
  "hospital",
  "school",
  "market",
  "factory",
  "solar",
  "library",
  "station",
  "park",
  "waterworks",
]);
const districtType = {
  workshop: "factory",
  power: "solar",
  market: "farm",
  school: "school",
  housing: "homes",
  water: "waterworks",
  health: "hospital",
  transport: "station",
  technology: "skyscraper",
  business: "market",
  environment: "park",
  governance: "library",
  creative: "stadium",
  industry: "factory",
};
const advancedTypes = [
  "hospital",
  "waterworks",
  "homes",
  "bridge",
  "station",
  "farm",
  "school",
  "park",
  "factory",
  "solar",
  "library",
  "stadium",
  "bridge",
  "hospital",
  "skyscraper",
  "skyscraper",
];
// Reserve original district worksites, approaches and courtyards. Roads remain
// continuous. Every remaining parcel has a permanent end-of-story land use.
const reserved = [
  ...CITY_DISTRICTS.map((d) => ({ x: d.x, z: d.z, half: 5.5 })),
  ...Object.values(CASE_BUILD_SITES).map((d) => ({
    x: d.x,
    z: d.z,
    half: 3.4,
  })),
  ...CITY_DISTRICTS.map((d) => ({ x: d.x + 5.3, z: d.z + 4.3, half: 4.2 })),
  { x: -8, z: -8.5, half: 4 },
  { x: -5, z: -11.6, half: 4 },
  { x: 26, z: 20, half: 4 },
  { x: -20, z: 11, half: 4 },
];
export const CITY_PARCELS = Object.freeze(
  (() => {
    const parcels = [];
    for (let x = -50; x <= 50; x += 5.5)
      for (let z = -42; z <= 42; z += 5.5) {
        if (overlapsRoad(x, z, 4.8, 4.8, 0.35)) continue;
        if (
          reserved.some(
            (r) =>
              Math.abs(x - r.x) < r.half + 2.4 &&
              Math.abs(z - r.z) < r.half + 2.4,
          )
        )
          continue;
        const district = [...CITY_DISTRICTS].sort(
          (a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z),
        )[0].id;
        parcels.push(
          Object.freeze({
            id: "parcel-" + parcels.length,
            x,
            z,
            district,
            width: 4.8,
            depth: 4.8,
          }),
        );
      }
    return parcels;
  })(),
);
export const DEVELOPMENT_STEPS = CITY_CASES.length + 7 + 3 + 16;
export function developmentEvents(state) {
  const events = [];
  for (const c of CITY_CASES) {
    if (!getChoice(c.id, state.decisions?.[c.id])) continue;
    const plan = infrastructurePlan(c.id, state.decisions[c.id]);
    events.push({
      id: c.id,
      district: c.district,
      type: districtType[c.district] ?? "homes",
      status:
        plan.status === "working"
          ? "working"
          : plan.status === "limited"
            ? "limited"
            : "unfinished",
    });
  }
  for (let day = 0; day < Math.min(7, state.economy?.day ?? 0); day++)
    events.push({
      id: "enterprise-day-" + (day + 1),
      district: "market",
      type: [
        "farm",
        "market",
        "factory",
        "homes",
        "station",
        "library",
        "stadium",
      ][day],
      status:
        (state.economy?.history?.[day]?.unserved ?? 0) > 0
          ? "limited"
          : "working",
    });
  for (let i = 0; i < Math.min(3, state.resilience?.choices?.length ?? 0); i++)
    events.push({
      id: "crisis-" + i,
      district: ["water", "transport", "health"][i],
      type: ["waterworks", "bridge", "hospital"][i],
      status: "working",
    });
  for (let i = 0; i < Math.min(16, state.advanced?.records?.length ?? 0); i++)
    events.push({
      id: ADVANCED_MISSIONS[i].id,
      district: ADVANCED_MISSIONS[i].district,
      type: advancedTypes[i],
      status: state.advanced.records[i]?.score < 85 ? "limited" : "working",
    });
  return events;
}
export function deriveCityDevelopment(state, parcels = CITY_PARCELS) {
  const events = developmentEvents(state),
    used = new Set(),
    plots = [];
  for (const [index, event] of events.entries()) {
    const count =
      Math.ceil(((index + 1) * parcels.length) / DEVELOPMENT_STEPS) -
      Math.ceil((index * parcels.length) / DEVELOPMENT_STEPS);
    const district =
      CITY_DISTRICTS.find((d) => d.id === event.district) ?? CITY_DISTRICTS[0];
    const available = parcels
      .filter((p) => !used.has(p.id))
      .sort(
        (a, b) =>
          Math.hypot(a.x - district.x, a.z - district.z) -
            Math.hypot(b.x - district.x, b.z - district.z) ||
          a.id.localeCompare(b.id),
      );
    for (const [i, p] of available.slice(0, count).entries()) {
      used.add(p.id);
      plots.push({
        ...p,
        source: event.id,
        type:
          i === 0
            ? event.type
            : DEVELOPMENT_TYPES[(index + i) % DEVELOPMENT_TYPES.length],
        status: event.status,
      });
    }
  }
  return {
    plots,
    total: parcels.length,
    developed: plots.length,
    completed: events.length,
    latest: events.at(-1)?.id ?? null,
  };
}
