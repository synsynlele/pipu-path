import "server-only";

import { requireOpenAIEnvironment } from "@/lib/config/env";
import { createLogger } from "@/lib/observability/logger";

const requestTimeoutMs = 45_000;
const retryableStatuses = new Set([408, 409, 429, 500, 502, 503, 504]);
const logger = createLogger();

export type JsonSchema = Record<string, unknown>;

type OpenAIResponsePayload = {
  status?: string;
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
    }>;
  }>;
};

class OpenAIHttpError extends Error {
  constructor(readonly status: number) {
    super(`OPENAI_HTTP_${status}`);
  }
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function extractResponseText(payload: OpenAIResponsePayload) {
  if (payload.status === "incomplete") {
    throw new Error("OPENAI_INCOMPLETE_RESPONSE");
  }
  if (payload.status === "failed") {
    throw new Error("OPENAI_FAILED_RESPONSE");
  }

  const content = payload.output?.flatMap((item) => item.content ?? []) ?? [];
  const refusal = content.find(
    (item) => item.type === "refusal" && typeof item.refusal === "string",
  )?.refusal;
  if (refusal) throw new Error("OPENAI_REFUSAL");

  const text =
    payload.output_text ??
    content.find(
      (item) => item.type === "output_text" && typeof item.text === "string",
    )?.text;
  if (!text) throw new Error("OPENAI_EMPTY_RESPONSE");

  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
}

function parseStructuredOutput(payload: OpenAIResponsePayload) {
  try {
    return JSON.parse(extractResponseText(payload)) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("OPENAI_INVALID_JSON");
    }
    throw error;
  }
}

function supportsGpt5Controls(model: string) {
  return /^gpt-5(?:[.-]|$)/i.test(model) && !/^gpt-5-pro(?:[.-]|$)/i.test(model);
}

function retryReason(error: unknown) {
  if (error instanceof OpenAIHttpError && retryableStatuses.has(error.status)) {
    return error.message;
  }
  if (error instanceof Error && error.message === "OPENAI_TIMEOUT") {
    return error.message;
  }
  if (error instanceof TypeError) return "OPENAI_NETWORK_ERROR";
  return null;
}

function retryDelayMs(error: unknown) {
  if (error instanceof OpenAIHttpError && error.status === 429) return 2_500;
  if (error instanceof OpenAIHttpError) return 1_200;
  return 700;
}

async function requestOnce(input: {
  apiKey: string;
  model: string;
  instructions: string;
  prompt: string;
  schemaName: string;
  schema: JsonSchema;
  maxOutputTokens: number;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  const lowLatencyControls = supportsGpt5Controls(input.model)
    ? { reasoning: { effort: "minimal" as const } }
    : {};
  const lowVerbosityControls = supportsGpt5Controls(input.model)
    ? { verbosity: "low" as const }
    : {};

  try {
    // This server-only boundary keeps provider credentials and private prompts out of browser bundles.
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${input.apiKey}`,
        "content-type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: input.model,
        store: false,
        instructions: input.instructions,
        input: input.prompt,
        max_output_tokens: input.maxOutputTokens,
        ...lowLatencyControls,
        text: {
          ...lowVerbosityControls,
          format: {
            type: "json_schema",
            name: input.schemaName,
            strict: true,
            schema: input.schema,
          },
        },
      }),
    });

    if (!response.ok) throw new OpenAIHttpError(response.status);
    // Module-specific domain validators still treat this parsed JSON as untrusted.
    return parseStructuredOutput(
      (await response.json()) as OpenAIResponsePayload,
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("OPENAI_TIMEOUT");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function requestOpenAIStructuredOutput(input: {
  instructions: string;
  prompt: string;
  schemaName: string;
  schema: JsonSchema;
  maxOutputTokens: number;
}) {
  const { apiKey, model } = requireOpenAIEnvironment();
  let lastError: unknown = new Error("OPENAI_HTTP_503");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await requestOnce({ ...input, apiKey, model });
    } catch (error) {
      lastError = error;
      const reason = retryReason(error);
      if (reason && attempt === 0) {
        logger.warn("openai_structured_request_retry", {
          attempt: attempt + 1,
          reason,
        });
        await wait(retryDelayMs(error));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
