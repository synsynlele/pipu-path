import assert from "node:assert/strict";
import { CITY_CASES, saveDecision } from "../../public/games/city/cases.mjs";
import { CITY_DISTRICTS } from "../../public/games/city/districts.mjs";
import {
  deriveLivingCity,
  roadDeliveryRoute,
} from "../../public/games/city/living-city.mjs";
const empty = deriveLivingCity();
assert.equal(empty.built, 0);
assert.equal(empty.active, 0);
assert.equal(empty.residents, 0);
assert.equal(
  empty.deliveries.length,
  0,
  "An unbuilt city must not pretend to deliver goods",
);
assert.equal(empty.districts.length, 14);
assert.equal(roadDeliveryRoute("unknown", "health").length, 0);
assert.equal(roadDeliveryRoute("market", "market").length, 0);
const validX = [-54, -30, 6, 54],
  validZ = [-47, -18, 6.7, 24, 47];
for (const a of CITY_DISTRICTS)
  for (const b of CITY_DISTRICTS) {
    const path = roadDeliveryRoute(a.id, b.id);
    if (a.id === b.id) assert.equal(path.length, 0);
    else {
      assert(path.length >= 1 && path.length <= 3);
      for (const point of path) {
        assert(
          validX.includes(point.x) && validZ.includes(point.z),
          "Vehicles must stay on main road intersections",
        );
      }
      for (let i = 1; i < path.length; i++)
        assert(
          path[i].x === path[i - 1].x || path[i].z === path[i - 1].z,
          "A truck must never cut through a building diagonally",
        );
    }
  }
let decisions = {};
for (const c of CITY_CASES.slice(0, 16))
  decisions = saveDecision(decisions, c.id, c.options[0].id);
const foundation = deriveLivingCity(decisions);
assert.equal(foundation.active, 4);
assert(foundation.residents >= 4);
assert(foundation.deliveries.every((d) => d.path.length >= 2));
for (const c of CITY_CASES.slice(16))
  decisions = saveDecision(decisions, c.id, c.options[0].id);
const grown = deriveLivingCity(decisions);
assert.equal(grown.active, 14);
assert.equal(grown.built, 36);
assert(grown.residents >= 14 && grown.residents <= 28);
assert(grown.deliveries.length > 0 && grown.deliveries.length <= 5);
assert(grown.deliveries.every((d) => d.speed > 0 && d.pace === "steady"));
assert(grown.linkageCount > 0);
const changed = { ...decisions };
const first = CITY_CASES.find((c) => c.district === "transport");
changed[first.id] = first.options[1].id;
const revised = deriveLivingCity(changed);
assert.equal(
  revised.active,
  14,
  "Decision revision must not erase construction counts",
);
assert.equal(revised.built, 36);
assert.notEqual(
  revised.districts.find((d) => d.id === "transport").service,
  grown.districts.find((d) => d.id === "transport").service,
  "City activity must change after revising a choice",
);
assert.deepEqual(
  deriveLivingCity(decisions),
  grown,
  "Read-only activity plans must be deterministic and never edit decisions",
);
console.log(
  "PASS: living plazas and residents depend on builds; five or fewer road deliveries, revision effects, and 14-district deterministic simulation.",
);
