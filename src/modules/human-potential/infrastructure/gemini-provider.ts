import "server-only";

import { requireGeminiEnvironment } from "@/lib/config/env";
import { createLogger } from "@/lib/observability/logger";
import {
  humanPotentialProfileOutputSchema,
  type HumanPotentialProfileSectionKey,
} from "../domain/profile-contract";
import { z } from "zod";
import { interpretationInputSchema } from "../domain/contracts";

const logger = createLogger();
const requestTimeoutMs = 45_000;

const profileSections: Array<{
  key: HumanPotentialProfileSectionKey;
  instruction: string;
}> = [
  { key: "emerging_strengths", instruction: "2 to 4 emerging strengths" },
  {
    key: "what_draws_you",
    instruction: "topics and activities they may naturally enjoy",
  },
  {
    key: "problems_you_care_about",
    instruction: "problems they appear interested in helping solve",
  },
  {
    key: "how_you_can_contribute",
    instruction: "practical ways they may create value",
  },
  {
    key: "current_constraints",
    instruction: "encouraging, non-judgmental current constraints",
  },
  {
    key: "best_next_direction",
    instruction:
      "one practical next direction with why it fits and what to try next",
  },
];

function buildPrompt(input: z.infer<typeof interpretationInputSchema>) {
  return [
    "You create a private, provisional Human Potential Profile from supplied Discovery evidence.",
    "Return JSON only, no markdown.",
    "Do not diagnose, predict the future, assign a fixed personality, life purpose, destiny, permanent career, or certainty.",
    'Use cautious wording such as "Based on your answers..." or "You may...". Never invent evidence.',
    "Current constraints must be respectful and encouraging. Do not provide unsafe, legal, medical, investment, or adult-contact advice.",
    "Every insight must cite one or more supplied evidence IDs. Use only evidence IDs supplied.",
    "Create exactly these sections: " +
      profileSections.map((section) => section.key).join(", ") +
      ". Emerging strengths has 2–4 insights; every other section has at least one.",
    "For best_next_direction, include why it fits and one realistic thing to try next in its explanation.",
    "JSON shape: {schemaVersion:'hpi-profile-v1',summary:string,insights:[{profileSection,insightType,insightKey,title,summary,explanation,confidenceLevel,confidenceScore,confidenceFactors,evidence:[{evidenceId,supportType,explanation,weight}],uncertainties:[{type,description}],confirmationQuestion,sensitivity,ageAppropriate}]}.",
    "Evidence follows:",
    JSON.stringify(input),
  ].join("\n");
}

export class GeminiInterpretationProvider {
  async interpret(
    input: z.infer<typeof interpretationInputSchema>,
  ): Promise<unknown> {
    const { apiKey, model } = requireGeminiEnvironment();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseJsonSchema: z.toJSONSchema(
                humanPotentialProfileOutputSchema,
              ),
              maxOutputTokens: 8192,
            },
          }),
        },
      );
      if (!response.ok) {
        throw new Error(`GEMINI_HTTP_${response.status}`);
      }
      const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("GEMINI_EMPTY_RESPONSE");
      try {
        return JSON.parse(text) as unknown;
      } catch {
        throw new Error("GEMINI_INVALID_JSON");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("GEMINI_TIMEOUT");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  mapProviderError(error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (
      message === "GEMINI_INVALID_JSON" ||
      message === "GEMINI_EMPTY_RESPONSE"
    ) {
      return "HPI_OUTPUT_INVALID" as const;
    }
    return "HPI_INTERPRETATION_NOT_ALLOWED" as const;
  }

  async recordUsage(metadata: {
    requestId: string;
    provider: string;
    model: string | null;
  }) {
    logger.info("hpi_provider_completed", {
      requestId: metadata.requestId,
      provider: metadata.provider,
      model: metadata.model,
    });
  }
}
