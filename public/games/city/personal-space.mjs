// Swept human clearance: endpoints alone miss people crossed between frames.
export function peopleClear(from, to, people, clearance = 0.78) {
  const dx = to.x - from.x,
    dz = to.z - from.z,
    len = dx * dx + dz * dz;
  return people.every((p) => {
    const start = Math.hypot(from.x - p.x, from.z - p.z),
      end = Math.hypot(to.x - p.x, to.z - p.z);
    if (start < clearance - 0.001) return end > start + 0.00001;
    const t = Math.max(
      0,
      Math.min(1, ((p.x - from.x) * dx + (p.z - from.z) * dz) / (len || 1)),
    );
    return (
      Math.hypot(from.x + t * dx - p.x, from.z + t * dz - p.z) >=
      clearance - 0.001
    );
  });
}
export function safePersonStep(from, desired, people, groundClear, maxStep) {
  const dx = desired.x - from.x,
    dz = desired.z - from.z,
    len = Math.hypot(dx, dz);
  if (!len) return { x: from.x, z: from.z };
  const amount = Math.min(len, maxStep),
    ux = dx / len,
    uz = dz / len;
  for (const angle of [0, 0.65, -0.65, 1.2, -1.2]) {
    const c = Math.cos(angle),
      s = Math.sin(angle),
      next = {
        x: from.x + (ux * c - uz * s) * amount,
        z: from.z + (ux * s + uz * c) * amount,
      };
    if (groundClear(from, next) && peopleClear(from, next, people)) return next;
  }
  return { x: from.x, z: from.z };
}
