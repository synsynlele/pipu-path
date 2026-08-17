import "server-only";

import { requireOpenAIEnvironment } from "@/lib/config/env";
import { createLogger } from "@/lib/observability/logger";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { recordProductEventForUser } from "@/modules/analytics/infrastructure/product-events";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  validateBuilderGuideOutput,
  type BuilderGuideErrorCode,
  type BuilderGuideIntent,
} from "../domain/builder-guide-contract";
import {
  builderGuideContextFingerprint,
  countRecentBuilderGuideRuns,
  findReusableBuilderGuideRun,
  getBuilderGuideContext,
  saveBuilderGuideRun,
} from "../infrastructure/builder-guide-dal";
import { OpenAIBuilderGuideProvider } from "../infrastructure/openai-builder-guide-provider";
import { buildEvidenceBasedBuilderGuide } from "./builder-guide-fallback";

const logger = createLogger();
const reuseWindowMs = 6 * 60 * 60 * 1000;
const dailyGenerationLimit = 12;

const messages: Record<BuilderGuideErrorCode, string> = {
  GUIDE_PROFILE_REQUIRED:
    "Build your Living Builder Profile before asking the Guide for evidence-aware direction.",
  GUIDE_CONSENT_REQUIRED:
    "Your Builder Guide requires your current AI processing consent.",
  GUIDE_UNAVAILABLE:
    "Your Builder Guide is not available for this account at the moment.",
  GUIDE_RATE_LIMITED:
    "You have reached today's Guide refresh limit. Keep working with the guidance you already have and return after your development context changes.",
  GUIDE_OUTPUT_INVALID:
    "PipuPath could not safely ground that guidance in your evidence. Please try again.",
  GUIDE_OUTPUT_UNSAFE:
    "That guidance did not meet PipuPath's safety rules. Please try again.",
  GUIDE_SAVE_FAILED:
    "Your Builder Guide result could not be saved. Please try again.",
};

export type BuilderGuideGenerationResult =
  | { ok: true; runId: string; reused: boolean }
  | { ok: false; code: BuilderGuideErrorCode; message: string };

function fail(code: BuilderGuideErrorCode): BuilderGuideGenerationResult {
  return { ok: false, code, message: messages[code] };
}

export async function generateBuilderGuide(
  intent: BuilderGuideIntent,
): Promise<BuilderGuideGenerationResult> {
  const { user } = await requireAuthenticatedIdentity();
  const context = await getBuilderGuideContext();
  if (!context) return fail("GUIDE_PROFILE_REQUIRED");
  if (context.safeguardingReviewRequired) return fail("GUIDE_UNAVAILABLE");

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
    return fail("GUIDE_CONSENT_REQUIRED");
  }

  const fingerprint = builderGuideContextFingerprint(context);
  const reusable = await findReusableBuilderGuideRun({
    userId: user.id,
    intent,
    fingerprint,
    since: new Date(Date.now() - reuseWindowMs).toISOString(),
  });
  if (reusable) {
    logger.info("builder_guide_reused", { runId: reusable.id, intent });
    return { ok: true, runId: reusable.id, reused: true };
  }

  const recentCount = await countRecentBuilderGuideRuns(
    user.id,
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  );
  if (recentCount >= dailyGenerationLimit) return fail("GUIDE_RATE_LIMITED");

  let model = "evidence-fallback-v1";
  let openAIAvailable = true;
  try {
    ({ model } = requireOpenAIEnvironment());
  } catch {
    openAIAvailable = false;
  }

  let provider: "openai" | "evidence_fallback" = "openai";
  let fallbackReason: string | null = null;
  let output: unknown;
  if (openAIAvailable) {
    try {
      output = await new OpenAIBuilderGuideProvider().generate(context, intent);
    } catch (error) {
      provider = "evidence_fallback";
      fallbackReason =
        error instanceof Error ? error.message : "OPENAI_PROVIDER_FAILURE";
      output = buildEvidenceBasedBuilderGuide(context, intent);
    }
  } else {
    provider = "evidence_fallback";
    fallbackReason = "OPENAI_ENVIRONMENT_UNAVAILABLE";
    output = buildEvidenceBasedBuilderGuide(context, intent);
  }

  let validated = validateBuilderGuideOutput(context, intent, output);
  if (!validated.ok) {
    provider = "evidence_fallback";
    fallbackReason = validated.code;
    output = buildEvidenceBasedBuilderGuide(context, intent);
    validated = validateBuilderGuideOutput(context, intent, output);
  }
  if (!validated.ok) return fail(validated.code);

  try {
    const saved = await saveBuilderGuideRun({
      userId: user.id,
      intent,
      context,
      fingerprint,
      provider,
      model: provider === "openai" ? model : "evidence-fallback-v1",
      consentPolicyVersion: consent.policy_version,
      advice: validated.value,
    });
    await recordProductEventForUser(user.id, "builder_guide_generated", {
      runId: saved.id,
      intent,
      provider,
      livingProfileVersion: context.livingProfile.version,
    });
    logger.info("builder_guide_generated", {
      runId: saved.id,
      intent,
      provider,
      fallbackReason,
    });
    return { ok: true, runId: saved.id, reused: false };
  } catch (error) {
    logger.error("builder_guide_save_failed", {
      intent,
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return fail("GUIDE_SAVE_FAILED");
  }
}
