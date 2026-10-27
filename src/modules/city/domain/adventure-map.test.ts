import { describe, expect, it } from "vitest";
import { freshNeighbourhood } from "./neighbourhood";
import { gardenChapter } from "./chapters";
import { riverChapter } from "./world-chapters";
import { createPracticeCheckpoint, practiceStorageKey } from "./practice-checkpoint";
import { emptyGardenPlot, placeGardenPiece } from "./garden-layout";
import { projectAdventureMap, recommendedPathWorld } from "./adventure-map";

function saved(reads: Record<string, string>) {
  return (key: string) => reads[key] ?? null;
}

describe("Duolingo-style PipuPath adventure map", () => {
  it("creates seven independent worlds with honest playable and locked steps", () => {
    const worlds = projectAdventureMap("student", () => null);
    expect(worlds).toHaveLength(7);
    expect(worlds.map((world) => world.id)).toEqual([
      "neighbourhood",
      "city",
      "neighbourhood-garden-v1",
      "river-renewal-v1",
      "learning-district-v1",
      "makers-market-v1",
      "food-rescue-v1",
    ]);
    expect(worlds[0].missions.map((mission) => mission.state)).toEqual([
      "current",
      "locked",
      "locked",
    ]);
    expect(worlds[0].missions[0].href).toBe("/build/neighbourhood");
    expect(worlds[0].missions[1].href).toBeNull();
    expect(worlds[1].missions).toHaveLength(1);
    expect(worlds[1].missions[0].href).toBe("/build/play");
    expect(worlds[2].missions.map((mission) => mission.state)).toEqual([
      "current",
      "locked",
      "locked",
    ]);
    expect(recommendedPathWorld(worlds)).toBe("neighbourhood");
    expect(worlds.every((world) => world.completed === 0)).toBe(true);
  });

  it("reads genuine saved scenarios, recommends the latest and never fabricates XP", () => {
    const checkpoint = createPracticeCheckpoint(
      gardenChapter,
      2,
      false,
      ["seeds"],
      placeGardenPiece(emptyGardenPlot(), "seeds", 0),
      1730000000000,
    );
    const river = createPracticeCheckpoint(
      riverChapter, 1, true, ["cleanup"], emptyGardenPlot(), 1730000000300,
    );
    // A twist may only be active in the first scene.
    river.sceneIndex = 0;
    const worlds = projectAdventureMap(
      "student",
      saved({
        [practiceStorageKey("student", gardenChapter.id)]: JSON.stringify(checkpoint),
        [practiceStorageKey("student", riverChapter.id)]: JSON.stringify(river),
      }),
    );
    const garden = worlds[2];
    expect(garden.completed).toBe(2);
    expect(garden.missions.map((mission) => mission.state)).toEqual([
      "done",
      "done",
      "current",
    ]);
    expect(garden.missions[2].href).toBe(`/build/play/${gardenChapter.id}`);
    expect(worlds[3].hasProgress).toBe(true);
    expect(recommendedPathWorld(worlds)).toBe(riverChapter.id);
    expect(JSON.stringify(worlds)).not.toMatch(/"xp"|"streak"/i);
  });

  it("uses validated neighbourhood completion and moves to a still-playable world", () => {
    const neighbourhood = freshNeighbourhood();
    neighbourhood.completed = ["ada"];
    neighbourhood.sign = "right";
    let worlds = projectAdventureMap(
      "student",
      saved({ "pipupath.neighbourhood.v1:student": JSON.stringify(neighbourhood) }),
    );
    expect(worlds[0].missions.map((mission) => mission.state)).toEqual([
      "done",
      "current",
      "locked",
    ]);
    neighbourhood.completed = ["ada", "timi", "mama"];
    neighbourhood.build = [
      "roof", "roof", "roof",
      "post", null, "post",
      null, "counter", null,
    ];
    neighbourhood.route = ["home", "stores", "bridge", "square", "lane", "market"];
    worlds = projectAdventureMap(
      "student",
      saved({ "pipupath.neighbourhood.v1:student": JSON.stringify(neighbourhood) }),
    );
    expect(worlds[0].completed).toBe(3);
    expect(worlds[0].missions.every((mission) => mission.state === "done")).toBe(true);
    expect(recommendedPathWorld(worlds)).toBe("city");
  });

  it("isolates progress per account and survives unavailable storage", () => {
    const checkpoint = createPracticeCheckpoint(
      gardenChapter, 1, false, [], emptyGardenPlot(), 1730000000000,
    );
    const store = {
      [practiceStorageKey("one", gardenChapter.id)]: JSON.stringify(checkpoint),
    };
    expect(projectAdventureMap("two", saved(store))[2].completed).toBe(0);
    expect(projectAdventureMap("one", saved(store))[2].completed).toBe(1);
    const worlds = projectAdventureMap("one", () => { throw new Error("denied"); });
    expect(worlds).toHaveLength(7);
    expect(worlds[2].completed).toBe(0);
  });
});
