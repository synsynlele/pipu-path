// Chapter 3: fictional, player-operated supply chain. Never used for
// real jobs, economic advice, health outcomes, scores or PipuPath XP.
import { CITY_CASES, getChoice } from "./cases.mjs";
import { deriveBuilderCity } from "./city-growth.mjs";

export const ENTERPRISE_DAYS = 7;
export const OPPORTUNITY_POLICIES = Object.freeze([
  { id: "balanced", title: "Balance services", detail: "Share supplies between households, clinics, farms and repair teams." },
  { id: "people", title: "People first", detail: "Give healthcare and household needs priority when resources are scarce." },
  { id: "growth", title: "Grow enterprise", detail: "Supply food producers and shops first; trade may grow while clinics wait." },
  { id: "repair", title: "Repair first", detail: "Give maintenance teams more spare parts to strengthen tomorrow's production." },
]);
export const DAY_EVENTS = Object.freeze([
  { name: "A city wakes up", detail: "Residents need safe water, meals, repairs and local work." },
  { name: "A busy delivery day", detail: "More households visit the market. Roads and supply planning matter." },
  { name: "A hot afternoon", detail: "The clinic and food producers need extra water." },
  { name: "A machine needs attention", detail: "Production is slower unless yesterday's repairs helped." },
  { name: "New apprentices arrive", detail: "Learning and industry can support production." },
  { name: "Market day", detail: "More customers arrive at the shops. Will there be enough goods?" },
  { name: "A city-wide check", detail: "Compare which services worked and who still waited." },
]);
export const ENTERPRISE_PRODUCTS = Object.freeze(["water", "parts", "food"]);
const clamp = (x, min, max) => Math.max(min, Math.min(max, x));
const isInt = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;
export function foundationForOpportunities(decisions = {}) {
  return CITY_CASES.every((c) => Boolean(getChoice(c.id, decisions[c.id])));
}
export function newOpportunityState() {
  return { day: 0, policy: "balanced", stocks: { water: 0, parts: 0, food: 0 }, history: [], last: null };
}
export function sanitizeOpportunityState(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (!isInt(value.day, ENTERPRISE_DAYS) ||
      !OPPORTUNITY_POLICIES.some((p) => p.id === value.policy) ||
      !value.stocks || typeof value.stocks !== "object" ||
      !ENTERPRISE_PRODUCTS.every((product) => isInt(value.stocks[product], 30)) ||
      !Array.isArray(value.history) || value.history.length !== value.day) return null;
  const history = [];
  for (const item of value.history) {
    if (!item || typeof item !== "object" ||
        item.day !== history.length + 1 ||
        !["balanced", "people", "growth", "repair"].includes(item.policy) ||
        !["water", "food", "parts"].every((k) => isInt(item[k], 30)) ||
        !["meals", "patients", "repairs", "jobs", "unserved"].every((k) => isInt(item[k], 60))) return null;
    history.push({ day: item.day, policy: item.policy,
      water: item.water, food: item.food, parts: item.parts,
      meals: item.meals, patients: item.patients,
      repairs: item.repairs, jobs: item.jobs, unserved: item.unserved });
  }
  const last = value.last;
  if (value.day === 0 && last != null) return null;
  if (value.day > 0 && (!last || last.day !== value.day ||
      !Array.isArray(last.shipments) || last.shipments.length > 6 ||
      !last.shipments.every((r) =>
        r && ["water", "industry", "market"].includes(r.from) &&
        ["health", "market", "workshop", "business"].includes(r.to) &&
        isInt(r.units, 30)) ||
      !["water", "food", "parts"].every((k) => isInt(last[k], 30)) ||
      !["meals", "patients", "repairs", "jobs", "unserved"].every((k) => isInt(last[k], 60)) ||
      !Number.isInteger(last.day))) return null;
  return {
    day: value.day, policy: value.policy,
    stocks: Object.fromEntries(ENTERPRISE_PRODUCTS.map((k) => [k, value.stocks[k]])),
    history, last: last ? { ...history[history.length - 1],
      shipments: last.shipments.map((r) => ({ from: r.from, to: r.to, units: r.units })) } : null,
  };
}
const capacity = (city, id, maximum) => {
  const d = city.districts[id];
  if (!d?.built) return 0;
  return clamp(Math.round((d.service / 100) * maximum), 1, maximum);
};
const need = (available, desired) => Math.min(available, Math.max(0, desired));
export function runOpportunityDay(decisions, previous) {
  if (!foundationForOpportunities(decisions)) return null;
  const state = sanitizeOpportunityState(previous);
  if (!state || state.day >= ENTERPRISE_DAYS) return null;
  const city = deriveBuilderCity(decisions);
  const day = state.day + 1;
  const stocks = { ...state.stocks };
  const prevRepairs = state.last?.repairs ?? 0;
  const repairBonus = prevRepairs >= 2 ? 1 : 0;
  const water = clamp(capacity(city, "water", 10) + repairBonus - (day === 3 ? 1 : 0), 0, 12);
  const parts = clamp(capacity(city, "industry", 7) + (day === 5 ? 1 : 0) -
    (day === 4 ? 2 : 0) + repairBonus, 0, 9);
  // Existing policy changes the order of limited supply allocation, not
  // a magical resource multiplier. Stored material can be used next day.
  stocks.water = clamp(stocks.water + water, 0, 30);
  stocks.parts = clamp(stocks.parts + parts, 0, 30);
  const shipments = [];
  function transfer(product, from, to, amount) {
    const units = need(stocks[product], amount);
    stocks[product] -= units;
    if (units) shipments.push({ from, to, units });
    return units;
  }
  const clinicNeed = clamp(capacity(city, "health", 7) + (day === 3 ? 2 : 0), 0, 9);
  const farmNeed = clamp(capacity(city, "market", 6), 0, 6);
  const repairNeed = state.policy === "repair" ? 5 : 3;
  let patients = 0, wateredFarm = 0;
  if (state.policy === "people") {
    patients = transfer("water", "water", "health", clinicNeed);
    wateredFarm = transfer("water", "water", "market", farmNeed);
  } else if (state.policy === "growth") {
    wateredFarm = transfer("water", "water", "market", farmNeed);
    patients = transfer("water", "water", "health", clinicNeed);
  } else {
    patients = transfer("water", "water", "health", Math.ceil(clinicNeed / 2));
    wateredFarm = transfer("water", "water", "market", farmNeed);
    patients += transfer("water", "water", "health", clinicNeed - patients);
  }
  const repairs = transfer("parts", "industry", "workshop", repairNeed);
  const foodMade = Math.min(capacity(city, "market", 12) + (repairs >= 2 ? 1 : 0),
    wateredFarm * 2);
  stocks.food = clamp(stocks.food + foodMade, 0, 30);
  const retailNeed = clamp(capacity(city, "business", 9) + (day === 2 || day === 6 ? 2 : 0), 0, 11);
  const meals = transfer("food", "market", "business", retailNeed);
  const unserved = (clinicNeed - patients) + (retailNeed - meals) +
    (farmNeed - wateredFarm) + (repairNeed - repairs);
  const jobs = [water > 0, parts > 0, foodMade > 0, meals > 0, patients > 0, repairs > 0]
    .filter(Boolean).length * 2;
  const row = { day, policy: state.policy, water, parts, food: foodMade,
    patients, meals, repairs, jobs, unserved };
  return { day, policy: state.policy, stocks, history: [...state.history, row],
    last: { ...row, shipments } };
}
export function selectOpportunityPolicy(previous, policy) {
  const state = sanitizeOpportunityState(previous);
  if (!state || !OPPORTUNITY_POLICIES.some((p) => p.id === policy)) return null;
  return { ...state, policy };
}
