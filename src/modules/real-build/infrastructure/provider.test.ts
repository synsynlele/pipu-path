import { expect, it, vi } from "vitest";
const request = vi.hoisted(() => vi.fn());
vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai/openai-structured-output", () => ({
  requestOpenAIStructuredOutput: request,
}));
import { generateBuildTemplate } from "./provider";
it("authors a bounded public template without forwarding private properties", async () => {
  const challenge = {
    title: "Test a paper tracker",
    outcome: "Make homework steps clearer for one familiar classmate.",
    steps: Array(5).fill("Draw and test a paper tracker with permission."),
    materials: ["Paper"],
    evidence: "Describe the test and what changed.",
    safety: "Ask permission. Do not include names or private details.",
  };
  request.mockResolvedValue(challenge);
  const choice = {
    topic: "school",
    minutes: 30,
    privateReflection: "private learner text",
    userId: "not-for-provider",
  };
  expect(await generateBuildTemplate(choice, [])).toEqual(challenge);
  const input = request.mock.calls[0][0];
  expect(input.timeoutMs).toBe(35000);
  expect(input.prompt).not.toMatch(
    /private learner text|not-for-provider|privateReflection|userId/,
  );
  expect(JSON.parse(input.prompt)).toEqual({
    topic: "A fair chance to learn",
    minutes: 30,
    safeStartingIdea: expect.any(String),
    avoidTitles: [],
  });
  request.mockResolvedValue({
    ...challenge,
    steps: ["Borrow money for a tool.", ...challenge.steps.slice(1)],
  });
  await expect(generateBuildTemplate(choice, [])).rejects.toThrow(
    "BUILD_UNSAFE",
  );
});
