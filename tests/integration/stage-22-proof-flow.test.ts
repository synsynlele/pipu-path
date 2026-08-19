import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const proofEntry = read("src/app/proof/page.tsx");
const questFocus = read("src/app/quests/[questId]/page.tsx");
const questProof = read("src/app/quests/[questId]/proof/page.tsx");
const questNotFound = read("src/app/quests/[questId]/not-found.tsx");
const questActions = read("src/modules/quest/application/quest-actions.ts");
const evidenceForm = read("src/modules/quest/ui/quest-evidence-form.tsx");
const passportPage = read("src/app/passport/page.tsx");
const passportShare = read(
  "src/modules/passport/ui/passport-share-creator.tsx",
);

describe("Stage 22 proof-flow finalization", () => {
  it("turns the legacy proof entry into a safe compatibility gateway", () => {
    expect(proofEntry).toContain("getAuthenticatedHomeState");
    expect(proofEntry).toContain('redirect("/login?next=/proof")');
    expect(proofEntry).toContain("/proof`");
    expect(proofEntry).toContain('redirect("/quests")');
  });

  it("provides a dedicated private Prove step with stale-link recovery", () => {
    expect(questProof).toContain("Phase 3 · Prove");
    expect(questProof).toContain("Bring back what happened.");
    expect(questProof).toContain("QuestEvidenceForm");
    expect(questProof).toContain("getCurrentQuestState");
    expect(questProof).toContain("current.id !== questId");
    expect(questProof).toContain("Private by default");
    expect(questProof).toContain("Nothing here is");
  });

  it("routes an active Quest into the dedicated Prove step", () => {
    expect(questFocus).not.toContain(
      '<QuestEvidenceForm questId={quest.id} today={today} />',
    );
    expect(questFocus).toContain('href={`/quests/${quest.id}/proof`}');
    expect(questFocus).toContain("Continue to Prove →");
  });

  it("keeps mobile proof controls usable without Safari zoom or nav overlap", () => {
    expect(evidenceForm).toContain("text-base");
    expect(evidenceForm).toContain("sm:text-sm");
    expect(evidenceForm).toContain("w-full touch-manipulation");
    expect(evidenceForm).toContain("image/heic");
    expect(evidenceForm).toContain("image/heif");
    expect(questActions).toContain('"image/heic"');
    expect(questActions).toContain('"image/heif"');
  });

  it("keeps the submission truthful and private", () => {
    expect(evidenceForm).toContain('name="evidenceText"');
    expect(evidenceForm).toContain('name="happenedOn"');
    expect(evidenceForm).toContain('name="evidenceLink"');
    expect(evidenceForm).toContain('name="evidenceImage"');
    expect(evidenceForm).toContain("Submit Proof");
    expect(evidenceForm).toContain("does not publish the evidence");
  });

  it("uses the shared contrast-safe controls throughout Passport", () => {
    expect(passportPage).toContain("ButtonLink");
    expect(passportPage).toContain('variant="premium"');
    expect(passportPage).toContain("Revoke current Passport");
    expect(passportShare).toContain("<Button");
    expect(passportShare).toContain('variant="secondary"');
    expect(passportShare).toContain("text-base sm:text-sm");
  });

  it("replaces a generic dead end with a deterministic recovery path", () => {
    expect(questNotFound).toContain(
      "This Quest is no longer your current proof step.",
    );
    expect(questNotFound).toContain('href="/quests"');
    expect(questNotFound).toContain('href="/app"');
  });
});
