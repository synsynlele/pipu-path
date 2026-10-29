import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PowerDistrictFrame } from "./power-district-frame";

const mocks = vi.hoisted(() => ({ home: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock("@/modules/identity/infrastructure/progress-dal", () => ({
  requireAuthenticatedHomeState: mocks.home,
}));
vi.mock("@/modules/quest/infrastructure/quest-dal", () => ({
  getQuestById: vi.fn().mockResolvedValue({
    quest: {
      id: "12345678-1234-4234-8234-123456789abc",
      status: "evidence_submitted",
      title: "My quest",
    },
  }),
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
  expect(screen.getByRole("button", { name: "Close focus view" })).toHaveFocus();
  expect(document.body.style.overflow).toBe("hidden");
  fireEvent.keyDown(window, { key: "Escape" });
  expect(document.body.style.overflow).not.toBe("hidden");
  expect(expand).toHaveFocus();
  expect(screen.getByTitle("The Unbuilt City · 14 connected districts")).toBe(frame);
});
it("requires authenticated, owned Quest context and offers explicit saving choices", async () => {
  mocks.home.mockRejectedValueOnce(new Error("AUTH_REQUIRED"));
  await expect(
    PowerDistrictPage({ searchParams: Promise.resolve({}) }),
  ).rejects.toThrow("AUTH_REQUIRED");
  mocks.home.mockResolvedValue({
    quest: { id: "locked", status: "locked", title: "Private" },
  });
  const locked = await PowerDistrictPage({ searchParams: Promise.resolve({}) });
  expect(locked.props.questHref).toBe("/quests");
  const view = render(
    <PowerDistrictFrame
      questHref={locked.props.questHref}
      questLabel={locked.props.questLabel}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Find my real-world Quest →" }));
  expect(screen.getByRole("dialog", { name: "Continue to a real Quest" })).toBeVisible();
  expect(mocks.push).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Stay in my city" }));
  view.unmount();
  mocks.home.mockResolvedValue({
    quest: {
      id: "12345678-1234-4234-8234-123456789abc",
      status: "evidence_submitted",
      title: "My quest",
    },
  });
  const owned = await PowerDistrictPage({ searchParams: Promise.resolve({}) });
  expect(owned.props.questHref).toBe("/quests/12345678-1234-4234-8234-123456789abc");
  render(
    <PowerDistrictFrame
      questHref={owned.props.questHref}
      questLabel={owned.props.questLabel}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Reflect on my real attempt →" }));
  expect(screen.getByRole("button", { name: "Save my city, then continue" })).toBeVisible();
});
