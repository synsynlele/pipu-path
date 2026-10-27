/** A small spatial puzzle for the practice garden, not a real-world plan. */
export type GardenPiece = "seeds" | "paths" | "water" | "signs" | "benches" | "lights";
export type GardenPlotState = (GardenPiece | null)[];

export function emptyGardenPlot(): GardenPlotState {
  return Array<GardenPiece | null>(16).fill(null);
}

export function gardenPieces(plot: readonly (GardenPiece | null)[]): GardenPiece[] {
  const pieces: GardenPiece[] = [];
  for (const id of plot) if (id && !pieces.includes(id)) pieces.push(id);
  return pieces;
}

export function placeGardenPiece(
  plot: readonly (GardenPiece | null)[],
  piece: GardenPiece,
  destination: number,
): GardenPlotState {
  if (plot.length !== 16 || destination < 0 || destination >= 16 || !Number.isInteger(destination)) {
    throw new Error("Invalid garden square");
  }
  // One instance per material: move instead of silently spending more supplies.
  const next = plot.map((existing) => (existing === piece ? null : existing));
  if (plot[destination] !== piece) next[destination] = piece;
  return next;
}

function adjacent(first: number, second: number) {
  if (first < 0 || second < 0) return false;
  const fr = Math.floor(first / 4), fc = first % 4;
  const sr = Math.floor(second / 4), sc = second % 4;
  return Math.abs(fr - sr) + Math.abs(fc - sc) === 1;
}

/** Spatial constraints represent the teaching scenario, not civil-engineering advice. */
export function evaluateGardenLayout(
  selected: readonly string[],
  plot: readonly (GardenPiece | null)[],
  scenarioId: string,
): { success: boolean; problems: string[] } {
  if (plot.length !== 16) return { success: false, problems: ["Finish the garden grid first."] };
  const problems: string[] = [];
  const pieces = gardenPieces(plot);
  if (selected.some((id) => !pieces.includes(id as GardenPiece)) ||
      pieces.some((id) => !selected.includes(id))) {
    problems.push("Place every chosen piece on the ground.");
  }
  const at = (id: GardenPiece) => plot.indexOf(id);
  // The southern gate is directly below tile 13.
  if (at("paths") >= 0 && ![9, 12, 13, 14].includes(at("paths"))) {
    problems.push("Connect the path to the south gate.");
  }
  if (at("signs") >= 0 && ![12, 13, 14].includes(at("signs"))) {
    problems.push("Put the invitation sign close to the gate.");
  }
  if (at("water") >= 0 && at("seeds") >= 0 && !adjacent(at("water"), at("seeds"))) {
    problems.push("Keep watering beside the seedlings.");
  }
  if (scenarioId === "opening" && at("benches") >= 0 && !adjacent(at("benches"), at("paths"))) {
    problems.push("Place the seats beside the accessible path.");
  }
  return { success: problems.length === 0, problems };
}
