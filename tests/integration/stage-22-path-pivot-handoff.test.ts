import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const missionPage = readFileSync("src/app/mission/page.tsx", "utf8");
const missionActions = readFileSync(
  "src/modules/mission/application/mission-actions.ts",
  "utf8",
);
const profileComplete = readFileSync(
  "src/app/onboarding/discovery/profile/complete/page.tsx",
  "utf8",
);
const journeyActions = readFileSync(
  "src/modules/journey/application/journey-actions.ts",
  "utf8",
);
const questActions = readFileSync(
  "src/modules/quest/application/quest-actions.ts",
  "utf8",
);
const questGenerationForm = readFileSync(
  "src/modules/quest/ui/quest-generation-form.tsx",
  "utf8",
);
const missionDal = readFileSync(
  "src/modules/mission/infrastructure/mission-dal.ts",
  "utf8",
);
const migration = readFileSync(
  "supabase/migrations/20260820023000_reset_mission_attempts_on_path_pivot.sql",
  "utf8",
);

describe("Stage 22 Path pivot handoff", () => {
  it("turns a generated Mission into a Continue handoff", () => {
    expect(missionPage).toContain("Continue →");
    expect(missionActions).toContain('redirect("/journey")');
    expect(profileComplete).toContain("Continue My Mission →");
    expect(profileComplete).toContain("Continue My Journey →");
  });

  it("moves an activated Journey directly into Quests", () => {
    expect(journeyActions).toContain('revalidatePath("/quests")');
    expect(journeyActions).toContain('redirect("/quests")');
  });

  it("automatically prepares a missing Quest chain with a safe retry", () => {
    expect(questGenerationForm).toContain("autoStart = true");
    expect(questGenerationForm).toContain("requestSubmit()");
    expect(questGenerationForm).toContain("Retry Quest Generation");
  });

  it("prepares the next Quest chain when completion opens a milestone", () => {
    expect(questActions).toContain("await generateCurrentQuestPack()");
  });

  it("resets Mission generation attempts at each Path selection cycle", () => {
    expect(migration).toContain("current_path_selected_at");
    expect(migration).toContain("created_at >= current_path_selected_at");
    expect(migration).toContain("from anon");
    expect(migration).toContain("to authenticated");
    expect(missionDal).toContain('requestQuery.gte("created_at", pathways.selectedAt)');
  });
});
