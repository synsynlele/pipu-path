import { describe, expect, it } from "vitest";
import {
  calculateDiscoveryProgress,
  missingRequiredQuestions,
  validateDiscoveryInput,
  type DiscoveryAnswer,
  type DiscoveryQuestion,
} from "./discovery";

const question: DiscoveryQuestion = {
  id: "question-1",
  stableKey: "activities",
  sectionKey: "draws",
  sectionTitle: "What Draws Me",
  prompt: "What draws you?",
  supportingText: null,
  responseType: "multi_select",
  required: true,
  displayOrder: 1,
  maxTextLength: null,
  minSelections: 1,
  maxSelections: 2,
  minScale: null,
  maxScale: null,
  options: ["Making", "Helping", "Learning"],
  sensitivity: "standard",
};

describe("Discovery domain", () => {
  it("validates response types and limits", () => {
    expect(
      validateDiscoveryInput(question, {
        text: null,
        selectedOptions: ["Making", "Helping"],
        numeric: null,
        skipped: false,
      }),
    ).toBeNull();
    expect(
      validateDiscoveryInput(question, {
        text: null,
        selectedOptions: ["Unknown"],
        numeric: null,
        skipped: false,
      }),
    ).toBe("DISCOVERY_RESPONSE_INVALID");
    expect(
      validateDiscoveryInput(question, {
        text: null,
        selectedOptions: [],
        numeric: null,
        skipped: true,
      }),
    ).toBe("DISCOVERY_REQUIRED_RESPONSE_MISSING");
  });

  it("calculates progress from eligible questions and saved answers", () => {
    const second = { ...question, id: "question-2", stableKey: "values" };
    const answers: DiscoveryAnswer[] = [
      {
        questionId: question.id,
        questionKey: question.stableKey,
        text: null,
        selectedOptions: ["Making"],
        numeric: null,
        skipped: false,
        sensitivity: "standard",
      },
    ];
    expect(calculateDiscoveryProgress([question, second], answers)).toBe(50);
    expect(missingRequiredQuestions([question, second], answers)).toEqual([
      second,
    ]);
  });

  it("allows optional questions to be skipped", () => {
    expect(
      validateDiscoveryInput(
        { ...question, required: false },
        {
          text: null,
          selectedOptions: [],
          numeric: null,
          skipped: true,
        },
      ),
    ).toBeNull();
  });
});
