import { SYSTEM_CHAPTERS } from "./builder-chapters.mjs";
import { CITY_PROJECTS, CONSTRUCTION_OBJECTS } from "./city-construction.mjs";
export const CHAPTER_OBJECTS = SYSTEM_CHAPTERS.flatMap((c) =>
  ["a", "b", "c", "test"].map((action, i) => {
    const template = CONSTRUCTION_OBJECTS.find(
      (o) =>
        o.id === c.site + ":" + ["base", "structure", "services", "open"][i],
    );
    return {
      id: `${c.id}:${action}`,
      system: c.id,
      action,
      name:
        action === "test"
          ? c.id === "environment"
            ? "Run the storm trial"
            : c.id === "legacy"
              ? "Test the city handover"
              : "Run the " + c.field.split(" & ")[0].toLowerCase() + " trial"
          : c.actions[i],
      x: template.x,
      z: template.z,
      approach: { ...template.approach },
    };
  }),
);
export function drawChapter({
  root,
  active,
  systems,
  objects,
  box,
  spawn,
  people,
}) {
  const chapter = SYSTEM_CHAPTERS.find((c) => c.id === active);
  if (!chapter) return;
  const site = CITY_PROJECTS.find((p) => p.id === chapter.site),
    s = systems[active];
  const g = new root.constructor();
  g.position.set(site.x, 0, site.z);
  root.add(g);
  const b = (w, h, d, color, x, y, z) => box(g, w, h, d, color, x, y, z);
  b(site.width, 0.06, site.depth, 0xd7d4b7, 0, 0.23, 0);
  // The activity is a full-sized city object, not a separate puzzle board.
  if (active === "food") {
    for (let i = 0; i < 3; i++) {
      b(1.1, 0.22, 4, s.a ? 0x78634a : 0xb79d7c, -2 + i * 2, 0.4, 0);
      for (let j = 0; j < 4; j++)
        b(
          0.4,
          s.result?.metrics.healthy ? 0.85 : 0.25,
          0.4,
          s.result?.metrics.healthy ? 0x679b53 : 0xa7a36a,
          -2 + i * 2,
          0.65,
          -1.4 + j * 0.9,
        );
    }
    b(6, 0.15, 0.18, s.b ? 0x60aabd : 0x879b9d, 0, 0.45, 2.3);
    if (s.c) {
      b(5.8, 0.13, 3.7, 0x9aaa88, 0, 2.5, 0);
      for (const x of [-2.7, 2.7]) b(0.13, 2.3, 0.13, 0x8d7857, x, 1.3, 0);
    }
  } else if (active === "invent") {
    b(3.2, 0.25, 1.8, 0xba9260, 0, 1, 0);
    for (let i = 0; i < s.a + 2; i++)
      b(
        0.35,
        0.7,
        0.45,
        0x46535c,
        (i % 2 ? 1 : -1) * 1.5,
        0.65,
        i < 2 ? -0.7 : 0.7,
      );
    if (s.b) {
      const brace = b(3.2, 0.15, 0.15, 0x758b91, 0, 1.15, 0);
      brace.rotation.y = 0.45;
    }
    for (let i = 0; i < s.c + 1; i++)
      b(0.7, 0.65, 0.7, 0xc3a367, -0.9 + i * 0.9, 1.5, 0);
    g.rotation.z = s.result && !s.result.metrics.stable ? 0.1 : 0;
  } else if (active === "culture") {
    b(4, 0.55, 2.7, 0xa98a62, 0, 0.6, -0.8);
    if (s.a) {
      const ramp = b(1.4, 0.15, 2.5, 0xcbba8e, -2, 0.45, 1.4);
      ramp.rotation.x = -0.14;
    }
    for (const x of [-2.8, 2.8]) {
      b(0.6, 1.6, 0.6, s.b ? 0x688c91 : 0x777d79, x, 1, -0.8);
      if (s.c) {
        const screen = b(0.1, 1.9, 2.2, 0x879b81, x, 1.2, 0);
        screen.rotation.y = 0.3;
      }
    }
    for (let i = 0; i < (s.result?.metrics.reached ?? 0); i++) {
      const guest = spawn(
        site.x - 2.1 + (i % 3) * 1.4,
        site.z + 1.2 + Math.floor(i / 3) * 1.2,
        0x71949b,
      );
      if (guest) people.push(guest);
    }
  } else if (active === "enterprise") {
    b(5, 0.9, 1.5, 0xa8845c, 0, 0.85, 0);
    for (let i = 0; i < (s.b + 1) * 2; i++)
      b(
        0.45,
        0.3 + s.a * 0.12,
        0.5,
        s.a ? 0x6f9994 : 0xc0a381,
        -2 + i * 0.75,
        1.5,
        0,
      );
    b(1.1, 0.9, 0.15, 0xf0deab, 2.5, 1.7, 0);
    if (s.result)
      for (let i = 0; i < s.result.metrics.waste; i++)
        b(0.5, 0.4, 0.5, 0x9c886a, -2 + i * 0.7, 0.6, 1.8);
  } else if (active === "connect") {
    b(6, 0.06, 1.4, 0x9ca89d, 0, 0.3, 0);
    for (let i = 0; i < 4; i++) {
      const delivered = s.result?.metrics.delivered === 4;
      b(
        0.8,
        0.55,
        0.65,
        0x5f8eae,
        delivered ? 1 + i * 0.6 : -2 + i * (s.c ? 1.15 : 0.6),
        0.65,
        s.b ? -1.5 : 0,
      );
    }
    for (const x of [-2.5, 2.5]) {
      b(0.13, 1.8, 0.13, 0x7e8786, x, 1, 1);
      b(0.4, 0.4, 0.3, s.a ? 0x83aa6a : 0xb76c62, x, 2, 1);
    }
  } else if (active === "trust") {
    for (const x of [-2, 2]) {
      b(1.6, 0.7, 1.3, 0xa68a66, x, 0.8, 0);
      b(0.6, 0.12, 0.4, s.a === 1 ? 0x6a9f7d : 0xc5aa6c, x, 1.2, 0);
    }
    if (s.b) b(1.7, 0.15, 0.8, 0x6e9b9b, 0, 0.5, 0);
    if (s.c) b(0.9, 0.9, 0.15, 0xe0cf99, 0, 1.4, -1.2);
  } else if (active === "environment") {
    for (const x of [-2, 0, 2])
      b(
        1.3,
        0.8,
        1.3,
        s.a === 1 ? (x === 0 ? 0x639a6a : 0x6e9bb2) : 0x9e9178,
        x,
        0.7,
        -0.8,
      );
    b(5, 0.07, 1.5, s.c ? 0x6f9460 : 0xb9b5a6, 0, 0.32, 1.5);
    b(5, 0.08, 0.4, s.b ? 0x6a9daa : 0x9f8d6c, 0, 0.4, 2.4);
    if (s.result?.metrics.flooded) b(5, 0.04, 3.5, 0x83afb4, 0, 0.5, 0.6);
  } else if (active === "legacy") {
    b(4, 1, 2, 0xb4a27c, 0, 0.8, 0);
    for (let i = 0; i < 3; i++) {
      b(
        0.65,
        0.45,
        0.65,
        [s.a, s.b, s.c][i] ? 0x73a28c : 0xb7aa91,
        -1.2 + i * 1.2,
        1.6,
        0,
      );
    }
    if (s.done)
      for (let i = 0; i < 5; i++)
        b(0.18, 1.5, 0.18, 0x84a268, -2 + i, 0.95, -1.5);
  }
  for (const spec of CHAPTER_OBJECTS.filter((o) => o.system === active)) {
    const control = new root.constructor();
    control.position.set(spec.x, 0, spec.z);
    control.userData.marketTarget = spec.id;
    root.add(control);
    objects.set(spec.id, control);
    box(
      control,
      0.65,
      0.75,
      0.65,
      spec.action === "test" ? 0xd2b46e : 0x74968e,
      0,
      0.65,
      0,
    );
  }
}
