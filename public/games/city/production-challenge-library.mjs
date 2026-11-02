// Reuse production authorship and consequence contracts; no duplicated curriculum.
import { CITY_CASES, getCase } from "./cases.mjs";
import { infrastructurePlan } from "./construction-plans.mjs";
import { CASE_BUILD_SITES } from "./feedback.mjs";
export const PRODUCTION_CHALLENGE_LIBRARY = Object.freeze(
  CITY_CASES.map((c) =>
    Object.freeze({
      id: c.id,
      district: c.district,
      title: c.title,
      situation: c.situation,
      site: CASE_BUILD_SITES[c.id],
      approaches: c.options.map((o) => ({
        id: o.id,
        title: o.title,
        consequence: o.result,
        tradeoff: o.tradeoff,
        plan: infrastructurePlan(c.id, o.id),
      })),
      reflection: c.bridge,
    }),
  ),
);
export const HANDS_ON_SOURCE_CASES = Object.freeze({
  teach: "repair-training",
  environment: "green-drainage",
  trust: "civic-repairs",
});
export function productionBrief(mission, practicalAction) {
  const c = getCase(HANDS_ON_SOURCE_CASES[mission]);
  return c ? `${c.situation} ${practicalAction}` : practicalAction;
}
