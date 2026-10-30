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
afterEach(() => { cleanup(); start.mockReset(); });
it("retains topic and time on a generation failure and offers a retry without fake success", async () => {
  start.mockResolvedValue({
    ok: false,
    message: "AI took too long. Try again.",
  });
  render(<BuildChoiceForm initialTopic="water" />);
  fireEvent.click(screen.getByRole("radio", { name: "15 min" }));
  fireEvent.change(
    screen.getByRole("textbox", {
      name: /what exactly would you like to improve/i,
    }),
    {
      target: { value: "I want to reduce wasted water at school." },
    },
  );
  fireEvent.click(screen.getByRole("button", { name: "Get my Quest →" }));
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("AI took too long"),
  );
  expect(
    screen.getByText(/your improvement goal is sent to AI/i),
  ).toBeInTheDocument();
  expect(screen.getByRole("combobox")).toHaveValue("water");
  expect(
    screen.getByRole("textbox", {
      name: /what exactly would you like to improve/i,
    }),
  ).toHaveValue("I want to reduce wasted water at school.");
  expect(screen.getByRole("radio", { name: "15 min" })).toBeChecked();
  expect((start.mock.calls[0][1] as FormData).get("topic")).toBe("water");
  expect((start.mock.calls[0][1] as FormData).get("focus")).toBe(
    "I want to reduce wasted water at school.",
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Get my Quest →" }),
    ).toBeEnabled(),
  );
});

it("shows a visible spinner and blocks duplicate submissions during Quest generation", async () => {
  let resolveRequest!: (result: { ok: boolean; message: string }) => void;
  start.mockImplementation(() => new Promise((resolve) => { resolveRequest = resolve; }));
  render(<BuildChoiceForm initialTopic="water" initialFocus="I want to reduce wasted water at school." />);
  const button = screen.getByRole("button", { name: "Get my Quest →" });
  fireEvent.click(button);
  const progress = await screen.findByRole("status");
  expect(progress).toHaveTextContent("AI is preparing your real-world Quest");
  expect(screen.getByRole("button", { name: /creating your quest/i })).toBeDisabled();
  expect(screen.getByRole("combobox")).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: /creating your quest/i }));
  expect(start).toHaveBeenCalledTimes(1);
  resolveRequest({ ok: false, message: "A checked failure message." });
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("A checked failure"));
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("combobox")).toBeEnabled();
  expect(screen.getByRole("textbox", { name: /what exactly/i })).toHaveValue("I want to reduce wasted water at school.");
});
