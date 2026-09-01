import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppNavigation } from "./app-navigation";

vi.mock("next/navigation", () => ({ usePathname: () => "/projects/active" }));

describe("AppNavigation", () => {
  it("exposes five human destinations and keeps Build current for project work", () => {
    const { container } = render(<AppNavigation />);
    const navigation = within(container).getByRole("navigation", {
      name: "PipuPath application",
    });

    expect(within(navigation).getAllByRole("link")).toHaveLength(5);
    expect(
      within(navigation).getByRole("link", { name: "Home" }),
    ).toHaveAttribute("href", "/app");
    expect(
      within(navigation).getByRole("link", { name: "Discover" }),
    ).toHaveAttribute("href", "/discover");
    expect(
      within(navigation).getByRole("link", { name: "Build" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(navigation).getByRole("link", { name: "Connect" }),
    ).toHaveAttribute("href", "/connect");
    expect(
      within(navigation).getByRole("link", { name: "Profile" }),
    ).toHaveAttribute("href", "/profile");
  });

  it("uses the bright social-grade desktop treatment without hiding inactive destinations", () => {
    const { container } = render(<AppNavigation />);
    const navigation = within(container).getByRole("navigation", {
      name: "PipuPath application",
    });
    const list = navigation.querySelector("ul");
    const home = within(navigation).getByRole("link", { name: "Home" });
    const build = within(navigation).getByRole("link", { name: "Build" });

    expect(list).toHaveClass("bg-[#f7f8fc]");
    expect(home).toHaveClass("text-slate-500");
    expect(build).toHaveClass("text-[#5757e8]");
  });

  it("gives every mobile destination a full touch target and elevates Build", () => {
    const { container } = render(<AppNavigation mobile />);
    const navigation = within(container).getByRole("navigation", {
      name: "PipuPath mobile navigation",
    });

    for (const label of ["Home", "Discover", "Build", "Connect", "Profile"]) {
      expect(within(navigation).getByRole("link", { name: label })).toHaveClass(
        "w-full",
        "touch-manipulation",
      );
    }

    const build = within(navigation).getByRole("link", { name: "Build" });
    expect(build.querySelector("span[aria-hidden='true']")).toHaveClass(
      "size-12",
      "rounded-full",
    );
  });
});
