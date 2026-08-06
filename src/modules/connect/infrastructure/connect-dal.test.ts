import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  identity: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/modules/identity/infrastructure/identity-dal", () => ({
  requireAuthenticatedIdentity: mocks.identity,
}));
vi.mock("./connect-rpc", () => ({
  callAuthenticatedConnectRpc: mocks.rpc,
}));

import {
  getBuilderConnectProfile,
  getConnectHomeState,
  isConnectEligible,
} from "./connect-dal";

const adultProfile = {
  age_band: "25_plus",
  safeguarding_review_required: false,
  account_status: "active",
  username: "builder-one",
};

const builder = {
  user_id: "11111111-1111-4111-8111-111111111111",
  username: "builder-two",
  display_name: "Builder Two",
  headline: "I build practical learning resources for young people.",
  can_help_with: ["Teaching"],
  needs_help_with: ["Design"],
  interests: ["Education"],
  portfolio_slug: null,
  portfolio_title: null,
  relationship_status: "none",
};

describe("Connect data access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.identity.mockResolvedValue({ profile: adultProfile });
    mocks.rpc.mockImplementation(async (name: string) => {
      if (name === "get_stage11_own_network_profile") return [];
      if (name === "search_stage11_builders") return [builder];
      if (name === "get_stage11_my_network") return [];
      if (name === "get_stage11_builder") return [builder];
      return [];
    });
  });

  it("enforces adult, active, username and safeguarding boundaries", () => {
    expect(isConnectEligible(adultProfile)).toBe(true);
    expect(isConnectEligible({ ...adultProfile, age_band: "13_17" })).toBe(
      false,
    );
    expect(
      isConnectEligible({
        ...adultProfile,
        safeguarding_review_required: true,
      }),
    ).toBe(false);
    expect(
      isConnectEligible({ ...adultProfile, account_status: "suspended" }),
    ).toBe(false);
    expect(isConnectEligible({ ...adultProfile, username: null })).toBe(false);
  });

  it("does not query the directory for ineligible users", async () => {
    mocks.identity.mockResolvedValue({
      profile: { ...adultProfile, age_band: "13_17" },
    });
    await expect(getConnectHomeState()).resolves.toEqual({
      eligible: false,
      profile: null,
      builders: [],
      network: [],
    });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("loads the user's profile, directory and network in one boundary", async () => {
    const ownProfile = {
      user_id: "22222222-2222-4222-8222-222222222222",
      headline: "I help schools build practical programmes.",
      can_help_with: ["Planning"],
      needs_help_with: ["Research"],
      interests: ["Education"],
      is_discoverable: true,
      consent_version: "builder-connect-v1",
    };
    mocks.rpc.mockImplementation(async (name: string) => {
      if (name === "get_stage11_own_network_profile") return [ownProfile];
      if (name === "search_stage11_builders") return [builder];
      return [];
    });
    await expect(getConnectHomeState("education")).resolves.toEqual({
      eligible: true,
      profile: ownProfile,
      builders: [builder],
      network: [],
    });
    expect(mocks.rpc).toHaveBeenCalledWith("search_stage11_builders", {
      search_input: "education",
      limit_input: 24,
    });
  });

  it("normalizes an empty search to null", async () => {
    await getConnectHomeState("   ");
    expect(mocks.rpc).toHaveBeenCalledWith("search_stage11_builders", {
      search_input: null,
      limit_input: 24,
    });
  });

  it("loads one eligible Builder profile", async () => {
    await expect(getBuilderConnectProfile("builder-two")).resolves.toEqual(
      builder,
    );
    expect(mocks.rpc).toHaveBeenCalledWith("get_stage11_builder", {
      username_input: "builder-two",
    });
  });

  it("hides Builder profiles from ineligible users and handles missing rows", async () => {
    mocks.identity.mockResolvedValue({
      profile: { ...adultProfile, account_status: "suspended" },
    });
    await expect(getBuilderConnectProfile("builder-two")).resolves.toBeNull();
    mocks.identity.mockResolvedValue({ profile: adultProfile });
    mocks.rpc.mockResolvedValue([]);
    await expect(getBuilderConnectProfile("missing")).resolves.toBeNull();
  });
});
