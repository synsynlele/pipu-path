export const profileGenerationContexts = ["initial", "evolution"] as const;

export type ProfileGenerationContext =
  (typeof profileGenerationContexts)[number];

export const profileEvolutionEvidenceSourceKeys = [
  "completed_builder_project",
  "profile_feedback",
] as const;

export type ProfileEvolutionEvidenceSourceKey =
  (typeof profileEvolutionEvidenceSourceKeys)[number];

export function promptVersionForProfileContext(
  context: ProfileGenerationContext,
) {
  return context === "evolution"
    ? "hpi-openai-v2-builder-evidence"
    : "hpi-openai-v1";
}

export function summarizeProfileEvolutionEvidence(sourceKeys: string[]) {
  let completedProjects = 0;
  let profileFeedback = 0;

  for (const sourceKey of sourceKeys) {
    if (sourceKey === "completed_builder_project") completedProjects += 1;
    if (sourceKey === "profile_feedback") profileFeedback += 1;
  }

  return {
    completedProjects,
    profileFeedback,
    total: completedProjects + profileFeedback,
    ready: completedProjects + profileFeedback > 0,
  };
}
