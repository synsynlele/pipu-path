import { expect, it } from "vitest";
import {
  canRecordAttempt,
  choiceSchema,
  emptyDraft,
  difficultyLabel,
  focusSchema,
  publicChallengeBrief,
  validateChallenge,
} from "./build";
export const challenge = {
  title: "Make a clearer homework tracker",
  outcome:
    "Test a paper tracker that helps one familiar classmate organise a task.",
  steps: [
    "Ask a familiar classmate which homework step they forget.",
    "Draw three labelled boxes on a scrap sheet of paper.",
    "Let that classmate try the tracker with a fictional task.",
    "Improve one label based on what was confusing.",
    "Record the change and what happened during the test.",
  ],
  materials: ["Scrap paper", "Pencil"],
  evidence:
    "Describe the test and one observed change; a photo of the paper is optional.",
  safety: "Ask permission. Keep names and private details out of your notes.",
};
it("allows only catalogue parameters, never arbitrary learner prose", () => {
  expect(
    choiceSchema.safeParse({
      topic: "school",
      minutes: 30,
      focus: "I want to make homework reminders clearer.",
    }).success,
  ).toBe(true);
  expect(
    choiceSchema.safeParse({
      topic: "private health details",
      minutes: 30,
      focus: "I want to improve this at school.",
    }).success,
  ).toBe(false);
  expect(
    choiceSchema.safeParse({
      topic: "school",
      minutes: 30,
      focus: "I want to improve class reminders.",
      name: "Child",
    }).success,
  ).toBe(false);
  expect(
    choiceSchema.safeParse({
      topic: "school",
      minutes: 999,
      focus: "I want to improve class reminders.",
    }).success,
  ).toBe(false);
  const brief = publicChallengeBrief(
    {
      topic: "school",
      minutes: 30,
      focus: "I want to make homework reminders clearer.",
    },
    [challenge.title],
  );
  expect(brief).toEqual({
    topic: "A fair chance to learn",
    improvementGoal: "I want to make homework reminders clearer.",
    safeStartingIdea: expect.any(String),
    minutes: 30,
    difficulty: 1,
    challengeDesign: expect.stringContaining("two possible solutions"),
    avoidTitles: [challenge.title],
  });
});
it("validates actionable structure and rejects dangerous instructions even with a caution elsewhere", () => {
  expect(validateChallenge(challenge)).toEqual(challenge);
  expect(() =>
    validateChallenge({ ...challenge, steps: challenge.steps.slice(0, 2) }),
  ).toThrow();
  expect(() =>
    validateChallenge({
      ...challenge,
      steps: [
        "Open the electrical socket to inspect it.",
        ...challenge.steps.slice(1),
      ],
      safety: "Do not touch live wires. Ask an adult for permission.",
    }),
  ).toThrow("BUILD_UNSAFE");
  expect(() =>
    validateChallenge({
      ...challenge,
      evidence: "Invent a result if the test does not work.",
    }),
  ).toThrow("BUILD_UNSAFE");
});
it("records a truthful unsuccessful attempt but never an empty completion", () => {
  expect(canRecordAttempt(emptyDraft)).toBe(false);
  expect(
    canRecordAttempt({
      ...emptyDraft,
      evidence:
        "I tested the tracker with my classmate but they found the labels confusing.",
      reflection: "I learned that labels need an example.",
      nextChange: "I will add one worked example.",
      outcome: "not_yet",
    }),
  ).toBe(true);
});

it("assigns deeper, safe challenge designs without implying verified ability", () => {
  expect(difficultyLabel(1)).toBe("First Challenge");
  expect(difficultyLabel(3)).toBe("Builder");
  expect(difficultyLabel(5)).toBe("Systems Thinker");
  const brief = publicChallengeBrief(
    {
      topic: "school",
      minutes: 15,
      focus: "I want to improve homework reminders.",
    },
    [],
    5,
  );
  expect(brief).toMatchObject({
    difficulty: 5,
    challengeDesign: expect.stringContaining("connected system"),
    minutes: 15,
  });
});

it("rejects personal contact details and unsupported free-form inputs", () => {
  expect(
    focusSchema.safeParse("Please email me at friend@example.com").success,
  ).toBe(false);
  expect(focusSchema.safeParse("Call me on +234 812 123 4567").success).toBe(
    false,
  );
  expect(
    focusSchema.safeParse("Make our reading corner easier to use").success,
  ).toBe(true);
  expect(
    choiceSchema.safeParse({
      topic: "school",
      minutes: 30,
      focus: "Improve our classroom layout",
    }).success,
  ).toBe(true);
});
