import { SITES } from "./layout.mjs";
// Bounded fictional supply-chain simulation. Values are game parameters, not
// real food-safety, financial, electrical or engineering guidance.
export const VERSION = 1;
export const FARM = Object.freeze({ x: -12, z: -15 });
export const MARKET = Object.freeze({ x: 9, z: 11 });
export const ITEMS = Object.freeze([
  {
    id: "crates",
    name: "Protective crates",
    cost: 8,
    materials: 3,
    detail: "Reduce damage in loading and transport. Fit at the farm.",
    placement: "farm",
  },
  {
    id: "shade",
    name: "Storage shelter",
    cost: 14,
    materials: 6,
    detail: "Shade slows produce deterioration within 6 m.",
    placement: "land",
  },
  {
    id: "bridge",
    name: "Raised crossing",
    cost: 22,
    materials: 10,
    detail: "Create a shorter all-weather route across the stream.",
    placement: "river",
  },
  {
    id: "cargo",
    name: "Cargo tricycle",
    cost: 20,
    materials: 6,
    detail: "Faster transport uses an operating token per trip.",
    placement: "farm",
  },
  {
    id: "solar",
    name: "Solar supply",
    cost: 18,
    materials: 5,
    detail: "Produces up to 3 power units. Rain reduces generation.",
    placement: "land",
  },
  {
    id: "battery",
    name: "Battery store",
    cost: 12,
    materials: 4,
    detail: "Stores 16 power units for interruptions. Needs nearby solar.",
    placement: "land",
  },
  {
    id: "coldroom",
    name: "Cold store",
    cost: 22,
    materials: 8,
    detail:
      "Slows produce deterioration within 6 m when supplied with 2 power units.",
    placement: "land",
  },
  {
    id: "team",
    name: "Resident delivery team",
    cost: 14,
    materials: 2,
    detail: "Train Ama and Bisi to load and dispatch independently.",
    placement: "market",
  },
]);
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const clone = (s) => JSON.parse(JSON.stringify(s));
export const item = (id) => ITEMS.find((i) => i.id === id);
export function freshWorld() {
  return {
    version: VERSION,
    cash: 90,
    materials: 40,
    buildings: [],
    phase: 1,
    passed: [],
    running: false,
    observing: false,
    speed: 1,
    dayTime: 0,
    day: 0,
    goods: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      age: 0,
      place: "farm",
    })),
    nextGood: 8,
    harvested: 8,
    served: 0,
    lost: 0,
    damage: 0,
    spoiled: 0,
    tripCost: 0,
    earned: 0,
    battery: 0,
    cart: {
      leg: "idle",
      position: { ...FARM },
      path: [],
      segment: 0,
      load: [],
      progress: 0,
    },
    dispatch: false,
    secondHarvest: false,
    weather: "dry",
    result: null,
    history: [],
    player: { x: 2, z: 15 },
    camera: { yaw: 0.7, pitch: 0.72, distance: 34 },
    reflection: "",
  };
}
export function buildCheck(s, id, point) {
  const spec = item(id);
  if (!spec) return { ok: false, message: "Choose a tool from Build." };
  if (
    !point ||
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.z) ||
    Math.abs(point.x) > 27 ||
    Math.abs(point.z) > 23
  )
    return { ok: false, message: "Choose a place inside the neighbourhood." };
  if (
    s.buildings.some((b) => b.kind === id) &&
    !["shade", "solar"].includes(id)
  )
    return { ok: false, message: "This upgrade is already in place." };
  if (
    ["shade", "solar"].includes(id) &&
    s.buildings.filter((b) => b.kind === id).length >= 3
  )
    return {
      ok: false,
      message: "This neighbourhood has room for three of this structure.",
    };
  if (s.cash < spec.cost || s.materials < spec.materials)
    return {
      ok: false,
      message:
        "Not enough reserve or materials. Reclaim an unused build to try another design.",
    };
  if (spec.placement === "farm" && distance(point, FARM) > 5)
    return {
      ok: false,
      message: "Fit this upgrade at the farm collection area.",
    };
  if (spec.placement === "market" && distance(point, MARKET) > 6)
    return { ok: false, message: "Meet the resident team beside the market." };
  if (
    spec.placement === "river" &&
    (point.x < -7 || point.x > 10 || Math.abs(point.z + 2) > 2)
  )
    return {
      ok: false,
      message:
        "Span the narrow stream between the marked banks, west of the public bridge.",
    };
  if (spec.placement === "land" && point.z > -5 && point.z < 1)
    return {
      ok: false,
      message: "This equipment needs dry land. Keep the stream clear.",
    };
  if (
    spec.placement === "land" &&
    SITES.some(
      (b) =>
        !["farm", "market"].includes(b.id) &&
        Math.abs(point.x - b.x) < b.w / 2 + 1.8 &&
        Math.abs(point.z - b.z) < b.d / 2 + 1.8,
    )
  )
    return {
      ok: false,
      message: "Keep existing homes, services and their entrances clear.",
    };
  if (
    spec.placement === "land" &&
    s.buildings.some(
      (b) =>
        ["shade", "solar", "battery", "coldroom"].includes(b.kind) &&
        distance(point, b) < 3.4,
    )
  )
    return {
      ok: false,
      message: "Leave room between structures for people and maintenance.",
    };
  if (
    spec.placement === "land" &&
    ((point.x > 5 && point.x < 14 && point.z > 5 && point.z < 15) ||
      (point.x < -8 && point.x > -17 && point.z < -12 && point.z > -20))
  )
    return {
      ok: false,
      message:
        "Keep the market stalls and planted beds accessible. Build beside them.",
    };
  return {
    ok: true,
    message:
      spec.placement === "river"
        ? "A supervised crew will span both banks."
        : `Place ${spec.name.toLowerCase()} here.`,
  };
}
export function build(s, id, point) {
  const check = buildCheck(s, id, point);
  if (!check.ok) return { state: s, ...check };
  const n = clone(s),
    spec = item(id),
    p =
      spec.placement === "farm"
        ? { x: FARM.x - 3, z: FARM.z + 4 }
        : spec.placement === "market"
          ? { x: MARKET.x - 4, z: MARKET.z + 5 }
          : spec.placement === "river"
            ? { x: point.x, z: -2 }
            : point;
  let serial = 0;
  while (n.buildings.some((b) => b.id === `${id}-${serial}`)) serial++;
  n.buildings.push({
    id: `${id}-${serial}`,
    kind: id,
    x: p.x,
    z: p.z,
    cost: spec.cost,
    materials: spec.materials,
  });
  n.cash -= spec.cost;
  n.materials -= spec.materials;
  n.result = null;
  return {
    state: n,
    ok: true,
    message: `${spec.name} is ready. ${spec.detail}`,
  };
}
export function reclaim(s, id) {
  const b = s.buildings.find((b) => b.id === id);
  if (!b) return s;
  const n = clone(s);
  n.buildings = n.buildings.filter((b) => b.id !== id);
  n.cash += b.cost;
  n.materials += b.materials;
  return n;
}
export const has = (s, kind) => s.buildings.some((b) => b.kind === kind);
export function deliveryRoute(s) {
  const choices = [
    {
      id: "public",
      name: "Public road bridge",
      x: 18,
      speed: s.weather === "rain" ? 1.3 : 1.8,
    },
  ];
  if (s.weather === "dry")
    choices.push({ id: "ford", name: "Old low crossing", x: -12, speed: 1.8 });
  for (const b of s.buildings.filter((b) => b.kind === "bridge"))
    choices.push({
      id: b.id,
      name: "Your raised crossing",
      x: b.x,
      speed: s.weather === "rain" ? 1.3 : 1.8,
    });
  const candidates = choices.map((r) => {
    const points = [
      { ...FARM },
      { x: FARM.x, z: FARM.z + 4 },
      { x: r.x, z: -6 },
      { x: r.x, z: 2 },
      { x: MARKET.x, z: 5 },
      { ...MARKET },
    ];
    let length = 0;
    for (let i = 1; i < points.length; i++)
      length += distance(points[i - 1], points[i]);
    return {
      ...r,
      points,
      length,
      seconds:
        length /
        (has(s, "cargo") ? (s.weather === "rain" ? 2.4 : 2.8) : r.speed),
    };
  });
  return candidates.sort((a, b) => a.seconds - b.seconds)[0];
}
function harvest(s, n) {
  for (let i = 0; i < n; i++)
    s.goods.push({ id: ++s.nextGood, age: 0, place: "farm" });
  s.harvested += n;
}
export function beginDay(s) {
  const n = clone(s);
  n.day++;
  n.dayTime = 0;
  n.weather = n.phase === 2 ? "rain" : "dry";
  n.goods = [];
  n.nextGood = 0;
  n.harvested = 0;
  n.served = 0;
  n.lost = 0;
  n.damage = 0;
  n.spoiled = 0;
  n.tripCost = 0;
  n.earned = 0;
  n.secondHarvest = false;
  n.result = null;
  n.dispatch = true;
  n.battery = Math.min(n.battery, 16);
  n.cart = {
    leg: "idle",
    position: { ...FARM },
    path: [],
    segment: 0,
    load: [],
    progress: 0,
  };
  n.running = true;
  harvest(n, 8);
  return n;
}
export function power(s) {
  const nodes = s.buildings.filter((b) =>
    ["solar", "battery", "coldroom"].includes(b.kind),
  );
  const cold = nodes.find((b) => b.kind === "coldroom"),
    battery = nodes.find((b) => b.kind === "battery");
  const component = (root) => {
    if (!root) return [];
    const reached = new Set([root.id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const b of nodes)
        if (
          !reached.has(b.id) &&
          nodes.some((a) => reached.has(a.id) && distance(a, b) < 10)
        ) {
          reached.add(b.id);
          changed = true;
        }
    }
    return nodes.filter((b) => reached.has(b.id));
  };
  const sun = s.weather === "rain" ? 0.8 : 3,
    coldNet = component(cold),
    batteryNet = component(battery);
  const available = coldNet.filter((b) => b.kind === "solar").length * sun;
  const chargeGeneration =
    batteryNet.filter((b) => b.kind === "solar").length * sun;
  const generation = nodes.filter((b) => b.kind === "solar").length * sun,
    demand = cold ? 2 : 0;
  const linked = !!cold && available > 0,
    charged = !!battery && chargeGeneration > 0,
    batteryLinked = !!cold && coldNet.some((b) => b.id === battery?.id);
  const supplied =
    !!cold && (available >= demand || (batteryLinked && s.battery > 0));
  return {
    generation,
    demand,
    available,
    chargeGeneration,
    linked,
    charged,
    batteryLinked,
    supplied,
  };
}
function startLoad(s) {
  const stock = s.goods.filter((g) => g.place === "farm");
  if (!stock.length) return;
  if (!s.dispatch && !has(s, "team")) return;
  const batch = stock.slice(0, 6),
    route = deliveryRoute(s);
  s.dispatch = false;
  const broken = has(s, "crates") ? 0 : Math.floor(batch.length * 0.34);
  for (let i = 0; i < batch.length; i++) {
    batch[i].place = i < broken ? "lost" : "cart";
    if (i < broken) {
      s.damage++;
      s.lost++;
    }
  }
  s.cart.load = batch.filter((g) => g.place === "cart").map((g) => g.id);
  s.cart.path = route.points;
  s.cart.routeName = route.name;
  s.cart.segment = 0;
  s.cart.leg = "outbound";
  s.cart.progress = 0;
  s.cart.seconds = route.seconds;
  s.cart.position = { ...FARM };
  if (has(s, "cargo")) s.tripCost++;
}
function travel(s, dt) {
  const c = s.cart;
  if (!["outbound", "return"].includes(c.leg)) return;
  const points = c.path,
    speed = has(s, "cargo")
      ? s.weather === "rain"
        ? 2.4
        : 2.8
      : s.weather === "rain"
        ? 1.3
        : 1.8;
  let move = speed * dt;
  while (move > 0 && c.segment < points.length - 1) {
    const end = points[c.segment + 1],
      d = distance(c.position, end);
    if (d <= move) {
      c.position = { ...end };
      c.segment++;
      move -= d;
    } else {
      c.position.x += ((end.x - c.position.x) * move) / d;
      c.position.z += ((end.z - c.position.z) * move) / d;
      move = 0;
    }
  }
  if (c.segment === points.length - 1) {
    if (c.leg === "outbound") {
      for (const g of s.goods)
        if (c.load.includes(g.id) && g.place === "cart") g.place = "market";
      c.load = [];
      c.leg = "return";
      c.path = [...c.path].reverse();
      c.segment = 0;
    } else {
      c.leg = "idle";
      c.path = [];
      c.segment = 0;
      c.position = { ...FARM };
    }
  }
}
function ageGoods(s, dt, p) {
  for (const g of s.goods) {
    if (!["farm", "cart", "market"].includes(g.place)) continue;
    const pos =
      g.place === "farm"
        ? FARM
        : g.place === "market"
          ? MARKET
          : s.cart.position;
    let rate = 1;
    if (s.buildings.some((b) => b.kind === "shade" && distance(b, pos) < 6))
      rate = 0.45;
    const cold = s.buildings.find((b) => b.kind === "coldroom");
    if (p.supplied && cold && distance(cold, pos) < 6) rate = 0.12;
    if (g.place === "cart" && has(s, "crates")) rate *= 0.7;
    g.age += dt * rate;
    if (g.age > 75) {
      g.place = "lost";
      s.lost++;
      s.spoiled++;
    }
  }
}
export function outcome(s) {
  const p = power(s),
    rate = s.harvested ? s.lost / s.harvested : 0;
  const issues = [];
  if (s.served < 12)
    issues.push(
      `${s.served}/12 households received produce. Check route time, damage and usable stock.`,
    );
  if (rate > 0.25)
    issues.push(
      `${Math.round(rate * 100)}% of the harvest was lost. Inspect handling and storage.`,
    );
  if (!has(s, "team"))
    issues.push(
      "The next collection still waits for you. Train the resident delivery team.",
    );
  if (s.cash + s.earned - s.tripCost < 8)
    issues.push("Leave at least 8 reserve tokens for ongoing care.");
  return {
    success: issues.length === 0,
    issues,
    served: s.served,
    loss: s.lost,
    harvested: s.harvested,
    route: deliveryRoute(s).name,
    power: p.supplied,
    independent: has(s, "team"),
  };
}
export function advance(s, seconds) {
  if (!s.running || !Number.isFinite(seconds) || seconds <= 0) return s;
  const n = clone(s);
  let remain = Math.min(seconds, 300);
  while (remain > 0 && n.running) {
    const dt = Math.min(0.25, remain);
    remain -= dt;
    n.dayTime += dt;
    if (!n.secondHarvest && n.dayTime >= 35) {
      harvest(n, 8);
      n.secondHarvest = true;
    }
    const p = power(n);
    if (p.charged)
      n.battery = Math.min(
        16,
        n.battery +
          Math.max(0, p.chargeGeneration - (p.batteryLinked ? p.demand : 0)) *
            dt,
      );
    if (p.supplied && p.batteryLinked && p.available < p.demand)
      n.battery = Math.max(0, n.battery - (p.demand - p.available) * dt);
    if (n.cart.leg === "idle") startLoad(n);
    travel(n, dt);
    ageGoods(n, dt, p);
    const demand = Math.min(12, Math.floor(Math.max(0, n.dayTime - 8) / 3));
    while (n.served < demand) {
      const good = n.goods.find((g) => g.place === "market");
      if (!good) break;
      good.place = "served";
      n.served++;
      n.earned += 2;
    }
    const report = outcome(n);
    if (n.observing) {
      if (n.dayTime >= 100) {
        const history = [...n.history, { phase: n.phase, ...report }].slice(
          -40,
        );
        n.cash = Math.max(0, Math.min(10000, n.cash + n.earned - n.tripCost));
        Object.assign(n, beginDay(n));
        n.history = history;
      }
    } else if (report.success || n.dayTime >= 100) {
      n.running = false;
      n.result = report;
      n.history.push({ phase: n.phase, ...report });
      n.history = n.history.slice(-40);
      if (report.success && !n.passed.includes(n.phase)) {
        n.passed.push(n.phase);
        n.cash += n.earned - n.tripCost;
        n.earned = 0;
        n.tripCost = 0;
      }
    }
  }
  return n;
}
export function nextPhase(s) {
  if (s.phase !== 1 || !s.passed.includes(1)) return s;
  const n = clone(s);
  n.phase = 2;
  n.weather = "rain";
  n.running = false;
  n.result = null;
  n.dayTime = 0;
  n.goods = [];
  n.harvested = 0;
  n.nextGood = 0;
  n.served = 0;
  n.lost = 0;
  n.damage = 0;
  n.spoiled = 0;
  n.tripCost = 0;
  n.earned = 0;
  n.cart = {
    leg: "idle",
    position: { ...FARM },
    path: [],
    segment: 0,
    load: [],
    progress: 0,
  };
  return n;
}
export function inventory(s) {
  return {
    farm: s.goods.filter((g) => g.place === "farm").length,
    cart: s.goods.filter((g) => g.place === "cart").length,
    market: s.goods.filter((g) => g.place === "market").length,
    served: s.goods.filter((g) => g.place === "served").length,
    lost: s.goods.filter((g) => g.place === "lost").length,
  };
}
export function saveWorld(s) {
  return JSON.stringify({ version: VERSION, state: s });
}
export function restoreWorld(raw) {
  try {
    if (typeof raw !== "string" || raw.length > 120000) return null;
    const data = JSON.parse(raw),
      s = data.state;
    if (
      data.version !== VERSION ||
      s?.version !== VERSION ||
      ![1, 2].includes(s.phase) ||
      !Number.isFinite(s.cash) ||
      s.cash < 0 ||
      s.cash > 10000 ||
      !Number.isFinite(s.materials) ||
      s.materials < 0 ||
      s.materials > 500 ||
      !Array.isArray(s.buildings) ||
      s.buildings.length > 16 ||
      !Array.isArray(s.goods) ||
      s.goods.length > 32 ||
      !Array.isArray(s.passed) ||
      s.passed.some((p) => ![1, 2].includes(p))
    )
      return null;
    for (const b of s.buildings)
      if (
        !item(b.kind) ||
        typeof b.id !== "string" ||
        b.id.length > 80 ||
        b.cost !== item(b.kind).cost ||
        b.materials !== item(b.kind).materials ||
        !Number.isFinite(b.x) ||
        !Number.isFinite(b.z) ||
        Math.abs(b.x) > 30 ||
        Math.abs(b.z) > 25
      )
        return null;
    if (new Set(s.buildings.map((b) => b.id)).size !== s.buildings.length)
      return null;
    for (const kind of ITEMS) {
      if (
        s.buildings.filter((b) => b.kind === kind.id).length >
        (["solar", "shade"].includes(kind.id) ? 3 : 1)
      )
        return null;
    }
    for (const key of ["observing", "dispatch", "secondHarvest", "running"])
      if (typeof s[key] !== "boolean") return null;
    if (
      s.result !== null &&
      (!s.result ||
        typeof s.result.success !== "boolean" ||
        !Array.isArray(s.result.issues) ||
        s.result.issues.some((i) => typeof i !== "string"))
    )
      return null;
    for (const g of s.goods)
      if (
        !Number.isInteger(g.id) ||
        !Number.isFinite(g.age) ||
        g.age < 0 ||
        !["farm", "cart", "market", "served", "lost"].includes(g.place)
      )
        return null;
    if (
      !s.cart ||
      !Array.isArray(s.cart.path) ||
      s.cart.path.length > 6 ||
      !["idle", "outbound", "return"].includes(s.cart.leg) ||
      !Number.isFinite(s.cart.position?.x) ||
      !Number.isFinite(s.cart.position?.z) ||
      !Number.isFinite(s.dayTime) ||
      s.dayTime < 0 ||
      s.dayTime > 101 ||
      !Number.isFinite(s.battery) ||
      s.battery < 0 ||
      s.battery > 16
    )
      return null;
    for (const key of [
      "dayTime",
      "day",
      "nextGood",
      "harvested",
      "served",
      "lost",
      "damage",
      "spoiled",
      "tripCost",
      "earned",
      "battery",
    ])
      if (!Number.isFinite(s[key]) || s[key] < 0 || s[key] > 10000) return null;
    if (
      !Array.isArray(s.history) ||
      !Array.isArray(s.cart.load) ||
      !Number.isInteger(s.cart.segment) ||
      s.cart.segment < 0 ||
      s.cart.segment > 5 ||
      s.cart.path.some(
        (p) =>
          !Number.isFinite(p.x) ||
          !Number.isFinite(p.z) ||
          Math.abs(p.x) > 30 ||
          Math.abs(p.z) > 25,
      )
    )
      return null;
    if (
      new Set(s.goods.map((g) => g.id)).size !== s.goods.length ||
      s.goods.length !== s.harvested ||
      s.goods.filter((g) => g.place === "served").length !== s.served ||
      s.goods.filter((g) => g.place === "lost").length !== s.lost
    )
      return null;
    const n = { ...freshWorld(), ...s, running: false, speed: 1 };
    if (typeof n.reflection !== "string") n.reflection = "";
    n.reflection = n.reflection.slice(0, 600);
    if (n.history.length > 40) n.history = n.history.slice(-40);
    n.player = {
      x: Math.max(-28, Math.min(28, Number(n.player?.x) || 2)),
      z: Math.max(-24, Math.min(24, Number(n.player?.z) || 15)),
    };
    const c = n.camera ?? {};
    n.camera = {
      yaw: Number.isFinite(c.yaw) ? c.yaw : 0.7,
      pitch: Math.max(0.35, Math.min(1.35, Number(c.pitch) || 0.72)),
      distance: Math.max(14, Math.min(70, Number(c.distance) || 34)),
    };
    return n;
  } catch {
    return null;
  }
}
