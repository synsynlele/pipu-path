import type { JourneyContext, JourneyOutput } from "../domain/journey-contract";

function shorten(value: string, maximum: number) {
  const trimmed = value.trim();
  if (trimmed.length <= maximum) return trimmed;
  return `${trimmed.slice(0, maximum - 1).trimEnd()}.`;
}

function buildEconomicPathwayJourney(
  context: JourneyContext,
  continuation: boolean,
): JourneyOutput {
  const path = context.selectedPath;
  if (!path) throw new Error("JOURNEY_PROFILE_REQUIRED");
  const skills = path.skillsNeeded.slice(0, 4);
  const trustedResourceNote = context.isMinor
    ? "Use free or already available learning resources and involve a parent, guardian, teacher or other trusted adult in any real-world test."
    : "Use free or already available learning resources and keep the first test small enough to complete without unnecessary spending.";

  return {
    title: shorten(
      continuation
        ? `30-Day Growth Cycle for ${path.pathName}`
        : `30-Day Pathway: ${path.pathName}`,
      100,
    ),
    summary: continuation
      ? "Use evidence from the previous cycle to deepen the selected path: learn from what happened, practise the weakest useful capability, build an improved sample and test whether it creates value more consistently."
      : "Spend four focused weeks testing the selected path through learning, deliberate practice, one useful build and a safe real-world test. The goal is evidence about capability, enjoyment and usefulness, not a promise of income or a permanent career decision.",
    target_outcome: shorten(path.howToTest, 400),
    suggested_duration: "four_weeks",
    milestones: [
      {
        title: continuation
          ? "Week 1 — Learn From Previous Evidence"
          : "Week 1 — Learn the Path Basics",
        purpose: continuation
          ? "Review the strongest and weakest evidence from the previous cycle, then learn the specific concept or technique most likely to improve the next result."
          : `Understand the basics of ${path.pathName}, what useful work in this direction looks like and the minimum knowledge needed before attempting a real output.`,
        expected_outcome: continuation
          ? "A short evidence review identifies one capability gap and a focused learning target for this cycle."
          : "A concise learning note explains the path, two important skills and one quality standard to use during practice.",
        suggested_duration: "Week 1",
        capabilities_to_develop: skills.slice(0, 2).length
          ? skills.slice(0, 2)
          : ["Focused learning", "Self-direction"],
        completion_signal: continuation
          ? "The learning target is tied to evidence from completed work and can be explained clearly."
          : "You can explain the basic skill, show one example of good work and identify what you still need to practise.",
        resource_note: trustedResourceNote,
        sequence_order: 1,
      },
      {
        title: continuation
          ? "Week 2 — Practice the Weakest Useful Skill"
          : "Week 2 — Practice the Core Skills",
        purpose: continuation
          ? "Run several small exercises that deliberately target the capability gap identified in Week 1 and compare the results."
          : "Complete small practical exercises that use the selected path's core capabilities before trying to serve a real person or group.",
        expected_outcome:
          "Several small practice attempts show what is becoming easier, what still needs work and which capability deserves more attention.",
        suggested_duration: "Week 2",
        capabilities_to_develop: skills.length
          ? skills
          : ["Practice", "Self-review"],
        completion_signal:
          "At least two practice attempts are saved or described and you can identify one specific improvement between them.",
        resource_note:
          "Practise with low-cost materials, simulations, familiar examples or school/work tasks before involving a wider audience.",
        sequence_order: 2,
      },
      {
        title: continuation
          ? "Week 3 — Build an Improved Useful Sample"
          : "Week 3 — Build a Useful Sample",
        purpose: continuation
          ? "Create an improved version of the work that applies the learning and practice evidence from the first two weeks."
          : "Turn the week's practice into one complete sample, mini-project, prototype, service draft or portfolio piece that another person can judge for usefulness.",
        expected_outcome:
          "One complete, reviewable output exists and demonstrates the selected capability in a practical form.",
        suggested_duration: "Week 3",
        capabilities_to_develop: ["Building", "Quality improvement"],
        completion_signal:
          "The sample is complete enough for a trusted person to use, review or respond to and its intended value is clear.",
        resource_note: shorten(context.currentCaution, 300),
        sequence_order: 3,
      },
      {
        title: continuation
          ? "Week 4 — Test the Improved Value"
          : "Week 4 — Test With Real Feedback",
        purpose: continuation
          ? "Test whether the improved sample creates a clearer or more consistent useful result than the previous cycle and record what changed."
          : "Show or deliver the sample to a small, safely reachable person or group, collect specific feedback and learn whether the work is useful enough to continue developing.",
        expected_outcome:
          "Real feedback and observable evidence show what people valued, what was difficult and whether this path deserves another cycle.",
        suggested_duration: "Week 4",
        capabilities_to_develop: ["Delivery", "Feedback", "Reflection"],
        completion_signal: shorten(path.evidenceNeeded, 320),
        resource_note: context.isMinor
          ? "Use familiar people and supervised school, family or community channels. Earning is optional; learning to create safe, useful value is the goal."
          : "Start with reachable people and a small test. A paid trial is optional; evidence of usefulness and honest feedback matter more than income.",
        sequence_order: 4,
      },
    ],
  };
}

function buildContinuationJourney(context: JourneyContext): JourneyOutput {
  return {
    title: "Deepen the Mission Through a Stronger Second Cycle",
    summary:
      "Use the evidence from the completed Journey to improve quality, serve people more consistently, measure what changes and prepare one repeatable version of the work without expanding beyond available resources.",
    target_outcome: `A stronger, repeatable version of: ${shorten(context.firstMeaningfulOutcome, 300)}`,
    suggested_duration: "six_weeks",
    milestones: [
      {
        title: "Extract the Strongest Evidence",
        purpose:
          "Review the completed Journey and identify which action created the clearest useful result, which assumption failed and which capability improved most.",
        expected_outcome:
          "A concise evidence review identifies one proven strength, one weak point and one priority for the next cycle.",
        suggested_duration: "Three to five days",
        capabilities_to_develop: ["Evidence review", "Judgement"],
        completion_signal:
          "The review cites specific completed work and selects one improvement priority rather than a broad new ambition.",
        resource_note:
          "Use the evidence already collected in PipuPath; do not create or purchase new resources for this review.",
        sequence_order: 1,
      },
      {
        title: "Improve the Useful Version",
        purpose:
          "Redesign the strongest practical output from the previous cycle so it is clearer, safer and easier for the intended people to use.",
        expected_outcome:
          "One improved version addresses the highest-value weakness discovered in the evidence review.",
        suggested_duration: "One to two weeks",
        capabilities_to_develop: ["Iteration", "Quality improvement"],
        completion_signal:
          "The improved version can be compared directly with the previous version and the change is clearly explained.",
        resource_note: shorten(context.currentCaution, 300),
        sequence_order: 2,
      },
      {
        title: "Test Consistency With Trusted Users",
        purpose:
          "Run the improved version with a small, reachable group and observe whether it creates the intended result more consistently.",
        expected_outcome:
          "A second practical test produces comparable feedback and evidence from the intended users.",
        suggested_duration: "One to two weeks",
        capabilities_to_develop: ["Delivery", "Observation"],
        completion_signal: context.successSignal,
        resource_note:
          "Keep participation voluntary, use trusted and already reachable channels, and protect private information.",
        sequence_order: 3,
      },
      {
        title: "Make the Work Repeatable",
        purpose:
          "Turn the improved approach into a simple checklist, guide or operating pattern that can be used again without depending on memory or constant supervision.",
        expected_outcome:
          "A lightweight repeatable process captures the essential steps, boundaries and quality checks.",
        suggested_duration: "One week",
        capabilities_to_develop: ["Systems thinking", "Documentation"],
        completion_signal:
          "Another trusted person can understand the process and identify the expected result without needing hidden instructions.",
        resource_note:
          "Document only the minimum process that proved useful; avoid adding tools, roles or complexity that the evidence does not justify.",
        sequence_order: 4,
      },
    ],
  };
}

export function buildEvidenceBasedJourney(input: {
  context: JourneyContext;
  currentJourney?: JourneyOutput;
  continuation?: boolean;
}): JourneyOutput {
  if (input.context.selectedPath) {
    return buildEconomicPathwayJourney(
      input.context,
      Boolean(input.continuation && input.currentJourney),
    );
  }

  if (input.continuation && input.currentJourney) {
    return buildContinuationJourney(input.context);
  }

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
