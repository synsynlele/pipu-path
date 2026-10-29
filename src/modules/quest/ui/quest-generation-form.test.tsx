import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
const generate = vi.hoisted(() =>
  vi.fn(async () => ({
    status: "error",
    message: "AI took too long. Please try again.",
  })),
);
vi.mock("../application/quest-actions", () => ({
  generateQuestPackAction: generate,
}));
import { QuestGenerationForm } from "./quest-generation-form";
afterEach(() => {
  cleanup();
  generate.mockClear();
});
it("waits for an explicit generation request and exposes a retryable failure", async () => {
  render(<QuestGenerationForm attemptsRemaining={3} />);
  expect(generate).not.toHaveBeenCalled();
  fireEvent.submit(
    screen.getByRole("button", { name: "Generate my Quest" }).closest("form")!,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "AI took too long",
  );
  expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled();
  await waitFor(() => expect(generate).toHaveBeenCalledTimes(1));
});
