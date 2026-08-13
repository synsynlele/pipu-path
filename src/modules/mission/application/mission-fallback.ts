import type {
  MissionOutput,
  MissionProfileContext,
} from "../domain/mission-contract";

function shorten(value: string, maximum: number) {
  const trimmed = value.trim();
  if (trimmed.length <= maximum) return trimmed;
  return `${trimmed.slice(0, maximum - 1).trimEnd()}.`;
}

function preferredEvidenceRefs(context: MissionProfileContext) {
  if (context.selectedPath?.profileEvidenceRefs.length) {
    return [...new Set(context.selectedPath.profileEvidenceRefs)];
  }
  const preferredSections = [
    "best_next_direction",
    "how_you_can_contribute",
    "problems_you_care_about",
    "what_draws_you",
    "emerging_strengths",
    "current_constraints",
  ] as const;
  const refs = preferredSections.flatMap((key) =>
    context.sections
      .filter((section) => section.key === key)
      .flatMap((section) => section.insights.map((insight) => insight.id)),
  );
  return [...new Set(refs)];
}

export function buildEvidenceBasedMission(input: {
  context: MissionProfileContext;
  currentMission?: MissionOutput;
}): MissionOutput {
  if (input.currentMission) {
    return {
      ...input.currentMission,
      current_caution:
        "Keep the scope small, use resources already available and confirm the next step through real feedback.",
    };
  }

  const evidenceRefs = preferredEvidenceRefs(input.context);
  if (evidenceRefs.length < 2) throw new Error("MISSION_PROFILE_REQUIRED");

  if (input.context.selectedPath) {
    const path = input.context.selectedPath;
    return {
      title: shorten(`Test ${path.pathName} Through Real Value`, 100),
      mission_statement: shorten(
        `Use the next four weeks to test ${path.pathName} by learning enough to create one useful result for a reachable person or group and collecting evidence about the fit.`,
        320,
      ),
      why_this_fits: shorten(
        `${path.observedPattern} ${path.possibleInterpretation} ${path.whyItFits} This mission tests that interpretation through action instead of treating it as a permanent conclusion.`,
        1000,
      ),
      who_this_helps: input.context.isMinor
        ? "One familiar person or small school, family or community group reached through a trusted adult"
        : "One reachable person, team, small organisation or community group with a clear need",
      first_meaningful_outcome: shorten(path.howToTest, 400),
      time_horizon: "four_weeks",
      success_signal: shorten(path.evidenceNeeded, 400),
      current_caution: input.context.isMinor
        ? "Keep the test supervised, use people you already know through trusted channels and focus on learning and usefulness before any payment."
        : "Create value first, keep the first offer or output small and use evidence of usefulness before expanding the scope or charging more.",
      profile_evidence_refs: evidenceRefs.slice(0, 6),
    };
  }

  return {
    title: "Test One Useful Improvement",
    mission_statement:
      "Use the next four weeks to turn one profile direction into a small, useful experiment for a reachable person or group.",
    why_this_fits:
      "Your profile points toward practical contribution, learning through action and building evidence before expanding the scope. This mission converts those patterns into one manageable next step.",
    who_this_helps:
      "One reachable person or small group connected to a problem you care about",
    first_meaningful_outcome:
      "Complete one small guide, session, prototype or improvement and collect feedback from at least one intended user.",
    time_horizon: "four_weeks",
    success_signal:
      "The intended user tries the improvement and gives specific feedback about what was useful and what should change.",
    current_caution:
      "Start with the smallest workable version and avoid adding cost, complexity or a wider audience before the first test.",
    profile_evidence_refs: evidenceRefs.slice(0, 4),
  };
}
