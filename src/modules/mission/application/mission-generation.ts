import "server-only";

import { requireGeminiEnvironment } from "@/lib/config/env";
import { createLogger } from "@/lib/observability/logger";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  refinementInstructionSchema,
  validateMissionOutput,
  type MissionErrorCode,
  type MissionOutput,
} from "../domain/mission-contract";
import { GeminiMissionProvider } from "../infrastructure/gemini-mission-provider";
import {
  getCurrentMissionState,
  getMissionProfileContext,
} from "../infrastructure/mission-dal";

const logger = createLogger();
const messages: Record<MissionErrorCode, string> = {
  MISSION_PROFILE_REQUIRED: "Complete your Human Potential Profile first.",
  MISSION_CONSENT_REQUIRED:
    "Mission generation requires current AI processing consent.",
  MISSION_GENERATION_DISABLED: "Your active mission is already saved.",
  MISSION_REQUEST_ALREADY_RUNNING:
    "Your mission is already being shaped. Please wait and refresh.",
  MISSION_GENERATION_LIMIT_REACHED:
    "You have used the three mission attempts available for this profile.",
  MISSION_PROVIDER_UNAVAILABLE:
    "Mission generation is temporarily unavailable. Please try again.",
  MISSION_PROVIDER_TIMEOUT:
    "Mission generation took too long. Please try again safely.",
  MISSION_OUTPUT_INVALID:
    "PipuPath could not safely shape that mission. Please try again.",
  MISSION_OUTPUT_UNSAFE:
    "That mission did not meet PipuPath's safety rules. Please try again.",
  MISSION_SAVE_FAILED: "Your mission could not be saved. Please try again.",
  MISSION_NOT_FOUND: "That mission is no longer available.",
  MISSION_ACCESS_DENIED: "You cannot access that mission.",
};

type Result =
  | { ok: true; missionId: string }
  | { ok: false; code: MissionErrorCode; message: string };

function fail(code: MissionErrorCode): Result {
  return { ok: false, code, message: messages[code] };
}

function extractMissionCode(error: unknown): MissionErrorCode {
  const message = error instanceof Error ? error.message : String(error);
  const matched = message.match(/MISSION_[A-Z_]+/)?.[0] as
    MissionErrorCode | undefined;
  return matched && matched in messages
    ? matched
    : "MISSION_GENERATION_DISABLED";
}

export async function generateCurrentMission(input: {
  kind: "initial" | "regenerate" | "refine";
  sourceMissionId?: string;
  refinementInstruction?: string;
}): Promise<Result> {
  await requireAuthenticatedIdentity();
  const context = await getMissionProfileContext();
  if (!context) return fail("MISSION_PROFILE_REQUIRED");
  let model: string;
  try {
    ({ model } = requireGeminiEnvironment());
  } catch {
    return fail("MISSION_GENERATION_DISABLED");
  }

  const current = await getCurrentMissionState(context.profileId);
  let currentMission: MissionOutput | undefined;
  let refinementInstruction: string | undefined;
  if (input.kind === "refine") {
    const parsed = refinementInstructionSchema.safeParse(
      input.refinementInstruction,
    );
    if (
      !parsed.success ||
      !current.draft ||
      current.draft.id !== input.sourceMissionId
    ) {
      return fail("MISSION_OUTPUT_INVALID");
    }
    refinementInstruction = parsed.data;
    currentMission = {
      title: current.draft.title,
      mission_statement: current.draft.mission_statement,
      why_this_fits: current.draft.why_this_fits,
      who_this_helps: current.draft.who_this_helps,
      first_meaningful_outcome: current.draft.first_meaningful_outcome,
      time_horizon: current.draft.time_horizon,
      success_signal: current.draft.success_signal,
      current_caution: current.draft.current_caution,
      profile_evidence_refs: current.draft.profile_evidence_refs,
    };
  }

  const browser = await createServerSupabaseClient();
  const { data: requestId, error: createError } = await browser.rpc(
    "create_stage5_mission_request",
    {
      profile_id_input: context.profileId,
      generation_kind_input: input.kind,
      ...(input.sourceMissionId
        ? { source_mission_id_input: input.sourceMissionId }
        : {}),
      ...(refinementInstruction
        ? { refinement_instruction_input: refinementInstruction }
        : {}),
      prompt_version_input: "mission-gemini-v1",
    },
  );
  if (createError || !requestId) return fail(extractMissionCode(createError));

  const service = createServiceRoleSupabaseClient();
  const { data: claimed, error: claimError } = await service.rpc(
    "claim_stage5_mission_request",
    {
      request_id_input: requestId,
      provider_input: "google_gemini",
      model_input: model,
    },
  );
  if (claimError || !claimed) return fail("MISSION_REQUEST_ALREADY_RUNNING");

  try {
    const output = await new GeminiMissionProvider().generate({
      context,
      currentMission,
      refinementInstruction,
    });
    const validated = validateMissionOutput(context, output);
    if (!validated.ok) throw new Error(validated.code);
    const { data: missionId, error: saveError } = await service.rpc(
      "persist_stage5_mission",
      { request_id_input: requestId, mission_input: validated.value },
    );
    if (saveError || !missionId) throw new Error("MISSION_SAVE_FAILED");
    logger.info("mission_generation_completed", {
      requestId,
      missionId,
      kind: input.kind,
    });
    return { ok: true, missionId };
  } catch (error) {
    const raw = error instanceof Error ? error.message : "";
    const code: MissionErrorCode =
      raw === "GEMINI_TIMEOUT"
        ? "MISSION_PROVIDER_TIMEOUT"
        : /^GEMINI_/.test(raw)
          ? "MISSION_PROVIDER_UNAVAILABLE"
          : extractMissionCode(error);
    const safeDetail =
      /^GEMINI_(?:HTTP_\d{3}|EMPTY_RESPONSE|INVALID_JSON|TIMEOUT)$/.test(raw)
        ? raw
        : undefined;
    await service.rpc("fail_stage5_mission_request", {
      request_id_input: requestId,
      failure_code_input: code,
      ...(safeDetail ? { failure_detail_safe_input: safeDetail } : {}),
    });
    logger.warn("mission_generation_failed", { requestId, code, safeDetail });
    return fail(code);
  }
}
