import assert from "node:assert/strict";
import {
  serviceImpact,
  serviceFor,
  weakestConnection,
  startServiceDrill,
  finishServiceRepair,
} from "../../public/games/city/city-service-system.mjs";
import {
  skillRecommendation,
  challengeDifficulty,
} from "../../public/games/city/build-progression.mjs";
import {
  sanitizeLab,
  labMission,
  evaluateLab,
} from "../../public/games/city/build-lab.mjs";
// Workshop source 10 -> target 14, with an upward bypass around tree 12.
const workshop = Array(25).fill(null);
workshop[5] = { kind: "bend", turn: 1 };
for (let i = 6; i <= 8; i++) workshop[i] = { kind: "straight", turn: 1 };
workshop[9] = { kind: "bend", turn: 2 };
assert(evaluateLab(labMission("workshop-link"), workshop).success);
const empty = sanitizeLab(null);
assert.equal(serviceImpact(empty).served, 0);
assert.equal(serviceImpact(empty).unmet, 40);
assert.equal(serviceImpact(empty).builtCount, 0);
assert.equal(skillRecommendation(empty).tier, "Explorer");
assert.equal(skillRecommendation(empty).recommendedId, "workshop-link");
let lab = sanitizeLab({
  boards: { "workshop-link": workshop },
  tested: ["workshop-link"],
  attempts: { "workshop-link": { tests: 1, successes: 1, hints: 0 } },
});
assert.equal(serviceImpact(lab).served, 6);
assert.equal(serviceImpact(lab).unmet, 34);
assert.equal(serviceFor(lab, "workshop-link").totalLocations, 1);
assert.equal(skillRecommendation(lab).clean, 1);
assert.equal(challengeDifficulty("backup-water"), 4);
const initial = JSON.stringify(lab.boards["workshop-link"]);
const weak = weakestConnection(lab, "workshop-link");
assert(weak.lost === 1 && Number.isInteger(weak.cell));
const drill = startServiceDrill(lab, "workshop-link");
assert.equal(drill.status, "damaged");
assert.equal(drill.before.served, 6);
assert.equal(drill.after.served, 0);
assert.equal(serviceImpact(drill.lab).unmet, 40);
assert.equal(JSON.stringify(drill.lab.boards["workshop-link"]), initial);
assert.equal(drill.lab.tested.includes("workshop-link"), true);
assert.equal(
  startServiceDrill(drill.lab, "workshop-link").status,
  "already-damaged",
);
const repaired = finishServiceRepair(drill.lab, "workshop-link");
assert.equal(repaired.repaired, true);
assert.equal(serviceFor(repaired.lab, "workshop-link").served, 6);
assert.equal(JSON.stringify(repaired.lab.boards["workshop-link"]), initial);
assert.equal(
  finishServiceRepair(repaired.lab, "workshop-link").repaired,
  false,
);
assert.equal(startServiceDrill(empty, "workshop-link").status, "not-ready");
assert.deepEqual(
  sanitizeLab({
    faults: { "workshop-link": "__proto__" },
    attempts: {
      "workshop-link": { tests: Infinity, successes: -3, hints: 1000 },
    },
  }).attempts["workshop-link"],
  { tests: 0, successes: 0, hints: 30 },
);
assert.equal(
  sanitizeLab({ faults: { "workshop-link": 13 } }).faults["workshop-link"],
  null,
);
assert.equal(skillRecommendation(lab).recommendedId, "clinic-power");
console.log(
  "PASS: authored service loads, fictional shortage before/after, real broken-link repair, immutable original boards and adaptive builder recommendation.",
);
