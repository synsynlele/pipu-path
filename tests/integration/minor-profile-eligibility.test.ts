import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260807174755_separate_minor_status_from_safeguarding.sql",
  "utf8",
);
const automaticMinorFlag = /safeguarding_review_required\s*=\s*age_band_input/;
const explicitSafeguardGuard = /safeguarding_review_required, false/;
const minorAgeBands = /'under_13', '13_15', '16_17'/;

describe("minor profile eligibility", () => {
  it("keeps minor age separate from safeguarding", () => {
    expect(migration).not.toMatch(automaticMinorFlag);
    expect(migration).toContain("age_band = age_band_input");
  });

  it("blocks explicit safeguarding restrictions", () => {
    expect(migration).toMatch(explicitSafeguardGuard);
    expect(migration).toContain("HPI_SAFEGUARDING_RESTRICTION");
  });

  it("repairs only legacy minor flags", () => {
    expect(migration).toMatch(minorAgeBands);
    expect(migration).toContain("uc.consent_type = 'guardian_required'");
    expect(migration).toContain("uc.source = 'identity_checkpoint'");
  });
});
