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
