import { choiceConsequence } from "../../public/games/city/consequences.mjs";
import { infrastructurePlan } from "../../public/games/city/construction-plans.mjs";
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
  const visible =
    infrastructurePlan(item.id, choice.id).assets.length > 0 ||
    Boolean(choiceConsequence(item.id, choice.id));
  assert.equal(
    effect.group.visible,
    visible,
    "Answer must match its authored physical consequence",
  );
  assert(effect.variants.get(choice.id)?.visible);
  for (let frame = 0; frame < 5; frame++) {
    built.setFocus(effect.group.position);
    living.setFocus(effect.group.position);
    built.animate(now() + frame * 250, false);
    living.animate(now() + frame * 250, false);
  }
  assert.equal(effect.group.visible, visible);
  built.setFocus({ x: 999, z: 999 }, false);
  assert(!effect.group.visible, "Faraway scenery is culled on mobile");
  built.setFocus({ x: 999, z: 999 }, true);
  assert.equal(
    effect.group.visible,
    visible,
    "Aerial view cannot invent infrastructure for inaction",
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
  "PASS: 36 consecutive choices preserve construction and no-build states through animation, nearby culling and aerial restoration.",
);

// Mobile allocates fewer visual actors than the domain's resident count.
// Exercise all 243 opening paths: the former mixed path missed thriving areas.
for (const lowPower of [true, false]) {
  const populationScene = createLivingCityScene({
    T,
    scene: new T.Scene(),
    box,
    cyl,
    mat,
    lowPower,
  });
  for (let path = 0; path < 3 ** 5; path++) {
    let choices = {};
    let remaining = path;
    for (const item of CITY_CASES.slice(0, 5)) {
      choices = saveDecision(choices, item.id, item.options[remaining % 3].id);
      remaining = Math.floor(remaining / 3);
      populationScene.sync(choices);
      populationScene.setFocus(null, true);
      for (const reducedMotion of [false, true])
        populationScene.animate(1000 + path * 17, reducedMotion);
    }
  }
  for (let option = 0; option < 3; option++) {
    let choices = {};
    for (const item of CITY_CASES) {
      choices = saveDecision(choices, item.id, item.options[option].id);
      populationScene.sync(choices);
      populationScene.animate(3000, false);
    }
    // Revision must safely transition thriving neighbourhoods back and forth.
    for (const item of CITY_CASES) {
      choices = saveDecision(
        choices,
        item.id,
        item.options[(option + 1) % 3].id,
      );
      const derived = populationScene.sync(choices);
      populationScene.setFocus(null, true);
      populationScene.animate(4000, false);
      for (const district of derived.districts) {
        const actors = populationScene.pedestrians.get(district.id);
        assert.equal(
          actors.filter((actor) => actor.visible).length,
          Math.min(actors.length, district.residents),
        );
        for (const actor of actors)
          assert(actor.position.toArray().every(Number.isFinite));
      }
    }
  }
}
console.log(
  "PASS: 243 opening paths per graphics mode, all-option 36-decision journeys, revisions and reduced motion preserve bounded resident animation.",
);
