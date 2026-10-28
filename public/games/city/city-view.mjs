// Read-only, fictional city-view data derived from existing chosen outcomes.
// No screenshots, tracking, identifying information or additional storage.
import { CITY_DISTRICTS } from "./districts.mjs";
import { casesFor } from "./cases.mjs";
import { deriveBuilderCity } from "./city-growth.mjs";

export function cityViewSummary(decisions = {}) {
  const city = deriveBuilderCity(decisions);
  const districts = CITY_DISTRICTS.map((site) => {
    const current = city.districts[site.id];
    return {
      id: site.id,
      name: site.name,
      emoji: site.emoji,
      x: site.x,
      z: site.z,
      built: current.constructed,
      answered: current.built,
      working: current.working,
      unresolved: current.unresolved,
      possible: casesFor(site.id).length,
      activity: current.activity,
      service: current.service,
    };
  });
  return {
    built: city.visibleBuildings,
    answered: city.completed,
    working: city.workingSolutions,
    unresolved: city.unresolvedNeeds,
    possible: districts.reduce((n, d) => n + d.possible, 0),
    active: city.activeDistricts,
    total: districts.length,
    districts,
  };
}
export function findCityViewDistrict(summary, id) {
  return summary.districts.find((district) => district.id === id) ?? null;
}
