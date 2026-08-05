import { z } from "zod";

export const questStatuses = [
  "locked",
  "available",
  "active",
  "evidence_submitted",
  "completed",
] as const;

const boundedText = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum);

export const generatedQuestSchema = z.object({
  title: boundedText(3, 100),
  real_world_outcome: boundedText(10, 400),
  why_it_matters: boundedText(10, 500),
  estimated_minutes: z.number().int().min(15).max(240),
  action_steps: z.array(boundedText(5, 240)).min(3).max(6),
  resources_needed: z.array(boundedText(2, 120)).max(6),
  low_resource_alternative: boundedText(10, 400),
  evidence_requirements: z.array(boundedText(5, 240)).min(1).max(4),
  safety_guidance: boundedText(8, 400),
  completion_criteria: boundedText(10, 400),
  reflection_prompts: z.array(boundedText(8, 240)).length(4),
  sequence_order: z.number().int().min(1).max(3),
});

export const questPackOutputSchema = z.object({
  quests: z.array(generatedQuestSchema).length(3),
});

export const questContextSchema = z.object({
  journeyId: z.uuid(),
  journeyTitle: boundedText(3, 100),
  journeyTargetOutcome: boundedText(10, 400),
  milestoneId: z.uuid(),
  milestoneTitle: boundedText(3, 160),
  milestonePurpose: boundedText(10, 800),
  milestoneExpectedOutcome: boundedText(8, 500),
  milestoneCompletionSignal: boundedText(8, 400),
  milestoneResourceNote: boundedText(3, 400),
  capabilitiesToDevelop: z.array(boundedText(2, 100)).min(1).max(6),
  ageBand: z.string().max(40),
  isMinor: z.boolean(),
  generalResourceConstraints: z.array(boundedText(3, 400)).max(8),
});

export const questEvidenceInputSchema = z.object({
  questId: z.uuid(),
  evidenceText: boundedText(20, 2000),
  evidenceLink: z
    .string()
    .trim()
    .url()
    .max(500)
    .refine((value) => /^https?:\/\//i.test(value), {
      message: "Evidence links must use http or https.",
    })
    .optional()
    .or(z.literal("")),
  happenedOn: z.iso.date(),
});

export const questReflectionInputSchema = z.object({
  questId: z.uuid(),
  whatIDid: boundedText(20, 1200),
  whatHappened: boundedText(20, 1200),
  whatILearned: boundedText(20, 1200),
  whatIWillChange: boundedText(20, 1200),
  nortnspoilReflection: boundedText(20, 1200),
});

export type QuestPackOutput = z.infer<typeof questPackOutputSchema>;
export type QuestContext = z.infer<typeof questContextSchema>;
export type QuestStatus = (typeof questStatuses)[number];

export type QuestErrorCode =
  | "QUEST_JOURNEY_REQUIRED"
  | "QUEST_MILESTONE_REQUIRED"
  | "QUEST_CONSENT_REQUIRED"
  | "QUEST_GENERATION_DISABLED"
  | "QUEST_REQUEST_ALREADY_RUNNING"
  | "QUEST_GENERATION_LIMIT_REACHED"
  | "QUEST_PROVIDER_UNAVAILABLE"
  | "QUEST_PROVIDER_TIMEOUT"
  | "QUEST_OUTPUT_INVALID"
  | "QUEST_OUTPUT_UNSAFE"
  | "QUEST_SAVE_FAILED"
  | "QUEST_NOT_FOUND"
  | "QUEST_NOT_AVAILABLE"
  | "QUEST_NOT_ACTIVE"
  | "QUEST_ANOTHER_ACTIVE"
  | "QUEST_EVIDENCE_INVALID"
  | "QUEST_EVIDENCE_REQUIRED"
  | "QUEST_REFLECTION_INVALID"
  | "QUEST_IMAGE_INVALID"
  | "QUEST_IMAGE_UPLOAD_FAILED"
  | "QUEST_ACCESS_DENIED";

const unsafeLanguage =
  /\b(contact strangers?|meet (?:an )?unknown adult|keep (?:this )?secret|share (?:your )?(?:home )?address|post (?:it )?publicly|borrow money|dangerous|illegal|weapon|gambl(?:e|ing))\b/i;
const purchaseLanguage =
  /\b(must|need to|required to)\s+(?:buy|purchase|pay for|spend money)\b/i;
const inflatedLanguage =
  /\b(guarantee success|go viral|millions of people|transform (?:the )?world|perfect result)\b/i;
const fabricatedEvidenceLanguage =
  /\b(fake evidence|invent (?:a )?result|pretend (?:you )?completed)\b/i;

export function validateQuestPackOutput(
  input: unknown,
):
  | { ok: true; value: QuestPackOutput }
  | { ok: false; code: "QUEST_OUTPUT_INVALID" | "QUEST_OUTPUT_UNSAFE" } {
  const parsed = questPackOutputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "QUEST_OUTPUT_INVALID" };

  const orders = parsed.data.quests.map((quest) => quest.sequence_order);
  if (!orders.every((order, index) => order === index + 1)) {
    return { ok: false, code: "QUEST_OUTPUT_INVALID" };
  }

  const titles = parsed.data.quests.map((quest) => quest.title.toLowerCase());
  if (new Set(titles).size !== titles.length) {
    return { ok: false, code: "QUEST_OUTPUT_INVALID" };
  }

  const text = JSON.stringify(parsed.data);
  if (
    unsafeLanguage.test(text) ||
    purchaseLanguage.test(text) ||
    inflatedLanguage.test(text) ||
    fabricatedEvidenceLanguage.test(text)
  ) {
    return { ok: false, code: "QUEST_OUTPUT_UNSAFE" };
  }

  return { ok: true, value: parsed.data };
}

export function validateQuestPackForContext(
  context: QuestContext,
  input: unknown,
):
  | { ok: true; value: QuestPackOutput }
  | { ok: false; code: "QUEST_OUTPUT_INVALID" | "QUEST_OUTPUT_UNSAFE" } {
  if (!questContextSchema.safeParse(context).success) {
    return { ok: false, code: "QUEST_OUTPUT_INVALID" };
  }
  return validateQuestPackOutput(input);
}

export function calculateQuestPackProgress(statuses: QuestStatus[]) {
  if (statuses.length === 0) return 0;
  return Math.round(
    (statuses.filter((status) => status === "completed").length /
      statuses.length) *
      100,
  );
}
