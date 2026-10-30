// Chapter 4: bounded fictional service continuity, not measured human outcomes.
import { deriveBuilderCity } from "./city-growth.mjs";
import {
  foundationForOpportunities,
  sanitizeOpportunityState,
} from "./opportunities.mjs";

export const RESILIENCE_EVENTS = Object.freeze([
  {
    title: "Rain tests the neighbourhood",
    detail:
      "Heavy rain slows deliveries and water production. Clinics, growers and repair teams still need supplies.",
    water: 4,
    farms: 3,
    food: 5,
    repairs: 3,
  },
  {
    title: "Keep essential services running",
    detail:
      "A power interruption reduces water output. Repairs from the previous challenge can soften the disruption.",
    water: 5,
    farms: 3,
    food: 5,
    repairs: 3,
  },
  {
    title: "A hotter market day",
    detail:
      "People need more water and food can spoil. Earlier maintenance helps protect stored food.",
    water: 6,
    farms: 4,
    food: 6,
    repairs: 2,
  },
]);
export const RESILIENCE_PRIORITIES = Object.freeze([
  {
    id: "care",
    title: "Protect care first",
    detail:
      "Send available water to the clinic before growers. Food production may be lower.",
  },
  {
    id: "food",
    title: "Protect food supply",
    detail:
      "Water growers before the clinic. More food may reach shops while care waits.",
  },
  {
    id: "repair",
    title: "Repair for tomorrow",
    detail:
      "Use water and parts for repairs before other services. Two completed repairs help the next challenge, but less water remains today.",
  },
]);
const products = ["water", "parts", "food"];
const services = [
  "water",
  "industry",
  "market",
  "health",
  "workshop",
  "business",
  "transport",
];
const int = (n, max) => Number.isInteger(n) && n >= 0 && n <= max;
const validPriority = (id) => RESILIENCE_PRIORITIES.some((p) => p.id === id);
export function canStartResilience(decisions, economy) {
  return (
    foundationForOpportunities(decisions) &&
    sanitizeOpportunityState(economy)?.day === 7
  );
}
export function sanitizeResilience(value) {
  if (
    !value ||
    value.version !== 1 ||
    !value.seed ||
    !value.seed.stocks ||
    !value.seed.capacity ||
    !products.every((id) => int(value.seed.stocks[id], 30)) ||
    !services.every((id) => int(value.seed.capacity[id], 10)) ||
    !Array.isArray(value.choices) ||
    value.choices.length > RESILIENCE_EVENTS.length ||
    !value.choices.every(validPriority)
  )
    return null;
  return {
    version: 1,
    seed: {
      stocks: Object.fromEntries(
        products.map((id) => [id, value.seed.stocks[id]]),
      ),
      capacity: Object.fromEntries(
        services.map((id) => [id, value.seed.capacity[id]]),
      ),
    },
    choices: [...value.choices],
  };
}
export function startResilience(decisions, economy) {
  if (!canStartResilience(decisions, economy)) return null;
  const city = deriveBuilderCity(decisions);
  const safe = sanitizeOpportunityState(economy);
  const capacity = Object.fromEntries(
    services.map((id) => {
      const district = city.districts[id];
      return [
        id,
        district.productive && district.service > 0
          ? Math.max(1, Math.round(district.service / 10))
          : 0,
      ];
    }),
  );
  return {
    version: 1,
    seed: { stocks: { ...safe.stocks }, capacity },
    choices: [],
  };
}
export function resilienceReport(value) {
  const state = sanitizeResilience(value);
  if (!state) return null;
  const stocks = { ...state.seed.stocks };
  const cap = state.seed.capacity;
  const history = [];
  for (const [index, priority] of state.choices.entries()) {
    const event = RESILIENCE_EVENTS[index];
    const protectedByRepairs = (history.at(-1)?.repairs || 0) >= 2;
    const opening = { ...stocks };
    const produced = {
      water: Math.max(
        0,
        cap.water -
          (index === 0
            ? 2
            : index === 1 && !protectedByRepairs
              ? Math.ceil(cap.water / 2)
              : 0),
      ),
      parts: cap.industry,
      food: 0,
    };
    const spoiled =
      index === 2 && !protectedByRepairs ? Math.floor(stocks.food / 3) : 0;
    stocks.food -= spoiled;
    const overflow = { water: 0, parts: 0, food: 0 };
    for (const id of ["water", "parts"]) {
      overflow[id] = Math.max(0, stocks[id] + produced[id] - 30);
      stocks[id] = Math.min(30, stocks[id] + produced[id]);
    }
    const shipments = [];
    function send(product, from, to, requested, serviceCapacity) {
      const amount = Math.min(
        stocks[product],
        requested,
        serviceCapacity,
        cap.transport,
      );
      stocks[product] -= amount;
      if (amount) shipments.push({ from, to, units: amount });
      return amount;
    }
    let clinic = 0,
      farms = 0,
      repairs = 0;
    const repairTarget = event.repairs;
    const toRepairs = () => {
      const amount = Math.min(
        priority === "repair" ? repairTarget : 1,
        stocks.water,
        stocks.parts,
        cap.workshop,
        cap.transport,
      );
      send("water", "water", "workshop", amount, cap.workshop);
      repairs = send("parts", "industry", "workshop", amount, cap.workshop);
    };
    const toClinic = () => {
      clinic = send("water", "water", "health", event.water, cap.health);
    };
    const toFarm = () => {
      farms = send("water", "water", "market", event.farms, cap.market);
    };
    if (priority === "repair") toRepairs();
    if (priority === "food") {
      toFarm();
      toClinic();
    } else {
      toClinic();
      toFarm();
    }
    if (priority !== "repair") toRepairs();
    produced.food = Math.min(cap.market, farms);
    overflow.food = Math.max(0, stocks.food + produced.food - 30);
    stocks.food = Math.min(30, stocks.food + produced.food);
    const meals = send("food", "market", "business", event.food, cap.business);
    const requests = {
      clinic: { requested: event.water, served: clinic },
      farms: { requested: event.farms, served: farms },
      repairs: { requested: repairTarget, served: repairs },
      shops: { requested: event.food, served: meals },
    };
    history.push({
      day: index + 1,
      priority,
      opening,
      produced,
      overflow,
      spoiled,
      stocks: { ...stocks },
      shipments,
      requests,
      repairs,
      waiting: Object.values(requests).reduce(
        (sum, r) => sum + r.requested - r.served,
        0,
      ),
    });
  }
  return {
    round: history.length,
    completed: history.length === RESILIENCE_EVENTS.length,
    stocks,
    history,
    last: history.at(-1) || null,
  };
}

// Chapter 4's mission briefs are derived from the existing disruption and
// recorded stock. They do not change city physics or any existing save format.
const RESILIENCE_MISSIONS = Object.freeze([
  {
    headline: "Protect the people caught by the rain",
    objective:
      "Keep essential deliveries moving while rain slows the city's supply. Who will wait when water runs short?",
    question: "Can you protect care and food without ignoring tomorrow's repairs?",
  },
  {
    headline: "Keep a city running without dependable power",
    objective:
      "An interruption reduces fresh water. The repair team can help the next crisis, but repairs take supplies away from today's requests.",
    question: "What can you restore for tomorrow without leaving too many people waiting today?",
  },
  {
    headline: "Stop the heat from becoming a food crisis",
    objective:
      "Hot weather threatens stored food. Clinics, growers and market stalls need limited deliveries from the same city.",
    question: "Which plan protects today's essential requests with the supplies you have left?",
  },
]);

export function resilienceMission(value) {
  const report = resilienceReport(value);
  if (!report || report.completed) return null;
  const event = RESILIENCE_EVENTS[report.round];
  const mission = RESILIENCE_MISSIONS[report.round];
  return {
    round: report.round + 1,
    headline: mission.headline,
    objective: mission.objective,
    question: mission.question,
    pressure:
      "Requests today · Clinic " +
      event.water +
      " water · Growers " +
      event.farms +
      " water · Repair team " +
      event.repairs +
      " jobs · Shops " +
      event.food +
      " meals",
    stocks: { ...report.stocks },
  };
}

// A rehearsal uses exactly the same deterministic simulation as committing a
// priority, but *never* saves the choice or changes any state/3D scene.
export function previewResiliencePlan(value, priority) {
  const candidate = chooseResilience(value, priority);
  if (!candidate) return null;
  const report = resilienceReport(candidate);
  const options = RESILIENCE_PRIORITIES.map((policy) => {
    const plan = chooseResilience(value, policy.id);
    const outcome = resilienceReport(plan).last;
    return { id: policy.id, last: outcome };
  });
  const services = ["clinic", "farms", "repairs", "shops"];
  const bestByService = Object.fromEntries(
    services.map((id) => [
      id,
      Math.max(...options.map((p) => p.last.requests[id].served)),
    ]),
  );
  const last = report.last;
  const improvementOptions = services
    .map((id) => ({
      id,
      additional: bestByService[id] - last.requests[id].served,
    }))
    .filter((item) => item.additional > 0);
  const distinct = options.some((option) =>
    services.some(
      (id) =>
        option.last.requests[id].served !== last.requests[id].served,
    ),
  );
  return {
    round: report.round,
    priority,
    last,
    bestByService,
    improvementOptions,
    distinct,
    bestWaiting: Math.min(...options.map((option) => option.last.waiting)),
    nextRoundProtected:
      report.round < RESILIENCE_EVENTS.length && last.repairs >= 2,
  };
}

export function chooseResilience(value, priority) {
  const state = sanitizeResilience(value);
  if (
    !state ||
    !validPriority(priority) ||
    state.choices.length >= RESILIENCE_EVENTS.length
  )
    return null;
  return { ...state, choices: [...state.choices, priority] };
}
// Same renderer and bounded shipment pool as Chapter 3, with only actual
// Chapter 4 transfers replacing its recorded routes and request signals.
export function resilienceCityActivity(economy, resilience) {
  const report = resilienceReport(resilience);
  if (!report?.last) return economy;
  return {
    ...economy,
    last: {
      ...economy.last,
      shipments: report.last.shipments,
      requests: report.last.requests,
    },
  };
}
