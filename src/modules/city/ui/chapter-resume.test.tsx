import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { gardenChapter } from "../domain/chapters";
import {
  createPracticeCheckpoint,
  practiceStorageKey,
} from "../domain/practice-checkpoint";
import { emptyGardenPlot, placeGardenPiece } from "../domain/garden-layout";
import { ChapterChallenge } from "./chapter-challenge";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("optional game resume", () => {
  const key = practiceStorageKey("builder-1", gardenChapter.id);

  it("remembers a placed object after a reload only when the player opts in", async () => {
    render(<ChapterChallenge chapter={gardenChapter} userId="builder-1" />);
    const keep = await screen.findByRole("checkbox", {
      name: /Keep my place on this device/,
    });
    expect(keep).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: /Choose Plant seedlings/ }));
    fireEvent.click(screen.getByRole("button", { name: "Garden square 1: empty" }));
    expect(localStorage.getItem(key)).toBeNull();
    fireEvent.click(keep);
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(key) ?? "{}").selected).toEqual(["seeds"]);
    });

    cleanup();
    render(<ChapterChallenge chapter={gardenChapter} userId="builder-1" />);
    expect(
      await screen.findByRole("button", { name: "Garden square 1: Seedlings" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /Keep my place on this device/ }),
    ).toBeChecked();
    expect(screen.getByText(/practice has resumed on this device/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: /Keep my place on this device/ }));
    expect(localStorage.getItem(key)).toBeNull();
    expect(
      screen.getByRole("button", { name: "Garden square 1: Seedlings" }),
    ).toBeInTheDocument();
  });

  it("restores a later situation without claiming it was completed", async () => {
    const plot = placeGardenPiece(emptyGardenPlot(), "paths", 9);
    localStorage.setItem(
      key,
      JSON.stringify(
        createPracticeCheckpoint(
          gardenChapter, 2, false, ["paths"], plot, Date.now(),
        ),
      ),
    );
    render(<ChapterChallenge chapter={gardenChapter} userId="builder-1" />);
    expect((await screen.findAllByText(/The community arrives/))[0]).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Garden square 10: Walkway" })).toBeInTheDocument();
    expect(screen.getByText("2 / 3 completed")).toBeInTheDocument();
    expect(screen.queryByText("The garden comes alive.")).not.toBeInTheDocument();
  });

  it("ignores broken saves and never mixes users", async () => {
    localStorage.setItem(key, '{"version":1,"wrong":"data"}');
    render(<ChapterChallenge chapter={gardenChapter} userId="builder-2" />);
    expect(await screen.findByRole("checkbox", { name: /Keep my place on this device/ })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Garden square 1: empty" })).toBeInTheDocument();
    expect(screen.queryByText(/resumed on this device/i)).not.toBeInTheDocument();
  });
});
