import "server-only";

import { requireOpenAIEnvironment } from "@/lib/config/env";
import { createLogger } from "@/lib/observability/logger";
import {
  callAuthenticatedConnectRpc,
  callServiceRoleStage11Rpc,
} from "@/modules/connect/infrastructure/connect-rpc";
import {
  validateJourneyForContext,
  type JourneyOutput,
} from "../domain/journey-contract";
import { OpenAIJourneyProvider } from "../infrastructure/openai-journey-provider";
import {
  getCurrentJourneyState,
  getJourneyContext,
} from "../infrastructure/journey-dal";
import { buildContinuingEvidenceJourney } from "./journey-fallback";

const logger = createLogger();

type ContinuationResult =
  { ok: true; journeyId: string } | { ok: false; message: string };

function sourceOutput(
  source: NonNullable<
    Awaited<ReturnType<typeof getCurrentJourneyState>>["latestCompleted"]
  >,
): JourneyOutput {
  return {
    title: source.title,
    summary: source.summary,
    target_outcome: source.target_outcome,
    suggested_duration: source.suggested_duration,
    milestones: source.milestones.map(
      ({ id: _id, status: _status, ...milestone }) => {
        void _id;
        void _status;
        return milestone;
      },
    ),
  };
}

export async function generateContinuingJourney(
  sourceJourneyId: string,
): Promise<ContinuationResult> {
  const context = await getJourneyContext();
  if (!context)
    return { ok: false, message: "Your active Mission is required." };
  const state = await getCurrentJourneyState(context.missionId);
  const source = state.latestCompleted;
  if (!source || source.id !== sourceJourneyId) {
    return {
      ok: false,
      message: "That completed Journey is no longer available.",
    };
  }
  if (state.active || state.draft) {
    return {
      ok: false,
      message: "Your next Journey cycle is already available.",
    };
  }

  const completedJourney = sourceOutput(source);
  let model = "evidence-fallback-v1";
  let openAIAvailable = true;
  try {
    ({ model } = requireOpenAIEnvironment());
  } catch {
    openAIAvailable = false;
  }

  let requestId: string;
  try {
    requestId = await callAuthenticatedConnectRpc<string>(
      "create_stage11_journey_continuation_request",
      {
        source_journey_id_input: source.id,
        prompt_version_input: "journey-continuity-openai-v1",
      },
    );
  } catch {
    return {
      ok: false,
      message:
        "PipuPath could not begin the next Journey cycle. Refresh and try once more.",
    };
  }

  const claimed = await callServiceRoleStage11Rpc<boolean>(
    "claim_stage6_journey_request",
    {
      request_id_input: requestId,
      provider_input: openAIAvailable ? "openai" : "evidence_fallback",
      model_input: model,
    },
  );
  if (!claimed) {
    return { ok: false, message: "Your next Journey is already being shaped." };
  }

  try {
    let generationMode: "openai" | "evidence_fallback" = "openai";
    let fallbackReason: string | null = null;
    let output: unknown;
    if (openAIAvailable) {
      try {
        output = await new OpenAIJourneyProvider().generate({
          context,
          currentJourney: completedJourney,
          continuation: true,
        });
      } catch (error) {
        generationMode = "evidence_fallback";
        fallbackReason =
          error instanceof Error ? error.message : "OPENAI_PROVIDER_FAILURE";
        output = buildContinuingEvidenceJourney({ context, completedJourney });
      }
    } else {
      generationMode = "evidence_fallback";
      fallbackReason = "OPENAI_ENVIRONMENT_UNAVAILABLE";
      output = buildContinuingEvidenceJourney({ context, completedJourney });
    }

    let validated = validateJourneyForContext(context, output);
    if (!validated.ok) {
      generationMode = "evidence_fallback";
      fallbackReason = validated.code;
      validated = validateJourneyForContext(
        context,
        buildContinuingEvidenceJourney({ context, completedJourney }),
      );
    }
    if (!validated.ok) throw new Error(validated.code);

    const journeyId = await callServiceRoleStage11Rpc<string>(
      "persist_stage11_journey_continuation",
      { request_id_input: requestId, journey_input: validated.value },
    );
    logger.info("journey_continuation_completed", {
      requestId,
      journeyId,
      sourceJourneyId: source.id,
      cycleNumber: source.cycleNumber + 1,
      generationMode,
      fallbackReason,
    });
    return { ok: true, journeyId };
  } catch (error) {
    await callServiceRoleStage11Rpc<boolean>("fail_stage6_journey_request", {
      request_id_input: requestId,
      failure_code_input: "JOURNEY_SAVE_FAILED",
      failure_detail_safe_input:
        error instanceof Error
          ? error.message.slice(0, 120)
          : "continuation_failed",
    });
    logger.warn("journey_continuation_failed", { requestId });
    return {
      ok: false,
      message:
        "PipuPath could not safely shape the next Journey. Please try again.",
    };
  }
}
