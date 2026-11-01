// Fictional drainage experiment. No campaign score or real-world evidence is awarded.
export const WIDTH = 7;
export const HEIGHT = 5;
export const HOMES = [1, 3, 5];
export const OUTLET = 31;
export const BLOCKED = [17, 24];
export const BUDGET = 15;
export function neighbours(id) {
  const x = id % WIDTH,
    y = Math.floor(id / WIDTH);
  return [
    x > 0 ? id - 1 : -1,
    x < WIDTH - 1 ? id + 1 : -1,
    y > 0 ? id - WIDTH : -1,
    y < HEIGHT - 1 ? id + WIDTH : -1,
  ].filter((n) => n >= 0);
}
export function newSite() {
  return { tiles: {}, cleared: [] };
}
export function spent(site) {
  return (
    Object.values(site.tiles).reduce(
      (n, tool) => n + (tool === "basin" ? 3 : 1),
      0,
    ) + site.cleared.length
  );
}
export function editSite(site, id, tool) {
  if (
    !Number.isInteger(id) ||
    id < WIDTH ||
    id >= WIDTH * HEIGHT ||
    id === OUTLET
  )
    return { site, message: "Build on the open ground below the homes." };
  const next = { tiles: { ...site.tiles }, cleared: [...site.cleared] };
  if (tool === "clear") {
    if (!BLOCKED.includes(id) || site.cleared.includes(id))
      return { site, message: "Choose a brown blockage to clear." };
    next.cleared.push(id);
  } else if (tool === "remove") {
    if (!next.tiles[id])
      return { site, message: "Choose a drain or basin to remove." };
    delete next.tiles[id];
  } else if (tool === "drain" || tool === "basin") {
    if (BLOCKED.includes(id) && !site.cleared.includes(id))
      return {
        site,
        message: "Clear this blockage first, or route around it.",
      };
    next.tiles[id] = tool;
  } else return { site, message: "Select a tool." };
  if (spent(next) > BUDGET)
    return {
      site,
      message: "Not enough materials. Remove a piece or try a shorter route.",
    };
  return {
    site: next,
    message:
      tool === "clear"
        ? "Blockage cleared. This ground is ready."
        : "City updated. Test the rain when you are ready.",
  };
}
export function testRain(site) {
  const connected = new Set([OUTLET]),
    queue = [OUTLET];
  for (let i = 0; i < queue.length; i++)
    for (const n of neighbours(queue[i])) {
      if (site.tiles[n] && !connected.has(n)) {
        connected.add(n);
        queue.push(n);
      }
    }
  const capacity =
    1 + [...connected].filter((id) => site.tiles[id] === "basin").length * 2;
  const reached = HOMES.filter((home) =>
    neighbours(home).some((n) => connected.has(n)),
  );
  const safe = reached.slice(0, capacity);
  return {
    safe,
    flooded: HOMES.filter((home) => !safe.includes(home)),
    connected: [...connected],
    capacity,
    success: safe.length === HOMES.length,
    remaining: BUDGET - spent(site),
  };
}
