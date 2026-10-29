import { describe, expect, it } from "vitest";
import { gardenChapter, getGameChapter, gameChapters } from "./chapters";
import { evaluateGame, type GameChapter } from "./game-engine";
import {
  foodChapter,
  learningChapter,
  makersChapter,
  riverChapter,
} from "./world-chapters";
import { getWorldPresentation, worldDirectory } from "../ui/world-presentation";

function successfulPlan(chapter: GameChapter, sceneId: string) {
  for (let mask = 1; mask < 1 << chapter.choices.length; mask++) {
    const selection = chapter.choices
      .filter((_, index) => (mask & (1 << index)) !== 0)
      .map((choice) => choice.id);
    if (evaluateGame(chapter, sceneId, selection).success) return selection;
  }
  return null;
}

describe("real-world themed practice library", () => {
  it("offers six distinct playable worlds, each with a unique route", () => {
    expect(gameChapters).toHaveLength(6);
    expect(new Set(gameChapters.map((chapter) => chapter.id)).size).toBe(6);
    expect(worldDirectory).toHaveLength(5);
    for (const chapter of gameChapters) {
      expect(getGameChapter(chapter.id)).toEqual(chapter);
      expect(chapter.scenarios.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("gives every scene a winnable resource decision without fake XP", () => {
    for (const chapter of [
      gardenChapter,
      riverChapter,
      learningChapter,
      makersChapter,
      foodChapter,
    ]) {
      const world = getWorldPresentation(chapter.id);
      expect(world).not.toBeNull();
      expect(world?.actionIcons).toHaveLength(chapter.choices.length);
      expect(new Set(chapter.scenarios.map((scene) => scene.id)).size).toBe(
        chapter.scenarios.length,
      );
      for (const scene of chapter.scenarios) {
        expect(world?.scenes[scene.id]?.person).toBeTruthy();
        expect(world?.scenes[scene.id]?.intro).toBeTruthy();
        const answer = successfulPlan(chapter, scene.id);
        expect(
          answer,
          `${chapter.id}/${scene.id} must be solvable`,
        ).not.toBeNull();
        expect(evaluateGame(chapter, scene.id, answer ?? []).success).toBe(
          true,
        );
        expect(evaluateGame(chapter, scene.id, []).success).toBe(false);
      }
    }
  });

  it("has different challenges for weather, internet, enterprise and food logistics", () => {
    expect(gardenChapter.scenarios.map((s) => s.id)).toContain("heat");
    expect(riverChapter.scenarios.map((s) => s.id)).toContain("rain");
    expect(learningChapter.scenarios.map((s) => s.id)).toContain("offline");
    expect(makersChapter.scenarios.map((s) => s.id)).toContain("blackout");
    expect(foodChapter.scenarios.map((s) => s.id)).toContain("shortage");
  });
});
