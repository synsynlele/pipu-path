import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PowerDistrictFrame } from "./power-district-frame";

const mocks = vi.hoisted(() => ({ identity: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock("@/modules/identity/infrastructure/identity-dal", () => ({
  requireAuthenticatedIdentity: mocks.identity,
}));
import PowerDistrictPage from "@/app/build/power-district/page";

afterEach(() => {
  cleanup();
  mocks.push.mockClear();
});
it("keeps game assets on the same origin and preserves focus without a reload", () => {
  render(
    <PowerDistrictFrame
      questHref="/quests/owned-quest"
      questLabel="Continue my real-world Quest →"
      initialFocus={false}
    />,
  );
  const frame = screen.getByTitle("The Unbuilt City · 14 connected districts");
  expect(frame).toHaveAttribute("src", "/games/city/index.html?embedded=1");
  const expand = screen.getByRole("button", { name: "Focus on my city ↗" });
  expand.focus();
  fireEvent.click(expand);
  expect(
    screen.getByRole("button", { name: "Close focus view" }),
  ).toHaveFocus();
  expect(document.body.style.overflow).toBe("hidden");
  fireEvent.keyDown(window, { key: "Escape" });
  expect(document.body.style.overflow).not.toBe("hidden");
  expect(expand).toHaveFocus();
  expect(screen.getByTitle("The Unbuilt City · 14 connected districts")).toBe(
    frame,
  );
});
it("requires an account and hands the city off to the current Real Quests flow", async () => {
  mocks.identity.mockRejectedValueOnce(new Error("AUTH_REQUIRED"));
  await expect(PowerDistrictPage()).rejects.toThrow("AUTH_REQUIRED");
  mocks.identity.mockResolvedValue({ user: { id: "owner" } });
  const page = await PowerDistrictPage();
  expect(page.props.questHref).toBe("/real-quests");
  render(
    <PowerDistrictFrame
      questHref={page.props.questHref}
      questLabel={page.props.questLabel}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Real Quests →" }));
  expect(
    screen.getByRole("dialog", { name: "Continue to a real Quest" }),
  ).toBeVisible();
  expect(mocks.push).not.toHaveBeenCalled();
  expect(
    screen.getByRole("button", { name: "Save my city, then continue" }),
  ).toBeVisible();
});
