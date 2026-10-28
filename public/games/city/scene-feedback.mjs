// Lightweight, authored decision landmarks for The Unbuilt City.
// These props are fiction-only visual effects and do not alter the budget,
// power model, Quest achievements or skill verification.
import { CASE_BUILD_SITES, visualTone } from "./feedback.mjs";
import { getChoice } from "./cases.mjs";

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
        for (let i = 0; i < 3; i++) B(0.19, 0.18, 0.22, 0xe2b96d, -0.37 + i * 0.37, 0.55, 0.15);
        break;
      case "shelves":
        for (let y of [0.34, 0.74, 1.13]) B(1.1, 0.1, 0.75, 0x967955, 0, y, 0);
        for (let x of [-0.48, 0.48]) B(0.08, 1.16, 0.75, 0x63727a, x, 0.64, 0);
        for (let i = 0; i < 3; i++) B(0.2, 0.18, 0.24, 0xd8a65e, -0.36 + i * 0.36, 0.46, 0);
        break;
      case "practice":
      case "access":
        B(1.0, 0.12, 0.75, 0x9d7757, 0, 0.78, 0);
        for (const x of [-0.4, 0.4]) B(0.1, 0.68, 0.12, 0x626f6d, x, 0.44, 0.23);
        for (let i = 0; i < 3; i++) B(0.21, 0.12, 0.28, [0x52849e, 0xe2c06b, 0x8fa86f][i], -0.31 + 0.31 * i, 0.91, -0.08);
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
          B(0.16, 0.15 + i * 0.13, 0.15, [0x6eab8e, 0xebc875, 0x84a6bf, 0xd7a17f][i], -0.36 + i * 0.24, 0.48, 0.13);
        }
        break;
      case "crate":
        for (let i = 0; i < 4; i++) {
          B(0.42, 0.28, 0.43, 0xa87c50, (i % 2) * 0.45 - 0.23, 0.31 + Math.floor(i / 2) * 0.33, 0);
          B(0.3, 0.06, 0.3, 0x86a46b, (i % 2) * 0.45 - 0.23, 0.5 + Math.floor(i / 2) * 0.33, 0);
        }
        break;
      case "payments":
        B(1.1, 0.72, 0.52, 0x987557, 0, 0.47, 0);
        for (let i = 0; i < 4; i++) C(0.11, 0.07, 0xe1bc67, -0.37 + i * 0.23, 0.92, 0.02);
        break;
      case "route":
        B(1.1, 0.09, 0.75, 0x77848a, 0, 0.27, 0);
        for (const z of [-0.2, 0.2]) B(0.68, 0.04, 0.07, 0xece2bf, 0, 0.34, z);
        B(0.07, 1.14, 0.07, 0x6b6b67, 0.33, 0.69, -0.25);
        B(0.6, 0.35, 0.07, 0x6f91aa, 0.16, 1.14, -0.25);
        break;
      case "fractions":
        B(1.15, 1.12, 0.13, 0x527e7f, 0, 0.75, 0);
        for (let i = 0; i < 4; i++) B(0.18, 0.21, 0.09, [0xf3dca0, 0xeee4c9, 0xf3dca0, 0xeee4c9][i], (i % 2) * 0.24 - 0.13, 0.66 + Math.floor(i / 2) * 0.25, 0.1);
        break;
      case "lights":
        B(0.11, 1.35, 0.11, 0x63727a, 0, 0.76, 0);
        B(0.8, 0.12, 0.4, 0xb9baaa, 0, 1.44, 0);
        B(0.66, 0.08, 0.28, 0xf2d486, 0, 1.36, 0);
        break;
      default:
        B(1, 0.7, 0.7, 0x78988d, 0, 0.48, 0);
    }
    const light = B(1.28, 0.12, 0.14, 0x709e7b, 0, 0.18, 0.57);
    const flag = C(0.15, 0.19, 0x709e7b, 0.43, 1.37, 0.44);
    const halo = new T.Mesh(
      new T.RingGeometry(0.8, 0.87, 28),
      new T.MeshBasicMaterial({ color: 0xf2db9f, transparent: true, opacity: 0.85, side: T.DoubleSide }),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.set(0, 0.12, 0);
    halo.userData.ignoreNavigation = true;
    group.add(halo);
    group.visible = false;
    return { group, light, flag, halo, choiceId: null, started: 0 };
  }
  for (const [id, spec] of Object.entries(CASE_BUILD_SITES)) {
    effects.set(id, build(spec));
  }
  const palette = { improving: 0x6bab85, mixed: 0xe0bd65, strained: 0xcf7963 };
  function sync(decisions, preview = null) {
    for (const [id, effect] of effects) {
      const choiceId = preview?.caseId === id ? preview.choiceId : decisions[id];
      const changed = effect.choiceId !== choiceId;
      effect.choiceId = choiceId;
      effect.group.visible = Boolean(choiceId);
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
    for (const effect of effects.values()) {
      if (!effect.group.visible) continue;
      const t = Math.max(0, Math.min(1, (now - effect.started) / 1000));
      const e = reducedMotion ? 1 : 1 - (1 - t) ** 3;
      effect.group.scale.set(1, Math.max(0.06, e), 1);
      effect.halo.scale.setScalar(reducedMotion ? 1 : 1 + Math.sin(t * Math.PI) * 0.8);
      effect.halo.material.opacity = reducedMotion ? 0.2 : t < 1 ? 0.75 * (1 - t) : 0.08;
    }
  }
  return { sync, setTone, animate, effects };
}
