import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PowerDistrictFrame } from "./power-district-frame";
const mocks = vi.hoisted(() => ({ home: vi.fn() }));
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
afterEach(cleanup);
it("keeps game assets same-origin and offers an escape without exporting private context", () => {
  render(
    <PowerDistrictFrame
      questHref="/quests/owned-quest"
      questLabel="Continue my real-world Quest →"
    />,
  );
  const frame = screen.getByTitle("Power District: Keep the Workshop Running");
  expect(frame).toHaveAttribute(
    "src",
    "/games/power-district/index.html?embedded=1",
  );
  expect(screen.getByRole("link")).toHaveAttribute(
    "href",
    "/quests/owned-quest",
  );
  const expand = screen.getByRole("button", { name: "Expand game ↗" });
  expand.focus();
  fireEvent.click(expand);
  expect(
    screen.getByRole("button", { name: "Close focus view" }),
  ).toHaveFocus();
  expect(document.body.style.overflow).toBe("hidden");
  fireEvent.keyDown(window, { key: "Escape" });
  expect(document.body.style.overflow).not.toBe("hidden");
  expect(expand).toHaveFocus();
});
it("requires existing authenticated state and respects locked Quest routing", async () => {
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
  expect(
    screen.getByRole("link", { name: "Find my real-world Quest →" }),
  ).toHaveAttribute("href", "/quests");
  view.unmount();
  mocks.home.mockResolvedValue({
    quest: {
      id: "12345678-1234-4234-8234-123456789abc",
      status: "evidence_submitted",
      title: "My quest",
    },
  });
  const owned = await PowerDistrictPage({ searchParams: Promise.resolve({}) });
  render(
    <PowerDistrictFrame
      questHref={owned.props.questHref}
      questLabel={owned.props.questLabel}
    />,
  );
  expect(
    screen.getByRole("link", { name: "Reflect on my real attempt →" }),
  ).toHaveAttribute("href", "/quests/12345678-1234-4234-8234-123456789abc");
});
