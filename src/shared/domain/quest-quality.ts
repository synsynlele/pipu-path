// Shared quality standard for newly generated Quests, not a retroactive
// judgement of saved work. Deterministic checks catch obvious failures;
// they cannot certify usefulness, safety, or real-world outcomes.
export const QUEST_QUALITY_VERSION = "problem-solving-v1";

export const questQualityInstructions = [
  "Develop a problem solver, not a task completer. Keep the user's real problem central. Identify who benefits, the cause or bottleneck to investigate, and an observable baseline.",
  "Choose a specific working tool, useful service or repeatable process. Supply actual setup values, examples, materials and words to use. Do not make the learner invent missing instructions.",
  "Adapt to the available resources and the learner's developmental level. Prefer no-cost, accessible work in familiar permitted settings; never assume a phone, electricity, internet, transport, money, coding skill or adult independence.",
  "Do not substitute a poster, survey, essay, presentation, simulated business or motivational advice for a working intervention. Genuine discovery is allowed when it directly informs a subsequent real action.",
  "Name a small observable success signal: compare the same measure before and after, or compare two real trials under similar conditions. Specify how to collect it without private data.",
  "Make the next iteration depend on what actually happened. If it failed, revise one variable and test again. Never invent results, require success to record an honest attempt, or claim verified impact from self-report.",
  "Use Nigerian and African settings when relevant, without stereotypes. Offer a low-resource route. Keep minors in familiar supervised environments; no strangers, compulsory spending, dangerous work, or unnecessary private information.",
].join(" ");

export type QuestQualityIssue =
  | "GENERIC_ACTION"
  | "REPEATED_ACTIONS"
  | "NO_BUILD_ACTION"
  | "NO_MEASURABLE_TEST"
  | "NO_IMPROVEMENT_ACTION";

function normalized(action: string) {
  return action
    .normalize("NFKC")
    .replace(/^\s*(?:\d+[.)]|[-•])\s*/, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Deliberately narrow: reject bare instructions, not specific variants.
const genericAction =
  /^(?:build (?:an? |the |your )?(?:app|system|solution|prototype)|create (?:an? |the |your )?(?:solution|system)|test (?:it|the solution|your solution)|improve (?:it|the solution|your solution)|do your research|brainstorm ideas|make a plan|collect feedback|write a report|solve the problem|take action)$/i;

export function inspectQuestActions(
  actions: readonly string[],
): QuestQualityIssue | null {
  const values = actions.map(normalized);
  if (values.some((value) => !value || genericAction.test(value)))
    return "GENERIC_ACTION";
  if (new Set(values).size !== values.length) return "REPEATED_ACTIONS";
  return null;
}

const buildAction =
  /\b(?:build|make|assemble|set up|configure|run|teach|deliver|arrange|organise|organize|sort|place|move|fit|plant|water|label|enable|start|introduce|put|install|prepare|reuse|repurpose|guide|host|serve|demonstrate|activate|fill|remove|add|change|launch|implement|connect|sew|weigh|wash|clean|collect|distribute|pair|pack|cook|bake|schedule|switch|turn|secure|apply|share|invite|send|adjust|refill|harvest|stitch|weave)\b/i;
const measurableTest =
  /\b(?:count|measure|compare|time|tally|observe|record|check|track|weigh|notice|ask|score|note)\b/i;
const improvementAction =
  /\b(?:adjust|change|revise|refine|replace|rearrange|remove|add|improve|repeat|retry|adapt|modify|correct|simplify|update|repair|reduce|increase|switch|try|run|test)\b/i;

export function inspectRealQuestStages(
  stages: readonly (readonly string[])[],
): QuestQualityIssue | null {
  const actions = stages.flat();
  const issue = inspectQuestActions(actions);
  if (issue) return issue;
  if (!buildAction.test((stages[2] ?? []).join(" "))) return "NO_BUILD_ACTION";
  if (!measurableTest.test((stages[3] ?? []).join(" ")))
    return "NO_MEASURABLE_TEST";
  if (!improvementAction.test((stages[4] ?? []).join(" ")))
    return "NO_IMPROVEMENT_ACTION";
  return null;
}

export function inspectJourneyQuestActions(
  quests: readonly { action_steps: readonly string[] }[],
): QuestQualityIssue | null {
  const signatures = new Set<string>();
  for (const quest of quests) {
    const issue = inspectQuestActions(quest.action_steps);
    if (issue) return issue;
    const signature = quest.action_steps.map(normalized).sort().join("|");
    if (signatures.has(signature)) return "REPEATED_ACTIONS";
    signatures.add(signature);
  }
  return null;
}
