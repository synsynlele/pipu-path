import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gardenChapter } from "../domain/chapters";
import { emptyGardenPlot, placeGardenPiece } from "../domain/garden-layout";
import { createPracticeCheckpoint, practiceStorageKey } from "../domain/practice-checkpoint";
import { AdventurePathMap } from "./adventure-path-map";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Adventure Hub winding path", () => {
  it("makes the next step visible, shows all seven worlds, and keeps future missions disabled", () => {
    render(<AdventurePathMap userId="student" />);
    expect(screen.getByRole("heading", { name: "One mission at a time." })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Practice missions completed" })).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByRole("link", { name: "Your Neighbourhood, Show the way: Play now" })).toHaveAttribute(
      "href", "/build/neighbourhood",
    );
    expect(screen.queryByRole("link", { name: /Your Neighbourhood, Build a stall: Play now/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Your Neighbourhood, Build a stall: Finish the previous/)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^Enter / })).toHaveLength(7);
    expect(screen.getByRole("link", { name: /Enter The Forgotten Garden/ })).toHaveAttribute(
      "href", "/build/play/neighbourhood-garden-v1",
    );
  });

  it("restores visible path checkpoints and jumps to the active saved lesson", async () => {
    const stored = createPracticeCheckpoint(
      gardenChapter, 2, false, ["seeds"],
      placeGardenPiece(emptyGardenPlot(), "seeds", 0),
      1750000000000,
    );
    localStorage.setItem(practiceStorageKey("student", gardenChapter.id), JSON.stringify(stored));
    const scroll = vi.fn();
    HTMLElement.prototype.scrollIntoView = scroll;
    render(<AdventurePathMap userId="student" />);
    const next = await screen.findByRole("link", {
      name: /The Forgotten Garden, The community arrives: Play now/,
    });
    await waitFor(() => expect(next).toHaveAttribute("id", "adventure-current-step"));
    expect(screen.getByRole("progressbar", { name: "Practice missions completed" })).toHaveAttribute("aria-valuenow", "2");
    expect(screen.getByLabelText(/The Forgotten Garden, First planting day: Completed practice/)).toBeInTheDocument();
    expect(screen.getByText("CONTINUE")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Jump to my next mission/ }));
    expect(scroll).toHaveBeenCalled();
  });
});
