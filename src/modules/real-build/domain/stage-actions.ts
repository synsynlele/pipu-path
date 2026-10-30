// Older saved Quests contain one paragraph; new recipes contain numbered actions.
export function stageActions(step: string): string[] {
  return step
    .split(/\n+/)
    .map((line) => line.replace(/^\s*(?:\d+[.)]|[-•])\s*/, "").trim())
    .filter(Boolean);
}
export function hasCompleteBuildRecipe(steps: string[]): boolean {
  return (
    steps.length === 5 &&
    steps.every((step) => {
      const actions = stageActions(step);
      return (
        actions.length >= 2 &&
        actions.length <= 4 &&
        actions.every((action) => action.length >= 12)
      );
    })
  );
}
