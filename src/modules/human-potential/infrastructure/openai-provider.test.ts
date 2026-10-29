import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { profileSchemaForEvidence } from "./openai-provider";
describe("profile generation schema matches saved evidence boundaries", () => {
  it("constrains provenance to actual evidence and bounds saved text before generation", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const schema = profileSchemaForEvidence([id]);
    const item = schema.properties.insights.items.properties;
    expect(item.evidence.items.properties.evidenceId.enum).toEqual([id]);
    expect(item.insightKey.pattern).toBe("^[a-z][a-z0-9_]{2,79}$");
    expect(item.summary.maxLength).toBe(320);
    expect(item.title.maxLength).toBe(120);
    expect(item.uncertainties.items.properties.description.maxLength).toBe(400);
    const other = profileSchemaForEvidence([
      "22222222-2222-4222-8222-222222222222",
    ]);
    expect(
      schema.properties.insights.items.properties.evidence.items.properties
        .evidenceId.enum,
    ).toEqual([id]);
    expect(
      other.properties.insights.items.properties.evidence.items.properties
        .evidenceId.enum,
    ).not.toEqual([id]);
  });
});
