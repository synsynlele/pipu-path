import "server-only";

import { requireOpenAIEnvironment } from "@/lib/config/env";
import { createLogger } from "@/lib/observability/logger";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  validateEconomicPathwayOutput,
  type EconomicPathwayErrorCode,
} from "../domain/economic-pathway-contract";
import {
  asEconomicPathwayClient,
  getCurrentEconomicPathwayState,
  getEconomicPathwayContext,
  recordProductEventForUser,
} from "../infrastructure/economic-pathway-dal";
import { OpenAIEconomicPathwayProvider } from "../infrastructure/openai-economic-pathway-provider";
import { buildEvidenceBasedEconomicPathways } from "./economic-pathway-fallback";

const logger = createLogger();

const messages: Record<EconomicPathwayErrorCode, string> = {
  ECONOMIC_PATHWAYS_PROFILE_REQUIRED:
    "Complete your Human Potential Profile before exploring possible paths.",
  ECONOMIC_PATHWAYS_CONSENT_REQUIRED:
    "Possible Paths require your current AI processing consent.",
  ECONOMIC_PATHWAYS_UNAVAILABLE:
    "Possible Paths are not available for this account at the moment.",
  ECONOMIC_PATHWAYS_OUTPUT_INVALID:
    "PipuPath could not safely prepare your possible paths. Please try again.",
  ECONOMIC_PATHWAYS_OUTPUT_UNSAFE:
    "Those recommendations did not meet PipuPath's safety rules. Please try again.",
  ECONOMIC_PATHWAYS_SAVE_FAILED:
    "Your possible paths could not be saved. Please try again.",
  ECONOMIC_PATHWAYS_NOT_FOUND: "Those possible paths are no longer available.",
  ECONOMIC_PATHWAYS_SELECTION_LOCKED:
    "Finish or replace your current mission before changing the path it is built from.",
};

export type EconomicPathwayGenerationResult =
  | { ok: true; recommendationId: string }
  | { ok: false; code: EconomicPathwayErrorCode; message: string };

const fail = (
  code: EconomicPathwayErrorCode,
): EconomicPathwayGenerationResult => ({
  ok: false,
  code,
  message: messages[code],
});

export async function generateCurrentEconomicPathways(): Promise<EconomicPathwayGenerationResult> {
  const { user } = await requireAuthenticatedIdentity();
  const context = await getEconomicPathwayContext();
  if (!context) return fail("ECONOMIC_PATHWAYS_PROFILE_REQUIRED");
  if (context.safeguardingReviewRequired) {
    return fail("ECONOMIC_PATHWAYS_UNAVAILABLE");
  }

  const existing = await getCurrentEconomicPathwayState(context.profileId);
  if (existing) return { ok: true, recommendationId: existing.id };

  const browser = await createServerSupabaseClient();
  const { data: consent } = await browser
    .from("user_consents")
    .select("policy_version,status,withdrawn_at")
    .eq("user_id", user.id)
    .eq("consent_type", "ai_processing")
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!consent || consent.status !== "granted" || consent.withdrawn_at) {
    return fail("ECONOMIC_PATHWAYS_CONSENT_REQUIRED");
  }

  let model = "evidence-fallback-v1";
  let openAIAvailable = true;
  try {
    ({ model } = requireOpenAIEnvironment());
  } catch {
    openAIAvailable = false;
  }

  let generationMode: "openai" | "evidence_fallback" = "openai";
  let fallbackReason: string | null = null;
  let output: unknown;
  if (openAIAvailable) {
    try {
      output = await new OpenAIEconomicPathwayProvider().generate(context);
    } catch (error) {
      generationMode = "evidence_fallback";
      fallbackReason =
        error instanceof Error ? error.message : "OPENAI_PROVIDER_FAILURE";
      output = buildEvidenceBasedEconomicPathways(context);
    }
  } else {
    generationMode = "evidence_fallback";
    fallbackReason = "OPENAI_ENVIRONMENT_UNAVAILABLE";
    output = buildEvidenceBasedEconomicPathways(context);
  }

  let validated = validateEconomicPathwayOutput(context, output);
  if (!validated.ok) {
    generationMode = "evidence_fallback";
    fallbackReason = validated.code;
    output = buildEvidenceBasedEconomicPathways(context);
    validated = validateEconomicPathwayOutput(context, output);
  }
  if (!validated.ok) return fail(validated.code);

  const service = asEconomicPathwayClient(createServiceRoleSupabaseClient());
  const { data, error } = await service
    .from("economic_pathway_recommendations")
    .upsert(
      {
        user_id: user.id,
        human_potential_profile_id: context.profileId,
        schema_version: validated.value.schemaVersion,
        possible_paths: validated.value.possiblePaths,
        earn_from_strengths: validated.value.earnFromStrengths,
        provider: generationMode,
        model: generationMode === "openai" ? model : "evidence-fallback-v1",
        prompt_version: "economic-pathways-openai-v1",
        consent_policy_version: consent.policy_version,
        age_band: context.ageBand,
        is_minor: context.isMinor,
      },
      { onConflict: "user_id,human_potential_profile_id" },
    )
    .select("id")
    .single();
  if (error || !data || typeof data !== "object") {
    return fail("ECONOMIC_PATHWAYS_SAVE_FAILED");
  }

  const recommendationId = String((data as Record<string, unknown>).id);
  await recordProductEventForUser(user.id, "possible_paths_generated", {
    recommendationId,
    profileId: context.profileId,
    generationMode,
  });
  logger.info("economic_pathways_generated", {
    recommendationId,
    profileId: context.profileId,
    generationMode,
    fallbackReason,
  });
  return { ok: true, recommendationId };
}
