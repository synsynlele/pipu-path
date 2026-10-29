import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { StallWorkbench } from "./stall-workbench";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it("places dragged materials, swaps occupied cells and cancels outside drops", () => {
  function Example() {
    const [build, setBuild] = useState<("post" | "counter" | "roof" | null)[]>([
      "post",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
    return <StallWorkbench build={build} onChange={setBuild} />;
  }
  render(<Example />);
  const board = screen.getByLabelText("Stall assembly board");
  vi.spyOn(board, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 300,
    height: 300,
  } as DOMRect);
  const capture = vi.fn();
  const drag = (source: HTMLElement, x: number, y: number) => {
    source.setPointerCapture = capture;
    fireEvent.pointerDown(source, {
      button: 0,
      pointerId: 1,
      clientX: 400,
      clientY: 400,
    });
    fireEvent.pointerMove(source, { pointerId: 1, clientX: x, clientY: y });
    fireEvent.pointerUp(source, { pointerId: 1, clientX: x, clientY: y });
  };
  drag(screen.getByRole("button", { name: /^Roof$/ }), 150, 50);
  expect(
    screen.getByRole("button", { name: "Row 1, column 2: roof" }),
  ).toBeInTheDocument();
  drag(screen.getByRole("button", { name: "Row 1, column 2: roof" }), 50, 50);
  expect(
    screen.getByRole("button", { name: "Row 1, column 1: roof" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Row 1, column 2: post" }),
  ).toBeInTheDocument();
  drag(screen.getByRole("button", { name: "Row 1, column 1: roof" }), -50, 50);
  expect(
    screen.getByRole("button", { name: "Row 1, column 1: roof" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/Your pieces are unchanged/)).toBeInTheDocument();
});
