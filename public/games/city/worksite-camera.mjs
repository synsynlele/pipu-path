import { clearBoomDistance } from "./camera-rig.mjs";
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const direction = (yaw, pitch) => ({
  x: Math.sin(yaw) * Math.cos(pitch),
  y: Math.sin(pitch),
  z: Math.cos(yaw) * Math.cos(pitch),
});
const point = (target, dir, d) => ({
  x: target.x + dir.x * d,
  y: target.y + dir.y * d,
  z: target.z + dir.z * d,
});
const outside = (p, boxes) =>
  boxes.every(
    (b) =>
      p.x < b.minX - 0.5 ||
      p.x > b.maxX + 0.5 ||
      p.y < b.minY - 0.5 ||
      p.y > b.maxY + 0.5 ||
      p.z < b.minZ - 0.5 ||
      p.z > b.maxZ + 0.5,
  );
function lineClear(a, b, boxes) {
  const delta = sub(b, a),
    length = Math.hypot(delta.x, delta.y, delta.z);
  if (!length) return true;
  const dir = { x: delta.x / length, y: delta.y / length, z: delta.z / length };
  return clearBoomDistance(a, dir, length, boxes) >= length - 0.01;
}
// Worksite framing may orbit or rise; it never solves an obstruction by
// shortening the boom to a face-filling distance.
export function planWorksiteCamera({
  focus,
  actor,
  site,
  aspect = 1,
  fov = 39,
  heading = 0.8,
  boxes = [],
  working = false,
}) {
  const near = Math.hypot(actor.x - site.x, actor.z - site.z) < 16;
  const height = near ? (site.height ?? 4) : 4;
  const target = { x: focus.x, y: Math.max(1.2, height * 0.38), z: focus.z };
  const centre = near ? site : actor;
  const halfX = near ? (site.width ?? 14) / 2 : 5,
    halfZ = near ? (site.depth ?? 14) / 2 : 5;
  const points = [];
  for (const x of [-halfX, halfX])
    for (const z of [-halfZ, halfZ])
      for (const y of [0, height])
        points.push({ x: centre.x + x, y, z: centre.z + z });
  const eye = { x: actor.x, y: 1.5, z: actor.z };
  points.push(eye);
  const tangent = Math.tan((fov * Math.PI) / 360),
    horizontal = working ? 0.84 : 0.74,
    vertical = working ? 0.43 : 0.38;
  let fallback = null;
  for (const pitch of [0.76, 1.02, 1.25, 1.43])
    for (const offset of [0, 0.4, -0.4, 0.8, -0.8, 1.4, -1.4, Math.PI]) {
      const yaw = heading + offset,
        dir = direction(yaw, pitch),
        right = { x: Math.cos(yaw), y: 0, z: -Math.sin(yaw) },
        up = {
          x: -Math.sin(yaw) * Math.sin(pitch),
          y: Math.cos(pitch),
          z: -Math.cos(yaw) * Math.sin(pitch),
        };
      let distance = working ? 22 : 26;
      for (const p of points) {
        const delta = sub(p, target),
          depth = dot(delta, dir);
        distance = Math.max(
          distance,
          depth +
            Math.abs(dot(delta, right)) /
              (tangent * Math.max(0.15, aspect) * horizontal),
          depth + Math.abs(dot(delta, up)) / (tangent * vertical),
        );
      }
      const position = point(target, dir, distance);
      const result = { position, target, distance, pitch, yaw, points };
      if (!fallback || pitch > fallback.pitch) fallback = result;
      if (
        outside(position, boxes) &&
        lineClear(target, position, boxes) &&
        lineClear(eye, position, boxes)
      )
        return result;
    }
  // A crowded enclosure still gets an overhead inspection, with clearance
  // above neighbouring roofs rather than a camera inside their geometry.
  const nearby = boxes.filter(
    (b) =>
      Math.abs((b.minX + b.maxX) / 2 - target.x) < 25 &&
      Math.abs((b.minZ + b.maxZ) / 2 - target.z) < 25,
  );
  const roof = Math.max(0, ...nearby.map((b) => b.maxY));
  if (fallback.position.y < roof + 8) {
    const dir = direction(fallback.yaw, fallback.pitch);
    fallback.distance = Math.max(
      fallback.distance,
      (roof + 8 - target.y) / dir.y,
    );
    fallback.position = point(target, dir, fallback.distance);
  }
  return fallback;
}
export function safeCameraBlend(from, to, target, boxes, alpha) {
  const next = {
    x: from.x + (to.x - from.x) * alpha,
    y: from.y + (to.y - from.y) * alpha,
    z: from.z + (to.z - from.z) * alpha,
  };
  return outside(next, boxes) &&
    lineClear(from, next, boxes) &&
    lineClear(target, next, boxes)
    ? next
    : to;
}
