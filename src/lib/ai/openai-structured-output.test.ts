import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const requireOpenAIEnvironment = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/config/env", () => ({ requireOpenAIEnvironment }));

const { requestOpenAIStructuredOutput } =
  await import("./openai-structured-output");

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

function requestInput() {
  return {
    instructions: "Follow the schema.",
    prompt: "Create a result.",
    schemaName: "test_result",
    schema,
    maxOutputTokens: 100,
  };
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

  it("sends a private low-latency strict schema request and parses output text", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response({
        status: "completed",
        output: [
          {
            content: [
              {
                type: "output_text",
                text: JSON.stringify({ result: "ok" }),
              },
            ],
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      requestOpenAIStructuredOutput(requestInput()),
    ).resolves.toEqual({
      result: "ok",
    });

    const request = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body),
    ) as Record<string, unknown>;
    expect(request).toMatchObject({
      model: "gpt-5-mini",
      store: false,
      max_output_tokens: 100,
      reasoning: { effort: "minimal" },
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "test_result",
          strict: true,
          schema,
        },
      },
    });
  });

  it("uses GPT-5.1 compatible low reasoning when that model is configured", async () => {
    requireOpenAIEnvironment.mockReturnValue({
      apiKey: "server-secret",
      model: "gpt-5.1",
    });
    const fetchMock = vi.fn().mockResolvedValue(
      response({
        status: "completed",
        output_text: JSON.stringify({ result: "compatible" }),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      requestOpenAIStructuredOutput(requestInput()),
    ).resolves.toEqual({
      result: "compatible",
    });

    const request = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body),
    ) as Record<string, unknown>;
    expect(request).toMatchObject({
      model: "gpt-5.1",
      reasoning: { effort: "low" },
      text: { verbosity: "low" },
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
      requestOpenAIStructuredOutput(requestInput()),
    ).resolves.toEqual({
      result: "direct",
    });
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

    await expect(requestOpenAIStructuredOutput(requestInput())).rejects.toThrow(
      "OPENAI_REFUSAL",
    );

    await expect(requestOpenAIStructuredOutput(requestInput())).rejects.toThrow(
      "OPENAI_INVALID_JSON",
    );
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

    const result = requestOpenAIStructuredOutput(requestInput());
    await vi.advanceTimersByTimeAsync(2_500);

    await expect(result).resolves.toEqual({ result: "recovered" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("stops at the total timeout budget instead of starting another 45-second wait", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(
        (_url: string, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              const error = new Error("aborted");
              error.name = "AbortError";
              reject(error);
            });
          }),
      )
      .mockResolvedValueOnce(
        response({
          status: "completed",
          output_text: JSON.stringify({ result: "after-timeout" }),
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = expect(
      requestOpenAIStructuredOutput(requestInput()),
    ).rejects.toThrow("OPENAI_TIMEOUT");
    await vi.advanceTimersByTimeAsync(45_000);
    await result;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("gives a retry only the time remaining in the shared budget", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockImplementation(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((resolve, reject) => {
          if (fetchMock.mock.calls.length === 1) {
            setTimeout(() => resolve(response({}, 503)), 30_000);
          } else {
            init?.signal?.addEventListener("abort", () => {
              const error = new Error("aborted");
              error.name = "AbortError";
              reject(error);
            });
          }
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const result = expect(
      requestOpenAIStructuredOutput(requestInput()),
    ).rejects.toThrow("OPENAI_TIMEOUT");
    await vi.advanceTimersByTimeAsync(45_000);
    await result;
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries once after a transient network failure", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(
        response({
          status: "completed",
          output_text: JSON.stringify({ result: "after-network" }),
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = requestOpenAIStructuredOutput(requestInput());
    await vi.advanceTimersByTimeAsync(700);

    await expect(result).resolves.toEqual({ result: "after-network" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry a permanent authentication error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(response({ error: "unauthorized" }, 401));
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestOpenAIStructuredOutput(requestInput())).rejects.toThrow(
      "OPENAI_HTTP_401",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
