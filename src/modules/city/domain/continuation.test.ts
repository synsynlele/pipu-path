import { describe, expect, it } from "vitest";
import { cityContinuation } from "./continuation";

describe("city journey continuation", () => {
  it("links practice back to the same Quest without fabricating completion", () => {
    const next = cityContinuation({
      id: "quest-1",
      title: "Interview a neighbour",
      status: "active",
    });
    expect(next.playHref).toBe("/build/play?quest=quest-1");
    expect(next.actionHref).toBe("/quests/quest-1");
    expect(next.focus).toBe("play");
  });
  it("prioritises reflection and earned progress over another game attempt", () => {
    for (const status of ["evidence_submitted", "completed"]) {
      expect(
        cityContinuation({ id: "q", title: "A Quest", status }).focus,
      ).toBe("real");
    }
  });
  it("does not link a locked Quest as an available continuation", () => {
    expect(
      cityContinuation({ id: "q", title: "Locked", status: "locked" })
        .actionHref,
    ).toBe("/quests");
    expect(cityContinuation(null).playHref).toBe("/build/play");
  });
});
