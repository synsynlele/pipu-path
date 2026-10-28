import assert from "node:assert/strict";
import {
  CITY_DISTRICTS,
  OUTER_DISTRICTS,
  countDistricts,
} from "../../public/games/city/districts.mjs";
import { createNavigator } from "../../public/games/shared/navigation.mjs";

const counts = countDistricts();
assert.deepEqual(counts, { all: 14, active: 4, exploring: 10 });
assert.equal(new Set(CITY_DISTRICTS.map((d) => d.id)).size, 14);
assert.equal(new Set(CITY_DISTRICTS.map((d) => d.name)).size, 14);
assert.deepEqual(
  CITY_DISTRICTS.filter((d) => d.status === "active")
    .map((d) => d.id)
    .sort(),
  ["market", "power", "school", "workshop"],
);
for (const district of OUTER_DISTRICTS) {
  assert(district.challenge && district.challenge.endsWith("?"));
  assert(Math.abs(district.x) < 54 && Math.abs(district.z) < 45);
}
const obstacles = OUTER_DISTRICTS.map((d) => ({
  minX: d.x - 0.4,
  maxX: d.x + 5,
  minZ: d.z - 4.7,
  maxZ: d.z - 0.7,
}));
const nav = createNavigator(obstacles, {
  minX: -57.5,
  maxX: 57.5,
  minZ: -49.5,
  maxZ: 49.5,
  step: 1,
});
for (const d of OUTER_DISTRICTS) {
  const approach = { x: d.x - 3.7, z: d.z + 3.9 };
  assert(nav.free(approach), d.id + ": approach overlaps a district building");
  const route = nav.route({ x: 4, z: 4 }, approach);
  assert(route, d.id + ": unreachable from the original city");
  let previous = { x: 4, z: 4 };
  for (const waypoint of route.points) {
    assert(
      nav.segmentFree(previous, waypoint),
      d.id + ": route crosses a wall",
    );
    previous = waypoint;
  }
}
console.log(
  "PASS: fourteen distinct districts, honest playability, and safe routes to ten outer landmarks.",
);
