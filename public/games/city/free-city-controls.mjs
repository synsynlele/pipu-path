// Camera-relative input stays independent of scene and DOM lifecycles.
export function orbitDelta(pose, dx, dy) {
  return {
    yaw: pose.yaw - dx * 0.006,
    pitch: Math.max(0.32, Math.min(1.36, pose.pitch + dy * 0.004)),
  };
}
export function walkingVector(right, down, yaw) {
  const length = Math.hypot(right, down);
  if (!length) return { x: 0, z: 0 };
  return {
    x: (right * Math.cos(yaw) + down * Math.sin(yaw)) / length,
    z: (-right * Math.sin(yaw) + down * Math.cos(yaw)) / length,
  };
}
export function overviewPan(point, dx, dy, yaw, pitch, zoom, height) {
  const scale = (256 * zoom) / Math.max(320, height),
    vertical = dy / Math.max(0.32, Math.sin(pitch));
  return {
    x: Math.max(
      -50,
      Math.min(
        50,
        point.x - (dx * Math.cos(yaw) + vertical * Math.sin(yaw)) * scale,
      ),
    ),
    z: Math.max(
      -42,
      Math.min(
        42,
        point.z - (-dx * Math.sin(yaw) + vertical * Math.cos(yaw)) * scale,
      ),
    ),
  };
}
