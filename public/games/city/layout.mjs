// Single street reservation used by scenery, deliveries and layout checks.
export const ROAD_X = Object.freeze([-54, -30, 6, 54]);
export const ROAD_Z = Object.freeze([-47, -18, 6.7, 24, 47]);
export const ROAD_WIDTH = 3.5;
export const CITY_EXTENT = Object.freeze({ width: 116, depth: 100 });
export function overlapsRoad(x, z, width = 0, depth = width, margin = 0) {
  const half = ROAD_WIDTH / 2 + margin;
  return (
    ROAD_X.some((road) => Math.abs(x - road) < half + width / 2) ||
    ROAD_Z.some((road) => Math.abs(z - road) < half + depth / 2)
  );
}
export function clearRoadPlacement(x, z, width, depth, margin = 0.3) {
  for (let radius = 0; radius <= 10; radius += 0.5)
    for (const [dx, dz] of [
      [radius, 0],
      [-radius, 0],
      [0, radius],
      [0, -radius],
      [radius, radius],
      [-radius, -radius],
    ]) {
      const point = { x: x + dx, z: z + dz };
      if (!overlapsRoad(point.x, point.z, width, depth, margin)) return point;
    }
  return null;
}
// Swept XZ clearance prevents a vehicle moving through somebody between frames.
export function segmentNearPerson(a, b, person, clearance = 1.4) {
  const dx = b.x - a.x,
    dz = b.z - a.z;
  const t = Math.max(
    0,
    Math.min(
      1,
      ((person.x - a.x) * dx + (person.z - a.z) * dz) /
        (dx * dx + dz * dz || 1),
    ),
  );
  return (
    Math.hypot(a.x + dx * t - person.x, a.z + dz * t - person.z) < clearance
  );
}
export function overviewFrustum(aspect, span = 140) {
  const width = span * Math.max(1, aspect);
  const height = width / aspect;
  return {
    left: -width / 2,
    right: width / 2,
    top: height / 2,
    bottom: -height / 2,
  };
}

// Two lanes form a closed delivery circuit. Rounded end turns keep vehicles
// moving continuously rather than reversing into oncoming traffic.
export function deliveryLaneLoop(path, offset = 0.78) {
  if (path.length < 2) return [];
  const side = (points) =>
    points.map((point, i) => {
      const prior = points[Math.max(0, i - 1)],
        next = points[Math.min(points.length - 1, i + 1)];
      const tangent = (a, b) => {
        const length = Math.hypot(b.x - a.x, b.z - a.z) || 1;
        return { x: (b.x - a.x) / length, z: (b.z - a.z) / length };
      };
      const a = tangent(i === 0 ? point : prior, i === 0 ? next : point);
      const b = tangent(
        i === points.length - 1 ? prior : point,
        i === points.length - 1 ? point : next,
      );
      const dot = a.x * b.x + a.z * b.z;
      const divisor = 1 + dot || 1;
      return {
        x: point.x + (offset * (a.z + b.z)) / divisor,
        z: point.z - (offset * (a.x + b.x)) / divisor,
      };
    });
  const forward = side(path),
    backward = side([...path].reverse());
  const arc = (end, from, to) => {
    const start = Math.atan2(from.z - end.z, from.x - end.x);
    const last = Math.atan2(to.z - end.z, to.x - end.x);
    let delta = last - start;
    while (delta <= 0) delta += Math.PI * 2;
    return Array.from({ length: 6 }, (_, i) => ({
      x: end.x + Math.cos(start + (delta * (i + 1)) / 6) * offset,
      z: end.z + Math.sin(start + (delta * (i + 1)) / 6) * offset,
    }));
  };
  return [
    ...forward,
    ...arc(path[path.length - 1], forward[forward.length - 1], backward[0]),
    ...backward.slice(1),
    ...arc(path[0], backward[backward.length - 1], forward[0]),
  ];
}
