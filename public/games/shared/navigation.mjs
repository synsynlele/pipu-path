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
  // A small spatial hash prevents every walking step from scanning every
  // building in a growing city. Collision rules remain exact.
  const cellSize = 4;
  const cells = new Map();
  const cellKey = (x, z) => x + ":" + z;
  for (const block of blocks) {
    for (
      let ix = Math.floor(block.minX / cellSize);
      ix <= Math.floor(block.maxX / cellSize);
      ix++
    )
      for (
        let iz = Math.floor(block.minZ / cellSize);
        iz <= Math.floor(block.maxZ / cellSize);
        iz++
      ) {
        const key = cellKey(ix, iz);
        if (!cells.has(key)) cells.set(key, []);
        cells.get(key).push(block);
      }
  }
  const free = (p) => {
    if (p.x < minX || p.x > maxX || p.z < minZ || p.z > maxZ) return false;
    const nearby = cells.get(
      cellKey(Math.floor(p.x / cellSize), Math.floor(p.z / cellSize)),
    );
    return !nearby?.some(
      (b) => p.x >= b.minX && p.x <= b.maxX && p.z >= b.minZ && p.z <= b.maxZ,
    );
  };
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
  // Rasterize only the grid cells overlapped by a building instead of
  // checking every grid cell against every building after each city change.
  const open = new Uint8Array(nx * nz).fill(1);
  for (const b of blocks) {
    const x0 = Math.max(0, Math.ceil((b.minX - minX) / step));
    const x1 = Math.min(nx - 1, Math.floor((b.maxX - minX) / step));
    const z0 = Math.max(0, Math.ceil((b.minZ - minZ) / step));
    const z1 = Math.min(nz - 1, Math.floor((b.maxZ - minZ) / step));
    for (let iz = z0; iz <= z1; iz++) {
      const z = minZ + iz * step;
      if (z < b.minZ || z > b.maxZ) continue;
      for (let ix = x0; ix <= x1; ix++) {
        const x = minX + ix * step;
        if (x >= b.minX && x <= b.maxX) open[iz * nx + ix] = 0;
      }
    }
  }
  function nearest(p, reachableFrom) {
    const centerX = Math.max(
      0,
      Math.min(nx - 1, Math.round((p.x - minX) / step)),
    );
    const centerZ = Math.max(
      0,
      Math.min(nz - 1, Math.round((p.z - minZ) / step)),
    );
    // Search outwards from the requested location. Almost all starting
    // points resolve within the first one or two rings, even in a full city.
    for (let radius = 0; radius <= Math.max(nx, nz); radius++) {
      let best = -1;
      let distance = Infinity;
      for (let dz = -radius; dz <= radius; dz++) {
        const iz = centerZ + dz;
        if (iz < 0 || iz >= nz) continue;
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== radius) continue;
          const ix = centerX + dx;
          if (ix < 0 || ix >= nx) continue;
          const id = iz * nx + ix;
          if (!open[id]) continue;
          const q = point(id);
          const d = (p.x - q.x) ** 2 + (p.z - q.z) ** 2;
          if (
            d < distance &&
            (!reachableFrom || segmentFree(reachableFrom, q))
          ) {
            distance = d;
            best = id;
          }
        }
      }
      if (best >= 0) return best;
    }
    return -1;
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
          // Prefer the farthest clear waypoint first. The old forward scan
          // tested every intermediate candidate, causing long UI stalls.
          for (let k = raw.length - 1; k >= index; k--)
            if (segmentFree(anchor, raw[k])) {
              far = k;
              break;
            }
          if (!segmentFree(anchor, raw[far])) return null;
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
