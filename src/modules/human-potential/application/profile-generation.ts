import "server-only";

import { createLogger } from "@/lib/observability/logger";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { requireGeminiEnvironment } from "@/lib/config/env";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { createCurrentInterpretationRequest } from "./interpretation-requests";
import {
  profileOutputForPersistence,
  validateHumanPotentialProfileOutput,
} from "../domain/profile-contract";
import { GeminiInterpretationProvider } from "../infrastructure/gemini-provider";

const logger = createLogger();

type ProfileExecutionResult =
  | { ok: true; profileId: string }
  | { ok: false; code: string; message: string };

const safeMessages: Record<string, string> = {
  HPI_DISCOVERY_INCOMPLETE:
    "Complete Discovery before generating your profile.",
  HPI_CONSENT_REQUIRED: "Human Potential interpretation requires your consent.",
  HPI_SAFEGUARDING_RESTRICTION:
    "Profile generation is not available for this account at the moment.",
  HPI_REQUEST_ALREADY_EXISTS:
    "Your profile is already being prepared. Please wait a moment and refresh.",
  HPI_OUTPUT_INVALID:
    "PipuPath could not safely prepare this profile. Please try again.",
  HPI_INTERPRETATION_NOT_ALLOWED:
    "Profile generation is temporarily unavailable. Please try again.",
};

function failure(code: string): ProfileExecutionResult {
  return {
    ok: false,
    code,
    message:
      safeMessages[code] ??
      "We could not generate your profile. Please try again.",
  };
}

export async function generateCurrentHumanPotentialProfile(): Promise<ProfileExecutionResult> {
  const { user } = await requireAuthenticatedIdentity();
  const created = await createCurrentInterpretationRequest({
    schemaVersion: "hpi-profile-v1",
    promptVersion: "hpi-gemini-v1",
  });
  if (!created.ok) return failure(created.code);

  const { apiKey: _apiKey, model } = requireGeminiEnvironment();
  void _apiKey;
  const service = createServiceRoleSupabaseClient();
  const requestId = created.value.requestId;
  const { data: claimed, error: claimError } = await service.rpc(
    "claim_stage4_interpretation_request",
    {
      request_id_input: requestId,
      provider_input: "google_gemini",
      model_input: model,
    },
  );
  if (claimError || !claimed) return failure("HPI_REQUEST_ALREADY_EXISTS");

  try {
    const [
      { data: request, error: requestError },
      { data: links, error: linksError },
    ] = await Promise.all([
      service
        .from("interpretation_requests")
        .select("*")
        .eq("id", requestId)
        .eq("user_id", user.id)
        .single(),
      service
        .from("interpretation_request_evidence")
        .select("evidence_record_id")
        .eq("interpretation_request_id", requestId),
    ]);
    if (requestError || linksError || !request || !links?.length) {
      throw new Error("HPI_EVIDENCE_SNAPSHOT_FAILED");
    }

    const evidenceIds = links.map((link) => link.evidence_record_id);
    const { data: evidence, error: evidenceError } = await service
      .from("evidence_records")
      .select("*")
      .eq("user_id", user.id)
      .in("id", evidenceIds);
    if (evidenceError || !evidence || evidence.length !== evidenceIds.length) {
      throw new Error("HPI_EVIDENCE_SNAPSHOT_FAILED");
    }

    const providerInput = {
      requestId,
      schemaVersion: request.interpretation_schema_version,
      promptVersion: request.prompt_version,
      questionSetVersion: request.question_set_version,
      ageBand: request.age_band,
      isMinor: request.is_minor,
      safeguardingReviewRequired: request.safeguarding_review_required,
      prohibitedInferenceCategories: [
        "diagnosis",
        "fixed_identity",
        "life_purpose",
        "future_prediction",
        "permanent_career",
        "unsafe_advice",
      ],
      evidence: evidence.map((row) => ({
        id: row.id,
        sourceId: row.source_id,
        sourceVersion: row.source_version,
        sourceKey: row.source_key,
        category: row.category,
        responseType:
          typeof row.metadata === "object" &&
          row.metadata !== null &&
          "response_type" in row.metadata &&
          typeof row.metadata.response_type === "string"
            ? row.metadata.response_type
            : "reflection",
        value:
          row.sensitivity_level === "sensitive" ? null : row.structured_value,
        sensitivity: row.sensitivity_level,
        contentHash: row.content_hash,
      })),
    };

    const provider = new GeminiInterpretationProvider();
    const output = await provider.interpret(providerInput);
    const validated = validateHumanPotentialProfileOutput(
      providerInput,
      output,
    );
    if (!validated.ok) throw new Error(validated.code);

    const persistence = profileOutputForPersistence(validated.value);
    const { data: profileId, error: persistError } = await service.rpc(
      "persist_stage4_human_potential_profile",
      {
        request_id_input: requestId,
        profile_summary_input: persistence.summary,
        profile_metadata_input: persistence.metadata,
        insights_input: persistence.insights,
      },
    );
    if (persistError || !profileId) throw new Error("HPI_OUTPUT_INVALID");

    await provider.recordUsage({
      requestId,
      provider: "google_gemini",
      model,
    });
    logger.info("hpi_profile_generation_completed", { requestId, profileId });
    return { ok: true, profileId };
  } catch (error) {
    const code =
      error instanceof Error && /HPI_[A-Z_]+/.test(error.message)
        ? (error.message.match(/HPI_[A-Z_]+/)?.[0] ??
          "HPI_INTERPRETATION_NOT_ALLOWED")
        : "HPI_INTERPRETATION_NOT_ALLOWED";
    await service.rpc("fail_stage4_interpretation_request", {
      request_id_input: requestId,
      failure_code_input: code,
      failure_detail_safe_input: null,
    });
    logger.warn("hpi_profile_generation_failed", { requestId, code });
    return failure(code);
  }
}
