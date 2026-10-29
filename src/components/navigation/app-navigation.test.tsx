import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppNavigation } from "./app-navigation";

vi.mock("next/navigation", () => ({ usePathname: () => "/projects/active" }));

afterEach(() => cleanup());

describe("AppNavigation", () => {
  it("has only Play, Real Quests and You; projects belong to Real Quests", () => {
    const { container } = render(<AppNavigation />);
    const nav = within(container).getByRole("navigation", { name: "PipuPath application" });
    expect(within(nav).getAllByRole("link")).toHaveLength(3);
    expect(within(nav).getByRole("link", { name: "Play" })).toHaveAttribute("href", "/build/play");
    expect(within(nav).getByRole("link", { name: "Real Quests" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "You" })).toHaveAttribute("href", "/profile");
  });
  it("uses a lightweight desktop nav and full-height mobile touch targets", () => {
    const desktop = render(<AppNavigation />);
    expect(desktop.container.querySelector("ul")).toHaveClass("bg-panel/95");
    desktop.unmount();
    const mobile = render(<AppNavigation mobile />);
    const nav = within(mobile.container).getByRole("navigation", { name: "PipuPath mobile navigation" });
    for (const label of ["Play", "Real Quests", "You"]) {
      expect(within(nav).getByRole("link", { name: label })).toHaveClass("w-full", "touch-manipulation");
    }
  });
});
