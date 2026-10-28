// Shared point-and-go navigation. All obstacle rectangles are expanded by the
// avatar radius: navigation and manual movement use the same collision rules.
export function createNavigator(
  obstacles,
  {
    minX = -10.6,
    maxX = 10.6,
    minZ = -8,
    maxZ = 8,
    step = 0.25,
    radius = 0.3,
  } = {},
) {
  const blocks = obstacles.map((o) => ({
    minX: o.minX - radius,
    maxX: o.maxX + radius,
    minZ: o.minZ - radius,
    maxZ: o.maxZ + radius,
  }));
  const free = (p) =>
    p.x >= minX &&
    p.x <= maxX &&
    p.z >= minZ &&
    p.z <= maxZ &&
    !blocks.some(
      (b) => p.x >= b.minX && p.x <= b.maxX && p.z >= b.minZ && p.z <= b.maxZ,
    );
  const segmentFree = (a, b) => {
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.06));
    for (let i = 0; i <= n; i++)
      if (
        !free({
          x: a.x + ((b.x - a.x) * i) / n,
          z: a.z + ((b.z - a.z) * i) / n,
        })
      )
        return false;
    return true;
  };
  const nx = Math.floor((maxX - minX) / step) + 1,
    nz = Math.floor((maxZ - minZ) / step) + 1;
  const point = (id) => ({
    x: minX + (id % nx) * step,
    z: minZ + Math.floor(id / nx) * step,
  });
  const open = new Uint8Array(nx * nz);
  for (let i = 0; i < open.length; i++) open[i] = free(point(i)) ? 1 : 0;
  function nearest(p, reachableFrom) {
    let best = -1,
      distance = Infinity;
    for (let i = 0; i < open.length; i++) {
      if (!open[i]) continue;
      const q = point(i),
        d = (p.x - q.x) ** 2 + (p.z - q.z) ** 2;
      if (d < distance && (!reachableFrom || segmentFree(reachableFrom, q))) {
        distance = d;
        best = i;
      }
    }
    return best;
  }
  function route(start, requested) {
    if (!free(start)) return null;
    const target = {
      x: Math.max(minX, Math.min(maxX, requested.x)),
      z: Math.max(minZ, Math.min(maxZ, requested.z)),
    };
    if (free(target) && segmentFree(start, target))
      return { points: [target], destination: target, adjusted: false };
    const from = nearest(start, start),
      to = nearest(target);
    if (from < 0 || to < 0) return null;
    const scores = new Float64Array(open.length).fill(Infinity),
      parents = new Int32Array(open.length).fill(-1),
      closed = new Uint8Array(open.length),
      heap = [];
    scores[from] = 0;
    const end = point(to);
    const heuristic = (id) => {
      const p = point(id);
      return Math.hypot(p.x - end.x, p.z - end.z);
    };
    // Priority queue keeps long-city pathfinding from scanning every candidate
    // on each A* iteration. Old/stale entries are skipped after extraction.
    const push = (id, priority) => {
      const item = { id, priority };
      let i = heap.length;
      heap.push(item);
      while (i > 0) {
        const parent = (i - 1) >> 1;
        if (heap[parent].priority <= priority) break;
        heap[i] = heap[parent];
        i = parent;
      }
      heap[i] = item;
    };
    const pop = () => {
      const top = heap[0];
      const tail = heap.pop();
      if (heap.length) {
        let i = 0;
        while (true) {
          let child = i * 2 + 1;
          if (child >= heap.length) break;
          if (
            child + 1 < heap.length &&
            heap[child + 1].priority < heap[child].priority
          )
            child++;
          if (heap[child].priority >= tail.priority) break;
          heap[i] = heap[child];
          i = child;
        }
        heap[i] = tail;
      }
      return top;
    };
    push(from, heuristic(from));
    while (heap.length) {
      const candidate = pop();
      const current = candidate.id;
      if (
        closed[current] ||
        candidate.priority > scores[current] + heuristic(current) + 1e-7
      )
        continue;
      if (current === to) {
        const raw = [];
        for (let id = to; id !== -1; id = parents[id]) raw.push(point(id));
        raw.reverse();
        const destination =
          free(target) && segmentFree(raw.at(-1), target) ? target : end;
        if (
          Math.hypot(
            destination.x - raw.at(-1).x,
            destination.z - raw.at(-1).z,
          ) > 0.001
        )
          raw.push(destination);
        const smoothed = [];
        let anchor = start,
          index = 0;
        while (index < raw.length) {
          let far = index;
          for (let k = index; k < raw.length; k++)
            if (segmentFree(anchor, raw[k])) far = k;
          const next = raw[far];
          smoothed.push(next);
          anchor = next;
          index = far + 1;
        }
        return {
          points: smoothed,
          destination,
          adjusted:
            Math.hypot(
              destination.x - requested.x,
              destination.z - requested.z,
            ) > 0.3,
        };
      }
      closed[current] = 1;
      const cx = current % nx,
        cz = Math.floor(current / nx);
      for (let dz = -1; dz <= 1; dz++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dz) continue;
          const x = cx + dx,
            z = cz + dz;
          if (x < 0 || x >= nx || z < 0 || z >= nz) continue;
          const next = z * nx + x;
          if (!open[next] || closed[next]) continue;
          if (dx && dz && (!open[cz * nx + x] || !open[z * nx + cx])) continue;
          if (!segmentFree(point(current), point(next))) continue;
          const score = scores[current] + Math.hypot(dx, dz) * step;
          if (score < scores[next]) {
            scores[next] = score;
            parents[next] = current;
            push(next, score + heuristic(next));
          }
        }
    }
    return null;
  }
  function manual(start, desired) {
    if (segmentFree(start, desired)) return desired;
    const x = { x: desired.x, z: start.z };
    if (segmentFree(start, x)) return x;
    const z = { x: start.x, z: desired.z };
    if (segmentFree(start, z)) return z;
    return { x: start.x, z: start.z };
  }
  return { free, segmentFree, route, manual, obstacles: blocks };
}
