import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
const home = vi.hoisted(() => vi.fn());
vi.mock("@/modules/real-build/infrastructure/dal", () => ({
  getBuildHome: home,
}));
vi.mock("@/modules/real-build/application/actions", () => ({
  startRealBuild: vi.fn(),
}));
import RealQuestsPage from "@/app/real-quests/page";
afterEach(cleanup);
beforeEach(() => {
  home.mockResolvedValue({ name: "Builder", current: null, history: [] });
});
it("offers a first challenge from topic and time without a Discovery, profile or Mission prerequisite", async () => {
  render(
    await RealQuestsPage({
      searchParams: Promise.resolve({ district: "school" }),
    }),
  );
  expect(screen.getByRole("combobox")).toHaveValue("school");
  expect(
    screen.getByRole("button", { name: "Get my Quest →" }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("radio")).toHaveLength(3);
  expect(
    screen.queryByRole("link", { name: /profile|Mission|Discovery/i }),
  ).not.toBeInTheDocument();
});
it("continues the current owned attempt instead of starting another", async () => {
  home.mockResolvedValue({
    name: "Builder",
    current: {
      id: "owned",
      challenge: {
        title: "Make a paper tracker",
        outcome: "Test it with a familiar classmate.",
      },
    },
    history: [],
  });
  render(await RealQuestsPage({ searchParams: Promise.resolve({}) }));
  expect(
    screen.getByRole("link", { name: "Continue my Quest →" }),
  ).toHaveAttribute("href", "/real-quests/owned");
  expect(
    screen.queryByRole("button", { name: "Get my Quest →" }),
  ).not.toBeInTheDocument();
});
it("ignores unknown district values and requires authenticated state", async () => {
  render(
    await RealQuestsPage({
      searchParams: Promise.resolve({ district: "private narrative" }),
    }),
  );
  expect(screen.getByRole("combobox")).toHaveValue("");
});
it("requires authenticated state before exposing personal work", async () => {
  home.mockRejectedValue(new Error("AUTH_REQUIRED"));
  await expect(
    RealQuestsPage({ searchParams: Promise.resolve({}) }),
  ).rejects.toThrow("AUTH_REQUIRED");
});
