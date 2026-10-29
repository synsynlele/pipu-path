import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Neighbourhood } from "./neighbourhood";
function click(name: string | RegExp) {
  fireEvent.click(screen.getByRole("button", { name }));
}
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function start() {
  render(
    <Neighbourhood
      userId="qa-player"
      questHref="/quests/owned"
      questTitle="My real challenge"
    />,
  );
}
describe("playable neighbourhood", () => {
  it("links three encounters with visible consequences and the same real Quest", () => {
    start();
    click(/Visit Mama Jo/);
    expect(screen.getByText(/working stall before/)).toBeInTheDocument();
    click(/Meet Timi/);
    expect(screen.getByText(/First, help Ada/)).toBeInTheDocument();
    click(/Meet Ada/);
    click(/Test the invitation/);
    expect(screen.getByText(/market gate is to the right/)).toBeInTheDocument();
    click(/Point right/);
    click(/Test the invitation/);
    expect(screen.getByText(/Ada remembers your music/)).toBeInTheDocument();
    click(/Next neighbour/);
    click(/^Roof$/);
    for (const cell of [
      "Row 1, column 1",
      "Row 1, column 2",
      "Row 1, column 3",
    ])
      click(new RegExp(cell));
    click(/^Support$/);
    click(/Row 2, column 1/);
    click(/Row 2, column 3/);
    click(/^Counter$/);
    click(/Row 3, column 2/);
    click(/Test the stall/);
    expect(screen.getByText(/stall is part of the square/)).toBeInTheDocument();
    click(/Next neighbour/);
    for (const name of [
      "Supplies",
      "Footbridge",
      "Square",
      "Side lane",
      "Market",
    ])
      click(new RegExp(`^${name}$`));
    click(/Send the supplies/);
    expect(
      screen.getByText(/Mama Jo delivered the supplies/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open my real-world Quest/ }),
    ).toHaveAttribute("href", "/quests/owned");
  });
  it("saves only on request, resumes a player-specific state and removes the save on opt-out", () => {
    start();
    fireEvent.click(screen.getByRole("radio", { name: /Teal/i }));
    expect(localStorage.length).toBe(0);
    fireEvent.click(
      screen.getByRole("checkbox", { name: /Keep this adventure/ }),
    );
    expect(
      JSON.parse(localStorage.getItem("pipupath.neighbourhood.v1:qa-player")!)
        .avatar,
    ).toBe("teal");
    cleanup();
    start();
    click(/Resume device save/);
    expect(screen.getByRole("radio", { name: /Teal/i })).toBeChecked();
    fireEvent.click(
      screen.getByRole("checkbox", { name: /Keep this adventure/ }),
    );
    expect(localStorage.length).toBe(0);
  });
  it("supports keyboard movement and recovers from unavailable device storage", () => {
    start();
    const map = screen.getByRole("group", { name: /Neighbourhood movement/ });
    fireEvent.keyDown(map, { key: "ArrowRight" });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: /Keep this adventure/ }),
    );
    expect(
      screen.getByText(/Device saving is unavailable/),
    ).toBeInTheDocument();
  });
});
