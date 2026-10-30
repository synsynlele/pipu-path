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
    difficulty: 1,
    challengeDesign: expect.stringContaining("simple paper prototype"),
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

it("passes only public level instructions to AI at higher difficulty", async () => {
  const challenge = {
    title: "Compare two safe paper solutions",
    outcome: "Compare simple proposed routes on paper using a measurable fictional example.",
    steps: Array(5).fill("Test two safe paper scenarios and compare the results."),
    materials: ["Paper"],
    evidence: "Write the comparison and describe a useful revision.",
    safety: "Use fictional scenarios, no names or private details.",
  };
  request.mockResolvedValue(challenge);
  await generateBuildTemplate({ topic: "school", minutes: 15 }, [], 5);
  const data = JSON.parse(request.mock.lastCall?.[0].prompt);
  expect(data.difficulty).toBe(5);
  expect(data.challengeDesign).toContain("connected system");
  expect(Object.keys(data).sort()).toEqual(
    ["avoidTitles", "challengeDesign", "difficulty", "minutes", "safeStartingIdea", "topic"].sort(),
  );
});
