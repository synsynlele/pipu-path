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
  it("keeps the full PipuPath identity and account action in the mobile header", () => {
    const { container } = render(
      <AppShell>
        <main id="main-content">Dashboard</main>
      </AppShell>,
    );

    const mobileHeader = container.querySelector("header.lg\\:hidden");
    expect(mobileHeader).not.toBeNull();

    const mobileHeaderQueries = within(mobileHeader as HTMLElement);
    const button = mobileHeaderQueries.getByRole("button", {
      name: "Sign out",
    });
    expect(button).toBeVisible();
    expect(button.closest("form")).not.toHaveClass("hidden");
    expect(
      mobileHeaderQueries.getByRole("link", {
        name: "PipuPath home",
      }),
    ).toBeVisible();
    expect(mobileHeaderQueries.getByText("PipuPath")).toBeVisible();
    expect(
      mobileHeaderQueries.getByText("University for Human Potential"),
    ).toBeVisible();
    expect(
      mobileHeaderQueries.queryByRole("button", {
        name: "Install PipuPath",
      }),
    ).not.toBeInTheDocument();
    expect(
      mobileHeaderQueries.queryByRole("button", {
        name: "Download PipuPath Lite",
      }),
    ).not.toBeInTheDocument();
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
