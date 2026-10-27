import { gameChapters } from "./chapters";
import { parsePracticeCheckpoint, practiceStorageKey } from "./practice-checkpoint";
import { parseNeighbourhood } from "./neighbourhood";

export type PathMissionState = "done" | "current" | "locked";
export type PathMission = {
  id: string;
  title: string;
  state: PathMissionState;
  href: string | null;
};
export type PathWorld = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  missions: PathMission[];
  completed: number;
  hasProgress: boolean;
  savedAt: number;
};

const neighbourhoodMissions = [
  { id: "ada", title: "Show the way" },
  { id: "timi", title: "Build a stall" },
  { id: "mama", title: "Make a delivery" },
] as const;

/**
 * Project a path from genuine device-only practice saves. An inaccessible
 * later mission is an interface guide, never a false XP or server unlock.
 * Worlds remain independently playable even if earlier worlds were skipped.
 */
export function projectAdventureMap(
  userId: string,
  read: (key: string) => string | null,
  cityHref = "/build/play",
): PathWorld[] {
  let neighbourhood = null;
  try {
    neighbourhood = parseNeighbourhood(
      read(`pipupath.neighbourhood.v1:${userId}`),
    );
  } catch {
    // Disabled storage cannot block discovery or practice.
  }
  const doneNeighbourhood = neighbourhood?.completed.length ?? 0;

  const result: PathWorld[] = [
    {
      id: "neighbourhood",
      title: "Your Neighbourhood",
      eyebrow: "World 01 · Your first steps",
      description: "Move your character, meet neighbours, then build together.",
      href: "/build/neighbourhood",
      missions: neighbourhoodMissions.map(({ id, title }, index) => ({
        id,
        title,
        state:
          index < doneNeighbourhood
            ? "done"
            : index === doneNeighbourhood
              ? "current"
              : "locked",
        href: index === doneNeighbourhood ? "/build/neighbourhood" : null,
      })),
      completed: doneNeighbourhood,
      hasProgress: doneNeighbourhood > 0,
      savedAt: 0,
    },
    {
      id: "city",
      title: "The Unbuilt City",
      eyebrow: "World 02 · Build belonging",
      description: "Turn an empty city square into a place people love.",
      href: cityHref,
      missions: [
        {
          id: "market",
          title: "Build the city",
          state: "current",
          href: cityHref,
        },
      ],
      completed: 0,
      hasProgress: false,
      savedAt: 0,
    },
  ];

  // Night-market game has its own seven-stage runner, but currently provides
  // no validated persisted scene completion; never invent completed steps.
  const chapters = gameChapters.filter(
    (chapter) => chapter.id !== "unbuilt-city-night-market-v1",
  );
  for (const [index, chapter] of chapters.entries()) {
    let saved = null;
    try {
      saved = parsePracticeCheckpoint(
        read(practiceStorageKey(userId, chapter.id)),
        chapter,
      );
    } catch {
      // Reading a save is optional and must not block navigation.
    }
    const completed = saved?.sceneIndex ?? 0;
    const href = `/build/play/${chapter.id}`;
    result.push({
      id: chapter.id,
      title: chapter.title,
      eyebrow: `World ${String(index + 3).padStart(2, "0")} · Practice & solve`,
      description: chapter.description,
      href,
      missions: chapter.scenarios.map((scenario, sceneIndex) => ({
        id: scenario.id,
        title: scenario.label,
        state:
          sceneIndex < completed
            ? "done"
            : sceneIndex === completed
              ? "current"
              : "locked",
        href: sceneIndex === completed ? href : null,
      })),
      completed,
      hasProgress: completed > 0 || Boolean(saved?.selected.length) || Boolean(saved?.twistActive),
      savedAt: saved?.updatedAt ?? 0,
    });
  }
  return result;
}

/** Choose a saved active world before inviting a first-time player to start. */
export function recommendedPathWorld(worlds: readonly PathWorld[]): string {
  let candidate = worlds[0]?.id ?? "";
  let latest = 0;
  for (const world of worlds) {
    if (world.savedAt > latest && world.hasProgress) {
      candidate = world.id;
      latest = world.savedAt;
    }
  }
  if (latest === 0 && (worlds[0]?.hasProgress ?? false)) return worlds[0].id;
  return candidate;
}
