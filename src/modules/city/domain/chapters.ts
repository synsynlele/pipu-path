import type { GameChapter } from "./game-engine";
import { unbuiltCityChapter } from "./game-engine";
import {
  foodChapter,
  learningChapter,
  makersChapter,
  riverChapter,
} from "./world-chapters";

/** Curated, age-neutral practice chapters. No unreviewed user content. */
export const gardenChapter: GameChapter = {
  id: "neighbourhood-garden-v1",
  title: "The Forgotten Garden",
  description:
    "Turn a neglected corner into a shared garden everyone can enjoy.",
  choices: [
    {
      id: "seeds",
      label: "Plant seedlings",
      cost: 2,
      time: 2,
      crew: 2,
      visitors: 8,
      joy: 3,
    },
    {
      id: "paths",
      label: "Clear accessible paths",
      cost: 2,
      time: 1,
      crew: 2,
      visitors: 6,
      joy: 1,
    },
    {
      id: "water",
      label: "Set up watering",
      cost: 2,
      time: 1,
      crew: 1,
      visitors: 5,
      joy: 1,
    },
    {
      id: "signs",
      label: "Invite neighbours",
      cost: 1,
      time: 1,
      crew: 1,
      visitors: 8,
      joy: 0,
    },
    {
      id: "benches",
      label: "Build seating",
      cost: 3,
      time: 2,
      crew: 2,
      visitors: 8,
      joy: 2,
    },
    {
      id: "lights",
      label: "Add solar lights",
      cost: 3,
      time: 2,
      crew: 2,
      visitors: 4,
      joy: 2,
    },
  ],
  scenarios: [
    {
      id: "day",
      label: "First planting day",
      budget: { cost: 9, time: 7, crew: 8 },
      requiredChoices: ["seeds", "paths", "water", "signs"],
      minimumVisitors: 24,
      minimumJoy: 5,
    },
    {
      id: "heat",
      label: "A dry week ahead",
      budget: { cost: 8, time: 7, crew: 8 },
      requiredChoices: ["seeds", "paths", "water", "signs"],
      minimumVisitors: 24,
      minimumJoy: 5,
    },
    {
      id: "opening",
      label: "The community arrives",
      budget: { cost: 9, time: 7, crew: 8 },
      requiredChoices: ["seeds", "paths", "signs", "benches"],
      minimumVisitors: 28,
      minimumJoy: 6,
    },
  ],
};

export const gameChapters: readonly GameChapter[] = [
  unbuiltCityChapter,
  gardenChapter,
  riverChapter,
  learningChapter,
  makersChapter,
  foodChapter,
];
export function getGameChapter(id: string): GameChapter | null {
  return gameChapters.find((chapter) => chapter.id === id) ?? null;
}
