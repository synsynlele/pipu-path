import { CITY_PROJECTS, CONSTRUCTION_OBJECTS } from "./city-construction.mjs";
export function createConstructionScene(T) {
  const cache = new Map(),
    material = new T.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.83,
    }),
    unit = new T.BoxGeometry(1, 1, 1).toNonIndexed();
  function geometry(p, stage, open) {
    const key = p.id + ":" + stage + ":" + open;
    if (cache.has(key)) return cache.get(key);
    const positions = [],
      colors = [],
      color = new T.Color();
    const b = (w, h, d, x, y, z, c) => {
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
    b(p.width, 0.1, p.depth, 0, 0.2, 0, 0xd6d0bb);
    // A finished layout snaps to a curated plan: paving, verges and aligned entrances.
    b(p.width, 0.03, 0.65, 0, 0.28, p.depth / 2 - 0.35, 0xeee5cf);
    if (stage >= 1) {
      b(
        p.width - 1,
        0.12,
        p.depth - 1,
        0,
        0.31,
        0,
        p.id === "farm" ? 0x89633f : 0xb6b7a8,
      );
    }
    if (stage >= 2) {
      if (p.id === "tower") {
        b(3.1, 12, 2.8, -1, 6.4, -0.3, 0x5e879a);
        b(2.1, 8, 2.4, 1.7, 4.4, 0, 0x88a8b3);
        for (let f = 1; f <= 11; f++)
          b(3.2, 0.12, 2.9, -1, f + 0.4, -0.3, 0xdce7e1);
        b(0.1, 2, 0.1, -1, 13.2, -0.3, 0xcbb56d);
      } else if (p.id === "homes") {
        for (const x of [-2.2, 0.4, 2.6]) {
          b(1.8, 2, 2.6, x, 1.4, -0.5, 0xe3cfac);
          b(2, 0.18, 2.8, x, 2.5, -0.5, 0x547d75);
          b(0.45, 1.25, 0.08, x, 0.99, 0.85, 0x6b7a78);
          for (const dx of [-0.55, 0.55])
            b(0.35, 0.55, 0.1, x + dx, 1.6, 0.86, 0x7298ae);
        }
      } else if (p.id === "hospital") {
        b(6.3, 3.5, 3.6, 0, 2.1, -0.4, 0xe9e4d4);
        b(6.6, 0.18, 3.9, 0, 3.95, -0.4, 0x5e8a89);
        b(1.6, 0.1, 2.4, 0, 0.43, 2, 0xb9c7bf);
        for (const x of [-2.4, -1.5, 1.5, 2.4])
          b(0.55, 0.8, 0.08, x, 2, 1.45, 0x79a5b2);
        b(1.1, 1.7, 0.12, 0, 1.2, 1.48, 0x70929a);
        b(0.85, 0.2, 0.12, 0, 3, 1.49, 0x468f79);
        b(0.2, 0.85, 0.12, 0, 3, 1.49, 0x468f79);
      } else if (p.id === "farm") {
        for (let row = 0; row < 5; row++) {
          const z = -2 + row * 0.85;
          b(6.4, 0.12, 0.55, 0, 0.45, z, 0x79543c);
          for (let col = 0; col < 8; col++)
            b(
              0.38,
              stage >= 3 ? 0.6 : 0.18,
              0.35,
              -2.8 + col * 0.8,
              stage >= 3 ? 0.8 : 0.59,
              z,
              col % 2 ? 0x6d9846 : 0x86ac58,
            );
          b(
            6.6,
            0.04,
            0.12,
            0,
            0.51,
            z + 0.34,
            stage >= 3 ? 0x63adbf : 0xc3b791,
          );
        }
      } else if (p.id === "stadium") {
        b(6, 0.05, 4, 0, 0.48, 0, 0x4f9864);
        for (const x of [-3.8, 3.8])
          for (let t = 0; t < 3; t++)
            b(
              0.45,
              0.4 + t * 0.35,
              5.7,
              x + (x < 0 ? -1 : 1) * t * 0.4,
              0.65 + t * 0.175,
              0,
              t % 2 ? 0xd7b76e : 0xb6856e,
            );
        for (const x of [-2.9, 2.9]) b(0.05, 0.025, 3.9, x, 0.53, 0, 0xf4f0df);
        for (const z of [-1.95, 1.95])
          b(5.8, 0.025, 0.05, 0, 0.53, z, 0xf4f0df);
        b(0.05, 0.025, 3.9, 0, 0.53, 0, 0xf4f0df);
      } else if (p.id === "airport") {
        b(2, 0.05, 7.3, -2.4, 0.47, 0, 0x5b6b70);
        for (let z = -3; z <= 3; z += 0.75)
          b(0.12, 0.03, 0.35, -2.4, 0.52, z, 0xf1ead9);
        b(3.4, 2.1, 3.1, 1.5, 1.5, -0.3, 0xcad9d7);
        b(3.7, 0.16, 3.4, 1.5, 2.65, -0.3, 0x5d8397);
        b(0.9, 3.8, 0.9, 3.4, 2.35, -2.6, 0xc6ccbe);
        b(1.3, 0.65, 1.2, 3.4, 4.5, -2.6, 0x5c8695);
        if (stage >= 3) b(2, 0.04, 0.8, -0.4, 0.5, 0.9, 0x7a8887);
        if (open) {
          b(0.25, 0.2, 1.65, -2.4, 0.75, 1, 0xecead9);
          b(1.6, 0.1, 0.32, -2.4, 0.76, 1, 0xecead9);
          b(0.65, 0.1, 0.22, -2.4, 0.79, 1.6, 0xecead9);
        }
      }
    }
    if (open) {
      for (const x of [-p.width / 2 + 0.45, p.width / 2 - 0.45]) {
        b(0.6, 0.25, 0.6, x, 0.44, p.depth / 2 - 0.45, 0x83a478);
      }
      b(1.5, 0.025, 1.3, 0, 0.28, p.depth / 2 + 0.1, 0xe7dfc9);
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    cache.set(key, geo);
    return geo;
  }
  return {
    replica(root, parcel) {
      const p = CITY_PROJECTS.find((p) => p.id === parcel.type),
        g = new T.Group(),
        scale = 4 / Math.max(p.width, p.depth + 1.5);
      g.position.set(parcel.x, 0.18, parcel.z);
      g.scale.set(scale, scale * [0.9, 1, 1.1][parcel.variation], scale);
      g.userData.crewReplica = parcel.id;
      g.add(new T.Mesh(geometry(p, 3, true), material));
      root.add(g);
      return g;
    },
    draw(root, progress, objectGroups, box, hiddenSite = null) {
      for (const p of CITY_PROJECTS) {
        if (p.id === hiddenSite) continue;
        const s = progress[p.id],
          g = new T.Group();
        g.position.set(p.x, 0, p.z);
        g.userData.marketTarget =
          p.id +
          ":" +
          ["base", "structure", "services", "open"][Math.min(s.stage, 3)];
        root.add(g);
        g.add(new T.Mesh(geometry(p, s.stage, s.open), material));
        for (const spec of CONSTRUCTION_OBJECTS.filter(
          (o) => o.project === p.id,
        )) {
          const target = new T.Group();
          target.position.set(spec.x, 0, spec.z);
          target.userData.marketTarget = spec.id;
          root.add(target);
          objectGroups.set(spec.id, target);
          if (s.open && spec.kind !== "open") {
            target.visible = false;
            continue;
          }
          if (spec.kind === "kit")
            for (let i = 0; i < 3; i++)
              box(target, 1.1, 0.25, 0.75, 0xbb9b68, 0, 0.4 + i * 0.28, 0);
          else if (spec.kind === "structure" && p.id === "tower") {
            box(target, 0.22, 6, 0.22, 0xd3af48, 0, 3.2, 0);
            box(target, 4, 0.15, 0.18, 0xd3af48, 1.5, 6.2, 0);
            box(target, 0.05, 3, 0.05, 0x5b686d, 3, 4.7, 0);
            box(target, 0.5, 0.35, 0.5, 0x6c7f8d, 0, 0.7, 1);
          } else {
            box(
              target,
              0.65,
              0.7,
              0.55,
              s.open ? 0x5b9d80 : 0xc7ab68,
              0,
              0.6,
              0,
            );
            box(target, 0.18, 0.15, 0.2, 0x567d8c, 0, 1.03, 0);
          }
        }
      }
    },
  };
}
