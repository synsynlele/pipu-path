import { describe, expect, it } from "vitest";
import {
  freshNeighbourhood,
  finishEncounter,
  parseNeighbourhood,
  evaluateStall,
  evaluateRoute,
  appendRoute,
  encounterReady,
} from "./neighbourhood";
const stall = [
  "roof",
  "roof",
  "roof",
  "post",
  null,
  "post",
  null,
  "counter",
  null,
] as const;
describe("connected neighbourhood", () => {
  it("gates encounters and counts repeated completion only once", () => {
    let s = freshNeighbourhood();
    expect(encounterReady(s, "mama")).toBe(false);
    expect(finishEncounter(s, "mama")).toBe(s);
    s = finishEncounter(s, "ada");
    s = finishEncounter(s, "ada");
    expect(s.completed).toEqual(["ada"]);
    expect(encounterReady(s, "timi")).toBe(true);
  });
  it("requires a supported stall and an open route that collects supplies", () => {
    expect(evaluateStall([...stall])).toBe(true);
    expect(evaluateStall(Array(9).fill("roof"))).toBe(false);
    expect(
      evaluateRoute(["home", "stores", "bridge", "square", "lane", "market"]),
    ).toBe(true);
    expect(evaluateRoute(["home", "square", "lane", "market"])).toBe(false);
    expect(evaluateRoute(["home", "stores", "bridge", "market"])).toBe(false);
    expect(appendRoute(["home"], "market")).toEqual(["home"]);
  });
  it("round-trips bounded fictional state and rejects corrupt/inconsistent saves", () => {
    const s = freshNeighbourhood();
    expect(parseNeighbourhood(JSON.stringify(s))).toEqual(s);
    for (const change of [
      { version: 2 },
      { completed: ["mama"] },
      { completed: ["ada"] },
      { position: { x: NaN, y: 40 } },
      { route: ["home", "market"] },
      { build: Array(99).fill("roof") },
      { avatar: "javascript" },
    ])
      expect(
        parseNeighbourhood(JSON.stringify({ ...s, ...change })),
      ).toBeNull();
    expect(parseNeighbourhood("broken")).toBeNull();
    const completed = {
      ...s,
      sign: "right",
      completed: ["ada", "timi", "mama"],
      build: [...stall],
      route: ["home", "stores", "bridge", "square", "lane", "market"],
    };
    expect(
      parseNeighbourhood(JSON.stringify(completed))?.completed,
    ).toHaveLength(3);
  });
});
