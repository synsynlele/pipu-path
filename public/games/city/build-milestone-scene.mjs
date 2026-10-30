// Small physical 3D structures earned by *working* network prototypes.
// Built in the existing city, at the corresponding district. No invented
// economy changes; no unrelated assets; no new pathfinding obstacles.
import { CITY_BUILD_MILESTONES } from "./build-milestones.mjs";
import { labMission, evaluateLab } from "./build-lab.mjs";
export function createMilestoneScene({ T, scene, box, cyl }) {
  const buildings = new Map();
  for (const m of CITY_BUILD_MILESTONES) {
    const g = new T.Group();
    g.name = "Built: " + m.title;
    g.position.set(m.x, 0.08, m.z);
    g.visible = false;
    const steel = 0x416b79,
      base = 0x396761,
      light = m.color;
    box(3.2, 0.25, 2.6, 0x526a72, 0, 0.22, 0, g);
    box(2.7, 0.12, 2.1, 0xe1d7b9, 0, 0.39, 0, g);
    for (const dx of [-1, 1]) {
      box(0.19, 2.0, 0.19, steel, dx, 1.45, -0.65, g);
    }
    box(2.8, 0.16, 1.9, steel, 0, 2.5, -0.2, g);
    box(1.5, 0.12, 0.8, 0x235e89, 0, 2.61, -0.2, g);
    box(0.9, 1.4, 0.64, base, 0, 1.13, 0.58, g);
    box(0.72, 0.36, 0.06, light, 0, 1.35, 0.92, g);
    if (m.type === "water") {
      cyl(0.7, 1.1, 0x4b9bc7, 1.0, 1.15, 0.5, g);
      cyl(0.75, 0.15, 0xb7e2e6, 1.0, 1.76, 0.5, g);
      box(1.2, 0.16, 0.2, light, -0.9, 0.7, 0.8, g);
    } else if (m.type === "services") {
      box(0.85, 1.15, 0.75, 0xb6d6bf, -0.8, 1.05, 0.7, g);
      box(0.8, 0.16, 0.07, light, -0.8, 1.45, 1.1, g);
      box(0.85, 0.55, 0.16, 0xe4b97d, 0.9, 1.1, 0.8, g);
    } else {
      box(0.86, 0.65, 0.4, 0xd7e7df, -0.85, 1.05, 0.8, g);
      cyl(0.26, 0.1, light, 0.9, 1.15, 0.72, g, 0.26, 12);
      box(0.45, 0.55, 0.38, 0x7fd3a9, 0.9, 0.78, 0.72, g);
    }
    // A private signal light on this exact 3D facility turns amber when
    // its connected fictional service is interrupted by a repair drill.
    const serviceLight = new T.Mesh(
      new T.SphereGeometry(0.22, 10, 8),
      new T.MeshBasicMaterial({ color: 0x4bf2bb }),
    );
    serviceLight.position.set(0, 2.91, 0);
    g.add(serviceLight);
    g.traverse((object) => {
      object.userData.ignoreNavigation = true;
      if (object.isMesh) object.castShadow = false;
    });
    scene.add(g);
    buildings.set(m.id, {
      group: g, serviceLight, ready: false, offline: false, revealedAt: 0,
    });
  }
  function sync(lab, at = performance.now()) {
    for (const m of CITY_BUILD_MILESTONES) {
      const build = buildings.get(m.id);
      const ready =
        Array.isArray(lab?.tested) &&
        lab.tested.includes(m.id) &&
        evaluateLab(labMission(m.id), lab?.boards?.[m.id]).success;
      if (ready && !build.ready) build.revealedAt = at;
      build.ready = ready;
      build.offline = ready && lab?.faults?.[m.id] != null;
      build.serviceLight.material.color.setHex(
        build.offline ? 0xea7840 : 0x4bf2bb,
      );
      build.group.visible = ready;
      if (!ready) build.group.scale.setScalar(1);
    }
  }
  function reveal(id, at = performance.now()) {
    const build = buildings.get(id);
    if (!build?.ready) return false;
    build.revealedAt = at;
    build.group.scale.setScalar(0.2);
    return true;
  }
  function animate(at, reducedMotion) {
    for (const build of buildings.values()) {
      if (!build.ready) continue;
      const t = reducedMotion
        ? 1
        : Math.min(1, Math.max(0, (at - build.revealedAt) / 1150));
      build.group.scale.setScalar(0.2 + 0.8 * (1 - Math.pow(1 - t, 3)));
      const pulse = build.offline && !reducedMotion
        ? 1 + Math.sin(at / 270) * 0.14
        : 1;
      build.serviceLight.scale.setScalar(pulse);
    }
  }
  return { sync, reveal, animate, buildings };
}
