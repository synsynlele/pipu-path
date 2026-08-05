import type { JourneyContext, JourneyOutput } from "../domain/journey-contract";

function shorten(value: string, maximum: number) {
  const trimmed = value.trim();
  if (trimmed.length <= maximum) return trimmed;
  return `${trimmed.slice(0, maximum - 1).trimEnd()}.`;
}

export function buildEvidenceBasedJourney(input: {
  context: JourneyContext;
  currentJourney?: JourneyOutput;
}): JourneyOutput {
  if (input.currentJourney) {
    return {
      ...input.currentJourney,
      milestones: input.currentJourney.milestones.map((milestone) => ({
        ...milestone,
        resource_note:
          "Use resources already available and keep this milestone small enough to complete safely.",
      })),
    };
  }

  const caution = shorten(input.context.currentCaution, 250);

  return {
    title: "Build Evidence Through One Practical Test",
    summary:
      "Turn the active mission into one small, realistic test. Clarify the outcome, prepare a simple first version, run it with the intended users, then use their feedback to improve the next version.",
    target_outcome: input.context.firstMeaningfulOutcome,
    suggested_duration: "four_weeks",
    milestones: [
      {
        title: "Clarify the Small Test",
        purpose:
          "Define one narrow problem, one reachable group and the smallest useful result the mission should produce.",
        expected_outcome:
          "A written test plan identifies the intended users, the useful result and the limits of the first version.",
        suggested_duration: "Three to five days",
        capabilities_to_develop: ["Problem framing", "Planning"],
        completion_signal:
          "The intended users, outcome and boundaries of the test are written clearly enough to explain to another person.",
        resource_note: caution,
        sequence_order: 1,
      },
      {
        title: "Prepare the First Version",
        purpose:
          "Create the simplest guide, session, process or prototype that can test the mission without unnecessary cost or complexity.",
        expected_outcome:
          "One usable first version is ready to be tried by the intended users.",
        suggested_duration: "Five to seven days",
        capabilities_to_develop: ["Resourcefulness", "Communication"],
        completion_signal:
          "The first version is complete, understandable and ready for a small real-world test.",
        resource_note:
          "Use existing materials, trusted collaborators and tools already available before considering any new expense.",
        sequence_order: 2,
      },
      {
        title: "Run the Practical Test",
        purpose:
          "Use the first version with the reachable people named in the mission and observe what helps, what confuses them and what remains incomplete.",
        expected_outcome:
          "The intended users complete one practical test and provide specific observations about the experience.",
        suggested_duration: "One week",
        capabilities_to_develop: ["Facilitation", "Observation"],
        completion_signal: input.context.successSignal,
        resource_note:
          "Keep participation voluntary, protect private information and work only with people already reachable through trusted channels.",
        sequence_order: 3,
      },
      {
        title: "Review and Improve",
        purpose:
          "Compare the result with the mission success signal, identify the strongest evidence and choose one improvement for the next version.",
        expected_outcome:
          "A brief review records what worked, what did not work and the single most useful next improvement.",
        suggested_duration: "Three to five days",
        capabilities_to_develop: ["Reflection", "Iteration"],
        completion_signal:
          "The evidence and feedback have been recorded, and one realistic next improvement has been selected.",
        resource_note:
          "Do not expand the audience or scope until the first result is understood and the next improvement is clear.",
        sequence_order: 4,
      },
    ],
  };
}
