import type { QuestContext, QuestPackOutput } from "./quest-contract";

type Recipe = {
  match: RegExp;
  titles: [string, string, string];
  outcome: string;
  materials: string[];
  actions: [string[], string[], string[]];
  measure: string;
  safety: string;
};

// Candidate recipes for independent safeguarding and curriculum review.
// Match specific approved milestone titles, not arbitrary free-text commands.
// Do not transmit youth history or evidence to an external AI.
const recipes: Recipe[] = [
  {
    match: /\b(?:peer reading|reading support|paired reading)\b/i,
    titles: [
      "Start a paired reading session",
      "Test a clearer reading method",
      "Help a reading partner use the method again",
    ],
    outcome: "A useful reading routine for a willing familiar partner.",
    materials: ["An existing suitable reading passage"],
    actions: [
      [
        "Ask a familiar willing partner to read a short passage aloud or silently. Agree on three words to explain together.",
        "Count how many of the three words the partner can explain without hints. Do not record their name.",
        "Read one sentence together, explain one difficult word with a familiar example, then let the partner try again.",
      ],
      [
        "Choose three comparable words from the same existing book.",
        "Explain each word with a familiar example and invite the partner to explain the meaning in their own words.",
        "Compare the number explained independently with the earlier count. Ask which example helped most.",
      ],
      [
        "Change one explanation based on the partner's feedback.",
        "Try the revised explanation with three comparable words and let the partner respond independently.",
        "Compare the counts. If the partner is willing, agree on one short reading session to repeat another day.",
      ],
    ],
    measure: "Number of three comparable words explained without hints.",
    safety:
      "Use suitable reading material and respect the partner's choice to stop.",
  },
  {
    match:
      /\b(?:save water|water conservation|reduce water waste|reduce wasted water)\b/i,
    titles: [
      "Introduce a water-saving routine",
      "Compare the water-use routine",
      "Improve the routine with feedback",
    ],
    outcome: "A tested change that reduces unnecessary tap-running time.",
    materials: ["Existing permitted tap", "A clock, if available"],
    actions: [
      [
        "With permission, observe one normal handwashing routine. Count the times the tap stays on when it is not needed.",
        "Agree to turn the tap off during soaping and on again for rinsing.",
        "Try the change during your own normal handwash without shortening cleaning or rinsing.",
      ],
      [
        "Repeat the routine during the next normal handwash.",
        "Count unnecessary tap-running events using the same method as before.",
        "Compare the two counts. Keep normal handwashing and hygiene unchanged.",
      ],
      [
        "Choose a safe reminder that helps you remember to close the tap during soaping.",
        "Try the routine again during an ordinary handwash.",
        "Compare the count and ask a familiar adult whether the routine is practical.",
      ],
    ],
    measure: "Count unnecessary tap-running events per normal handwash.",
    safety:
      "Do not repair taps or alter plumbing. Maintain normal handwashing hygiene.",
  },
  {
    match:
      /\b(?:organise school supplies|organize school supplies|reduce lost supplies|classroom supplies)\b/i,
    titles: [
      "Set up a school supply return station",
      "Test whether supplies are easier to find",
      "Improve the return station",
    ],
    outcome:
      "A working storage routine that makes permitted shared supplies easier to find.",
    materials: ["Existing clean container or shelf", "Permitted safe supplies"],
    actions: [
      [
        "Ask the responsible adult to select three safe shared supplies you may organise.",
        "Notice how many places you check before finding each item.",
        "Place the items together in an agreed accessible location, with a clear place for each.",
      ],
      [
        "Invite a familiar willing user to find and return the three items.",
        "Count how many places they check and whether each item returns to its agreed place.",
        "Compare with the first search. Ask which part of the arrangement was unclear.",
      ],
      [
        "Move one permitted item to a clearer place based on the test.",
        "Repeat the search-and-return task with the same three items.",
        "Compare the results and ask the responsible adult whether to keep the new arrangement.",
      ],
    ],
    measure:
      "Places checked per item and items returned to the agreed location.",
    safety:
      "Do not move valuable items, heavy objects or another person's belongings without permission.",
  },
  {
    match: /\b(?:reduce food waste|food waste reduction|prevent food waste)\b/i,
    titles: [
      "Make packaged-food supplies easier to use first",
      "Test the first-use arrangement",
      "Improve the arrangement with a household adult",
    ],
    outcome:
      "An adult-approved arrangement that makes existing packaged supplies easier to notice before they are forgotten.",
    materials: ["Existing safe unopened packages", "Permitted shelf"],
    actions: [
      [
        "Ask a household adult to select three safe unopened food packages for the activity.",
        "Count how many are hidden behind other packages before the change.",
        "With the adult, place the selected packages where the adult can easily notice them and decide when to use them.",
      ],
      [
        "Ask the adult to locate the three packages without moving unrelated items.",
        "Count how many are easy to see and reach without moving anything else.",
        "Compare with the earlier arrangement. Ask whether the new layout helps the adult decide what to use first.",
      ],
      [
        "With the adult, adjust the position of one unopened package.",
        "Repeat the visibility check for the same selected packages.",
        "Record whether the adult finds the arrangement useful; do not claim food was saved unless it actually was.",
      ],
    ],
    measure: "Number of selected packages visible without moving other items.",
    safety:
      "Do not open packages, handle spoiled food or decide whether food is safe. Let the adult manage food storage and use.",
  },
  {
    match: /\b(?:daylight study|natural light|daylight workspace)\b/i,
    titles: [
      "Set up a clearer daylight reading spot",
      "Test the reading spot",
      "Improve the spot without electrical work",
    ],
    outcome:
      "A familiar reading area with a tested improvement in ordinary daylight.",
    materials: ["Existing book", "Safe permitted reading space"],
    actions: [
      [
        "Choose a short reading task in your usual daytime spot.",
        "Notice whether you need to move the book closer, shade glare or change position to read comfortably.",
        "Ask permission to use a safe existing seat in a brighter spot, keeping doors and walkways clear.",
      ],
      [
        "Try the same reading task in the second spot under similar daylight.",
        "Count how many times you need to reposition the book or change your seat.",
        "Compare with the first spot and notice whether glare or comfort changed.",
      ],
      [
        "Adjust the angle of the book or choose another permitted seat if glare remains.",
        "Repeat the same short reading task.",
        "Compare the observations and keep the better arrangement only with permission.",
      ],
    ],
    measure: "Book or seat adjustments during the same short reading task.",
    safety:
      "Do not touch electrical fittings or move heavy furniture. Avoid direct glare and keep exits clear.",
  },
  {
    match: /\b(?:reduce study interruptions|study focus|study distractions)\b/i,
    titles: [
      "Start a short focus routine",
      "Test the focus routine",
      "Improve the routine with a partner",
    ],
    outcome:
      "A useful distraction-reduction routine that a consenting familiar person can also try.",
    materials: ["Existing study material", "Clock if already available"],
    actions: [
      [
        "Choose a short normal study task and count interruptions during that task.",
        "Arrange the materials you need within reach and agree on one quiet signal with a familiar willing person.",
        "Repeat a comparable task, using the signal to show that you are working.",
      ],
      [
        "Try another comparable study task with the same setup and signal.",
        "Count interruptions in the same way as before.",
        "Compare the counts and ask the familiar person whether the signal was clear.",
      ],
      [
        "Change one part of the setup or signal that was not useful.",
        "Repeat the comparable task and count interruptions again.",
        "Share the working method with the willing person and invite them to try it if they want to.",
      ],
    ],
    measure: "Number of interruptions during comparable short study tasks.",
    safety:
      "Do not block urgent communication or impose the routine on anyone. Take normal breaks.",
  },
];

export function buildYouthPracticalPack(
  context: QuestContext,
): QuestPackOutput | null {
  if (!context.isMinor) return null;
  // Narrow matching avoids replacing an unrelated or research-only milestone.
  const discoveryOnly =
    /\b(?:research|investigate|understand|observe|learn about)\b/i;
  if (discoveryOnly.test(context.milestoneTitle)) return null;
  const recipe = recipes.find((item) =>
    item.match.test(context.milestoneTitle),
  );
  if (!recipe) return null;
  const safety =
    "Ask a parent, guardian or teacher before involving others. Use a familiar permitted setting. " +
    recipe.safety;
  return {
    quests: recipe.actions.map((action_steps, index) => ({
      title: recipe.titles[index],
      real_world_outcome: recipe.outcome,
      why_it_matters:
        "A real trial helps you discover whether your solution is useful to someone.",
      estimated_minutes: 30,
      action_steps,
      resources_needed: recipe.materials,
      low_resource_alternative:
        "Use only items already available and approved. If the setting or materials are unavailable, ask your guide to choose a suitable milestone; do not buy anything.",
      evidence_requirements: [
        "Describe the actual action and observed result without names or photos of people.",
        recipe.measure,
      ],
      safety_guidance: safety,
      completion_criteria:
        "Carry out the permitted action and record the observed result honestly, including a result that did not improve.",
      reflection_prompts: [
        "What did you actually do in this trial?",
        "What changed or did not change during the trial?",
        "What did the observation teach you about the problem?",
        "What one change could make the next trial more useful?",
      ],
      sequence_order: index + 1,
    })),
  };
}
