export const builderLevels = [
  { name: "Explorer", minimumXp: 0 },
  { name: "Learner", minimumXp: 100 },
  { name: "Problem Solver", minimumXp: 300 },
  { name: "Builder", minimumXp: 700 },
  { name: "Founder Ready", minimumXp: 1000 },
] as const;

export type BuilderLevelName = (typeof builderLevels)[number]["name"];

export type BuilderLevelProgress = {
  current: BuilderLevelName;
  next: BuilderLevelName | null;
  totalXp: number;
  currentMinimumXp: number;
  nextMinimumXp: number | null;
  xpToNext: number;
  progressPercent: number;
};

export function getBuilderLevelProgress(totalXpInput: number): BuilderLevelProgress {
  const totalXp = Number.isFinite(totalXpInput)
    ? Math.max(0, Math.trunc(totalXpInput))
    : 0;
  let currentIndex = 0;

  builderLevels.forEach((level, index) => {
    if (totalXp >= level.minimumXp) currentIndex = index;
  });

  const current = builderLevels[currentIndex];
  const next = builderLevels[currentIndex + 1] ?? null;

  if (!next) {
    return {
      current: current.name,
      next: null,
      totalXp,
      currentMinimumXp: current.minimumXp,
      nextMinimumXp: null,
      xpToNext: 0,
      progressPercent: 100,
    };
  }

  const span = next.minimumXp - current.minimumXp;
  const earnedInLevel = totalXp - current.minimumXp;

  return {
    current: current.name,
    next: next.name,
    totalXp,
    currentMinimumXp: current.minimumXp,
    nextMinimumXp: next.minimumXp,
    xpToNext: Math.max(0, next.minimumXp - totalXp),
    progressPercent: Math.min(100, Math.max(0, Math.round((earnedInLevel / span) * 100))),
  };
}
