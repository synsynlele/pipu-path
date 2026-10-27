import { describe, expect, it } from "vitest";
import { builds, evaluateFestival, type BuildId } from "./festival";
import { evaluateGame, unbuiltCityChapter } from "./game-engine";

describe("reusable game chapter engine", () => {
  it("matches existing city outcomes for every possible build combination and weather", () => {
    for (let mask = 0; mask < 1 << builds.length; mask++) {
      const selected = builds.filter((_, index) => mask & (1 << index)).map((item) => item.id) as BuildId[];
      for (const weather of ["clear", "rain"] as const) {
        const oldResult = evaluateFestival(selected, weather);
        const newResult = evaluateGame(unbuiltCityChapter, weather, selected);
        expect(newResult.success).toBe(oldResult.success);
        expect(newResult.totals).toEqual({
          cost: oldResult.cost,
          time: oldResult.time,
          crew: oldResult.crew,
          visitors: oldResult.visitors,
          joy: oldResult.joy,
        });
      }
    }
  });

  it("supports a new chapter without changing the engine", () => {
    const chapter = {
      id: "school-garden",
      title: "Grow a Garden",
      description: "Make a shared green space.",
      choices: [
        { id: "seeds", label: "Seeds", cost: 2, time: 1, crew: 1, visitors: 6, joy: 2 },
        { id: "path", label: "Safe path", cost: 1, time: 1, crew: 1, visitors: 5, joy: 1 },
      ],
      scenarios: [{ id: "day", label: "First day", budget: { cost: 3, time: 2, crew: 2 }, requiredChoices: ["path"], minimumVisitors: 10, minimumJoy: 3 }],
    };
    expect(evaluateGame(chapter, "day", ["seeds", "path"]).success).toBe(true);
    expect(evaluateGame(chapter, "day", ["seeds"]).success).toBe(false);
  });

  it("rejects unknown scenarios, invalid options and duplicate selections", () => {
    expect(() => evaluateGame(unbuiltCityChapter, "missing", [])).toThrow();
    expect(() => evaluateGame(unbuiltCityChapter, "clear", ["unknown"])).toThrow();
    expect(() => evaluateGame(unbuiltCityChapter, "clear", ["art", "art"])).toThrow();
  });
});
