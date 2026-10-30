import { z } from "zod";
import { discoverySchema, discoveryBrief } from "./discovery";
import { containsUnqualifiedClaim } from "@/shared/domain/safety-language";
import { cityInterests } from "@/modules/city/domain/city-inspiration";

export const buildTopics = cityInterests;
export const REAL_BUILD_CONTENT_VERSION = "solution-recipes-v5";
export const focusSchema = z
  .string()
  .trim()
  .min(12, "Tell us what you want to improve in at least a few words.")
  .max(160, "Keep the improvement goal under 160 characters.")
  .refine(
    (value) =>
      !/(?:https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b\+?\d[\d\s-]{8,}\d\b|\b(?:password|phone number|home address|medical history|diagnosis|medication|self-harm|sexual activity)\b)/i.test(
        value,
      ),
    "Keep this about a general problem. Do not enter names, contacts or private details.",
  );

export const choiceSchema = z
  .object({
    topic: z.string().refine((v) => buildTopics.some((t) => t.id === v)),
    minutes: z.coerce.number().refine((v) => [15, 30, 60].includes(v)),
    focus: focusSchema,
    discovery: discoverySchema.optional(),
  })
  .strict();
export type BuildChoice = z.infer<typeof choiceSchema>;

export const difficultySchema = z.number().int().min(1).max(5);
export type BuildDifficulty = 1 | 2 | 3 | 4 | 5;

// Task complexity, not a score for the person. All levels remain low-cost and safe.
export const difficultyGuides = {
  1: {
    label: "First Challenge",
    design:
      "Find a real need, put a small safe useful change into operation, test it with someone or a real routine and record an observable result.",
  },
  2: {
    label: "Explorer",
    design:
      "Put a usable improvement into action, compare its result with the previous routine and adjust it.",
  },
  3: {
    label: "Builder",
    design:
      "Deliver a working improvement with two constraints, test it twice, measure what changed and revise.",
  },
  4: {
    label: "Problem Solver",
    design:
      "Implement a useful change serving two real needs, test the trade-off and improve it after feedback.",
  },
  5: {
    label: "Systems Thinker",
    design:
      "Improve one working part of a small real process. Test its result, identify a bottleneck and refine it.",
  },
} as const satisfies Record<BuildDifficulty, { label: string; design: string }>;

export function difficultyLabel(level: number) {
  return difficultyGuides[level as BuildDifficulty]?.label ?? "Starter";
}

const text = (min: number, max: number) => z.string().trim().min(min).max(max);
export const challengeSchema = z
  .object({
    title: text(5, 100),
    outcome: text(10, 300),
    steps: z.array(text(8, 700)).length(5),
    materials: z.array(text(2, 80)).max(5),
    evidence: text(10, 300),
    safety: text(10, 300),
  })
  .strict();
export type BuildChallenge = z.infer<typeof challengeSchema>;
export const draftSchema = z
  .object({
    evidence: z.string().trim().max(3000),
    link: z.union([
      z.literal(""),
      z
        .url()
        .max(1200)
        .refine((v) => /^https?:\/\//i.test(v)),
    ]),
    reflection: z.string().trim().max(2000),
    nextChange: z.string().trim().max(1000),
    outcome: z.enum(["", "worked", "partly", "not_yet"]),
  })
  .strict();
export type BuildDraft = z.infer<typeof draftSchema>;
export const emptyDraft: BuildDraft = {
  evidence: "",
  link: "",
  reflection: "",
  nextChange: "",
  outcome: "",
};
export function canRecordAttempt(draft: BuildDraft) {
  return (
    draft.evidence.length >= 20 &&
    draft.reflection.length >= 10 &&
    draft.nextChange.length >= 10 &&
    draft.outcome !== ""
  );
}
// New Quests must change something in real life, not merely propose it.
// Match paperwork tasks, not phone gestures ("slide") or incidental useful materials.
const planOnly =
  /\b(?:worksheet|slideshow|role[- ]?play|fictional|simulation|simulate|mock[- ]?up|pretend|written plan)\b|\b(?:paper|cardboard)\s+(?:model|prototype|tracker|project|tower|bridge|plan|poster)\b|\b(?:draw|drawing|sketch|sketching)\s+(?:(?:a|an|the|your|simple|small|rough)\s+){0,3}(?:plan|diagram|poster|picture|solution|idea|design)\b|\b(?:make|create|prepare|design)\s+(?:(?:a|an|the|your|simple|small|short)\s+){0,3}(?:poster|diagram|presentation|slides|paper|cardboard)\b/i;
const practicalAction =
  /\b(?:build|set up|reorganis(?:e|ing)|reorganiz(?:e|ing)|organis(?:e|ing)|organiz(?:e|ing)|repair|fix|reuse|repurpose|run|deliver|plant|install|start|update|make|assemble|improve|change|label|sort|configure|create|teach|coach|launch|clean|collect|introduce|serve|put|arrange|implement|enable|activate|switch|turn on|place|position|add|move|schedule|connect|fit|secure|apply|wash|fill|remove|offer|share|invite|send|prepare|cook|bake|host|pair|pack|distribute|harvest|water|sew|stitch|weave|refill|weigh|demonstrate|guide|toggle)\b/i;
export class BuildPracticalityError extends Error {
  constructor(
    readonly rule: "PAPER_ONLY" | "NO_IMPLEMENTATION" | "NO_REAL_TEST",
    readonly field?: "title" | "steps.2",
  ) {
    super("BUILD_NOT_PRACTICAL");
  }
}
const realTest =
  /\b(?:test|try|measure|check|compare|observe|count|use|feedback|verify|trial|pilot|evaluate|assess|track|monitor)\b/i;
function paperworkField(
  value: BuildChallenge,
): "title" | "steps.2" | undefined {
  const fields = [
    ["title", value.title],
    ["steps.2", value.steps[2]],
  ] as const;
  for (const [field, item] of fields) {
    if (
      containsUnqualifiedClaim(
        item.replace(
          /\b(?:rather than|instead of|no need for|no)\s+/gi,
          "without ",
        ),
        planOnly,
      )
    )
      return field;
  }
  return undefined;
}
export function isRetiredPaperworkChallenge(input: unknown): boolean {
  const parsed = challengeSchema.safeParse(input);
  // Judge the assigned build, not discovery examples, materials, or later cautions.
  return parsed.success && Boolean(paperworkField(parsed.data));
}
const prohibited =
  /\b(contact strangers?|meet (?:an )?unknown adult|keep (?:this )?secret|share (?:your )?(?:home )?address|post (?:it )?publicly|borrow money|weapon|gambl(?:e|ing)|fake evidence|invent (?:a )?result|guaranteed income|handle live wires?|enter (?:a )?drain|prescribe|take medication)\b/i;
const hazardous =
  /\b(?:repair|touch|open|rewire|connect)\s+(?:(?:a|an|the|live|electrical)\s+){0,3}(?:socket|mains|wire|wiring|circuit)|\b(?:enter|stand in|walk into)\s+(?:the\s+)?(?:traffic|roadway|construction site)|\b(?:use|operate)\s+(?:a\s+)?(?:power tool|saw|flame)/i;
export function validateChallenge(input: unknown): BuildChallenge {
  const value = challengeSchema.parse(input);
  for (const field of [
    value.title,
    value.outcome,
    ...value.steps,
    ...value.materials,
    value.evidence,
    value.safety,
  ]) {
    if (
      containsUnqualifiedClaim(field, prohibited) ||
      containsUnqualifiedClaim(field, hazardous)
    )
      throw new Error("BUILD_UNSAFE");
  }
  const paperField = paperworkField(value);
  if (paperField) throw new BuildPracticalityError("PAPER_ONLY", paperField);
  if (!value.steps.slice(1, 4).some((step) => practicalAction.test(step)))
    throw new BuildPracticalityError("NO_IMPLEMENTATION");
  if (!value.steps.slice(2).some((step) => realTest.test(step)))
    throw new BuildPracticalityError("NO_REAL_TEST");
  return value;
}
export function publicChallengeBrief(
  choice: BuildChoice,
  previousTitles: string[],
  difficulty: BuildDifficulty = 1,
) {
  // Only the disclosed goal, validated discovery options and public catalogue data.
  const topic = buildTopics.find((t) => t.id === choice.topic)!;
  return {
    topic: topic.title,
    improvementGoal: choice.focus,
    ...(choice.discovery
      ? { discovery: discoveryBrief(choice.discovery) }
      : {}),
    safeStartingIdea: topic.idea,
    minutes: choice.minutes,
    difficulty,
    challengeDesign: difficultyGuides[difficulty].design,
    avoidTitles: previousTitles.slice(-30),
  };
}
export type SavedBuild = {
  id: string;
  user_id: string;
  template_id: string;
  previous_attempt_id: string | null;
  topic: string;
  minutes: number;
  difficulty: BuildDifficulty;
  focus: string;
  challenge: BuildChallenge;
  source: "openai" | "reviewed";
  status: "active" | "recorded" | "archived";
  draft: BuildDraft;
  image_path: string | null;
  version: number;
  created_at: string;
  recorded_at: string | null;
};
