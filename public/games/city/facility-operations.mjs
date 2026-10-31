// Reusable fictional service contracts. Never spend Builder Credits or grant XP.
import { CITY_DISTRICTS } from "./districts.mjs";
import { CITY_CASES, getChoice } from "./cases.mjs";
import { deriveBuilderCity } from "./city-growth.mjs";

export const STRATEGIES = Object.freeze([
  {
    id: "balanced",
    name: "Steady service",
    detail: "Normal output; one maintenance unit prevents wear.",
  },
  {
    id: "urgent",
    name: "Urgent response",
    detail:
      "Two extra service units now; equipment wear reduces the next round's budget.",
  },
  {
    id: "resilient",
    name: "Protect tomorrow",
    detail:
      "One fewer service unit now; preventative maintenance removes wear.",
  },
]);
export const DEPENDENCIES = Object.freeze({
  workshop: ["power", "industry"],
  power: ["workshop", "environment"],
  market: ["water", "transport"],
  school: ["power", "transport"],
  housing: ["water", "power"],
  water: ["power", "workshop"],
  health: ["water", "power"],
  transport: ["workshop", "power"],
  technology: ["power", "school"],
  business: ["market", "transport"],
  environment: ["workshop", "governance"],
  governance: ["school", "technology"],
  creative: ["power", "transport"],
  industry: ["power", "school"],
});
const SERVICE_STORIES = {
  workshop:
    "Keep neighbourhood repairs moving so broken equipment does not hold everyone back.",
  power:
    "Keep essential workstations powered while protecting the equipment for tomorrow.",
  market: "Get usable food to families before supplies are wasted.",
  school:
    "Keep learning places accessible and ready for the next group of learners.",
  housing: "Keep homes connected to dependable everyday services.",
  water: "Keep safe water deliveries reaching the neighbourhood.",
  health: "Keep care requests moving through a dependable clinic service.",
  transport: "Keep accessible journeys running for work, learning and care.",
  technology:
    "Keep the community's communication and digital access points working.",
  business:
    "Keep small enterprises supplied so their customers can rely on them.",
  environment:
    "Keep collection and drainage services ahead of the next disruption.",
  governance:
    "Keep public service requests moving fairly through the community office.",
  creative: "Keep the public venue ready for an inclusive community programme.",
  industry:
    "Keep useful local production running without exhausting the maintenance team.",
};
const EVENTS = Object.freeze([
  {
    name: "An ordinary busy day",
    detail:
      "Residents need a dependable service without exhausting tomorrow's team.",
    loss: 0,
    cut: 0,
  },
  {
    name: "Rain interrupts deliveries",
    detail:
      "One unit of output is lost and the work budget falls by one. Keep essential service open.",
    loss: 1,
    cut: 1,
  },
  {
    name: "A neighbourhood gathering",
    detail:
      "Demand rises. Decide how much effort to use now and how much to protect for maintenance.",
    loss: 0,
    cut: 0,
  },
]);
const number = (v, min, max, fallback = 0) =>
  Number.isInteger(v) && v >= min && v <= max ? v : fallback;
const validDistrict = (id) => CITY_DISTRICTS.some((d) => d.id === id);
export function emptyOperations() {
  return {
    version: 1,
    settings: {
      difficulty: "standard",
      text: "normal",
      contrast: "glass",
      quality: "auto",
    },
    districts: {},
    drafts: {},
  };
}
export function simulateService(contract, plan) {
  if (
    !plan ||
    !STRATEGIES.some((s) => s.id === plan.strategy) ||
    !Array.isArray(plan.units) ||
    plan.units.length !== 3 ||
    !plan.units.every((v) => Number.isInteger(v) && v >= 0 && v <= 12)
  )
    return {
      ok: false,
      message:
        "Choose a strategy and assign whole work units to all three controls.",
    };
  const [crew, energy, maintenance] = plan.units,
    spent = crew + energy + maintenance;
  if (spent > contract.budget)
    return {
      ok: false,
      message: `Your plan uses ${spent} units, but only ${contract.budget} are available. Reduce a control and test again.`,
    };
  const raw =
    Math.min(crew * 2, energy * 3) +
    (plan.strategy === "urgent" ? 2 : plan.strategy === "resilient" ? -1 : 0) -
    contract.loss;
  const served = Math.max(0, Math.min(contract.capacity, raw));
  const reserve = contract.budget - spent;
  if (served < contract.demand)
    return {
      ok: false,
      served,
      reserve,
      message: `Your service reaches ${served} of ${contract.demand} requests. Staff and energy must work together; inspect the bottleneck before adding more.`,
    };
  if (maintenance < contract.minimumMaintenance)
    return {
      ok: false,
      served,
      reserve,
      message: `Protect the service with at least ${contract.minimumMaintenance} maintenance unit${contract.minimumMaintenance === 1 ? "" : "s"}.`,
    };
  const wear =
    plan.strategy === "urgent"
      ? Math.min(2, contract.wear + 1)
      : Math.max(
          0,
          contract.wear -
            (plan.strategy === "resilient" ? 2 : maintenance ? 1 : 0),
        );
  const score = Math.min(
    100,
    75 +
      Math.min(10, reserve * 2) +
      (plan.strategy === "resilient"
        ? 10
        : plan.strategy === "balanced"
          ? 5
          : 0) +
      (maintenance >= 2 ? 5 : 0),
  );
  return {
    ok: true,
    served,
    reserve,
    score,
    wear,
    spent,
    message: `${served} service units cover ${contract.demand} requests; ${reserve} work units remain. ${wear ? `Equipment wear will reduce the next budget by ${wear}.` : "The service is ready for the next round."}`,
  };
}
export function sanitizeOperations(value) {
  const safe = emptyOperations();
  if (value?.version !== 1) return safe;
  for (const [key, choices] of Object.entries({
    difficulty: ["guided", "standard", "expert"],
    text: ["normal", "large"],
    contrast: ["glass", "solid"],
    quality: ["auto", "battery"],
  }))
    if (choices.includes(value.settings?.[key]))
      safe.settings[key] = value.settings[key];
  for (const [id, record] of Object.entries(value.districts ?? {})) {
    if (!validDistrict(id) || !record || !number(record.completed, 1, 999))
      continue;
    const c = record.last?.contract,
      p = record.last?.plan;
    if (!c || !["guided", "standard", "expert"].includes(c.difficulty))
      continue;
    const contract = {
      difficulty: c.difficulty,
      round: number(c.round, 0, 998),
      event: number(c.event, 0, 2),
      demand: number(c.demand, 6, 12, 8),
      budget: number(c.budget, 10, 20, 14),
      capacity: number(c.capacity, 10, 16, 10),
      loss: number(c.loss, 0, 1),
      minimumMaintenance: number(c.minimumMaintenance, 0, 2),
      wear: number(c.wear, 0, 2),
    };
    const result = simulateService(contract, p);
    if (!result.ok || contract.round !== record.completed - 1) continue;
    safe.districts[id] = {
      completed: record.completed,
      best: Math.max(result.score, number(record.best, 75, 100, result.score)),
      last: { contract, plan: { strategy: p.strategy, units: [...p.units] } },
    };
  }
  for (const [id, draft] of Object.entries(value.drafts ?? {})) {
    if (
      !validDistrict(id) ||
      !draft ||
      draft.round !== (safe.districts[id]?.completed ?? 0) ||
      !STRATEGIES.some((s) => s.id === draft.strategy) ||
      !Array.isArray(draft.units) ||
      draft.units.length !== 3 ||
      !draft.units.every((v) => Number.isInteger(v) && v >= 0 && v <= 12)
    )
      continue;
    safe.drafts[id] = {
      round: draft.round,
      strategy: draft.strategy,
      units: [...draft.units],
    };
  }
  return safe;
}
export function facilityContract(state, id) {
  const district = CITY_DISTRICTS.find((d) => d.id === id);
  if (!district) return null;
  const operations = sanitizeOperations(state.operations),
    record = operations.districts[id];
  const city = deriveBuilderCity(state.decisions),
    round = record?.completed ?? 0;
  const dependencies = DEPENDENCIES[id].map((key) => ({
    id: key,
    name: CITY_DISTRICTS.find((d) => d.id === key).name,
    service: Math.round(city.districts[key].service),
    built: Boolean(city.districts[key].built),
  }));
  const reliability =
    dependencies.reduce((n, d) => n + d.service, 0) / dependencies.length;
  const difficulty = operations.settings.difficulty,
    event = round % EVENTS.length;
  const wear = record
    ? simulateService(record.last.contract, record.last.plan).wear
    : 0;
  return {
    id,
    name: district.name,
    dependencies,
    unlocked: CITY_CASES.some(
      (c) => c.district === id && getChoice(c.id, state.decisions?.[c.id]),
    ),
    story: SERVICE_STORIES[id],
    reaction: record
      ? wear
        ? "The last plan reached people, but our equipment now needs attention."
        : "Your last plan kept the service running. Let us protect that progress."
      : "This service needs a dependable operating plan.",
    difficulty,
    round,
    event,
    eventName: EVENTS[event].name,
    brief: EVENTS[event].detail,
    demand:
      { guided: 6, standard: 8, expert: 9 }[difficulty] + (event === 2 ? 1 : 0),
    budget:
      { guided: 18, standard: 16, expert: 14 }[difficulty] +
      Math.min(2, Math.floor(reliability / 35)) -
      EVENTS[event].cut -
      wear,
    capacity: Math.max(10, Math.min(16, 10 + Math.floor(reliability / 25))),
    loss: EVENTS[event].loss,
    minimumMaintenance: { guided: 0, standard: 1, expert: 2 }[difficulty],
    wear,
    completed: round,
    best: record?.best ?? null,
    speaker: [
      "school",
      "health",
      "housing",
      "governance",
      "technology",
    ].includes(id)
      ? "Bisi"
      : ["market", "business", "transport", "environment", "creative"].includes(
            id,
          )
        ? "Tunde"
        : "Ama",
  };
}
export function testFacility(state, id, plan) {
  const contract = facilityContract(state, id);
  if (!contract?.unlocked)
    return {
      ok: false,
      message:
        "Make a decision in this district first to open its service worksite.",
    };
  if (contract.round >= 999)
    return {
      ok: false,
      message:
        "This district's practice record is full. Your city remains available to inspect.",
    };
  return { ...simulateService(contract, plan), contract };
}
export function applyFacility(state, id, plan, expectedRound) {
  const result = testFacility(state, id, plan);
  if (!result.ok || result.contract.round !== expectedRound) return null;
  const operations = sanitizeOperations(state.operations),
    c = result.contract;
  operations.districts[id] = {
    completed: c.round + 1,
    best: Math.max(c.best ?? 0, result.score),
    last: {
      contract: {
        difficulty: c.difficulty,
        round: c.round,
        event: c.event,
        demand: c.demand,
        budget: c.budget,
        capacity: c.capacity,
        loss: c.loss,
        minimumMaintenance: c.minimumMaintenance,
        wear: c.wear,
      },
      plan: { strategy: plan.strategy, units: [...plan.units] },
    },
  };
  delete operations.drafts[id];
  return { operations, result };
}
export function operationsActivity(economy, operations) {
  const safe = sanitizeOperations(operations),
    operationServices = {};
  for (const [id, r] of Object.entries(safe.districts)) {
    const result = simulateService(r.last.contract, r.last.plan);
    operationServices[id] = {
      gain: Math.min(
        24,
        Math.round(result.score / 10) + Math.min(3, r.completed) * 3,
      ),
      served: result.served,
      wear: result.wear,
    };
  }
  return { ...economy, operationServices };
}
