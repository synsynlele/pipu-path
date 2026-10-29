import {
  emptyBlueprint,
  WIDTH,
  type Blueprint,
  type Tile,
  type WorldSpec,
} from "./world-simulation";
/** Reviewed layouts are solvability fixtures, never supplied as player answers. */
export function workingBlueprint(world: WorldSpec): Blueprint {
  const b = emptyBlueprint();
  const put = (x: number, y: number, t: Tile) => {
    b[y * WIDTH + x] = t;
  };
  const river = world.id === "river-renewal-v1";
  for (let x = 0; x <= (river ? 6 : 5); x++) put(x, 2, "road");
  for (let y = 1; y <= 5; y++) put(0, y, "road");
  for (let x = 1; x <= (river ? 6 : 10); x++) put(x, 5, "road");
  const facilities = river
    ? [
        [4, 1],
        [6, 1],
        [4, 6],
        [6, 6],
      ]
    : [
        [3, 1],
        [5, 1],
        [8, 4],
        [10, 4],
      ];
  facilities.forEach(([x, y]) => put(x, y, "primary"));
  const solar =
    world.id === "makers-market-v1"
      ? 5
      : world.event === "heat"
        ? 4
        : world.event === "outage"
          ? 3
          : river
            ? 2
            : world.event === "drought"
              ? 1
              : 2;
  for (let x = 1; x <= solar; x++) put(x, 3, "solar");
  if (world.event === "flood") {
    put(1, 4, "support");
    if (!river) put(9, 4, "support");
  }
  if (world.event === "drought") {
    put(4, 1, "support");
    put(9, 4, "support");
  }
  if (world.id === "makers-market-v1") put(9, 4, "support");
  if (river) for (const y of [0, 3, 4, 6, 7]) put(5, y, "nature");
  else for (let x = 0; x < 5; x++) put(x, 7, "nature");
  return b;
}
