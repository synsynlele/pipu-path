import assert from "node:assert/strict";
import { createNavigator } from "../../public/games/shared/navigation.mjs";
const nav = createNavigator([{ minX: -1, maxX: 1, minZ: -3, maxZ: 3 }], {
  minX: -5,
  maxX: 5,
  minZ: -5,
  maxZ: 5,
});
const route = nav.route({ x: -4, z: 0 }, { x: 4, z: 0 });
assert(route && route.points.length > 1, "must route around the wall");
let previous = { x: -4, z: 0 };
for (const p of route.points) {
  assert(nav.segmentFree(previous, p));
  previous = p;
}
assert.deepEqual(route.destination, { x: 4, z: 0 });
const occupied = nav.route({ x: -4, z: 0 }, { x: 0, z: 0 });
assert(occupied.adjusted);
assert(nav.free(occupied.destination));
assert(!nav.segmentFree({ x: -2, z: 0 }, { x: 2, z: 0 }));
assert.deepEqual(nav.manual({ x: -1.4, z: 0 }, { x: -1.2, z: 0 }), {
  x: -1.4,
  z: 0,
});
assert(!nav.free({ x: -1.2, z: 0 }), "avatar radius must clear the wall");
const enclosed = createNavigator([{ minX: -1, maxX: 1, minZ: -5, maxZ: 5 }], {
  minX: -5,
  maxX: 5,
  minZ: -5,
  maxZ: 5,
});
assert.equal(enclosed.route({ x: -4, z: 0 }, { x: 4, z: 0 }), null);
const corner = createNavigator(
  [
    { minX: 0, maxX: 1, minZ: 0, maxZ: 1 },
    { minX: 1, maxX: 2, minZ: 1, maxZ: 2 },
  ],
  { minX: -3, maxX: 4, minZ: -3, maxZ: 4 },
);
assert(
  !corner.segmentFree({ x: 0.7, z: 1.4 }, { x: 1.4, z: 0.7 }),
  "no corner cutting",
);
const fresh = createNavigator([], {});
assert(fresh.route({ x: 4, z: 4 }, { x: 2, z: -3.6 }));
const installed = createNavigator(
  [{ minX: 1.4, maxX: 2.6, minZ: -4, maxZ: -3.2 }],
  {},
);
assert(!installed.free({ x: 2, z: -3.6 }));
assert(installed.route({ x: 4, z: 4 }, { x: 2, z: -3.6 }).adjusted);
console.log(
  "PASS: detours, occupied destinations, swept collision, body clearance, unreachable goals, corner guards and installed obstacles.",
);

const manyBuildings = [];
for (let iz = -4; iz <= 4; iz++)
  for (let ix = -5; ix <= 5; ix++) {
    if (ix === 0 || iz === 0) continue;
    manyBuildings.push({
      minX: ix * 7 - 1,
      maxX: ix * 7 + 1,
      minZ: iz * 7 - 1,
      maxZ: iz * 7 + 1,
    });
  }
const cityNav = createNavigator(manyBuildings, {
  minX: -57.5,
  maxX: 57.5,
  minZ: -49.5,
  maxZ: 49.5,
  step: 1,
});
const startTime = performance.now();
for (let i = 0; i < 8; i++) {
  const route = cityNav.route({ x: -50, z: -0.5 }, { x: 49 - i, z: i + 1 });
  assert(route && cityNav.free(route.destination));
}
assert(
  performance.now() - startTime < 4000,
  "Navigation through a grown city must not stall the main UI thread",
);
