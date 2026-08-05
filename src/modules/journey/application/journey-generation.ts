import "server-only";

import { requireGeminiEnvironment } from "@/lib/config/env";
import { createLogger } from "@/lib/observability/logger";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  refinementInstructionSchema,
  validateJourneyForContext,
  type JourneyErrorCode,
  type JourneyOutput,
} from "../domain/journey-contract";
import { GeminiJourneyProvider } from "../infrastructure/gemini-journey-provider";
import {
  getCurrentJourneyState,
  getJourneyContext,
} from "../infrastructure/journey-dal";
import { buildEvidenceBasedJourney } from "./journey-fallback";

const logger = createLogger();
const messages: Record<JourneyErrorCode, string> = {
  JOURNEY_MISSION_REQUIRED: "Accept your practical mission first.",
  JOURNEY_PROFILE_REQUIRED: "Your current Human Potential Profile is required.",
  JOURNEY_CONSENT_REQUIRED:
    "Journey generation requires current AI processing consent.",
  JOURNEY_GENERATION_DISABLED: "Your active Journey is already saved.",
  JOURNEY_REQUEST_ALREADY_RUNNING:
    "Your Journey is already being shaped. Please wait and refresh.",
  JOURNEY_GENERATION_LIMIT_REACHED:
    "You have used the three Journey attempts available for this mission.",
  JOURNEY_PROVIDER_UNAVAILABLE:
    "Journey generation is temporarily unavailable. Please try again.",
  JOURNEY_PROVIDER_TIMEOUT:
    "Journey generation took too long. Please try again safely.",
  JOURNEY_OUTPUT_INVALID:
    "PipuPath could not safely shape that Journey. Please try again.",
  JOURNEY_OUTPUT_UNSAFE:
    "That Journey did not meet PipuPath's safety rules. Please try again.",
  JOURNEY_SAVE_FAILED: "Your Journey could not be saved. Please try again.",
  JOURNEY_NOT_FOUND: "That Journey is no longer available.",
  JOURNEY_ACCESS_DENIED: "You cannot access that Journey.",
};
type Result =
  | { ok: true; journeyId: string }
  | { ok: false; code: JourneyErrorCode; message: string };
const fail = (code: JourneyErrorCode): Result => ({
  ok: false,
  code,
  message: messages[code],
});
function extractCode(error: unknown): JourneyErrorCode {
  const match = (error instanceof Error ? error.message : String(error)).match(
    /JOURNEY_[A-Z_]+/,
  )?.[0] as JourneyErrorCode | undefined;
  return match && match in messages ? match : "JOURNEY_GENERATION_DISABLED";
}
function safeProviderFailure(error: unknown) {
  if (!(error instanceof Error)) return null;
  return /^GEMINI_(?:HTTP_\d{3}|EMPTY_RESPONSE|INVALID_JSON|TIMEOUT)$/.test(
    error.message,
  )
    ? error.message
    : null;
}

export async function generateCurrentJourney(input: {
  kind: "initial" | "regenerate" | "refine";
  sourceJourneyId?: string;
  refinementInstruction?: string;
}): Promise<Result> {
  await requireAuthenticatedIdentity();
  const context = await getJourneyContext();
  if (!context) return fail("JOURNEY_MISSION_REQUIRED");
  let model = "evidence-fallback-v1";
  let geminiAvailable = true;
  try {
    ({ model } = requireGeminiEnvironment());
  } catch {
    geminiAvailable = false;
  }
  const current = await getCurrentJourneyState(context.missionId);
  let currentJourney: JourneyOutput | undefined;
  let refinementInstruction: string | undefined;
  if (input.kind === "refine") {
    const parsed = refinementInstructionSchema.safeParse(
      input.refinementInstruction,
    );
    if (
      !parsed.success ||
      !current.draft ||
      current.draft.id !== input.sourceJourneyId
    )
      return fail("JOURNEY_OUTPUT_INVALID");
    refinementInstruction = parsed.data;
    currentJourney = {
      title: current.draft.title,
      summary: current.draft.summary,
      target_outcome: current.draft.target_outcome,
      suggested_duration: current.draft.suggested_duration,
      milestones: current.draft.milestones.map(
        ({ id: _id, status: _status, ...milestone }) => {
          void _id;
          void _status;
          return milestone;
        },
      ),
    };
  }
  const browser = await createServerSupabaseClient();
  const { data: requestId, error: createError } = await browser.rpc(
    "create_stage6_journey_request",
    {
      mission_id_input: context.missionId,
      generation_kind_input: input.kind,
      ...(input.sourceJourneyId
        ? { source_journey_id_input: input.sourceJourneyId }
        : {}),
      ...(refinementInstruction
        ? { refinement_instruction_input: refinementInstruction }
        : {}),
      prompt_version_input: "journey-gemini-v1",
    },
  );
  if (createError || !requestId) return fail(extractCode(createError));
  const service = createServiceRoleSupabaseClient();
  const { data: claimed, error: claimError } = await service.rpc(
    "claim_stage6_journey_request",
    {
      request_id_input: requestId,
      provider_input: geminiAvailable ? "google_gemini" : "evidence_fallback",
      model_input: model,
    },
  );
  if (claimError || !claimed) return fail("JOURNEY_REQUEST_ALREADY_RUNNING");
  try {
    let generationMode: "gemini" | "evidence_fallback" = "gemini";
    let fallbackReason: string | null = null;
    let output: unknown;

    if (geminiAvailable) {
      try {
        output = await new GeminiJourneyProvider().generate({
          context,
          currentJourney,
          refinementInstruction,
        });
      } catch (error) {
        generationMode = "evidence_fallback";
        fallbackReason =
          safeProviderFailure(error) ?? "GEMINI_PROVIDER_FAILURE";
        output = buildEvidenceBasedJourney({ context, currentJourney });
      }
    } else {
      generationMode = "evidence_fallback";
      fallbackReason = "GEMINI_ENVIRONMENT_UNAVAILABLE";
      output = buildEvidenceBasedJourney({ context, currentJourney });
    }

    let validated = validateJourneyForContext(context, output);
    if (!validated.ok) {
      generationMode = "evidence_fallback";
      fallbackReason = validated.code;
      output = buildEvidenceBasedJourney({ context, currentJourney });
      validated = validateJourneyForContext(context, output);
    }
    if (!validated.ok) throw new Error(validated.code);

    const { data: journeyId, error: saveError } = await service.rpc(
      "persist_stage6_journey",
      { request_id_input: requestId, journey_input: validated.value },
    );
    if (saveError || !journeyId) throw new Error("JOURNEY_SAVE_FAILED");
    logger.info("journey_generation_completed", {
      requestId,
      journeyId,
      kind: input.kind,
      generationMode,
      fallbackReason,
    });
    return { ok: true, journeyId };
  } catch (error) {
    const raw = error instanceof Error ? error.message : "";
    const code: JourneyErrorCode =
      raw === "GEMINI_TIMEOUT"
        ? "JOURNEY_PROVIDER_TIMEOUT"
        : /^GEMINI_/.test(raw)
          ? "JOURNEY_PROVIDER_UNAVAILABLE"
          : extractCode(error);
    const safeDetail = safeProviderFailure(error) ?? undefined;
    await service.rpc("fail_stage6_journey_request", {
      request_id_input: requestId,
      failure_code_input: code,
      ...(safeDetail ? { failure_detail_safe_input: safeDetail } : {}),
    });
    logger.warn("journey_generation_failed", { requestId, code, safeDetail });
    return fail(code);
  }
}
