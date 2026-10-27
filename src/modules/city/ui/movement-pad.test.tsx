import {
  cleanup,
  fireEvent,
  render,
  screen,
  act,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MovementPad } from "./movement-pad";
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
it("walks while held and stops on cancellation or unmount", () => {
  vi.useFakeTimers();
  const move = vi.fn();
  const view = render(<MovementPad onMove={move} />);
  const right = screen.getByRole("button", { name: "Walk right" });
  right.setPointerCapture = vi.fn();
  fireEvent.pointerDown(right, { button: 0, pointerId: 1 });
  expect(move).toHaveBeenLastCalledWith(2, 0);
  act(() => {
    vi.advanceTimersByTime(240);
  });
  expect(move).toHaveBeenCalledTimes(4);
  fireEvent.pointerCancel(right, { pointerId: 1 });
  act(() => {
    vi.advanceTimersByTime(240);
  });
  expect(move).toHaveBeenCalledTimes(4);
  fireEvent.click(right, { detail: 0 });
  expect(move).toHaveBeenCalledTimes(5);
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});
