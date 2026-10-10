import { afterEach, expect, it, vi } from "vitest";
import { assertPrivacyDrillRequest, privacyDrillScope } from "./privacy-config";
vi.mock("server-only", () => ({}));
afterEach(() => vi.unstubAllEnvs());
const requestId = "10000000-0000-4000-8000-000000000001";
const userId = "10000000-0000-4000-8000-000000000002";
function configure() {
  vi.stubEnv("PRIVACY_DRILL_MODE", "true");
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("PRIVACY_DRILL_REQUEST_ID", requestId);
  vi.stubEnv("PRIVACY_DRILL_USER_ID", userId);
}
it("denies another request in a correctly scoped drill", () => {
  configure();
  expect(privacyDrillScope()).toEqual({ requestId, userId });
  expect(() => assertPrivacyDrillRequest(requestId)).not.toThrow();
  expect(() => assertPrivacyDrillRequest(userId)).toThrow(
    "PRIVACY_DRILL_REQUEST_DENIED",
  );
});
it("fails closed if fixture configuration is missing", () => {
  configure();
  vi.stubEnv("PRIVACY_DRILL_USER_ID", undefined);
  expect(() => assertPrivacyDrillRequest(requestId)).toThrow();
});
it("refuses a drill on production", () => {
  configure();
  vi.stubEnv("VERCEL_ENV", "production");
  expect(() => privacyDrillScope()).toThrow("PRIVACY_DRILL_REQUIRES_PREVIEW");
});
