import assert from "node:assert/strict";
import {
  followBlend,
  clearBoomDistance,
} from "../../public/games/city/camera-rig.mjs";
const origin = { x: 0, y: 1, z: 0 },
  direction = { x: 0, y: 0, z: 1 };
const wall = { minX: -2, maxX: 2, minY: 0, maxY: 10, minZ: 5, maxZ: 7 };
assert.equal(clearBoomDistance(origin, direction, 20, []), 20);
assert(clearBoomDistance(origin, direction, 20, [wall]) < 5);
assert.equal(clearBoomDistance(origin, { x: 1, y: 0, z: 0 }, 20, [wall]), 20);
assert.equal(
  clearBoomDistance({ x: 0, y: 20, z: 0 }, direction, 20, [wall]),
  20,
);
assert.equal(
  clearBoomDistance({ x: 0, y: 1, z: 6 }, direction, 20, [wall]),
  20,
);
const follow = (hz) => {
  let p = 0;
  for (let i = 0; i < hz; i++) p += (10 - p) * followBlend(1 / hz);
  return p;
};
assert(Math.abs(follow(15) - follow(60)) < 1e-10);
assert.equal(followBlend(0.016, true), 1);
assert.equal(followBlend(0), 0);
console.log(
  "PASS: frame-rate independent camera follow, reduced motion and perspective obstruction clearance without clipping overview/reveal subjects.",
);

const { planWorksiteCamera, safeCameraBlend } =
  await import("../../public/games/city/worksite-camera.mjs");
const T = await import("../../public/games/shared/vendor/three.module.js");
const tank = { minX: -4, maxX: 4, minY: 0, maxY: 9, minZ: -4, maxZ: 4 };
for (const aspect of [0.46, 1.45])
  for (const working of [false, true]) {
    const plan = planWorksiteCamera({
      focus: { x: 1, z: 2 },
      actor: { x: 5, z: 5 },
      site: { x: 0, z: 0, width: 14, depth: 14, height: 9 },
      aspect,
      boxes: [
        tank,
        { minX: 10, maxX: 18, minY: 0, maxY: 24, minZ: 2, maxZ: 12 },
      ],
      working,
    });
    assert(plan.distance >= 22);
    const c = new T.PerspectiveCamera(39, aspect, 0.1, 600);
    c.position.set(plan.position.x, plan.position.y, plan.position.z);
    c.lookAt(plan.target.x, plan.target.y, plan.target.z);
    c.setViewOffset(1000 * aspect, 1000, 0, 130, 1000 * aspect, 1000);
    c.updateMatrixWorld(true);
    for (const point of plan.points) {
      const p = new T.Vector3(point.x, point.y, point.z).project(c);
      assert(Math.abs(p.x) < 0.9, "project fits horizontally");
      assert(
        p.y > -0.72 && p.y < 0.72,
        "project fits above bottom instructions",
      );
    }
  }
const blockedBlend = safeCameraBlend(
  { x: 0, y: 2, z: 0 },
  { x: 0, y: 2, z: 20 },
  { x: 0, y: 2, z: 20 },
  [wall],
  0.3,
);
assert.equal(blockedBlend.z, 20, "never ease through a building");
console.log(
  "PASS: portrait/wide worksite framing, safe cinematic zoom and collision-free transition.",
);

const zoomScene = {
  focus: { x: 0, z: 0 },
  actor: { x: 2, z: 2 },
  site: { x: 0, z: 0, width: 14, depth: 14, height: 5 },
  aspect: 0.46,
};
const normal = planWorksiteCamera(zoomScene),
  closer = planWorksiteCamera({ ...zoomScene, zoom: 0.6 });
assert(
  closer.distance < normal.distance,
  "manual zoom can inspect closer than fit-to-site",
);
assert(closer.distance >= 12, "manual zoom retains minimum clearance");
const farther = planWorksiteCamera({ ...zoomScene, zoom: 1.6 });
assert(farther.distance > normal.distance, "manual zoom can pull back");
