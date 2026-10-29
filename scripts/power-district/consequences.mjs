import assert from "node:assert/strict";
import * as T from "../../public/games/shared/vendor/three.module.js";
import { CITY_CASES } from "../../public/games/city/cases.mjs";
import { infrastructurePlan } from "../../public/games/city/construction-plans.mjs";
import {
  cityConsequences,
  choiceConsequence,
} from "../../public/games/city/consequences.mjs";
import { createCaseSceneEffects } from "../../public/games/city/scene-feedback.mjs";
import { CASE_BUILD_SITES } from "../../public/games/city/feedback.mjs";
import { OUTER_DISTRICTS } from "../../public/games/city/districts.mjs";
import { overlapsRoad } from "../../public/games/city/layout.mjs";
import { initialPlan } from "../../public/games/city/model.mjs";
import {
  savePractice,
  loadPractice,
} from "../../public/games/city/practice-save.mjs";
import { deriveBuilderCity } from "../../public/games/city/city-growth.mjs";
const scene = new T.Scene(),
  mats = new Map();
const mat = (c) => {
  if (!mats.has(c)) mats.set(c, new T.MeshBasicMaterial({ color: c }));
  return mats.get(c);
};
const box = (w, h, d, c, x, y, z, parent = scene) => {
  const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), mat(c));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
};
const cyl = (r, h, c, x, y, z, parent = scene, r2 = r, sides = 8) => {
  const mesh = new T.Mesh(new T.CylinderGeometry(r2, r, h, sides), mat(c));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
};
const effects = createCaseSceneEffects({ T, scene, box, cyl, mat });
const good = Object.fromEntries(CITY_CASES.map((c) => [c.id, c.options[0].id]));
let checked = 0;
for (const scenario of CITY_CASES) {
  for (const option of scenario.options) {
    const plan = infrastructurePlan(scenario.id, option.id),
      problem = choiceConsequence(scenario.id, option.id);
    assert.equal(Boolean(problem), plan.status !== "working");
    if (problem) {
      assert.equal(problem.description, plan.label);
      assert.equal(problem.result, option.result);
      assert.equal(
        problem.severity,
        plan.status === "limited" ? "limited" : "harmful",
      );
    }
    const decisions = { [scenario.id]: option.id };
    const before = JSON.stringify(decisions);
    const projection = cityConsequences(decisions);
    assert.equal(JSON.stringify(decisions), before);
    assert.equal(projection.problems.length, Number(Boolean(problem)));
    effects.sync(decisions);
    effects.animate(performance.now() + 2000, true);
    const effect = effects.effects.get(scenario.id),
      marks = effect.consequences.get(option.id);
    assert.equal(Boolean(marks?.visible), Boolean(problem));
    if (marks) {
      const outer = OUTER_DISTRICTS.some((d) => d.id === scenario.district);
      assert(marks.children.length <= 8);
      assert(marks.children.every((m) => m.userData.ignoreNavigation));
      scene.updateMatrixWorld(true);
      const bounds = new T.Box3().setFromObject(marks),
        size = bounds.getSize(new T.Vector3());
      assert(size.x <= (outer ? 5 : 1.3));
      assert(size.z <= (outer ? 4.2 : 1.3));
      if (scenario.id !== "transit-people")
        assert(
          !overlapsRoad(
            (bounds.min.x + bounds.max.x) / 2,
            (bounds.min.z + bounds.max.z) / 2,
            size.x,
            size.z,
          ),
          scenario.id + " warning blocks street",
        );
      assert.equal(effect.group.position.x, CASE_BUILD_SITES[scenario.id].x);
    }
    // Existing choice-only saves reconstruct the same consequences.
    const store = new Map(),
      storage = {
        getItem: (k) => store.get(k) ?? null,
        setItem: (k, v) => store.set(k, v),
      };
    const state = {
      day: 1,
      cash: 18,
      config: initialPlan(),
      owned: initialPlan(),
      seen: [],
      history: [],
      decisions,
    };
    assert(savePractice(state, storage));
    assert.deepEqual(
      cityConsequences(loadPractice(storage).decisions),
      projection,
    );
    effects.sync({ ...decisions, [scenario.id]: scenario.options[0].id });
    assert(
      [...effect.consequences.values()].every((g) => !g.visible),
      "Repair leaves old warning behind",
    );
    checked++;
  }
}
assert.equal(checked, 108);
assert.equal(cityConsequences(good).problems.length, 0);
assert.equal(
  cityConsequences({ fake: "wrong", "repair-waste": "wrong" }).problems.length,
  0,
);
assert.equal(choiceConsequence("fake", "wrong"), null);
const bad = {
  ...good,
  "green-drainage": "ignore",
  "power-upkeep": "wait",
  "repair-waste": "burn",
};
assert.equal(choiceConsequence("repair-waste", "burn").kind, "scorch");
assert(cityConsequences(bad).connections.some((l) => l.to === "housing"));
assert(cityConsequences(bad).connections.some((l) => l.to === "market"));
assert(
  deriveBuilderCity(bad).districts.housing.service <
    deriveBuilderCity(good).districts.housing.service,
);
assert(
  deriveBuilderCity(bad).districts.market.service <
    deriveBuilderCity(good).districts.market.service,
);
// Repeated revisions reuse existing meshes, rather than leaking more marks.
effects.sync(bad);
effects.sync(good);
effects.sync(bad);
let count = 0;
scene.traverse(() => count++);
for (let i = 0; i < 20; i++) {
  effects.sync(good);
  effects.sync(bad);
  effects.animate(performance.now() + 2000, false);
}
let after = 0;
scene.traverse(() => after++);
assert.equal(after, count);
effects.sync({});
assert([...effects.effects.values()].every((e) => !e.group.visible));
console.log(
  "PASS: all 108 consequence contracts, bounded in-plot marks, honest no-build counts, same-save restoration, connected service effects and repair without mesh leaks.",
);
