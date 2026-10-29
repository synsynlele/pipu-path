import { describe, expect, it } from "vitest";
import {
  emptyBlueprint,
  evaluateBlueprint,
  parseSimulation,
  placeModule,
  moveModule,
  simulationWorlds,
  WIDTH,
} from "./world-simulation";
import { workingBlueprint } from "./world-simulation.fixtures";
describe("fictional world systems", () => {
  for (const world of simulationWorlds)
    it(`${world.id}: every mission has a normal and stress-tested solution`, () => {
      const board = workingBlueprint(world);
      for (let level = 0; level < world.levels.length; level++)
        for (const stress of [false, true]) {
          const result = evaluateBlueprint(world, board, level, stress);
          expect(
            result.problems,
            `${world.id} level ${level} stress ${stress}`,
          ).toEqual([]);
          expect(result.success).toBe(true);
        }
      const alternative = [...board];
      const river = world.id === "river-renewal-v1";
      if (!river) alternative[7 * WIDTH] = null;
      alternative[7 * WIDTH + (river ? 5 : 11)] = "nature";
      expect(evaluateBlueprint(world, alternative, 0, true).success).toBe(true);
    });
  it("rejects disconnected facilities, power shortages and unreachable demand", () => {
    const world = simulationWorlds[0],
      board = emptyBlueprint();
    board[14] = "primary";
    const result = evaluateBlueprint(world, board);
    expect(result.success).toBe(false);
    expect(result.offline).toContain(14);
    expect(result.reach).toBe(0);
    const connected = workingBlueprint(world).map((t) =>
      t === "solar" ? null : t,
    );
    expect(evaluateBlueprint(world, connected).output).toBe(0);
  });
  it("makes drought, energy outages, river location, waste and heat meaningful", () => {
    for (const world of simulationWorlds) {
      let b = workingBlueprint(world);
      if (world.event === "drought")
        b = b.map((t) => (t === "support" ? null : t));
      else if (world.event === "outage") {
        let count = 0;
        b = b.map((t) => (t === "solar" && ++count > 2 ? null : t));
      } else if (world.event === "heat") {
        let count = 0;
        b = b.map((t) => (t === "solar" && ++count > 2 ? null : t));
      } else b = b.map((t) => (t === "support" ? null : t));
      const stressed = evaluateBlueprint(
        world,
        b,
        world.levels.length - 1,
        true,
      );
      expect(stressed.success, world.id).toBe(false);
    }
    const river = simulationWorlds[3];
    const b = workingBlueprint(river);
    b[1 * WIDTH + 4] = null;
    b[1 * WIDTH + 3] = "primary";
    expect(evaluateBlueprint(river, b).offline).toContain(15);
    const makers = simulationWorlds[5];
    const m = workingBlueprint(makers).map((t) => (t === "support" ? null : t));
    expect(evaluateBlueprint(makers, m).waste).toBe(12);
  });
  it("protects terrain, HQ, residential zones and budgets", () => {
    const world = simulationWorlds[3],
      b = emptyBlueprint();
    expect(placeModule(world, b, 0, "primary")).toBe(b);
    expect(placeModule(world, b, 5, "primary")).toBe(b);
    expect(placeModule(world, b, -1, "road")).toBe(b);
  });
  it("moves and swaps modules without changing construction cost or reserved terrain", () => {
    const world = simulationWorlds[0],
      b = emptyBlueprint();
    b[1] = "solar";
    b[2] = "road";
    const swapped = moveModule(world, b, 1, 2);
    expect(swapped[1]).toBe("road");
    expect(swapped[2]).toBe("solar");
    expect(moveModule(world, b, 1, 0)).toBe(b);
    expect(moveModule(simulationWorlds[3], b, 1, 5)).toBe(b);
    expect(b[1]).toBe("solar");
  });
  it("restores evaluated proofs and rejects invented completion, corruption and cross-world saves", () => {
    const world = simulationWorlds[0],
      board = workingBlueprint(world);
    const save = {
      version: 1,
      worldId: world.id,
      board,
      proofs: [{ before: board, after: board }],
      baseline: null,
      updatedAt: 100,
    };
    expect(parseSimulation(JSON.stringify(save), world)?.proofs).toHaveLength(
      1,
    );
    expect(
      parseSimulation(
        JSON.stringify({
          ...save,
          proofs: [{ before: emptyBlueprint(), after: board }],
        }),
        world,
      ),
    ).toBeNull();
    expect(
      parseSimulation(JSON.stringify(save), simulationWorlds[1]),
    ).toBeNull();
    expect(parseSimulation("{bad", world)).toBeNull();
  });
});
