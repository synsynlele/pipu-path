import { describe, expect, it } from "vitest";
import {
  builderPassportIssueSchema,
  builderPassportShareCreateSchema,
  builderPassportShareSecretSchema,
  builderPassportTimestampSchema,
  builderPassportTrustCopy,
} from "./passport-contract";

const ids = Array.from(
  { length: 24 },
  (_, index) =>
    `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
);

describe("Builder Passport contract", () => {
  it("requires exact proof selection before a Passport can be issued", () => {
    const result = builderPassportIssueSchema.safeParse({
      publicSummary: "I build practical systems that solve real problems.",
      selectedPathName: "Systems builder",
      claimIds: [ids[0]],
      evidenceIds: [],
      institutionVerificationIds: [],
      portfolioIds: [],
      consentPolicyVersion: "builder-passport-v1",
    });

    expect(result.success).toBe(false);
  });

  it("accepts bounded unique deployment-safe selections", () => {
    const result = builderPassportIssueSchema.safeParse({
      publicSummary: "I build practical systems that solve real problems.",
      selectedPathName: "Systems builder",
      claimIds: [ids[0], ids[1]],
      evidenceIds: [ids[2]],
      institutionVerificationIds: [ids[3]],
      portfolioIds: [ids[4]],
      consentPolicyVersion: "builder-passport-v1",
    });

    expect(result.success).toBe(true);
  });

  it("rejects duplicate evidence selections", () => {
    const result = builderPassportIssueSchema.safeParse({
      publicSummary: "",
      selectedPathName: "",
      claimIds: [ids[0]],
      evidenceIds: [ids[1], ids[1]],
      institutionVerificationIds: [],
      portfolioIds: [],
      consentPolicyVersion: "builder-passport-v1",
    });

    expect(result.success).toBe(false);
  });

  it("accepts Supabase/Postgres offset-aware timestamps without accepting zone-less values", () => {
    expect(
      builderPassportTimestampSchema.safeParse(
        "2026-08-13T11:44:37.334053+00:00",
      ).success,
    ).toBe(true);
    expect(
      builderPassportTimestampSchema.safeParse("2026-08-13T11:44:37.334053Z")
        .success,
    ).toBe(true);
    expect(
      builderPassportTimestampSchema.safeParse("2026-08-13T11:44:37.334053")
        .success,
    ).toBe(false);
  });

  it("bounds share expiry to the release-authorized windows", () => {
    expect(
      builderPassportShareCreateSchema.safeParse({
        passportId: ids[0],
        label: "Scholarship application",
        expiresInDays: 30,
      }).success,
    ).toBe(true);

    expect(
      builderPassportShareCreateSchema.safeParse({
        passportId: ids[0],
        label: "Scholarship application",
        expiresInDays: 365,
      }).success,
    ).toBe(false);
  });

  it("accepts only the server share-secret shape", () => {
    expect(
      builderPassportShareSecretSchema.safeParse(`ppsp_${"a".repeat(43)}`)
        .success,
    ).toBe(true);
    expect(
      builderPassportShareSecretSchema.safeParse("guessable").success,
    ).toBe(false);
  });

  it("states the external trust boundary without credential overclaiming", () => {
    expect(builderPassportTrustCopy.boundary).toContain(
      "not government identity",
    );
    expect(builderPassportTrustCopy.boundary).toContain("academic credential");
    expect(builderPassportTrustCopy.boundary).toContain(
      "public Builder directory",
    );
  });
});
