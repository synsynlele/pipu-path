export const episode = {
  id: "unbuilt-city-night-market-v1",
  title: "One night. An empty square.",
  stages: [
    "A strange invitation",
    "Listen first",
    "One small clue",
    "Try together",
    "See the pattern",
    "A new twist",
    "Take it outside",
  ],
} as const;

export const roles = [
  {
    id: "maker",
    title: "Maker",
    detail: "Make a workable plan from limited resources.",
  },
  {
    id: "designer",
    title: "Designer",
    detail: "Make the square welcoming and easy to understand.",
  },
  {
    id: "organiser",
    title: "Organiser",
    detail: "Bring different people's needs together.",
  },
] as const;
export type Role = (typeof roles)[number]["id"];

export const builds = [
  {
    id: "music",
    title: "Live music",
    detail: "A small stage with local performers.",
    cost: 4,
    time: 3,
    crew: 3,
    visitors: 16,
    joy: 4,
  },
  {
    id: "food",
    title: "Food corner",
    detail: "A place to eat, talk and stay a little longer.",
    cost: 3,
    time: 2,
    crew: 2,
    visitors: 10,
    joy: 2,
  },
  {
    id: "art",
    title: "Make & share",
    detail: "A table where everyone can make something.",
    cost: 2,
    time: 2,
    crew: 1,
    visitors: 8,
    joy: 3,
  },
  {
    id: "access",
    title: "Clear paths",
    detail: "Level, open paths for wheels and people.",
    cost: 2,
    time: 1,
    crew: 1,
    visitors: 6,
    joy: 0,
  },
  {
    id: "shelter",
    title: "Rain cover",
    detail: "Keep the activities dry if the weather turns.",
    cost: 3,
    time: 2,
    crew: 2,
    visitors: 4,
    joy: 0,
  },
  {
    id: "signs",
    title: "Tell the neighbourhood",
    detail: "Clear invitations and signs pointing the way.",
    cost: 1,
    time: 1,
    crew: 1,
    visitors: 8,
    joy: 0,
  },
] as const;
export type BuildId = (typeof builds)[number]["id"];
export type Weather = "clear" | "rain";
export const limits = {
  clear: { cost: 12, time: 9, crew: 8 },
  rain: { cost: 11, time: 9, crew: 8 },
} as const;

export function evaluateFestival(ids: readonly BuildId[], weather: Weather) {
  const selected = builds.filter((build) => ids.includes(build.id));
  const totals = selected.reduce(
    (sum, item) => ({
      cost: sum.cost + item.cost,
      time: sum.time + item.time,
      crew: sum.crew + item.crew,
      visitors: sum.visitors + item.visitors,
      joy: sum.joy + item.joy,
    }),
    { cost: 0, time: 0, crew: 0, visitors: 0, joy: 0 },
  );
  const budget = limits[weather];
  const problems: string[] = [];
  if (totals.cost > budget.cost)
    problems.push(`You need ${totals.cost - budget.cost} fewer supply tokens.`);
  if (totals.time > budget.time)
    problems.push(
      `The plan needs ${totals.time - budget.time} more setup hours than you have.`,
    );
  if (totals.crew > budget.crew)
    problems.push(
      `You need ${totals.crew - budget.crew} more helpers than are available.`,
    );
  if (!ids.includes("access"))
    problems.push(
      "Ada cannot reach the activities with her wheelchair. Clear paths are missing.",
    );
  if (!ids.includes("signs"))
    problems.push(
      "Neighbours cannot find the event. Add clear invitations and signs.",
    );
  if (totals.joy < 4)
    problems.push(
      "People can arrive, but there is too little to enjoy. Add activities worth staying for.",
    );
  if (totals.visitors < 24)
    problems.push(
      "The plan attracts fewer than 24 visitors. Try a different mix.",
    );
  if (weather === "rain" && !ids.includes("shelter"))
    problems.push("The rain stops the activities. They need cover.");
  return { ...totals, problems, success: problems.length === 0 };
}
