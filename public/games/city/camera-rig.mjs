// Frame-rate independent camera follow and a collision-safe perspective boom.
export const followBlend = (dt, reduced = false) =>
  reduced ? 1 : 1 - Math.exp(-Math.max(0, dt) * 5);
export function clearBoomDistance(origin, direction, requested, boxes) {
  let distance = requested;
  for (const box of boxes) {
    // Subject buildings must remain visible during their own result reveal.
    if (
      origin.x >= box.minX &&
      origin.x <= box.maxX &&
      origin.z >= box.minZ &&
      origin.z <= box.maxZ
    )
      continue;
    let near = 0,
      far = requested;
    for (const axis of ["x", "y", "z"]) {
      const low = box["min" + axis.toUpperCase()] - 0.25;
      const high = box["max" + axis.toUpperCase()] + 0.25;
      const component = direction[axis];
      if (Math.abs(component) < 1e-8) {
        if (origin[axis] < low || origin[axis] > high) {
          far = -1;
          break;
        }
      } else {
        const a = (low - origin[axis]) / component;
        const b = (high - origin[axis]) / component;
        near = Math.max(near, Math.min(a, b));
        far = Math.min(far, Math.max(a, b));
      }
    }
    if (far >= near && far >= 0)
      distance = Math.min(distance, Math.max(0.6, near - 0.35));
  }
  return distance;
}

// An obstruction changes the viewing angle, never pushes the camera into
// the worksite. Manual zoom distance remains under the player's control.
export function safeCityCamera(origin, yaw, pitch, requested, boxes = []) {
  const distance = Math.max(16, requested);
  for (const turn of [0, 0.35, -0.35, 0.7, -0.7, Math.PI]) {
    for (const elevation of [pitch, Math.min(1.35, pitch + 0.25), 1.35]) {
      const direction = {
        x: Math.sin(yaw + turn) * Math.cos(elevation),
        y: Math.sin(elevation),
        z: Math.cos(yaw + turn) * Math.cos(elevation),
      };
      if (
        clearBoomDistance(origin, direction, distance, boxes) >=
        distance - 0.01
      )
        return {
          x: origin.x + direction.x * distance,
          y: origin.y + direction.y * distance,
          z: origin.z + direction.z * distance,
          distance,
        };
    }
  }
  const height = Math.max(distance, ...boxes.map((b) => b.maxY - origin.y + 6));
  return {
    x: origin.x,
    y: origin.y + height,
    z: origin.z + 0.001,
    distance: height,
  };
}
export function safeCityCameraBlend(origin, previous, next, blend, boxes = []) {
  const p = {
    x: previous.x + (next.x - previous.x) * blend,
    y: previous.y + (next.y - previous.y) * blend,
    z: previous.z + (next.z - previous.z) * blend,
  };
  const delta = { x: p.x - origin.x, y: p.y - origin.y, z: p.z - origin.z },
    length = Math.hypot(delta.x, delta.y, delta.z);
  if (length < Math.min(16, next.distance ?? 16)) return next;
  const direction = {
    x: delta.x / length,
    y: delta.y / length,
    z: delta.z / length,
  };
  return clearBoomDistance(origin, direction, length, boxes) >= length - 0.01
    ? p
    : next;
}
