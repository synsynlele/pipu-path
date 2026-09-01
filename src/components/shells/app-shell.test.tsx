import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({ usePathname: () => "/app" }));
vi.mock("@/modules/identity/application/auth-actions", () => ({
  signOutAction: vi.fn(),
}));

describe("AppShell", () => {
  it("keeps the sign-out action visible on mobile", () => {
    const { container } = render(
      <AppShell>
        <main id="main-content">Dashboard</main>
      </AppShell>,
    );

    const button = within(container).getByRole("button", { name: "Sign out" });
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
      "pb-[calc(5.35rem+env(safe-area-inset-bottom))]",
    );
    expect(mobileNavigation.parentElement).toHaveClass(
      "pb-[env(safe-area-inset-bottom)]",
    );
  });

  it("uses a bright app chrome rather than the old full-dark shell", () => {
    const { container } = render(
      <AppShell>
        <main id="main-content">Dashboard</main>
      </AppShell>,
    );
    const header = container.querySelector("header");
    const mobileNavigation = within(container).getByRole("navigation", {
      name: "PipuPath mobile navigation",
    });

    expect(header).toHaveClass("bg-white/92");
    expect(mobileNavigation.parentElement).toHaveClass("bg-white/96");
  });
});
