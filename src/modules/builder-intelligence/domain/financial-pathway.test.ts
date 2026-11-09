import { describe, expect, it } from "vitest";
import {
  financialIntelligencePathway,
  getFinancialStage,
} from "./financial-pathway";
import {
  isStageAllowedForAge,
  simulateCityFinancialDecision,
  validateBuilderPathway,
} from "./builder-pathway";
import { validateChallenge } from "@/modules/real-build/domain/build";

describe("Financial Intelligence Phase 1 catalog", () => {
  it("contains exactly nine reviewed, ordered and distinct money competencies", () => {
    expect(financialIntelligencePathway.schemaVersion).toBe(
      "builder-pathway-v1",
    );
    expect(financialIntelligencePathway.code).toBe("financial_intelligence");
    expect(financialIntelligencePathway.stages).toHaveLength(9);
    expect(
      new Set(financialIntelligencePathway.stages.map((s) => s.code)).size,
    ).toBe(9);
    expect(financialIntelligencePathway.stages.map((s) => s.order)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
    expect(validateBuilderPathway(financialIntelligencePathway)).toBe(
      financialIntelligencePathway,
    );
  });

  it("keeps every reviewed action practical and possible without spending money", () => {
    for (const stage of financialIntelligencePathway.stages) {
      expect(validateChallenge(stage.quest.challenge)).toEqual(
        stage.quest.challenge,
      );
      expect(stage.quest.minutes).toBeGreaterThanOrEqual(15);
      expect(
        stage.resources.every(
          (text) => !/required payment|buy|bank account/i.test(text),
        ),
      ).toBe(true);
      expect(
        stage.quest.challenge.steps.some((step) =>
          /put|use|teach|carry out|improve/i.test(step),
        ),
      ).toBe(true);
      expect(stage.quest.challenge.safety).toMatch(/no |do not /i);
    }
  });

  it("never treats city practice as evidence or increases money beyond a computed budget", () => {
    for (const stage of financialIntelligencePathway.stages) {
      expect(
        simulateCityFinancialDecision(stage, "tampered_choice"),
      ).toBeNull();
      for (const choice of stage.city.choices) {
        const result = simulateCityFinancialDecision(stage, choice.id);
        expect(result?.remaining).toBe(stage.city.availableNaira - choice.cost);
        expect(result?.shortfall).toBe(
          Math.max(0, choice.cost - stage.city.availableNaira),
        );
        expect(result).not.toHaveProperty("verified");
        expect(result).not.toHaveProperty("xp");
        expect(result).not.toHaveProperty("completed");
      }
    }
    const budget = getFinancialStage("budgeting")!;
    expect(simulateCityFinancialDecision(budget, "unfunded")?.shortfall).toBe(
      700,
    );
    expect(simulateCityFinancialDecision(budget, "funded")?.remaining).toBe(
      500,
    );
  });

  it("applies younger, teen and adult restrictions regardless of UI", () => {
    const scam = getFinancialStage("scam_awareness")!;
    const debt = getFinancialStage("responsible_borrowing")!;
    expect(isStageAllowedForAge(scam, "under_13")).toBe(false);
    expect(isStageAllowedForAge(scam, "13_15")).toBe(true);
    expect(isStageAllowedForAge(debt, "16_17")).toBe(false);
    expect(isStageAllowedForAge(debt, "18_24")).toBe(true);
    expect(isStageAllowedForAge(debt, "unknown")).toBe(false);
    expect(getFinancialStage("anything_else")).toBeNull();
    expect(getFinancialStage({ code: "budgeting" })).toBeNull();
  });

  it("rejects tampered challenge content and invalid stage ordering", () => {
    const first = financialIntelligencePathway.stages[0];
    expect(() =>
      validateBuilderPathway({
        ...financialIntelligencePathway,
        stages: [{ ...first, city: { ...first.city, availableNaira: -1 } }],
      }),
    ).toThrow("PATHWAY_CATALOG_INVALID");
    expect(() =>
      validateBuilderPathway({
        ...financialIntelligencePathway,
        stages: [
          {
            ...first,
            quest: {
              ...first.quest,
              challenge: {
                ...first.quest.challenge,
                steps: [
                  "Borrow money immediately",
                  ...first.quest.challenge.steps.slice(1),
                ],
              },
            },
          },
        ],
      }),
    ).toThrow();
  });
});
