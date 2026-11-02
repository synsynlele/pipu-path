import { EPISODE_OBJECTS } from "./builder-episode.mjs";
export function drawEpisode({
  root,
  state,
  objects,
  box,
  spawn,
  people,
  active = null,
}) {
  const create = (id) => {
    const s = EPISODE_OBJECTS.find((o) => o.id === id),
      g = new root.constructor();
    g.position.set(s.x, 0, s.z);
    g.userData.marketTarget = id;
    root.add(g);
    objects.set(id, g);
    return g;
  };
  if (!active || active === "investigate") {
    const tank = create("investigate:tank");
    box(tank, 2.3, 2.5, 2.1, 0x92b4c0, 0, 1.55, 0);
    box(tank, 2.1, 0.12, 1.9, 0x58a7bb, 0, 2.9, 0);
    const pump = create("investigate:pump");
    box(pump, 1.1, 1.1, 0.9, 0x63888f, 0, 0.8, 0);
    const valve = create("investigate:valve");
    box(
      valve,
      4.8,
      0.18,
      0.2,
      state.investigate.valveOpen ? 0x52abc2 : 0x9b9f8f,
      0,
      0.4,
      0,
    );
    const handle = box(valve, 0.6, 0.15, 0.15, 0xd0b46b, 0, 0.8, 0);
    handle.rotation.y = state.investigate.valveOpen ? Math.PI / 2 : 0;
    const tap = create("investigate:test");
    box(tap, 0.4, 1.1, 0.4, 0x657d87, 0, 0.85, 0);
    box(
      tap,
      1.3,
      0.06,
      1.1,
      state.investigate.valveOpen ? 0x67b5c5 : 0xbdad8b,
      0,
      0.3,
      0.8,
    );
    const resident = create("investigate:resident");
    box(resident, 1.5, 0.5, 0.55, 0xc4ab7b, 0, 0.5, 0);
    for (const [x, z, color] of [
      [-20.8, -29.5, 0xac7d66],
      [-19.4, -29.5, 0x759588],
    ]) {
      const p = spawn(x, z, color);
      if (p) people.push(p);
    }
  }
  if (!active || active === "care") {
    for (const [id, color] of [
      ["care:reception", 0x749eaa],
      ["care:support", 0x81a181],
      ["care:supplies", 0xc19d68],
      ["care:deliver", 0xa7b5a4],
      ["care:test", 0xd2b674],
    ]) {
      const g = create(id);
      box(
        g,
        id.includes("reception") || id.includes("support") ? 2.2 : 1,
        0.75,
        0.85,
        color,
        0,
        0.7,
        0,
      );
      if (id === "care:deliver")
        for (let i = 0; i < state.care.stock; i++)
          box(g, 0.6, 0.4, 0.6, 0xdbd4b1, i * 0.7, 0.98, 0);
    }
    for (let i = 0; i < 3; i++) {
      const reception = i < state.care.reception,
        p = spawn(
          (reception ? 14 : 21) +
            (reception ? i : i - state.care.reception) * 1.15,
          -24.9,
          reception ? 0x658da4 : 0x6a9b82,
        );
      if (p) people.push(p);
    }
    for (let i = 0; i < 4; i++) {
      const p = spawn(
        state.care.served > i ? 18 + i * 1.05 : 16 + i * 0.95,
        state.care.served > i ? -20 : -23.5,
        state.care.served > i ? 0x7b9e70 : 0xc69b73,
      );
      if (p) people.push(p);
    }
  }
  if (!active || active === "teach") {
    const bench = create("teach:demonstrate");
    box(bench, 2, 1, 0.9, 0xa17b58, 0, 0.8, 0);
    box(bench, 0.7, 0.12, 0.16, 0xe4c77f, -0.3, 1.4, 0);
    box(
      bench,
      0.7,
      0.12,
      0.16,
      0xe4c77f,
      0.3,
      1.4,
      state.teach.stable ? 0 : 0.4,
    );
    const tools = create("teach:tools");
    for (let i = 0; i < 3; i++)
      box(
        tools,
        0.2,
        0.2,
        0.5,
        0x728899,
        i * 0.35,
        0.7,
        state.teach.tools ? 0 : i * 0.3,
      );
    const jig = create("teach:jig");
    box(jig, 0.8, 0.2, 0.5, state.teach.jig ? 0x5fa18c : 0xa39b86, 0, 0.7, 0);
    const trial = create("teach:test");
    box(trial, 0.7, 0.6, 0.5, 0xcfb577, 0, 0.6, 0);
    const learner = spawn(-17, 7.4, 0xc49a61);
    if (learner) {
      learner.g.userData.apprentice = true;
      people.push(learner);
    }
    if (state.teach.stable) {
      box(bench, 1, 0.6, 0.7, 0xb88c54, 0, 1.75, 0);
      box(bench, 0.85, 0.08, 0.05, 0xe4cc8b, 0, 1.85, 0.38);
    }
  }
}
