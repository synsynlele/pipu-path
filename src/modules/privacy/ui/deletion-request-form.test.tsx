import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DeletionRequestForm } from "./deletion-request-form";

const action = vi.hoisted(() => vi.fn());
vi.mock("../application/deletion-actions", () => ({
  requestAccountDeletion: action,
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("deletion request form", () => {
  it("shows a truthful receipt and prevents duplicate submission after success", async () => {
    action.mockResolvedValue({
      status: "success",
      message: "Request saved. Your account has not been deleted.",
    });
    render(<DeletionRequestForm />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: "Request account deletion" }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "has not been deleted",
    );
    expect(
      screen.getByRole("button", { name: "Request saved" }),
    ).toBeDisabled();
  });
  it("keeps the form available after a failed save", async () => {
    action.mockResolvedValue({
      status: "error",
      message: "Your request could not be saved.",
    });
    render(<DeletionRequestForm />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: "Request account deletion" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "could not be saved",
    );
    expect(
      screen.getByRole("button", { name: "Request account deletion" }),
    ).toBeEnabled();
  });
});
