import { describe, expect, it } from "vitest";
import {
  promptVersionForProfileContext,
  summarizeProfileEvolutionEvidence,
} from "./profile-evolution";

describe("Stage 14 profile evolution contract", () => {
  it("uses a distinct prompt contract for evidence-backed evolution", () => {
    expect(promptVersionForProfileContext("initial")).toBe("hpi-openai-v1");
    expect(promptVersionForProfileContext("evolution")).toBe(
      "hpi-openai-v2-builder-evidence",
    );
  });

  it("recognises completed projects and explicit Builder feedback as new evidence", () => {
    expect(
      summarizeProfileEvolutionEvidence([
        "completed_builder_project",
        "profile_feedback",
        "profile_feedback",
        "discovery_interest",
      ]),
    ).toEqual({
      completedProjects: 1,
      profileFeedback: 2,
      total: 3,
      ready: true,
    });
  });

  it("does not mark the profile ready without new evolution evidence", () => {
    expect(summarizeProfileEvolutionEvidence(["discovery_interest"])).toEqual({
      completedProjects: 0,
      profileFeedback: 0,
      total: 0,
      ready: false,
    });
  });
});
