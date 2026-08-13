import { describe, expect, it } from "vitest";
import {
  validateJourneyForContext,
  type JourneyContext,
} from "../domain/journey-contract";
import { buildEvidenceBasedJourney } from "./journey-fallback";

const context: JourneyContext = {
  missionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  title: "Support student study",
  missionStatement: "Test a useful study support idea with three students.",
  whoThisHelps: "Three students",
  firstMeaningfulOutcome: "Create and test one useful study guide.",
  successSignal: "Three students use it and respond.",
  currentCaution: "Use trusted people and existing resources.",
  ageBand: "18_24",
  isMinor: false,
  generalResourceConstraints: ["No spending required"],
};

const selectedPath = {
  key: "communication_service",
  pathName: "Communication Through Useful Service",
  observedPattern:
    "Your profile repeatedly shows that you explain ideas clearly and move toward practical action.",
  possibleInterpretation:
    "This may fit work where communication turns a real problem into a useful result for other people.",
  whyItFits:
    "The profile combines communication, initiative and learning through practical feedback rather than theory alone.",
  skillsNeeded: ["Clear explanation", "Feedback", "Practical delivery"],
  howToTest:
    "Create one small explanation or guide for a reachable person, let them use it and ask what became easier or clearer.",
  valueOrIncome: [
    "A useful explanation can later become a tutoring, media or communication service after evidence shows that people value it.",
  ],
  evidenceNeeded:
    "Keep the finished sample, specific feedback and one improved version that responds to what the user found difficult.",
  profileEvidenceRefs: [
    "11111111-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222",
  ],
};

function pathwayContext(isMinor = false): JourneyContext {
  return {
    ...context,
    ageBand: isMinor ? "16_17" : "18_24",
    isMinor,
    selectedPath,
  };
}

describe("evidence-based Journey fallback", () => {
  it("produces a contract-valid ordered four-milestone Journey", () => {
    const output = buildEvidenceBasedJourney({ context });
    const result = validateJourneyForContext(context, output);

    expect(result.ok).toBe(true);
    expect(output.milestones).toHaveLength(4);
    expect(output.milestones.map((item) => item.sequence_order)).toEqual([
      1, 2, 3, 4,
    ]);
    expect(output.target_outcome).toBe(context.firstMeaningfulOutcome);
  });

  it("preserves an existing valid draft when refinement cannot use Gemini", () => {
    const currentJourney = buildEvidenceBasedJourney({ context });
    const output = buildEvidenceBasedJourney({ context, currentJourney });
    const result = validateJourneyForContext(context, output);

    expect(result.ok).toBe(true);
    expect(output.title).toBe(currentJourney.title);
    expect(
      output.milestones.every((item) => item.resource_note.length > 10),
    ).toBe(true);
  });

  it("creates a distinct valid continuation cycle from completed evidence", () => {
    const currentJourney = buildEvidenceBasedJourney({ context });
    const output = buildEvidenceBasedJourney({
      context,
      currentJourney,
      continuation: true,
    });
    const result = validateJourneyForContext(context, output);

    expect(result.ok).toBe(true);
    expect(output.title).not.toBe(currentJourney.title);
    expect(output.milestones[0]?.title).toBe("Extract the Strongest Evidence");
  });

  it("builds an adult selected path as a strict four-week pathway", () => {
    const selectedContext = pathwayContext(false);
    const output = buildEvidenceBasedJourney({ context: selectedContext });

    expect(validateJourneyForContext(selectedContext, output).ok).toBe(true);
    expect(output.suggested_duration).toBe("four_weeks");
    expect(output.milestones.map((item) => item.title)).toEqual([
      "Week 1 — Learn the Path Basics",
      "Week 2 — Practice the Core Skills",
      "Week 3 — Build a Useful Sample",
      "Week 4 — Test With Real Feedback",
    ]);
    expect(output.milestones[3]?.resource_note).toContain(
      "paid trial is optional",
    );
  });

  it("keeps a minor selected path supervised and learning-first", () => {
    const selectedContext = pathwayContext(true);
    const output = buildEvidenceBasedJourney({ context: selectedContext });

    expect(validateJourneyForContext(selectedContext, output).ok).toBe(true);
    expect(output.milestones[0]?.resource_note).toContain(
      "parent, guardian, teacher",
    );
    expect(output.milestones[3]?.resource_note).toContain("supervised school");
    expect(output.milestones[3]?.resource_note).toContain(
      "Earning is optional",
    );
  });

  it("creates the next selected-path cycle from prior evidence", () => {
    const selectedContext = pathwayContext(false);
    const currentJourney = buildEvidenceBasedJourney({
      context: selectedContext,
    });
    const output = buildEvidenceBasedJourney({
      context: selectedContext,
      currentJourney,
      continuation: true,
    });

    expect(validateJourneyForContext(selectedContext, output).ok).toBe(true);
    expect(output.title).toContain("30-Day Growth Cycle");
    expect(output.milestones[0]?.title).toBe(
      "Week 1 — Learn From Previous Evidence",
    );
    expect(output.milestones[1]?.title).toBe(
      "Week 2 — Practice the Weakest Useful Skill",
    );
    expect(output.milestones[2]?.title).toBe(
      "Week 3 — Build an Improved Useful Sample",
    );
    expect(output.milestones[3]?.title).toBe(
      "Week 4 — Test the Improved Value",
    );
  });
});
