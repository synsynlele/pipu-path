import "server-only";

import { requireGeminiEnvironment } from "@/lib/config/env";
import { createLogger } from "@/lib/observability/logger";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  validateQuestPackForContext,
  type QuestErrorCode,
} from "../domain/quest-contract";
import { GeminiQuestProvider } from "../infrastructure/gemini-quest-provider";
import {
  createQuestServerClient,
  createQuestServiceClient,
} from "../infrastructure/quest-client";
import {
  getCurrentQuestState,
  getQuestContext,
} from "../infrastructure/quest-dal";
import { buildEvidenceBasedQuestPack } from "./quest-fallback";

const logger = createLogger();

const messages: Record<QuestErrorCode, string> = {
  QUEST_JOURNEY_REQUIRED: "Accept a Builder Journey before opening Quests.",
  QUEST_MILESTONE_REQUIRED:
    "Your Journey needs an available milestone before Quests can be created.",
  QUEST_CONSENT_REQUIRED:
    "Quest generation requires current AI processing consent.",
  QUEST_GENERATION_DISABLED:
    "This milestone already has its private Quest pack.",
  QUEST_REQUEST_ALREADY_RUNNING:
    "Your Quests are already being shaped. Please wait and refresh.",
  QUEST_GENERATION_LIMIT_REACHED:
    "You have used the three safe generation attempts for this milestone.",
  QUEST_PROVIDER_UNAVAILABLE:
    "Quest generation is temporarily unavailable. Please try again.",
  QUEST_PROVIDER_TIMEOUT:
    "Quest generation took too long. Please try again safely.",
  QUEST_OUTPUT_INVALID:
    "PipuPath could not safely shape those Quests. Please try again.",
  QUEST_OUTPUT_UNSAFE:
    "Those Quests did not meet PipuPath's safety rules. Please try again.",
  QUEST_SAVE_FAILED: "Your Quests could not be saved. Please try again.",
  QUEST_NOT_FOUND: "That Quest is no longer available.",
  QUEST_NOT_AVAILABLE: "That Quest is not ready to start yet.",
  QUEST_NOT_ACTIVE: "Start the Quest before submitting evidence.",
  QUEST_ANOTHER_ACTIVE:
    "Finish your current active Quest before starting another.",
  QUEST_EVIDENCE_INVALID: "Please provide clear, valid evidence.",
  QUEST_EVIDENCE_REQUIRED: "Submit evidence before completing reflection.",
  QUEST_REFLECTION_INVALID:
    "Please complete every reflection with enough detail.",
  QUEST_IMAGE_INVALID:
    "Use one JPG, PNG or WebP image no larger than five megabytes.",
  QUEST_IMAGE_UPLOAD_FAILED:
    "Your evidence image could not be uploaded. Please try again.",
  QUEST_ACCESS_DENIED: "You cannot access that Quest.",
};

type Result =
  | { ok: true; firstQuestId: string }
  | { ok: false; code: QuestErrorCode; message: string };

const fail = (code: QuestErrorCode): Result => ({
  ok: false,
  code,
  message: messages[code],
});

function extractCode(error: unknown): QuestErrorCode {
  const match = (error instanceof Error ? error.message : String(error)).match(
    /QUEST_[A-Z_]+/,
  )?.[0] as QuestErrorCode | undefined;
  return match && match in messages ? match : "QUEST_GENERATION_DISABLED";
}

function safeProviderFailure(error: unknown) {
  if (!(error instanceof Error)) return null;
  return /^GEMINI_(?:HTTP_\d{3}|EMPTY_RESPONSE|INVALID_JSON|TIMEOUT)$/.test(
    error.message,
  )
    ? error.message
    : null;
}

export async function generateCurrentQuestPack(): Promise<Result> {
  await requireAuthenticatedIdentity();
  const context = await getQuestContext();
  if (!context) return fail("QUEST_MILESTONE_REQUIRED");

  let model = "evidence-fallback-v1";
  let geminiAvailable = true;
  try {
    ({ model } = requireGeminiEnvironment());
  } catch {
    geminiAvailable = false;
  }

  const current = await getCurrentQuestState(context.milestoneId);
  if (current.quests.length > 0) return fail("QUEST_GENERATION_DISABLED");

  const browser = await createQuestServerClient();
  const { data: requestId, error: createError } = await browser.rpc(
    "create_stage7_quest_request",
    {
      milestone_id_input: context.milestoneId,
      prompt_version_input: "quest-gemini-v1",
    },
  );

  if (createError || !requestId) return fail(extractCode(createError));

  const service = createQuestServiceClient();
  const { data: claimed, error: claimError } = await service.rpc(
    "claim_stage7_quest_request",
    {
      request_id_input: requestId,
      provider_input: geminiAvailable ? "google_gemini" : "evidence_fallback",
      model_input: model,
    },
  );

  if (claimError || !claimed) return fail("QUEST_REQUEST_ALREADY_RUNNING");

  try {
    let generationMode: "gemini" | "evidence_fallback" = "gemini";
    let fallbackReason: string | null = null;
    let output: unknown;

    if (geminiAvailable) {
      try {
        output = await new GeminiQuestProvider().generate({ context });
      } catch (error) {
        generationMode = "evidence_fallback";
        fallbackReason =
          safeProviderFailure(error) ?? "GEMINI_PROVIDER_FAILURE";
        output = buildEvidenceBasedQuestPack(context);
      }
    } else {
      generationMode = "evidence_fallback";
      fallbackReason = "GEMINI_ENVIRONMENT_UNAVAILABLE";
      output = buildEvidenceBasedQuestPack(context);
    }

    let validated = validateQuestPackForContext(context, output);
    if (!validated.ok) {
      generationMode = "evidence_fallback";
      fallbackReason = validated.code;
      output = buildEvidenceBasedQuestPack(context);
      validated = validateQuestPackForContext(context, output);
    }
    if (!validated.ok) throw new Error(validated.code);

    const { data: firstQuestId, error: saveError } = await service.rpc(
      "persist_stage7_quest_pack",
      {
        request_id_input: requestId,
        quest_pack_input: validated.value,
      },
    );

    if (saveError || !firstQuestId) throw new Error("QUEST_SAVE_FAILED");

    logger.info("quest_pack_generation_completed", {
      requestId,
      firstQuestId,
      milestoneId: context.milestoneId,
      generationMode,
      fallbackReason,
    });

    return { ok: true, firstQuestId };
  } catch (error) {
    const raw = error instanceof Error ? error.message : "";
    const code: QuestErrorCode =
      raw === "GEMINI_TIMEOUT"
        ? "QUEST_PROVIDER_TIMEOUT"
        : /^GEMINI_/.test(raw)
          ? "QUEST_PROVIDER_UNAVAILABLE"
          : extractCode(error);
    const safeDetail = safeProviderFailure(error) ?? undefined;

    await service.rpc("fail_stage7_quest_request", {
      request_id_input: requestId,
      failure_code_input: code,
      ...(safeDetail ? { failure_detail_safe_input: safeDetail } : {}),
    });

    logger.warn("quest_pack_generation_failed", {
      requestId,
      milestoneId: context.milestoneId,
      code,
      safeDetail,
    });

    return fail(code);
  }
}

export function questErrorMessage(code: QuestErrorCode) {
  return messages[code];
}
