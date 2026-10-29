import { describe, expect, it } from "vitest";
import { adventureTrail } from "./adventure-trail";

describe("a single evidence-backed adventure trail", () => {
  it("starts with playable practice but never pretends evidence exists", () => {
    const steps = adventureTrail(null);
    expect(steps.map((step) => step.state)).toEqual([
      "current",
      "ready",
      "waiting",
      "waiting",
    ]);
    expect(steps[0].href).toBe("/build/play");
    expect(steps[1].href).toBe("/quests");
    expect(steps[2].href).toBeNull();
  });

  it("keeps locked Quests out of actionable links", () => {
    const steps = adventureTrail({
      id: "q1",
      title: "Hidden",
      status: "locked",
    });
    expect(steps[0].href).toBe("/build/play");
    expect(steps[1].href).toBe("/quests");
    expect(steps[3].state).toBe("waiting");
  });

  it("makes real action prominent while proof is still outstanding", () => {
    const available = adventureTrail({
      id: "q1",
      title: "Listen",
      status: "available",
    });
    const active = adventureTrail({
      id: "q1",
      title: "Listen",
      status: "active",
    });
    expect(available[1].state).toBe("ready");
    expect(available[2].href).toBeNull();
    expect(active[1].state).toBe("current");
    expect(active[2].state).toBe("next");
    expect(active[2].href).toBe("/quests/q1");
    expect(active[3].state).toBe("waiting");
    expect(active[0].state).toBe("practice");
  });

  it("shows proof and reflection only when the Quest says so", () => {
    const evidence = adventureTrail({
      id: "q1",
      title: "Listen",
      status: "evidence_submitted",
    });
    const completed = adventureTrail({
      id: "q1",
      title: "Listen",
      status: "completed",
    });
    expect(evidence.map((step) => step.state)).toEqual([
      "practice",
      "saved",
      "saved",
      "current",
    ]);
    expect(evidence[3].href).toBe("/quests/q1");
    expect(completed.map((step) => step.state)).toEqual([
      "practice",
      "saved",
      "saved",
      "saved",
    ]);
    expect(completed[3].hint).toBe("Reflection complete");
  });
});
