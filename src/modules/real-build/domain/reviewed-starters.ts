import {
  validateChallenge,
  type BuildChallenge,
  type BuildChoice,
  type BuildDifficulty,
} from "./build";

/**
 * Editorially reviewed, real-life micro-projects. These do not claim AI
 * personalization and never count as completed work until the user acts.
 */
type Starter = {
  title: string;
  context: string;
  setup: string;
  change: string;
  test: string;
  materials: string[];
  safety: string;
};
const starters: Record<string, Starter> = {
  workshop: {
    title: "Give an unused item a useful second life",
    context: "a familiar home or work area",
    setup: "Choose a clean unused container that is safe to reuse.",
    change:
      "Put it to work organising small everyday items where it will actually be used.",
    test: "Ask a familiar person to use the new organiser and notice whether finding an item becomes easier.",
    materials: ["Clean reusable container", "Existing household items"],
    safety:
      "Use only clean, safe objects; no sharp tools, electrical work or unfamiliar people.",
  },
  power: {
    title: "Improve a real study or work area using daylight",
    context: "a familiar room",
    setup:
      "Find a safe place where natural light reaches an existing work surface.",
    change:
      "With permission, safely reposition a light movable item to improve the workspace.",
    test: "Try one real reading or work task in the improved space and compare comfort with before.",
    materials: ["Existing work surface", "Safe movable items"],
    safety:
      "Do not touch electrical fittings, lift heavy furniture or block walkways.",
  },
  market: {
    title: "Make supplies easier to find and use",
    context: "a familiar shop, home or school store",
    setup:
      "Ask permission to organise a few safe packaged items already in use.",
    change:
      "Arrange those items so the ones needed first can be reached first.",
    test: "Have the person responsible find an item before and after the change, and compare the effort.",
    materials: ["Existing safe packaged items", "Available shelf or container"],
    safety:
      "Use only permitted items; do not handle spoiled food or collect customer information.",
  },
  school: {
    title: "Help someone use a difficult skill",
    context: "a familiar learning group",
    setup:
      "Ask a classmate, colleague or family member which small learning step they find difficult.",
    change:
      "Teach one practical method with an example, then let the person try it independently.",
    test: "Check one real practice task and adjust how you teach based on the result.",
    materials: ["Existing learning materials"],
    safety:
      "Work only with someone you know, with consent; never record or publish private learner details.",
  },
  housing: {
    title: "Make a shared indoor space easier to use",
    context: "a familiar indoor shared space",
    setup:
      "Choose a small, permitted area where lightweight items make access difficult.",
    change:
      "Arrange the safe movable items so a normal activity has a clearer place.",
    test: "Try the actual activity and check whether access or movement improved.",
    materials: ["Existing lightweight household items"],
    safety:
      "Ask permission; do not lift heavy items, alter structures or block exits.",
  },
  water: {
    title: "Start a useful water-saving routine",
    context: "your home or another permitted familiar setting",
    setup:
      "Find an everyday activity where a tap is sometimes left running unnecessarily.",
    change:
      "Put a simple agreed habit into use, such as turning off the tap between tasks.",
    test: "Observe a real repeat of the activity and compare how long water flows before and after.",
    materials: ["Existing water-use area"],
    safety:
      "No plumbing, repairs or claims about drinking-water safety; ask permission first.",
  },
  health: {
    title: "Improve an everyday waiting-area routine",
    context: "a familiar permitted shared waiting area",
    setup:
      "Ask permission to improve how people find the correct waiting place.",
    change:
      "Arrange an existing lightweight seat or designated space to make the routine clearer.",
    test: "Try the arrangement during a real permitted visit and check whether it makes wayfinding easier.",
    materials: ["Existing safe, movable seating or space"],
    safety:
      "Never give medical advice, handle clinical items or record anyone's health information.",
  },
  transport: {
    title: "Make an indoor arrival routine smoother",
    context: "a familiar home, workplace or school entrance indoors",
    setup:
      "Notice one small point where bags or personal items slow an indoor arrival.",
    change:
      "With permission, arrange a safe place for those items away from the walking path.",
    test: "Try the next normal arrival and compare how easily people can pass.",
    materials: ["Existing bag or equipment storage"],
    safety:
      "Stay indoors and clear of traffic; do not obstruct exits or move another person's property without permission.",
  },
  technology: {
    title: "Build a working reminder for a real task",
    context: "a regular personal or family routine",
    setup:
      "Choose one non-sensitive repeated task that is genuinely forgotten sometimes.",
    change:
      "Set up a working reminder with a device or tool already available to you.",
    test: "Use the reminder during the real next task and check whether it helped.",
    materials: ["Existing device or reminder tool"],
    safety:
      "Do not enter or share passwords, account credentials or other private information.",
  },
  business: {
    title: "Improve one small selling or making routine",
    context: "a known seller or maker's permitted workspace",
    setup: "Ask which everyday, low-risk task is often repeated or confusing.",
    change:
      "With permission, organise the existing safe tools or goods to make that task easier.",
    test: "Try the routine for a genuine task and compare errors or steps with the old way.",
    materials: ["Existing permitted tools or goods"],
    safety:
      "Never approach strangers, spend money, promise earnings or handle restricted goods.",
  },
  environment: {
    title: "Put safe reusable items back into use",
    context: "a familiar home or shared area",
    setup:
      "Find clean, safe reusable items that are mixed with other everyday belongings.",
    change:
      "With permission, set up a usable sorting spot for those clean items.",
    test: "Ask someone familiar to sort one item and check whether the new arrangement helps.",
    materials: ["Clean reusable items", "Existing safe container"],
    safety:
      "Never touch hazardous waste, broken glass, medical waste or unknown substances.",
  },
  governance: {
    title: "Make one shared routine work better",
    context: "a familiar consenting group",
    setup: "Ask members which small shared routine currently causes confusion.",
    change:
      "Agree on and introduce one safe change to the way the routine is done.",
    test: "Try the change during a real group activity and ask whether it helped.",
    materials: ["Existing shared space and equipment"],
    safety:
      "Respect everyone, allow people to opt out and do not collect or publish private responses.",
  },
  creative: {
    title: "Create something that helps people understand",
    context: "a familiar group or learning activity",
    setup: "Choose one practical instruction people often misunderstand.",
    change:
      "Create and share your own short spoken or audio explanation that makes the task easier.",
    test: "Let a willing familiar listener try the real task and improve your explanation from feedback.",
    materials: ["Your voice or existing recording device"],
    safety:
      "Use only original content with consent; do not publish recordings or collect personal details.",
  },
  industry: {
    title: "Make a simple object that solves a small need",
    context: "a familiar home or work activity",
    setup:
      "Find a safe everyday item or container that could be used more effectively.",
    change:
      "Assemble a useful arrangement from existing safe objects without cutting or powered tools.",
    test: "Put the arrangement to work on a real task and check what became easier.",
    materials: ["Clean everyday objects already available"],
    safety:
      "No sharp, heated, powered or electrical tools; use only safe materials and get permission.",
  },
};

export function reviewedStarter(
  choice: BuildChoice,
  level: BuildDifficulty,
): BuildChallenge {
  const seed = starters[choice.topic];
  if (!seed) throw new Error("BUILD_UNKNOWN_TOPIC");
  return validateChallenge({
    title: seed.title,
    outcome:
      "Put a small, safe improvement into actual use and record one honest result.",
    steps: [
      `Find one real need in ${seed.context}. Ask permission before changing anything.`,
      seed.setup,
      seed.change,
      seed.test,
      level > 2
        ? "Compare a second safe variation, keep the better one and record what really happened."
        : "Improve one useful detail after the test and record what really happened.",
    ],
    materials: seed.materials,
    evidence:
      "Describe the change you put into use, the actual test result and what you improved.",
    safety: seed.safety,
  });
}
export const REVIEWED_STARTER_TOPICS = Object.freeze(Object.keys(starters));
