import { describe, expect, it } from "vitest";
import {
  connectionRequestInputSchema,
  contactShareInputSchema,
  networkProfileInputSchema,
  parseCommaSeparatedList,
} from "./connect-contract";

describe("Builder Connect contracts", () => {
  it("normalizes unique comma-separated capabilities", () => {
    expect(parseCommaSeparatedList("Teaching, planning, Teaching")).toEqual([
      "Teaching",
      "planning",
    ]);
  });

  it("accepts bounded private and discoverable profile fields", () => {
    expect(
      networkProfileInputSchema.safeParse({
        interests: ["Education"],
        capabilities: ["Teaching"],
        canHelpWith: "I can help with practical lesson planning.",
        needsHelpWith: "I need support with product design.",
        contactEmail: "builder@example.com",
        contactWhatsapp: "+2348000000000",
        discoverable: true,
      }).success,
    ).toBe(true);
    expect(
      networkProfileInputSchema.safeParse({
        interests: Array.from({ length: 9 }, (_, index) => `Interest ${index}`),
        capabilities: [],
        canHelpWith: "",
        needsHelpWith: "",
        contactEmail: "not-an-email",
        contactWhatsapp: "1",
        discoverable: false,
      }).success,
    ).toBe(false);
  });

  it("accepts only UUID connection targets", () => {
    expect(
      connectionRequestInputSchema.safeParse({
        targetUserId: "f74ec4a7-4572-4c50-9ed7-3c40cd495862",
      }).success,
    ).toBe(true);
    expect(
      connectionRequestInputSchema.safeParse({ targetUserId: "message_me" })
        .success,
    ).toBe(false);
  });

  it("requires an accepted connection identifier for contact sharing", () => {
    expect(
      contactShareInputSchema.safeParse({
        connectionId: "f74ec4a7-4572-4c50-9ed7-3c40cd495862",
        shareEmail: true,
        shareWhatsapp: false,
      }).success,
    ).toBe(true);
  });
});
