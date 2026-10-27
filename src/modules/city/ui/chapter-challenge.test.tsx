import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { gardenChapter } from "../domain/chapters";
import { ChapterChallenge } from "./chapter-challenge";

afterEach(cleanup);

function choose(name: string) {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(name, "i") }));
}
function place(choice: string, square: number) {
  choose(choice);
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`Garden square ${square}:`) }));
}
function makeWorkingPlan() {
  place("Plant seedlings", 1);
  place("Clear accessible paths", 10);
  place("Set up watering", 2);
  place("Invite neighbours", 13);
}
describe("cinematic garden chapter", () => {
  it("completes two practice scenarios without granting XP", () => {
    render(<ChapterChallenge chapter={gardenChapter} />);
    expect(
      screen.getByRole("heading", { name: "The Forgotten Garden" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/No XP awarded/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /All adventures/ }),
    ).toHaveAttribute("href", "/build/adventures");
    makeWorkingPlan();
    fireEvent.click(screen.getByRole("button", { name: /Test my plan/ }));
    expect(screen.getByText("The garden comes alive.")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /See what happens next/ }),
    );
    expect(screen.getByText(/Rain arrives/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Garden square 1: Seedlings/ })).toBeInTheDocument();
    // The old solution no longer fits: swap watering for seating.
    fireEvent.click(screen.getByRole("button", { name: /Test my plan/ }));
    expect(screen.getByText(/Not quite/)).toBeInTheDocument();
    place("Set up watering", 2);
    place("Build seating", 11);
    fireEvent.click(screen.getByRole("button", { name: /Test my plan/ }));
    expect(screen.getByText("The garden comes alive.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Face the dry week/ }));
    expect(screen.getByText(/dry week is coming/i)).toBeInTheDocument();
    makeWorkingPlan();
    fireEvent.click(screen.getByRole("button", { name: /Test my plan/ }));
    expect(screen.getByText("The garden comes alive.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Next situation/ }));
    place("Plant seedlings", 1);
    place("Clear accessible paths", 10);
    place("Invite neighbours", 13);
    place("Build seating", 11);
    fireEvent.click(screen.getByRole("button", { name: /Test my plan/ }));
    expect(screen.getByText("The garden comes alive.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Find a real-world Quest/ }),
    ).toHaveAttribute("href", "/quests");
  });
  it("clears stale feedback when a player changes a choice", () => {
    render(<ChapterChallenge chapter={gardenChapter} />);
    place("Plant seedlings", 1);
    fireEvent.click(screen.getByRole("button", { name: /Test my plan/ }));
    expect(screen.getByText(/Not quite/)).toBeInTheDocument();
    place("Clear accessible paths", 10);
    expect(screen.queryByText(/Not quite/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Garden square 10: Walkway/ }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Garden square 10: Walkway/ }));
    expect(
      screen.getByRole("button", { name: /Garden square 10: empty/ }),
    ).toBeInTheDocument();
  });
});
