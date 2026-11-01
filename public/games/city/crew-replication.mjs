import { CITY_PARCELS } from "./city-development.mjs";
const families = {
  housing: "homes",
  school: "homes",
  industry: "tower",
  water: "farm",
  workshop: "tower",
  creative: "stadium",
  health: "hospital",
  power: "tower",
  market: "farm",
  transport: "homes",
  business: "tower",
  environment: "farm",
};
const limits = { homes: 6, tower: 4, hospital: 3, farm: 5, stadium: 2 };
export function crewReplicas(
  projects,
  episode,
  parcels = CITY_PARCELS,
  chapterCount = null,
) {
  if (chapterCount !== null) {
    const targets = [0, 0, 4, 10, 15, 20, 27, 34, 41, 48, 55, 63, 70];
    const eligible = Object.keys(limits).filter((t) => projects[t]?.open);
    if (!eligible.length) return [];
    return parcels
      .slice(0, Math.max(4, targets[Math.min(12, Math.max(0, chapterCount))]))
      .map((p, i) => ({
        ...p,
        type: eligible.includes(families[p.district])
          ? families[p.district]
          : eligible[i % eligible.length],
        standard: families[p.district],
        variation: i % 3,
        crewLevel: chapterCount,
      }));
  }
  const completed = Object.values(episode).filter((m) => m.done).length,
    used = new Set(),
    plan = [];
  for (const type of ["homes", "tower", "hospital", "farm", "stadium"]) {
    if (!projects[type]?.open) continue;
    const count =
      limits[type] +
      (episode.teach.done ? 1 : 0) +
      (type === "hospital" && episode.care.done ? 1 : 0) +
      (type === "farm" && episode.investigate.done ? 1 : 0);
    const candidates = parcels
      .filter((p) => !used.has(p.id))
      .sort(
        (a, b) =>
          Number(families[b.district] === type) -
            Number(families[a.district] === type) || a.id.localeCompare(b.id),
      );
    for (const p of candidates.slice(0, count)) {
      used.add(p.id);
      plan.push({
        ...p,
        type,
        standard: type,
        variation: plan.length % 3,
        crewLevel: completed,
      });
    }
  }
  return plan;
}
