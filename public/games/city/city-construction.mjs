import { overlapsRoad } from "./layout.mjs";
export const CITY_PROJECTS = [
  {
    id: "tower",
    name: "Skyline tower",
    x: 42,
    z: -7,
    width: 8,
    depth: 6,
    kit: "structural kit",
    steps: [
      "Pour the foundation",
      "Operate the tower crane",
      "Connect lifts and power",
    ],
    benefit: "Workspaces and homes above a public plaza.",
  },
  {
    id: "homes",
    name: "Neighbourhood homes",
    x: -42,
    z: -33,
    width: 8,
    depth: 6,
    kit: "housing panels",
    steps: [
      "Set the foundations",
      "Assemble the homes",
      "Connect water and access",
    ],
    benefit:
      "A tidy neighbourhood with clear entrances and shared green space.",
  },
  {
    id: "hospital",
    name: "Community hospital",
    x: 18,
    z: -33,
    width: 8,
    depth: 6,
    kit: "clinic construction kit",
    steps: [
      "Lay the clinic base",
      "Raise the care wards",
      "Install water and treatment rooms",
    ],
    benefit: "Care wards, an accessible entrance and a clean arrival court.",
  },
  {
    id: "farm",
    name: "Community farm",
    x: 42,
    z: 35,
    width: 8,
    depth: 6,
    kit: "seed and soil kit",
    steps: [
      "Prepare the growing beds",
      "Plant the crop rows",
      "Open the irrigation",
    ],
    benefit:
      "Straight crop rows, irrigation channels and sheltered produce storage.",
  },
  {
    id: "stadium",
    name: "Community stadium",
    x: -18,
    z: 35,
    width: 10,
    depth: 8,
    kit: "sports ground kit",
    steps: [
      "Level the playing field",
      "Fit the stands",
      "Connect the entry gates",
    ],
    benefit: "A marked pitch, balanced stands and open spectator access.",
  },
  {
    id: "airport",
    name: "Regional airport",
    x: 42,
    z: -33,
    width: 10,
    depth: 8,
    kit: "airfield construction kit",
    steps: [
      "Lay the runway base",
      "Assemble the terminal",
      "Connect the taxiway",
    ],
    benefit:
      "A compact fictional airfield with a clear runway and terminal route.",
  },
];
for (const p of CITY_PROJECTS)
  if (overlapsRoad(p.x, p.z, p.width, p.depth, 0.25))
    throw new Error("Project overlaps a city road: " + p.id);
export const CONSTRUCTION_OBJECTS = CITY_PROJECTS.flatMap((p) => [
  {
    id: p.id + ":kit",
    project: p.id,
    kind: "kit",
    name: "Collect " + p.kit,
    x: p.x - 4.8,
    z: p.z + 4.7,
    approach: { x: p.x - 4.8, z: p.z + 5.9 },
  },
  {
    id: p.id + ":base",
    project: p.id,
    kind: "base",
    name: p.steps[0],
    x: p.x - 2,
    z: p.z + 3.8,
    approach: { x: p.x - 2, z: p.z + 5.5 },
  },
  {
    id: p.id + ":structure",
    project: p.id,
    kind: "structure",
    name: p.steps[1],
    x: p.x - 5.3,
    z: p.z,
    approach: { x: p.x - 5.7, z: p.z + 2.4 },
  },
  {
    id: p.id + ":services",
    project: p.id,
    kind: "services",
    name: p.steps[2],
    x: p.x + 5,
    z: p.z + 1.7,
    approach: { x: p.x + 5.8, z: p.z + 2.7 },
  },
  {
    id: p.id + ":open",
    project: p.id,
    kind: "open",
    name: "Test and open " + p.name.toLowerCase(),
    x: p.x + 2,
    z: p.z + 4.6,
    approach: { x: p.x + 2, z: p.z + 5.8 },
  },
]);
export function newConstruction() {
  return Object.fromEntries(
    CITY_PROJECTS.map((p) => [p.id, { stage: 0, open: false, tests: 0 }]),
  );
}
export function constructionAction(progress, carrying, id) {
  const spec = CONSTRUCTION_OBJECTS.find((o) => o.id === id);
  if (!spec)
    return {
      progress,
      carrying,
      changed: false,
      message: "Choose a construction worksite.",
    };
  const p = CITY_PROJECTS.find((p) => p.id === spec.project),
    old = progress[p.id],
    next = { ...old };
  const reject = (message) => ({ progress, carrying, changed: false, message });
  let message;
  if (carrying && !["kit", "base"].includes(spec.kind))
    return reject("Return your carried item before operating this control.");
  if (spec.kind === "kit") {
    if (carrying)
      return reject(
        "Return your carried item before collecting a construction kit.",
      );
    if (old.stage > 0)
      return reject(
        "The foundation already has its materials. Continue the work on site.",
      );
    return {
      progress,
      carrying: "kit:" + p.id,
      changed: true,
      message: "Carrying " + p.kit + ". Take it to the foundation marker.",
    };
  }
  if (spec.kind === "base") {
    if (old.stage) return reject("The foundation is already prepared.");
    if (carrying !== "kit:" + p.id)
      return reject(
        "Collect the " + p.kit + " and carry it to this worksite first.",
      );
    next.stage = 1;
    carrying = null;
    message = "Foundation ready. " + p.steps[1] + " at the worksite control.";
  } else if (spec.kind === "structure") {
    if (old.stage !== 1)
      return reject(
        old.stage === 0
          ? "Prepare the foundation first."
          : "The structure is already assembled.",
      );
    next.stage = 2;
    message = "Structure assembled. " + p.steps[2] + ".";
  } else if (spec.kind === "services") {
    if (old.stage !== 2)
      return reject(
        old.stage < 2
          ? "Complete the base and structure first."
          : "Services are already connected. Test the finished work.",
      );
    next.stage = 3;
    message = "Services connected. Test and open the site.";
  } else {
    next.tests++;
    next.open = old.stage === 3;
    message = next.open
      ? p.name + " opened! " + p.benefit
      : "Site test: " + p.steps[Math.min(old.stage, 2)] + " before opening.";
  }
  return {
    progress: { ...progress, [p.id]: next },
    carrying,
    changed: true,
    message,
    opened: next.open,
  };
}
export function constructionHint(progress, id, carrying) {
  const p = CITY_PROJECTS.find((p) => p.id === id),
    s = progress[id];
  if (s.open)
    return (
      p.name +
      " is open. Inspect the finished layout or choose another worksite."
    );
  if (carrying === "kit:" + id)
    return "Carry the kit to the foundation marker.";
  return s.stage === 0
    ? "Collect " + p.kit + " beside the site."
    : s.stage === 3
      ? "Test the finished site and open it."
      : p.steps[s.stage] + ". Tap the labelled worksite control.";
}
