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
  shareContactAction,
} from "./connect-actions";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const targetUserId = "11111111-1111-4111-8111-111111111111";
const connectionId = "22222222-2222-4222-8222-222222222222";

describe("Connect server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rpc.mockResolvedValue(true);
  });

  it("saves the protected profile and discovery choice", async () => {
    const data = form({
      interests: "Education, Technology",
      capabilities: "Teaching, Planning",
      canHelpWith: "I can help with practical lesson planning.",
      needsHelpWith: "I need support with product design.",
      contactEmail: "builder@example.com",
      contactWhatsapp: "+2348000000000",
      discoverable: "on",
    });
    await expect(saveNetworkProfileAction(data)).rejects.toThrow(
      "REDIRECT:/connect?updated=profile",
    );
    expect(mocks.rpc).toHaveBeenCalledWith(
      "save_stage11_builder_connect_profile",
      {
        interests_input: ["Education", "Technology"],
        capabilities_input: ["Teaching", "Planning"],
        can_help_with_input: "I can help with practical lesson planning.",
        needs_help_with_input: "I need support with product design.",
        contact_email_input: "builder@example.com",
        contact_whatsapp_input: "+2348000000000",
        visibility_input: "discoverable",
      },
    );
    expect(mocks.revalidate).toHaveBeenCalledWith("/connect");
  });

  it("requires interests and capabilities before discoverability", async () => {
    await expect(
      saveNetworkProfileAction(
        form({
          interests: "",
          capabilities: "",
          canHelpWith: "",
          needsHelpWith: "",
          contactEmail: "",
          contactWhatsapp: "",
          discoverable: "on",
        }),
      ),
    ).rejects.toThrow("REDIRECT:/connect?error=profile-incomplete");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("rejects malformed private contact details", async () => {
    await expect(
      saveNetworkProfileAction(
        form({
          interests: "Education",
          capabilities: "Teaching",
          canHelpWith: "Planning",
          needsHelpWith: "Research",
          contactEmail: "not-an-email",
          contactWhatsapp: "1",
        }),
      ),
    ).rejects.toThrow("REDIRECT:/connect?error=profile-invalid");
  });

  it.each([
    ["CONNECT_ADULT_REQUIRED", "eligibility"],
    ["CONNECT_REQUEST_EXISTS", "request-exists"],
    ["CONNECT_BUILDER_NOT_FOUND", "builder-unavailable"],
    ["CONNECT_CONTACT_MISSING", "contact-missing"],
    ["CONNECT_BLOCKED", "blocked"],
    ["unknown", "action-failed"],
  ])("maps protected RPC failure %s to %s", async (message, code) => {
    mocks.rpc.mockRejectedValue(new Error(message));
    await expect(
      sendConnectionRequestAction(form({ targetUserId })),
    ).rejects.toThrow(`REDIRECT:/connect?error=${code}`);
  });

  it("sends a connection request", async () => {
    await expect(
      sendConnectionRequestAction(form({ targetUserId })),
    ).rejects.toThrow("REDIRECT:/connect?updated=request-sent");
    expect(mocks.rpc).toHaveBeenCalledWith("send_stage11_connection_request", {
      target_user_id_input: targetUserId,
    });
  });

  it("rejects invalid connection request input", async () => {
    await expect(
      sendConnectionRequestAction(form({ targetUserId: "bad-id" })),
    ).rejects.toThrow("REDIRECT:/connect?error=request-invalid");
  });

  it("accepts or declines an incoming request", async () => {
    await expect(
      respondConnectionRequestAction(form({ connectionId, action: "accept" })),
    ).rejects.toThrow("REDIRECT:/connect?updated=network");
    expect(mocks.rpc).toHaveBeenCalledWith(
      "respond_stage11_connection_request",
      { connection_id_input: connectionId, accept_input: true },
    );
  });

  it("cancels or removes through the close RPC", async () => {
    await expect(
      respondConnectionRequestAction(form({ connectionId, action: "remove" })),
    ).rejects.toThrow("REDIRECT:/connect?updated=network");
    expect(mocks.rpc).toHaveBeenCalledWith("close_stage11_connection", {
      connection_id_input: connectionId,
      action_input: "remove",
    });
  });

  it("rejects invalid response actions", async () => {
    await expect(
      respondConnectionRequestAction(
        form({ connectionId, action: "approve-everything" }),
      ),
    ).rejects.toThrow("REDIRECT:/connect?error=request-invalid");
  });

  it("blocks and unblocks a Builder through safety RPCs", async () => {
    await expect(
      builderSafetyAction(form({ action: "block", userId: targetUserId })),
    ).rejects.toThrow("REDIRECT:/connect?updated=block");
    expect(mocks.rpc).toHaveBeenCalledWith("block_stage11_builder", {
      target_user_id_input: targetUserId,
    });
    mocks.rpc.mockClear();
    await expect(
      builderSafetyAction(form({ action: "unblock", userId: targetUserId })),
    ).rejects.toThrow("REDIRECT:/connect?updated=unblock");
    expect(mocks.rpc).toHaveBeenCalledWith("unblock_stage11_builder", {
      target_user_id_input: targetUserId,
    });
  });

  it("records a private safety report", async () => {
    await expect(
      builderSafetyAction(
        form({
          action: "report",
          userId: targetUserId,
          reason: "unsafe_contact",
        }),
      ),
    ).rejects.toThrow("REDIRECT:/connect?updated=report");
    expect(mocks.rpc).toHaveBeenCalledWith("report_stage11_builder", {
      target_user_id_input: targetUserId,
      reason_code_input: "unsafe_contact",
      detail_input: null,
    });
  });

  it("rejects malformed safety actions", async () => {
    await expect(
      builderSafetyAction(form({ action: "delete", userId: targetUserId })),
    ).rejects.toThrow("REDIRECT:/connect?error=action-failed");
  });

  it("updates explicit contact sharing only for one connection", async () => {
    await expect(
      shareContactAction(
        form({ connectionId, shareEmail: "on", shareWhatsapp: "on" }),
      ),
    ).rejects.toThrow("REDIRECT:/connect?updated=contact-sharing");
    expect(mocks.rpc).toHaveBeenCalledWith("share_stage11_contact", {
      connection_id_input: connectionId,
      share_email_input: true,
      share_whatsapp_input: true,
    });
  });
});
