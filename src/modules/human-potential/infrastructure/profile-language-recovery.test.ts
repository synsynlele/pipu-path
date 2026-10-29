import { beforeEach, expect, it, vi } from "vitest";
const request = vi.hoisted(() => vi.fn());
vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai/openai-structured-output", () => ({
  requestOpenAIStructuredOutput: request,
}));
import { OpenAIInterpretationProvider } from "./openai-provider";
import { interpretationInputSchema } from "../domain/contracts";
import { validateHumanPotentialProfileOutput } from "../domain/profile-contract";
import { buildEvidenceBasedFallbackProfile } from "../application/evidence-profile-fallback";
const input = interpretationInputSchema.parse({
  requestId: "22222222-2222-4222-8222-222222222222",
  schemaVersion: "hpi-profile-v1",
  promptVersion: "test",
  questionSetVersion: 1,
  ageBand: "18_24",
  isMinor: false,
  safeguardingReviewRequired: false,
  prohibitedInferenceCategories: ["diagnosis"],
  evidence: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      sourceId: "33333333-3333-4333-8333-333333333333",
      sourceVersion: 1,
      sourceKey: "discovery_interest",
      category: "interest",
      responseType: "reflection",
      value: "I enjoy teaching.",
      sensitivity: "standard",
      contentHash: "a".repeat(64),
    },
  ],
});
beforeEach(() => request.mockReset());
it("repairs one rejected field using a small output request inside the remaining budget", async () => {
  const original = buildEvidenceBasedFallbackProfile(input);
  original.insights[0].summary = "You are broken.";
  const rejected = validateHumanPotentialProfileOutput(input, original);
  if (rejected.ok) throw new Error("Expected rejection");
  request.mockResolvedValue({
    insight_0_summary: "You may benefit from trying one smaller task.",
  });
  const repaired = await new OpenAIInterpretationProvider().repair(
    input,
    original,
    rejected.issues ?? [],
    12_000,
  );
  expect(validateHumanPotentialProfileOutput(input, repaired).ok).toBe(true);
  expect(request).toHaveBeenCalledTimes(1);
  expect(request).toHaveBeenCalledWith(
    expect.objectContaining({
      schemaName: "pipupath_profile_wording_repair_v1",
      timeoutMs: 12_000,
      maxOutputTokens: 2048,
      schema: expect.objectContaining({ required: ["insight_0_summary"] }),
    }),
  );
  const prompt = JSON.parse(request.mock.calls[0][0].prompt);
  expect(Object.keys(prompt)).toEqual(["fields"]);
  expect(prompt.fields).toHaveLength(1);
  expect((repaired as typeof original).insights[0].evidence).toEqual(
    original.insights[0].evidence,
  );
  expect((repaired as typeof original).insights.slice(1)).toEqual(
    original.insights.slice(1),
  );
});
it("does not accept malformed repair fields", async () => {
  const original = buildEvidenceBasedFallbackProfile(input);
  request.mockResolvedValue({ summary: "A provisional pattern", evidence: [] });
  await expect(
    new OpenAIInterpretationProvider().repair(
      input,
      original,
      ["summary:fixed_identity"],
      12_000,
    ),
  ).rejects.toThrow("OPENAI_INVALID_JSON");
});
