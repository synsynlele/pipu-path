import { describe, expect, it } from "vitest";
import {
  identityDestination,
  isMinor,
  isValidUsername,
  normalizeUsername,
} from "./identity";

describe("identity rules", () => {
  it("derives minor status from privacy-preserving age bands", () => {
    expect(isMinor("under_13")).toBe(true);
    expect(isMinor("16_17")).toBe(true);
    expect(isMinor("18_24")).toBe(false);
  });

  it("normalises and validates usernames", () => {
    expect(normalizeUsername("  Builder_1 ")).toBe("builder_1");
    expect(isValidUsername("Builder_1")).toBe(true);
    expect(isValidUsername("1builder")).toBe(false);
  });

  it("routes only complete identities to the application boundary", () => {
    expect(
      identityDestination({
        hasSession: false,
        hasProfile: false,
        checkpointCompleted: false,
      }),
    ).toBe("/login");
    expect(
      identityDestination({
        hasSession: true,
        hasProfile: true,
        checkpointCompleted: false,
      }),
    ).toBe("/onboarding/identity");
    expect(
      identityDestination({
        hasSession: true,
        hasProfile: true,
        checkpointCompleted: true,
      }),
    ).toBe("/app");
  });
});
Ÿ®8