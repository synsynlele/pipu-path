import type { GameChapter } from "./game-engine";
import {
  gardenPieces,
  type GardenPlotState,
  type GardenPiece,
} from "./garden-layout";

/**
 * Optional device-only practice checkpoint. Deliberately stores no messages,
 * personal information, evidence, Quest status, or XP.
 */
export type PracticeCheckpoint = {
  version: 1;
  chapterId: string;
  sceneIndex: number;
  twistActive: boolean;
  selected: string[];
  gardenPlot: GardenPlotState;
  updatedAt: number;
};

const allowedGardenPieces = new Set<GardenPiece>([
  "seeds",
  "paths",
  "water",
  "signs",
  "benches",
  "lights",
]);

export function practiceStorageKey(userId: string, chapterId: string) {
  return `pipupath.practice.v1:${userId}:${chapterId}`;
}

export function parsePracticeCheckpoint(
  raw: string | null,
  chapter: GameChapter,
): PracticeCheckpoint | null {
  if (!raw || raw.length > 5000) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const entry = value as Record<string, unknown>;
  const idSet = new Set(chapter.choices.map((choice) => choice.id));
  const selected = entry.selected;
  const plot = entry.gardenPlot;
  if (
    entry.version !== 1 ||
    entry.chapterId !== chapter.id ||
    !Number.isInteger(entry.sceneIndex) ||
    (entry.sceneIndex as number) < 0 ||
    (entry.sceneIndex as number) >= chapter.scenarios.length ||
    typeof entry.twistActive !== "boolean" ||
    (entry.twistActive && entry.sceneIndex !== 0) ||
    typeof entry.updatedAt !== "number" ||
    !Number.isFinite(entry.updatedAt) ||
    entry.updatedAt <= 0 ||
    !Array.isArray(selected) ||
    selected.length > chapter.choices.length ||
    !selected.every((id) => typeof id === "string" && idSet.has(id)) ||
    new Set(selected).size !== selected.length ||
    !Array.isArray(plot) ||
    plot.length !== 16 ||
    !plot.every((piece) => piece === null || allowedGardenPieces.has(piece))
  )
    return null;

  const plotPieces = gardenPieces(plot as GardenPlotState);
  if (plotPieces.length !== plot.filter((piece) => piece !== null).length)
    return null;
  if (chapter.id === "neighbourhood-garden-v1") {
    if (
      selected.length !== plotPieces.length ||
      !selected.every((id) => plotPieces.includes(id as GardenPiece))
    )
      return null;
  } else if (plotPieces.length) {
    return null;
  }

  return {
    version: 1,
    chapterId: chapter.id,
    sceneIndex: entry.sceneIndex as number,
    twistActive: entry.twistActive as boolean,
    selected: [...selected] as string[],
    gardenPlot: [...plot] as GardenPlotState,
    updatedAt: entry.updatedAt as number,
  };
}

export function createPracticeCheckpoint(
  chapter: GameChapter,
  sceneIndex: number,
  twistActive: boolean,
  selected: readonly string[],
  gardenPlot: GardenPlotState,
  updatedAt = Date.now(),
): PracticeCheckpoint {
  return {
    version: 1,
    chapterId: chapter.id,
    sceneIndex,
    twistActive,
    selected: [...selected],
    gardenPlot: [...gardenPlot],
    updatedAt,
  };
}

export function practiceHasProgress(checkpoint: PracticeCheckpoint) {
  return (
    checkpoint.sceneIndex > 0 ||
    checkpoint.twistActive ||
    checkpoint.selected.length > 0
  );
}
