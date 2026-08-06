import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  publicEnv: vi.fn(),
  serverEnv: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/config/env", () => ({
  requireSupabasePublicEnvironment: mocks.publicEnv,
  readServerEnvironment: mocks.serverEnv,
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { getSession: mocks.getSession },
  })),
}));

import {
  callAuthenticatedConnectRpc,
  callServiceRoleStage11Rpc,
} from "./connect-rpc";

describe("Stage 11 Connect RPC clients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.publicEnv.mockReturnValue({
      url: "https://project.supabase.co",
      anonKey: "anon-key",
    });
    mocks.serverEnv.mockReturnValue({
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
    });
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: "user-token" } },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );
  });

  it("posts authenticated RPCs with the user's access token", async () => {
    await expect(
      callAuthenticatedConnectRpc("search_stage11_builders", {
        limit_input: 5,
      }),
    ).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      "https://project.supabase.co/rest/v1/rpc/search_stage11_builders",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          apikey: "anon-key",
          Authorization: "Bearer user-token",
        }),
        body: JSON.stringify({ limit_input: 5 }),
      }),
    );
  });

  it("rejects authenticated RPCs without a session", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    await expect(callAuthenticatedConnectRpc("anything")).rejects.toThrow(
      "CONNECT_ACCESS_DENIED",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns undefined for successful empty responses", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));
    await expect(callAuthenticatedConnectRpc("empty")).resolves.toBeUndefined();
  });

  it("surfaces bounded Supabase RPC errors", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("CONNECT_REQUEST_EXISTS", { status: 400 }),
    );
    await expect(callAuthenticatedConnectRpc("send")).rejects.toThrow(
      "CONNECT_REQUEST_EXISTS",
    );
  });

  it("uses a status fallback when the error body is empty", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("", { status: 503 }));
    await expect(callAuthenticatedConnectRpc("send")).rejects.toThrow(
      "CONNECT_RPC_503",
    );
  });

  it("posts service-role persistence RPCs without exposing the key", async () => {
    await expect(
      callServiceRoleStage11Rpc("persist_stage11_journey_continuation", {
        request_id_input: "request-1",
      }),
    ).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      "https://project.supabase.co/rest/v1/rpc/persist_stage11_journey_continuation",
      expect.objectContaining({
        headers: expect.objectContaining({
          apikey: "service-key",
          Authorization: "Bearer service-key",
        }),
      }),
    );
  });

  it("refuses service RPCs when the server key is missing", async () => {
    mocks.serverEnv.mockReturnValue({ SUPABASE_SERVICE_ROLE_KEY: undefined });
    await expect(callServiceRoleStage11Rpc("persist")).rejects.toThrow(
      "SUPABASE_SERVICE_ROLE_REQUIRED",
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
