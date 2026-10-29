import { cityContinuation, type QuestLink } from "./continuation";

export type TrailStepState =
  "practice" | "ready" | "current" | "next" | "saved" | "waiting";

export type TrailStep = {
  id: "play" | "act" | "prove" | "grow";
  label: string;
  hint: string;
  state: TrailStepState;
  href: string | null;
};

/**
 * This map is a projection of the authoritative Quest status, not a
 * second progress tracker. In-screen practice is never marked complete.
 */
export function adventureTrail(quest: QuestLink | null): TrailStep[] {
  const current = quest?.status !== "locked" ? quest : null;
  const next = cityContinuation(current);

  if (!current) {
    return [
      {
        id: "play",
        label: "Explore",
        hint: "Practice in the city",
        state: "current",
        href: next.playHref,
      },
      {
        id: "act",
        label: "Act",
        hint: "Choose a real Quest",
        state: "ready",
        href: next.actionHref,
      },
      {
        id: "prove",
        label: "Prove",
        hint: "After you take action",
        state: "waiting",
        href: null,
      },
      {
        id: "grow",
        label: "Grow",
        hint: "Reflect and improve",
        state: "waiting",
        href: null,
      },
    ];
  }

  const proven =
    current.status === "evidence_submitted" || current.status === "completed";
  const finished = current.status === "completed";
  const started = current.status === "active";

  return [
    {
      id: "play",
      label: "Explore",
      hint: "City practice, optional",
      state: "practice",
      href: next.playHref,
    },
    {
      id: "act",
      label: "Act",
      hint: proven
        ? "Real attempt recorded"
        : started
          ? "Try it in real life"
          : "Start your Quest",
      state: proven ? "saved" : started ? "current" : "ready",
      href: next.actionHref,
    },
    {
      id: "prove",
      label: "Prove",
      hint: proven
        ? "Evidence saved"
        : started
          ? "Bring back proof"
          : "After your action",
      state: proven ? "saved" : started ? "next" : "waiting",
      href: proven || started ? next.actionHref : null,
    },
    {
      id: "grow",
      label: "Grow",
      hint: finished
        ? "Reflection complete"
        : proven
          ? "Reflect to progress"
          : "After your proof",
      state: finished ? "saved" : proven ? "current" : "waiting",
      href: proven ? next.actionHref : null,
    },
  ];
}
