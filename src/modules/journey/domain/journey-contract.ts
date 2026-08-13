import { z } from "zod";
import { possiblePathSchema } from "@/modules/economic-pathways/domain/economic-pathway-contract";

export const journeyDurations = [
  "two_weeks",
  "four_weeks",
  "six_weeks",
  "eight_weeks",
  "twelve_weeks",
] as const;
export const journeyGenerationKinds = [
  "initial",
  "regenerate",
  "refine",
  "continue",
] as const;

export const journeyMilestoneSchema = z.object({
  title: z.string().trim().min(3).max(100),
  purpose: z.string().trim().min(10).max(500),
  expected_outcome: z.string().trim().min(8).max(400),
  suggested_duration: z.string().trim().min(3).max(80),
  capabilities_to_develop: z
    .array(z.string().trim().min(2).max(80))
    .min(1)
    .max(6),
  completion_signal: z.string().trim().min(8).max(320),
  resource_note: z.string().trim().min(3).max(320),
  sequence_order: z.number().int().min(1).max(6),
});

export const journeyOutputSchema = z.object({
  title: z.string().trim().min(3).max(100),
  summary: z.string().trim().min(20).max(800),
  target_outcome: z.string().trim().min(10).max(400),
  suggested_duration: z.enum(journeyDurations),
  milestones: z.array(journeyMilestoneSchema).min(4).max(6),
});

export const journeyContextSchema = z.object({
  missionId: z.uuid(),
  title: z.string().min(3).max(100),
  missionStatement: z.string().min(12).max(320),
  whoThisHelps: z.string().min(3).max(200),
  firstMeaningfulOutcome: z.string().min(10).max(400),
  successSignal: z.string().min(8).max(400),
  currentCaution: z.string().min(8).max(400),
  ageBand: z.string().max(40),
  isMinor: z.boolean(),
  generalResourceConstraints: z.array(z.string().max(320)).max(8),
  selectedPath: possiblePathSchema.nullable().optional(),
});

export const refinementInstructionSchema = z.string().trim().min(3).max(240);
export type JourneyOutput = z.infer<typeof journeyOutputSchema>;
export type JourneyContext = z.infer<typeof journeyContextSchema>;

export type JourneyErrorCode =
  | "JOURNEY_MISSION_REQUIRED"
  | "JOURNEY_PROFILE_REQUIRED"
  | "JOURNEY_CONSENT_REQUIRED"
  | "JOURNEY_GENERATION_DISABLED"
  | "JOURNEY_REQUEST_ALREADY_RUNNING"
  | "JOURNEY_GENERATION_LIMIT_REACHED"
  | "JOURNEY_PROJECT_REQUIRED"
  | "JOURNEY_PROVIDER_UNAVAILABLE"
  | "JOURNEY_PROVIDER_TIMEOUT"
  | "JOURNEY_OUTPUT_INVALID"
  | "JOURNEY_OUTPUT_UNSAFE"
  | "JOURNEY_SAVE_FAILED"
  | "JOURNEY_NOT_FOUND"
  | "JOURNEY_ACCESS_DENIED";

const unsafe =
  /\b(meet (?:an )?unknown adult|contact strangers?|keep (?:this )?secret|borrow money|dangerous|illegal)\b/i;
const inflated =
  /\b(transform (?:the )?(?:world|africa)|millions of people|guarantee success|perfect path|get rich|guaranteed income|quick money)\b/i;
const questLanguage = /\b(day [1-9]|daily task|earn xp|quest [1-9])\b/i;
const economicPhases = ["learn", "practice", "build", "test"] as const;

export function validateJourneyOutput(
  input: unknown,
):
  | { ok: true; value: JourneyOutput }
  | { ok: false; code: "JOURNEY_OUTPUT_INVALID" | "JOURNEY_OUTPUT_UNSAFE" } {
  const parsed = journeyOutputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "JOURNEY_OUTPUT_INVALID" };
  const orders = parsed.data.milestones.map(
    (milestone) => milestone.sequence_order,
  );
  if (!orders.every((order, index) => order === index + 1))
    return { ok: false, code: "JOURNEY_OUTPUT_INVALID" };
  const titles = parsed.data.milestones.map((milestone) =>
    milestone.title.toLowerCase(),
  );
  if (new Set(titles).size !== titles.length)
    return { ok: false, code: "JOURNEY_OUTPUT_INVALID" };
  const text = JSON.stringify(parsed.data);
  if (unsafe.test(text) || inflated.test(text) || questLanguage.test(text))
    return { ok: false, code: "JOURNEY_OUTPUT_UNSAFE" };
  return { ok: true, value: parsed.data };
}

export function validateJourneyForContext(
  context: JourneyContext,
  input: unknown,
):
  | { ok: true; value: JourneyOutput }
  | { ok: false; code: "JOURNEY_OUTPUT_INVALID" | "JOURNEY_OUTPUT_UNSAFE" } {
  if (!journeyContextSchema.safeParse(context).success) {
    return { ok: false, code: "JOURNEY_OUTPUT_INVALID" };
  }
  const validated = validateJourneyOutput(input);
  if (!validated.ok) return validated;

  if (context.selectedPath) {
    if (
      validated.value.suggested_duration !== "four_weeks" ||
      validated.value.milestones.length !== 4
    ) {
      return { ok: false, code: "JOURNEY_OUTPUT_INVALID" };
    }
    const phasesMatch = validated.value.milestones.every((milestone, index) => {
      const title = milestone.title.toLowerCase();
      return (
        title.includes(`week ${index + 1}`) &&
        title.includes(economicPhases[index])
      );
    });
    if (!phasesMatch) return { ok: false, code: "JOURNEY_OUTPUT_INVALID" };
  }

  return validated;
}

export function calculateJourneyProgress(
  statuses: Array<"locked" | "available" | "active" | "completed">,
) {
  if (statuses.length === 0) return 0;
  return Math.round(
    (statuses.filter((status) => status === "completed").length /
      statuses.length) *
      100,
  );
}
