import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const requireOpenAIEnvironment = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/config/env", () => ({ requireOpenAIEnvironment }));

const { requestOpenAIStructuredOutput } = await import(
  "./openai-structured-output"
);

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["result"],
  properties: { result: { type: "string" } },
};

function response(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("OpenAI structured output client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireOpenAIEnvironment.mockReturnValue({
      apiKey: "server-secret",
      model: "gpt-5-mini",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("sends a private strict schema request and parses output text", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        response({
          status: "completed",
          output: [
            {
              content: [
                { type: "output_text", text: JSON.stringify({ result: "ok" }) },
              ],
            },
          ],
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      requestOpenAIStructuredOutput({
        instructions: "Follow the schema.",
        prompt: "Create a result.",
        schemaName: "test_result",
        schema,
        maxOutputTokens: 100,
      }),
    ).resolves.toEqual({ result: "ok" });

    const request = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body),
    ) as Record<string, unknown>;
    expect(request).toMatchObject({
      model: "gpt-5-mini",
      store: false,
      max_output_tokens: 100,
      text: {
        format: {
          type: "json_schema",
          name: "test_result",
          strict: true,
          schema,
        },
      },
    });
  });

  it("accepts the direct output_text projection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          status: "completed",
          output_text: JSON.stringify({ result: "direct" }),
        }),
      ),
    );

    await expect(
      requestOpenAIStructuredOutput({
        instructions: "Follow the schema.",
        prompt: "Create a result.",
        schemaName: "test_result",
        schema,
        maxOutputTokens: 100,
      }),
    ).resolves.toEqual({ result: "direct" });
  });

  it("rejects refusal and malformed output without exposing content", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          response({
            status: "completed",
            output: [
              { content: [{ type: "refusal", refusal: "private detail" }] },
            ],
          }),
        )
        .mockResolvedValueOnce(
          response({
            status: "completed",
            output_text: "not-json",
          }),
        ),
    );

    await expect(
      requestOpenAIStructuredOutput({
        instructions: "Follow the schema.",
        prompt: "Create a result.",
        schemaName: "test_result",
        schema,
        maxOutputTokens: 100,
      }),
    ).rejects.toThrow("OPENAI_REFUSAL");

    await expect(
      requestOpenAIStructuredOutput({
        instructions: "Follow the schema.",
        prompt: "Create a result.",
        schemaName: "test_result",
        schema,
        maxOutputTokens: 100,
      }),
    ).rejects.toThrow("OPENAI_INVALID_JSON");
  });

  it("retries one transient rate limit response", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ error: "rate limited" }, 429))
      .mockResolvedValueOnce(
        response({
          status: "completed",
          output_text: JSON.stringify({ result: "recovered" }),
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = requestOpenAIStructuredOutput({
      instructions: "Follow the schema.",
      prompt: "Create a result.",
      schemaName: "test_result",
      schema,
      maxOutputTokens: 100,
    });
    await vi.advanceTimersByTimeAsync(2_500);

    await expect(result).resolves.toEqual({ result: "recovered" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
