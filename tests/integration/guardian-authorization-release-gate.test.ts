import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read(
  "supabase/migrations/20261010160000_guardian_authorization_and_minor_ai_gate.sql",
);
const checkpointAction = read(
  "src/modules/identity/application/checkpoint-actions.ts",
);
const checkpointForm = read("src/modules/identity/ui/checkpoint-form.tsx");
const identityDal = read("src/modules/identity/infrastructure/identity-dal.ts");
const progressDal = read("src/modules/identity/infrastructure/progress-dal.ts");

const externalAiGenerationFiles = [
  "src/modules/human-potential/application/profile-generation.ts",
  "src/modules/economic-pathways/application/economic-pathway-generation.ts",
  "src/modules/mission/application/mission-generation.ts",
  "src/modules/journey/application/journey-generation.ts",
  "src/modules/quest/application/quest-generation.ts",
  "src/modules/builder-guide/application/builder-guide-generation.ts",
];

describe("guardian authorization release gate", () => {
  it("requires independently authenticated adult approval rather than child self-approval", () => {
    expect(migration).toContain(
      "create table public.guardian_authorization_requests",
    );
    expect(migration).toContain("GUARDIAN_ADULT_REQUIRED");
    expect(migration).toContain("GUARDIAN_SELF_APPROVAL_DENIED");
    expect(migration).toContain(
      "guardian_profile.age_band not in ('18_24', '25_plus')",
    );
    expect(migration).toContain(
      "'guardian_required', policy_version_input, 'granted', 'guardian'",
    );
  });

  it("does not make a minor self-consent to AI during identity setup", () => {
    expect(checkpointAction).toContain("accept_ai: z.string().optional()");
    expect(checkpointAction).toContain("accept_ai: !minor");
    expect(checkpointForm).toContain(
      "Under-18 accounts do not use external AI providers at launch",
    );
    expect(migration).toContain(
      "'ai_processing', policy_version_input, 'declined', 'identity_checkpoint'",
    );
  });

  it("blocks authenticated minors from bypassing the guardian gate", () => {
    expect(identityDal).toContain('redirect("/onboarding/guardian")');
    expect(progressDal).toContain('return "/onboarding/guardian"');
    expect(migration).toContain("private.guardian_authorization_granted");
  });

  it("fails closed across every current OpenAI generation path for minors", () => {
    for (const file of externalAiGenerationFiles) {
      const source = read(file);
      expect(source).toMatch(
        /let openAIAvailable = !(?:context\.isMinor|profile\.is_minor);/,
      );
      expect(source).toContain("MINOR_EXTERNAL_AI_DISABLED");
    }
  });

  it("keeps guardian records private behind authenticated ownership-aware RPCs", () => {
    expect(migration).toContain(
      "alter table public.guardian_authorization_requests enable row level security",
    );
    expect(migration).toContain(
      "revoke all on public.guardian_authorization_requests from public, anon, authenticated",
    );
    expect(migration).toContain(
      "revoke all on function public.grant_guardian_authorization(text, text, text) from public, anon",
    );
  });
});
