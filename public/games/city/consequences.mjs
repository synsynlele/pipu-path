// Fictional consequences derive only from retained choices. No extra save state,
// random punishment, personal judgement or verified real-world claims.
import { CITY_CASES, getCase, getChoice } from "./cases.mjs";
import { infrastructurePlan } from "./construction-plans.mjs";
import { CONNECTIONS } from "./city-growth.mjs";

const kinds = Object.freeze({
  "repair-queue": "backlog",
  "repair-parts": "backlog",
  "repair-training": "stalled",
  "repair-waste": "waste",
  "power-evening": "outage",
  "power-upkeep": "outage",
  "power-clinic": "outage",
  "power-demand": "outage",
  "food-harvest": "waste",
  "food-small-suppliers": "backlog",
  "food-waste": "waste",
  "food-route": "water",
  "learn-equal-parts": "stalled",
  "learn-dark-class": "outage",
  "learn-access": "exclusion",
  "learn-feedback": "stalled",
  "homes-materials": "water",
  "homes-upkeep": "stalled",
  "water-breakdown": "water",
  "water-sanitation": "water",
  "clinic-arrival": "backlog",
  "clinic-supply": "backlog",
  "transit-delivery": "water",
  "transit-people": "exclusion",
  "tech-booking": "stalled",
  "tech-reliability": "outage",
  "enterprise-trust": "backlog",
  "enterprise-cash": "stalled",
  "green-drainage": "water",
  "green-waste": "waste",
  "civic-voices": "exclusion",
  "civic-repairs": "stalled",
  "creative-fairpay": "stalled",
  "creative-audience": "exclusion",
  "industry-spares": "waste",
  "industry-workers": "hazard",
});
const overrides = Object.freeze({
  "repair-training/alone": "hazard",
  "repair-waste/burn": "scorch",
  "power-upkeep/untrained": "hazard",
  "power-clinic/exclude": "exclusion",
  "power-demand/approve": "hazard",
  "power-demand/deny": "exclusion",
  "food-harvest/buy": "outage",
  "food-small-suppliers/loan": "stalled",
  "food-waste/give": "hazard",
  "learn-equal-parts/speed": "exclusion",
  "homes-materials/luxury": "exclusion",
  "homes-upkeep/charge": "exclusion",
  "water-breakdown/private": "exclusion",
  "clinic-arrival/premium": "exclusion",
  "transit-delivery/promise": "backlog",
  "tech-booking/collect": "exclusion",
  "tech-reliability/replace": "backlog",
  "green-waste/burn": "scorch",
  "creative-fairpay/exposure": "exclusion",
  "creative-fairpay/copy": "exclusion",
  "creative-audience/viral": "stalled",
  "industry-workers/automate": "backlog",
});
export const CONSEQUENCE_STYLES = Object.freeze({
  backlog: {
    label: "Waiting work",
    description: "Unserved work is waiting here.",
  },
  stalled: {
    label: "Unfinished work",
    description: "This need still has no working response.",
  },
  waste: {
    label: "Waste left behind",
    description: "Discarded or unusable material remains here.",
  },
  scorch: {
    label: "Burnt ground",
    description: "Burning waste has left scorch marks here.",
  },
  water: {
    label: "Water trouble",
    description: "Water-related damage or unsafe runoff remains here.",
  },
  outage: {
    label: "Interrupted service",
    description: "This service still cannot work reliably.",
  },
  exclusion: {
    label: "Access gap",
    description: "Some people are still left out of this service.",
  },
  hazard: {
    label: "Unsafe work",
    description: "Unsafe work has left a warning here.",
  },
});
export function choiceConsequence(caseId, choiceId) {
  const scenario = getCase(caseId),
    option = getChoice(caseId, choiceId);
  if (!scenario || !option) return null;
  const plan = infrastructurePlan(caseId, choiceId);
  if (plan.status === "working") return null;
  const kind = overrides[caseId + "/" + choiceId] || kinds[caseId];
  if (!kind) throw new Error("Missing consequence contract: " + caseId);
  return {
    caseId,
    choiceId,
    district: scenario.district,
    kind,
    severity: plan.status === "limited" ? "limited" : "harmful",
    label: CONSEQUENCE_STYLES[kind].label,
    // Choice-specific explanation prevents a generic mark becoming the lesson.
    description: plan.label,
    result: option.result,
    tradeoff: option.tradeoff,
  };
}
export function cityConsequences(decisions = {}, districtId = null) {
  const problems = CITY_CASES.flatMap((scenario) => {
    if (districtId && scenario.district !== districtId) return [];
    const problem = choiceConsequence(scenario.id, decisions[scenario.id]);
    return problem ? [problem] : [];
  }).sort(
    (a, b) =>
      Number(b.severity === "harmful") - Number(a.severity === "harmful"),
  );
  return {
    problems,
    harmful: problems.filter((p) => p.severity === "harmful").length,
    limited: problems.filter((p) => p.severity === "limited").length,
    nextRepair: problems[0]?.caseId || null,
    connections: CONNECTIONS.filter((link) =>
      problems.some((p) => p.district === link.from),
    ),
  };
}

// At most eight static meshes per case. No textures, particles, timers or extra
// animation loop. Fits inside each existing plot and never blocks navigation.
export function constructConsequence({
  consequence,
  box,
  parent,
  outer = false,
}) {
  const pieces = [],
    scale = outer ? 3.6 : 0.9;
  const surface = outer ? 0.06 : 0.12;
  const warning = consequence.severity === "limited" ? 0xd7ab4f : 0xb55540;
  function B(w, h, d, color, x, y, z) {
    const mesh = box(
      w * scale,
      h * scale,
      d * scale,
      color,
      x * scale,
      y * scale,
      z * scale,
      parent,
    );
    mesh.userData.ignoreNavigation = true;
    mesh.userData.consequence = consequence.kind;
    pieces.push(mesh);
    return mesh;
  }
  const ground =
    consequence.kind === "water"
      ? 0x526f77
      : consequence.kind === "scorch"
        ? 0x3d342e
        : 0x8a7761;
  // Stains represent physical waste/water only. A limited or unanswered social
  // service gets an access/waiting marker, never arbitrary dirt or punishment.
  if (consequence.severity === "harmful" && consequence.kind === "water") {
    B(0.94, 0.015, 0.25, ground, 0, surface, 0.42);
    B(0.3, 0.018, 0.08, 0x7f9e9d, -0.16, surface + 0.01, 0.46);
  } else if (
    consequence.severity === "harmful" &&
    ["waste", "scorch"].includes(consequence.kind)
  ) {
    for (let i = 0; i < 3; i++)
      B(0.25, 0.015, 0.13, ground, -0.3 + i * 0.3, surface, 0.48);
  }
  if (
    consequence.severity === "harmful" &&
    ["waste", "scorch", "backlog"].includes(consequence.kind)
  ) {
    for (let i = 0; i < 3; i++)
      B(
        0.16,
        0.09 + (i % 2) * 0.04,
        0.13,
        consequence.kind === "scorch" ? 0x433c35 : i % 2 ? 0x9a7957 : 0x667766,
        -0.28 + i * 0.28,
        0.1,
        0.48,
      );
  }
  if (consequence.kind === "exclusion") {
    for (const x of [-0.31, 0.15])
      B(0.04, 0.27, 0.045, 0x626866, x, 0.17, 0.45);
    B(0.55, 0.045, 0.06, warning, -0.08, 0.27, 0.45);
  }
  // Shape plus colour: interrupted/blocked marker remains readable without hue.
  B(0.045, 0.4, 0.05, 0x515b5b, 0.43, 0.24, 0.43);
  const sign = B(0.21, 0.21, 0.045, warning, 0.43, 0.48, 0.43);
  if (["hazard", "outage"].includes(consequence.kind))
    sign.rotation.z = Math.PI / 4;
  return pieces;
}
