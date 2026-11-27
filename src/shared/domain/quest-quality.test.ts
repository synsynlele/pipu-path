import { describe, expect, it } from "vitest";
import {
  inspectJourneyQuestActions,
  inspectRealQuestStages,
  questQualityInstructions,
} from "./quest-quality";

// Twenty distinct problem/solution contexts times five checks. These are
// deterministic quality regressions, not claims about live model accuracy.
const scenarios = [
  ["school", "peer maths session"],
  ["food waste", "leftover sorting routine"],
  ["agriculture", "seedling watering routine"],
  ["water", "tap-off washing routine"],
  ["stock", "shelf inventory layout"],
  ["electricity", "daylight study setup"],
  ["accessibility", "clear reading corner"],
  ["waste", "clean reusable container station"],
  ["employment", "skill practice session"],
  ["finance", "reuse-first supply routine"],
  ["leadership", "classroom duty rotation"],
  ["transport", "permitted indoor pickup queue"],
  ["technology", "offline appointment list"],
  ["literacy", "paired reading session"],
  ["music", "shared rehearsal routine"],
  ["sports", "safe warm-up sequence"],
  ["community", "shared library return station"],
  ["sewing", "fabric scrap organisation"],
  ["household", "shared kitchen supply layout"],
  ["communication", "family turn-taking routine"],
] as const;

function recipe(solution: string) {
  return [
    ["Ask a familiar person about the problem.", "Count the starting delays."],
    ["Choose existing safe materials.", "Agree on a permitted place."],
    [
      "Set up the " + solution + " using the available materials.",
      "Show the consenting participant how to use it.",
    ],
    [
      "Try the setup in a real permitted task.",
      "Compare the delays with the starting count.",
    ],
    [
      "Adjust one part using the observed result.",
      "Record the revised trial including any failure.",
    ],
  ];
}

describe.each(scenarios)("%s quality regression", (_problem, solution) => {
  it("accepts a structured real-world recipe", () => {
    expect(inspectRealQuestStages(recipe(solution))).toBeNull();
  });
  it("rejects a generic build instruction", () => {
    const steps = recipe(solution);
    steps[2][0] = "Build an app.";
    expect(inspectRealQuestStages(steps)).toBe("GENERIC_ACTION");
  });
  it("rejects repeated actions disguised as new stages", () => {
    const steps = recipe(solution);
    steps[4][0] = steps[0][0];
    expect(inspectRealQuestStages(steps)).toBe("REPEATED_ACTIONS");
  });
  it("rejects a test stage with no observable check", () => {
    const steps = recipe(solution);
    steps[3] = ["Celebrate the effort.", "Think about the experience."];
    expect(inspectRealQuestStages(steps)).toBe("NO_MEASURABLE_TEST");
  });
  it("rejects reflection without an improvement action", () => {
    const steps = recipe(solution);
    steps[4] = ["Reflect on the experience.", "Write an honest account."];
    expect(inspectRealQuestStages(steps)).toBe("NO_IMPROVEMENT_ACTION");
  });
});

it("rejects identical Journey action packs even if titles or order differ", () => {
  const actions = recipe("reading session")[2];
  expect(
    inspectJourneyQuestActions([
      { action_steps: actions },
      { action_steps: [...actions].reverse() },
    ]),
  ).toBe("REPEATED_ACTIONS");
});

it("keeps useful real discovery distinct from generic paperwork", () => {
  expect(
    inspectJourneyQuestActions([
      {
        action_steps: [
          "Ask a consenting classmate where the example becomes confusing.",
          "Compare two real attempts without recording names.",
        ],
      },
    ]),
  ).toBeNull();
  expect(questQualityInstructions).toContain("never assume a phone");
});
