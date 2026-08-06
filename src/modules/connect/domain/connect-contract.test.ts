import { describe, expect, it } from "vitest";
import {
  connectionRequestInputSchema,
  networkProfileInputSchema,
  parseCommaSeparatedList,
} from "./connect-contract";

describe("Builder Connect contracts", () => {
  it("normalizes unique comma-separated capabilities", () => {
    expect(
      parseCommaSeparatedList("Teaching, planning, Teaching"),
    ).toEqual(["Teaching", "planning"]);
  });

  it("requires a complete bounded discovery profile", () => {
    expect(
      networkProfileInputSchema.safeParse({
        headline: "I help young people build practical learning projects.",
        canHelpWith: ["Teaching"],
        needsHelpWith: ["Product design"],
        interests: ["Education"],
        discoverable: true,
      }).success,
    ).toBe(true);
    expect(
      networkProfileInputSchema.safeParse({
        headline: "Too short",
        canHelpWith: [],
        needsHelpWith: [],
        interests: [],
        discoverable: true,
      }).success,
    ).toBe(false);
  });

  it("rejects free-form connection reasons", () => {
    expect(
      connectionRequestInputSchema.safeParse({
        recipientId: "f74ec4a7-4572-4c50-9ed7-3c40cd495862",
        reason: "message_me",
      }).success,
    ).toBe(false);
  });
});
