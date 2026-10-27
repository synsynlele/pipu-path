import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { gardenChapter } from "../domain/chapters";
import { riverChapter } from "../domain/world-chapters";
import { emptyGardenPlot, placeGardenPiece } from "../domain/garden-layout";
import {
  createPracticeCheckpoint,
  practiceStorageKey,
} from "../domain/practice-checkpoint";
import { ResumePractice } from "./resume-practice";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("continue from the Adventure Hub", () => {
  it("offers the most recent saved world without claiming real XP", async () => {
    const garden = createPracticeCheckpoint(
      gardenChapter, 0, false, ["seeds"],
      placeGardenPiece(emptyGardenPlot(), "seeds", 0), 100,
    );
    const river = createPracticeCheckpoint(
      riverChapter, 1, false, ["cleanup"], emptyGardenPlot(), 200,
    );
    localStorage.setItem(practiceStorageKey("student", gardenChapter.id), JSON.stringify(garden));
    localStorage.setItem(practiceStorageKey("student", riverChapter.id), JSON.stringify(river));
    render(<ResumePractice userId="student" />);
    const link = await screen.findByRole("link", { name: /Continue this adventure/ });
    expect(link).toHaveAttribute("href", `/build/play/${riverChapter.id}`);
    expect(screen.getByText("The River Renewal")).toBeInTheDocument();
    expect(screen.getByText(/Device-only practice save/)).toBeInTheDocument();
  });
  it("does not surface a different user's saved adventure", () => {
    const save = createPracticeCheckpoint(
      gardenChapter, 0, false, ["seeds"],
      placeGardenPiece(emptyGardenPlot(), "seeds", 0), 100,
    );
    localStorage.setItem(practiceStorageKey("person-a", gardenChapter.id), JSON.stringify(save));
    render(<ResumePractice userId="person-b" />);
    expect(screen.queryByRole("link", { name: /Continue this adventure/ })).not.toBeInTheDocument();
  });
});
