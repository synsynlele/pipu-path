import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({ usePathname: () => "/app" }));
vi.mock("@/modules/identity/application/auth-actions", () => ({
  signOutAction: vi.fn(),
}));

describe("AppShell", () => {
  it("keeps a dedicated sign-out action in the mobile header", () => {
    const { container } = render(
      <AppShell>
        <main id="main-content">Dashboard</main>
      </AppShell>,
    );

    const mobileHeader = container.querySelector("header.lg\\:hidden");
    expect(mobileHeader).not.toBeNull();

    const button = within(mobileHeader as HTMLElement).getByRole("button", {
      name: "Sign out",
    });
    expect(button).toBeVisible();
    expect(button.closest("form")).not.toHaveClass("hidden");
  });

  it("reserves the phone safe area below fixed mobile navigation", () => {
    const { container } = render(
      <AppShell>
        <main id="main-content">Dashboard</main>
      </AppShell>,
    );
    const mobileNavigation = within(container).getByRole("navigation", {
      name: "PipuPath mobile navigation",
    });

    expect(container.firstElementChild).toHaveClass(
      "pb-[calc(5.5rem+env(safe-area-inset-bottom))]",
    );
    expect(mobileNavigation.parentElement).toHaveClass(
      "pb-[env(safe-area-inset-bottom)]",
    );
  });
});
