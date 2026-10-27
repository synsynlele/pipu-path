import { describe, expect, it } from "vitest";
import { gardenChapter } from "./chapters";
import { riverChapter } from "./world-chapters";
import { emptyGardenPlot, placeGardenPiece } from "./garden-layout";
import {
  createPracticeCheckpoint,
  parsePracticeCheckpoint,
  practiceHasProgress,
  practiceStorageKey,
} from "./practice-checkpoint";

describe("safe practice checkpoints", () => {
  const plot = placeGardenPiece(emptyGardenPlot(), "seeds", 1);
  const gardenSave = createPracticeCheckpoint(
    gardenChapter,
    0,
    true,
    ["seeds"],
    plot,
    1700000000000,
  );

  it("round trips garden placement and twist without any user, XP, or Quest fields", () => {
    const saved = parsePracticeCheckpoint(JSON.stringify(gardenSave), gardenChapter);
    expect(saved).toEqual(gardenSave);
    expect(saved?.gardenPlot[1]).toBe("seeds");
    expect(saved).not.toHaveProperty("userId");
    expect(saved).not.toHaveProperty("xp");
    expect(saved).not.toHaveProperty("quest");
    expect(practiceHasProgress(saved!)).toBe(true);
  });

  it("uses a separate checkpoint for each authenticated player and world", () => {
    expect(practiceStorageKey("a", gardenChapter.id)).not.toBe(
      practiceStorageKey("b", gardenChapter.id),
    );
    expect(practiceStorageKey("a", gardenChapter.id)).not.toBe(
      practiceStorageKey("a", riverChapter.id),
    );
  });

  it("does not accept malformed, cross-world, tampered or duplicate data", () => {
    const examples: unknown[] = [
      { ...gardenSave, version: 99 },
      { ...gardenSave, chapterId: riverChapter.id },
      { ...gardenSave, sceneIndex: 300 },
      { ...gardenSave, sceneIndex: 1, twistActive: true },
      { ...gardenSave, selected: ["seeds", "seeds"] },
      { ...gardenSave, selected: ["water"] },
      { ...gardenSave, gardenPlot: [null] },
      { ...gardenSave, gardenPlot: [undefined, ...plot.slice(1)] },
      { ...gardenSave, gardenPlot: [...plot.slice(0, 2), "unsafe", ...plot.slice(3)] },
      { ...gardenSave, updatedAt: "bad" },
    ];
    for (const value of examples) {
      expect(parsePracticeCheckpoint(JSON.stringify(value), gardenChapter)).toBeNull();
    }
    expect(parsePracticeCheckpoint("{bad json", gardenChapter)).toBeNull();
    expect(parsePracticeCheckpoint("x".repeat(6000), gardenChapter)).toBeNull();
    expect(parsePracticeCheckpoint(null, gardenChapter)).toBeNull();
  });

  it("permits resource-card worlds without a garden layout", () => {
    const save = createPracticeCheckpoint(
      riverChapter,
      2,
      false,
      ["cleanup", "plants"],
      emptyGardenPlot(),
      1700000000000,
    );
    expect(parsePracticeCheckpoint(JSON.stringify(save), riverChapter)).toEqual(save);
    expect(parsePracticeCheckpoint(JSON.stringify(gardenSave), riverChapter)).toBeNull();
  });

  it("does not claim an empty saved run as meaningful progress", () => {
    const empty = createPracticeCheckpoint(
      gardenChapter, 0, false, [], emptyGardenPlot(), 1700000000000,
    );
    expect(practiceHasProgress(empty)).toBe(false);
  });
});
