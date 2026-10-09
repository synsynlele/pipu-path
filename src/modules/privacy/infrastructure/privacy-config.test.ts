import { afterEach, describe, expect, it, vi } from "vitest";
import { privacyOperationsConfig } from "./privacy-config";
vi.mock("server-only", () => ({}));

afterEach(() => vi.unstubAllEnvs());
describe("privacy operations configuration", () => {
  it("publishes the owner-supplied contact without enabling requests", () => {
    vi.stubEnv("PRIVACY_CONTACT_EMAIL", undefined);
    vi.stubEnv("PRIVACY_REQUESTS_ENABLED", "false");
    expect(privacyOperationsConfig()).toEqual({
      enabled: false,
      email: "copyartint@gmail.com",
    });
  });
  it("requires a valid contact even when enabled", () => {
    vi.stubEnv("PRIVACY_REQUESTS_ENABLED", "true");
    vi.stubEnv("PRIVACY_CONTACT_EMAIL", "");
    expect(privacyOperationsConfig()).toEqual({ enabled: false, email: null });
  });
  it("keeps a configured contact available while the form is disabled", () => {
    vi.stubEnv("PRIVACY_REQUESTS_ENABLED", "false");
    vi.stubEnv("PRIVACY_CONTACT_EMAIL", "privacy@example.test");
    expect(privacyOperationsConfig()).toEqual({
      enabled: false,
      email: "privacy@example.test",
    });
  });
  it("enables only explicitly configured operations", () => {
    vi.stubEnv("PRIVACY_REQUESTS_ENABLED", "true");
    vi.stubEnv("PRIVACY_CONTACT_EMAIL", "privacy@example.test");
    expect(privacyOperationsConfig().enabled).toBe(true);
  });
});
