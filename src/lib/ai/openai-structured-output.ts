import "server-only";

import { requireOpenAIEnvironment } from "@/lib/config/env";

const requestTimeoutMs = 45_000;
const retryableStatuses = new Set([408, 409, 429, 500, 502, 503, 504]);

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

  try {
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
        text: {
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
      if (
        error instanceof OpenAIHttpError &&
        retryableStatuses.has(error.status) &&
        attempt === 0
      ) {
        await wait(error.status === 429 ? 2_500 : 1_200);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
