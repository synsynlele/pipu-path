import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { gardenChapter } from "../domain/chapters";
import { ChapterChallenge } from "./chapter-challenge";

afterEach(cleanup);

function choose(name: string) {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(name, "i") }));
}
function makeWorkingPlan() {
  choose("Plant seedlings");
  choose("Clear accessible paths");
  choose("Set up watering");
  choose("Invite neighbours");
}
describe("cinematic garden chapter", () => {
  it("completes two practice scenarios without granting XP", () => {
    render(<ChapterChallenge chapter={gardenChapter} />);
    expect(screen.getByRole("heading", { name: "The Forgotten Garden" })).toBeInTheDocument();
    expect(screen.getByText(/No XP awarded/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /All adventures/ })).toHaveAttribute("href", "/build/adventures");
    makeWorkingPlan();
    fireEvent.click(screen.getByRole("button", { name: /Test my plan/ }));
    expect(screen.getByText("The garden comes alive.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Face the dry week/ }));
    expect(screen.getByText(/dry week is coming/i)).toBeInTheDocument();
    makeWorkingPlan();
    fireEvent.click(screen.getByRole("button", { name: /Test my plan/ }));
    expect(screen.getByText("The garden comes alive.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Find a real-world Quest/ })).toHaveAttribute("href", "/quests");
  });
  it("clears stale feedback when a player changes a choice", () => {
    render(<ChapterChallenge chapter={gardenChapter} />);
    choose("Plant seedlings");
    fireEvent.click(screen.getByRole("button", { name: /Test my plan/ }));
    expect(screen.getByText(/Not quite/)).toBeInTheDocument();
    choose("Clear accessible paths");
    expect(screen.queryByText(/Not quite/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Clear accessible paths/ })).toHaveAttribute("aria-pressed", "true");
    choose("Clear accessible paths");
    expect(screen.getByRole("button", { name: /Clear accessible paths/ })).toHaveAttribute("aria-pressed", "false");
  });
});
