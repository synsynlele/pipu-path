import "server-only";

import { requireGeminiEnvironment } from "@/lib/config/env";
import type { QuestContext, QuestPackOutput } from "../domain/quest-contract";

const timeoutMs = 45_000;

function buildPrompt(input: { context: QuestContext }) {
  return [
    "Create one private HQLS Quest pack with exactly three ordered real-world Quests for the available Journey milestone.",
    "Return JSON only with every required field. Do not use markdown.",
    "HQLS means action, honest evidence, reflection and improvement. A Quest must produce a small real-world result, not a lesson plan, motivational statement or quiz.",
    "Make every Quest realistic in Nigeria or another low-resource setting, age-appropriate, safe and possible with little or no money.",
    "Do not require purchases, public posting, contact with strangers, secret activity, personal addresses, dangerous activity, illegal activity or fabricated evidence.",
    "Use trusted people and resources already available. For minors, keep participation within trusted family, school or supervised community relationships.",
    "The three Quests must build progressively toward the milestone. Quest 1 creates a small result, Quest 2 tests or improves it, and Quest 3 demonstrates a stronger useful outcome.",
    "Every Quest requires: title, real_world_outcome, why_it_matters, estimated_minutes, action_steps, resources_needed, low_resource_alternative, evidence_requirements, safety_guidance, completion_criteria, reflection_prompts and sequence_order.",
    "estimated_minutes must be an integer from 15 to 240. action_steps must contain 3-6 clear steps. reflection_prompts must contain exactly four prompts.",
    "Use sequence_order values 1, 2 and 3 without gaps. Required JSON shape: {quests:[...]}",
    `Approved active Journey and milestone context: ${JSON.stringify(input.context)}`,
  ].join("\n");
}

export class GeminiQuestProvider {
  async generate(input: { context: QuestContext }): Promise<unknown> {
    const { apiKey, model } = requireGeminiEnvironment();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

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
              maxOutputTokens: 6144,
            },
          }),
        },
      );

      if (!response.ok) throw new Error(`GEMINI_HTTP_${response.status}`);

      const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("GEMINI_EMPTY_RESPONSE");

      try {
        return JSON.parse(text) as QuestPackOutput;
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
}
