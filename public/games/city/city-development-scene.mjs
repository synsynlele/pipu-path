import { deriveCityDevelopment, CITY_PARCELS } from "./city-development.mjs";

// One merged, vertex-coloured mesh per parcel; shared recipes and materials,
// no extra textures, shadows, lights, timers or per-building animation.
export function createCityDevelopmentScene({ T, scene }) {
  const geometryCache = new Map(),
    meshes = new Map();
  const material = new T.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.88,
  });
  const unit = new T.BoxGeometry(1, 1, 1).toNonIndexed();
  let current = deriveCityDevelopment({});
  function geometry(type, status) {
    const key = type + "|" + status;
    if (geometryCache.has(key)) return geometryCache.get(key);
    const positions = [],
      colors = [],
      color = new T.Color();
    const add = (w, h, d, x, y, z, c) => {
      color.setHex(c);
      for (let i = 0; i < unit.attributes.position.count; i++) {
        positions.push(
          unit.attributes.position.getX(i) * w + x,
          unit.attributes.position.getY(i) * h + y,
          unit.attributes.position.getZ(i) * d + z,
        );
        colors.push(color.r, color.g, color.b);
      }
    };
    add(
      4.8,
      0.12,
      4.8,
      0,
      0.17,
      0,
      status === "unfinished" ? 0xcba66b : 0xc7c5ae,
    );
    const wall = status === "limited" ? 0xc59b63 : 0xb6c8d0;
    const block = (w, h, d, x = 0, z = 0, c = wall) =>
      add(w, h, d, x, 0.23 + h / 2, z, c);
    if (status === "unfinished") {
      // A visible worksite is not a fictional successful service.
      for (const x of [-1.5, 1.5])
        for (const z of [-1.5, 1.5]) block(0.18, 2.6, 0.18, x, z, 0xc08e43);
      block(3.2, 0.15, 3.2, 0, 0, 0xa58869);
      add(3.2, 0.14, 3.2, 0, 1.7, 0, 0xc08e43);
    } else if (type === "skyscraper") {
      block(2.2, 11, 2.2, -0.6, 0, 0x567e96);
      block(1.4, 7, 1.8, 1.2, 0.5, 0x789fab);
      for (let floor = 1; floor < 9; floor++)
        add(2.25, 0.12, 2.25, -0.6, floor + 0.3, 0, 0xd4dfcf);
      add(0.14, 2, 0.14, -0.6, 12, 0, 0xdcc476);
    } else if (type === "stadium") {
      block(3.2, 0.16, 2.8, 0, 0, 0x4c9265);
      for (const x of [-1.8, 1.8]) block(0.7, 1.35, 3.7, x, 0, 0xc4b18e);
      for (const z of [-1.7, 1.7]) block(3.7, 1, 0.55, 0, z, 0xc4b18e);
      add(0.06, 0.03, 2.7, 0, 0.42, 0, 0xf1eee0);
      for (const x of [-1.05, 1.05]) add(0.08, 0.6, 1.2, x, 0.7, 0, 0xf1eee0);
    } else if (type === "farm") {
      block(4.2, 0.12, 4.1, 0, 0, 0x926c44);
      for (let row = 0; row < 5; row++)
        block(
          3.8,
          0.35,
          0.35,
          0,
          -1.6 + row * 0.8,
          row % 2 ? 0x88a65b : 0x539763,
        );
      block(0.7, 1.4, 0.7, 1.6, 1.6, 0xc6ad73);
    } else if (type === "bridge") {
      block(4.5, 0.08, 2, 0, 0, 0x69aaba);
      for (const x of [-1.6, 1.6]) block(0.4, 1.3, 1.8, x, 0, 0xa5b0ae);
      add(1.6, 0.22, 4.5, 0, 1.55, 0, 0xcdbe9b);
      for (const x of [-0.85, 0.85]) add(0.12, 0.55, 4.5, x, 1.9, 0, 0x628396);
    } else if (type === "solar") {
      for (const x of [-1.1, 1.1])
        for (const z of [-1.1, 1.1]) {
          block(0.13, 0.8, 0.13, x, z, 0x7b898d);
          add(1.7, 0.15, 1.5, x, 1.1, z, 0x416b9a);
        }
    } else if (type === "park") {
      block(4.3, 0.1, 4.3, 0, 0, 0x7ca779);
      for (const x of [-1.2, 1.2]) {
        block(0.22, 1.6, 0.22, x, 0, 0x8b7752);
        add(1.4, 1.2, 1.4, x, 2, 0, 0x4e8f64);
      }
      block(3.5, 0.07, 0.55, 0, 1.4, 0xd9c8a4);
    } else if (type === "waterworks") {
      for (const x of [-1.1, 1.1]) {
        block(1.65, 1.8, 2.5, x, 0, 0x729dae);
        add(1.4, 0.08, 2.2, x, 2.09, 0, 0x6cc0d3);
      }
      add(3, 0.2, 0.2, 0, 1.1, 1.5, 0xe0c89b);
    } else {
      const height = type === "homes" ? 3.2 : type === "hospital" ? 4.8 : 2.6;
      block(3.7, height, 3.2);
      add(
        4,
        0.2,
        3.5,
        0,
        height + 0.32,
        0,
        type === "factory" ? 0x8b8574 : 0x517989,
      );
      for (const x of [-1.1, 0, 1.1])
        add(0.5, 0.65, 0.08, x, 1.8, 1.65, 0x557f9e);
      block(0.7, 1.2, 0.1, 0, 1.68, 0x5a6d78);
      if (type === "hospital") {
        add(1, 0.2, 0.1, 0, 3.6, 1.67, 0xd15b60);
        add(0.2, 1, 0.1, 0, 3.6, 1.67, 0xd15b60);
      }
      if (type === "factory") block(0.55, 5.2, 0.55, 1.4, -1.1, 0x887a69);
      if (type === "station") add(4.2, 0.2, 1.7, 0, 1.1, 1.3, 0xcea65e);
      if (type === "library" || type === "school")
        for (const x of [-1.4, 1.4]) block(0.18, 2.5, 0.18, x, 1.75, 0xe6d6ae);
      if (type === "market")
        for (const x of [-1.3, 0, 1.3])
          add(1.15, 0.15, 1.1, x, 1.05, 1.7, 0xc58b59);
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    g.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    g.computeBoundingSphere();
    geometryCache.set(key, g);
    return g;
  }
  function sync(state) {
    current = deriveCityDevelopment(state);
    const active = new Set(current.plots.map((p) => p.id));
    for (const [id, m] of meshes)
      if (!active.has(id)) {
        scene.remove(m);
        meshes.delete(id);
      }
    for (const p of current.plots) {
      let mesh = meshes.get(p.id);
      if (!mesh) {
        mesh = new T.Mesh(geometry(p.type, p.status), material);
        meshes.set(p.id, mesh);
        scene.add(mesh);
      }
      mesh.geometry = geometry(p.type, p.status);
      mesh.position.set(p.x, 0, p.z);
      mesh.userData.ignoreNavigation = true;
      mesh.userData.cityDevelopment = p;
      mesh.visible = true;
    }
    return current;
  }
  function setFocus(focus, overview = false, inView = null) {
    for (const mesh of meshes.values())
      mesh.visible =
        overview ||
        !focus ||
        (inView
          ? inView(mesh.position)
          : Math.hypot(mesh.position.x - focus.x, mesh.position.z - focus.z) <
            32);
  }
  // Stable parcel footprints protect paths independently of mesh visibility.
  function obstacles() {
    return current.plots.map((p) => ({
      minX: p.x - 2.4,
      maxX: p.x + 2.4,
      minZ: p.z - 2.4,
      maxZ: p.z + 2.4,
    }));
  }
  return {
    sync,
    setFocus,
    obstacles,
    meshes,
    parcels: CITY_PARCELS,
    get current() {
      return current;
    },
  };
}
