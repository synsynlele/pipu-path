import { describe, expect, it } from "vitest";
import { validateJourneyForContext } from "../domain/journey-contract";
import { buildEvidenceBasedJourney } from "./journey-fallback";

const context = {
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
});
