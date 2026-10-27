import { describe, expect, it } from "vitest";
import {
  emptyGardenPlot,
  evaluateGardenLayout,
  gardenPieces,
  placeGardenPiece,
} from "./garden-layout";

function arrange(entries: [string, number][]) {
  let plot = emptyGardenPlot();
  for (const [piece, index] of entries) {
    plot = placeGardenPiece(
      plot,
      piece as Parameters<typeof placeGardenPiece>[1],
      index,
    );
  }
  return plot;
}

describe("garden's hands-on spatial challenge", () => {
  it("supports multiple valid spatial layouts, not a fixed answer", () => {
    const pieces = ["seeds", "paths", "water", "signs"];
    const first = arrange([
      ["seeds", 0],
      ["water", 1],
      ["paths", 9],
      ["signs", 12],
    ]);
    const second = arrange([
      ["seeds", 2],
      ["water", 3],
      ["paths", 13],
      ["signs", 14],
    ]);
    expect(evaluateGardenLayout(pieces, first, "day").success).toBe(true);
    expect(evaluateGardenLayout(pieces, second, "day").success).toBe(true);
  });

  it("requires a real spatial arrangement, not only the right shopping list", () => {
    const pieces = ["seeds", "paths", "water", "signs"];
    const bad = arrange([
      ["seeds", 0],
      ["water", 15],
      ["paths", 5],
      ["signs", 3],
    ]);
    const result = evaluateGardenLayout(pieces, bad, "day");
    expect(result.success).toBe(false);
    expect(result.problems).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/watering beside/i),
        expect.stringMatching(/path to the south gate/i),
        expect.stringMatching(/sign close to the gate/i),
      ]),
    );
  });

  it("adds seating adjacency for garden opening day", () => {
    const pieces = ["seeds", "paths", "signs", "benches"];
    const bad = arrange([
      ["seeds", 0],
      ["paths", 9],
      ["signs", 12],
      ["benches", 3],
    ]);
    expect(evaluateGardenLayout(pieces, bad, "opening").success).toBe(false);
    const good = placeGardenPiece(bad, "benches", 10);
    expect(evaluateGardenLayout(pieces, good, "opening").success).toBe(true);
  });

  it("moves existing pieces rather than multiplying resources and supports undo", () => {
    const original = arrange([
      ["seeds", 0],
      ["water", 1],
    ]);
    const moved = placeGardenPiece(original, "seeds", 2);
    expect(moved[0]).toBeNull();
    expect(moved[2]).toBe("seeds");
    expect(gardenPieces(moved)).toEqual(["water", "seeds"]);
    expect(placeGardenPiece(moved, "seeds", 2)[2]).toBeNull();
    expect(() => placeGardenPiece(moved, "seeds", 16)).toThrow();
  });
});
