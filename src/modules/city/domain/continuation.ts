export type QuestLink = {
  id: string;
  title: string;
  status: string;
};

export function cityContinuation(quest: QuestLink | null) {
  if (!quest || quest.status === "locked") {
    return {
      playHref: "/build/play",
      actionHref: "/quests",
      actionLabel: "Find my real-world Quest →",
      focus: "play" as const,
    };
  }
  return {
    playHref: `/build/play?quest=${encodeURIComponent(quest.id)}`,
    actionHref: `/quests/${encodeURIComponent(quest.id)}`,
    actionLabel:
      quest.status === "evidence_submitted"
        ? "Reflect on my real attempt →"
        : quest.status === "completed"
          ? "See my real-world progress →"
          : "Continue my real-world Quest →",
    focus:
      quest.status === "evidence_submitted" || quest.status === "completed"
        ? ("real" as const)
        : ("play" as const),
  };
}
