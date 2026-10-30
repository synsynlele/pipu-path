import { z } from "zod";

export const questKinds = {
  habit: "Build a solution to a habit problem",
  community: "Help people around me",
  make: "Build something useful",
} as const;
export const questSettings = {
  personal: "My own routine",
  home: "At home",
  school: "School or work",
  neighbourhood: "My neighbourhood",
} as const;
export const questResources = {
  phone: "An existing phone or computer",
  everyday: "Everyday items I already have",
  support: "Help from someone I trust",
  none: "No tools — start with an action",
} as const;
export const questObstacles = {
  habit: {
    automatic: "I do it without noticing",
    inconsistent: "I struggle to keep a change going",
    unsure: "I do not know what to change first",
  },
  community: {
    recurring: "The same problem keeps returning",
    coordination: "People struggle to work together",
    unsure: "I need a safe place to start",
  },
  make: {
    starting: "I have an idea but have not tried it",
    unreliable: "Something exists but does not work well",
    unsure: "I need to find a useful first build",
  },
} as const;
export type QuestKind = keyof typeof questKinds;
export const discoverySchema = z
  .object({
    kind: z.enum(["habit", "community", "make"]),
    setting: z.enum(["personal", "home", "school", "neighbourhood"]),
    obstacle: z.enum([
      "automatic",
      "inconsistent",
      "unsure",
      "recurring",
      "coordination",
      "starting",
      "unreliable",
    ]),
    resources: z.enum(["phone", "everyday", "support", "none"]),
  })
  .strict()
  .refine(
    (value) => Object.hasOwn(questObstacles[value.kind], value.obstacle),
    {
      message: "Choose a starting point for this kind of Quest.",
      path: ["obstacle"],
    },
  );
export type QuestDiscovery = z.infer<typeof discoverySchema>;
export function discoveryBrief(input: QuestDiscovery) {
  const value = discoverySchema.parse(input);
  return {
    kind: questKinds[value.kind],
    setting: questSettings[value.setting],
    obstacle: (questObstacles[value.kind] as Record<string, string>)[
      value.obstacle
    ],
    resources: questResources[value.resources],
  };
}
