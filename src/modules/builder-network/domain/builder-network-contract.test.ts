import { describe, expect, it } from "vitest";
import {
  builderNetworkPostKindLabel,
  builderNetworkReactionLabel,
  createBuilderNetworkPostSchema,
  schoolBuilderNetworkSettingsSchema,
} from "./builder-network-contract";

describe("Builder Network domain contract", () => {
  it("accepts bounded purposeful posts", () => {
    expect(
      createBuilderNetworkPostSchema.safeParse({
        kind: "help_request",
        body: "I need a UI reviewer for the prototype I tested this afternoon.",
        projectId: "",
      }).success,
    ).toBe(true);
    expect(
      createBuilderNetworkPostSchema.safeParse({
        kind: "build_update",
        body: "too short",
        projectId: "",
      }).success,
    ).toBe(false);
  });

  it("keeps school network settings explicit", () => {
    expect(
      schoolBuilderNetworkSettingsSchema.safeParse({
        workspaceId: "11111111-1111-4111-8111-111111111111",
        networkEnabled: true,
        crossSchoolEnabled: true,
        directMessagesEnabled: false,
      }).success,
    ).toBe(true);
  });

  it("uses development-first labels rather than popularity language", () => {
    expect(builderNetworkPostKindLabel("milestone")).toBe("Milestone");
    expect(builderNetworkPostKindLabel("help_request")).toBe("I need help");
    expect(builderNetworkReactionLabel("useful")).toBe("Useful");
    expect(builderNetworkReactionLabel("can_help")).toBe("I can help");
    expect(builderNetworkReactionLabel("keep_building")).toBe("Keep building");
  });
});
