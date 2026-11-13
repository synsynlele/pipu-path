import { expect, it } from "vitest";
import catalog from "../../../../public/games/city/finance-scenarios.json";
import { financialIntelligencePathway } from "./financial-pathway";
import {
  FINANCE_BRIDGE_STAGES,
  isFinanceBridgeStage,
} from "./finance-bridge";
import {
  allowedFinancialScenario,
  evaluateFinancialCityChoice,
} from "../../../../public/games/city/finance-practice.mjs";

it("keeps the actual city catalogue identical to the reviewed candidate source", () => {
  const stages = financialIntelligencePathway.stages;
  expect(catalog.version).toBe(financialIntelligencePathway.humanReviewVersion);
  expect(catalog.scenarios).toEqual(
    stages.map((stage) => ({
      code: stage.code,
      title: stage.title,
      minimumAgeBand: stage.minimumAgeBand,
      district: stage.city.district,
      scenario: stage.city.scenario,
      availableNaira: stage.city.availableNaira,
      choices: stage.city.choices,
    })),
  );
  expect(FINANCE_BRIDGE_STAGES).toEqual(stages.map((stage) => stage.code));
});

it("limits public practice to youngest-safe topics and adult-only risk to adults", () => {
  const scenarios = catalog.scenarios;
  expect(scenarios.filter((item) => allowedFinancialScenario(item, "under_13"))).toHaveLength(6);
  expect(scenarios.filter((item) => allowedFinancialScenario(item, "16_17"))).toHaveLength(8);
  expect(scenarios.filter((item) => allowedFinancialScenario(item, "18_24"))).toHaveLength(9);
  expect(scenarios.filter((item) => allowedFinancialScenario(item, "unknown"))).toHaveLength(0);
  expect(scenarios.filter((item) => allowedFinancialScenario(item, ""))).toHaveLength(0);
  expect(isFinanceBridgeStage("budgeting")).toBe(true);
  expect(isFinanceBridgeStage("../portfolio")).toBe(false);
  expect(isFinanceBridgeStage({ code: "budgeting" })).toBe(false);
});

it("keeps financial arithmetic fictional and does not emit a progress or XP object", () => {
  for (const scenario of catalog.scenarios) {
    for (const choice of scenario.choices) {
      const result = evaluateFinancialCityChoice(scenario, choice.id);
      expect(result?.remaining).toBe(scenario.availableNaira - choice.cost);
      expect(result?.shortfall).toBe(
        Math.max(0, choice.cost - scenario.availableNaira),
      );
      expect(result).not.toHaveProperty("xp");
      expect(result).not.toHaveProperty("verified");
      expect(result).not.toHaveProperty("recorded");
    }
    expect(evaluateFinancialCityChoice(scenario, "invalid-stage")).toBeNull();
  }
});
