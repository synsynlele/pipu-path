import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { simulationWorlds, simulationKey } from "../domain/world-simulation";
import { workingBlueprint } from "../domain/world-simulation.fixtures";
import { AdventurePathMap } from "./adventure-path-map";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Adventure Hub winding path", () => {
  it("makes the next step visible, shows all seven worlds, and keeps future missions disabled", () => {
    render(<AdventurePathMap userId="student" />);
    expect(
      screen.getByRole("heading", { name: "One mission at a time." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Practice missions completed" }),
    ).toHaveAttribute("aria-valuenow", "0");
    expect(
      screen.getByRole("link", {
        name: "Your Neighbourhood, Connect essential services: Play now",
      }),
    ).toHaveAttribute("href", "/build/neighbourhood");
    expect(
      screen.queryByRole("link", {
        name: /Your Neighbourhood, Expand reliable access: Play now/,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText(
        /Your Neighbourhood, Expand reliable access: Finish the previous/,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^Enter / })).toHaveLength(7);
    expect(
      screen.getByRole("link", { name: /Enter The Forgotten Garden/ }),
    ).toHaveAttribute("href", "/build/play/neighbourhood-garden-v1");
  });

  it("restores visible path checkpoints and jumps to the active saved lesson", async () => {
    const world = simulationWorlds[2];
    const board = workingBlueprint(world);
    const stored = {
      version: 1,
      worldId: world.id,
      board,
      proofs: [
        { before: board, after: board },
        { before: board, after: board },
      ],
      baseline: null,
      updatedAt: 1750000000000,
    };
    localStorage.setItem(
      simulationKey("student", world.id),
      JSON.stringify(stored),
    );
    const scroll = vi.fn();
    HTMLElement.prototype.scrollIntoView = scroll;
    render(<AdventurePathMap userId="student" />);
    const next = await screen.findByRole("link", {
      name: /The Forgotten Garden, Feed more households: Play now/,
    });
    await waitFor(() =>
      expect(next).toHaveAttribute("id", "adventure-current-step"),
    );
    expect(
      screen.getByRole("progressbar", { name: "Practice missions completed" }),
    ).toHaveAttribute("aria-valuenow", "2");
    expect(
      screen.getByLabelText(
        /The Forgotten Garden, Grow a food system: Completed practice/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("CONTINUE")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /Jump to my next mission/ }),
    );
    expect(scroll).toHaveBeenCalled();
  });
});
