import { beforeEach, expect, it, vi } from "vitest";
const identity = vi.hoisted(() => vi.fn());
vi.mock("@/modules/identity/infrastructure/identity-dal", () => ({
  requireAuthenticatedIdentity: identity,
}));
import CityPage from "@/app/build/play/page";
beforeEach(() => {
  identity.mockReset();
});
it("opens the signed-in city with the current Real Quests handoff and account backup", async () => {
  identity.mockResolvedValue({ user: { id: "owner" } });
  const page = await CityPage();
  expect(identity).toHaveBeenCalledOnce();
  expect(page.props.questHref).toBe("/real-quests");
  expect(page.props.cloudEligible).toBe(true);
  expect(page.props.questTitle).toBeUndefined();
});
it("requires identity before exposing signed-in game controls", async () => {
  identity.mockRejectedValue(new Error("AUTH_REQUIRED"));
  await expect(CityPage()).rejects.toThrow("AUTH_REQUIRED");
});
