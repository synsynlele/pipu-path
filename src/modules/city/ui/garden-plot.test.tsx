import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { gardenChapter } from "../domain/chapters";
import { emptyGardenPlot, type GardenPlotState } from "../domain/garden-layout";
import { GardenPlot } from "./garden-plot";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Example() {
  const [plot, setPlot] = useState<GardenPlotState>(emptyGardenPlot);
  return (
    <GardenPlot
      choices={gardenChapter.choices}
      plot={plot}
      onChange={setPlot}
    />
  );
}

it("supports keyboard and mobile tap building without horizontal card dependence", () => {
  render(<Example />);
  fireEvent.click(
    screen.getByRole("button", { name: /Choose Plant seedlings/ }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Garden square 1: empty" }),
  );
  expect(
    screen.getByRole("button", { name: "Garden square 1: Seedlings" }),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Garden square 1: Seedlings" }),
  );
  expect(
    screen.getByRole("button", { name: "Garden square 1: empty" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("group", { name: /Four by four garden/ }),
  ).toHaveClass("grid-cols-4");
});

it("places a material by pointer drag and leaves out-of-bounds drops untouched", () => {
  render(<Example />);
  const board = screen.getByRole("group", { name: /Four by four garden/ });
  vi.spyOn(board, "getBoundingClientRect").mockReturnValue({
    left: 10,
    top: 10,
    width: 320,
    height: 320,
  } as DOMRect);
  const tool = screen.getByRole("button", { name: /Choose Set up watering/ });
  tool.setPointerCapture = vi.fn();
  const drag = (x: number, y: number) => {
    fireEvent.pointerDown(tool, {
      pointerId: 5,
      pointerType: "touch",
      clientX: 400,
      clientY: 400,
    });
    fireEvent.pointerMove(tool, { pointerId: 5, clientX: x, clientY: y });
    fireEvent.pointerUp(tool, { pointerId: 5, clientX: x, clientY: y });
  };
  drag(290, 50); // rightmost tile, top row
  expect(
    screen.getByRole("button", { name: "Garden square 4: Water" }),
  ).toBeInTheDocument();
  drag(500, 500); // outside the board
  expect(
    screen.getByRole("button", { name: "Garden square 4: Water" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/Drop inside the garden/)).toBeInTheDocument();
});

it("tapping an occupied square removes its own piece even after changing tools", () => {
  render(<Example />);
  fireEvent.click(
    screen.getByRole("button", { name: /Choose Plant seedlings/ }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Garden square 1: empty" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: /Choose Set up watering/ }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Garden square 1: Seedlings" }),
  );
  expect(
    screen.getByRole("button", { name: "Garden square 1: empty" }),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Garden square 1: empty" }),
  );
  expect(
    screen.getByRole("button", { name: "Garden square 1: Water" }),
  ).toBeInTheDocument();
});

it("lets players undo the last placement without clearing their earlier work", () => {
  render(<Example />);
  fireEvent.click(
    screen.getByRole("button", { name: /Choose Plant seedlings/ }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Garden square 1: empty" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: /Choose Set up watering/ }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Garden square 2: empty" }),
  );
  fireEvent.click(screen.getByRole("button", { name: /Undo move/ }));
  expect(
    screen.getByRole("button", { name: "Garden square 2: empty" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Garden square 1: Seedlings" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Undo move/ }));
  expect(
    screen.getByRole("button", { name: "Garden square 1: empty" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Undo move/ })).toBeDisabled();
});
