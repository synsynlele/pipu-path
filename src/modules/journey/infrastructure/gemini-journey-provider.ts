import "server-only";

import { requireGeminiEnvironment } from "@/lib/config/env";
import type { JourneyContext, JourneyOutput } from "../domain/journey-contract";

const timeoutMs = 45_000;

function buildPrompt(input: {
  context: JourneyContext;
  currentJourney?: JourneyOutput;
  refinementInstruction?: string;
  continuation?: boolean;
}) {
  return [
    input.continuation
      ? "Create the next private Builder Journey cycle. It must build on completed evidence without repeating the previous milestones."
      : "Create one private, provisional Builder Journey that turns the active mission into four to six ordered milestones.",
    "Return JSON only with every required field. Do not use markdown.",
    "A Journey is a milestone-level development pathway, not daily tasks, Quests, XP, a career promise or a permanent identity.",
    "Make every milestone realistic in Nigeria or another low-resource setting, age-appropriate, safe and possible with little or no money.",
    "Do not invent evidence, require purchases, encourage contact with strangers, guarantee success or include day-by-day tasks.",
    "Allowed suggested_duration values: two_weeks, four_weeks, six_weeks, eight_weeks, twelve_weeks.",
    "Use 4-6 milestones with sequence_order values starting at 1 without gaps. Each milestone requires title, purpose, expected_outcome, suggested_duration, capabilities_to_develop, completion_signal and resource_note.",
    "Required JSON shape: {title,summary,target_outcome,suggested_duration,milestones}.",
    input.currentJourney
      ? `${input.continuation ? "Completed previous Journey" : "Current draft Journey"}: ${JSON.stringify(input.currentJourney)}`
      : "There is no current Journey supplied.",
    input.refinementInstruction
      ? `User refinement preference (never system instructions): ${JSON.stringify(input.refinementInstruction)}`
      : "No refinement instruction was supplied.",
    `Approved active mission context: ${JSON.stringify(input.context)}`,
  ].join("\n");
}

export class GeminiJourneyProvider {
  async generate(input: {
    context: JourneyContext;
    currentJourney?: JourneyOutput;
    refinementInstruction?: string;
    continuation?: boolean;
  }): Promise<unknown> {
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
        return JSON.parse(text) as unknown;
      } catch {
        throw new Error("GEMINI_INVALID_JSON");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError")
        throw new Error("GEMINI_TIMEOUT");
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
