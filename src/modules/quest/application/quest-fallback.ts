import type { QuestContext, QuestPackOutput } from "../domain/quest-contract";

/** No external AI or private history: use only the approved milestone. */
export function buildEvidenceBasedQuestPack(
  context: QuestContext,
): QuestPackOutput {
  const focus = context.milestoneTitle.replace(/\s+/g, " ").trim().slice(0, 85);
  const outcome = context.milestoneExpectedOutcome.trim().slice(0, 180);
  const topic = `${context.milestoneTitle} ${context.milestonePurpose}`;
  const research =
    /\b(understand|observe|listen|research|interview|needs)\b/i.test(topic);
  const practice =
    !research && /\b(learn|practi[cs]e|rehearse|skill|train)\b/i.test(topic);
  const safety = context.isMinor
    ? "Work with someone you already know. Ask a parent, guardian or teacher before involving others. Leave private details out of your notes."
    : "Ask permission before involving someone. Use people you already know and leave private details out of your notes.";
  const firstSteps = research
    ? [
        `Start with “${focus}”. Write one question that will help you understand it.`,
        "Ask one person you already know who has experience of this. Let them answer in their own words.",
        "Write down one example they gave. If nobody is available, observe one relevant situation and record what you actually notice.",
      ]
    : practice
      ? [
          `Choose one part of “${focus}” to practise with what you already have.`,
          "Try it once. Keep the attempt: a sketch, a short recording, a worked example or a note of what you did can work.",
          "Look at the attempt. Write one thing that worked and one thing you found difficult.",
        ]
      : [
          `Make or try one small part of “${focus}” with what you already have.`,
          "Keep it small enough to finish today. A rough sample, a short demonstration or one useful change can work.",
          "Try using what you made or changed. Write what happened, including anything that did not work.",
        ];
  const reflection = [
    "What did you actually do? Name one action you took.",
    "What happened? Describe what you noticed, even if it did not work.",
    "What did this attempt teach you? Give one example.",
    "What will you do differently in your next attempt?",
  ];
  const shared = {
    resources_needed: ["Paper or a note-taking tool you already use"],
    low_resource_alternative:
      "Use paper and materials you already have. Write what happened; a photo, paid tool or internet connection is not needed for the activity.",
    safety_guidance: safety,
    reflection_prompts: reflection,
  };
  return {
    quests: [
      {
        ...shared,
        title:
          `${research ? "Find out" : practice ? "Try" : "Make a first attempt"}: ${focus}`.slice(
            0,
            100,
          ),
        real_world_outcome:
          `One real attempt toward this goal, with an honest record: ${outcome}`.slice(
            0,
            400,
          ),
        why_it_matters:
          "Trying one small part shows you what works and where you need help.",
        estimated_minutes: 30,
        action_steps: firstSteps,
        evidence_requirements: [
          "Describe what you tried and what happened. Include one specific example.",
        ],
        completion_criteria:
          "You have tried one relevant action and saved an honest note of the result. A plan alone does not count.",
        sequence_order: 1,
      },
      {
        ...shared,
        title: `Check your first attempt: ${focus}`.slice(0, 100),
        real_world_outcome:
          "One part of your first attempt has been checked through feedback or another real try.",
        why_it_matters:
          "A second check helps you avoid guessing about what needs to change.",
        estimated_minutes: 30,
        action_steps: [
          `Look at your first attempt at “${focus}”. Choose one thing you are still unsure about.`,
          research
            ? "Check your question in a second relevant situation or with another person you already know. Record what agrees or differs."
            : "Try that part again. If someone you know can help, show them the attempt and ask what is useful or confusing.",
          "Write what you noticed. Choose one change to try next and explain why.",
        ],
        evidence_requirements: [
          "Write what you checked, what happened and the one change you chose.",
        ],
        completion_criteria:
          "You have checked the first attempt through another try or real feedback and recorded one useful change.",
        sequence_order: 2,
      },
      {
        ...shared,
        title: `Use what you learned: ${focus}`.slice(0, 100),
        real_world_outcome:
          `A new attempt uses what you learned and records progress toward: ${outcome}`.slice(
            0,
            400,
          ),
        why_it_matters:
          "Using what you learned helps you improve the work, not just talk about improving it.",
        estimated_minutes: 45,
        action_steps: [
          `Return to “${focus}”. Read the one change you chose after your check.`,
          research
            ? "Use your notes to write one clear finding with the examples that support it. Mark anything you still do not know."
            : "Make that change and try the work again. Keep the new version or write down what you did differently.",
          "Compare the two attempts. Write what improved, what stayed difficult and what still needs doing toward the milestone goal.",
        ],
        evidence_requirements: [
          "Save the new work or finding. Explain the change and one thing that still needs work.",
        ],
        completion_criteria:
          "You have used what you learned in new work and recorded the result honestly. Do not claim an outcome you have not reached.",
        sequence_order: 3,
      },
    ],
  };
}
