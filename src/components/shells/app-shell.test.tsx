import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({ usePathname: () => "/app" }));
vi.mock("@/modules/identity/application/auth-actions", () => ({
  signOutAction: vi.fn(),
}));

describe("AppShell", () => {
  it("keeps the sign-out action visible on mobile", () => {
    render(
      <AppShell>
        <main id="main-content">Dashboard</main>
      </AppShell>,
    );

    const button = screen.getByRole("button", { name: "Sign out" });
    expect(button).toBeVisible();
    expect(button.closest("form")).not.toHaveClass("hidden");
  });
});
