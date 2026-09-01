import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({ usePathname: () => "/app" }));
vi.mock("@/modules/identity/application/auth-actions", () => ({
  signOutAction: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

describe("AppShell", () => {
  it("keeps the full PipuPath identity and dedicated actions in the mobile header", () => {
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
    expect(
      within(mobileHeader as HTMLElement).getByRole("link", {
        name: "PipuPath home",
      }),
    ).toBeVisible();
    expect(
      within(mobileHeader as HTMLElement).getByText("PipuPath"),
    ).toBeVisible();
    expect(
      within(mobileHeader as HTMLElement).getByText(
        "University for Human Potential",
      ),
    ).toBeVisible();
    expect(
      within(mobileHeader as HTMLElement).getByRole("button", {
        name: "Install PipuPath",
      }),
    ).toBeVisible();
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
