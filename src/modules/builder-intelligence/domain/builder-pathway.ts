import type { AgeBand } from "@/modules/identity/domain/identity";
import {
  choiceSchema,
  validateChallenge,
  type BuildChallenge,
  type BuildDifficulty,
} from "@/modules/real-build/domain/build";

export const BUILDER_PATHWAY_SCHEMA_VERSION = "builder-pathway-v1" as const;
export const builderIntelligenceCodes = [
  "financial_intelligence",
  "leadership_intelligence",
  "entrepreneurial_intelligence",
] as const;
export type BuilderIntelligenceCode = (typeof builderIntelligenceCodes)[number];

export type CityDecision = {
  id: string;
  label: string;
  cost: number;
  consequence: string;
  tradeOff: string;
};
export type CityPractice = {
  district: string;
  scenario: string;
  availableNaira: number;
  choices: readonly [CityDecision, CityDecision, ...CityDecision[]];
};
export type BuilderPathwayStage = {
  code: string;
  order: number;
  title: string;
  competencies: readonly string[];
  minimumAgeBand: AgeBand;
  prerequisites: readonly string[];
  difficulty: BuildDifficulty;
  resources: readonly string[];
  safety: string;
  city: CityPractice;
  quest: {
    topic: string;
    minutes: 15 | 30 | 60;
    focus: string;
    challenge: BuildChallenge;
  };
  evidencePrompts: readonly string[];
  reflectionPrompts: readonly string[];
};
export type BuilderPathway = {
  schemaVersion: typeof BUILDER_PATHWAY_SCHEMA_VERSION;
  code: BuilderIntelligenceCode;
  title: string;
  humanReviewVersion: string;
  fallbackVersion: string;
  stages: readonly BuilderPathwayStage[];
};

const ageOrder: readonly AgeBand[] = [
  "under_13",
  "13_15",
  "16_17",
  "18_24",
  "25_plus",
] as const;

export function isStageAllowedForAge(
  stage: BuilderPathwayStage,
  ageBand: string | null | undefined,
) {
  const currentIndex = ageOrder.indexOf(ageBand as AgeBand);
  const minimumIndex = ageOrder.indexOf(stage.minimumAgeBand);
  return currentIndex >= 0 && minimumIndex >= 0 && currentIndex >= minimumIndex;
}

/** Fictional money only. The result is not proof of real-life ability. */
export function simulateCityFinancialDecision(
  stage: BuilderPathwayStage,
  choiceId: string,
) {
  const choice = stage.city.choices.find(
    (candidate) => candidate.id === choiceId,
  );
  if (!choice) return null;
  const remaining = stage.city.availableNaira - choice.cost;
  return {
    remaining,
    shortfall: Math.max(0, -remaining),
    consequence: choice.consequence,
    tradeOff: choice.tradeOff,
  };
}

/**
 * Compile-time shape plus fail-closed runtime review of every curated pathway.
 * No user input or model output can become a catalog stage through this API.
 */
export function validateBuilderPathway<T extends BuilderPathway>(
  pathway: T,
): T {
  if (
    pathway.schemaVersion !== BUILDER_PATHWAY_SCHEMA_VERSION ||
    !builderIntelligenceCodes.includes(pathway.code) ||
    !/^(?:candidate|reviewed)-\d{4}-\d{2}$/.test(pathway.humanReviewVersion) ||
    !/^fallback-v\d+$/.test(pathway.fallbackVersion) ||
    !pathway.stages.length
  )
    throw new Error("PATHWAY_CATALOG_INVALID");
  const codes = new Set<string>();
  for (const [index, stage] of pathway.stages.entries()) {
    if (
      !/^[a-z][a-z0-9_]{2,59}$/.test(stage.code) ||
      codes.has(stage.code) ||
      stage.order !== index + 1 ||
      !ageOrder.includes(stage.minimumAgeBand) ||
      stage.competencies.length === 0 ||
      stage.evidencePrompts.length === 0 ||
      stage.reflectionPrompts.length === 0 ||
      stage.city.availableNaira < 0 ||
      !Number.isSafeInteger(stage.city.availableNaira) ||
      stage.city.choices.length < 2 ||
      !stage.city.choices.every(
        (item) =>
          /^[a-z][a-z0-9_]+$/.test(item.id) &&
          Number.isSafeInteger(item.cost) &&
          item.cost >= 0 &&
          item.consequence.trim().length >= 10 &&
          item.tradeOff.trim().length >= 10,
      ) ||
      new Set(stage.city.choices.map((item) => item.id)).size !==
        stage.city.choices.length ||
      stage.prerequisites.some((code) => !codes.has(code)) ||
      stage.resources.some((item) =>
        /(?:buy|payment|bank account|loan)/i.test(item),
      )
    )
      throw new Error("PATHWAY_CATALOG_INVALID");
    if (
      !choiceSchema.safeParse({
        topic: stage.quest.topic,
        minutes: stage.quest.minutes,
        focus: stage.quest.focus,
      }).success
    )
      throw new Error("PATHWAY_CATALOG_INVALID");
    validateChallenge(stage.quest.challenge);
    codes.add(stage.code);
  }
  return pathway;
}
