import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  warn: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ rpc: mocks.rpc }),
}));

vi.mock("@/lib/config/env", () => ({
  requireSupabasePublicEnvironment: () => ({
    url: "https://example.supabase.co",
    anonKey: "test-anon-key",
  }),
}));

vi.mock("@/lib/observability/logger", () => ({
  createLogger: () => ({ warn: mocks.warn }),
}));

import { allowAuthAttempt } from "./rate-limit";

describe("allowAuthAttempt", () => {
  beforeEach(() => {
    mocks.rpc.mockReset();
    mocks.warn.mockReset();
  });

  it("rejects unknown actions without calling the database", async () => {
    await expect(allowAuthAttempt("unknown", "203.0.113.10")).resolves.toBe(
      false,
    );
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("returns the durable database decision for allowed auth actions", async () => {
    mocks.rpc.mockResolvedValue({ data: true, error: null });

    await expect(
      allowAuthAttempt("signin", "203.0.113.10", 5, 120),
    ).resolves.toBe(true);

    expect(mocks.rpc).toHaveBeenCalledWith(
      "consume_stage10_auth_rate_limit",
      expect.objectContaining({
        action_input: "signin",
        limit_input: 5,
        window_seconds_input: 120,
      }),
    );
  });

  it("fails closed when the durable rate-limit check fails", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { message: "database unavailable" },
    });

    await expect(allowAuthAttempt("recovery", "203.0.113.10")).resolves.toBe(
      false,
    );
    expect(mocks.warn).toHaveBeenCalledWith("auth_rate_limit_check_failed", {
      action: "recovery",
    });
  });
});
