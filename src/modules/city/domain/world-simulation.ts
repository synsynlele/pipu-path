/** Deterministic fictional planning simulations. Never authorises real XP or evidence. */
export const WIDTH = 12;
export const HEIGHT = 8;
export type Tile = "road" | "solar" | "primary" | "support" | "nature" | null;
export type Blueprint = Tile[];
export type WorldSpec = {
  id: string;
  title: string;
  project: string;
  brief: string;
  primary: string;
  support: string;
  nature: string;
  output: string;
  unit: string;
  capacity: number;
  demand: number;
  energy: number;
  budget: number;
  event: "flood" | "drought" | "outage" | "heat";
  forecast: string;
  tint: string;
  levels: string[];
};
export const simulationWorlds: WorldSpec[] = [
  {
    id: "neighbourhood",
    title: "Your Neighbourhood",
    project: "Build a community resilience hub",
    brief:
      "Connect three residential zones to shared services. Keep those services working when the mains supply fails.",
    primary: "Service centre",
    support: "Battery bank",
    nature: "Community trees",
    output: "Service capacity",
    unit: "households",
    capacity: 12,
    demand: 30,
    energy: 2,
    budget: 105,
    event: "outage",
    forecast:
      "Grid failure: solar output falls from 6 to 3. Each connected battery adds 4 units.",
    tint: "#e4bd78",
    levels: [
      "Connect essential services",
      "Expand reliable access",
      "Support a growing district",
    ],
  },
  {
    id: "unbuilt-city-night-market-v1",
    title: "The Unbuilt City",
    project: "Engineer a flood-ready district",
    brief:
      "Build shelters and a connected service network serving all three residential zones. Protect the facilities and routes exposed to the floodplain.",
    primary: "Shelter",
    support: "Flood barrier",
    nature: "Urban trees",
    output: "Shelter capacity",
    unit: "residents",
    capacity: 12,
    demand: 32,
    energy: 2,
    budget: 110,
    event: "flood",
    forecast:
      "Flood: row 5 loses unprotected roads and facilities. A barrier protects its own square and adjacent squares.",
    tint: "#e9c18a",
    levels: ["Keep a district working"],
  },
  {
    id: "neighbourhood-garden-v1",
    title: "The Forgotten Garden",
    project: "Build a productive food forest",
    brief:
      "Grow enough food for three residential zones. Locate irrigation beside crops and connect the farm to a working service network.",
    primary: "Food plot",
    support: "Irrigation tank",
    nature: "Habitat trees",
    output: "Food production",
    unit: "food units",
    capacity: 12,
    demand: 32,
    energy: 1,
    budget: 105,
    event: "drought",
    forecast:
      "Drought: crops without an adjacent connected irrigation tank produce only 4 units instead of 12.",
    tint: "#90d6a6",
    levels: [
      "Grow a food system",
      "Prepare for dry weather",
      "Feed more households",
    ],
  },
  {
    id: "river-renewal-v1",
    title: "The River Renewal",
    project: "Restore a working watershed",
    brief:
      "Place treatment units on the riverbank, connect maintenance access, and add wetlands to protect the water system. Serve all three settlements.",
    primary: "Treatment unit",
    support: "Flood barrier",
    nature: "Wetland",
    output: "Treatment capacity",
    unit: "water units",
    capacity: 12,
    demand: 30,
    energy: 2,
    budget: 115,
    event: "flood",
    forecast:
      "Flood: row 5 loses unprotected access and facilities. River treatment units work only beside the river at column 6.",
    tint: "#78cbd4",
    levels: [
      "Restore clean-water capacity",
      "Protect the watershed",
      "Serve a wider catchment",
    ],
  },
  {
    id: "learning-district-v1",
    title: "The Learning District",
    project: "Build an accessible learning campus",
    brief:
      "Distribute learning spaces across three residential zones. Balance seat capacity, access, green space and backup energy.",
    primary: "Learning studio",
    support: "Battery bank",
    nature: "Shaded courtyard",
    output: "Learning seats",
    unit: "learners",
    capacity: 14,
    demand: 36,
    energy: 2,
    budget: 105,
    event: "outage",
    forecast:
      "Power outage: each solar array supplies only 3 units. Connected batteries each supply another 4.",
    tint: "#b8a5ea",
    levels: [
      "Open access to learning",
      "Keep learning during outages",
      "Grow the campus",
    ],
  },
  {
    id: "makers-market-v1",
    title: "The Makers’ Market",
    project: "Build a circular manufacturing park",
    brief:
      "Connect workshops to three customer zones. Produce enough goods while powering the machines and processing their waste.",
    primary: "Workshop",
    support: "Recycling plant",
    nature: "Green buffer",
    output: "Useful production",
    unit: "goods units",
    capacity: 14,
    demand: 36,
    energy: 3,
    budget: 110,
    event: "outage",
    forecast:
      "Grid outage halves solar output. Every working workshop produces 3 waste units; each working recycling plant processes 12.",
    tint: "#f1b58a",
    levels: [
      "Build useful production",
      "Close the waste loop",
      "Scale a resilient enterprise",
    ],
  },
  {
    id: "food-rescue-v1",
    title: "The Food Rescue",
    project: "Build a resilient food distribution system",
    brief:
      "Place cold stores near three demand zones. Keep refrigeration powered and provide cooling reserves before a heatwave threatens the food.",
    primary: "Cold store",
    support: "Cooling reserve",
    nature: "Shaded loading area",
    output: "Food delivered",
    unit: "meal units",
    capacity: 16,
    demand: 42,
    energy: 3,
    budget: 115,
    event: "heat",
    forecast:
      "Heatwave: cold stores use 5 energy rather than 3. A connected adjacent cooling reserve keeps their demand at 3.",
    tint: "#f0cb88",
    levels: [
      "Connect the food chain",
      "Survive the heatwave",
      "Reach more people",
    ],
  },
];
export function getSimulationWorld(id: string) {
  return simulationWorlds.find((world) => world.id === id) ?? null;
}
export const tileCost: Record<Exclude<Tile, null>, number> = {
  road: 1,
  solar: 6,
  primary: 9,
  support: 7,
  nature: 3,
};
export const districts = [
  { x: 2, y: 1, name: "West homes" },
  { x: 8, y: 1, name: "East homes" },
  { x: 9, y: 6, name: "South homes" },
];
export function emptyBlueprint(): Blueprint {
  return Array(WIDTH * HEIGHT).fill(null);
}
export function neighbours(index: number) {
  const x = index % WIDTH,
    y = Math.floor(index / WIDTH);
  return [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ]
    .filter(([a, b]) => a >= 0 && a < WIDTH && b >= 0 && b < HEIGHT)
    .map(([a, b]) => b * WIDTH + a);
}
export function reserved(index: number) {
  return index === 0 || districts.some((d) => d.y * WIDTH + d.x === index);
}
export function waterTile(world: WorldSpec, index: number) {
  return world.id === "river-renewal-v1" && index % WIDTH === 5;
}
export function costOf(board: Blueprint) {
  return board.reduce<number>(
    (sum, tile) => sum + (tile ? tileCost[tile] : 0),
    0,
  );
}
export function placeModule(
  world: WorldSpec,
  board: Blueprint,
  index: number,
  tile: Tile,
) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= board.length ||
    reserved(index)
  )
    return board;
  if (
    waterTile(world, index) &&
    tile !== "road" &&
    tile !== "nature" &&
    tile !== null
  )
    return board;
  const next = [...board];
  next[index] = tile;
  return costOf(next) <= world.budget ? next : board;
}
export type SimulationReport = {
  success: boolean;
  output: number;
  goal: number;
  reach: number;
  energy: number;
  demand: number;
  ecology: number;
  waste: number;
  connected: number[];
  active: number[];
  offline: number[];
  problems: string[];
  cost: number;
};
export function evaluateBlueprint(
  world: WorldSpec,
  board: Blueprint,
  level = 0,
  stress = false,
): SimulationReport {
  const adjacentSupport = (i: number) =>
    neighbours(i).some((n) => board[n] === "support");
  const flooded = (i: number) =>
    stress &&
    world.event === "flood" &&
    Math.floor(i / WIDTH) === 4 &&
    !adjacentSupport(i) &&
    board[i] !== "support" &&
    board[i] !== "nature";
  const connected = new Set<number>([0]);
  const queue = [0];
  while (queue.length) {
    const i = queue.shift()!;
    for (const n of neighbours(i))
      if (board[n] === "road" && !connected.has(n) && !flooded(n)) {
        connected.add(n);
        queue.push(n);
      }
  }
  const active: number[] = [],
    offline: number[] = [];
  board.forEach((tile, i) => {
    if (!tile || tile === "road" || tile === "nature") return;
    const bank =
      world.id !== "river-renewal-v1" ||
      tile !== "primary" ||
      neighbours(i).some((n) => waterTile(world, n));
    if (neighbours(i).some((n) => connected.has(n)) && !flooded(i) && bank)
      active.push(i);
    else offline.push(i);
  });
  const support = (i: number) =>
    neighbours(i).some((n) => board[n] === "support" && active.includes(n));
  const generators = active.filter((i) => board[i] === "solar");
  const primaries = active.filter((i) => board[i] === "primary");
  const supports = active.filter((i) => board[i] === "support");
  const energy =
    generators.length * (stress && world.event === "outage" ? 3 : 6) +
    (world.event === "outage" && world.id !== "makers-market-v1"
      ? supports.length * 4
      : 0);
  const demand =
    primaries.reduce(
      (sum, i) =>
        sum +
        (stress && world.event === "heat" && !support(i) ? 5 : world.energy),
      0,
    ) + (world.id === "makers-market-v1" ? supports.length : 0);
  const powered = energy >= demand;
  const output = powered
    ? primaries.reduce(
        (sum, i) =>
          sum +
          (stress && world.event === "drought" && !support(i)
            ? 4
            : world.capacity),
        0,
      )
    : 0;
  const reach = powered
    ? districts.filter((d) =>
        primaries.some(
          (i) =>
            Math.abs((i % WIDTH) - d.x) +
              Math.abs(Math.floor(i / WIDTH) - d.y) <=
            3,
        ),
      ).length
    : 0;
  const ecology = board.reduce<number>(
    (sum, tile, i) =>
      sum +
      (tile === "nature" &&
      (world.id !== "river-renewal-v1" ||
        waterTile(world, i) ||
        neighbours(i).some((n) => waterTile(world, n)))
        ? 1
        : 0),
    0,
  );
  const waste =
    world.id === "makers-market-v1"
      ? Math.max(0, primaries.length * 3 - supports.length * 12)
      : 0;
  const goal = world.demand + level * 8;
  const problems: string[] = [];
  if (costOf(board) > world.budget)
    problems.push("Construction exceeds the available budget.");
  if (!powered)
    problems.push(
      `Energy shortfall: ${demand} needed, ${energy} supplied. Add connected generation or reduce demand.`,
    );
  if (output < goal)
    problems.push(
      `${world.output}: ${output}/${goal}. Check capacity, access and the disruption.`,
    );
  if (reach < 3)
    problems.push(
      `${3 - reach} residential zone(s) are beyond a working facility's 3-square service radius.`,
    );
  if (ecology < 3 + level)
    problems.push(
      `Add ${3 + level - ecology} more ${world.nature.toLowerCase()} square(s)${world.id === "river-renewal-v1" ? " on the river or its bank" : ""}.`,
    );
  if (waste)
    problems.push(
      `${waste} waste units remain unprocessed. Connect a recycling plant.`,
    );
  if (offline.length)
    problems.push(
      `${offline.length} facility/facilities offline: connect access, check riverbank placement or protect row 5.`,
    );
  return {
    success: !problems.length,
    output,
    goal,
    reach,
    energy,
    demand,
    ecology,
    waste,
    connected: [...connected],
    active,
    offline,
    problems,
    cost: costOf(board),
  };
}
export type BuildProof = { before: Blueprint; after: Blueprint };
export type SimulationSave = {
  version: 1;
  worldId: string;
  board: Blueprint;
  proofs: BuildProof[];
  baseline: Blueprint | null;
  updatedAt: number;
};
export function simulationKey(userId: string, worldId: string) {
  return `pipupath.simulation.v1:${userId}:${worldId}`;
}
export function parseSimulation(
  raw: string | null,
  world: WorldSpec,
): SimulationSave | null {
  if (!raw || raw.length > 60000) return null;
  try {
    const s = JSON.parse(raw) as SimulationSave;
    const valid = (b: unknown): b is Blueprint =>
      Array.isArray(b) &&
      b.length === WIDTH * HEIGHT &&
      b.every(
        (t, i) =>
          [null, "road", "solar", "primary", "support", "nature"].includes(t) &&
          (!reserved(i) || t === null) &&
          (!waterTile(world, i) ||
            t === null ||
            t === "road" ||
            t === "nature"),
      ) &&
      costOf(b) <= world.budget;
    if (
      s.version !== 1 ||
      s.worldId !== world.id ||
      !valid(s.board) ||
      !Array.isArray(s.proofs) ||
      s.proofs.length > world.levels.length ||
      !Number.isFinite(s.updatedAt) ||
      s.updatedAt <= 0
    )
      return null;
    if (
      s.proofs.some(
        (p, i) =>
          !p ||
          !valid(p.before) ||
          !valid(p.after) ||
          !evaluateBlueprint(world, p.before, i, false).success ||
          !evaluateBlueprint(world, p.after, i, true).success,
      )
    )
      return null;
    if (
      s.baseline !== null &&
      (!valid(s.baseline) ||
        s.proofs.length >= world.levels.length ||
        !evaluateBlueprint(world, s.baseline, s.proofs.length, false).success)
    )
      return null;
    return {
      version: 1,
      worldId: world.id,
      board: [...s.board],
      proofs: s.proofs.map((p) => ({
        before: [...p.before],
        after: [...p.after],
      })),
      baseline: s.baseline ? [...s.baseline] : null,
      updatedAt: s.updatedAt,
    };
  } catch {
    return null;
  }
}

export function moveModule(
  world: WorldSpec,
  board: Blueprint,
  from: number,
  to: number,
): Blueprint {
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    to < 0 ||
    from >= board.length ||
    to >= board.length ||
    reserved(from) ||
    reserved(to) ||
    !board[from]
  )
    return board;
  const next = [...board];
  next[to] = board[from];
  next[from] = board[to];
  if (
    [from, to].some(
      (i) =>
        waterTile(world, i) &&
        next[i] !== null &&
        next[i] !== "road" &&
        next[i] !== "nature",
    )
  )
    return board;
  return next;
}
