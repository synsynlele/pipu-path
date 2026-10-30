import { readFileSync } from "node:fs";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/dom";
import { mountBuildLab } from "../../../../public/games/city/build-lab-ui.mjs";
import { sanitizeLab } from "../../../../public/games/city/build-lab.mjs";
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
it("builds and tests an actual route using place and rotate controls, then invalidates the result on revision", () => {
  open();
  fireEvent.click(screen.getByRole("button", { name: "Bend" }));
  fireEvent.click(screen.getByRole("button", { name: "Rotate ↻" }));
  fireEvent.click(screen.getByRole("button", { name: /Row 2, column 1:/ }));
  fireEvent.click(screen.getByRole("button", { name: "Straight" }));
  for (const column of [2, 3, 4])
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`Row 2, column ${column}:`),
      }),
    );
  fireEvent.click(screen.getByRole("button", { name: "Bend" }));
  fireEvent.click(screen.getByRole("button", { name: "Rotate ↻" }));
  fireEvent.click(screen.getByRole("button", { name: /Row 2, column 5:/ }));
  fireEvent.click(screen.getByRole("button", { name: "Test my network" }));
  expect(screen.getByRole("status")).toHaveTextContent("It works!");
  expect(
    screen.getByRole("button", { name: "Next challenge →" }),
  ).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  fireEvent.click(screen.getByRole("button", { name: /Row 2, column 3:/ }));
  expect(screen.getByRole("status")).toHaveTextContent("Place your pieces");
  fireEvent.click(screen.getByRole("button", { name: "Test my network" }));
  expect(screen.getByRole("status")).toHaveTextContent("0 of 1 places reached");
  expect(JSON.stringify(state)).not.toContain('"xp"');
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
