import { afterEach, describe, expect, it, vi } from "vitest";
import {
  parseEnvironment,
  readPublicEnvironment,
  requireGeminiEnvironment,
  requireOpenAIEnvironment,
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

  it("keeps OpenAI configuration server-only and fails safely when missing", () => {
    expect(
      requireOpenAIEnvironment({
        OPENAI_API_KEY: "server-secret",
        OPENAI_MODEL: "gpt-5-mini",
      }),
    ).toEqual({ apiKey: "server-secret", model: "gpt-5-mini" });
    expect(() => requireOpenAIEnvironment({})).toThrow(
      "OpenAI server environment is not configured.",
    );
  });

  it("retains Gemini as an inactive server-only rollback configuration", () => {
    expect(
      requireGeminiEnvironment({
        GEMINI_API_KEY: "server-secret",
        GEMINI_MODEL: "gemini-3.6-flash",
      }),
    ).toEqual({ apiKey: "server-secret", model: "gemini-3.6-flash" });
    expect(() => requireGeminiEnvironment({})).toThrow(
      "Gemini server environment is not configured.",
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
