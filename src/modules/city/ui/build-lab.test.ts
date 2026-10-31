import { readFileSync } from "node:fs";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/dom";
import { mountBuildLab } from "../../../../public/games/city/build-lab-ui.mjs";
import { sanitizeLab } from "../../../../public/games/city/build-lab.mjs";
type LabForTest = {
  boards: Record<string, ({ kind: string; turn: number } | null)[]>;
  tested: string[];
};
let state: unknown;
const beforeOpen = vi.fn(),
  afterClose = vi.fn();
beforeEach(() => {
  const html = readFileSync("public/games/city/index.html", "utf8");
  document.body.innerHTML =
    html.match(/<dialog id="build-lab"[\s\S]*?<\/dialog>/)![0] +
    '<details id="city-menu"><summary>City menu</summary></details>';
  const dialog = document.querySelector("dialog")!;
  Object.defineProperty(dialog, "showModal", {
    value: () => {
      dialog.open = true;
    },
  });
  Object.defineProperty(dialog, "close", {
    value: () => {
      dialog.open = false;
      dialog.dispatchEvent(new Event("close"));
    },
  });
  state = sanitizeLab(null);
  beforeOpen.mockClear();
  afterClose.mockClear();
});
afterEach(() => {
  document.querySelector("dialog")?.close();
  vi.useRealTimers();
  document.body.innerHTML = "";
});
function open() {
  mountBuildLab({
    read: () => state,
    write: (next: unknown) => {
      state = next;
    },
    beforeOpen,
    afterClose,
  }).open();
}
it("builds a real route by rotating placed connectors, then invalidates the result on revision", () => {
  open();
  const rotate = screen.getByRole("button", { name: "Rotate ↻" });
  const cell = (column: number) =>
    screen.getByRole("button", {
      name: new RegExp(`Row 2, column ${column}:`),
    });
  fireEvent.click(screen.getByRole("button", { name: "Bend" }));
  fireEvent.click(cell(1)); // Place first, then rotate the actual connector.
  fireEvent.click(rotate);
  fireEvent.click(cell(1)); // south + east
  expect(rotate).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: "Straight" }));
  for (const column of [2, 3, 4]) fireEvent.click(cell(column));
  fireEvent.click(rotate);
  for (const column of [2, 3, 4]) fireEvent.click(cell(column)); // east + west
  fireEvent.click(screen.getByRole("button", { name: "Bend" }));
  fireEvent.click(cell(5));
  fireEvent.click(rotate);
  fireEvent.click(cell(5));
  fireEvent.click(cell(5)); // south + west
  fireEvent.click(screen.getByRole("button", { name: "Test my network" }));
  expect(screen.getByRole("status")).toHaveTextContent("It works!");
  expect((state as { tested: string[] }).tested).toContain("workshop-link");
  expect(
    screen.getByRole("button", { name: "Next challenge →" }),
  ).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  fireEvent.click(cell(3));
  expect(screen.getByRole("status")).toHaveTextContent("Place your pieces");
  fireEvent.click(screen.getByRole("button", { name: "Test my network" }));
  expect(screen.getByRole("status")).toHaveTextContent("0 of 1 places reached");
  expect(JSON.stringify(state)).not.toContain('"xp"');
});
it("opens a hands-on first mission with accessible hint and no question selection", () => {
  const starter = mountBuildLab({
    read: () => state,
    write: (next: unknown) => {
      state = next;
    },
    beforeOpen,
    afterClose,
  });
  starter.open("workshop-link", { firstMission: true });
  expect(
    screen.getByText(/Your first build: power the workshop/),
  ).toBeVisible();
  expect(screen.getByText(/lost its supply/)).toBeVisible();
  expect(screen.getByText(/going above the tree/i)).not.toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: /Need a hint/ }));
  expect(screen.getByText(/going above the tree/i)).toBeVisible();
  expect(document.getElementById("lab-see-city")).toHaveAttribute("hidden");
});
it("pauses on entry, retains layouts between challenges and restores focus on close", () => {
  open();
  expect(beforeOpen).toHaveBeenCalledOnce();
  const cell = screen.getByRole("button", { name: /Row 2, column 1:/ });
  fireEvent.click(cell);
  const stored = JSON.stringify(state);
  fireEvent.change(screen.getByLabelText("Choose your challenge"), {
    target: { value: "backup-water" },
  });
  expect(screen.getByText(/survive any one broken link/)).toBeVisible();
  fireEvent.change(screen.getByLabelText("Choose your challenge"), {
    target: { value: "workshop-link" },
  });
  expect(JSON.stringify(state)).toBe(stored);
  fireEvent.click(screen.getByRole("button", { name: "Close Build Lab" }));
  expect(afterClose).toHaveBeenCalledOnce();
  expect(document.activeElement?.textContent).toBe("City menu");
});

it("keeps Rotate selected and advances only the tapped existing piece by 90 degrees", () => {
  vi.useFakeTimers();
  open();
  const rotate = screen.getByRole("button", { name: "Rotate ↻" });
  const firstCell = () =>
    screen.getByRole("button", { name: /Row 2, column 1:/ });
  const emptyCell = () =>
    screen.getByRole("button", { name: /Row 1, column 1:/ });
  fireEvent.click(screen.getByRole("button", { name: "Bend" }));
  fireEvent.click(firstCell());
  let lab = state as LabForTest;
  const before = lab.boards["workshop-link"][5];
  expect(before).toEqual({ kind: "bend", turn: 0 });
  fireEvent.click(rotate);
  expect(rotate).toHaveAttribute("aria-pressed", "true");
  expect(document.getElementById("lab-brush")).toHaveTextContent(
    "tap a placed piece",
  );
  for (let n = 1; n <= 4; n++) {
    fireEvent.click(firstCell());
    lab = state as LabForTest;
    expect(lab.boards["workshop-link"][5]).toEqual({
      kind: "bend",
      turn: n % 4,
    });
    expect(rotate).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", {
        name: /Row 2, column 1: Tap to rotate 90 degrees/,
      }),
    ).toBeEnabled();
  }
  const stored = JSON.stringify(state);
  fireEvent.click(emptyCell());
  expect(JSON.stringify(state)).toBe(stored);
  vi.advanceTimersByTime(7000);
  expect(JSON.stringify(state)).toBe(stored);
  expect(vi.getTimerCount()).toBe(0);
  fireEvent.click(rotate);
  expect(rotate).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  fireEvent.click(firstCell());
  expect(
    (state as LabForTest).boards["workshop-link"][5],
  ).toBeNull();
});

it("Rotate never mutates fixed objects, switches off on tool change, and restores tested status correctly", () => {
  open();
  const rotate = screen.getByRole("button", { name: "Rotate ↻" });
  const first = () => screen.getByRole("button", { name: /Row 2, column 1:/ });
  fireEvent.click(screen.getByRole("button", { name: "Straight" }));
  fireEvent.click(first());
  fireEvent.click(rotate);
  expect(
    screen.getByRole("button", { name: /Row 3, column 1: Supply/ }),
  ).toBeDisabled();
  expect(
    screen.getByRole("button", { name: /Row 3, column 3: Protected tree/ }),
  ).toBeDisabled();
  fireEvent.click(first());
  expect(
    (state as LabForTest).boards["workshop-link"][5],
  ).toEqual({
    kind: "straight",
    turn: 1,
  });
  fireEvent.click(screen.getByRole("button", { name: "Junction" }));
  expect(rotate).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(first());
  expect(
    (state as LabForTest).boards["workshop-link"][5],
  ).toEqual({
    kind: "junction",
    turn: 0,
  });
  fireEvent.click(rotate);
  document.querySelector("dialog")!.close();
  expect(vi.getTimerCount()).toBe(0);
});
