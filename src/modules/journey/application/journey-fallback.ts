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

export function buildContinuingEvidenceJourney(input: {
  context: JourneyContext;
  completedJourney: JourneyOutput;
}): JourneyOutput {
  return {
    title: "Deepen the Mission Through a Stronger Second Test",
    summary:
      "Build on the completed Journey by studying its evidence, improving the useful result, testing the stronger version with a carefully expanded group and recording a repeatable next practice.",
    target_outcome: shorten(
      `A stronger, repeatable version of the completed outcome: ${input.context.firstMeaningfulOutcome}`,
      390,
    ),
    suggested_duration: "four_weeks",
    milestones: [
      {
        title: "Study the Completed Evidence",
        purpose:
          "Review the completed Journey and identify the clearest result, the weakest point and the most important unanswered question.",
        expected_outcome:
          "A short evidence review names one result to preserve and one weakness to improve.",
        suggested_duration: "Three to five days",
        capabilities_to_develop: ["Evidence review", "Judgement"],
        completion_signal:
          "The strongest evidence, key weakness and next question are recorded without inventing new claims.",
        resource_note:
          "Use the evidence already collected during the completed Journey before seeking new resources.",
        sequence_order: 1,
      },
      {
        title: "Improve the Useful Version",
        purpose:
          "Change one important part of the previous version so it becomes clearer, easier to use or more useful to the intended people.",
        expected_outcome:
          "One improved version is ready for a new practical test and the reason for the change is documented.",
        suggested_duration: "Five to seven days",
        capabilities_to_develop: ["Iteration", "Design"],
        completion_signal:
          "The improvement is visible, testable and directly connected to evidence from the previous cycle.",
        resource_note: shorten(input.context.currentCaution, 300),
        sequence_order: 2,
      },
      {
        title: "Test With a Carefully Expanded Group",
        purpose:
          "Run the improved version with a slightly broader but still reachable group through trusted channels.",
        expected_outcome:
          "The improved version is used in a second real-world test and produces comparable feedback.",
        suggested_duration: "One week",
        capabilities_to_develop: ["Facilitation", "Responsible growth"],
        completion_signal: input.context.successSignal,
        resource_note:
          "Expand only through trusted contacts, keep participation voluntary and protect private information.",
        sequence_order: 3,
      },
      {
        title: "Create the Repeatable Next Practice",
        purpose:
          "Turn what worked across both cycles into one simple repeatable process and decide the next bounded direction.",
        expected_outcome:
          "A concise repeatable process records what to do, what evidence to watch and what should happen next.",
        suggested_duration: "Three to five days",
        capabilities_to_develop: ["Systems thinking", "Reflection"],
        completion_signal:
          "The repeatable process and one realistic next direction are written clearly enough for future use.",
        resource_note:
          "Keep the process simple; do not scale beyond the evidence or make guarantees about future impact.",
        sequence_order: 4,
      },
    ],
  };
}
