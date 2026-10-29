import { choiceConsequence } from "../../public/games/city/consequences.mjs";
import assert from "node:assert/strict";
import * as T from "../../public/games/shared/vendor/three.module.js";
import { CITY_CASES } from "../../public/games/city/cases.mjs";
import { CASE_BUILD_SITES } from "../../public/games/city/feedback.mjs";
import { OUTER_DISTRICTS } from "../../public/games/city/districts.mjs";
import {
  overlapsRoad,
  segmentNearPerson,
  overviewFrustum,
} from "../../public/games/city/layout.mjs";
import { infrastructurePlan } from "../../public/games/city/infrastructure.mjs";
import { createCaseSceneEffects } from "../../public/games/city/scene-feedback.mjs";
import { createLivingCityScene } from "../../public/games/city/living-scene.mjs";
const scene = new T.Scene();
const materials = new Map();
const mat = (c) => {
  if (!materials.has(c))
    materials.set(c, new T.MeshStandardMaterial({ color: c }));
  return materials.get(c);
};
const box = (w, h, d, c, x, y, z, parent = scene) => {
  const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat(c));
  m.position.set(x, y, z);
  parent.add(m);
  return m;
};
const cyl = (r, h, c, x, y, z, parent = scene, r2 = r, sides = 8) => {
  const m = new T.Mesh(new T.CylinderGeometry(r2, r, h, sides), mat(c));
  m.position.set(x, y, z);
  parent.add(m);
  return m;
};
const effects = createCaseSceneEffects({ T, scene, box, cyl, mat });
let choices = {};
for (const scenario of CITY_CASES) {
  const site = CASE_BUILD_SITES[scenario.id];
  const outer = OUTER_DISTRICTS.some((d) => d.id === scenario.district);
  for (const choice of scenario.options) {
    const plan = infrastructurePlan(scenario.id, choice.id);
    assert(plan);
    assert.equal(plan.title, choice.title);
    choices = { ...choices, [scenario.id]: choice.id };
    effects.sync(choices);
    effects.animate(performance.now() + 2000, false);
    const effect = effects.effects.get(scenario.id);
    const chosen = effect.variants.get(choice.id);
    assert.equal(
      [...effect.variants.values()].filter((v) => v.visible).length,
      1,
    );
    if (!plan.assets.length) {
      assert.equal(
        effect.group.visible,
        Boolean(choiceConsequence(scenario.id, choice.id)),
        "An unresolved need can show harm without inventing infrastructure",
      );
      assert.equal(chosen.children.length, 0);
      // Consequence marks are separate from infrastructure and stay in-plot.
      scene.updateMatrixWorld(true);
      const marks = effect.consequences.get(choice.id);
      if (marks) {
        const extent = new T.Box3()
          .setFromObject(marks)
          .getSize(new T.Vector3());
        assert(extent.x <= (outer ? 5 : 1.3));
        assert(extent.z <= (outer ? 4.2 : 1.3));
      }
      continue;
    }
    scene.updateMatrixWorld(true);
    const bounds = new T.Box3().setFromObject(chosen);
    const size = bounds.getSize(new T.Vector3());
    assert(size.x <= (outer ? 5 : 1.3), scenario.id + " plot width");
    assert(size.z <= (outer ? 4.2 : 1.3), scenario.id + " plot depth");
    assert(
      scenario.id === "transit-people" ||
        !overlapsRoad(
          (bounds.min.x + bounds.max.x) / 2,
          (bounds.min.z + bounds.max.z) / 2,
          size.x,
          size.z,
        ),
      scenario.id + " intrudes into a street",
    );
    if (outer && scenario.id !== "transit-people")
      assert(
        Math.abs(
          site.x - OUTER_DISTRICTS.find((d) => d.id === scenario.district).x,
        ) < 7,
      );
  }
}
for (const a of OUTER_DISTRICTS)
  for (const b of OUTER_DISTRICTS)
    if (a !== b)
      assert(
        Math.abs(a.x - b.x) >= 15 || Math.abs(a.z - b.z) >= 12,
        "District reservations overlap",
      );
assert(segmentNearPerson({ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 5, z: 0.1 }));
assert(!segmentNearPerson({ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 5, z: 4 }));
for (const aspect of [0.45, 0.75, 1, 1.8]) {
  const frame = overviewFrustum(aspect);
  assert(frame.right - frame.left >= 140);
  assert(frame.top - frame.bottom >= 140);
}
// Real delivery animation must stop before a person, then resume after clearance.
const living = createLivingCityScene({
  T,
  scene: new T.Scene(),
  box,
  cyl,
  mat,
  lowPower: true,
});
for (const scenario of CITY_CASES)
  choices[scenario.id] = scenario.options[0].id;
living.sync(choices);
for (const courtyard of living.plazas.values()) {
  courtyard.root.updateWorldMatrix(true, true);
  const bounds = new T.Box3().setFromObject(courtyard.root),
    size = bounds.getSize(new T.Vector3());
  assert(
    !overlapsRoad(
      (bounds.min.x + bounds.max.x) / 2,
      (bounds.min.z + bounds.max.z) / 2,
      size.x,
      size.z,
    ),
    "Landscaped courtyard intrudes into street",
  );
}
living.animate(0, false);
const truck = living.vehicles.find((v) => v.route);
assert(truck);
const before = truck.g.position.clone();
living.animate(80, false, false, [{ x: before.x + 0.1, z: before.z }]);
assert(truck.g.position.equals(before), "Truck moved through a person");
for (let i = 2; i < 30; i++) living.animate(i * 80, false, false, []);
assert(
  truck.g.position.distanceTo(before) > 0.1,
  "Truck never resumed after person cleared",
);
console.log(
  "PASS: 108 authored outcomes fit reserved plots; the crossing uses its assigned street, no-build plots stay empty, and yielding is verified.",
);
