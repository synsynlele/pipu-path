import { expect, it } from "vitest";
import { stageActions, hasCompleteBuildRecipe } from "./stage-actions";
it("keeps legacy paragraphs readable and extracts numbered construction actions", () => {
  expect(stageActions("Test the existing solution with permission.")).toEqual([
    "Test the existing solution with permission.",
  ]);
  expect(
    stageActions(
      "1. Configure a shared focus timer.\n2. Test the session with a familiar user.",
    ),
  ).toEqual([
    "Configure a shared focus timer.",
    "Test the session with a familiar user.",
  ]);
  expect(
    hasCompleteBuildRecipe(Array(5).fill("Just change your habits.")),
  ).toBe(false);
  expect(
    hasCompleteBuildRecipe(
      Array(5).fill(
        "1. Configure a working focus session.\n2. Test it with a familiar consenting user.",
      ),
    ),
  ).toBe(true);
});
