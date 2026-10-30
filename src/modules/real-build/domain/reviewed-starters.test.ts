import { describe, expect, it } from "vitest";
import { buildTopics, validateChallenge } from "./build";
import { REVIEWED_STARTER_TOPICS, reviewedStarter } from "./reviewed-starters";

describe("safe reviewed fallback Quests", () => {
  it("offers a tested real-world task in every supported topic", () => {
    expect(REVIEWED_STARTER_TOPICS.sort()).toEqual(buildTopics.map((v) => v.id).sort());
    for (const topic of REVIEWED_STARTER_TOPICS) {
      for (const difficulty of [1, 3, 5] as const) {
        const task = reviewedStarter(
          { topic, minutes: 15, focus: "I want to improve a familiar shared routine." },
          difficulty,
        );
        expect(validateChallenge(task)).toEqual(task);
        expect(task.steps).toHaveLength(5);
        expect(task.steps.join(" ")).toMatch(/test|try|check|compare/i);
        expect(task.title).not.toMatch(/worksheet|paper|poster|sketch|plan/i);
      }
    }
  });
});
