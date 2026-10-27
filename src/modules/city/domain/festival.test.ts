import { describe, expect, it } from "vitest";
import { builds, evaluateFestival, limits } from "./festival";

describe("festival simulation", () => {
  it("supports different solutions and requires adapting to rain", () => {
    const clearPlan = ["music", "art", "access", "signs"] as const;
    expect(evaluateFestival(clearPlan, "clear").success).toBe(true);
    expect(evaluateFestival(clearPlan, "rain").success).toBe(false);
    expect(
      evaluateFestival(["food", "art", "access", "shelter", "signs"], "rain")
        .success,
    ).toBe(true);
  });
  it("explains empty, inaccessible, unknown and overcommitted plans", () => {
    expect(evaluateFestival([], "clear").problems).toHaveLength(4);
    expect(
      evaluateFestival(
        builds.map((build) => build.id),
        "rain",
      ).problems,
    ).toHaveLength(3);
  });
  it("counts each build once without mutating the input", () => {
    const plan = Object.freeze(["music", "music"] as const);
    expect(evaluateFestival(plan, "clear").cost).toBe(4);
  });
  it("checks all possible combinations against the constraints", () => {
    for (const weather of ["clear", "rain"] as const) {
      let winners = 0;
      for (let mask = 0; mask < 64; mask++) {
        const plan = builds
          .filter((_, index) => mask & (1 << index))
          .map((item) => item.id);
        const result = evaluateFestival(plan, weather);
        if (result.success) {
          winners++;
          expect(result.cost).toBeLessThanOrEqual(limits[weather].cost);
          expect(result.time).toBeLessThanOrEqual(limits[weather].time);
          expect(result.crew).toBeLessThanOrEqual(limits[weather].crew);
          expect(result.visitors).toBeGreaterThanOrEqual(24);
          expect(result.joy).toBeGreaterThanOrEqual(4);
          expect(plan).toContain("access");
          expect(plan).toContain("signs");
          if (weather === "rain") expect(plan).toContain("shelter");
        }
      }
      expect(winners).toBeGreaterThan(0);
    }
  });
});
