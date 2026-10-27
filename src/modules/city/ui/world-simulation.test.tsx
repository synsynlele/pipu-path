import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  simulationWorlds,
  simulationKey,
  type SimulationSave,
} from "../domain/world-simulation";
import { workingBlueprint } from "../domain/world-simulation.fixtures";
import { WorldSimulation } from "./world-simulation";
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
it("requires normal and stress operation before recording practice proof; supports pause and resume", () => {
  vi.useFakeTimers();
  const world = simulationWorlds[0],
    board = workingBlueprint(world);
  const save: SimulationSave = {
    version: 1,
    worldId: world.id,
    board,
    proofs: [],
    baseline: null,
    updatedAt: 100,
  };
  localStorage.setItem(simulationKey("qa", world.id), JSON.stringify(save));
  render(
    <WorldSimulation
      world={world}
      userId="qa"
      questHref="/quests/owned"
      onStory={() => {}}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Resume build save" }));
  fireEvent.click(screen.getByRole("button", { name: "Run normal operation" }));
  fireEvent.click(screen.getByRole("button", { name: "Pause" }));
  act(() => vi.advanceTimersByTime(2000));
  expect(
    JSON.parse(localStorage.getItem(simulationKey("qa", world.id))!).proofs,
  ).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Run normal operation" }));
  act(() => vi.advanceTimersByTime(2000));
  expect(
    screen.getByRole("button", { name: "Run stress test" }),
  ).toBeInTheDocument();
  expect(
    JSON.parse(localStorage.getItem(simulationKey("qa", world.id))!).proofs,
  ).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Run stress test" }));
  act(() => vi.advanceTimersByTime(2000));
  expect(
    JSON.parse(localStorage.getItem(simulationKey("qa", world.id))!).proofs,
  ).toHaveLength(1);
  expect(
    screen.getByRole("link", { name: "Continue my real-world Quest →" }),
  ).toHaveAttribute("href", "/quests/owned");
});
it("diagnoses failure without recording progress and permits placing modules with keyboard", () => {
  vi.useFakeTimers();
  const world = simulationWorlds[0];
  render(
    <WorldSimulation
      world={world}
      userId="qa"
      questHref="/quests/owned"
      onStory={() => {}}
    />,
  );
  fireEvent.keyDown(screen.getByRole("button", { name: "B1: Clear ground" }), {
    key: "Enter",
  });
  expect(
    screen.getByRole("button", { name: "B1: Service corridor" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Run normal operation" }));
  act(() => vi.advanceTimersByTime(2000));
  expect(
    screen.getByRole("region", { name: "System diagnostic report" }),
  ).toBeInTheDocument();
  expect(localStorage.length).toBe(0);
});
