import type { GameChapter, GameChoice, GameScenario } from "./game-engine";

function action(
  id: string,
  label: string,
  supplies: number,
  hours: number,
  helpers: number,
  reach: number,
  impact: number,
): GameChoice {
  return {
    id,
    label,
    cost: supplies,
    time: hours,
    crew: helpers,
    visitors: reach,
    joy: impact,
  };
}

function situation(
  id: string,
  label: string,
  budget: GameScenario["budget"],
  requiredChoices: string[],
  minimumVisitors: number,
  minimumJoy: number,
): GameScenario {
  return { id, label, budget, requiredChoices, minimumVisitors, minimumJoy };
}

/**
 * These are fictional, curated simulations of social impact—not operational
 * advice, verified activity, fundraising, or an XP-awarding Quest.
 */
export const riverChapter: GameChapter = {
  id: "river-renewal-v1",
  title: "The River Renewal",
  description:
    "Bring life back to a neighbourhood stream with the people who depend on it.",
  choices: [
    action("cleanup", "Organise a safe clean-up", 2, 2, 2, 8, 2),
    action("testing", "Check water conditions", 2, 1, 1, 5, 2),
    action("bins", "Set up sorting stations", 2, 1, 1, 9, 1),
    action("paths", "Open accessible paths", 2, 2, 2, 8, 1),
    action("plants", "Restore river plants", 3, 2, 2, 6, 3),
    action("invite", "Bring neighbours together", 1, 1, 1, 10, 1),
  ],
  scenarios: [
    situation(
      "waste",
      "A river full of waste",
      { cost: 9, time: 7, crew: 7 },
      ["cleanup", "testing", "bins", "invite"],
      26,
      5,
    ),
    situation(
      "rain",
      "Rain is approaching",
      { cost: 9, time: 8, crew: 8 },
      ["cleanup", "paths", "plants"],
      21,
      5,
    ),
    situation(
      "return",
      "Keep the change alive",
      { cost: 9, time: 7, crew: 8 },
      ["testing", "bins", "plants", "invite"],
      27,
      6,
    ),
  ],
};

export const learningChapter: GameChapter = {
  id: "learning-district-v1",
  title: "The Learning District",
  description:
    "Give young people a welcoming space to learn—even when resources are tight.",
  choices: [
    action("reading", "Create a reading corner", 2, 2, 1, 8, 2),
    action("access", "Make the space accessible", 2, 1, 2, 7, 1),
    action("mentor", "Invite volunteer mentors", 2, 2, 2, 9, 2),
    action("supplies", "Share learning supplies", 2, 1, 1, 8, 1),
    action("internet", "Set up shared internet", 3, 1, 1, 7, 2),
    action("club", "Start peer learning circles", 2, 2, 2, 10, 2),
  ],
  scenarios: [
    situation(
      "opening",
      "The first class begins",
      { cost: 9, time: 7, crew: 7 },
      ["reading", "access", "mentor"],
      24,
      5,
    ),
    situation(
      "exams",
      "Exams are near",
      { cost: 9, time: 7, crew: 7 },
      ["supplies", "mentor", "club"],
      26,
      5,
    ),
    situation(
      "offline",
      "The internet goes down",
      { cost: 8, time: 7, crew: 7 },
      ["reading", "supplies", "club"],
      25,
      5,
    ),
  ],
};

export const makersChapter: GameChapter = {
  id: "makers-market-v1",
  title: "The Makers' Market",
  description:
    "Help young creators turn promising skills into useful local businesses.",
  choices: [
    action("stalls", "Set up shared stalls", 3, 2, 2, 9, 2),
    action("signs", "Invite local customers", 1, 1, 1, 8, 1),
    action("safety", "Make routes safe", 2, 1, 2, 7, 2),
    action("mentors", "Bring business mentors", 2, 2, 1, 9, 3),
    action("shade", "Add weather protection", 2, 1, 1, 7, 1),
    action("catalogue", "Create a product catalogue", 2, 2, 1, 10, 2),
  ],
  scenarios: [
    situation(
      "opening",
      "Opening weekend",
      { cost: 9, time: 7, crew: 7 },
      ["stalls", "signs", "safety"],
      24,
      5,
    ),
    situation(
      "blackout",
      "The power goes out",
      { cost: 8, time: 6, crew: 6 },
      ["stalls", "signs", "shade"],
      24,
      4,
    ),
    situation(
      "costs",
      "Costs are rising",
      { cost: 7, time: 7, crew: 6 },
      ["signs", "mentors", "catalogue"],
      27,
      6,
    ),
  ],
};

export const foodChapter: GameChapter = {
  id: "food-rescue-v1",
  title: "The Food Rescue",
  description:
    "Build a trusted community network that helps good food reach people.",
  choices: [
    action("collect", "Connect surplus food partners", 2, 2, 2, 9, 2),
    action("pack", "Use safe packaging", 2, 1, 1, 7, 2),
    action("partners", "Work with local groups", 1, 1, 1, 9, 1),
    action("storage", "Arrange proper storage", 3, 1, 1, 7, 2),
    action("delivery", "Plan deliveries", 2, 2, 2, 10, 1),
    action("map", "Map where help is needed", 1, 1, 1, 6, 1),
  ],
  scenarios: [
    situation(
      "first",
      "Food is going to waste",
      { cost: 9, time: 7, crew: 7 },
      ["collect", "pack", "partners", "delivery"],
      30,
      6,
    ),
    situation(
      "heat",
      "A hot day changes the plan",
      { cost: 10, time: 7, crew: 7 },
      ["collect", "pack", "storage", "delivery"],
      31,
      7,
    ),
    situation(
      "shortage",
      "The supply is smaller",
      { cost: 7, time: 6, crew: 6 },
      ["partners", "map", "pack", "delivery"],
      30,
      5,
    ),
  ],
};
