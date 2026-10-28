// Low-poly but richly planted, lightweight living city.
// Decorative entities never participate in avatar collision/navigation.
import { CITY_DISTRICTS } from "./districts.mjs";
import { deriveLivingCity } from "./living-city.mjs";
import { CITY_REQUESTS } from "./opportunities.mjs";

export function createLivingCityScene({
  T,
  scene,
  box,
  cyl,
  mat,
  lowPower = false,
}) {
  const plazas = new Map();
  const pedestrians = new Map();
  const vehicles = [];
  const enterpriseStand = new T.Group();
  enterpriseStand.userData.ignoreNavigation = true;
  enterpriseStand.visible = false;
  scene.add(enterpriseStand);
  const ownedWorkers = [];
  const ownedCustomers = [];
  const requestMarkers = new Map();
  function harmless(mesh) {
    mesh.userData.ignoreNavigation = true;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    return mesh;
  }
  function B(parent, w, h, d, color, x, y, z) {
    return harmless(box(w, h, d, color, x, y, z, parent));
  }
  function C(parent, r, h, color, x, y, z, r2 = r, sides = 8) {
    return harmless(cyl(r, h, color, x, y, z, parent, r2, sides));
  }
  // Colour and shade are installed across the entire map from the start.
  // A warm gathering place, planted borders and flower beds make each
  // neighbourhood distinct without constructing fake project outcomes.
  for (let i = 0; i < CITY_DISTRICTS.length; i++) {
    const district = CITY_DISTRICTS[i];
    const root = new T.Group();
    root.position.set(district.x + 5.3, 0, district.z + 4.3);
    root.userData.ignoreNavigation = true;
    scene.add(root);
    const plants = [0x82a67b, 0x638e78, 0x73977f, 0xa3b27f];
    B(root, 2.7, 0.045, 2.2, 0xd9cfb6, 0, 0.16, 0);
    for (const sign of [-1, 1]) {
      B(root, 0.51, 0.28, 1.5, 0x9e8266, sign * 1.08, 0.29, 0);
      for (let p = 0; p < 3; p++) {
        const flower = new T.Mesh(
          new T.IcosahedronGeometry(0.19, 0),
          mat([0xdcae8e, 0xd2b471, 0xc0a3b9][(i + p) % 3]),
        );
        flower.position.set(sign * 1.08, 0.52, -0.48 + p * 0.46);
        harmless(flower);
        root.add(flower);
      }
    }
    // A small canopy and courtyard lighting. No heavy shadow casters.
    C(root, 0.1, 1.7, 0x7d735f, 0, 1.01, -0.55);
    for (const [x, z, radius] of [
      [0, -0.6, 0.65],
      [-0.4, -0.2, 0.52],
      [0.4, -0.2, 0.52],
    ]) {
      const foliage = new T.Mesh(
        new T.IcosahedronGeometry(radius, 0),
        mat(plants[(i + Math.round(x * 3) + 4) % plants.length]),
      );
      foliage.position.set(x, 1.96, z);
      harmless(foliage);
      root.add(foliage);
    }
    const built = new T.Group();
    built.userData.ignoreNavigation = true;
    root.add(built);
    B(built, 1.25, 0.12, 0.45, 0x9b7961, 0, 0.42, 0.68);
    for (const x of [-0.49, 0.49])
      B(built, 0.1, 0.3, 0.1, 0x71685a, x, 0.26, 0.68);
    C(built, 0.05, 1.66, 0x566674, 0.92, 1.02, 0.64);
    const lantern = new T.Mesh(
      new T.SphereGeometry(0.18, 6, 4),
      new T.MeshBasicMaterial({ color: 0xf2d593 }),
    );
    lantern.position.set(0.92, 1.91, 0.64);
    harmless(lantern);
    built.add(lantern);
    built.visible = false;
    plazas.set(district.id, { built, lantern });
    const walkers = [];
    for (let j = 0; j < (lowPower ? 1 : 2); j++) {
      const person = new T.Group();
      person.userData.ignoreNavigation = true;
      const shirt = [0x6f8bb1, 0xc78b64, 0x6e9c90, 0xba9e6b, 0x946e9e][
        (i + j) % 5
      ];
      C(person, 0.11, 0.34, shirt, 0, 0.48, 0, 0.15, 7);
      const skin = [0x895d48, 0xc49670, 0x6d4938, 0xa47256][(i + j) % 4];
      const head = new T.Mesh(new T.SphereGeometry(0.115, 7, 5), mat(skin));
      head.position.y = 0.75;
      harmless(head);
      person.add(head);
      for (const dx of [-0.065, 0.065])
        B(person, 0.085, 0.29, 0.095, 0x485768, dx, 0.18, 0);
      person.position.set(
        district.x - 3.4 - j * 0.52,
        0.11,
        district.z + 3.1 - j * 0.55,
      );
      person.visible = false;
      scene.add(person);
      walkers.push(person);
    }
    pedestrians.set(district.id, walkers);
  }
  const colours = [0xb58e59, 0x63959b, 0xc77b60, 0x8c9e75, 0x6e83a8];
  for (let i = 0; i < (lowPower ? 3 : 5); i++) {
    const g = new T.Group();
    g.userData.ignoreNavigation = true;
    scene.add(g);
    B(g, 1.04, 0.42, 1.45, colours[i], 0, 0.48, 0);
    B(g, 0.93, 0.13, 0.72, 0xd8c3a0, 0, 0.75, -0.18);
    B(g, 0.65, 0.48, 0.47, 0xe2c8a4, 0, 0.78, 0.56);
    B(g, 0.5, 0.27, 0.06, 0x608e9e, 0, 0.83, 0.81);
    for (const x of [-0.55, 0.55])
      for (const z of [-0.46, 0.46]) {
        const wheel = C(g, 0.17, 0.1, 0x34454c, x, 0.21, z, 0.17, 8);
        wheel.rotation.z = Math.PI / 2;
      }
    g.visible = false;
    vehicles.push({ g, route: null });
  }
  // One lightweight, reusable enterprise stall, rather than new geometry
  // every day. It moves to the actual district the learner has chosen.
  B(enterpriseStand, 2.5, 0.17, 1.75, 0x9e7851, 0, 0.25, 0);
  B(enterpriseStand, 2.8, 0.15, 2.05, 0x4d8090, 0, 2.12, 0);
  for (const x of [-1.05, 1.05])
    for (const z of [-0.65, 0.65])
      C(enterpriseStand, 0.07, 1.85, 0x7b694e, x, 1.18, z);
  B(enterpriseStand, 1.35, 0.7, 0.42, 0xc7aa7e, 0, 0.69, 0.6);
  B(enterpriseStand, 0.6, 0.5, 0.45, 0x7fa1a0, -0.6, 0.68, 0);
  B(enterpriseStand, 0.45, 0.4, 0.45, 0xe4bb73, 0.5, 0.62, 0);
  function smallPerson(color, x, z) {
    const figure = new T.Group();
    figure.userData.ignoreNavigation = true;
    C(figure, 0.14, 0.49, color, 0, 0.52, 0, 0.15, 7);
    const head = new T.Mesh(new T.SphereGeometry(0.15, 7, 5), mat(0xa87c5b));
    head.position.y = 0.93;
    harmless(head);
    figure.add(head);
    for (const offset of [-0.08, 0.08])
      B(figure, 0.09, 0.28, 0.1, 0x41515a, offset, 0.19, 0);
    figure.position.set(x, 0.12, z);
    enterpriseStand.add(figure);
    return figure;
  }
  for (let i = 0; i < (lowPower ? 1 : 3); i++)
    ownedWorkers.push(smallPerson(0x659c75, -0.7 + i * 0.65, 1.15));
  for (let i = 0; i < (lowPower ? 1 : 2); i++)
    ownedCustomers.push(smallPerson(0xb97c5e, 1.7 + i * 0.45, 1.2));

  // Four small, reused street-side status lamps. Amber means someone
  // is still waiting; green means a real day's requests were met.
  // They never create collision or new simulated demand.
  for (const request of CITY_REQUESTS) {
    const district = CITY_DISTRICTS.find((site) => site.id === request.district);
    if (!district) continue;
    const lamp = new T.Group();
    lamp.userData.ignoreNavigation = true;
    lamp.position.set(district.x + 5.1, 0, district.z + 3.6);
    B(lamp, 0.12, 2.25, 0.12, 0x6f756b, 0, 1.13, 0);
    const light = new T.Mesh(
      new T.SphereGeometry(0.39, 8, 6),
      new T.MeshBasicMaterial({ color: 0x5b987a }),
    );
    light.position.y = 2.4;
    harmless(light);
    lamp.add(light);
    lamp.visible = false;
    scene.add(lamp);
    requestMarkers.set(request.id, { lamp, light });
  }

  let latest = null;
  function sync(decisions, economy = null) {
    latest = deriveLivingCity(decisions, economy);
    for (const district of latest.districts) {
      const courtyard = plazas.get(district.id);
      courtyard.built.visible = district.built > 0;
      courtyard.lantern.material.color.setHex(
        district.activity === "thriving"
          ? 0xf5d680
          : district.activity === "struggling"
            ? 0xd38d70
            : 0xe4bb8a,
      );
      const walkers = pedestrians.get(district.id);
      walkers.forEach((p, i) => {
        p.visible = i < district.residents;
      });
    }
    for (const request of CITY_REQUESTS) {
      const marker = requestMarkers.get(request.id);
      if (!marker) continue;
      const signal = latest.requestSignals.find((item) => item.id === request.id);
      marker.lamp.visible = Boolean(signal && signal.requested > 0);
      if (signal)
        marker.light.material.color.setHex(
          signal.waiting > 0 ? 0xd28a43 : 0x4aa47a,
        );
    }
    const owner = latest.enterpriseActivity;
    const district =
      owner && CITY_DISTRICTS.find((site) => site.id === owner.district);
    enterpriseStand.visible = Boolean(district);
    if (district) {
      enterpriseStand.position.set(district.x + 6.6, 0, district.z + 4.8);
      ownedWorkers.forEach((person, i) => {
        person.visible = i < owner.workers;
      });
      ownedCustomers.forEach((person, i) => {
        person.visible = i < owner.customers;
      });
    }
    vehicles.forEach((item, i) => {
      const delivery = latest.deliveries[i];
      item.route = delivery ?? null;
      item.g.visible = Boolean(delivery);
    });
    return latest;
  }
  function sample(path, progress) {
    const lengths = [];
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      const n = Math.hypot(
        path[i].x - path[i - 1].x,
        path[i].z - path[i - 1].z,
      );
      lengths.push(n);
      total += n;
    }
    if (!total) return null;
    const t = ((progress % (2 * total)) + 2 * total) % (2 * total);
    let remaining = t > total ? 2 * total - t : t;
    const backwards = t > total;
    for (let i = 0; i < lengths.length; i++) {
      if (remaining <= lengths[i] || i === lengths.length - 1) {
        const a = path[i],
          b = path[i + 1];
        const u = lengths[i] ? Math.min(1, remaining / lengths[i]) : 0;
        return {
          x: a.x + (b.x - a.x) * u,
          z: a.z + (b.z - a.z) * u,
          angle: Math.atan2(b.x - a.x, b.z - a.z) + (backwards ? Math.PI : 0),
        };
      }
      remaining -= lengths[i];
    }
    return null;
  }
  function animate(now, reduceMotion, inactive = false) {
    if (!latest || inactive) return;
    for (let d = 0; d < latest.districts.length; d++) {
      const site = latest.districts[d];
      if (!site.residents) continue;
      for (let i = 0; i < site.residents; i++) {
        const p = pedestrians.get(site.id)[i];
        const phase =
          now / (site.activity === "thriving" ? 1400 : 2700) +
          d * 1.9 +
          i * 1.5;
        const original = CITY_DISTRICTS[d];
        p.position.set(
          original.x -
            3.4 -
            i * 0.52 +
            (reduceMotion ? 0 : Math.cos(phase) * 0.55),
          0.11 + (reduceMotion ? 0 : Math.abs(Math.sin(phase * 2)) * 0.018),
          original.z +
            3.1 -
            i * 0.55 +
            (reduceMotion ? 0 : Math.sin(phase) * 0.35),
        );
        p.rotation.y = reduceMotion ? 0 : phase + Math.PI / 2;
      }
    }
    // Visitors approach the founder's kiosk only when a real completed day
    // records customers; reduced motion leaves them standing in place.
    if (enterpriseStand.visible) {
      ownedCustomers.forEach((person, i) => {
        if (!person.visible) return;
        const phase = now / 1600 + i * 1.8;
        person.position.x = reduceMotion
          ? 1.5 + i * 0.45
          : 1.45 + i * 0.45 - Math.abs(Math.sin(phase)) * 0.8;
        person.rotation.y = reduceMotion ? 0 : Math.sin(phase) * 0.25;
      });
    }
    vehicles.forEach(({ g, route }, i) => {
      if (!route) return;
      const travelled = reduceMotion
        ? route.speed * (i + 1) * 6
        : now * 0.001 * route.speed + i * 11.3;
      const point = sample(route.path, travelled);
      if (!point) return;
      g.position.set(point.x, 0.01, point.z);
      g.rotation.y = point.angle;
    });
  }
  return { sync, animate, plazas, pedestrians, vehicles, requestMarkers };
}
