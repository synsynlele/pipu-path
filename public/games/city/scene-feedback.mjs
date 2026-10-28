// Lightweight, authored decision landmarks for The Unbuilt City.
// These props are fiction-only visual effects and do not alter the budget,
// power model, Quest achievements or skill verification.
import { CASE_BUILD_SITES, visualTone } from "./feedback.mjs";
import { getChoice } from "./cases.mjs";
import { choiceStructure, deriveBuilderCity } from "./city-growth.mjs";

export function createCaseSceneEffects({ T, scene, box, cyl, mat }) {
  const effects = new Map();
  function build(spec) {
    const group = new T.Group();
    group.position.set(spec.x, 0.12, spec.z);
    group.userData.ignoreNavigation = true;
    scene.add(group);
    const B = (w, h, d, color, x, y, z) => {
      const m = box(w, h, d, color, x, y, z, group);
      m.userData.ignoreNavigation = true;
      return m;
    };
    const C = (radius, height, color, x, y, z, sides = 12) => {
      const m = cyl(radius, height, color, x, y, z, group, radius, sides);
      m.userData.ignoreNavigation = true;
      return m;
    };
    B(1.25, 0.14, 1.25, 0xada38c, 0, 0.06, 0);
    // Each theme yields a recognizable physical construction in the city.
    switch (spec.kind) {
      case "queue":
        B(1.08, 0.74, 0.1, 0x5f7d85, 0, 0.78, -0.37);
        for (let i = 0; i < 3; i++)
          B(0.19, 0.18, 0.22, 0xe2b96d, -0.37 + i * 0.37, 0.55, 0.15);
        break;
      case "shelves":
        for (let y of [0.34, 0.74, 1.13]) B(1.1, 0.1, 0.75, 0x967955, 0, y, 0);
        for (let x of [-0.48, 0.48]) B(0.08, 1.16, 0.75, 0x63727a, x, 0.64, 0);
        for (let i = 0; i < 3; i++)
          B(0.2, 0.18, 0.24, 0xd8a65e, -0.36 + i * 0.36, 0.46, 0);
        break;
      case "practice":
      case "access":
        B(1.0, 0.12, 0.75, 0x9d7757, 0, 0.78, 0);
        for (const x of [-0.4, 0.4])
          B(0.1, 0.68, 0.12, 0x626f6d, x, 0.44, 0.23);
        for (let i = 0; i < 3; i++)
          B(
            0.21,
            0.12,
            0.28,
            [0x52849e, 0xe2c06b, 0x8fa86f][i],
            -0.31 + 0.31 * i,
            0.91,
            -0.08,
          );
        break;
      case "recycling":
      case "sorting":
        for (let i = 0; i < 3; i++) {
          const x = -0.38 + i * 0.38;
          B(0.3, 0.53, 0.39, [0x5e9e8b, 0xbca15a, 0x8293aa][i], x, 0.43, 0);
          B(0.37, 0.08, 0.43, 0x596a66, x, 0.73, 0);
        }
        break;
      case "battery":
      case "clinic":
        for (let i = 0; i < 3; i++) {
          const x = -0.35 + i * 0.35;
          B(0.26, 0.8, 0.39, 0x608a9a, x, 0.57, 0);
          B(0.22, 0.12, 0.4, 0xb7d6bd, x, 0.82, 0.04);
        }
        if (spec.kind === "clinic") {
          B(0.62, 0.12, 0.12, 0xd86062, 0, 1.2, 0.01);
          B(0.12, 0.62, 0.12, 0xd86062, 0, 1.2, 0.01);
        }
        break;
      case "service":
        B(0.9, 0.86, 0.18, 0x8a958a, 0, 0.63, -0.18);
        C(0.28, 0.16, 0xd7b879, 0, 0.72, 0.05);
        B(0.63, 0.08, 0.1, 0xe5e2d3, 0, 1.03, -0.05);
        break;
      case "meter":
      case "feedback":
        B(1.0, 1.15, 0.12, 0x465e71, 0, 0.76, 0);
        for (let i = 0; i < 4; i++) {
          B(
            0.16,
            0.15 + i * 0.13,
            0.15,
            [0x6eab8e, 0xebc875, 0x84a6bf, 0xd7a17f][i],
            -0.36 + i * 0.24,
            0.48,
            0.13,
          );
        }
        break;
      case "crate":
        for (let i = 0; i < 4; i++) {
          B(
            0.42,
            0.28,
            0.43,
            0xa87c50,
            (i % 2) * 0.45 - 0.23,
            0.31 + Math.floor(i / 2) * 0.33,
            0,
          );
          B(
            0.3,
            0.06,
            0.3,
            0x86a46b,
            (i % 2) * 0.45 - 0.23,
            0.5 + Math.floor(i / 2) * 0.33,
            0,
          );
        }
        break;
      case "payments":
        B(1.1, 0.72, 0.52, 0x987557, 0, 0.47, 0);
        for (let i = 0; i < 4; i++)
          C(0.11, 0.07, 0xe1bc67, -0.37 + i * 0.23, 0.92, 0.02);
        break;
      case "route":
        B(1.1, 0.09, 0.75, 0x77848a, 0, 0.27, 0);
        for (const z of [-0.2, 0.2]) B(0.68, 0.04, 0.07, 0xece2bf, 0, 0.34, z);
        B(0.07, 1.14, 0.07, 0x6b6b67, 0.33, 0.69, -0.25);
        B(0.6, 0.35, 0.07, 0x6f91aa, 0.16, 1.14, -0.25);
        break;
      case "fractions":
        B(1.15, 1.12, 0.13, 0x527e7f, 0, 0.75, 0);
        for (let i = 0; i < 4; i++)
          B(
            0.18,
            0.21,
            0.09,
            [0xf3dca0, 0xeee4c9, 0xf3dca0, 0xeee4c9][i],
            (i % 2) * 0.24 - 0.13,
            0.66 + Math.floor(i / 2) * 0.25,
            0.1,
          );
        break;
      case "lights":
        B(0.11, 1.35, 0.11, 0x63727a, 0, 0.76, 0);
        B(0.8, 0.12, 0.4, 0xb9baaa, 0, 1.44, 0);
        B(0.66, 0.08, 0.28, 0xf2d486, 0, 1.36, 0);
        break;
      default:
        B(1, 0.7, 0.7, 0x78988d, 0, 0.48, 0);
    }
    // Three truly different structures for each authored choice. This changes
    // the skyline, capacity illusion and resident activity—not just its colour.
    const variants = new Map();
    const buildChoice = (caseId, choiceId) => {
      const appearance = choiceStructure(caseId, choiceId);
      const alt = new T.Group();
      group.add(alt);
      const V = (w, h, d, color, x, y, z) => {
        const m = box(w, h, d, color, x, y, z, alt);
        m.userData.ignoreNavigation = true;
        return m;
      };
      const Vc = (rad, h, color, x, y, z) => {
        const m = cyl(rad, h, color, x, y, z, alt);
        m.userData.ignoreNavigation = true;
        return m;
      };
      if (appearance.variant === "coordinated") {
        // A finished, staffed, walkable facility: shelter, equipment and greenery.
        for (const x of [-0.5, 0.5]) {
          V(0.1, 1.25, 0.12, 0x54766c, x, 0.73, -0.42);
          V(0.1, 1.25, 0.12, 0x54766c, x, 0.73, 0.35);
        }
        V(1.42, 0.18, 1.18, 0x4b8e8d, 0, 1.42, -0.03);
        V(0.9, 0.42, 0.55, 0xd3b77f, 0, 0.5, -0.07);
        for (let i = 0; i < 3; i++)
          V(0.2, 0.2, 0.24, 0x81a5c5, -0.32 + i * 0.32, 0.82, -0.04);
        Vc(0.14, 0.3, 0x719459, 0.53, 0.39, 0.42);
        const worker = new T.Group();
        alt.add(worker);
        const body = new T.Mesh(
          new T.CylinderGeometry(0.12, 0.16, 0.45, 7),
          mat(0x527ca3),
        );
        body.position.y = 0.52;
        worker.add(body);
        const head = new T.Mesh(
          new T.SphereGeometry(0.14, 8, 6),
          mat(0x9e7158),
        );
        head.position.y = 0.83;
        worker.add(head);
        worker.position.set(-0.6, 0, 0.37);
        worker.userData.ignoreNavigation = true;
        alt.userData.worker = worker;
      } else if (appearance.variant === "overloaded") {
        // Oversized uncoordinated expansion: many structures, blocked access.
        for (let i = 0; i < 3; i++) {
          const x = -0.4 + i * 0.43;
          V(
            0.38,
            1.1 + i * 0.32,
            0.58,
            [0xbb895b, 0xbba38d, 0x9b817c][i],
            x,
            0.66 + i * 0.16,
            -0.08,
          );
          V(0.36, 0.12, 0.1, 0x4d5864, x, 1.19 + i * 0.32, 0.27);
        }
        V(1.55, 0.12, 0.43, 0xb96950, 0, 0.2, 0.46);
        for (let j = 0; j < 3; j++)
          V(0.25, 0.28, 0.22, 0xd1a76d, -0.46 + j * 0.41, 0.5, 0.43);
        V(0.14, 1.92, 0.13, 0x6d6770, 0.67, 1.12, -0.26);
      } else {
        // Underused / risky plan: an incomplete frame and idle equipment.
        for (const x of [-0.48, 0.48]) {
          for (const z of [-0.36, 0.35])
            V(0.08, 1.18, 0.09, 0x8d6f5f, x, 0.74, z);
        }
        V(1.14, 0.11, 0.79, 0x95887a, 0, 1.36, 0);
        V(0.72, 0.42, 0.55, 0xa96e5c, 0.12, 0.47, -0.04);
        for (let j = 0; j < 3; j++)
          V(0.25, 0.26, 0.24, 0x77736d, -0.4 + j * 0.29, 0.31, 0.42);
        // Clear caution barrier: a poor choice is not represented as success.
        for (const x of [-0.54, 0, 0.54])
          V(0.12, 0.54, 0.12, 0xce8e50, x, 0.44, 0.6);
        V(1.23, 0.12, 0.12, 0xce8e50, 0, 0.65, 0.6);
      }
      alt.visible = false;
      variants.set(choiceId, alt);
    };
    // Build only the selected variant; avoid loading all 48 3D alternatives on low-end phones.
    const light = B(1.28, 0.12, 0.14, 0x709e7b, 0, 0.18, 0.57);
    const flag = C(0.15, 0.19, 0x709e7b, 0.43, 1.37, 0.44);
    const halo = new T.Mesh(
      new T.RingGeometry(0.8, 0.87, 28),
      new T.MeshBasicMaterial({
        color: 0xf2db9f,
        transparent: true,
        opacity: 0.85,
        side: T.DoubleSide,
      }),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.set(0, 0.12, 0);
    halo.userData.ignoreNavigation = true;
    group.add(halo);
    group.visible = false;
    return {
      group,
      light,
      flag,
      halo,
      variants,
      buildChoice,
      choiceId: null,
      started: 0,
    };
  }
  for (const [id, spec] of Object.entries(CASE_BUILD_SITES)) {
    effects.set(id, build({ ...spec, caseId: id }));
  }
  // A district-wide civic site expands as its actual fictional service
  // health improves. Residents are visibly active, idle or absent.
  const hubSites = {
    workshop: { x: -0.15, z: -5.8 },
    power: { x: 6.45, z: -7.9 },
    market: { x: 19.6, z: 12.2 },
    school: { x: -10.4, z: 11.6 },
  };
  const hubs = new Map();
  for (const [id, anchor] of Object.entries(hubSites)) {
    const hub = new T.Group();
    hub.position.set(anchor.x, 0.16, anchor.z);
    hub.userData.ignoreNavigation = true;
    scene.add(hub);
    const base = box(1.2, 0.17, 1.1, 0x888b80, 0, 0.09, 0, hub);
    base.userData.ignoreNavigation = true;
    const tower = box(0.72, 0.58, 0.62, 0x638e9c, 0, 0.52, 0, hub);
    tower.userData.ignoreNavigation = true;
    const roof = box(1.07, 0.12, 0.83, 0x99a977, 0, 0.93, 0, hub);
    roof.userData.ignoreNavigation = true;
    const workers = [];
    for (let i = 0; i < 2; i++) {
      const p = new T.Group();
      const shirt = new T.Mesh(
        new T.CylinderGeometry(0.1, 0.14, 0.32, 6),
        mat(i ? 0xba865b : 0x6987ac),
      );
      shirt.position.y = 0.35;
      p.add(shirt);
      const head = new T.Mesh(
        new T.SphereGeometry(0.115, 7, 6),
        mat(i ? 0x88654e : 0xb88a63),
      );
      head.position.y = 0.62;
      p.add(head);
      p.userData.ignoreNavigation = true;
      hub.add(p);
      workers.push(p);
    }
    hub.visible = false;
    hubs.set(id, {
      hub,
      tower,
      roof,
      workers,
      activity: "waiting",
      service: 0,
    });
  }
  const palette = { improving: 0x6bab85, mixed: 0xe0bd65, strained: 0xcf7963 };
  function sync(decisions, preview = null) {
    const city = deriveBuilderCity(decisions);
    for (const [id, item] of hubs) {
      const d = city.districts[id];
      item.hub.visible = d.built > 0;
      item.activity = d.activity;
      item.service = d.service;
      const strength = d.service / 100;
      item.tower.scale.y = 0.7 + strength * 1.1;
      item.tower.position.y = 0.52 + (item.tower.scale.y - 1) * 0.29;
      const colour =
        d.activity === "thriving"
          ? 0x4a947f
          : d.activity === "active"
            ? 0xddb668
            : 0xb47567;
      item.tower.material = mat(colour);
      item.roof.material = mat(colour);
      item.workers[0].visible = d.activity !== "waiting";
      item.workers[1].visible = d.activity === "thriving";
    }
    for (const [id, effect] of effects) {
      const choiceId =
        preview?.caseId === id ? preview.choiceId : decisions[id];
      const changed = effect.choiceId !== choiceId;
      effect.choiceId = choiceId;
      effect.group.visible = Boolean(choiceId);
      if (choiceId && !effect.variants.has(choiceId))
        effect.buildChoice(id, choiceId);
      for (const [variantId, variant] of effect.variants)
        variant.visible = variantId === choiceId;
      if (!choiceId) continue;
      const option = getChoice(id, choiceId);
      const toneName = visualTone(option);
      if (changed) {
        effect.started = performance.now();
        effect.group.scale.set(0.85, 0.06, 0.85);
      }
      if (toneName) {
        effect.light.material = mat(palette[toneName]);
        effect.flag.material = mat(palette[toneName]);
      }
    }
  }
  function setTone(caseId, option) {
    const e = effects.get(caseId);
    if (!e || !option) return;
    const color = palette[visualTone(option)];
    e.light.material = mat(color);
    e.flag.material = mat(color);
  }
  function animate(now, reducedMotion) {
    for (const item of hubs.values()) {
      if (!item.hub.visible) continue;
      item.workers.forEach((person, i) => {
        if (!person.visible) return;
        const angle =
          now / (item.activity === "thriving" ? 1300 : 3100) + i * Math.PI;
        person.position.set(Math.cos(angle) * 0.8, 0.0, Math.sin(angle) * 0.7);
        person.rotation.y = angle + Math.PI / 2;
        if (reducedMotion) person.position.y = 0;
        else person.position.y = Math.abs(Math.sin(now / 240 + i)) * 0.025;
      });
    }
    for (const effect of effects.values()) {
      if (!effect.group.visible) continue;
      const t = Math.max(0, Math.min(1, (now - effect.started) / 1000));
      const e = reducedMotion ? 1 : 1 - (1 - t) ** 3;
      effect.group.scale.set(1, Math.max(0.06, e), 1);
      effect.halo.scale.setScalar(
        reducedMotion ? 1 : 1 + Math.sin(t * Math.PI) * 0.8,
      );
      const chosen = effect.variants.get(effect.choiceId);
      if (chosen?.userData.worker && !reducedMotion) {
        chosen.userData.worker.position.x = -0.6 + Math.sin(now / 650) * 0.12;
        chosen.userData.worker.rotation.y = Math.sin(now / 1050) * 0.18;
      }
      effect.halo.material.opacity = reducedMotion
        ? 0.2
        : t < 1
          ? 0.75 * (1 - t)
          : 0.08;
    }
  }
  return { sync, setTone, animate, effects, hubs };
}
