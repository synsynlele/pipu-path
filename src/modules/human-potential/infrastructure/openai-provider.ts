import "server-only";

import { requestOpenAIStructuredOutput } from "@/lib/ai/openai-structured-output";
import { createLogger } from "@/lib/observability/logger";
import type { z } from "zod";
import {
  confidenceLevels,
  insightTypes,
  interpretationInputSchema,
} from "../domain/contracts";
import {
  humanPotentialProfileSectionKeys,
  type HumanPotentialProfileSectionKey,
} from "../domain/profile-contract";

const logger = createLogger();

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

const profileResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "summary", "insights"],
  properties: {
    schemaVersion: { type: "string", enum: ["hpi-profile-v1"] },
    summary: { type: "string" },
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
          insightKey: { type: "string" },
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
                evidenceId: { type: "string" },
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
  const evolutionInstructions =
    input.promptVersion === "hpi-openai-v2-builder-evidence"
      ? [
          "This is a profile evolution pass. The evidence can include the Builder's original Discovery answers, explicit feedback on prior profile insights and completed real-world Builder Projects.",
          "Treat sourceKey completed_builder_project as observed behaviour and proof of attempted contribution, but do not infer strong capability from a single project alone.",
          "Treat sourceKey profile_feedback as explicit first-person correction or confirmation. When it conflicts with an older Discovery inference, acknowledge the conflict and prefer cautious wording rather than defending the old interpretation.",
          "The new profile may confirm, weaken or revise earlier patterns. It must remain provisional and evidence-grounded.",
        ]
      : [
          "This is the initial profile pass. Evidence is primarily the Builder's completed Discovery responses.",
        ];

  return [
    "Create a private, provisional Human Potential Profile from the supplied evidence.",
    ...evolutionInstructions,
    "Do not diagnose, predict the future, assign a fixed personality, life purpose, destiny, permanent career or certainty.",
    'Use cautious wording such as "Based on the evidence..." or "You may...". Never invent evidence.',
    "Current constraints must be respectful and encouraging. Do not label the person lazy, broken, deficient or a failure.",
    "Do not provide unsafe, legal, medical, investment or adult-contact advice.",
    "Every insight must cite one or more exact supplied evidence IDs.",
    "Create exactly 7 insights: exactly 2 emerging_strengths insights and exactly 1 insight in every other required section.",
    "Required sections: " +
      profileSections
        .map((section) => `${section.key} (${section.instruction})`)
        .join(", ") +
      ".",
    "Every insightKey must be unique lowercase snake_case matching ^[a-z][a-z0-9_]{2,79}$.",
    "For best_next_direction, include why it fits and one realistic thing to try next in its explanation.",
    "Every insight needs at least one uncertainty and one evidence item using an exact supplied evidence UUID.",
    "Evidence follows:",
    JSON.stringify(input),
  ].join("\n");
}

export class OpenAIInterpretationProvider {
  async interpret(
    input: z.infer<typeof interpretationInputSchema>,
  ): Promise<unknown> {
    return requestOpenAIStructuredOutput({
      instructions:
        "You create cautious, evidence-grounded Human Potential Profiles for PipuPath. Follow the supplied schema exactly and never invent evidence.",
      prompt: buildPrompt(input),
      schemaName: "pipupath_human_potential_profile_v1",
      schema: profileResponseSchema,
      maxOutputTokens: 8192,
    });
  }

  mapProviderError(error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (
      message === "OPENAI_INVALID_JSON" ||
      message === "OPENAI_EMPTY_RESPONSE" ||
      message === "OPENAI_INCOMPLETE_RESPONSE"
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
