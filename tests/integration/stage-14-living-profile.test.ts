import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const enumMigration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/202608160001_stage_14_hpi_evidence_sources.sql",
  ),
  "utf8",
);
const livingProfileMigration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/202608160002_stage_14_living_human_potential_profile.sql",
  ),
  "utf8",
);
const profilePage = readFileSync(
  join(process.cwd(), "src/app/onboarding/discovery/profile/page.tsx"),
  "utf8",
);
const provider = readFileSync(
  join(
    process.cwd(),
    "src/modules/human-potential/infrastructure/openai-provider.ts",
  ),
  "utf8",
);

describe("Stage 14 Living Human Potential Profile structure", () => {
  it("extends evidence provenance rather than creating a parallel profile store", () => {
    expect(enumMigration).toContain("'builder_project'");
    expect(enumMigration).toContain("'profile_feedback'");
    expect(livingProfileMigration).toContain(
      "insert into public.evidence_records",
    );
    expect(livingProfileMigration).not.toContain(
      "create table public.capability_profiles",
    );
  });

  it("captures completed Builder work and explicit feedback automatically", () => {
    expect(livingProfileMigration).toContain(
      "stage14_builder_project_evidence_on_complete",
    );
    expect(livingProfileMigration).toContain(
      "and new.status = 'completed'",
    );
    expect(livingProfileMigration).toContain(
      "stage14_profile_feedback_evidence_on_insert",
    );
    expect(livingProfileMigration).toContain(
      "feedback_row.feedback_type::text = 'unsure'",
    );
  });

  it("backfills existing evidence and keeps capture functions browser-inaccessible", () => {
    expect(livingProfileMigration).toContain(
      "Existing users must benefit from Stage 14 without repeating work or feedback.",
    );
    expect(livingProfileMigration).toContain(
      "revoke all on function public.capture_stage14_builder_project_evidence(uuid)",
    );
    expect(livingProfileMigration).toContain(
      "revoke all on function public.capture_stage14_profile_feedback_evidence(uuid)",
    );
    expect(livingProfileMigration).not.toContain(
      "grant execute on function public.capture_stage14_builder_project_evidence",
    );
  });

  it("keeps longitudinal prompts bounded while preserving the Discovery baseline", () => {
    expect(livingProfileMigration).toContain("limit 100");
    expect(livingProfileMigration).toContain(
      "case when evidence.source_type = 'discovery_response' then 0 else 1 end",
    );
    expect(livingProfileMigration).toContain(
      "Completed Builder Project evidence",
    );
    expect(livingProfileMigration).toContain(
      "Explicit Builder feedback on a prior profile",
    );
  });

  it("makes profile evolution deliberate and private", () => {
    expect(profilePage).toContain("Your profile can evolve");
    expect(profilePage).toContain("Evolve my profile");
    expect(profilePage).toContain("The result remains private and provisional");
    expect(provider).toContain("hpi-openai-v2-builder-evidence");
    expect(provider).toContain("sourceKey completed_builder_project");
    expect(provider).toContain("sourceKey profile_feedback");
  });
});
