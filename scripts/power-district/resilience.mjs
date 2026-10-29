import assert from "node:assert/strict";
import { CITY_CASES } from "../../public/games/city/cases.mjs";
import {
  newOpportunityState,
  runOpportunityDay,
  chooseOwnedEnterprise,
} from "../../public/games/city/opportunities.mjs";
import {
  canStartResilience,
  startResilience,
  chooseResilience,
  resilienceReport,
  sanitizeResilience,
  resilienceCityActivity,
  RESILIENCE_PRIORITIES,
} from "../../public/games/city/resilience.mjs";
import { deriveLivingCity } from "../../public/games/city/living-city.mjs";
import { initialPlan } from "../../public/games/city/model.mjs";
import { sanitizePractice } from "../../public/games/city/practice-save.mjs";
const decisions = Object.fromEntries(
  CITY_CASES.map((c) => [c.id, c.options[0].id]),
);
let economy = chooseOwnedEnterprise(newOpportunityState(), "water");
assert.equal(startResilience(decisions, economy), null);
for (let day = 0; day < 7; day++) {
  assert.equal(canStartResilience(decisions, economy), false);
  economy = runOpportunityDay(decisions, economy);
}
assert(canStartResilience(decisions, economy));
assert.equal(canStartResilience({}, economy), false);
const base = startResilience(decisions, economy);
assert.deepEqual(base.seed.stocks, economy.stocks);
const original = JSON.stringify({ decisions, economy, base });
// Every three-challenge combination has finite stocks and conserved resources.
for (const a of RESILIENCE_PRIORITIES)
  for (const b of RESILIENCE_PRIORITIES)
    for (const c of RESILIENCE_PRIORITIES) {
      let state = base;
      for (const p of [a, b, c]) state = chooseResilience(state, p.id);
      const report = resilienceReport(state);
      assert(report.completed);
      assert.equal(chooseResilience(state, "care"), null);
      assert.equal(report.history.length, 3);
      for (const row of report.history) {
        for (const product of ["water", "parts", "food"]) {
          const from = { water: "water", parts: "industry", food: "market" }[
            product
          ];
          const used = row.shipments
            .filter((s) => s.from === from)
            .reduce((n, s) => n + s.units, 0);
          assert.equal(
            row.stocks[product],
            row.opening[product] +
              row.produced[product] -
              row.overflow[product] -
              used -
              (product === "food" ? row.spoiled : 0),
          );
          assert(row.stocks[product] >= 0 && row.stocks[product] <= 30);
        }
        assert(row.shipments.length <= 5);
        assert(row.shipments.every((s) => s.units > 0));
        for (const request of Object.values(row.requests))
          assert(request.served <= request.requested);
      }
      const living = deriveLivingCity(
        decisions,
        resilienceCityActivity(economy, state),
      );
      assert.deepEqual(
        living.requestSignals.map((r) => r.served),
        Object.values(report.last.requests).map((r) => r.served),
      );
      assert.equal(living.deliveries.length, report.last.shipments.length);
      assert.deepEqual(
        sanitizeResilience(JSON.parse(JSON.stringify(state))),
        state,
      );
    }
assert.equal(JSON.stringify({ decisions, economy, base }), original);
assert.equal(chooseResilience(base, "invalid"), null);
assert.equal(
  sanitizeResilience({ ...base, choices: ["care", "food", "repair", "care"] }),
  null,
);
assert.equal(
  sanitizeResilience({
    ...base,
    seed: { ...base.seed, stocks: { water: Infinity, food: 0, parts: 0 } },
  }),
  null,
);
const scarce = {
  version: 1,
  seed: {
    stocks: { water: 0, parts: 0, food: 0 },
    capacity: {
      water: 6,
      industry: 4,
      market: 6,
      health: 6,
      workshop: 4,
      business: 6,
      transport: 6,
    },
  },
  choices: [],
};
const care = resilienceReport(chooseResilience(scarce, "care")).last;
const food = resilienceReport(chooseResilience(scarce, "food")).last;
const repairState = chooseResilience(scarce, "repair");
const repair = resilienceReport(repairState).last;
assert(care.requests.clinic.served > food.requests.clinic.served);
assert(food.requests.shops.served > care.requests.shops.served);
assert(repair.repairs >= 2);
assert(repair.requests.clinic.served < care.requests.clinic.served);
assert(
  resilienceReport(chooseResilience(repairState, "care")).last.produced.water >
    resilienceReport(chooseResilience(chooseResilience(scarce, "care"), "care"))
      .last.produced.water,
);
const noServices = {
  ...scarce,
  seed: {
    stocks: { water: 0, parts: 0, food: 0 },
    capacity: Object.fromEntries(
      Object.keys(scarce.seed.capacity).map((k) => [k, 0]),
    ),
  },
};
assert.equal(
  resilienceReport(chooseResilience(noServices, "repair")).last.shipments
    .length,
  0,
);
assert(
  resilienceReport(chooseResilience(noServices, "repair")).last.waiting > 0,
);
const practice = {
  day: 1,
  cash: 18,
  config: initialPlan(),
  owned: initialPlan(),
  seen: [],
  history: [],
  decisions,
  economy,
  resilience: chooseResilience(base, "repair"),
};
assert.deepEqual(sanitizePractice(practice).resilience, practice.resilience);
assert.equal(
  sanitizePractice({ ...practice, resilience: { choices: ["fake"] } })
    .resilience,
  null,
);
assert.deepEqual(
  sanitizePractice({ ...practice, resilience: { choices: ["fake"] } })
    .decisions,
  decisions,
);
assert.equal(
  sanitizePractice({ ...practice, resilience: undefined }).resilience,
  null,
);
console.log(
  "PASS: Chapter 3 prerequisites, 27 resilience journeys, conserved supplies, real trade-offs, repair carryover, actual deliveries and backward-compatible saves.",
);
