import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
const save = vi.hoisted(() =>
  vi.fn(async () => ({
    status: "error",
    message: "That username is unavailable.",
  })),
);
vi.mock("../application/checkpoint-actions", () => ({
  completeIdentityAction: save,
}));
import { CheckpointForm } from "./checkpoint-form";
afterEach(() => {
  cleanup();
  save.mockClear();
});
it("suggests an editable username and never overwrites the learner's edit", () => {
  render(<CheckpointForm />);
  fireEvent.change(screen.getByLabelText("What should we call you?"), {
    target: { value: "Tosin A" },
  });
  expect(screen.getByLabelText("Username")).toHaveValue("tosina");
  fireEvent.change(screen.getByLabelText("Username"), {
    target: { value: "my_builder" },
  });
  fireEvent.change(screen.getByLabelText("What should we call you?"), {
    target: { value: "Tosin B" },
  });
  expect(screen.getByLabelText("Username")).toHaveValue("my_builder");
});
it("retains entered details and requires consent to be checked again after a failed save", async () => {
  render(<CheckpointForm />);
  fireEvent.change(screen.getByLabelText("What should we call you?"), {
    target: { value: "Tosin" },
  });
  fireEvent.change(screen.getByLabelText("Your age group"), {
    target: { value: "18_24" },
  });
  for (const checkbox of screen.getAllByRole("checkbox"))
    fireEvent.click(checkbox);
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Save and continue →" })
      .closest("form")!,
  );
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("unavailable"),
  );
  expect(screen.getByLabelText("What should we call you?")).toHaveValue(
    "Tosin",
  );
  expect(screen.getByLabelText("Username")).toHaveValue("tosin");
  expect(screen.getByLabelText("Your age group")).toHaveValue("18_24");
  for (const checkbox of screen.getAllByRole("checkbox"))
    expect(checkbox).not.toBeChecked();
  expect(save).toHaveBeenCalledOnce();
});
it("shows guardian guidance without offering adult AI consent to a child", () => {
  render(<CheckpointForm />);
  fireEvent.change(screen.getByLabelText("Your age group"), {
    target: { value: "13_15" },
  });
  expect(
    screen.getByText(/parent or legal guardian must approve/),
  ).toBeInTheDocument();
  expect(screen.queryByLabelText(/I agree to AI/)).not.toBeInTheDocument();
});
