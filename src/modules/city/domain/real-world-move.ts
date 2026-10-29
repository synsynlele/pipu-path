import type { QuestLink } from "./continuation";

type ActionContext = {
  quest?: QuestLink | null;
  project?: { id: string; title: string; status: string } | null;
  destination: { path: string; label: string; description: string };
};
/** Account-authorised progress stays authoritative; playing never unlocks it. */
export function realWorldMove(state: ActionContext) {
  const quest = state.quest;
  if (
    quest &&
    ["available", "active", "evidence_submitted"].includes(quest.status)
  ) {
    return {
      href: `/quests/${encodeURIComponent(quest.id)}`,
      title: quest.title,
      label:
        quest.status === "evidence_submitted"
          ? "Reflect on my attempt"
          : quest.status === "available"
            ? "Start my real Quest"
            : "Continue my real Quest",
      detail:
        quest.status === "evidence_submitted"
          ? "Your proof is saved. Reflect on what happened."
          : "Try your next step in real life, then return with honest proof.",
    };
  }
  if (state.project?.status === "active")
    return {
      href: `/projects/${encodeURIComponent(state.project.id)}`,
      title: state.project.title,
      label: "Continue my Project",
      detail: "Improve the next part of something useful for people.",
    };
  return {
    href: state.destination.path,
    title: "Prepare my real-world Quest",
    label: state.destination.label,
    detail: state.destination.description,
  };
}
