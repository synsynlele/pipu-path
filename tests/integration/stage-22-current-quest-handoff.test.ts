import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const questActions = readFileSync(
  "src/modules/quest/application/quest-actions.ts",
  "utf8",
);
const questPage = readFileSync("src/app/quests/page.tsx", "utf8");
const provider = readFileSync(
  "src/modules/quest/infrastructure/openai-quest-provider.ts",
  "utf8",
);

describe("Stage 22 current Quest handoff", () => {
  it("opens the first generated Quest instead of returning to the overview", () => {
    expect(questActions).toContain(
      "redirect(`/quests/${result.firstQuestId}`)",
    );
    expect(questActions).not.toContain(
      'const result = await generateCurrentQuestPack();\n  if (!result.ok) return { status: "error", message: result.message };\n\n  redirect("/quests");',
    );
  });

  it("resumes an already active Quest directly from the Quest entry route", () => {
    expect(questPage).toContain('import { redirect } from "next/navigation"');
    expect(questPage).toContain("if (state?.active)");
    expect(questPage).toContain("redirect(`/quests/${state.active.id}`)");
  });

  it("assigns model Quest order deterministically before domain validation", () => {
    expect(provider).toContain("normalizeQuestProviderOutput");
    expect(provider).toContain("sequence_order: index + 1");
    expect(provider).toContain('schemaName: "pipupath_quest_pack_v2"');
  });
});
