import { z } from "zod";
import { containsUnqualifiedClaim } from "@/shared/domain/safety-language";
import { cityInterests } from "@/modules/city/domain/city-inspiration";

export const buildTopics = cityInterests;
export const choiceSchema = z
  .object({
    topic: z.string().refine((v) => buildTopics.some((t) => t.id === v)),
    minutes: z.coerce.number().refine((v) => [15, 30, 60].includes(v)),
  })
  .strict();
export type BuildChoice = z.infer<typeof choiceSchema>;
const text = (min: number, max: number) => z.string().trim().min(min).max(max);
export const challengeSchema = z
  .object({
    title: text(5, 100),
    outcome: text(10, 300),
    steps: z.array(text(8, 220)).length(5),
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
  return value;
}
export function publicChallengeBrief(
  choice: BuildChoice,
  previousTitles: string[],
) {
  // Only catalogue values and previously public template titles. Never learner prose.
  const topic = buildTopics.find((t) => t.id === choice.topic)!;
  return {
    topic: topic.title,
    safeStartingIdea: topic.idea,
    minutes: choice.minutes,
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
  challenge: BuildChallenge;
  source: "openai";
  status: "active" | "recorded" | "archived";
  draft: BuildDraft;
  image_path: string | null;
  version: number;
  created_at: string;
  recorded_at: string | null;
};
