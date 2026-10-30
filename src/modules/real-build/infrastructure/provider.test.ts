import { expect, it, vi } from "vitest";
const request = vi.hoisted(() => vi.fn());
vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai/openai-structured-output", () => ({
  requestOpenAIStructuredOutput: request,
}));
import { generateBuildTemplate } from "./provider";
it("authors a bounded public template without forwarding private properties", async () => {
  const challenge = {
    title: "Set up a useful homework reminder",
    outcome: "Make a real task reminder work for one familiar classmate.",
    steps: Array(5).fill(
      "1. Set up the shared reminder using an existing calendar.\n2. Ask a familiar consenting classmate to try it and check what they receive.",
    ),
    materials: ["Existing phone reminder"],
    evidence: "Describe the test and what changed.",
    safety: "Ask permission. Do not include names or private details.",
  };
  request.mockResolvedValue(challenge);
  const choice = {
    topic: "school",
    minutes: 30,
    focus: "I want to make homework reminders clearer.",
    privateReflection: "private learner text",
    userId: "not-for-provider",
  };
  expect(await generateBuildTemplate(choice, [])).toEqual(challenge);
  const input = request.mock.calls[0][0];
  expect(input.timeoutMs).toBe(35000);
  expect(input.instructions).toContain(
    "improvementGoal is the learner\u0027s EXACT problem",
  );
  expect(input.instructions).toContain("1 DISCOVER");
  expect(input.instructions).toContain("5 IMPROVE");
  expect(input.prompt).not.toMatch(
    /private learner text|not-for-provider|privateReflection|userId/,
  );
  expect(JSON.parse(input.prompt)).toEqual({
    topic: "A fair chance to learn",
    improvementGoal: "I want to make homework reminders clearer.",
    minutes: 30,
    safeStartingIdea: expect.any(String),
    difficulty: 1,
    challengeDesign: expect.stringContaining("small safe useful change"),
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
    title: "Improve an existing task reminder",
    outcome:
      "Compare actual results from a reminder used on a real familiar task.",
    steps: Array(5).fill(
      "1. Set up the working reminder using existing settings.\n2. Test it with a familiar consenting user and compare actual results.",
    ),
    materials: ["Existing phone reminder"],
    evidence: "Write the comparison and describe a useful revision.",
    safety: "Use a familiar task and no private details.",
  };
  request.mockResolvedValue(challenge);
  await generateBuildTemplate(
    {
      topic: "school",
      minutes: 15,
      focus: "I want to improve our homework reminders.",
    },
    [],
    5,
  );
  const data = JSON.parse(request.mock.lastCall?.[0].prompt);
  expect(data.difficulty).toBe(5);
  expect(data.improvementGoal).toContain("homework reminders");
  expect(data.challengeDesign).toContain("small real process");
  expect(Object.keys(data).sort()).toEqual(
    [
      "avoidTitles",
      "challengeDesign",
      "difficulty",
      "minutes",
      "improvementGoal",
      "safeStartingIdea",
      "topic",
    ].sort(),
  );
});

it("passes validated discovery constraints to the coach without private extras", async () => {
  request.mockResolvedValue({
    title: "Reduce unplanned scrolling",
    outcome: "Use a practical daily routine and compare screen time.",
    steps: Array(5).fill(
      "1. Set up a reusable focus session using existing phone settings.\n2. Run the session for one familiar consenting participant and count interruptions.",
    ),
    materials: ["Existing phone"],
    evidence: "Describe the real difference in usage.",
    safety: "Keep private screen information to yourself.",
  });
  await generateBuildTemplate(
    {
      topic: "technology",
      minutes: 15,
      focus: "I want to reduce social-media scrolling.",
      discovery: {
        kind: "habit",
        setting: "personal",
        obstacle: "automatic",
        resources: "phone",
      },
    },
    [],
  );
  const input = request.mock.lastCall?.[0];
  expect(JSON.parse(input.prompt).discovery).toEqual({
    kind: "Build a solution to a habit problem",
    setting: "My own routine",
    obstacle: "I do it without noticing",
    resources: "An existing phone or computer",
  });
  expect(input.instructions).toContain("Respect all of those constraints");
});

it("rejects a general advice list that lacks executable actions within each stage", async () => {
  request.mockResolvedValue({
    title: "Improve your scrolling habits",
    outcome: "Spend less time scrolling by changing your routine.",
    steps: Array(5).fill(
      "Set up a better routine and test it to improve your habits.",
    ),
    materials: [],
    evidence: "Describe what actually happened.",
    safety: "Keep all personal usage information private.",
  });
  await expect(
    generateBuildTemplate(
      {
        topic: "technology",
        minutes: 30,
        focus: "Help people reduce social-media overuse.",
      },
      [],
    ),
  ).rejects.toThrow("BUILD_GUIDE_INCOMPLETE");
});
