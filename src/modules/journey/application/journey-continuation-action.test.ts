import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generate: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("./journey-continuation", () => ({
  generateContinuingJourney: mocks.generate,
}));

import { continueJourneyAction } from "./journey-continuation-action";

const sourceJourneyId = "11111111-1111-4111-8111-111111111111";

describe("Journey continuation action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects malformed source Journey identifiers", async () => {
    const data = new FormData();
    data.set("sourceJourneyId", "invalid");
    await expect(
      continueJourneyAction({ status: "idle" }, data),
    ).resolves.toEqual({
      status: "error",
      message: "That completed Journey is not valid.",
    });
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("returns orchestration errors without redirecting", async () => {
    mocks.generate.mockResolvedValue({
      ok: false,
      message: "Your next Journey is already being shaped.",
    });
    const data = new FormData();
    data.set("sourceJourneyId", sourceJourneyId);
    await expect(
      continueJourneyAction({ status: "idle" }, data),
    ).resolves.toEqual({
      status: "error",
      message: "Your next Journey is already being shaped.",
    });
  });

  it("returns to Journey after creating the next cycle", async () => {
    mocks.generate.mockResolvedValue({ ok: true, journeyId: "journey-2" });
    const data = new FormData();
    data.set("sourceJourneyId", sourceJourneyId);
    await expect(
      continueJourneyAction({ status: "idle" }, data),
    ).rejects.toThrow("REDIRECT:/journey");
    expect(mocks.generate).toHaveBeenCalledWith(sourceJourneyId);
  });
});
