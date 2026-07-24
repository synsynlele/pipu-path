import { describe, expect, it } from "vitest";
import { safeDiscoveryError } from "./discovery-errors";

describe("safeDiscoveryError", () => {
  it("maps stable codes without leaking database details", () => {
    expect(
      safeDiscoveryError(
        "DISCOVERY_SAVE_CONFLICT internal relation",
        "DISCOVERY_SAVE_FAILED",
      ),
    ).toEqual({
      code: "DISCOVERY_SAVE_CONFLICT",
      message:
        "Your Discovery changed in another tab. Refresh before saving again.",
    });
    expect(
      safeDiscoveryError("database secret", "DISCOVERY_SAVE_FAILED").message,
    ).not.toContain("database");
  });
});
