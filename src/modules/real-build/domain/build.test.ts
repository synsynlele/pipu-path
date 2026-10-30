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
  title: "Make a working homework reminder",
  outcome:
    "Test an actual reminder that helps one familiar classmate finish a task.",
  steps: [
    "Ask a familiar classmate which routine needs improvement.",
    "Choose a safe reminder using a device you already have.",
    "Set up a working reminder in a permitted setting.",
    "Test whether it helps with a real task.",
    "Improve the reminder and record what changed.",
  ],
  materials: ["Existing phone reminder"],
  evidence:
    "Describe the real task and the result observed after using the reminder.",
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
    challengeDesign: expect.stringContaining("small safe useful change"),
    avoidTitles: [challenge.title],
  });
});
it("validates actionable structure and rejects dangerous instructions even with a caution elsewhere", () => {
  expect(validateChallenge(challenge)).toEqual(challenge);
  expect(() =>
    validateChallenge({
      ...challenge,
      title: "Draw a paper plan for a solution",
    }),
  ).toThrow("BUILD_NOT_PRACTICAL");
  expect(() =>
    validateChallenge({
      ...challenge,
      steps: [
        "Look around at a routine.",
        "Think about a better routine.",
        "Consider an idea.",
        "Write some notes about an idea.",
        "Record a reflection about the idea.",
      ],
    }),
  ).toThrow("BUILD_NOT_PRACTICAL");
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
    challengeDesign: expect.stringContaining("small real process"),
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

it("accepts phone gestures, valid setup verbs and explicit cautions without permitting paper-only work", () => {
  expect(
    validateChallenge({
      ...challenge,
      steps: [
        challenge.steps[0],
        "Choose an existing focus setting without drawing a diagram.",
        "Enable a focus session and slide the duration control to ten minutes.",
        "Compare interruptions during an actual session with a familiar tester.",
        challenge.steps[4],
      ],
      materials: [
        "Existing phone",
        "Paper towel for cleaning the shared surface",
      ],
    }),
  ).toBeTruthy();
  expect(() =>
    validateChallenge({
      ...challenge,
      steps: [
        challenge.steps[0],
        challenge.steps[1],
        "Do not draw a diagram. Make a paper tracker instead.",
        ...challenge.steps.slice(3),
      ],
    }),
  ).toThrow("BUILD_NOT_PRACTICAL");
});

it("recognises real cooking/service delivery and pilot tests beyond construction vocabulary", () => {
  expect(
    validateChallenge({
      ...challenge,
      title: "Cook a useful shared snack",
      steps: [
        "Ask a familiar consenting person what snack they need.",
        "Gather existing safe ingredients with permission.",
        "Cook a small familiar snack for the consenting person.",
        "Evaluate the actual portion and feedback from the person.",
        "Adjust the serving after observing the real result.",
      ],
      materials: ["Existing safe ingredients"],
    }),
  ).toBeTruthy();
});
