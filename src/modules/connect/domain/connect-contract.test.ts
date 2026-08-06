import { describe, expect, it } from "vitest";
import {
  commaSeparatedValues,
  connectActionSchema,
  connectProfileInputSchema,
  reportBuilderInputSchema,
} from "./connect-contract";

describe("Stage 11 Builder Connect contract", () => {
  it("accepts a complete privacy-controlled adult profile payload", () => {
    expect(
      connectProfileInputSchema.safeParse({
        interests: ["Education", "Agriculture"],
        capabilities: ["Teaching", "Research"],
        canHelpWith: "Designing practical learning experiences.",
        needsHelpWith: "Measuring outcomes across schools.",
        contactEmail: "builder@example.com",
        contactWhatsapp: "+2348000000000",
        visibility: "discoverable",
      }).success,
    ).toBe(true);
  });

  it("limits profile lists and report reasons", () => {
    expect(
      connectProfileInputSchema.safeParse({
        interests: Array.from({ length: 9 }, (_, index) => `Interest ${index}`),
        capabilities: ["Teaching"],
        canHelpWith: "",
        needsHelpWith: "",
        contactEmail: "",
        contactWhatsapp: "",
        visibility: "private",
      }).success,
    ).toBe(false);
    expect(
      reportBuilderInputSchema.safeParse({
        targetUserId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        reasonCode: "unsafe_contact",
        detail: "Asked me to move to an unapproved private channel.",
      }).success,
    ).toBe(true);
  });

  it("keeps request actions identifier-bound and deduplicates tags", () => {
    expect(
      connectActionSchema.safeParse({
        action: "send",
        targetUserId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      }).success,
    ).toBe(true);
    expect(commaSeparatedValues("Education, AI, Education")).toEqual([
      "Education",
      "AI",
    ]);
  });
});
