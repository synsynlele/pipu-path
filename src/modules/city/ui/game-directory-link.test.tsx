import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { GameDirectory } from "./game-directory";
const route = vi.hoisted(() => ({ pathname: "/build/neighbourhood" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
afterEach(cleanup);
it("moves the highlight to exactly the current game, including client navigation", () => {
  const view = render(<GameDirectory />);
  const paths = [
    "/build/neighbourhood",
    "/build/play",
    "/build/play/neighbourhood-garden-v1",
    "/build/play/river-renewal-v1",
    "/build/play/learning-district-v1",
    "/build/play/makers-market-v1",
    "/build/play/food-rescue-v1",
  ];
  for (const pathname of paths) {
    route.pathname = pathname;
    view.rerender(<GameDirectory />);
    const current = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAttribute("href", pathname);
    expect(current[0]).toHaveClass("bg-[#29434d]");
  }
  route.pathname = "/build/adventures";
  view.rerender(<GameDirectory />);
  expect(
    screen
      .getAllByRole("link")
      .filter((link) => link.hasAttribute("aria-current")),
  ).toHaveLength(0);
});
