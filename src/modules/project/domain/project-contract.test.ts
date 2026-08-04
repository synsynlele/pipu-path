import { describe, expect, it } from "vitest";
import {
  calculateProjectProgress,
  projectCreateInputSchema,
  projectUpdateInputSchema,
} from "./project-contract";

const validProject = {
  sourceQuestId: "11111111-1111-4111-8111-111111111111",
  title: "Community reading starter",
  problemStatement:
    "Younger learners nearby have few simple opportunities to practise reading aloud.",
  peopleServed: "Five nearby primary-school learners and their caregivers.",
  desiredOutcome:
    "Create and test a small weekly reading activity that learners can use confidently.",
  smallestUsefulVersion:
    "One thirty-minute reading session with a simple story, questions and caregiver feedback.",
  successSignal:
    "At least three learners complete the session and one caregiver confirms it was useful.",
  targetDate: "2026-09-04",
  milestones: [
    {
      title: "Understand the need",
      intendedOutcome:
        "Confirm the reading challenge with learners or caregivers.",
      completionSignal: "Three short conversations are recorded honestly.",
      sequenceOrder: 1,
    },
    {
      title: "Build the smallest version",
      intendedOutcome:
        "Prepare one usable reading session with available materials.",
      completionSignal: "The complete session can be used by one learner.",
      sequenceOrder: 2,
    },
    {
      title: "Test and improve",
      intendedOutcome:
        "Run the session, collect feedback and improve one weak point.",
      completionSignal:
        "A real test and one evidence-based improvement are recorded.",
      sequenceOrder: 3,
    },
  ],
};

describe("Stage 8 Builder Project contract", () => {
  it("accepts a realistic three-milestone Project", () => {
    expect(projectCreateInputSchema.safeParse(validProject).success).toBe(true);
  });

  it("rejects reordered or missing milestones", () => {
    expect(
      projectCreateInputSchema.safeParse({
        ...validProject,
        milestones: validProject.milestones.slice(0, 2),
      }).success,
    ).toBe(false);
    expect(
      projectCreateInputSchema.safeParse({
        ...validProject,
        milestones: validProject.milestones.map((milestone, index) => ({
          ...milestone,
          sequenceOrder: index + 2,
        })),
      }).success,
    ).toBe(false);
  });

  it("requires meaningful progress and proof", () => {
    expect(
      projectUpdateInputSchema.safeParse({
        projectId: validProject.sourceQuestId,
        milestoneId: "22222222-2222-4222-8222-222222222222",
        progressNote: "Too short",
        proofText: "Also short",
        proofLink: "example.com",
        nextStep: "Continue",
        marksMilestoneComplete: true,
      }).success,
    ).toBe(false);
  });

  it("calculates progress from completed milestones only", () => {
    expect(calculateProjectProgress([])).toBe(0);
    expect(calculateProjectProgress(["available", "locked", "locked"])).toBe(0);
    expect(calculateProjectProgress(["completed", "available", "locked"])).toBe(
      33,
    );
    expect(
      calculateProjectProgress(["completed", "completed", "completed"]),
    ).toBe(100);
  });
});
