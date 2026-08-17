import { describe, expect, it } from "vitest";
import {
  capabilityLevelLabel,
  capabilityVerificationLabel,
  deriveCapabilityLevel,
} from "./living-profile-contract";

describe("Living Builder Profile capability rules", () => {
  it("keeps a single Quest signal at practicing", () => {
    expect(deriveCapabilityLevel(1, 1)).toBe("practicing");
  });

  it("treats one strong completed Project or collaboration signal as demonstrated", () => {
    expect(deriveCapabilityLevel(2, 1)).toBe("demonstrated");
  });

  it("requires both enough strength and repeated evidence for the highest state", () => {
    expect(deriveCapabilityLevel(4, 1)).toBe("demonstrated");
    expect(deriveCapabilityLevel(3, 3)).toBe("demonstrated");
    expect(deriveCapabilityLevel(4, 2)).toBe("repeatedly_demonstrated");
  });

  it("uses plain-language labels without deterministic identity claims", () => {
    expect(capabilityLevelLabel("practicing")).toBe("Practicing");
    expect(capabilityLevelLabel("repeatedly_demonstrated")).toBe(
      "Repeatedly demonstrated",
    );
    expect(capabilityVerificationLabel("mutual_collaboration")).toBe(
      "Mutual collaboration evidence",
    );
  });
});
