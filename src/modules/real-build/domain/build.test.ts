import { expect, it } from "vitest";
import {
  canRecordAttempt,
  choiceSchema,
  emptyDraft,
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
  expect(choiceSchema.safeParse({ topic: "school", minutes: 30 }).success).toBe(
    true,
  );
  expect(
    choiceSchema.safeParse({ topic: "private health details", minutes: 30 })
      .success,
  ).toBe(false);
  expect(
    choiceSchema.safeParse({ topic: "school", minutes: 30, name: "Child" })
      .success,
  ).toBe(false);
  expect(
    choiceSchema.safeParse({ topic: "school", minutes: 999 }).success,
  ).toBe(false);
  const brief = publicChallengeBrief({ topic: "school", minutes: 30 }, [
    challenge.title,
  ]);
  expect(brief).toEqual({
    topic: "A fair chance to learn",
    safeStartingIdea: expect.any(String),
    minutes: 30,
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
