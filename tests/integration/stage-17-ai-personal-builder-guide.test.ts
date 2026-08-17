import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read(
  "supabase/migrations/20260817200000_stage_17_ai_personal_builder_guide.sql",
);
const page = read("src/app/guide/page.tsx");
const contract = read(
  "src/modules/builder-guide/domain/builder-guide-contract.ts",
);
const generation = read(
  "src/modules/builder-guide/application/builder-guide-generation.ts",
);
const provider = read(
  "src/modules/builder-guide/infrastructure/openai-builder-guide-provider.ts",
);
const navigation = read("src/components/navigation/app-navigation.tsx");

describe("Stage 17 AI Personal Builder Guide", () => {
  it("persists private Guide runs and feedback behind service-only table access", () => {
    expect(migration).toContain("create table public.builder_guide_runs");
    expect(migration).toContain("create table public.builder_guide_feedback");
    expect(migration).toContain("enable row level security");
    expect(migration).toMatch(
      /revoke all on public\.builder_guide_runs, public\.builder_guide_feedback\s+from public, anon, authenticated;/,
    );
    expect(migration).toContain(
      "grant select, insert on public.builder_guide_runs to service_role",
    );
  });

  it("keeps Guide prompts bounded to four product questions rather than free chat", () => {
    expect(page).toContain("What should I do next?");
    expect(page).toContain("Where am I improving?");
    expect(page).toContain("What evidence am I missing?");
    expect(page).toContain("What should I focus on this week?");
    expect(page).toContain("No unrestricted chatbot lives here");
    expect(page).not.toContain('name="prompt"');
  });

  it("requires evidence references and a closed destination vocabulary", () => {
    expect(contract).toContain("allowedClaimIds");
    expect(contract).toContain("availableDestinations.includes");
    expect(contract).toContain("GUIDE_OUTPUT_UNSAFE");
    expect(contract).toContain("unsafeMinorActivity");
  });

  it("uses private evidence context without sending raw reflection or contact fields", () => {
    expect(provider).toContain("livingProfile");
    expect(provider).toContain("selectedPath");
    expect(provider).not.toContain("whatsapp");
    expect(provider).not.toContain("contact_email");
    expect(provider).not.toContain("what_i_learned");
    expect(provider).not.toContain("progress_note");
  });

  it("enforces consent, reuse, rate limiting and deterministic fallback", () => {
    expect(generation).toContain('consent_type", "ai_processing"');
    expect(generation).toContain("findReusableBuilderGuideRun");
    expect(generation).toContain("dailyGenerationLimit = 12");
    expect(generation).toContain("buildEvidenceBasedBuilderGuide");
  });

  it("does not turn the Guide into another primary navigation destination", () => {
    expect(navigation).not.toMatch(/href:\s*["']\/guide["']/);
  });

  it("extends product telemetry without copying Guide advice into telemetry metadata", () => {
    expect(migration).toContain("'builder_guide_generated'");
    expect(migration).toContain("'builder_guide_feedback'");
    expect(migration).toContain("'guide'");
    expect(generation).toContain(
      'recordProductEventForUser(user.id, "builder_guide_generated"',
    );
    expect(generation).toContain("livingProfileVersion:");
  });
});
