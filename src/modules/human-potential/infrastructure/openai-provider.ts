import "server-only";
import {
  prepareProfileLanguageRepair,
  applyProfileLanguageRepair,
} from "../domain/profile-language-repair";

import { builderLanguageInstructions } from "@/lib/ai/builder-language";

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
    summary: { type: "string", minLength: 1, maxLength: 1200 },
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
          insightKey: { type: "string", pattern: "^[a-z][a-z0-9_]{2,79}$" },
          title: { type: "string", minLength: 1, maxLength: 120 },
          summary: { type: "string", minLength: 1, maxLength: 320 },
          explanation: { type: "string", minLength: 1, maxLength: 500 },
          confidenceLevel: { type: "string", enum: confidenceLevels },
          confidenceScore: { type: "number", minimum: 0, maximum: 1 },
          confidenceFactors: {
            type: "array",
            minItems: 1,
            maxItems: 6,
            items: { type: "string", minLength: 1, maxLength: 160 },
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
                evidenceId: { type: "string", format: "uuid" },
                supportType: {
                  type: "string",
                  enum: ["supporting", "contradicting", "context"],
                },
                explanation: { type: "string", minLength: 1, maxLength: 500 },
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
                description: { type: "string", minLength: 1, maxLength: 400 },
              },
            },
          },
          confirmationQuestion: {
            type: "string",
            minLength: 1,
            maxLength: 400,
          },
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

export function profileSchemaForEvidence(evidenceIds: string[]) {
  const item = profileResponseSchema.properties.insights.items;
  const refs = item.properties.evidence;
  const properties = Object.fromEntries(
    profileSections.map(({ key }) => [
      key,
      {
        type: "array",
        minItems: key === "emerging_strengths" ? 2 : 1,
        maxItems: key === "emerging_strengths" ? 2 : 1,
        items: {
          ...item,
          properties: {
            ...item.properties,
            profileSection: { type: "string", enum: [key] },
            evidence: {
              ...refs,
              items: {
                ...refs.items,
                properties: {
                  ...refs.items.properties,
                  evidenceId: { type: "string", enum: evidenceIds },
                },
              },
            },
          },
        },
      },
    ]),
  );
  return {
    type: "object",
    additionalProperties: false,
    required: ["schemaVersion", "summary", "sections"],
    properties: {
      schemaVersion: profileResponseSchema.properties.schemaVersion,
      summary: profileResponseSchema.properties.summary,
      sections: {
        type: "object",
        additionalProperties: false,
        required: [...humanPotentialProfileSectionKeys],
        properties,
      },
    },
  };
}

/** Translate the provider's complete section object into the unchanged saved contract.
 * Missing or malformed sections remain invalid; no insights are invented.
 */
export function flattenProfileSections(output: unknown): unknown {
  if (!output || typeof output !== "object") return output;
  const value = output as Record<string, unknown>;
  if (!value.sections || typeof value.sections !== "object") return output;
  const sections = value.sections as Record<string, unknown>;
  if (
    humanPotentialProfileSectionKeys.some(
      (key) => !Array.isArray(sections[key]),
    )
  )
    return output;
  return {
    schemaVersion: value.schemaVersion,
    summary: value.summary,
    insights: humanPotentialProfileSectionKeys.flatMap(
      (key) => sections[key] as unknown[],
    ),
  };
}

function buildPrompt(input: z.infer<typeof interpretationInputSchema>) {
  return [
    builderLanguageInstructions,
    "Create a private, provisional Human Potential Profile from supplied Discovery evidence.",
    "Do not diagnose, predict the future, assign a fixed personality, life purpose, destiny, permanent career or certainty. Do not repeat these labels in disclaimers; simply call this a provisional pattern to test.",
    'Use cautious wording such as "Based on your answers..." or "You may...". Never invent evidence.',
    "Current constraints must be respectful and encouraging. Do not label the person lazy, broken, deficient or a failure.",
    "Do not provide unsafe, legal, medical, investment or adult-contact advice.",
    "Every insight must cite one or more exact supplied evidence IDs.",
    "Return sections as an object with every required section key. Create exactly 2 emerging_strengths insights and exactly 1 insight in every other section. Do not put all insights into one section.",
    "Required sections: " +
      profileSections
        .map((section) => `${section.key} (${section.instruction})`)
        .join(", ") +
      ".",
    "Every insightKey must be unique lowercase snake_case matching ^[a-z][a-z0-9_]{2,79}$.",
    "For best_next_direction, include why it fits and one realistic thing to try next in its explanation.",
    "Every insight needs at least one uncertainty and one evidence item using an exact supplied evidence UUID.",
    "Keep the profile concise: at most 60 words for the profile summary, 20 words for each insight summary and 40 words for its explanation. Prefer one confidence factor, one uncertainty and one or two evidence references per insight.",
    "Evidence follows:",
    JSON.stringify(input),
  ].join("\n");
}

export class OpenAIInterpretationProvider {
  async interpret(
    input: z.infer<typeof interpretationInputSchema>,
    repair?: { issues: string[]; timeoutMs: number },
  ): Promise<unknown> {
    return flattenProfileSections(
      await requestOpenAIStructuredOutput({
        instructions:
          "You create cautious, evidence-grounded Human Potential Profiles for PipuPath. Follow the supplied schema exactly and never invent evidence.",
        prompt:
          buildPrompt(input) +
          (repair
            ? "\nThe previous response failed these rules: " +
              repair.issues.join(", ") +
              ". Return a new complete profile, correcting them. Use only the supplied evidence."
            : ""),
        ...(repair ? { timeoutMs: repair.timeoutMs } : {}),
        schemaName: "pipupath_human_potential_profile_sections_v2",
        schema: profileSchemaForEvidence(input.evidence.map((item) => item.id)),
        maxOutputTokens: 8192,
      }),
    );
  }

  async repair(
    input: z.infer<typeof interpretationInputSchema>,
    output: unknown,
    issues: string[],
    timeoutMs: number,
  ): Promise<unknown> {
    const repair = prepareProfileLanguageRepair(output, issues);
    if (!repair) return this.interpret(input, { issues, timeoutMs });
    const patch = await requestOpenAIStructuredOutput({
      instructions:
        "Rewrite only the supplied rejected wording as short, provisional, respectful observations. Remove fixed-identity, destiny and shaming labels. Preserve the meaning; invent no facts. Return only the requested fields. Do not repeat prohibited labels even in disclaimers. Prefer under 45 words per field.",
      prompt: JSON.stringify({
        fields: repair.fields.map(({ id, value }) => ({ id, value })),
      }),
      schemaName: "pipupath_profile_wording_repair_v1",
      schema: {
        type: "object",
        additionalProperties: false,
        required: repair.fields.map((field) => field.id),
        properties: Object.fromEntries(
          repair.fields.map((field) => [
            field.id,
            { type: "string", minLength: 1, maxLength: field.maxLength },
          ]),
        ),
      },
      maxOutputTokens: 2048,
      timeoutMs,
    });
    const repaired = applyProfileLanguageRepair(repair, patch);
    if (!repaired) throw new Error("OPENAI_INVALID_JSON");
    return repaired;
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
