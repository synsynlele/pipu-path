import "server-only";

import { requestOpenAIStructuredOutput } from "@/lib/ai/openai-structured-output";
import type { EconomicPathwayContext } from "../domain/economic-pathway-contract";

const possiblePathResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "key",
    "pathName",
    "observedPattern",
    "possibleInterpretation",
    "whyItFits",
    "skillsNeeded",
    "howToTest",
    "valueOrIncome",
    "evidenceNeeded",
    "profileEvidenceRefs",
  ],
  properties: {
    key: { type: "string", pattern: "^[a-z][a-z0-9_]{2,59}$" },
    pathName: { type: "string", minLength: 3, maxLength: 100 },
    observedPattern: { type: "string", minLength: 20, maxLength: 500 },
    possibleInterpretation: { type: "string", minLength: 20, maxLength: 600 },
    whyItFits: { type: "string", minLength: 20, maxLength: 800 },
    skillsNeeded: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: { type: "string", minLength: 2, maxLength: 80 },
    },
    howToTest: { type: "string", minLength: 20, maxLength: 600 },
    valueOrIncome: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string", minLength: 10, maxLength: 280 },
    },
    evidenceNeeded: { type: "string", minLength: 20, maxLength: 500 },
    profileEvidenceRefs: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: { type: "string" },
    },
  },
} as const;

const earningResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "key",
    "title",
    "whatYouCouldOffer",
    "whoMayNeedIt",
    "learnFirst",
    "firstExperiment",
    "evidenceOfImprovement",
    "profileEvidenceRefs",
  ],
  properties: {
    key: { type: "string", pattern: "^[a-z][a-z0-9_]{2,59}$" },
    title: { type: "string", minLength: 3, maxLength: 100 },
    whatYouCouldOffer: { type: "string", minLength: 20, maxLength: 500 },
    whoMayNeedIt: { type: "string", minLength: 10, maxLength: 400 },
    learnFirst: { type: "string", minLength: 10, maxLength: 400 },
    firstExperiment: { type: "string", minLength: 20, maxLength: 600 },
    evidenceOfImprovement: { type: "string", minLength: 20, maxLength: 500 },
    profileEvidenceRefs: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string" },
    },
  },
} as const;

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "possiblePaths", "earnFromStrengths"],
  properties: {
    schemaVersion: { type: "string", enum: ["economic-pathways-v1"] },
    possiblePaths: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: possiblePathResponseSchema,
    },
    earnFromStrengths: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: earningResponseSchema,
    },
  },
} as const;

function buildPrompt(context: EconomicPathwayContext) {
  const minorRules = context.isMinor
    ? [
        "The user is a minor. Prioritise learning, supervised projects and trusted people already reachable through family, school or community.",
        "Do not recommend adult-only work platforms, unsupervised client contact, unknown adults, risky work or financial activity.",
        "Frame earning mainly as learning to create value. Parent, guardian or teacher involvement should be encouraged where appropriate.",
      ]
    : [
        "The user is an adult. Commercial tests may be more direct, but still begin with evidence, usefulness and a small responsible experiment.",
      ];

  return [
    "Create a private Economic Pathways recommendation from the approved Human Potential Profile evidence.",
    "Generate 3 to 5 realistic Possible Paths and 3 to 5 Earn From Your Strengths suggestions.",
    "Possible paths may include careers, skills, entrepreneurship, creative work, professional services, trades, technology, leadership or other grounded directions.",
    "Every path is a possibility to test, never destiny, a permanent career, a prediction or a promise of success.",
    "For every Possible Path clearly separate: observedPattern, possibleInterpretation, howToTest and evidenceNeeded.",
    "Every recommendation must cite only exact profile insight IDs supplied in the context. Never invent evidence.",
    "Do not merely repeat what the user said. Infer cautiously from patterns across multiple profile insights and explain the reasoning.",
    "For value or income, describe realistic ways capability may create value. Never state fixed earnings, guaranteed income or quick-money claims.",
    "Do not recommend gambling, betting, speculative trading, borrowing, scams or shortcuts.",
    "Prefer little-or-no-cost tests that can be completed in Nigeria or another low-resource setting.",
    "Use calm youth-friendly language: Know Yourself → Develop Capability → Create Value → Earn → Build.",
    ...minorRules,
    `Approved profile context: ${JSON.stringify(context)}`,
  ].join("\n");
}

export class OpenAIEconomicPathwayProvider {
  async generate(context: EconomicPathwayContext): Promise<unknown> {
    return requestOpenAIStructuredOutput({
      instructions:
        "You create cautious, age-appropriate, evidence-grounded Economic Pathways for PipuPath. Follow the schema exactly, reason from supplied evidence and never promise income.",
      prompt: buildPrompt(context),
      schemaName: "pipupath_economic_pathways_v1",
      schema: responseSchema,
      maxOutputTokens: 8192,
    });
  }
}
