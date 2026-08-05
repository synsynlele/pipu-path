import "server-only";

import { requestOpenAIStructuredOutput } from "@/lib/ai/openai-structured-output";
import type { QuestContext } from "../domain/quest-contract";

const questSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "real_world_outcome",
    "why_it_matters",
    "estimated_minutes",
    "action_steps",
    "resources_needed",
    "low_resource_alternative",
    "evidence_requirements",
    "safety_guidance",
    "completion_criteria",
    "reflection_prompts",
    "sequence_order",
  ],
  properties: {
    title: { type: "string", minLength: 3, maxLength: 100 },
    real_world_outcome: { type: "string", minLength: 10, maxLength: 400 },
    why_it_matters: { type: "string", minLength: 10, maxLength: 500 },
    estimated_minutes: { type: "integer", minimum: 15, maximum: 240 },
    action_steps: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: { type: "string", minLength: 5, maxLength: 240 },
    },
    resources_needed: {
      type: "array",
      maxItems: 6,
      items: { type: "string", minLength: 2, maxLength: 120 },
    },
    low_resource_alternative: {
      type: "string",
      minLength: 10,
      maxLength: 400,
    },
    evidence_requirements: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string", minLength: 5, maxLength: 240 },
    },
    safety_guidance: { type: "string", minLength: 8, maxLength: 400 },
    completion_criteria: { type: "string", minLength: 10, maxLength: 400 },
    reflection_prompts: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: { type: "string", minLength: 8, maxLength: 240 },
    },
    sequence_order: { type: "integer", minimum: 1, maximum: 3 },
  },
} as const;

const questPackResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["quests"],
  properties: {
    quests: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: questSchema,
    },
  },
} as const;

function buildPrompt(input: { context: QuestContext }) {
  return [
    "Create one private HQLS Quest pack with exactly three ordered real-world Quests for the available Journey milestone.",
    "HQLS means action, honest evidence, reflection and improvement. A Quest must produce a small real-world result, not a lesson plan, motivational statement or quiz.",
    "Make every Quest realistic in Nigeria or another low-resource setting, age-appropriate, safe and possible with little or no money.",
    "Do not require purchases, public posting, contact with strangers, secret activity, personal addresses, dangerous activity, illegal activity or fabricated evidence.",
    "Use trusted people and resources already available. For minors, keep participation within trusted family, school or supervised community relationships.",
    "Quest 1 creates a small result, Quest 2 tests or improves it, and Quest 3 demonstrates a stronger useful outcome.",
    "Use sequence_order values 1, 2 and 3 without gaps and give every Quest a distinct title.",
    `Approved active Journey and milestone context: ${JSON.stringify(input.context)}`,
  ].join("\n");
}

export class OpenAIQuestProvider {
  async generate(input: { context: QuestContext }): Promise<unknown> {
    return requestOpenAIStructuredOutput({
      instructions:
        "You create safe, practical HQLS Quest packs for PipuPath. Follow the supplied schema exactly and ground every Quest in the approved Journey milestone.",
      prompt: buildPrompt(input),
      schemaName: "pipupath_quest_pack_v1",
      schema: questPackResponseSchema,
      maxOutputTokens: 6144,
    });
  }
}
