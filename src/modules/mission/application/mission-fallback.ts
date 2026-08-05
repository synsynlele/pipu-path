import type {
  MissionOutput,
  MissionProfileContext,
} from "../domain/mission-contract";

function preferredEvidenceRefs(context: MissionProfileContext) {
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
