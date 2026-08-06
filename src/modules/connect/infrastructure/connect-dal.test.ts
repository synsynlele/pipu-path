import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("./connect-rpc", () => ({
  callAuthenticatedConnectRpc: mocks.rpc,
}));

import {
  builderMatchesSearch,
  getBuilderConnectProfile,
  getConnectHomeState,
} from "./connect-dal";

const builder = {
  userId: "11111111-1111-4111-8111-111111111111",
  username: "builder-two",
  preferredName: "Builder Two",
  missionTitle: "Help students study",
  missionStatement: "Build practical learning resources for young people.",
  interests: ["Education"],
  capabilities: ["Teaching"],
  canHelpWith: "Lesson planning",
  needsHelpWith: "Product design",
  relationship: "none" as const,
};

const state = {
  eligible: true,
  profile: null,
  discover: [builder],
  incoming: [],
  sent: [],
  connections: [],
  blocked: [],
};

describe("Connect data access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rpc.mockResolvedValue(state);
  });

  it("loads the allow-listed Connect state in one RPC", async () => {
    await expect(getConnectHomeState()).resolves.toEqual(state);
    expect(mocks.rpc).toHaveBeenCalledWith("get_stage11_connect_state");
  });

  it("filters the allow-listed discovery projection in the application", async () => {
    await expect(getConnectHomeState("education")).resolves.toEqual(state);
    await expect(getConnectHomeState("not-present")).resolves.toEqual({
      ...state,
      discover: [],
    });
  });

  it("matches names, Missions, capabilities and needs", () => {
    expect(builderMatchesSearch(builder, "builder two")).toBe(true);
    expect(builderMatchesSearch(builder, "students")).toBe(true);
    expect(builderMatchesSearch(builder, "teaching")).toBe(true);
    expect(builderMatchesSearch(builder, "product design")).toBe(true);
    expect(builderMatchesSearch(builder, "")).toBe(true);
    expect(builderMatchesSearch(builder, "agriculture")).toBe(false);
  });

  it("loads one Builder detail through the protected RPC", async () => {
    mocks.rpc.mockResolvedValue({
      ...builder,
      connectionId: null,
      requesterId: null,
    });
    await expect(getBuilderConnectProfile("builder-two")).resolves.toEqual({
      ...builder,
      connectionId: null,
      requesterId: null,
    });
    expect(mocks.rpc).toHaveBeenCalledWith("get_stage11_builder_detail", {
      username_input: "builder-two",
    });
  });

  it("returns null for unavailable or adult-ineligible Builder details", async () => {
    for (const message of [
      "CONNECT_BUILDER_NOT_FOUND",
      "CONNECT_ADULT_REQUIRED",
    ]) {
      mocks.rpc.mockRejectedValueOnce(new Error(message));
      await expect(getBuilderConnectProfile("missing")).resolves.toBeNull();
    }
  });

  it("does not hide unexpected infrastructure failures", async () => {
    mocks.rpc.mockRejectedValue(new Error("NETWORK_FAILURE"));
    await expect(getBuilderConnectProfile("builder-two")).rejects.toThrow(
      "NETWORK_FAILURE",
    );
  });
});
