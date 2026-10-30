import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
const start = vi.hoisted(() => vi.fn());
vi.mock("../application/actions", () => ({ startRealBuild: start }));
import { BuildChoiceForm } from "./choice-form";
afterEach(() => {
  cleanup();
  start.mockReset();
});
function next() {
  fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
}
function reachReview() {
  next();
  next();
  fireEvent.click(screen.getByRole("radio", { name: "15 min" }));
  fireEvent.click(screen.getByRole("button", { name: "Review my answers →" }));
}
it("adapts the follow-up, preserves answers on back navigation, and makes no discovery AI calls", () => {
  render(
    <BuildChoiceForm
      initialTopic="school"
      initialFocus="Help people learn useful skills together."
    />,
  );
  fireEvent.change(
    screen.getByRole("combobox", { name: "What kind of change is this?" }),
    { target: { value: "community" } },
  );
  next();
  fireEvent.change(
    screen.getByRole("combobox", {
      name: "What is getting in the way for people?",
    }),
    { target: { value: "coordination" } },
  );
  fireEvent.change(
    screen.getByRole("combobox", { name: "Where will you try this?" }),
    { target: { value: "school" } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  next();
  expect(
    screen.getByRole("combobox", {
      name: "What is getting in the way for people?",
    }),
  ).toHaveValue("coordination");
  next();
  fireEvent.click(screen.getByRole("button", { name: "Review my answers →" }));
  expect(
    screen.getByRole("region", { name: "Your Quest brief" }),
  ).toHaveTextContent("People struggle to work together");
  expect(start).not.toHaveBeenCalled();
});
it("retains all discovery answers after generation failure and retries the same brief", async () => {
  start.mockResolvedValue({
    ok: false,
    message: "AI took too long. Try again.",
  });
  render(
    <BuildChoiceForm
      initialTopic="water"
      initialFocus="I want to reduce wasted water at school."
    />,
  );
  reachReview();
  fireEvent.click(screen.getByRole("button", { name: "Create my Quest →" }));
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("AI took too long"),
  );
  const data = start.mock.calls[0][1] as FormData;
  expect(Object.fromEntries(data)).toEqual({
    topic: "water",
    focus: "I want to reduce wasted water at school.",
    minutes: "15",
    kind: "make",
    setting: "personal",
    obstacle: "unsure",
    resources: "none",
  });
  expect(
    screen.getByText(/selected answers are sent to AI/),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByRole("radio", { name: "15 min" })).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByRole("textbox")).toHaveValue(
    "I want to reduce wasted water at school.",
  );
});
it("shows a spinner and blocks duplicate submissions while generating", async () => {
  let resolveRequest!: (result: { ok: boolean; message: string }) => void;
  start.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
  );
  render(
    <BuildChoiceForm
      initialTopic="water"
      initialFocus="I want to reduce wasted water at school."
    />,
  );
  reachReview();
  fireEvent.click(screen.getByRole("button", { name: "Create my Quest →" }));
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Preparing your personalised Quest",
  );
  const busy = screen.getByRole("button", { name: /creating your quest/i });
  expect(busy).toBeDisabled();
  expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
  fireEvent.click(busy);
  expect(start).toHaveBeenCalledTimes(1);
  resolveRequest({ ok: false, message: "Your answers are safe." });
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your answers are safe",
    ),
  );
  expect(screen.queryByRole("status")).toBeNull();
});
