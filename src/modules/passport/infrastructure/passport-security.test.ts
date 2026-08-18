import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { builderPassportShareSecretSchema } from "../domain/passport-contract";
import {
  generatePassportShareSecret,
  hashPassportShareSecret,
  passportShareRateLimitFingerprint,
} from "./passport-security";

describe("passport security", () => {
  it("generates independent high-entropy secrets in the public contract format", () => {
    const first = generatePassportShareSecret();
    const second = generatePassportShareSecret();

    expect(builderPassportShareSecretSchema.safeParse(first).success).toBe(
      true,
    );
    expect(builderPassportShareSecretSchema.safeParse(second).success).toBe(
      true,
    );
    expect(first).not.toBe(second);
    expect(first).toHaveLength(48);
  });

  it("hashes bearer secrets deterministically without retaining the raw value", () => {
    const secret = generatePassportShareSecret();
    const first = hashPassportShareSecret(secret);
    const second = hashPassportShareSecret(secret);

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toContain(secret);
  });

  it("binds rate-limit fingerprints to both share and request identity", () => {
    const shareId = "11111111-1111-4111-8111-111111111111";
    const first = passportShareRateLimitFingerprint(shareId, "198.51.100.5");
    const same = passportShareRateLimitFingerprint(shareId, "198.51.100.5");
    const otherIdentity = passportShareRateLimitFingerprint(
      shareId,
      "198.51.100.6",
    );
    const otherShare = passportShareRateLimitFingerprint(
      "22222222-2222-4222-8222-222222222222",
      "198.51.100.5",
    );

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).toBe(same);
    expect(otherIdentity).not.toBe(first);
    expect(otherShare).not.toBe(first);
  });
});
