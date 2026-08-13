import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  identity: vi.fn(),
  missionState: vi.fn(),
  pathwayState: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));
vi.mock(
  "@/modules/economic-pathways/infrastructure/economic-pathway-dal",
  () => ({
    getCurrentEconomicPathwayState: mocks.pathwayState,
  }),
);
vi.mock("@/modules/identity/infrastructure/identity-dal", () => ({
  requireAuthenticatedIdentity: mocks.identity,
}));
vi.mock("@/modules/mission/infrastructure/mission-dal", () => ({
  getCurrentMissionState: mocks.missionState,
}));
vi.mock("@/modules/project/infrastructure/project-client", () => ({
  createProjectServerClient: vi.fn(),
}));

import { getJourneyContext } from "./journey-dal";

describe("getJourneyContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.identity.mockResolvedValue({
      profile: { age_band: "18_24", is_minor: false },
    });
    mocks.pathwayState.mockResolvedValue(null);
  });

  it("bounds a valid 400-character mission caution for Journey constraints", async () => {
    const currentCaution = "x".repeat(400);
    mocks.missionState.mockResolvedValue({
      active: {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        profileId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        title: "Support student study",
        mission_statement: "Test a useful study support idea with students.",
        who_this_helps: "Students",
        first_meaning_outcome: "Create and test one useful study guide.",
        first_meaningful_outcome: "Create and test one useful study guide.",
        success_signal: "Students use it and respond with useful feedback.",
        current_caution: currentCaution,
      },
    });

    const context = await getJourneyContext();

    expect(mocks.pathwayState).toHaveBeenCalledWith(
      "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    );
    expect(context?.selectedPath).toBeNull();
    expect(context?.currentCaution).toHaveLength(400);
    expect(context?.generalResourceConstraints).toEqual([
      currentCaution.slice(0, 320),
    ]);
  });
});
