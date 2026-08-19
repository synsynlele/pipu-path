import { describe, expect, it } from "vitest";
import { getBuilderLevelProgress } from "./builder-level";

describe("getBuilderLevelProgress", () => {
  it.each([
    [0, "Explorer", "Learner"],
    [99, "Explorer", "Learner"],
    [100, "Learner", "Problem Solver"],
    [299, "Learner", "Problem Solver"],
    [300, "Problem Solver", "Builder"],
    [699, "Problem Solver", "Builder"],
    [700, "Builder", "Founder Ready"],
    [999, "Builder", "Founder Ready"],
    [1000, "Founder Ready", null],
  ])("maps %i XP to %s", (xp, current, next) => {
    const progress = getBuilderLevelProgress(xp);
    expect(progress.current).toBe(current);
    expect(progress.next).toBe(next);
  });

  it("reports progress within the current level without inventing XP", () => {
    expect(getBuilderLevelProgress(200)).toMatchObject({
      current: "Learner",
      next: "Problem Solver",
      totalXp: 200,
      xpToNext: 100,
      progressPercent: 50,
    });
  });

  it("treats invalid and negative values as zero", () => {
    expect(getBuilderLevelProgress(-10).totalXp).toBe(0);
    expect(getBuilderLevelProgress(Number.NaN).totalXp).toBe(0);
  });
});
