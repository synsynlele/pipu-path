import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuestReflectionForm } from "./quest-reflection-form";
import { QuestActionGuide } from "./quest-action-guide";

const complete = vi.hoisted(() => vi.fn());
vi.mock("../application/quest-actions", () => ({
  completeQuestAction: complete,
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("life game quest", () => {
  it("keeps guide navigation separate from completion", async () => {
    const user = userEvent.setup();
    render(
      <QuestActionGuide
        steps={["Find one useful problem", "Ask someone about it"]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Next action" }));
    expect(
      screen.getByText("Ask someone about it", { selector: "p" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Next action" })).toBeDisabled();
    expect(complete).not.toHaveBeenCalled();
  });
  it("requires specific answers and preserves them when going back", async () => {
    const user = userEvent.setup();
    render(<QuestReflectionForm questId="test-quest" prompts={[]} />);
    await user.click(screen.getByRole("button", { name: "Next →" }));
    expect(screen.getByRole("alert")).toHaveTextContent("20 characters");
    await user.type(
      screen.getByRole("textbox"),
      "I asked two people about a real problem.",
    );
    await user.click(screen.getByRole("button", { name: "Next →" }));
    expect(screen.getByRole("textbox")).toHaveAccessibleName("What happened?");
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("textbox")).toHaveValue(
      "I asked two people about a real problem.",
    );
    expect(complete).not.toHaveBeenCalled();
  });
  it("submits all five real answers only on the final step", async () => {
    complete.mockResolvedValue({
      status: "error",
      message: "Could not save. Try again.",
    });
    const user = userEvent.setup();
    render(<QuestReflectionForm questId="test-quest" prompts={[]} />);
    const answers = [
      "I interviewed two people in my community.",
      "Both explained a problem with water access.",
      "I learned that asking is better than assuming.",
      "Next I will test a smaller practical solution.",
      "I can keep going by asking for useful feedback.",
    ];
    for (let i = 0; i < answers.length; i++) {
      await user.type(screen.getByRole("textbox"), answers[i]);
      if (i < answers.length - 1)
        await user.click(screen.getByRole("button", { name: "Next →" }));
    }
    expect(complete).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Complete Quest →" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not save",
    );
    const form = complete.mock.calls[0][1] as FormData;
    expect(
      [
        "whatIDid",
        "whatHappened",
        "whatILearned",
        "whatIWillChange",
        "nortnspoilReflection",
      ].map((key) => form.get(key)),
    ).toEqual(answers);
    expect(screen.getByRole("textbox")).toHaveValue(answers[4]);
  });
});
