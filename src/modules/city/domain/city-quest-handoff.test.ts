import { describe, expect, it } from "vitest";
import { cityInspiration } from "./city-inspiration";
import { CITY_HANDOFF_SERVICES, cityQuestHandoff } from "./city-quest-handoff";

describe("game to real Quest handoff", () => {
  it("provides an editable, safe starter for every tested city service", () => {
    expect(CITY_HANDOFF_SERVICES).toHaveLength(5);
    for (const id of CITY_HANDOFF_SERVICES) {
      const suggestion = cityQuestHandoff(id);
      expect(suggestion?.service).toBe(id);
      expect(cityInspiration(suggestion?.topic)).not.toBeNull();
      expect(suggestion?.focus.length).toBeGreaterThanOrEqual(12);
      expect(suggestion?.focus.length).toBeLessThanOrEqual(160);
      expect(suggestion?.focus).not.toMatch(/https?:|@|telephone|address/i);
    }
  });

  it("never reflects user content or unknown strings into Quest suggestions", () => {
    for (const invalid of [
      null,
      undefined,
      "",
      "fake-service",
      "workshop-link?redirect=https://bad.example",
      "/login",
      "<script>alert(1)</script>",
      {},
      ["workshop-link"],
    ]) {
      expect(cityQuestHandoff(invalid)).toBeNull();
    }
  });
});
