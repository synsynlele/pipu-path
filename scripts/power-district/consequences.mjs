import assert from "node:assert/strict";
import * as T from "../../public/games/shared/vendor/three.module.js";
import { CITY_CASES, saveDecision } from "../../public/games/city/cases.mjs";
import { infrastructurePlan } from "../../public/games/city/construction-plans.mjs";
import {
  consequenceFor,
  consequencesForCity,
  createConsequenceScene,
} from "../../public/games/city/consequences.mjs";

const scene = new T.Scene();
const materials = new Map();
const mat = (color) => {
  if (!materials.has(color))
    materials.set(color, new T.MeshStandardMaterial({ color }));
  return materials.get(color);
};
const box = (w, h, d, color, x, y, z, parent = scene) => {
  const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), mat(color));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
};
const cyl = (r, h, color, x, y, z, parent = scene, r2 = r, sides = 8) => {
  const mesh = new T.Mesh(new T.CylinderGeometry(r2, r, h, sides), mat(color));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
};
const make = () => createConsequenceScene({ T, scene, box, cyl });
const layer = make();
let decisions = {};
let count = 0;
for (const scenario of CITY_CASES) {
  for (const choice of scenario.options) {
    count++;
    const plan = infrastructurePlan(scenario.id, choice.id);
    const consequence = consequenceFor(scenario.id, choice.id);
    assert.equal(Boolean(consequence), plan.status !== "working");
    if (consequence) {
      assert.equal(consequence.district, scenario.district);
      assert.equal(consequence.label, plan.label);
      assert.equal(consequence.status, plan.status);
    }
    decisions = saveDecision(decisions, scenario.id, choice.id);
    layer.sync(decisions);
    const current = layer.markers.get(scenario.id);
    assert.equal(Boolean(current?.root.visible), Boolean(consequence));
    if (consequence) {
      layer.setFocus(current.root.position);
      assert(current.root.visible, "Problem appears in the same district");
      layer.setFocus({ x: 999, z: 999 });
      assert(!current.root.visible, "Faraway warning is culled on mobile");
      layer.setFocus({ x: 999, z: 999 }, true);
      assert(current.root.visible, "Aerial view shows all retained problems");
      assert(current.root.children.some((child) => child.visible));
    }
  }
}
assert.equal(count, 108);
assert.equal(CITY_CASES.length, 36);

// A working revision repairs the very same plot and clears its warning.
for (const scenario of CITY_CASES) {
  const working = scenario.options.find(
    (item) => infrastructurePlan(scenario.id, item.id).status === "working",
  );
  assert(working, "Every scenario needs a constructive option");
  decisions = saveDecision(decisions, scenario.id, working.id);
  layer.sync(decisions);
  assert(!layer.markers.get(scenario.id)?.root.visible);
}
assert.deepEqual(consequencesForCity(decisions), []);
assert.equal(layer.sync(decisions), 0);

// Reconstructed from device-saved choices, never extra marker persistence.
const failed = CITY_CASES[0].options.find(
  (option) =>
    infrastructurePlan(CITY_CASES[0].id, option.id).status !== "working",
);
decisions = saveDecision(decisions, CITY_CASES[0].id, failed.id);
const saved = JSON.parse(JSON.stringify(decisions));
const restored = make();
assert.equal(restored.sync(saved), 1);
const restoredMarker = restored.markers.get(CITY_CASES[0].id);
assert(restoredMarker.root.visible);
assert.equal(consequencesForCity(saved).length, 1);
assert.equal(consequencesForCity({}).length, 0);
assert.equal(consequenceFor("not-a-real-case", "bad"), null);

console.log(
  "PASS: all 108 authored choices, persistent district-specific consequences, " +
    "working revisions, mobile culling, aerial restoration and save reconstruction.",
);
