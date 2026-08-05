import "server-only";

import { requireGeminiEnvironment } from "@/lib/config/env";
import { createLogger } from "@/lib/observability/logger";
import {
  humanPotentialProfileSectionKeys,
  type HumanPotentialProfileSectionKey,
} from "../domain/profile-contract";
import type { z } from "zod";
import {
  confidenceLevels,
  insightTypes,
  interpretationInputSchema,
} from "../domain/contracts";

const logger = createLogger();
const requestTimeoutMs = 45_000;
const profileSections: Array<{
  key: HumanPotentialProfileSectionKey;
  instruction: string;
}> = [
  { key: "emerging_strengths", instruction: "exactly 2 emerging strengths" },
  {
    key: "what_draws_you",
    instruction: "1 topic or activity they may naturally enjoy",
  },
  {
    key: "problems_you_care_about",
    instruction: "1 problem they appear interested in helping solve",
  },
  {
    key: "how_you_can_contribute",
    instruction: "1 practical way they may create value",
  },
  {
    key: "current_constraints",
    instruction: "1 encouraging, non-judgmental current constraint",
  },
  {
    key: "best_next_direction",
    instruction:
      "1 practical next direction with why it fits and what to try next",
  },
];

const uncertaintyTypes = [
  "insufficient_examples",
  "conflicting_evidence",
  "low_response_detail",
  "age_or_life_stage",
  "context_specific",
  "outdated_evidence",
  "possible_response_bias",
] as const;

const profileResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "summary", "insights"],
  properties: {
    schemaVersion: { type: "string", enum: ["hpi-profile-v1"] },
    summary: {
      type: "string",
      description:
        "A cautious provisional summary grounded only in supplied evidence.",
    },
    insights: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "profileSection",
          "insightType",
          "insightKey",
          "title",
          "summary",
          "explanation",
          "confidenceLevel",
          "confidenceScore",
          "confidenceFactors",
          "evidence",
          "uncertainties",
          "confirmationQuestion",
          "sensitivity",
          "ageAppropriate",
        ],
        properties: {
          profileSection: {
            type: "string",
            enum: humanPotentialProfileSectionKeys,
          },
          insightType: { type: "string", enum: insightTypes },
          insightKey: {
            type: "string",
            description:
              "A unique lowercase snake_case identifier beginning with a letter.",
          },
          title: { type: "string" },
          summary: { type: "string" },
          explanation: { type: "string" },
          confidenceLevel: { type: "string", enum: confidenceLevels },
          confidenceScore: { type: "number", minimum: 0, maximum: 1 },
          confidenceFactors: {
            type: "array",
            minItems: 1,
            maxItems: 6,
            items: { type: "string" },
          },
          evidence: {
            type: "array",
            minItems: 1,
            maxItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["evidenceId", "supportType", "explanation", "weight"],
              properties: {
                evidenceId: {
                  type: "string",
                  description: "An exact UUID from the supplied evidence.",
                },
                supportType: {
                  type: "string",
                  enum: ["supporting", "contradicting", "context"],
                },
                explanation: { type: "string" },
                weight: { type: "number", minimum: 0.01, maximum: 1 },
              },
            },
          },
          uncertainties: {
            type: "array",
            minItems: 1,
            maxItems: 2,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["type", "description"],
              properties: {
                type: { type: "string", enum: uncertaintyTypes },
                description: { type: "string" },
              },
            },
          },
          confirmationQuestion: { type: "string" },
          sensitivity: {
            type: "string",
            enum: ["standard", "sensitive"],
          },
          ageAppropriate: { type: "boolean" },
        },
      },
    },
  },
} as const;

function buildPrompt(input: z.infer<typeof interpretationInputSchema>) {
  return [
    "You create a private, provisional Human Potential Profile from supplied Discovery evidence.",
    "Return JSON only, no markdown.",
    "Do not diagnose, predict the future, assign a fixed personality, life purpose, destiny, permanent career, or certainty.",
    'Use cautious wording such as "Based on your answers..." or "You may...". Never invent evidence.',
    "Current constraints must be respectful and encouraging. Do not label the person lazy, broken, deficient, or a failure.",
    "Do not provide unsafe, legal, medical, investment, or adult-contact advice.",
    "Every insight must cite one or more supplied evidence IDs. Use only evidence IDs supplied.",
    "Create exactly 7 insights: exactly 2 emerging_strengths insights and exactly 1 insight in every other required section.",
    "Required sections: " +
      profileSections
        .map((section) => `${section.key} (${section.instruction})`)
        .join(", ") +
      ".",
    "Every insightKey must be unique lowercase snake_case matching ^[a-z][a-z0-9_]{2,79}$.",
    "For best_next_direction, include why it fits and one realistic thing to try next in its explanation.",
    "Allowed insightType values: strength_pattern, interest_pattern, value_pattern, capability_pattern, environmental_preference, problem_orientation, contribution_orientation, growth_need, constraint, motivation_pattern, readiness_pattern.",
    "Allowed confidenceLevel values: low, emerging, moderate, strong. confidenceScore must be 0 through 1.",
    "Allowed evidence supportType values: supporting, contradicting, context. Every insight needs at least one evidence item using an exact supplied evidence UUID and weight greater than 0 through 1.",
    "Allowed uncertainty type values: insufficient_examples, conflicting_evidence, low_response_detail, age_or_life_stage, context_specific, outdated_evidence, possible_response_bias. Every insight needs at least one uncertainty.",
    "sensitivity must be standard or sensitive. ageAppropriate must be a boolean. Every listed JSON field is required.",
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
              responseJsonSchema: profileResponseJsonSchema,
              candidateCount: 1,
              temperature: 0.2,
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
