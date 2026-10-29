import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  identity: {
    user: { id: "child" },
    profile: { is_minor: true },
    checkpoint: { status: "completed" },
  },
  rpc: vi.fn(),
  revalidate: vi.fn(),
  guardian: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({ rpc: mocks.rpc }),
}));
vi.mock("../infrastructure/identity-dal", () => ({
  getIdentityState: async () => mocks.identity,
  getGuardianAuthorizationState: mocks.guardian,
}));
import {
  recordParentLearningAttestationAction,
  withdrawParentLearningAttestationAction,
} from "./guardian-actions";

const previous = { message: "" };
function withdrawal() {
  const data = new FormData();
  data.set("withdraw", "on");
  return data;
}
function form(checked = true) {
  const data = new FormData();
  data.set("parent_name", "  Parent Example  ");
  data.set("relationship", "parent");
  if (checked) data.set("declaration", "on");
  return data;
}

describe("parent-on-device approval", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rpc.mockResolvedValue({ error: null });
    mocks.guardian.mockResolvedValue({ status: "parent_declared" });
  });
  it("rejects a submission without explicit checkbox approval", async () => {
    expect(
      (await recordParentLearningAttestationAction(previous, form(false)))
        .message,
    ).toContain("tick the approval box");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("saves an explicit declaration through the authenticated database boundary before continuing", async () => {
    await expect(
      recordParentLearningAttestationAction(previous, form()),
    ).rejects.toThrow("REDIRECT:/real-quests");
    expect(mocks.rpc).toHaveBeenCalledWith(
      "record_parent_learning_attestation",
      {
        parent_name_input: "Parent Example",
        relationship_input: "parent",
        declaration_input: true,
      },
    );
    expect(mocks.revalidate).toHaveBeenCalledWith("/", "layout");
  });
  it("keeps the user on the form when persistence fails", async () => {
    mocks.rpc.mockResolvedValue({ error: { message: "unavailable" } });
    expect(
      (await recordParentLearningAttestationAction(previous, form())).message,
    ).toContain("could not save");
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
  it("withdraws approval and returns to the parent gate", async () => {
    await expect(
      withdrawParentLearningAttestationAction(previous, withdrawal()),
    ).rejects.toThrow("REDIRECT:/onboarding/guardian");
    expect(mocks.rpc).toHaveBeenCalledWith("withdraw_consent", {
      consent_type_input: "guardian_required",
      policy_version_input: "2026-10-16-parent-device-v1",
    });
  });
  it("does not withdraw independent guardian approval through the declaration control", async () => {
    mocks.guardian.mockResolvedValue({ status: "granted" });
    expect(
      (await withdrawParentLearningAttestationAction(previous, withdrawal()))
        .message,
    ).toContain("no on-device");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
