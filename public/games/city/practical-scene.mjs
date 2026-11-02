import {
  PRACTICAL_OBJECTS,
  practicalCentre,
  practicalReport,
} from "./practical-missions.mjs";
// City-scale working props use the existing warm production palette.
export function drawPractical({
  root,
  mission: m,
  state: s,
  object,
  box,
  spawn,
  people,
  context = {},
}) {
  const c = practicalCentre(m),
    g = new root.constructor();
  g.position.set(c.x, 0, c.z);
  g.userData.practical = true;
  root.add(g);
  const b = (w, h, d, color, x, y, z) => box(g, w, h, d, color, x, y, z);
  const blue = 0x629b9f,
    gold = 0xd3b46c,
    wood = 0xb49464,
    green = 0x7d9c65,
    red = 0xb87259,
    cream = 0xe6d9b9;
  b(7.2, 0.08, 7.2, cream, 0, 0.25, 0);
  const used = s.used.length,
    good = s.done,
    report = practicalReport(m, s, context);
  const bin = (x, z, color, filled = false) => {
    b(1.25, 0.8, 1.25, color, x, 0.7, z);
    b(1.1, 0.09, 1.1, filled ? green : 0x485b5e, x, 1.15, z);
  };
  const desk = (x, z, color = wood) => {
    b(1.8, 0.18, 1.1, color, x, 1.15, z);
    for (const dx of [-0.7, 0.7]) b(0.12, 0.9, 0.12, wood, x + dx, 0.65, z);
  };
  const card = (x, z, color = blue) => b(0.65, 0.06, 0.45, color, x, 1.3, z);
  const crate = (x, z, color = wood, y = 0.65) => {
    b(0.85, 0.7, 0.85, color, x, y, z);
    for (const dx of [-0.3, 0.3]) b(0.06, 0.72, 0.88, cream, x + dx, y, z);
  };
  const line = (x, z, w, d, color = blue) => b(w, 0.04, d, color, x, 0.34, z);
  const person = (x, z, color) => {
    const p = spawn(c.x + x, c.z + z, color);
    if (p) people.push(p);
    return p;
  };
  if (["water", "compost", "recovery"].includes(m.kind)) {
    bin(-1.9, -1.5, blue, s.protected || s.organics || s.battery);
    bin(1.9, -1.5, green, s.plastic || s.board || s.shell);
    line(0, 1, 5.8, 0.5, s.drain || s.lane ? blue : red);
    if (!(s.drain || s.lane))
      for (let i = 0; i < 3; i++) crate(-1 + i, 1, red, 0.55);
    if (s.protected) b(3, 0.65, 0.15, gold, -1.2, 0.7, -0.1);
    if (s.quarantine || s.battery) bin(0, -2.7, red, true);
    if (s.collection) b(2.5, 0.8, 1.1, blue, 0, 0.8, 2.4);
    if (s.result && !s.done) line(0, 2.1, 5, 1.5, 0x83b4bd);
  } else if (["tickets", "orders", "accountability"].includes(m.kind)) {
    desk(-1.8, -1, blue);
    desk(1.8, -1, green);
    for (let i = 0; i < (s.a || s.water ? 1 : 0); i++) card(-1.8, -1, gold);
    for (let i = 0; i < (s.b || s.repair || s.path ? 1 : 0); i++)
      card(1.8, -1, gold);
    b(3.8, 1.4, 0.14, wood, 0, 1.4, 1.5);
    for (let i = 0; i < (s.board || s.receipts ? 4 : used ? 1 : 0); i++)
      b(0.55, 0.5, 0.06, green, -1.1 + i * 0.73, 1.55, 1.4);
    if (s.returned) crate(2, 2.3, green);
    person(-2.5, 2.5, blue);
    person(2.5, 2.5, green);
  } else if (["workshop", "fabrication"].includes(m.kind)) {
    desk(0, 0);
    b(2, 0.15, 1.1, blue, 0, 1.3, 0);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      b(
        0.24,
        0.25,
        0.25,
        s.gear || s.a ? gold : 0x8d9694,
        Math.sin(a) * 0.55,
        1.6,
        Math.cos(a) * 0.55,
      );
    }
    if (s.bearing || s.b) b(0.6, 0.3, 0.6, gold, 1, 1.5, 0);
    if (s.gauged) b(1.2, 0.1, 0.15, cream, -1.6, 1.4, -1);
    if (s.jig) b(1.1, 0.5, 1, green, -1.7, 0.7, 1.5);
    if (s.reserve) crate(2, 1.5, wood);
    if (s.done) line(0, 2.6, 3.5, 0.25, green);
  } else if (m.kind === "coldstore") {
    b(4.8, 2, 0.18, cream, 0, 1.3, -2);
    for (const x of [-2.3, 2.3]) b(0.18, 2, 3.5, cream, x, 1.3, -0.3);
    b(4.9, 0.14, 3.7, blue, 0, 2.4, -0.3);
    b(0.5, 0.9, 0.3, s.powered ? green : red, -1.7, 1, 1.5);
    if (s.a) crate(-0.9, -0.5, green);
    if (s.b) crate(0.9, -0.5, green);
    if (s.vehicle) b(2.3, 0.8, 1.3, blue, 0, 0.85, 2.5);
    if (s.dispatched) {
      crate(-0.5, 2.5, gold, 1.5);
      crate(0.5, 2.5, gold, 1.5);
    }
  } else if (["finance", "cashflow", "festival"].includes(m.kind)) {
    desk(0, 0);
    for (let i = 0; i < (s.cash ?? 0); i++)
      b(
        0.35,
        0.09,
        0.35,
        gold,
        -1 + (i % 4) * 0.55,
        1.3 + Math.floor(i / 4) * 0.12,
        0,
      );
    for (const [i, key] of [
      "small",
      "settled",
      "maker",
      "performer",
      "delivery",
      "repaid",
    ].entries())
      if (s[key])
        b(
          0.4,
          0.08,
          0.6,
          green,
          -1.8 + (i % 3) * 1.7,
          0.5,
          1.8 + Math.floor(i / 3) * 0.7,
        );
    if (s.stock || s.harvest) crate(-2, -1.8);
    if (s.invoice) b(1, 0.06, 0.7, cream, 2, 1.3, 0);
    if (m.kind === "festival") {
      b(4, 0.4, 1.4, wood, 0, 0.55, -2);
      if (s.stage) {
        person(-1, -2, blue);
        person(1, -2, red);
      }
    } else {
      person(-2.5, 2, green);
      person(2.5, 2, blue);
    }
  } else if (m.kind === "clinic") {
    for (const x of [-1.8, 1.8]) {
      b(1.8, 0.13, 1, wood, x, 1.1, -0.8);
      b(1.8, 0.13, 1, wood, x, 1.9, -0.8);
    }
    if (s.a) crate(-1.8, -0.8, cream, 1.52);
    if (s.b) crate(1.8, -0.8, cream, 1.52);
    bin(0, 2.1, red, s.quarantine);
    if (s.reorder) {
      desk(0, -2.5);
      card(0, -2.5, green);
    }
    b(0.9, 0.16, 0.3, red, 0, 2.5, -2.9);
    b(0.3, 0.16, 0.9, red, 0, 2.5, -2.9);
  } else if (m.kind === "access") {
    line(0, 0, 1.8, 6, 0xc8c9ad);
    if (!s.clear) b(2.7, 0.7, 0.65, wood, 0, 0.7, 0.4);
    else b(2.7, 0.7, 0.65, wood, 2.1, 0.7, 1.7);
    for (const [x, z, ready] of [
      [-1.5, 1.9, s.street],
      [1.5, -1.9, s.door],
    ])
      if (ready) {
        b(0.14, 2, 0.14, wood, x, 1.3, z);
        b(1.1, 0.5, 0.13, blue, x, 2.2, z);
      }
    desk(0, -2.6);
    if (s.desk) card(0, -2.6, green);
    if (s.done)
      for (let i = 0; i < 4; i++)
        person(-0.5 + (i % 2), -0.5 + Math.floor(i / 2), blue);
  } else if (m.kind === "fractions") {
    b(3.8, 0.15, 3.8, wood, 0, 0.55, 0);
    for (let i = 0; i < 4; i++) {
      const filled = s[["a", "b", "c", "d"][i]];
      b(
        1.65,
        0.16,
        1.65,
        filled ? gold : 0xaab7a7,
        (i % 2 ? 1 : -1) * 0.9,
        0.74,
        (i < 2 ? -1 : 1) * 0.9,
      );
    }
    if (!s.quarters) {
      b(s.halves ? 1.5 : 3.1, 0.2, 1.4, blue, 0, 0.55, 2.7);
      if (s.halves) b(1.4, 0.2, 1.4, blue, 1.6, 0.55, 2.7);
    }
    if (s.done) person(2.8, 2.5, green);
  } else if (m.kind === "learning") {
    desk(-1.7, 0);
    desk(1.7, 0);
    person(-1.7, 1.2, blue);
    person(1.7, 1.2, green);
    if (s.model) {
      for (let i = 0; i < 3; i++)
        b(0.35, 0.3 + i * 0.15, 0.35, gold, -2.2 + i * 0.5, 1.4 + i * 0.075, 0);
    }
    if (s.audio) b(0.65, 0.5, 0.4, blue, 1.7, 1.5, 0);
    if (s.independent)
      for (const x of [-1.7, 1.7]) b(0.7, 0.1, 0.6, green, x, 1.4, -0.5);
  } else if (m.kind === "network") {
    b(1.7, 2, 1.3, blue, 0, 1.3, -0.8);
    for (let i = 0; i < 3; i++)
      b(1.1, 0.2, 0.1, s.online ? green : red, 0, 0.8 + i * 0.55, -0.1);
    line(0, 1.6, 0.14, 2.7, s.online ? blue : 0x9a9183);
    bin(-2, 1.8, s.backup ? green : red);
    desk(2, 1.8);
    for (let i = 0; i < s.local; i++)
      card(1.6 + i * 0.7, 1.8, s.synced ? green : gold);
  } else if (m.kind === "media") {
    for (const [x, key] of [
      [-2, "market"],
      [2, "club"],
    ]) {
      b(0.15, 2, 0.15, wood, x, 1.3, 0);
      b(1.5, 1.2, 0.15, wood, x, 1.8, 0);
      if (s[key]) b(1.2, 0.9, 0.06, gold, x, 1.8, 0.12);
    }
    b(1, 1.5, 1, blue, 0, 1.1, -1.6);
    if (s.spoken)
      for (let i = 0; i < 3; i++)
        line(0, 1.3 + i * 0.5, 1 + i * 0.7, 0.1, gold);
    if (s.captions) b(2.6, 0.4, 0.12, cream, 0, 1.2, -0.9);
  } else if (m.kind === "logistics") {
    line(0, 0, 1.3, 6, 0x8e9589);
    line(1.8, 0, 1.2, 6, 0x8e9589);
    if (s.closed) b(1.6, 0.8, 0.16, red, 0, 0.8, 1);
    else line(0, 1.8, 1.3, 2, blue);
    if (s.bypass)
      for (const z of [-1.8, 0, 1.8]) b(0.15, 0.08, 0.6, cream, 1.8, 0.4, z);
    if (s.clinic) crate(-2, -1.8, cream);
    if (s.farm) crate(2, -1.8, green);
    b(1.5, 0.8, 1.1, blue, s.bypass ? 1.8 : 0, 0.8, 2);
  } else if (m.kind === "crossing") {
    line(0, 0, 6, 2.4, 0x8e9589);
    for (let i = 0; i < 6; i++) line(0, -1 + i * 0.4, 1.7, 0.18, cream);
    if (s.ramp) b(1.9, 0.13, 1.1, cream, 0, 0.4, 1.7);
    for (const x of [-2.5, 2.5]) {
      b(0.13, 2, 0.13, wood, x, 1.3, 0);
      b(0.4, 0.5, 0.4, s.held ? red : green, x, 2.3, 0);
      if (s.barriers) b(1, 0.8, 0.14, gold, x, 0.8, -1.5);
    }
    for (let i = 0; i < 3; i++) person(-1 + i, s.crossed ? -2.5 : 2.5, blue);
  } else if (m.kind === "council") {
    b(3.2, 0.2, 2.5, wood, 0, 1.2, 0);
    for (const [x, key] of [
      [-2, "trader"],
      [2, "youth"],
    ])
      if (s[key]) {
        b(0.8, 0.6, 0.8, blue, x, 0.65, 0);
        person(x, 1.1, green);
      }
    if (s.level) line(0, 2.5, 1.5, 1.2, 0xb8c0a4);
    if (s.proposals) for (let i = 0; i < 3; i++) card(-0.8 + i * 0.8, 0, gold);
    if (s.meeting) person(0, -2.2, blue);
  } else if (m.kind === "energy") {
    for (const [x, key] of [
      [-2, "clinic"],
      [0, "cooling"],
      [2, "workshopMidday"],
    ]) {
      b(1.3, 1.2, 1.3, s[key] ? blue : 0xa7a78e, x, 0.9, -1.5);
      line(x, 0.4, 0.12, 2, s[key] ? gold : 0xaaa68b);
    }
    for (let i = 0; i < (s.midday ?? 0); i++)
      b(0.48, 0.25, 0.45, i < 4 ? green : red, -1.8 + i * 0.56, 0.6, 1.6);
    bin(2.3, 2.2, s.storage ? green : red, s.storage);
    if (s.workshopEvening) line(1.3, 2.2, 1.5, 0.12, gold);
  } else if (m.kind === "maintenance") {
    for (const [i, key] of ["drain", "path", "garden"].entries()) {
      desk(-2 + i * 2, -1.2);
      if (s[key]) card(-2 + i * 2, -1.2, green);
    }
    bin(0, 2, gold, s.reserve);
    if (s.deputy) {
      person(-2, 2, blue);
      person(2, 2, green);
    }
  } else if (m.kind === "handover") {
    desk(0, 0);
    b(2, 0.8, 1.2, s.isolated ? blue : red, 0, 1.6, 0);
    if (s.shown) card(0, 0, gold);
    if (s.first) person(-2, 1, blue);
    if (s.second) person(2, 1, green);
    if (s.peer) line(0, 1.5, 3, 0.15, gold);
    if (s.drill) bin(0, -2.2, green, true);
    if (s.guide) b(1.7, 1, 0.2, green, 0, 1.4, 2.6);
  }
  // Every input is an actual ray-castable city object with a reachable approach.
  for (const spec of PRACTICAL_OBJECTS.filter((o) => o.extra === m.id)) {
    const a = m.actions.find((a) => a.id === spec.action),
      station = object(spec.id);
    const complete = s.used.includes(spec.action),
      test = spec.action === "test";
    const color = test
      ? s.result
        ? good
          ? green
          : red
        : gold
      : complete
        ? green
        : blue;
    box(station, 0.9, 0.65, 0.9, color, 0, 0.65, 0);
    box(station, 1.05, 0.1, 1.05, cream, 0, 1.03, 0);
    if (a?.effect.take && !complete)
      box(station, 0.6, 0.45, 0.6, gold, 0, 1.3, 0);
    if (a?.effect.put)
      box(station, 0.8, 0.07, 0.8, complete ? green : wood, 0, 1.13, 0);
    if (test) {
      box(station, 0.12, 1, 0.12, wood, 0, 1.6, 0);
      box(station, 0.65, 0.4, 0.12, color, 0.25, 2, 0);
    }
  }
  g.userData.outcome = report;
  g.userData.revealPieces = g.children
    .filter((p) => p.isMesh && p.position.y > 0.4)
    .map((p) => ({ mesh: p, scale: p.scale.y }));
  return g;
}
export function animatePractical(
  root,
  elapsed,
  revealProgress = 1,
  reduced = false,
) {
  for (const g of root.children)
    if (g.userData.practical) {
      for (const { mesh, scale } of g.userData.revealPieces ?? [])
        mesh.scale.y =
          scale * (reduced ? 1 : 0.85 + 0.15 * Math.min(1, revealProgress * 2));
      // The outcome remains readable without motion; no endless flashing effects.
      if (!reduced && g.userData.outcome?.success)
        g.rotation.y = Math.sin(elapsed * 0.7) * 0.008;
    }
}
