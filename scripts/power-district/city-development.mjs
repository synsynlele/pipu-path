import assert from "node:assert/strict";
import * as T from "../../public/games/shared/vendor/three.module.js";
import { CITY_CASES } from "../../public/games/city/cases.mjs";
import { overlapsRoad } from "../../public/games/city/layout.mjs";
import {
  CITY_PARCELS,
  DEVELOPMENT_STEPS,
  deriveCityDevelopment,
} from "../../public/games/city/city-development.mjs";
import { createCityDevelopmentScene } from "../../public/games/city/city-development-scene.mjs";
const state = {
  decisions: {},
  economy: { day: 0 },
  resilience: { choices: [] },
  advanced: { records: [] },
};
const scene = new T.Scene(),
  city = createCityDevelopmentScene({ T, scene });
assert.equal(deriveCityDevelopment(state).developed, 0);
assert(CITY_PARCELS.length >= DEVELOPMENT_STEPS);
for (const p of CITY_PARCELS)
  assert(!overlapsRoad(p.x, p.z, p.width, p.depth, 0.35));
let previous = new Map(),
  count = 0;
function grow() {
  const result = city.sync(state);
  assert(
    result.developed > count,
    "Each completed activity must develop new land",
  );
  for (const [id, old] of previous) {
    const current = city.meshes.get(id);
    assert.equal(
      current,
      old,
      "Later rounds must retain the same permanent building",
    );
  }
  count = result.developed;
  previous = new Map(city.meshes);
}
for (const c of CITY_CASES) {
  state.decisions[c.id] = c.options[0].id;
  grow();
}
for (let day = 1; day <= 7; day++) {
  state.economy.day = day;
  grow();
}
for (let i = 0; i < 3; i++) {
  state.resilience.choices.push("care");
  grow();
}
for (let i = 0; i < 16; i++) {
  state.advanced.records.push({ score: 100 });
  grow();
}
assert.equal(city.current.completed, DEVELOPMENT_STEPS);
assert.equal(city.current.developed, CITY_PARCELS.length);
assert.equal(city.meshes.size, CITY_PARCELS.length);
const types = new Set(city.current.plots.map((p) => p.type));
for (const type of [
  "bridge",
  "skyscraper",
  "stadium",
  "farm",
  "hospital",
  "school",
  "solar",
  "waterworks",
])
  assert(types.has(type), type);
for (const m of city.meshes.values()) {
  m.geometry.computeBoundingBox();
  const size = m.geometry.boundingBox.getSize(new T.Vector3());
  assert(
    size.x <= 4.81 && size.z <= 4.81,
    "Structures must stay inside road-safe parcels",
  );
}
const skyline = [...city.meshes.values()].find(
  (m) => m.userData.cityDevelopment.type === "skyscraper",
);
assert(skyline.geometry.boundingBox.max.y > 10);
const frozen = [...city.meshes.values()].map((m) => m.geometry);
for (let i = 0; i < 100; i++) {
  city.sync(state);
  city.setFocus({ x: 1000, z: 1000 }, false, () => true);
  assert(
    [...city.meshes.values()].every((m) => m.visible),
    "In-camera buildings cannot disappear because the avatar is far away",
  );
  city.setFocus({ x: 0, z: 0 }, false, () => false);
  city.setFocus(null, true);
  assert([...city.meshes.values()].every((m) => m.visible));
}
assert.deepEqual(
  [...city.meshes.values()].map((m) => m.geometry),
  frozen,
);
assert.equal(
  scene.children.length,
  CITY_PARCELS.length,
  "Syncing and changing views cannot duplicate or delete buildings",
);
const restored = createCityDevelopmentScene({ T, scene: new T.Scene() });
restored.sync(JSON.parse(JSON.stringify(state)));
assert.deepEqual(
  restored.current,
  city.current,
  "Existing save data must reconstruct the complete city",
);
for (const c of CITY_CASES) state.decisions[c.id] = c.options[2].id;
city.sync(state);
assert.equal(city.meshes.size, CITY_PARCELS.length);
assert(
  city.current.plots.some((p) => p.status !== "working"),
  "Bad decisions must retain visible shortcomings",
);
console.log(
  "PASS: every retained activity develops land, all final parcels occupied, distinct landmarks, roads preserved, stable buildings through views and reload, bounded shared geometry and truthful failures.",
);
