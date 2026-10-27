import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ home: vi.fn(), detail: vi.fn() }));
vi.mock("@/modules/identity/infrastructure/progress-dal", () => ({
  requireAuthenticatedHomeState: mocks.home,
}));
vi.mock("@/modules/quest/infrastructure/quest-dal", () => ({
  getQuestById: mocks.detail,
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
import CityPage from "@/app/build/play/page";
const id = "12345678-1234-4234-8234-123456789abc";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.home.mockResolvedValue({ quest: null, journey: null });
});
describe("authenticated city context", () => {
  it("rejects malformed, foreign and locked Quest context", async () => {
    await expect(
      CityPage({
        searchParams: Promise.resolve({ quest: "https://example.com" }),
      }),
    ).rejects.toThrow("NOT_FOUND");
    expect(mocks.detail).not.toHaveBeenCalled();
    mocks.detail.mockResolvedValue(null);
    await expect(
      CityPage({ searchParams: Promise.resolve({ quest: id }) }),
    ).rejects.toThrow("NOT_FOUND");
    mocks.detail.mockResolvedValue({ quest: { id, status: "locked" } });
    await expect(
      CityPage({ searchParams: Promise.resolve({ quest: id }) }),
    ).rejects.toThrow("NOT_FOUND");
  });
  it("uses the owned Quest and its actual outcome for the return journey", async () => {
    mocks.detail.mockResolvedValue({
      quest: {
        id,
        title: "Listen locally",
        status: "active",
        real_world_outcome: "Test a sketch with someone you know.",
      },
      journey: { title: "Design for people" },
    });
    const page = await CityPage({
      searchParams: Promise.resolve({ quest: id }),
    });
    expect(page.props.context.returnHref).toBe(`/quests/${id}`);
    expect(page.props.context.outcome).toBe(
      "Test a sketch with someone you know.",
    );
  });
});
