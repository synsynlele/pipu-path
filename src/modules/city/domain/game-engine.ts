import {
  builds,
  type BuildId,
  type Weather,
} from "./festival";

/**
 * A reusable, data-driven practice challenge. New chapters can provide their
 * own scene, choices, constraints and evaluator without changing Quest records.
 */
export type GameChoice = {
  id: string;
  label: string;
  cost: number;
  time: number;
  crew: number;
  visitors: number;
  joy: number;
};
export type GameScenario = {
  id: string;
  label: string;
  budget: { cost: number; time: number; crew: number };
  requiredChoices: readonly string[];
  minimumVisitors: number;
  minimumJoy: number;
};
export type GameChapter = {
  id: string;
  title: string;
  description: string;
  choices: readonly GameChoice[];
  scenarios: readonly GameScenario[];
};
export type GameEvaluation = {
  success: boolean;
  totals: {
    cost: number;
    time: number;
    crew: number;
    visitors: number;
    joy: number;
  };
  problems: string[];
};

export function evaluateGame(
  chapter: GameChapter,
  scenarioId: string,
  selectedIds: readonly string[],
): GameEvaluation {
  const scenario = chapter.scenarios.find((item) => item.id === scenarioId);
  if (!scenario) throw new Error("Unknown game scenario");
  const unique = new Set(selectedIds);
  if (
    unique.size !== selectedIds.length ||
    selectedIds.some(
      (id) => !chapter.choices.some((choice) => choice.id === id),
    )
  ) {
    throw new Error("Invalid game choices");
  }
  const totals = { cost: 0, time: 0, crew: 0, visitors: 0, joy: 0 };
  for (const choice of chapter.choices) {
    if (!unique.has(choice.id)) continue;
    totals.cost += choice.cost;
    totals.time += choice.time;
    totals.crew += choice.crew;
    totals.visitors += choice.visitors;
    totals.joy += choice.joy;
  }
  const problems: string[] = [];
  for (const resource of ["cost", "time", "crew"] as const) {
    if (totals[resource] > scenario.budget[resource])
      problems.push(`Not enough ${resource} for this plan.`);
  }
  for (const id of scenario.requiredChoices) {
    if (!unique.has(id))
      problems.push(
        `Your plan still needs ${chapter.choices.find((choice) => choice.id === id)?.label ?? id}.`,
      );
  }
  if (totals.visitors < scenario.minimumVisitors)
    problems.push("Not enough people can join.");
  if (totals.joy < scenario.minimumJoy)
    problems.push("Add something people will enjoy.");
  return { success: problems.length === 0, totals, problems };
}

export const unbuiltCityChapter: GameChapter = {
  id: "unbuilt-city-night-market-v1",
  title: "The Unbuilt City",
  description:
    "Help your neighbourhood turn an empty square into a welcoming place.",
  choices: builds.map(({ id, title, cost, time, crew, visitors, joy }) => ({
    id,
    label: title,
    cost,
    time,
    crew,
    visitors,
    joy,
  })),
  scenarios: [
    {
      id: "clear",
      label: "Opening night",
      budget: { cost: 12, time: 9, crew: 8 },
      requiredChoices: ["access", "signs"],
      minimumVisitors: 24,
      minimumJoy: 4,
    },
    {
      id: "rain",
      label: "Rain changes the plan",
      budget: { cost: 11, time: 9, crew: 8 },
      requiredChoices: ["access", "signs", "shelter"],
      minimumVisitors: 24,
      minimumJoy: 4,
    },
  ],
};

/** Compatibility guard: the extracted engine must preserve the original game. */
export function evaluateCityThroughEngine(
  ids: readonly BuildId[],
  weather: Weather,
) {
  return evaluateGame(unbuiltCityChapter, weather, ids);
}
