import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
vi.mock("@/modules/identity/application/auth-actions", () => ({
  signOutAction: vi.fn(async () => ({
    message: "We could not sign you out. Check your connection and try again.",
  })),
}));
import { SignOutForm } from "./sign-out-form";
afterEach(cleanup);
it("names the mobile action and exposes a failed sign-out rather than silently returning", async () => {
  render(<SignOutForm mobile />);
  const button = screen.getByRole("button", { name: "Sign out" });
  expect(button).toBeVisible();
  fireEvent.submit(button.closest("form")!);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "could not sign you out",
  );
  expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();
});
