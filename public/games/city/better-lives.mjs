import { casesFor, getChoice } from "./cases.mjs";
import { infrastructurePlan } from "./construction-plans.mjs";

// Goals describe intended benefits, never measured people or real-world impact.
export const LIFE_GOALS = Object.freeze({
  workshop: "People can repair useful things and learn practical skills.",
  power: "Homes and essential services have dependable electricity.",
  market: "Fresh food reaches people and suppliers can keep trading.",
  school: "Every learner has a fair chance to learn and practise.",
  housing: "Families have safer homes with access to essential services.",
  water: "People can get clean water and use safe sanitation.",
  health: "People can reach dependable care and essential supplies.",
  transport: "People and deliveries can travel safely and reliably.",
  technology: "Useful technology solves everyday problems for everyone.",
  business: "Small enterprises serve customers and sustain livelihoods.",
  environment:
    "Neighbourhoods stay cleaner and better prepared for heavy rain.",
  governance:
    "Residents have a voice and can hold shared services accountable.",
  creative: "People can create, enjoy culture and receive fair recognition.",
  industry: "Makers produce useful goods safely and avoid unnecessary waste.",
});

export function districtLife(districtId, decisions = {}) {
  const cases = casesFor(districtId);
  const actions = cases.flatMap((scenario) => {
    const choice = getChoice(scenario.id, decisions[scenario.id]);
    if (!choice) return [];
    const plan = infrastructurePlan(scenario.id, choice.id);
    return [
      {
        caseId: scenario.id,
        title: scenario.title,
        status: plan.status,
        result: choice.result,
        tradeoff: choice.tradeoff,
      },
    ];
  });
  const working = actions.filter((action) => action.status === "working");
  const needsAttention = actions.filter(
    (action) => action.status !== "working",
  );
  return {
    goal: LIFE_GOALS[districtId] || "Help residents meet an everyday need.",
    working,
    needsAttention,
    unanswered: cases.length - actions.length,
    // An incomplete service is never described as a completed human outcome.
    state: !actions.length
      ? "Meet the need"
      : needsAttention.length
        ? "Needs attention"
        : actions.length < cases.length
          ? "Making progress"
          : "Plans in place",
    nextReview: needsAttention[0]?.caseId || null,
  };
}
