import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { discoverySchema, discoveryBrief } from "./discovery";
import { buildGoalKey } from "../infrastructure/goal-key";
const discovery = {
  kind: "habit",
  setting: "personal",
  obstacle: "automatic",
  resources: "phone",
} as const;
const choice = {
  topic: "school",
  minutes: 30,
  focus: "Reduce unplanned social media use.",
  discovery,
};
it("rejects mismatched adaptive answers and arbitrary extra private data", () => {
  expect(
    discoverySchema.safeParse({ ...discovery, obstacle: "coordination" })
      .success,
  ).toBe(false);
  expect(
    discoverySchema.safeParse({ ...discovery, userId: "private" }).success,
  ).toBe(false);
  expect(discoveryBrief(discovery)).toEqual({
    kind: "Improve a habit",
    setting: "My own routine",
    obstacle: "I do it without noticing",
    resources: "An existing phone or computer",
  });
});
it("separates cached guides by constraints while normalising equivalent goals", () => {
  expect(buildGoalKey(choice)).toBe(
    buildGoalKey({ ...choice, focus: "  REDUCE unplanned social media use. " }),
  );
  expect(buildGoalKey(choice)).not.toBe(
    buildGoalKey({ ...choice, discovery: { ...discovery, resources: "none" } }),
  );
  expect(buildGoalKey(choice)).not.toBe(
    buildGoalKey({ ...choice, discovery: undefined }),
  );
});
