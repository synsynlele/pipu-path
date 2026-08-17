import "server-only";

import { requestOpenAIStructuredOutput } from "@/lib/ai/openai-structured-output";
import type {
  BuilderGuideContext,
  BuilderGuideIntent,
} from "../domain/builder-guide-contract";

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "schemaVersion",
    "intent",
    "title",
    "summary",
    "evidenceObservations",
    "focus",
    "nextAction",
    "challenge",
    "uncertainty",
  ],
  properties: {
    schemaVersion: { type: "string", enum: ["builder-guide-v1"] },
    intent: {
      type: "string",
      enum: ["next_move", "improvement", "missing_evidence", "weekly_focus"],
    },
    title: { type: "string" },
    summary: { type: "string" },
    evidenceObservations: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["claimId", "observation"],
        properties: {
          claimId: { type: "string" },
          observation: { type: "string" },
        },
      },
    },
    focus: {
      type: "object",
      additionalProperties: false,
      required: ["label", "rationale"],
      properties: {
        label: { type: "string" },
        rationale: { type: "string" },
      },
    },
    nextAction: {
      type: "object",
      additionalProperties: false,
      required: ["title", "instruction", "evidenceToCreate", "destination"],
      properties: {
        title: { type: "string" },
        instruction: { type: "string" },
        evidenceToCreate: { type: "string" },
        destination: {
          type: "string",
          enum: [
            "profile",
            "journey",
            "current_quest",
            "build",
            "current_project",
            "connect",
          ],
        },
      },
    },
    challenge: { type: ["string", "null"] },
    uncertainty: { type: "string" },
  },
} as const;

const intentLabels: Record<BuilderGuideIntent, string> = {
  next_move: "What should I do next?",
  improvement: "Where am I improving?",
  missing_evidence: "What evidence am I missing?",
  weekly_focus: "What should I focus on this week?",
};

export class OpenAIBuilderGuideProvider {
  async generate(context: BuilderGuideContext, intent: BuilderGuideIntent) {
    const promptContext = {
      preferredName: context.preferredName,
      ageBand: context.ageBand,
      isMinor: context.isMinor,
      baseline: context.baseline,
      livingProfile: context.livingProfile,
      selectedPath: context.selectedPath,
      current: context.current,
      availableDestinations: context.availableDestinations,
    };

    return requestOpenAIStructuredOutput({
      schemaName: "pipupath_builder_guide_v1",
      schema: schema as Record<string, unknown>,
      maxOutputTokens: 1_700,
      instructions: [
        "You are PipuPath's Personal Builder Guide, not a generic chatbot.",
        "Use only the supplied PipuPath evidence and workflow state.",
        "Interpret evidence conservatively. Never define the person's identity, destiny, personality, worth, intelligence or perfect career.",
        "Never invent completed work, capability evidence, opportunities, relationships, contacts or outcomes.",
        "Evidence observations may reference only capability claim IDs supplied in livingProfile.capabilities.",
        "Prefer one small proof-bearing next action over broad advice or more planning.",
        "Do not recommend gambling, speculative trading, borrowing, get-rich schemes, guaranteed income or guaranteed outcomes.",
        "For minors, do not recommend contacting strangers, unsupervised meetings with unknown adults, adult-only platforms or unsafe work.",
        "Do not ask for private contact information and do not provide arbitrary URLs.",
        "Choose nextAction.destination only from availableDestinations.",
        "State meaningful uncertainty. Missing evidence means the platform lacks proof, not that the capability is absent.",
        "Keep the tone clear, demanding but supportive, practical and age-appropriate.",
      ].join("\n"),
      prompt: [
        `Builder question: ${intentLabels[intent]}`,
        `Required intent value: ${intent}`,
        "Prepare one bounded recommendation using this private structured context:",
        JSON.stringify(promptContext),
      ].join("\n\n"),
    });
  }
}
