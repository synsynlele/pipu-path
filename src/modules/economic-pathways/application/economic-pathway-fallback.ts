import type {
  EconomicPathwayContext,
  EconomicPathwayOutput,
  PossiblePath,
} from "../domain/economic-pathway-contract";

function slug(value: string, fallback: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return /^[a-z][a-z0-9_]{2,59}$/.test(normalized) ? normalized : fallback;
}

function firstInsight(
  context: EconomicPathwayContext,
  section: EconomicPathwayContext["sections"][number]["key"],
) {
  return context.sections.find((item) => item.key === section)?.insights[0];
}

function strengthRefs(context: EconomicPathwayContext) {
  return (
    context.sections.find((item) => item.key === "emerging_strengths")
      ?.insights ?? []
  ).map((insight) => insight.id);
}

function buildPath(
  context: EconomicPathwayContext,
  input: {
    keyFallback: string;
    name: string;
    observed: string;
    interpretation: string;
    fit: string;
    skills: string[];
    test: string;
    evidence: string;
    refs: string[];
  },
): PossiblePath {
  const valueOrIncome = context.isMinor
    ? [
        "Create a useful sample, supervised school activity or trusted community service before thinking about payment.",
        "If a parent, guardian or trusted adult agrees it is appropriate, test whether a familiar person values the result and asks for more help.",
      ]
    : [
        "Turn the capability into a small starter service, useful sample or project for a reachable person or organisation.",
        "Use proof of usefulness and feedback before increasing the scope or asking people to pay for the work.",
      ];
  const refs = [...new Set(input.refs)].slice(0, 6);
  return {
    key: slug(input.name, input.keyFallback),
    pathName: input.name,
    observedPattern: input.observed,
    possibleInterpretation: input.interpretation,
    whyItFits: input.fit,
    skillsNeeded: input.skills.slice(0, 6),
    howToTest: input.test,
    valueOrIncome,
    evidenceNeeded: input.evidence,
    profileEvidenceRefs:
      refs.length >= 2 ? refs : strengthRefs(context).slice(0, 2),
  };
}

export function buildEvidenceBasedEconomicPathways(
  context: EconomicPathwayContext,
): EconomicPathwayOutput {
  const strengths =
    context.sections.find((item) => item.key === "emerging_strengths")
      ?.insights ?? [];
  const interest = firstInsight(context, "what_draws_you");
  const contribution = firstInsight(context, "how_you_can_contribute");
  const direction = firstInsight(context, "best_next_direction");
  const problem = firstInsight(context, "problems_you_care_about");
  const primary = direction ?? contribution ?? strengths[0];
  const secondary = strengths[0] ?? interest ?? contribution;
  const tertiary = interest ?? problem ?? strengths[1] ?? contribution;
  if (!primary || !secondary || !tertiary) {
    throw new Error("ECONOMIC_PATHWAYS_PROFILE_REQUIRED");
  }

  const paths = [
    buildPath(context, {
      keyFallback: "practical_service_path",
      name: primary.title,
      observed: `Your profile repeatedly points toward ${primary.summary.toLowerCase()} This is evidence to test, not a permanent label.`,
      interpretation:
        "This pattern may fit work where you turn an existing capability into a useful result for a specific person or group.",
      fit: primary.description,
      skills: [
        "Practical delivery",
        "Communication",
        "Feedback",
        "Reliability",
      ],
      test: "Choose one small problem connected to this direction, create the simplest useful response and show it to one or two trusted people for feedback.",
      evidence:
        "A useful sample, specific feedback and a clear note about what became easier or better would show whether this path deserves more practice.",
      refs: [primary.id, secondary.id],
    }),
    buildPath(context, {
      keyFallback: "strength_to_value_path",
      name: `${secondary.title} in Practice`,
      observed: `Your profile identifies ${secondary.summary.toLowerCase()} and also shows a preference for learning through real action.`,
      interpretation:
        "This may be worth testing as a capability that can support teaching, service, creative work, leadership or problem-solving depending on the setting.",
      fit: secondary.description,
      skills: [
        "Skill practice",
        "Clear explanation",
        "Quality improvement",
        "Self-review",
      ],
      test: "Create one concrete sample that uses this strength, ask a trusted person to use or review it, then improve one weak point they identify.",
      evidence:
        "Two versions of the work plus feedback showing a specific improvement would demonstrate growing capability more strongly than a self-rating alone.",
      refs: [secondary.id, primary.id],
    }),
    buildPath(context, {
      keyFallback: "interest_exploration_path",
      name: `${tertiary.title} Exploration`,
      observed: `Your answers show continuing interest around ${tertiary.summary.toLowerCase()} alongside evidence that you can learn by trying small real-world tasks.`,
      interpretation:
        "Interest alone does not prove a fit, but it is a strong enough signal to justify a low-risk experiment that tests enjoyment, capability and usefulness together.",
      fit: tertiary.description,
      skills: ["Research", "Practice", "Problem framing", "Reflection"],
      test: "Spend a short learning period on the basics, make one small output and test it with people already reachable through school, family, work or community channels.",
      evidence:
        "Record whether you enjoyed the work, which parts came naturally, where you struggled and whether another person found the output useful.",
      refs: [tertiary.id, primary.id],
    }),
  ];

  const refs = [...new Set(paths.flatMap((path) => path.profileEvidenceRefs))];
  const earning = [
    {
      key: "small_useful_service",
      title: "Turn One Strength Into a Small Useful Service",
      whatYouCouldOffer:
        "Use one capability from your profile to solve a narrow problem through a simple service, session, sample, design, explanation or practical task.",
      whoMayNeedIt: context.isMinor
        ? "A familiar student, family member, school group or trusted community contact who can be involved safely."
        : "A student, colleague, local organisation, small business or community group with a clear and reachable need.",
      learnFirst:
        "Learn the basic quality standard for the service, how to explain what you can do and how to receive feedback without overpromising.",
      firstExperiment:
        "Offer one small trial focused on usefulness rather than income, deliver it completely and ask what the person would keep, change or request next time.",
      evidenceOfImprovement:
        "A finished output, specific feedback, a second improved version or a repeat request would be stronger evidence than saying you are good at the skill.",
      profileEvidenceRefs: refs.slice(0, 3),
    },
    {
      key: "teach_or_explain",
      title: "Teach, Explain or Guide",
      whatYouCouldOffer:
        "Turn something you understand into a short explanation, tutoring session, guide, demonstration or structured help for somebody who is learning it.",
      whoMayNeedIt: context.isMinor
        ? "Younger students, classmates or family members through a parent, guardian, teacher or school-approved setting."
        : "Learners, peers, teams or customers who need a topic or process explained more clearly.",
      learnFirst:
        "Practise breaking ideas into steps, checking understanding and adapting your explanation when the first version does not work.",
      firstExperiment:
        "Help one familiar person understand a small topic or process, ask them to demonstrate what they learned and improve the explanation from their feedback.",
      evidenceOfImprovement:
        "The learner can complete the task or explain the idea back more clearly, and your revised explanation addresses what confused them initially.",
      profileEvidenceRefs: refs.slice(0, 2),
    },
    {
      key: "build_a_sample",
      title: "Build a Sample People Can Judge",
      whatYouCouldOffer:
        "Create a small portfolio piece, prototype, flyer, video, page, product sample, plan or other visible output connected to one possible path.",
      whoMayNeedIt:
        "A familiar person, school activity, community initiative or small organisation that can give honest feedback on whether the output is useful.",
      learnFirst:
        "Learn the minimum tools and quality criteria needed to make one complete example rather than collecting many disconnected tutorials.",
      firstExperiment:
        "Build one version with resources already available, show it to a trusted reviewer and revise it once based on a specific usefulness or quality problem.",
      evidenceOfImprovement:
        "Keep the first and improved versions, the feedback that caused the change and a short reflection on the capability you actually practised.",
      profileEvidenceRefs: refs.slice(0, 3),
    },
  ];

  return {
    schemaVersion: "economic-pathways-v1",
    possiblePaths: paths,
    earnFromStrengths: earning,
  };
}
