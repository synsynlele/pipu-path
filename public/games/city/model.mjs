/** Fictional city rules: no engineering, food-safety or financial advice. */
export const CAPITAL = {
  storage: 5,
  solar: 4,
  schedule: 1,
  maintenance: 2,
  school: 2,
};
export const INITIAL_CASH = 18;
export function initialPlan() {
  return {
    storage: false,
    solar: false,
    schedule: false,
    maintenance: false,
    school: false,
    food: "none",
    diagnosis: "",
    support: "",
    transfer: "",
    policy: "",
    agreement: "",
  };
}
export function capital(plan) {
  return (
    Object.entries(CAPITAL).reduce((n, [k, c]) => n + (plan[k] ? c : 0), 0) +
    (plan.food === "packaging" ? 4 : plan.food === "cooling" ? 5 : 0)
  );
}
export function quote(
  plan,
  owned = initialPlan(),
  cash = INITIAL_CASH,
  day = 1,
) {
  const deferred =
    day === 2 &&
    plan.food === "cooling" &&
    owned.food !== "cooling" &&
    plan.agreement === "shared"
      ? 4
      : 0;
  return {
    investment: capital(plan) - capital(owned),
    deferred,
    available: cash - capital(plan) + capital(owned) + deferred,
  };
}
export function powerDay(plan, day = 1) {
  const generation = day === 1 ? [3, 5, 2, 0] : [2, 3, 2, 0];
  const demand =
    day === 2 && plan.policy === "protect"
      ? [1, 2, 2, 2]
      : day === 2 && plan.policy === "rotate"
        ? [2, 2, 2, 1]
        : plan.schedule
          ? [2, 4, 2, 2]
          : [2, 2, 2, 4];
  if (plan.food === "cooling") demand[1]++;
  let charge = 0;
  return generation.map((base, i) => {
    const supply = base + (plan.solar && i === 1 ? 2 : 0),
      need = demand[i],
      discharge = plan.storage
        ? Math.min(charge, 2, Math.max(0, need - supply))
        : 0;
    charge -= discharge;
    const served = Math.min(need, supply + discharge),
      added = plan.storage
        ? Math.min(4 - charge, 2, Math.max(0, supply - need))
        : 0;
    charge += added;
    return {
      period: ["Morning", "Midday", "Afternoon", "Evening"][i],
      supply,
      need,
      served,
      unmet: need - served,
      charge,
    };
  });
}
export function evaluateCity(
  plan,
  { day = 1, cash = INITIAL_CASH, owned = initialPlan() } = {},
) {
  const q = quote(plan, owned, cash, day),
    power = powerDay(plan, day),
    pickup = day === 1 && plan.food === "early" ? 11 : day === 1 ? 14 : 15;
  const window =
    plan.food === "cooling" ? 16 : plan.food === "packaging" ? 14 : 12;
  const coolingPowered = plan.food !== "cooling" || power[1].unmet === 0;
  const usable = pickup <= window && coolingPowered ? 8 : 0; // Two crates were damaged on arrival.
  const sales = usable * 2,
    operations =
      (plan.food === "early" ? 3 : 0) +
      (plan.maintenance ? 1 : 0) +
      (plan.food === "cooling" ? 1 : 0);
  const entries = [
    {
      label: "After construction",
      time: "08:00",
      change: 0,
      balance: q.available,
    },
  ];
  let balance = q.available;
  const add = (time, label, change) => {
    balance += change;
    entries.push({ time, label, change, balance });
  };
  if (day === 2 && plan.agreement === "advance" && sales > 0)
    add("08:00", "Agreed buyer advance", Math.min(12, sales));
  add("09:00", "Collection, servicing and cooling operation", -operations);
  if (day === 1) add("15:00", "Buyer pays for usable crates", sales);
  const shared = day === 2 && plan.agreement === "shared";
  add(
    "16:00",
    shared ? "Small suppliers paid in full" : "All supplier obligations",
    shared ? -3 : -10,
  );
  if (day === 2) {
    add(
      "Next day",
      "Buyer settlement",
      sales - (plan.agreement === "advance" ? Math.min(12, sales) : 0),
    );
    if (shared) add("Next day", "Other suppliers: agreed payment", -7);
    if (q.deferred)
      add("Next day", "Cooling partner: agreed balance", -q.deferred);
  }
  const solvent = entries.every((e) => e.balance >= 0),
    learning =
      plan.school &&
      plan.diagnosis === "unequal-parts" &&
      plan.support === "oral-visual" &&
      plan.transfer === "same-whole";
  const powerReady =
    power.every((p) => p.unmet === 0) &&
    plan.maintenance &&
    (day === 1 || ["protect", "rotate"].includes(plan.policy));
  const foodReady = usable === 8 && solvent,
    passed = powerReady && foodReady && learning && q.available >= 0;
  return {
    fingerprint: JSON.stringify({ plan, day, cash, owned }),
    day,
    power,
    pickup,
    window,
    usable,
    sales,
    operations,
    entries,
    closingCash: balance,
    solvent,
    learning,
    powerReady,
    foodReady,
    passed,
    quote: q,
    delayedFlexible: day === 2 && !!plan.policy ? 2 : 0,
  };
}
export function adoptDay(state, result) {
  if (
    state.day !== result.day ||
    state.day > 2 ||
    !result.passed ||
    result.fingerprint !==
      JSON.stringify({
        plan: state.config,
        day: state.day,
        cash: state.cash,
        owned: state.owned,
      })
  )
    return null;
  return {
    ...state,
    day: state.day + 1,
    cash: result.closingCash,
    owned: { ...state.config },
    history: [
      ...state.history,
      {
        day: result.day,
        closingCash: result.closingCash,
        usable: result.usable,
      },
    ],
    config:
      state.day === 1
        ? { ...state.config, policy: "", agreement: "" }
        : { ...state.config },
  };
}
