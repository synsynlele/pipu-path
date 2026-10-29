import { describe, expect, it } from "vitest";
import { gameChapters } from "./chapters";
import { chapterWithDisruption, disruptions } from "./disruptions";
import { evaluateGame } from "./game-engine";

describe("curated world disruptions", () => {
  it("keeps every twist solvable while requiring a different first plan", () => {
    for (const chapter of gameChapters.filter((c) => disruptions[c.id])) {
      const revised = chapterWithDisruption(chapter);
      let newSolutions = 0;
      let changedSolutions = 0;
      for (let mask = 0; mask < 1 << chapter.choices.length; mask++) {
        const ids = chapter.choices
          .filter((_, i) => mask & (1 << i))
          .map((c) => c.id);
        const before = evaluateGame(chapter, chapter.scenarios[0].id, ids);
        const after = evaluateGame(revised, revised.scenarios[0].id, ids);
        if (after.success) newSolutions++;
        if (before.success && !after.success) changedSolutions++;
      }
      expect(newSolutions, chapter.id).toBeGreaterThan(0);
      expect(changedSolutions, chapter.id).toBeGreaterThan(0);
      expect(revised.scenarios.slice(1)).toEqual(chapter.scenarios.slice(1));
    }
  });
  it("does not count unavailable options as fictional impact", () => {
    const chapter = gameChapters.find((c) => c.id === "river-renewal-v1")!;
    const result = evaluateGame(chapterWithDisruption(chapter), "waste", [
      "bins",
    ]);
    expect(result.totals.visitors).toBe(0);
    expect(result.problems.join(" ")).toMatch(/unavailable/);
  });
});
