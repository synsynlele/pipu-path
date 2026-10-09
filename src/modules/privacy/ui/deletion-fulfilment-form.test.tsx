import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DeletionFulfilmentForm } from "./deletion-fulfilment-form";
const action = vi.hoisted(() => vi.fn());
vi.mock("../application/deletion-actions", () => ({
  fulfilAccountDeletion: action,
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const requestId = "10000000-0000-4000-8000-000000000001";
describe("operator deletion confirmation", () => {
  it("submits review confirmation and exact request ID, then prevents resubmission", async () => {
    action.mockResolvedValue({
      status: "success",
      message: "Removal verified. Request fulfilled.",
    });
    render(<DeletionFulfilmentForm requestId={requestId} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox"));
    await user.type(screen.getByLabelText("Confirm request ID"), requestId);
    await user.click(
      screen.getByRole("button", { name: "Permanently process deletion" }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Removal verified",
    );
    const data = action.mock.calls[0][1] as FormData;
    expect(data.get("request_id")).toBe(requestId);
    expect(data.get("confirm_request_id")).toBe(requestId);
    expect(data.get("review_complete")).toBe("on");
    expect(
      screen.getByRole("button", { name: "Permanently process deletion" }),
    ).toBeDisabled();
  });
  it("keeps retry available and warns about partial processing after failure", async () => {
    action.mockResolvedValue({
      status: "error",
      message: "Deletion is not confirmed. Account may be partly processed.",
    });
    render(<DeletionFulfilmentForm requestId={requestId} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox"));
    await user.type(screen.getByLabelText("Confirm request ID"), requestId);
    await user.click(
      screen.getByRole("button", { name: "Permanently process deletion" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("not confirmed");
    expect(
      screen.getByRole("button", { name: "Permanently process deletion" }),
    ).toBeEnabled();
  });
});
