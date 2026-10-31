// Decorative only: inexpensive 3D meshes, zero new network requests,
// no collision blockers, and no effect on simulation or city performance.
import { BUILDER_ITEMS, sanitizeBuilderRewards } from "./builder-rewards.mjs";

export function createBuilderCosmetics({ T, plazas, player, lowPower = false }) {
  const cityObjects = new Map();
  const wearableObjects = new Map();
  const material = (color) => new T.MeshStandardMaterial({ color, roughness: 0.82 });
  function group() {
    const root = new T.Group();
    root.userData.ignoreNavigation = true;
    root.visible = false;
    return root;
  }
  function cube(parent, w, h, d, color, x, y, z) {
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), material(color));
    mesh.position.set(x, y, z);
    mesh.userData.ignoreNavigation = true;
    parent.add(mesh);
    return mesh;
  }
  function cylinder(parent, top, bottom, h, color, x, y, z, sides = 8) {
    const mesh = new T.Mesh(new T.CylinderGeometry(top, bottom, h, sides), material(color));
    mesh.position.set(x, y, z);
    mesh.userData.ignoreNavigation = true;
    parent.add(mesh);
    return mesh;
  }
  function sphere(parent, radius, color, x, y, z) {
    const mesh = new T.Mesh(new T.IcosahedronGeometry(radius, lowPower ? 0 : 1), material(color));
    mesh.position.set(x, y, z);
    mesh.userData.ignoreNavigation = true;
    parent.add(mesh);
    return mesh;
  }
  function makeCityItem(id) {
    const g = group();
    const position = {
      flowers: [-2.25, 1.7], trees: [2.5, 1.2],
      benches: [-2.25, -1.6], lights: [2.6, -1.6], fountain: [0, -2.8],
    }[id];
    g.position.set(position[0], 0, position[1]);
    if (id === "flowers") {
      cube(g, 1.75, 0.12, 1.1, 0x876b49, 0, 0.19, 0);
      for (let i = 0; i < (lowPower ? 5 : 9); i++) {
        const x = (i % 3 - 1) * 0.48, z = (Math.floor(i / 3) - 1) * 0.3;
        cylinder(g, 0.035, 0.045, 0.35, 0x377d56, x, 0.4, z);
        sphere(g, 0.14, [0xe77c9b,0xf8d269,0xd5a1ef][i % 3], x, 0.62, z);
      }
    }
    if (id === "trees") {
      for (let i = 0; i < 2; i++) {
        const x = i ? 0.5 : -0.5;
        cylinder(g, 0.12, 0.18, 1.2, 0x836145, x, 0.7, 0);
        sphere(g, 0.62, 0x559563, x, 1.55, 0);
      }
    }
    if (id === "benches") {
      cube(g, 1.7, 0.17, 0.58, 0xb37c53, 0, 0.53, 0);
      cube(g, 1.7, 0.55, 0.13, 0xb37c53, 0, 0.84, -0.28);
      for (const x of [-0.66,0.66]) cube(g, 0.12, 0.5, 0.12, 0x4c5653, x, 0.27, 0);
    }
    if (id === "lights") {
      for (const x of [-0.6, 0.6]) {
        cylinder(g, 0.065, 0.09, 1.65, 0x52616e, x, 0.94, 0);
        sphere(g, 0.18, 0xffe7a2, x, 1.81, 0);
      }
    }
    if (id === "fountain") {
      cylinder(g, 0.9, 0.98, 0.3, 0x728f9d, 0, 0.24, 0, 12);
      cylinder(g, 0.69, 0.7, 0.035, 0x69c6dc, 0, 0.41, 0, 12);
      cylinder(g, 0.12, 0.16, 0.86, 0xb2bdc2, 0, 0.85, 0);
      sphere(g, 0.21, 0x69c6dc, 0, 1.34, 0);
    }
    return g;
  }
  for (const item of BUILDER_ITEMS.filter((i) => i.category === "city")) cityObjects.set(item.id, makeCityItem(item.id));
  function makeWearable(id) {
    const g = group();
    if (id === "helmet") {
      sphere(g, 0.245, 0xf4b948, 0, 1.89, 0);
      cube(g, 0.53, 0.065, 0.34, 0xe7a83a, 0, 1.82, 0.12);
    }
    if (id === "backpack") {
      cube(g, 0.39, 0.57, 0.27, 0x548e77, 0, 1.03, -0.31);
      cube(g, 0.31, 0.1, 0.11, 0xf0c16c, 0, 0.97, -0.47);
    }
    if (id === "jacket") {
      cylinder(g, 0.25, 0.31, 0.69, 0xaf6261, 0, 1.04, 0);
      for (const x of [-0.3,0.3]) cylinder(g, 0.09, 0.075, 0.46, 0xaf6261, x, 1.06, 0);
      cube(g, 0.065, 0.52, 0.025, 0xeed0ab, 0, 1.05, 0.255);
    }
    player.g.add(g);
    return g;
  }
  for (const item of BUILDER_ITEMS.filter((i) => i.category === "builder")) wearableObjects.set(item.id, makeWearable(item.id));
  function sync(value) {
    const rewards = sanitizeBuilderRewards(value);
    const purchased = new Map(rewards.purchases.map((p) => [p.id, p]));
    for (const [id, g] of cityObjects) {
      const purchase = purchased.get(id);
      const root = purchase && plazas.get(purchase.district)?.root;
      if (root && g.parent !== root) root.add(g);
      g.visible = Boolean(root);
    }
    for (const [id, g] of wearableObjects) g.visible = rewards.equipped.includes(id);
  }
  return { sync };
}
