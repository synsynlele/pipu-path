import assert from "node:assert/strict";
import * as T from "../../public/games/shared/vendor/three.module.js";
import { CITY_CASES } from "../../public/games/city/cases.mjs";
import {
  CITY_BUILD_MILESTONES,
  formatForCase,
  milestoneForCase,
  milestoneForMission,
  completedMilestones,
} from "../../public/games/city/build-milestones.mjs";
import { createMilestoneScene } from "../../public/games/city/build-milestone-scene.mjs";
import {
  labMission,
  evaluateLab,
  sanitizeLab,
} from "../../public/games/city/build-lab.mjs";
assert.equal(CITY_CASES.length, 36);
assert.equal(CITY_BUILD_MILESTONES.length, 5);
assert.equal(new Set(CITY_BUILD_MILESTONES.map((m) => m.caseId)).size, 5);
assert.equal(new Set(CITY_BUILD_MILESTONES.map((m) => m.district)).size, 5);
for (const { caseId, id } of CITY_BUILD_MILESTONES) {
  assert(
    CITY_CASES.some((c) => c.id === caseId),
    "Every puzzle is attached to an authored dilemma",
  );
  assert.equal(formatForCase(caseId).missionId, id);
  assert.equal(milestoneForCase(caseId).id, id);
  assert.equal(milestoneForMission(id).caseId, caseId);
}
assert.equal(formatForCase("repair-parts").format, "decision");
assert.equal(formatForCase("green-waste").format, "decision");
assert.equal(
  CITY_CASES.filter((c) => formatForCase(c.id).format === "decision").length,
  31,
);
const scene = new T.Scene();
const box = (w, h, d, c, x, y, z, parent) => {
  const mesh = new T.Mesh(
    new T.BoxGeometry(w, h, d),
    new T.MeshBasicMaterial({ color: c }),
  );
  mesh.position.set(x, y, z);
  (parent ?? scene).add(mesh);
  return mesh;
};
const cyl = (r, h, c, x, y, z, parent) => {
  const mesh = new T.Mesh(
    new T.CylinderGeometry(r, r, h),
    new T.MeshBasicMaterial({ color: c }),
  );
  mesh.position.set(x, y, z);
  (parent ?? scene).add(mesh);
  return mesh;
};
const milestones = createMilestoneScene({ T, scene, box, cyl });
assert.equal(scene.children.length, 5);
assert.equal(milestones.buildings.size, 5);
for (const { group } of milestones.buildings.values()) {
  assert(!group.visible);
  assert(group.children.length >= 7);
  group.traverse((obj) => assert.equal(obj.userData.ignoreNavigation, true));
}
const board = Array(25).fill(null);
board[5] = { kind: "bend", turn: 1 };
for (let i = 6; i <= 8; i++) board[i] = { kind: "straight", turn: 1 };
board[9] = { kind: "bend", turn: 2 };
assert(evaluateLab(labMission("workshop-link"), board).success);
let lab = sanitizeLab({ boards: { "workshop-link": board } });
milestones.sync(lab);
assert(
  !milestones.buildings.get("workshop-link").group.visible,
  "A correct but untested design must not build automatically",
);
lab = sanitizeLab({ ...lab, tested: ["workshop-link"] });
milestones.sync(lab, 200);
assert(milestones.buildings.get("workshop-link").group.visible);
assert(milestones.reveal("workshop-link", 200));
milestones.animate(200, false);
assert(milestones.buildings.get("workshop-link").group.scale.x < 1);
milestones.animate(2000, false);
assert.equal(milestones.buildings.get("workshop-link").group.scale.x, 1);
assert.equal(completedMilestones(lab, evaluateLab, labMission).length, 1);
const outage = sanitizeLab({...lab, faults: {"workshop-link": 7}});
milestones.sync(outage);
assert.equal(milestones.buildings.get("workshop-link").offline, true);
assert.equal(milestones.buildings.get("workshop-link").group.visible, true);
assert.equal(
  milestones.buildings.get("workshop-link").serviceLight.material.color.getHex(),
  0xea7840,
);
milestones.sync(lab);
assert.equal(milestones.buildings.get("workshop-link").offline, false);
const broken = lab.boards["workshop-link"].slice();
broken[7] = null;
milestones.sync(
  sanitizeLab({
    boards: { "workshop-link": broken },
    tested: ["workshop-link"],
  }),
);
assert(!milestones.buildings.get("workshop-link").group.visible);
assert.equal(
  completedMilestones(
    { boards: { "workshop-link": broken }, tested: ["workshop-link"] },
    evaluateLab,
    labMission,
  ).length,
  0,
);
console.log(
  "PASS: 31 decision cases, 5 selected decision-to-build milestones, five real 3D structures, test-before-build and revision removal.",
);
