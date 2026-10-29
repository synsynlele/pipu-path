import type { GameChapter, GameScenario } from "./game-engine";

export type GameDisruption = {
  title: string;
  message: string;
  consequence: string;
  revised: GameScenario;
};

/** Curated fictional twists. No timers, lives, real-world advice or rewards. */
export const disruptions: Record<string, GameDisruption> = {
  "neighbourhood-garden-v1": {
    title: "Rain arrives. So do more neighbours.",
    message:
      "Rain handles the watering today. Older visitors need somewhere to rest. Keep access open and make space for seating.",
    consequence:
      "Watering is optional now. Seating is essential. Your supplies have not increased.",
    revised: {
      id: "day",
      label: "Rain and new arrivals",
      budget: { cost: 9, time: 7, crew: 8 },
      requiredChoices: ["seeds", "paths", "signs", "benches"],
      minimumVisitors: 28,
      minimumJoy: 6,
    },
  },
  "river-renewal-v1": {
    title: "The sorting stations will not arrive.",
    message:
      "Your delivery is delayed. The community still wants a plan for checking the stream and restoring its banks.",
    consequence:
      "Sorting stations are unavailable. Replace them with river plants while keeping the first response coordinated.",
    revised: {
      id: "waste",
      label: "A missing delivery",
      budget: { cost: 9, time: 7, crew: 7 },
      requiredChoices: ["cleanup", "testing", "plants", "invite"],
      unavailableChoices: ["bins"],
      minimumVisitors: 26,
      minimumJoy: 5,
    },
  },
  "learning-district-v1": {
    title: "The mentors are delayed.",
    message:
      "Learners have arrived. Could they help one another using shared supplies while the mentors are away?",
    consequence:
      "Mentors are unavailable this round. Peer circles and shared supplies become essential.",
    revised: {
      id: "opening",
      label: "Learners take the lead",
      budget: { cost: 9, time: 7, crew: 7 },
      requiredChoices: ["reading", "access", "supplies", "club"],
      unavailableChoices: ["mentor"],
      minimumVisitors: 24,
      minimumJoy: 5,
    },
  },
  "makers-market-v1": {
    title: "The stalls cannot reach the square.",
    message:
      "The makers still have their products. They could show a catalogue and work with mentors to help customers understand their value.",
    consequence:
      "Stalls are unavailable. Use a catalogue and mentors; keep routes safe and customers informed.",
    revised: {
      id: "opening",
      label: "A market without stalls",
      budget: { cost: 9, time: 7, crew: 7 },
      requiredChoices: ["catalogue", "mentors", "signs", "safety"],
      unavailableChoices: ["stalls"],
      minimumVisitors: 24,
      minimumJoy: 5,
    },
  },
  "food-rescue-v1": {
    title: "The delivery vehicle is unavailable.",
    message:
      "Trusted local groups offer to coordinate collection. They need a needs map and safe packaging to plan responsibly.",
    consequence:
      "Deliveries are unavailable. Work through local partners and map needs instead.",
    revised: {
      id: "first",
      label: "Partners change the route",
      budget: { cost: 9, time: 7, crew: 7 },
      requiredChoices: ["collect", "pack", "partners", "map"],
      unavailableChoices: ["delivery"],
      minimumVisitors: 30,
      minimumJoy: 6,
    },
  },
};

export function chapterWithDisruption(chapter: GameChapter): GameChapter {
  const twist = disruptions[chapter.id];
  if (!twist) return chapter;
  return {
    ...chapter,
    scenarios: chapter.scenarios.map((scene, index) =>
      index === 0 ? twist.revised : scene,
    ),
  };
}
