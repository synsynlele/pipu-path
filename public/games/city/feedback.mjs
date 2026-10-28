// Authored prop placements for visibly enacted fictional decisions.
// Visual states represent case-specific learning examples, not measured city
// outcomes, certified skills or changes to the power/food economic model.
export const CASE_BUILD_SITES = Object.freeze({
  "repair-queue": { district: "workshop", x: -0.5, z: -3.1, kind: "queue", label: "Repair queue" },
  "repair-parts": { district: "workshop", x: 0.9, z: -3.1, kind: "shelves", label: "Spare-parts shelf" },
  "repair-training": { district: "workshop", x: -0.5, z: -1.7, kind: "practice", label: "Training bench" },
  "repair-waste": { district: "workshop", x: 0.9, z: -1.7, kind: "recycling", label: "Safe collection" },
  "power-evening": { district: "power", x: 4.0, z: -7.5, kind: "battery", label: "Evening energy" },
  "power-upkeep": { district: "power", x: 5.4, z: -7.5, kind: "service", label: "Maintenance stand" },
  "power-clinic": { district: "power", x: 4.0, z: -6.1, kind: "clinic", label: "Clinic backup" },
  "power-demand": { district: "power", x: 5.4, z: -6.1, kind: "meter", label: "Demand meter" },
  "food-harvest": { district: "market", x: 21.1, z: 9.5, kind: "crate", label: "Harvest protection" },
  "food-small-suppliers": { district: "market", x: 22.5, z: 9.5, kind: "payments", label: "Supplier payments" },
  "food-waste": { district: "market", x: 21.1, z: 10.9, kind: "sorting", label: "Sorting station" },
  "food-route": { district: "market", x: 22.5, z: 10.9, kind: "route", label: "Delivery routing" },
  "learn-equal-parts": { district: "school", x: -12.4, z: 14.1, kind: "fractions", label: "Fraction board" },
  "learn-dark-class": { district: "school", x: -11.0, z: 14.1, kind: "lights", label: "Learning lights" },
  "learn-access": { district: "school", x: -12.4, z: 15.5, kind: "access", label: "Inclusive materials" },
  "learn-feedback": { district: "school", x: -11.0, z: 15.5, kind: "feedback", label: "Learning feedback" },
});
export function visualTone(option) {
  if (!option || !Array.isArray(option.impact) || option.impact.length !== 4) return null;
  const score = option.impact.reduce((sum, n) => sum + n, 0);
  return score >= 3 ? "improving" : score >= 0 ? "mixed" : "strained";
}
export function feedbackCopy(kind, tone) {
  const action = {
    queue: "The repair queue changes.",
    shelves: "The parts inventory changes.",
    practice: "A learner training station appears.",
    recycling: "The recycling area changes.",
    battery: "The evening energy setup changes.",
    service: "The maintenance board changes.",
    clinic: "The clinic backup plan takes shape.",
    meter: "The electricity demand display changes.",
    crate: "Harvest storage takes shape.",
    payments: "The supplier payment desk changes.",
    sorting: "The sorting station changes.",
    route: "The delivery route is marked.",
    fractions: "The fractions teaching board changes.",
    lights: "The classroom lighting changes.",
    access: "Learning resources change.",
    feedback: "The learner feedback board changes.",
  }[kind] ?? "This district changes.";
  return action + (tone === "improving"
    ? " Services are improving in this scenario."
    : tone === "strained"
      ? " Some needs are still unmet."
      : " There are benefits and compromises.");
}
