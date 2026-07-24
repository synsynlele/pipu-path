import { afterEach, describe, expect, it, vi } from "vitest";
import {
  parseEnvironment,
  readPublicEnvironment,
  requireSupabasePublicEnvironment,
} from "./env";

describe("parseEnvironment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

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

  it("validates the public Supabase boundary", () => {
    expect(
      requireSupabasePublicEnvironment({
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-key",
      }),
    ).toEqual({
      appUrl: "http://localhost:3000",
      url: "https://example.supabase.co",
      anonKey: "public-key",
    });
    expect(() => requireSupabasePublicEnvironment({})).toThrow(
      "Supabase public environment is not configured.",
    );
    expect(readPublicEnvironment({}).NEXT_PUBLIC_APP_URL).toBe(
      "http://localhost:3000",
    );
  });

  it("reads public values through explicit Next.js process references", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://staging.example.com");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-key");

    expect(requireSupabasePublicEnvironment()).toEqual({
      appUrl: "https://staging.example.com",
      url: "https://example.supabase.co",
      anonKey: "public-key",
    });
  });
});
