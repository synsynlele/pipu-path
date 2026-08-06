import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  revalidate: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("../infrastructure/connect-rpc", () => ({
  callAuthenticatedConnectRpc: mocks.rpc,
}));

import {
  builderSafetyAction,
  respondConnectionRequestAction,
  saveNetworkProfileAction,
  sendConnectionRequestAction,
} from "./connect-actions";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const recipientId = "11111111-1111-4111-8111-111111111111";
const requestId = "22222222-2222-4222-8222-222222222222";

describe("Connect server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rpc.mockResolvedValue(true);
  });

  it("saves an opt-in network profile through the protected RPC", async () => {
    const data = form({
      headline: "I help young people build practical learning projects.",
      canHelpWith: "Teaching, Planning",
      needsHelpWith: "Design, Research",
      interests: "Education, Technology",
      discoverable: "on",
    });
    await expect(saveNetworkProfileAction(data)).rejects.toThrow(
      "REDIRECT:/connect?updated=profile",
    );
    expect(mocks.rpc).toHaveBeenCalledWith("save_stage11_network_profile", {
      headline_input: "I help young people build practical learning projects.",
      can_help_with_input: ["Teaching", "Planning"],
      needs_help_with_input: ["Design", "Research"],
      interests_input: ["Education", "Technology"],
      discoverable_input: true,
      consent_version_input: "builder-connect-v1",
    });
    expect(mocks.revalidate).toHaveBeenCalledWith("/connect");
  });

  it("rejects incomplete profiles before database access", async () => {
    await expect(
      saveNetworkProfileAction(
        form({
          headline: "Short",
          canHelpWith: "",
          needsHelpWith: "",
          interests: "",
        }),
      ),
    ).rejects.toThrow("REDIRECT:/connect?error=profile-invalid");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it.each([
    ["CONNECT_ADULT_ELIGIBILITY_REQUIRED", "eligibility"],
    ["CONNECT_REQUEST_EXISTS", "request-exists"],
    ["CONNECT_BUILDER_NOT_AVAILABLE", "builder-unavailable"],
    ["unknown", "action-failed"],
  ])("maps protected RPC failure %s to %s", async (message, code) => {
    mocks.rpc.mockRejectedValue(new Error(message));
    await expect(
      sendConnectionRequestAction(form({ recipientId, reason: "collaborate" })),
    ).rejects.toThrow(`REDIRECT:/connect?error=${code}`);
  });

  it("sends a bounded-purpose connection request", async () => {
    await expect(
      sendConnectionRequestAction(form({ recipientId, reason: "learn" })),
    ).rejects.toThrow("REDIRECT:/connect?updated=request-sent");
    expect(mocks.rpc).toHaveBeenCalledWith("send_stage11_connection_request", {
      recipient_id_input: recipientId,
      reason_input: "learn",
    });
  });

  it("rejects invalid connection request input", async () => {
    await expect(
      sendConnectionRequestAction(
        form({ recipientId: "bad-id", reason: "message_me" }),
      ),
    ).rejects.toThrow("REDIRECT:/connect?error=request-invalid");
  });

  it("responds to pending and accepted connection states", async () => {
    await expect(
      respondConnectionRequestAction(form({ requestId, action: "accept" })),
    ).rejects.toThrow("REDIRECT:/connect?updated=network");
    expect(mocks.rpc).toHaveBeenCalledWith(
      "respond_stage11_connection_request",
      { request_id_input: requestId, action_input: "accept" },
    );
  });

  it("rejects invalid response actions", async () => {
    await expect(
      respondConnectionRequestAction(
        form({ requestId, action: "approve-everything" }),
      ),
    ).rejects.toThrow("REDIRECT:/connect?error=request-invalid");
  });

  it("blocks a Builder through the safety RPC", async () => {
    await expect(
      builderSafetyAction(form({ action: "block", userId: recipientId })),
    ).rejects.toThrow("REDIRECT:/connect?updated=block");
    expect(mocks.rpc).toHaveBeenCalledWith("block_stage11_builder", {
      blocked_id_input: recipientId,
    });
  });

  it("records a private safety report", async () => {
    await expect(
      builderSafetyAction(
        form({
          action: "report",
          userId: recipientId,
          reason: "unsafe_contact",
        }),
      ),
    ).rejects.toThrow("REDIRECT:/connect?updated=report");
    expect(mocks.rpc).toHaveBeenCalledWith("report_stage11_builder", {
      reported_user_id_input: recipientId,
      reason_input: "unsafe_contact",
    });
  });

  it("rejects malformed safety actions", async () => {
    await expect(
      builderSafetyAction(form({ action: "delete", userId: recipientId })),
    ).rejects.toThrow("REDIRECT:/connect?error=action-failed");
  });
});
