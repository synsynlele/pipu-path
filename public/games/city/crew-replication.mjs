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
export function crewReplicas(projects, episode, parcels = CITY_PARCELS) {
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
