export const COSTS = { storage: 5, solar: 4, schedule: 1, maintenance: 2 };
export function simulate(config, storm = false, protect = "class") {
  const supply = storm ? [2, 3, 2, 0] : [3, 5, 2, 0];
  const demand =
    storm && protect === "protect"
      ? [1, 2, 2, 2]
      : storm && protect === "rotate"
        ? [2, 2, 2, 1]
        : config.schedule
          ? [2, 4, 2, 2]
          : [2, 2, 2, 4];
  let charge = 0;
  return supply.map((base, i) => {
    const generated = base + (config.solar && i === 1 ? 2 : 0),
      needed = demand[i];
    const discharge = config.storage
      ? Math.min(charge, 2, Math.max(0, needed - generated))
      : 0;
    charge -= discharge;
    const served = Math.min(needed, generated + discharge);
    const added = config.storage
      ? Math.min(4 - charge, 2, Math.max(0, generated - needed))
      : 0;
    charge += added;
    return {
      period: ["Morning", "Midday", "Afternoon", "Evening"][i],
      generated,
      needed,
      served,
      unmet: needed - served,
      charge,
      protect,
    };
  });
}
export function spent(config) {
  return Object.keys(COSTS).reduce((n, k) => n + (config[k] ? COSTS[k] : 0), 0);
}
export function viable(config, storm = false) {
  return (
    spent(config) <= 8 && simulate(config, storm).every((x) => x.unmet === 0)
  );
}
