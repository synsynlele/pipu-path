// Fictional workshop model. No real repair, medical or engineering guidance.
export const JOBS = Object.freeze([
  {
    id: "pump",
    name: "Community pump",
    minutes: 4,
    due: 6,
    essential: true,
    detail:
      "Water collection is stopped. A trained repairer needs 4 shift minutes; restore it by minute 6.",
  },
  {
    id: "cold",
    name: "Market cooler",
    minutes: 4,
    due: 9,
    essential: true,
    detail:
      "Traders cannot protect their harvest. Needs 4 shift minutes; restore it by minute 9.",
  },
  {
    id: "cart",
    name: "Clinic delivery cart",
    minutes: 3,
    due: 10,
    essential: true,
    detail:
      "The clinic’s supplies are waiting for transport. Needs 3 shift minutes; return it by minute 10.",
  },
  {
    id: "radio",
    name: "Household radio",
    minutes: 2,
    due: 12,
    essential: false,
    detail:
      "Its owner wants news and company. Needs 2 shift minutes; collection is at shift end.",
  },
  {
    id: "lamp",
    name: "Study lamp",
    minutes: 2,
    due: 12,
    essential: false,
    detail:
      "A learner needs light this evening. Needs 2 shift minutes; collection is at shift end.",
  },
  {
    id: "chair",
    name: "Shop chair",
    minutes: 3,
    due: 12,
    essential: false,
    detail:
      "The shopkeeper is waiting for a repaired seat. Needs 3 shift minutes; collection is at shift end.",
  },
]);
export const newRepairQueue = () => ({
  version: 1,
  inspected: [],
  queue: [],
  held: null,
  workflow: false,
  bench: false,
  helper: false,
  cash: 8,
  time: 0,
  running: false,
  workers: [],
  finished: [],
  result: null,
  attempts: 0,
});
const copy = (s) => structuredClone(s);
export function repairReport(s) {
  const essential = JOBS.filter((j) => j.essential),
    onTime = essential.filter((j) =>
      s.finished.some((f) => f.id === j.id && f.at <= j.due),
    );
  return {
    success: onTime.length === 3 && s.finished.length >= 5,
    essential: onTime.length,
    total: s.finished.length,
    spent: 8 - s.cash,
    late: essential.filter((j) => !onTime.includes(j)).map((j) => j.name),
  };
}
export function repairAction(s, type, id) {
  const j = JOBS.find((j) => j.id === id),
    locked = s.running || s.time > 0;
  if (type === "retry") {
    const n = copy(s);
    Object.assign(n, {
      queue: [],
      held: null,
      time: 0,
      running: false,
      workers: [],
      finished: [],
      result: null,
    });
    return n;
  }
  if (type === "reset") return newRepairQueue();
  if (type === "pause") {
    const n = copy(s);
    if (n.time > 0 && n.time < 12 && !n.result) n.running = !n.running;
    return n;
  }
  if (locked) return s;
  const n = copy(s);
  if (type === "inspect" && j && !n.inspected.includes(id))
    n.inspected.push(id);
  else if (
    type === "lift" &&
    j &&
    n.inspected.includes(id) &&
    !n.held &&
    !n.queue.includes(id)
  )
    n.held = id;
  else if (type === "place" && n.held) {
    n.queue.push(n.held);
    n.held = null;
  } else if (type === "take" && j && n.queue.includes(id) && !n.held) {
    n.queue = n.queue.filter((i) => i !== id);
    n.held = id;
  } else if (type === "return" && n.held) n.held = null;
  else if (type === "workflow" && !n.workflow && n.inspected.length === 6)
    n.workflow = true;
  else if (type === "bench" && !n.bench && n.cash >= 6) {
    n.bench = true;
    n.cash -= 6;
  } else if (type === "helper" && !n.helper && n.cash >= 2) {
    n.helper = true;
    n.cash -= 2;
  } else if (
    type === "run" &&
    n.queue.length &&
    n.inspected.length === 6 &&
    !n.held
  ) {
    n.running = true;
    n.attempts++;
  } else return s;
  return n;
}
export function advanceRepair(s, minutes) {
  if (!s.running || !Number.isFinite(minutes) || minutes <= 0) return s;
  const n = copy(s);
  let remain = Math.min(minutes, 12 - n.time);
  while (remain > 1e-9 && n.running) {
    const dt = Math.min(0.025, remain);
    remain -= dt;
    const capacity = n.bench && n.helper ? 2 : 1;
    while (n.workers.length < capacity) {
      const next = n.queue.find(
        (id) =>
          !n.finished.some((f) => f.id === id) &&
          !n.workers.some((w) => w.id === id),
      );
      if (!next) break;
      n.workers.push({
        id: next,
        remaining:
          JOBS.find((j) => j.id === next).minutes * (n.workflow ? 0.75 : 1),
      });
    }
    n.time = Math.min(12, n.time + dt);
    for (const w of n.workers) w.remaining -= dt;
    for (const w of n.workers.filter((w) => w.remaining <= 1e-8))
      n.finished.push({ id: w.id, at: Math.round(n.time * 1000) / 1000 });
    n.workers = n.workers.filter((w) => w.remaining > 1e-8);
    if (n.time >= 12 - 1e-8) {
      n.time = 12;
      n.running = false;
      n.result = repairReport(n);
    }
  }
  return n;
}
export function restoreRepair(raw) {
  try {
    if (typeof raw !== "string" || raw.length > 10000) return null;
    const s = JSON.parse(raw),
      ids = JOBS.map((j) => j.id);
    if (
      s.version !== 1 ||
      !["workflow", "bench", "helper", "running"].every(
        (k) => typeof s[k] === "boolean",
      ) ||
      !Array.isArray(s.inspected) ||
      !Array.isArray(s.queue) ||
      !Array.isArray(s.finished) ||
      !Array.isArray(s.workers)
    )
      return null;
    for (const list of [
      s.inspected,
      s.queue,
      s.finished.map((f) => f.id),
      s.workers.map((w) => w.id),
    ])
      if (
        new Set(list).size !== list.length ||
        list.some((id) => !ids.includes(id))
      )
        return null;
    if (
      s.queue.some((id) => !s.inspected.includes(id)) ||
      (s.held !== null &&
        (!ids.includes(s.held) ||
          s.queue.includes(s.held) ||
          !s.inspected.includes(s.held))) ||
      s.cash !== 8 - (s.bench ? 6 : 0) - (s.helper ? 2 : 0) ||
      !Number.isFinite(s.time) ||
      s.time < 0 ||
      s.time > 12 ||
      !Number.isInteger(s.attempts) ||
      s.attempts < 0
    )
      return null;
    if (
      s.finished.some(
        (f) =>
          !s.queue.includes(f.id) ||
          !Number.isFinite(f.at) ||
          f.at < 0 ||
          f.at > s.time + 0.000001,
      ) ||
      s.workers.some(
        (w) =>
          !s.queue.includes(w.id) ||
          s.finished.some((f) => f.id === w.id) ||
          !Number.isFinite(w.remaining) ||
          w.remaining <= 0 ||
          w.remaining > 4,
      ) ||
      s.workers.length > (s.bench && s.helper ? 2 : 1)
    )
      return null;
    return {
      ...s,
      running: false,
      result: s.time === 12 ? repairReport(s) : null,
    };
  } catch {
    return null;
  }
}
