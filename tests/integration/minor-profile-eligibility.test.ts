import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260807174755_separate_minor_status_from_safeguarding.sql",
  "utf8",
);

describe("minor profile eligibility", () => {
  it("does not treat minor age as an automatic safeguarding restriction", () => {
    expect(migration).not.toContain(
      "safeguarding_review_required = age_band_input in",
    );
    expect(migration).toContain("age_band = age_band_input");
  });

  it("still blocks profile generation for an explicit safeguarding restriction", () => {
    expect(migration).toContain(
      "if coalesce(profile_row.safeguarding_review_required, false) then",
    );
    expect(migration).toContain("HPI_SAFEGUARDING_RESTRICTION");
  });

  it("repairs only completed minor accounts created under the legacy age rule", () => {
    expect(migration).toContain(
      "p.age_band in ('under_13', '13_15', '16_17')",
    );
    expect(migration).toContain("uc.consent_type = 'guardian_required'");
    expect(migration).toContain("uc.source = 'identity_checkpoint'");
  });
});
