import * as T from "../shared/vendor/three.module.js";
import { FARM, MARKET, has, inventory, power } from "./model.mjs";
import { SITES } from "./layout.mjs";
export function createNeighbourhood(scene) {
  let seed = 23;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const unit = new T.BoxGeometry(1, 1, 1),
    cylinder = new T.CylinderGeometry(1, 1, 1, 10),
    sphere = new T.SphereGeometry(1, 12, 8);
  const materialCache = new Map();
  function texture(base, type) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4500; i++) {
      const a = random() * 0.12;
      ctx.fillStyle =
        random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(36,27,16,${a})`;
      const n = type === "metal" ? 1 : 1 + random() * 3;
      ctx.fillRect(random() * 256, random() * 256, n, n);
    }
    if (type === "brick") {
      ctx.strokeStyle = "#b7ac9880";
      ctx.lineWidth = 2;
      for (let y = 0; y <= 256; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
        for (let x = ((y / 32) % 2) * 32; x < 256; x += 64) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 32);
          ctx.stroke();
        }
      }
    }
    if (type === "metal")
      for (let x = 0; x < 256; x += 16) {
        ctx.fillStyle = "#ffffff30";
        ctx.fillRect(x, 0, 3, 256);
        ctx.fillStyle = "#172c3025";
        ctx.fillRect(x + 4, 0, 2, 256);
      }
    const tx = new T.CanvasTexture(c);
    tx.wrapS = tx.wrapT = T.RepeatWrapping;
    tx.colorSpace = T.SRGBColorSpace;
    tx.anisotropy = 2;
    return tx;
  }
  const surfaces = {
    plaster: texture("#c8bea5", "plaster"),
    brick: texture("#c3b497", "brick"),
    metal: texture("#777e76", "metal"),
    dirt: texture("#9d8c6c", "dirt"),
    road: texture("#737974", "road"),
    paving: texture("#c8c4b3", "brick"),
  };
  function mat(color, kind = "plain") {
    const key = color + "|" + kind;
    if (!materialCache.has(key))
      materialCache.set(
        key,
        new T.MeshStandardMaterial({
          color,
          map: surfaces[kind] ?? null,
          roughness: kind === "metal" ? 0.55 : 0.87,
          metalness: kind === "metal" ? 0.3 : 0,
        }),
      );
    return materialCache.get(key);
  }
  const staticRoot = new T.Group(),
    dynamic = new T.Group();
  scene.add(staticRoot, dynamic);
  const box = (root, w, h, d, color, x = 0, y = 0, z = 0, kind = "plain") => {
    const m = new T.Mesh(unit, mat(color, kind));
    m.position.set(x, y, z);
    m.scale.set(w, h, d);
    m.castShadow = h > 0.25;
    m.receiveShadow = true;
    root.add(m);
    return m;
  };
  const cyl = (root, r, h, color, x = 0, y = 0, z = 0) => {
    const m = new T.Mesh(cylinder, mat(color));
    m.position.set(x, y, z);
    m.scale.set(r, h, r);
    m.castShadow = true;
    m.receiveShadow = true;
    root.add(m);
    return m;
  };
  const ball = (root, r, color, x = 0, y = 0, z = 0) => {
    const m = new T.Mesh(sphere, mat(color));
    m.position.set(x, y, z);
    m.scale.setScalar(r);
    m.castShadow = true;
    root.add(m);
    return m;
  };
  function sign(root, text, x, y, z, w = 3, color = "#d8d7bc") {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 512, 128);
      ctx.fillStyle = "#244746";
      ctx.textAlign = "center";
      ctx.font = "700 48px sans-serif";
      ctx.fillText(text, 256, 80, 480);
    }
    const tx = new T.CanvasTexture(c);
    tx.colorSpace = T.SRGBColorSpace;
    const mesh = new T.Mesh(
      new T.PlaneGeometry(w, w / 4),
      new T.MeshBasicMaterial({ map: tx }),
    );
    mesh.position.set(x, y, z);
    root.add(mesh);
  }
  function line(root, a, b, width, color, y = 0.035, kind = "road") {
    const d = Math.hypot(b.x - a.x, b.z - a.z),
      m = box(
        root,
        width,
        0.06,
        d,
        color,
        (a.x + b.x) / 2,
        y,
        (a.z + b.z) / 2,
        kind,
      );
    m.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
    return m;
  }
  box(staticRoot, 140, 0.22, 130, 0xe4ddc4, 0, -0.17, 0, "dirt");
  // Large continuous surfaces, worn paths and connected destinations.
  const mainRoad = [
    { x: -32, z: 7 },
    { x: -16, z: 7 },
    { x: 2, z: 5 },
    { x: 18, z: 4 },
    { x: 29, z: 0 },
  ];
  for (let i = 1; i < mainRoad.length; i++) {
    line(staticRoot, mainRoad[i - 1], mainRoad[i], 4.7, 0x9caaa2, 0.012);
    line(
      staticRoot,
      { x: mainRoad[i - 1].x, z: mainRoad[i - 1].z - 3 },
      { x: mainRoad[i].x, z: mainRoad[i].z - 3 },
      1.05,
      0xe8dcc1,
      0.035,
      "paving",
    );
  }
  const paths = [
    [FARM, { x: -12, z: -6 }],
    [
      { x: -12, z: 2 },
      { x: 2, z: 5 },
    ],
    [FARM, { x: 18, z: -6 }],
    [
      { x: 18, z: 2 },
      { x: 18, z: 9 },
    ],
    [{ x: 18, z: 9 }, MARKET],
    [
      { x: -12, z: 7 },
      { x: -20, z: 19 },
    ],
    [{ x: 2, z: 5 }, MARKET],
  ];
  for (const [a, b] of paths)
    line(staticRoot, a, b, 2.5, 0xbcae8e, 0.025, "dirt");
  for (let i = 0; i < 18; i++)
    box(
      staticRoot,
      0.08,
      0.02,
      0.8,
      0xe7e2ca,
      -29 + i * 3.2,
      0.06,
      7 + (i > 4 ? -Math.min(2, (i - 4) * 0.3) : 0),
    );
  // Drainage, kerbs and paving make street scales and access legible.
  for (let i = 0; i < 18; i++) {
    box(
      staticRoot,
      1.4,
      0.14,
      0.65,
      0x8c968d,
      -29 + i * 3,
      0.08,
      10.1,
      "paving",
    );
    for (let j = 0; j < 5; j++)
      box(
        staticRoot,
        0.08,
        0.02,
        0.55,
        0x52625b,
        -29 + i * 3 - 0.5 + j * 0.23,
        0.16,
        10.1,
      );
  }
  for (let i = 0; i < 7; i++)
    box(staticRoot, 0.35, 0.04, 2.5, 0xeae7d5, 3.5 + i * 0.55, 0.07, 5.2);
  const riverShape = new T.Shape();
  riverShape.moveTo(-70, -4.4);
  riverShape.bezierCurveTo(-25, -6, -3, -3.7, 14, -4.6);
  riverShape.bezierCurveTo(34, -5.4, 45, -4, 70, -5);
  riverShape.lineTo(70, 0.2);
  riverShape.bezierCurveTo(25, 1, 0, -0.2, -20, 0.1);
  riverShape.lineTo(-70, 1);
  riverShape.closePath();
  const river = new T.Mesh(
    new T.ShapeGeometry(riverShape, 28),
    new T.MeshStandardMaterial({
      color: 0x648783,
      roughness: 0.25,
      metalness: 0.32,
      transparent: true,
      opacity: 0.9,
      side: T.DoubleSide,
    }),
  );
  river.rotation.x = -Math.PI / 2; // Shape y becomes world -z; reverse its footprint below.
  river.scale.y = -1;
  river.position.y = 0.015;
  scene.add(river);
  // Straight navigable channel matches the simulation crossings.
  const channel = box(staticRoot, 140, 0.06, 5.1, 0x8a9b87, 0, -0.01, -2.4);
  channel.receiveShadow = true;
  const water = new T.Mesh(
    new T.PlaneGeometry(140, 4.2, 16, 2),
    new T.MeshStandardMaterial({
      color: 0x628d8b,
      roughness: 0.24,
      metalness: 0.35,
      transparent: true,
      opacity: 0.94,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.045, -2);
  scene.add(water);
  river.visible = false;
  const bridgeGroup = new T.Group();
  bridgeGroup.userData.target = "crossing";
  staticRoot.add(bridgeGroup);
  function bridge(root, x, raised = true) {
    const y = raised ? 0.65 : 0.12;
    box(root, 3.4, 0.25, 7.5, 0xaab2a2, x, y, -2, "paving");
    for (const side of [-1, 1]) {
      box(root, 0.14, 0.14, 7.5, 0x89968d, x + side * 1.55, y + 1, -2);
      for (let k = 0; k < 5; k++)
        box(
          root,
          0.12,
          0.95,
          0.12,
          0x89968d,
          x + side * 1.55,
          y + 0.5,
          -5 + k * 1.5,
        );
    }
    for (const z of [-4.4, 0.4]) {
      box(root, 2.8, 1.5, 0.5, 0x7c8576, x, -0.2, z, "plaster");
    }
  }
  bridge(bridgeGroup, 18, true);
  bridge(bridgeGroup, -12, false);
  const trees = [];
  function tree(x, z, r = 1) {
    const g = new T.Group();
    g.position.set(x, 0, z);
    staticRoot.add(g);
    cyl(g, 0.17 * r, 3.5 * r, 0x6e6046, 0, 1.75 * r, 0);
    for (let i = 0; i < 5; i++) {
      const a = i * 2.4;
      const m = ball(
        g,
        (1.1 + random() * 0.3) * r,
        [0x637b4b, 0x7c925c, 0x8a9b69][i % 3],
        Math.sin(a) * r * 0.75,
        (3.6 + random()) * r,
        Math.cos(a) * r * 0.75,
      );
      m.scale.y *= 0.8;
    }
    trees.push({ x, z, r: 0.25 * r });
  }
  for (const [x, z, r] of [
    [-28, 12, 1.3],
    [-17, 4, 0.85],
    [3, 21, 1.2],
    [17, 23, 1],
    [24, -22, 1.3],
    [-21, -9, 1.25],
    [3, -11, 1.2],
    [12, -9, 0.9],
    [-4, -23, 1.2],
    [29, 13, 1.3],
    [-28, -28, 1.5],
    [31, -2, 1.2],
  ])
    tree(x, z, r);
  // Soft distant land and vegetation frame a region, not an isolated board.
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2,
      r = 50 + random() * 12;
    const hill = ball(
      staticRoot,
      6 + random() * 8,
      0x8d9d75,
      Math.sin(a) * r,
      -3,
      Math.cos(a) * r,
    );
    hill.scale.y = 0.5;
  }
  function house(site, index) {
    const g = new T.Group();
    g.position.set(site.x, 0, site.z);
    g.userData.target = site.id;
    staticRoot.add(g);
    const h = index % 3 === 0 ? 5.8 : 3.25,
      wall = [0xe5d6b8, 0xc6c5ac, 0xd3bda0, 0xc7d0c4][index % 4];
    box(g, site.w, 0.25, site.d, 0xbdb89f, 0, 0.1, 0, "paving");
    box(
      g,
      site.w - 0.25,
      h,
      site.d - 0.25,
      wall,
      0,
      h / 2 + 0.15,
      0,
      index % 2 ? "plaster" : "brick",
    );
    for (const side of [-1, 1]) {
      const roof = box(
        g,
        site.w + 1,
        0.12,
        site.d / 2 + 0.65,
        [0x868c80, 0x9e9583, 0x758982][index % 3],
        0,
        h + 0.45,
        side * (site.d / 4),
        "metal",
      );
      roof.rotation.x = side * 0.19;
    }
    for (let floor = 0; floor < (h > 4 ? 2 : 1); floor++)
      for (const x of [-site.w * 0.28, site.w * 0.28]) {
        box(
          g,
          1.35,
          1.25,
          0.12,
          0x536b69,
          x,
          1.8 + floor * 2.6,
          site.d / 2 + 0.02,
        );
        for (const dx of [-0.72, 0.72])
          box(
            g,
            0.1,
            1.4,
            0.19,
            0xe4ddc2,
            x + dx,
            1.8 + floor * 2.6,
            site.d / 2 + 0.1,
          );
        box(
          g,
          1.6,
          0.1,
          0.24,
          0xe4ddc2,
          x,
          1.1 + floor * 2.6,
          site.d / 2 + 0.1,
        );
        box(
          g,
          0.055,
          1.3,
          0.12,
          0x353f3c,
          x,
          1.8 + floor * 2.6,
          site.d / 2 + 0.2,
        );
      }
    box(g, 1, 2.2, 0.13, 0x746953, 0, 1.2, site.d / 2 + 0.03);
    box(g, 1.4, 0.16, 0.8, 0xc9c1a4, 0, 0.18, site.d / 2 + 0.4, "paving");
    if (h > 4) {
      box(g, site.w, 0.15, 1.1, 0xb7b5a2, 0, 3, site.d / 2 + 0.2);
      for (let i = 0; i < 9; i++)
        box(
          g,
          0.06,
          0.85,
          0.07,
          0x626e63,
          -site.w / 2 + (i * site.w) / 8,
          3.5,
          site.d / 2 + 0.75,
        );
      box(g, site.w, 0.06, 0.08, 0x626e63, 0, 3.9, site.d / 2 + 0.75);
    }
    return g;
  }
  for (const [i, s] of SITES.filter((s) => s.id.startsWith("home")).entries())
    house(s, i);
  const school = house(
    SITES.find((s) => s.id === "school"),
    1,
  );
  sign(school, "COMMUNITY SCHOOL", 0, 3.05, 3.55, 5);
  box(school, 6, 0.08, 4, 0xd7c8a2, 0, 0.05, 6, "dirt");
  const clinic = house(
    SITES.find((s) => s.id === "clinic"),
    2,
  );
  sign(clinic, "HEALTH CENTRE", 0, 3.05, 3.55, 4.5, "#e0e6d8");
  const workshop = house(
    SITES.find((s) => s.id === "workshop"),
    3,
  );
  sign(workshop, "REPAIR & REUSE", 0, 2.8, 3.1, 4);
  for (let i = 0; i < 3; i++)
    box(workshop, 1.2, 0.8, 0.8, 0x9e8054, -2 + i * 1.5, 0.6, 4.3, "metal");
  const farm = new T.Group();
  farm.position.set(FARM.x, 0, FARM.z);
  farm.userData.target = "farm";
  staticRoot.add(farm);
  for (let row = 0; row < 4; row++) {
    box(farm, 1.25, 0.18, 6, 0x766447, -3 + row * 2, 0.15, -0.8, "dirt");
    for (let n = 0; n < 7; n++) {
      const x = -3 + row * 2,
        z = -3.4 + n * 0.85;
      cyl(farm, 0.025, 0.7, 0x537d44, x, 0.5, z);
      for (let j = 0; j < 3; j++) {
        const leaf = ball(
          farm,
          0.25,
          0x6c9250,
          x + Math.sin(j * 2.1) * 0.18,
          0.7,
          z + Math.cos(j * 2.1) * 0.18,
        );
        leaf.scale.y = 0.4;
      }
      if (n % 2 === 0) ball(farm, 0.115, 0xbd5439, x + 0.12, 0.57, z);
    }
  }
  for (let i = 0; i < 10; i++)
    box(farm, 0.1, 0.6, 0.1, 0x9b8860, -4.3 + i, 0.4, -4.6);
  box(farm, 9, 0.08, 0.09, 0x99845c, 0, 0.7, -4.6);
  const market = new T.Group();
  market.position.set(MARKET.x, 0, MARKET.z);
  market.userData.target = "market";
  staticRoot.add(market);
  box(market, 11, 0.1, 10, 0xd6c9ad, 0, 0.04, 0, "paving");
  const stalls = [];
  for (let i = 0; i < 4; i++) {
    const sx = (i % 2 ? 1 : -1) * 2.8,
      sz = i < 2 ? -2.4 : 2.4,
      g = new T.Group();
    g.position.set(sx, 0, sz);
    market.add(g);
    stalls.push(g);
    for (const x of [-1.5, 1.5])
      for (const z of [-1.1, 1.1])
        box(g, 0.09, 2.9, 0.09, 0x6e7d71, x, 1.45, z, "metal");
    const roof = box(
      g,
      3.6,
      0.1,
      2.9,
      i % 2 ? 0x70908b : 0xb9ac83,
      0,
      3.05,
      0,
      "metal",
    );
    roof.rotation.x = 0.1;
    box(g, 2.8, 0.17, 1, 0x9a7c53, 0, 1, 0);
    for (const x of [-1.2, 1.2]) box(g, 0.12, 0.9, 0.12, 0x8c7251, x, 0.5, 0);
    for (let c = 0; c < 3; c++) {
      box(g, 0.8, 0.45, 0.8, 0xb88b55, -0.9 + c * 0.9, 0.35, 0.55);
      for (let n = 0; n < 5; n++)
        ball(
          g,
          0.09,
          [0xb44e34, 0x7e944e, 0xe0b451][c],
          -0.9 + c * 0.9 + (n % 3) * 0.15 - 0.15,
          0.62,
          0.4 + Math.floor(n / 3) * 0.17,
        );
    }
  }
  sign(market, "NEIGHBOURHOOD MARKET", 0, 3.6, -3.8, 5);
  for (const x of [-2.6, 2.6])
    box(market, 0.12, 3.4, 0.12, 0x7e7d65, x, 1.8, -3.8);
  const depot = new T.Group();
  depot.userData.target = "depot";
  depot.position.set(FARM.x - 3, 0, FARM.z + 4);
  staticRoot.add(depot);
  box(depot, 3, 0.12, 2.5, 0xcab897, 0, 0.06, 0, "paving");
  sign(depot, "COLLECTION", 0, 1.8, -0.3, 2.5);
  for (const x of [-1.2, 1.2])
    box(depot, 0.09, 1.7, 0.09, 0x7e795f, x, 0.9, -0.4);
  function vehicle(x, z, bus = false) {
    const g = new T.Group();
    g.position.set(x, 0.2, z);
    staticRoot.add(g);
    box(
      g,
      bus ? 2.2 : 1.5,
      bus ? 1.6 : 1.2,
      bus ? 4.3 : 2.8,
      bus ? 0xd5ac4a : 0x518674,
      0,
      1,
      0,
      "metal",
    );
    for (const z of [-1.4, 1.35])
      for (const x of [-1.02, 1.02]) {
        const w = cyl(g, 0.36, 0.2, 0x38413a, x, 0.4, z);
        w.rotation.z = Math.PI / 2;
      }
    box(g, 1.95, 0.72, 0.08, 0x557a7b, 0, 1.5, 2.18);
    for (const x of [-1.12, 1.12])
      for (let i = 0; i < 3; i++)
        box(g, 0.04, 0.65, 0.9, 0x557a7b, x, 1.5, -1.2 + i * 1.1);
    box(g, 2.3, 0.09, 0.1, 0x38413a, 0, 0.85, 2.2);
    return g;
  }
  const bus = vehicle(-24, 6.7, true);
  bus.rotation.y = Math.PI / 2;
  // Light poles and slender utility wires retain human-world proportions.
  for (const x of [-27, -10, 7, 24]) {
    cyl(staticRoot, 0.095, 7.4, 0x8b8d78, x, 3.7, 9);
    line(staticRoot, { x, z: 9 }, { x: x + 2, z: 9 }, 0.09, 0x6e7a70, 7.1);
    box(staticRoot, 0.65, 0.1, 0.3, 0xcbd1bd, x + 1.8, 7, 9);
  }
  const wireMat = new T.LineBasicMaterial({ color: 0x49594f });
  for (let i = 0; i < 3; i++) {
    const curve = new T.QuadraticBezierCurve3(
      new T.Vector3(-27 + i * 17, 7, 9),
      new T.Vector3(-18.5 + i * 17, 5.8, 9),
      new T.Vector3(-10 + i * 17, 7, 9),
    );
    staticRoot.add(
      new T.Line(
        new T.BufferGeometry().setFromPoints(curve.getPoints(16)),
        wireMat,
      ),
    );
  }
  // Batch repeated static geometry while preserving raycastable place IDs.
  staticRoot.updateMatrixWorld(true);
  const batches = new Map(),
    remove = [];
  staticRoot.traverse((o) => {
    if (!o.isMesh) return;
    let target = null;
    for (let a = o; a; a = a.parent)
      if (a.userData.target) {
        target = a.userData.target;
        break;
      }
    const key = o.geometry.uuid + "|" + o.material.uuid;
    if (!batches.has(key)) batches.set(key, []);
    batches.get(key).push({ mesh: o, target, matrix: o.matrixWorld.clone() });
    remove.push(o);
  });
  for (const group of batches.values()) {
    const m = new T.InstancedMesh(
      group[0].mesh.geometry,
      group[0].mesh.material,
      group.length,
    );
    m.userData.targets = group.map((p) => p.target);
    group.forEach((p, i) => m.setMatrixAt(i, p.matrix));
    m.castShadow = group.some((p) => p.mesh.castShadow);
    m.receiveShadow = true;
    scene.add(m);
  }
  for (const o of remove) o.removeFromParent();
  const people = [];
  function person(x, z, color = 0x3f7080, scale = 1) {
    const g = new T.Group();
    g.position.set(x, 0.05, z);
    g.scale.setScalar(scale);
    dynamic.add(g);
    const skin = 0x80563d;
    const body = cyl(g, 0.24, 0.65, color, 0, 1.14, 0);
    body.scale.z = 0.18;
    body.scale.x = 0.23;
    body.scale.y = 0.68;
    const head = ball(g, 0.19, skin, 0, 1.74, 0);
    head.scale.y = 1.16;
    ball(g, 0.195, 0x302d28, 0, 1.82, -0.025);
    box(g, 0.09, 0.06, 0.1, skin, 0, 1.72, 0.17);
    const legs = [],
      arms = [];
    for (const side of [-1, 1]) {
      const leg = new T.Group();
      leg.position.set(side * 0.12, 0.84, 0);
      g.add(leg);
      cyl(leg, 0.085, 0.68, 0x3d4b4c, 0, -0.32, 0);
      box(leg, 0.18, 0.13, 0.31, 0x44443a, 0, -0.68, 0.055);
      legs.push(leg);
      const arm = new T.Group();
      arm.position.set(side * 0.29, 1.43, 0);
      g.add(arm);
      const sleeve = cyl(arm, 0.075, 0.36, color, 0, -0.15, 0);
      sleeve.rotation.z = side * 0.1;
      cyl(arm, 0.055, 0.28, skin, side * 0.025, -0.43, 0);
      ball(arm, 0.065, skin, side * 0.025, -0.59, 0);
      arms.push(arm);
    }
    return { g, legs, arms };
  }
  const player = person(2, 15, 0x356e83);
  player.g.userData.player = true;
  for (let i = 0; i < 18; i++) {
    const p = person(
      i < 6 ? MARKET.x - 4 + (i % 3) * 3.3 : 3.5 + ((i - 6) % 6) * 2.2,
      i < 6 ? MARKET.z - 4 + Math.floor(i / 3) * 8 : i < 12 ? 3.5 : 18,
      [0x9e735b, 0x557b78, 0xbd9e55, 0x787e57, 0x6f7594][i % 5],
      i === 7 ? 0.85 : 1,
    );
    p.origin = p.g.position.clone();
    p.phase = i * 0.9;
    p.walker = i >= 6;
    p.customer = i - 6;
    p.bag = box(p.g, 0.22, 0.3, 0.2, 0x9eaa58, 0.38, 0.68, 0);
    p.bag.visible = false;
    people.push(p);
  }
  const cart = new T.Group();
  cart.userData.target = "delivery";
  dynamic.add(cart);
  const cartBody = box(cart, 1.5, 0.2, 2, 0x846d4c, 0, 0.8, 0);
  const cartLoad = new T.Group();
  cart.add(cartLoad);
  const wheels = [];
  for (const x of [-0.85, 0.85]) {
    const w = cyl(cart, 0.4, 0.18, 0x414a41, x, 0.44, 0.1);
    w.rotation.z = Math.PI / 2;
    wheels.push(w);
  }
  box(cart, 0.12, 0.12, 1.4, 0x7e8778, 0.6, 0.65, 1.3);
  box(cart, 0.12, 0.12, 1.4, 0x7e8778, -0.6, 0.65, 1.3);
  const stockRoot = new T.Group(),
    buildRoot = new T.Group();
  dynamic.add(stockRoot, buildRoot);
  let stockSignature = "",
    buildSignature = "";
  const pins = [
    {
      id: "farm",
      title: "Grower’s collection",
      x: FARM.x,
      z: FARM.z + 2,
      y: 2,
    },
    {
      id: "market",
      title: "Ama · market organiser",
      x: MARKET.x - 3,
      z: MARKET.z - 4,
      y: 2.3,
    },
    { id: "crossing", title: "Low crossing", x: -12, z: -2, y: 1 },
  ];
  function crate(root, x, y, z, protectedCrate = false) {
    box(root, 0.65, 0.5, 0.65, protectedCrate ? 0x62816a : 0xae8853, x, y, z);
    for (let i = 0; i < 4; i++)
      ball(
        root,
        0.08,
        0xb96542,
        x - 0.2 + (i % 2) * 0.3,
        y + 0.27,
        z - 0.2 + Math.floor(i / 2) * 0.3,
      );
  }
  function sync(s) {
    const inv = inventory(s),
      signature = [inv.farm, inv.market, inv.cart, has(s, "crates")].join("|");
    if (signature !== stockSignature) {
      stockSignature = signature;
      stockRoot.clear();
      cartLoad.clear();
      for (let i = 0; i < inv.farm; i++)
        crate(
          stockRoot,
          FARM.x - 3 + (i % 3) * 0.8,
          0.4 + Math.floor(i / 6) * 0.55,
          FARM.z + 3 + (Math.floor(i / 3) % 2) * 0.8,
          has(s, "crates"),
        );
      for (let i = 0; i < inv.market; i++)
        crate(
          stockRoot,
          MARKET.x - 3 + (i % 4) * 1,
          0.45 + Math.floor(i / 4) * 0.5,
          MARKET.z,
          has(s, "crates"),
        );
      for (let i = 0; i < inv.cart; i++)
        crate(
          cartLoad,
          (i % 2 ? 1 : -1) * 0.35,
          1.15 + Math.floor(i / 4) * 0.55,
          (Math.floor(i / 2) % 2 ? 1 : -1) * 0.4,
          has(s, "crates"),
        );
    }
    const bs = JSON.stringify(s.buildings);
    if (bs !== buildSignature) {
      buildSignature = bs;
      buildRoot.clear();
      for (const b of s.buildings) {
        const g = new T.Group();
        g.position.set(b.x, 0, b.z);
        g.userData.target = b.id;
        g.userData.building = b;
        buildRoot.add(g);
        if (b.kind === "bridge") {
          g.position.set(0, 0, 0);
          bridge(g, b.x, true);
        }
        if (b.kind === "shade") {
          for (const x of [-1.8, 1.8])
            for (const z of [-1.6, 1.6])
              box(g, 0.1, 3, 0.1, 0x758379, x, 1.5, z, "metal");
          const roof = box(g, 4.3, 0.12, 3.8, 0x869a86, 0, 3.15, 0, "metal");
          roof.rotation.x = 0.12;
          box(g, 3.8, 0.12, 3.2, 0xcab99a, 0, 0.08, 0, "paving");
        }
        if (b.kind === "solar") {
          const panel = box(g, 3.8, 0.09, 2.5, 0x334d64, 0, 1.6, 0);
          panel.rotation.x = -0.25;
          for (let i = 0; i < 6; i++)
            box(g, 0.025, 0.02, 2.5, 0x8ba4ac, -1.8 + i * 0.72, 1.68, 0);
          for (const x of [-1.3, 1.3])
            box(g, 0.12, 1.5, 0.12, 0x829285, x, 0.75, 0);
        }
        if (b.kind === "battery") {
          box(g, 1.3, 1.5, 0.9, 0xe0e1c8, 0, 0.8, 0);
          box(g, 0.75, 0.2, 0.08, 0x678b6d, 0, 1.2, 0.47);
        }
        if (b.kind === "coldroom") {
          box(g, 3.8, 2.9, 3.5, 0xd2d9cd, 0, 1.5, 0, "metal");
          box(g, 4.2, 0.18, 3.9, 0x809991, 0, 3, 0, "metal");
          box(g, 1.5, 2.5, 0.1, 0x8aa5a0, 0, 1.35, 1.8);
          box(g, 0.12, 0.3, 0.12, 0x5a746a, 0.6, 1.3, 1.9);
          sign(g, "COLD STORE", 0, 2.7, 1.87, 2.6);
        }
        if (b.kind === "team") {
          box(g, 2.4, 0.8, 0.9, 0x9a7f57, 0, 0.5, 0);
          sign(g, "RESIDENT TEAM", 0, 2.1, -0.3, 2.7);
        }
        if (b.kind === "crates") {
          for (let i = 0; i < 4; i++)
            crate(g, (i % 2) * 0.8, 0.4 + Math.floor(i / 2) * 0.55, 0, true);
        }
        if (b.kind === "cargo") {
          box(g, 1, 1.5, 1, 0x3e7a6a, 0, 1, -1.2, "metal");
        }
      }
    }
    cartBody.material = mat(has(s, "cargo") ? 0x4c8875 : 0x846d4c);
    water.material.color.setHex(s.weather === "rain" ? 0x879d8c : 0x628d8b);
    water.position.y = s.weather === "rain" ? 0.3 : 0.045;
    for (const g of buildRoot.children)
      if (g.userData.building?.kind === "coldroom") {
        g.children[0].material = mat(
          power(s).supplied ? 0xd2dfd0 : 0xc0c7bb,
          "metal",
        );
      }
  }
  function animate(s, time, moving, reduced = false) {
    sync(s);
    player.legs.forEach(
      (g, i) =>
        (g.rotation.x = moving ? Math.sin(time * 10 + i * Math.PI) * 0.5 : 0),
    );
    player.arms.forEach(
      (g, i) =>
        (g.rotation.x = moving
          ? Math.sin(time * 10 + (i + 1) * Math.PI) * 0.35
          : 0),
    );
    cart.position.set(
      s.cart.position.x,
      heightAt(s.cart.position.x, s.cart.position.z, s),
      s.cart.position.z,
    );
    if (s.cart.path[s.cart.segment + 1]) {
      const end = s.cart.path[s.cart.segment + 1];
      cart.rotation.y = Math.atan2(
        end.x - cart.position.x,
        end.z - cart.position.z,
      );
    }
    wheels.forEach(
      (w) => (w.rotation.x = s.cart.leg === "idle" ? 0 : -time * 4),
    );
    for (const p of people) {
      const collected = p.walker && s.served > p.customer;
      p.bag.visible = collected;
      // Each household has a separate lane beside the stalls. A bag appears
      // only after the model actually consumes usable market stock.
      const demandReached = s.dayTime >= 11 + p.customer * 3;
      const targetZ =
        p.origin.z +
        (p.walker && demandReached && !collected
          ? p.customer < 6
            ? 1.5
            : -1.5
          : 0);
      const delta = targetZ - p.g.position.z;
      const active =
        s.running && p.walker && Math.abs(delta) > 0.02 && !reduced;
      const candidateZ = reduced
        ? targetZ
        : p.g.position.z + Math.sign(delta) * Math.min(Math.abs(delta), 0.025);
      const blocked =
        Math.hypot(
          p.g.position.x - player.g.position.x,
          candidateZ - player.g.position.z,
        ) < 0.85;
      if (!blocked && (s.running || reduced)) p.g.position.z = candidateZ;
      if (active) p.g.rotation.y = delta > 0 ? 0 : Math.PI;
      p.legs.forEach(
        (leg, i) =>
          (leg.rotation.x = active
            ? Math.sin(time * 6 + i * Math.PI) * 0.3
            : 0),
      );
    }
    if (!reduced) water.material.opacity = 0.91 + Math.sin(time * 0.6) * 0.025;
  }
  const ghost = new T.Group();
  scene.add(ghost);
  const ghostMat = new T.MeshBasicMaterial({
    color: 0x7fbf8c,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const ghostMesh = new T.Mesh(unit, ghostMat);
  ghost.add(ghostMesh);
  ghost.visible = false;
  function showGhost(id, p, valid) {
    ghost.visible = !!id;
    if (!id) return;
    ghost.position.set(p.x, 0.08, p.z);
    ghostMesh.scale.set(
      id === "bridge" ? 3.5 : 3.8,
      0.15,
      id === "bridge" ? 7.5 : 3.8,
    );
    ghostMat.color.setHex(valid ? 0x6bbd8a : 0xcf765a);
  }
  function heightAt(x, z, s) {
    if (
      z > -5.7 &&
      z < 1.7 &&
      (Math.abs(x - 18) < 1.7 ||
        s.buildings.some((b) => b.kind === "bridge" && Math.abs(x - b.x) < 1.7))
    )
      return 0.75;
    return 0.05;
  }
  return {
    player,
    people,
    pins,
    trees,
    sites: SITES,
    animate,
    sync,
    showGhost,
    heightAt,
    buildRoot,
    cart,
  };
}
