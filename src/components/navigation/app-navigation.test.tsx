import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppNavigation } from "./app-navigation";

vi.mock("next/navigation", () => ({ usePathname: () => "/projects/active" }));

describe("AppNavigation", () => {
  it("exposes the six Builder destinations and identifies Build as current", () => {
    render(<AppNavigation />);
    expect(screen.getAllByRole("link")).toHaveLength(6);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/app",
    );
    expect(screen.getByRole("link", { name: "Journey" })).toHaveAttribute(
      "href",
      "/journey",
    );
    expect(screen.getByRole("link", { name: "Build" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Vault" })).toHaveAttribute(
      "href",
      "/portfolio",
    );
    expect(screen.getByRole("link", { name: "Connect" })).toHaveAttribute(
      "href",
      "/connect",
    );
    expect(screen.getByRole("link", { name: "Me" })).toHaveAttribute(
      "href",
      "/profile",
    );
  });

  it("keeps inactive desktop destinations visible before hover", () => {
    render(<AppNavigation />);

    const navigation = screen.getByRole("navigation", {
      name: "PipuPath application",
    });
    const list = navigation.querySelector("ul");
    const home = screen.getByRole("link", { name: "Home" });
    const build = screen.getByRole("link", { name: "Build" });

    expect(list).toHaveClass("bg-panel/95");
    expect(list).not.toHaveClass("bg-white/90");
    expect(home).toHaveClass("text-blue-100/80");
    expect(build).toHaveClass("text-primary-light");
  });

  it("gives every mobile destination a full touch target", () => {
    render(<AppNavigation mobile />);

    for (const label of [
      "Home",
      "Journey",
      "Build",
      "Vault",
      "Connect",
      "Me",
    ]) {
      expect(screen.getByRole("link", { name: label })).toHaveClass(
        "w-full",
        "touch-manipulation",
      );
    }
  });
});
