import type { QuestContext, QuestPackOutput } from "../domain/quest-contract";

export function buildEvidenceBasedQuestPack(
  context: QuestContext,
): QuestPackOutput {
  const capabilities = context.capabilitiesToDevelop.slice(0, 3);

  return {
    quests: [
      {
        title: "Define the Small Test",
        real_world_outcome:
          "A clear one-page plan describes the people involved, the useful result and the boundaries of the first test.",
        why_it_matters:
          "A narrow plan makes the milestone practical and prevents the first attempt from becoming too large or unclear.",
        estimated_minutes: 45,
        action_steps: [
          "Write the single problem this test should help address.",
          "Name the small group already reachable through trusted channels.",
          "Describe the smallest useful result the test should produce.",
          "List what is outside the scope of this first attempt.",
        ],
        resources_needed: ["Notebook or phone note", "Active milestone details"],
        low_resource_alternative:
          "Use one sheet of paper and complete the plan with information already available to you.",
        evidence_requirements: [
          "Provide the written problem, intended users and useful result.",
          "Record at least one clear boundary for the first test.",
        ],
        safety_guidance:
          "Use only information you are authorised to use and avoid recording private details that are not needed for the plan.",
        completion_criteria:
          "The plan clearly states the problem, intended users, useful result and limits of the first test.",
        reflection_prompts: [
          "What part of the problem became clearer?",
          "What assumption still needs to be tested?",
          "What did you remove to keep the test realistic?",
          "What will you explain differently next time?",
        ],
        sequence_order: 1,
      },
      {
        title: "Review the Plan With a Trusted Person",
        real_world_outcome:
          "One trusted person reviews the proposed test and identifies what is clear, confusing or unnecessarily difficult.",
        why_it_matters:
          "A brief review exposes unclear assumptions before time and effort are committed to the first version.",
        estimated_minutes: 45,
        action_steps: [
          "Choose one trusted person who understands the intended setting.",
          "Explain the problem, intended users and expected result in simple language.",
          "Ask what seems unclear, unrealistic or missing from the plan.",
          "Write the three most useful observations without changing the plan yet.",
        ],
        resources_needed: ["Current test plan", "Notebook or phone note"],
        low_resource_alternative:
          "Use a brief face-to-face or phone conversation with someone already known and reachable.",
        evidence_requirements: [
          "Record who reviewed the plan without exposing unnecessary private details.",
          "Summarise at least three specific observations from the review.",
        ],
        safety_guidance:
          "Work with someone already known through a trusted relationship and protect any private information discussed.",
        completion_criteria:
          "The plan has received one genuine review and the most useful observations are recorded accurately.",
        reflection_prompts: [
          "Which part of the plan was easiest to explain?",
          "Which part caused the most confusion?",
          "What feedback challenged your first assumption?",
          "What change now seems most important?",
        ],
        sequence_order: 2,
      },
      {
        title: "Revise and Confirm the Plan",
        real_world_outcome:
          "A revised test plan is ready for action with one clear next step, realistic limits and an observable success signal.",
        why_it_matters:
          "Turning feedback into a stronger plan creates useful evidence and prepares the next milestone for practical execution.",
        estimated_minutes: 60,
        action_steps: [
          "Compare the review observations with the original test plan.",
          "Choose the one change that will most improve clarity or feasibility.",
          "Rewrite the plan with the chosen improvement and realistic boundaries.",
          "State the first action and the evidence that will show progress.",
        ],
        resources_needed:
          capabilities.length > 0
            ? ["Original plan", "Review notes", ...capabilities]
            : ["Original plan", "Review notes"],
        low_resource_alternative:
          "Revise the same paper or phone note rather than creating new materials or adding unnecessary tools.",
        evidence_requirements: [
          "Provide the revised plan and identify the improvement made.",
          "Record the first action and the evidence that will show progress.",
        ],
        safety_guidance:
          "Keep the scope small, use trusted channels and pause before proceeding if the plan creates avoidable risk or pressure.",
        completion_criteria:
          "The revised plan is understandable, realistic and ready to guide the first practical action.",
        reflection_prompts: [
          "What improved most between the two versions?",
          "What useful feedback did you decide not to use yet?",
          "What capability did this planning process strengthen?",
          "What is the first practical action you will take?",
        ],
        sequence_order: 3,
      },
    ],
  };
}
