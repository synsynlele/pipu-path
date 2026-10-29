import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import {
  profileSchemaForEvidence,
  flattenProfileSections,
} from "./openai-provider";
describe("profile generation schema matches saved evidence boundaries", () => {
  it("constrains provenance to actual evidence and bounds saved text before generation", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const schema = profileSchemaForEvidence([id]);
    const item =
      schema.properties.sections.properties.emerging_strengths.items.properties;
    expect(item.evidence.items.properties.evidenceId.enum).toEqual([id]);
    expect(item.insightKey.pattern).toBe("^[a-z][a-z0-9_]{2,79}$");
    expect(item.summary.maxLength).toBe(320);
    expect(item.title.maxLength).toBe(120);
    expect(item.uncertainties.items.properties.description.maxLength).toBe(400);
    const other = profileSchemaForEvidence([
      "22222222-2222-4222-8222-222222222222",
    ]);
    expect(
      schema.properties.sections.properties.emerging_strengths.items.properties
        .evidence.items.properties.evidenceId.enum,
    ).toEqual([id]);
    expect(
      other.properties.sections.properties.emerging_strengths.items.properties
        .evidence.items.properties.evidenceId.enum,
    ).not.toEqual([id]);
  });
});

it("requires all six sections with two strengths and one entry in every other section", () => {
  const schema = profileSchemaForEvidence([
    "11111111-1111-4111-8111-111111111111",
  ]);
  const sections = schema.properties.sections;
  expect(sections.required).toHaveLength(6);
  for (const key of sections.required) {
    expect(sections.properties[key].minItems).toBe(
      key === "emerging_strengths" ? 2 : 1,
    );
    expect(sections.properties[key].maxItems).toBe(
      key === "emerging_strengths" ? 2 : 1,
    );
    expect(
      sections.properties[key].items.properties.profileSection.enum,
    ).toEqual([key]);
  }
});
it("flattens only supplied sections, never fabricating missing insights", () => {
  const keys = profileSchemaForEvidence([]).properties.sections.required;
  const sections = Object.fromEntries(
    keys.map((key) => [key, [{ profileSection: key }]]),
  );
  expect(
    flattenProfileSections({
      schemaVersion: "hpi-profile-v1",
      summary: "Test",
      sections,
    }),
  ).toEqual({
    schemaVersion: "hpi-profile-v1",
    summary: "Test",
    insights: keys.map((key) => ({ profileSection: key })),
  });
  delete sections.best_next_direction;
  const malformed = { sections };
  expect(flattenProfileSections(malformed)).toBe(malformed);
});
