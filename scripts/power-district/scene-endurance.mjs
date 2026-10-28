import assert from "node:assert/strict";
import * as T from "../../public/games/shared/vendor/three.module.js";
import { createCaseSceneEffects } from "../../public/games/city/scene-feedback.mjs";
import { createLivingCityScene } from "../../public/games/city/living-scene.mjs";
import { CITY_CASES, saveDecision } from "../../public/games/city/cases.mjs";

const scene = new T.Scene();
const materials = new Map();
const mat = (c) => {
  if (!materials.has(c))
    materials.set(c, new T.MeshStandardMaterial({ color: c }));
  return materials.get(c);
};
const box = (w, h, d, c, x, y, z, parent = scene) => {
  const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), mat(c));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
};
const cyl = (r, h, c, x, y, z, parent = scene, r2 = r, sides = 12) => {
  const mesh = new T.Mesh(new T.CylinderGeometry(r2, r, h, sides), mat(c));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
};
const built = createCaseSceneEffects({ T, scene, box, cyl, mat });
const living = createLivingCityScene({
  T,
  scene,
  box,
  cyl,
  mat,
  lowPower: true,
});
const now = () => performance.now();
let decisions = {};
let total = 0;
for (const [index, item] of CITY_CASES.entries()) {
  const choice = item.options[index % 3];
  decisions = saveDecision(decisions, item.id, choice.id);
  built.sync(decisions, { caseId: item.id, choiceId: choice.id });
  living.sync(decisions);
  const effect = built.effects.get(item.id);
  assert(
    effect.group.visible,
    "Answer " + (index + 1) + " must show a physical effect",
  );
  assert(effect.variants.get(choice.id)?.visible);
  for (let frame = 0; frame < 5; frame++) {
    built.setFocus(effect.group.position);
    living.setFocus(effect.group.position);
    built.animate(now() + frame * 250, false);
    living.animate(now() + frame * 250, false);
  }
  assert(
    effect.group.visible,
    "Answer " + (index + 1) + " remains visible in its district",
  );
  built.setFocus({ x: 999, z: 999 }, false);
  assert(!effect.group.visible, "Faraway scenery is culled on mobile");
  built.setFocus({ x: 999, z: 999 }, true);
  assert(
    effect.group.visible,
    "Aerial city view restores all completed buildings",
  );
  assert.equal(Object.keys(decisions).length, index + 1);
  total++;
}
assert.equal(total, 36);
assert.equal(built.effects.size, 36);
for (const item of CITY_CASES) {
  const effect = built.effects.get(item.id);
  assert(effect.variants.get(decisions[item.id])?.visible);
}
console.log(
  "PASS: 36 consecutive choices construct and animate across the 3D city; nearby culling and aerial restoration preserve all effects.",
);
