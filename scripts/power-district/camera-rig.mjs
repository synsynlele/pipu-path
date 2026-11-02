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
const { safeCityCamera, safeCityCameraBlend } =
  await import("../../public/games/city/camera-rig.mjs");
for (const yaw of [0, 0.7, 1.5, Math.PI])
  for (const pitch of [0.35, 0.75, 1.1]) {
    const p = safeCityCamera(origin, yaw, pitch, 27, [wall]);
    const d = { x: p.x - origin.x, y: p.y - origin.y, z: p.z - origin.z },
      length = Math.hypot(d.x, d.y, d.z);
    assert(length >= 26.99, "automatic collision recovery never zooms in");
    assert(
      clearBoomDistance(
        origin,
        { x: d.x / length, y: d.y / length, z: d.z / length },
        length,
        [wall],
      ) >=
        length - 0.02,
    );
    const b = safeCityCameraBlend(origin, { x: 0, y: 1, z: 6 }, p, 0.2, [wall]);
    assert(
      Math.hypot(b.x - origin.x, b.y - origin.y, b.z - origin.z) >= 16,
      "unsafe blend never dives toward the subject",
    );
  }
console.log(
  "PASS: safe full-distance camera angles and transition clearance without obstruction-driven close-ups.",
);
