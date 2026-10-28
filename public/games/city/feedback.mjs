// Authored prop placements for visibly enacted fictional decisions.
// Visual states represent case-specific learning examples, not measured city
// outcomes, certified skills or changes to the power/food economic model.
// Two construction plots in each of the ten outer districts. Scene props
// are non-colliding and reconstructed from the selected decision ID.
import { OUTER_DISTRICTS } from "./districts.mjs";
import { GROWING_CITY_CASES } from "./chapter-two.mjs";
const outerSites = {};
const kinds = {
  housing: ["homes", "upkeep"],
  water: ["pump", "drains"],
  health: ["clinic", "supply"],
  transport: ["roads", "crosswalk"],
  technology: ["digital", "offline"],
  business: ["shops", "finance"],
  environment: ["flood", "recycling"],
  governance: ["civic", "reports"],
  creative: ["stage", "notices"],
  industry: ["factory", "training"],
};
for (const district of OUTER_DISTRICTS) {
  const authored = GROWING_CITY_CASES.filter((c) => c.district === district.id);
  authored.forEach((challenge, i) => {
    outerSites[challenge.id] = {
      district: district.id,
      x: district.x - 3.2 + i * 6.4,
      z: district.z - 1,
      kind: kinds[district.id][i],
      label: challenge.title,
    };
  });
}
export const CASE_BUILD_SITES = Object.freeze({
  "repair-queue": {
    district: "workshop",
    x: -0.5,
    z: -3.1,
    kind: "queue",
    label: "Repair queue",
  },
  "repair-parts": {
    district: "workshop",
    x: 0.9,
    z: -3.1,
    kind: "shelves",
    label: "Spare-parts shelf",
  },
  "repair-training": {
    district: "workshop",
    x: -0.5,
    z: -1.7,
    kind: "practice",
    label: "Training bench",
  },
  "repair-waste": {
    district: "workshop",
    x: 0.9,
    z: -1.7,
    kind: "recycling",
    label: "Safe collection",
  },
  "power-evening": {
    district: "power",
    x: -0.5,
    z: -9.1,
    kind: "battery",
    label: "Evening energy",
  },
  "power-upkeep": {
    district: "power",
    x: 1.1,
    z: -9.1,
    kind: "service",
    label: "Maintenance stand",
  },
  "power-clinic": {
    district: "power",
    x: -0.5,
    z: -10.6,
    kind: "clinic",
    label: "Clinic backup",
  },
  "power-demand": {
    district: "power",
    x: 1.1,
    z: -10.6,
    kind: "meter",
    label: "Demand meter",
  },
  "food-harvest": {
    district: "market",
    x: 21.1,
    z: 16.5,
    kind: "crate",
    label: "Harvest protection",
  },
  "food-small-suppliers": {
    district: "market",
    x: 22.5,
    z: 16.5,
    kind: "payments",
    label: "Supplier payments",
  },
  "food-waste": {
    district: "market",
    x: 21.1,
    z: 17.9,
    kind: "sorting",
    label: "Sorting station",
  },
  "food-route": {
    district: "market",
    x: 22.5,
    z: 17.9,
    kind: "route",
    label: "Delivery routing",
  },
  "learn-equal-parts": {
    district: "school",
    x: -12.4,
    z: 14.1,
    kind: "fractions",
    label: "Fraction board",
  },
  "learn-dark-class": {
    district: "school",
    x: -11.0,
    z: 14.1,
    kind: "lights",
    label: "Learning lights",
  },
  "learn-access": {
    district: "school",
    x: -12.4,
    z: 15.5,
    kind: "access",
    label: "Inclusive materials",
  },
  "learn-feedback": {
    district: "school",
    x: -11.0,
    z: 15.5,
    kind: "feedback",
    label: "Learning feedback",
  },
  ...outerSites,
});
export function visualTone(option) {
  if (!option || !Array.isArray(option.impact) || option.impact.length !== 4)
    return null;
  const score = option.impact.reduce((sum, n) => sum + n, 0);
  return score >= 3 ? "improving" : score >= 0 ? "mixed" : "strained";
}
export function feedbackCopy(kind, tone) {
  const action =
    {
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
      homes: "Homes begin to take shape.",
      upkeep: "Shared housing services change.",
      pump: "The neighbourhood water point changes.",
      drains: "New sanitation works appear.",
      clinic: "Clinic access changes.",
      supply: "The medical supply point changes.",
      roads: "The delivery yard changes.",
      crosswalk: "A street crossing takes shape.",
      digital: "A public-service technology kiosk changes.",
      offline: "The backup communication point changes.",
      shops: "A shop front develops.",
      finance: "The enterprise payment desk changes.",
      flood: "The rainwater protection area changes.",
      recycling: "A waste collection site takes shape.",
      civic: "The community meeting space changes.",
      reports: "The public service board changes.",
      stage: "A community stage takes shape.",
      notices: "Creative announcements appear.",
      factory: "The local making yard changes.",
      training: "A production training station changes.",
    }[kind] ?? "This district changes.";
  return (
    action +
    (tone === "improving"
      ? " Services are improving in this scenario."
      : tone === "strained"
        ? " Some needs are still unmet."
        : " There are benefits and compromises.")
  );
}
