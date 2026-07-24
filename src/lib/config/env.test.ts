import { describe, expect, it } from "vitest";
import { parseEnvironment } from "./env";

describe("parseEnvironment", () => {
  it("provides safe Stage 1 defaults", () => {
    expect(parseEnvironment({})).toEqual({
      APP_ENV: "development",
      LOG_LEVEL: "info",
    });
  });

  it("accepts supported values", () => {
    expect(
      parseEnvironment({
        APP_ENV: "staging",
        LOG_LEVEL: "warn",
      }),
    ).toEqual({
      APP_ENV: "staging",
      LOG_LEVEL: "warn",
    });
  });

  it("fails fast without exposing values", () => {
    expect(() =>
      parseEnvironment({
        APP_ENV: "invalid",
        LOG_LEVEL: "verbose",
      }),
    ).toThrow("Invalid application environment: APP_ENV, LOG_LEVEL");
  });
});
