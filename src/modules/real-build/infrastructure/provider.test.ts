import { beforeEach, expect, it, vi } from "vitest";
const request = vi.hoisted(() => vi.fn());
vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai/openai-structured-output", () => ({
  requestOpenAIStructuredOutput: request,
}));
import { generateBuildTemplate } from "./provider";
const choice = {
  topic: "technology",
  minutes: 30,
  focus: "Help familiar peers reduce unplanned scrolling.",
};
const draft = {
  title: "Run a shared focus-session service",
  outcome:
    "Run a reusable focus session for consenting peers and compare interruptions.",
  stages: [
    [
      "Ask a familiar consenting peer when scrolling interrupts useful work.",
      "Count interruptions during one normal ten-minute work session.",
    ],
    [
      "Choose the existing phone timer and a quiet permitted location.",
      "Set up one ten-minute session with one familiar consenting participant.",
    ],
    [
      "Enable focus mode and start the ten-minute timer for the shared session.",
      "Guide the participant through the agreed task until the timer finishes.",
    ],
    [
      "Test the session in real use and count interruptions without recording private details.",
      "Compare the interruption count with the starting session.",
    ],
    [
      "Adjust one timer or session rule using the participant's feedback.",
      "Run the revised session and record the actual result, including failure.",
    ],
  ],
  materials: ["Existing phone timer"],
  evidence: "Record the actual counts and the change made after feedback.",
  safety:
    "Use consenting familiar participants and keep personal information private.",
};
beforeEach(() => {
  request.mockReset();
});
it("uses structured stage actions and deterministically produces the saved five-stage guide", async () => {
  request.mockResolvedValue(draft);
  const privateChoice = {
    ...choice,
    privateReflection: "do not send me",
    userId: "private-account",
  };
  const result = await generateBuildTemplate(privateChoice, []);
  expect(result.steps).toEqual(
    draft.stages.map((actions) =>
      actions.map((action, index) => `${index + 1}. ${action}`).join("\n"),
    ),
  );
  expect(result).not.toHaveProperty("stages");
  const sent = request.mock.calls[0][0];
  expect(sent.schema.required).toContain("stages");
  expect(sent.schema.required).not.toContain("steps");
  expect(sent.schema.properties.stages.items.type).toBe("array");
  expect(sent.prompt).not.toMatch(
    /do not send me|private-account|privateReflection|userId/,
  );
  expect(sent.timeoutMs).toBe(35000);
  expect(request).toHaveBeenCalledOnce();
});
it("does not depend on generated numbered lines, escaped newlines or long paragraph splitting", async () => {
  request.mockResolvedValue({
    ...draft,
    stages: draft.stages.map((actions) =>
      actions.map((text, index) => `${index + 1}. ${text}`),
    ),
  });
  const result = await generateBuildTemplate(choice, []);
  expect(result.steps[0]).toBe(
    `1. ${draft.stages[0][0]}\n2. ${draft.stages[0][1]}`,
  );
});
it("does not reject a real build because discovery mentions an older paper exercise or build actions reject one", async () => {
  const stages = draft.stages.map((actions) => [...actions]);
  stages[0][0] =
    "Ask why an earlier paper tracker did not help the familiar consenting participant.";
  stages[2][0] =
    "No paper tracker is needed; enable the phone's existing focus mode.";
  request.mockResolvedValue({ ...draft, stages });
  expect((await generateBuildTemplate(choice, [])).title).toBe(draft.title);
  expect(request).toHaveBeenCalledOnce();
});
it("repairs a malformed stage shape once and validates the corrected guide", async () => {
  request
    .mockResolvedValueOnce({
      ...draft,
      stages: draft.stages.map((actions) => actions.join("; ")),
    })
    .mockResolvedValueOnce(draft);
  expect((await generateBuildTemplate(choice, [])).steps).toHaveLength(5);
  expect(request).toHaveBeenCalledTimes(2);
  expect(request.mock.lastCall?.[0].timeoutMs).toBeLessThanOrEqual(45000);
});
it("still rejects an assigned paper project after one bounded correction", async () => {
  const stages = draft.stages.map((actions) => [...actions]);
  stages[2][0] =
    "Create a paper tracker as the final solution for the participant.";
  request.mockResolvedValue({ ...draft, stages });
  await expect(generateBuildTemplate(choice, [])).rejects.toThrow(
    "BUILD_NOT_PRACTICAL",
  );
  expect(request).toHaveBeenCalledTimes(2);
  expect(JSON.parse(request.mock.lastCall?.[0].prompt).correction).toBe(
    "PAPER_ONLY",
  );
});
it("retains safety rejection without using a correction to bypass it", async () => {
  const stages = draft.stages.map((actions) => [...actions]);
  stages[2][0] = "Borrow money for a new device before starting the service.";
  request.mockResolvedValue({ ...draft, stages });
  await expect(generateBuildTemplate(choice, [])).rejects.toThrow(
    "BUILD_UNSAFE",
  );
  expect(request).toHaveBeenCalledOnce();
});
it("passes the exact goal, validated discovery choices and public difficulty instructions", async () => {
  request.mockResolvedValue(draft);
  await generateBuildTemplate(
    {
      ...choice,
      discovery: {
        kind: "habit",
        setting: "personal",
        obstacle: "automatic",
        resources: "phone",
      },
    },
    [],
    5,
  );
  const brief = JSON.parse(request.mock.calls[0][0].prompt);
  expect(brief.improvementGoal).toBe(choice.focus);
  expect(brief.difficulty).toBe(5);
  expect(brief.discovery.resources).toBe("An existing phone or computer");
});
