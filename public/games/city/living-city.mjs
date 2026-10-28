// Deterministic, fictional public activity from actual city-building choices.
// Visual-only: not real traffic forecasts, incomes, population, health or XP.
import { CITY_DISTRICTS } from "./districts.mjs";
import { CONNECTIONS, deriveBuilderCity } from "./city-growth.mjs";

const ROAD_X = Object.freeze([-45, -10, 6, 47]);
const ROAD_Z = Object.freeze([-39, 6.7, 39]);
const SUGGESTED_FLOW = Object.freeze([
  ["transport", "market", "Food delivery"],
  ["water", "health", "Water service"],
  ["industry", "workshop", "Locally made parts"],
  ["market", "business", "Market supplies"],
  ["business", "housing", "Home supplies"],
  ["creative", "business", "Creative goods"],
  ["school", "industry", "Skills and training"],
  ["environment", "transport", "Safe streets"],
]);
const nearest = (value, coordinates) => coordinates.reduce(
  (best, n) => Math.abs(n - value) < Math.abs(best - value) ? n : best,
  coordinates[0],
);
const direct = (districts, id) => districts.find((d) => d.id === id);

export function roadDeliveryRoute(from, to) {
  const a = direct(CITY_DISTRICTS, from), b = direct(CITY_DISTRICTS, to);
  if (!a || !b || from === to) return [];
  const sx = nearest(a.x, ROAD_X), sz = nearest(a.z, ROAD_Z);
  const tx = nearest(b.x, ROAD_X), tz = nearest(b.z, ROAD_Z);
  const horizontalFirst = Math.abs(tx - sx) >= Math.abs(tz - sz);
  const raw = horizontalFirst
    ? [[sx, sz], [tx, sz], [tx, tz]]
    : [[sx, sz], [sx, tz], [tx, tz]];
  const points = raw.filter((p, i) => i === 0 || p[0] !== raw[i - 1][0] || p[1] !== raw[i - 1][1]);
  return points.map(([x, z]) => ({ x, z }));
}

export function deriveLivingCity(decisions = {}) {
  const city = deriveBuilderCity(decisions);
  const districts = CITY_DISTRICTS.map((site) => {
    const state = city.districts[site.id];
    return {
      id: site.id,
      name: site.name,
      built: state.built,
      service: state.service,
      activity: state.activity,
      residents: state.built === 0 ? 0 :
        state.activity === "thriving" ? 2 : 1,
      glow: state.built > 0 && state.service >= 42,
    };
  });
  // Deliveries appear only if two connected neighbourhoods actually exist.
  // Struggling services move supplies less often, never falsely "thriving".
  const deliveries = SUGGESTED_FLOW.flatMap(([from, to, label]) => {
    const source = city.districts[from], destination = city.districts[to];
    if (!source?.built || !destination?.built) return [];
    const path = roadDeliveryRoute(from, to);
    if (path.length < 2) return [];
    const quality = Math.min(source.service, destination.service);
    return [{
      id: from + "-to-" + to,
      from, to, label, path,
      pace: quality >= 65 ? "steady" : quality >= 42 ? "careful" : "slow",
      speed: quality >= 65 ? 4.3 : quality >= 42 ? 2.8 : 1.55,
    }];
  }).slice(0, 5);
  // Traffic illustrates a few relationships only; not a prediction.
  const linkageCount = CONNECTIONS.filter(({ from, to }) =>
    city.districts[from].built && city.districts[to].built).length;
  return {
    built: city.completed,
    districts,
    active: districts.filter((d) => d.built).length,
    residents: districts.reduce((sum, d) => sum + d.residents, 0),
    deliveries,
    linkageCount,
  };
}
