import assert from "node:assert/strict";
import {
  newMarket,
  marketAction,
  marketReport,
  marketHint,
} from "../../public/games/city/market-actions.mjs";
let state = newMarket();
const act = (id) => {
  const before = JSON.stringify(state);
  const result = marketAction(state, id);
  assert.equal(
    JSON.stringify(state),
    before,
    "actions never mutate their input",
  );
  state = result.state;
  return result;
};
assert.equal(marketReport(state).success, false);
assert.equal(act("stall-a").changed, false);
act("roofing");
assert.equal(act("stall-a").changed, false);
act("put-down");
act("timber");
assert.equal(act("roofing").changed, false);
act("stall-b");
act("timber");
act("stall-a");
act("roofing");
act("stall-a");
act("roofing");
act("stall-b");
assert.equal(act("timber").changed, false);
assert.equal(act("bell").report.success, false);
act("cart");
act("loading");
act("produce");
assert.equal(act("shelf").changed, false, "cart can obstruct storage");
act("put-down");
act("cart");
act("parking");
act("produce");
act("shelf");
assert.equal(act("bell").report.success, true);
assert.equal(state.opened, true);
assert.match(marketHint(state), /Market open/);
assert.equal(state.tests, 2);
assert.equal(act("unknown").changed, false);
assert.equal(act("produce").changed, false);
console.log(
  "PASS: market repair dependencies, visible carrying rules, alternate work order, obstructed storage, recovery and tested opening.",
);

const {
  CITY_PROJECTS,
  CONSTRUCTION_OBJECTS,
  newConstruction,
  constructionAction,
} = await import("../../public/games/city/city-construction.mjs");
const { peopleClear, safePersonStep } =
  await import("../../public/games/city/personal-space.mjs");
const { overlapsRoad } = await import("../../public/games/city/layout.mjs");
let projects = newConstruction(),
  carrying = null;
for (const project of CITY_PROJECTS) {
  assert(
    !overlapsRoad(project.x, project.z, project.width, project.depth, 0.25),
  );
  const apply = (id) => {
    const previous = JSON.stringify(projects),
      r = constructionAction(projects, carrying, id);
    assert.equal(JSON.stringify(projects), previous);
    projects = r.progress;
    carrying = r.carrying;
    return r;
  };
  assert.equal(apply(project.id + ":open").opened, false);
  assert.equal(apply(project.id + ":base").changed, false);
  apply(project.id + ":kit");
  assert.equal(carrying, "kit:" + project.id);
  assert.equal(apply(project.id + ":structure").changed, false);
  apply(project.id + ":base");
  assert.equal(carrying, null);
  apply(project.id + ":structure");
  apply(project.id + ":services");
  assert.equal(apply(project.id + ":open").opened, true);
  assert.equal(projects[project.id].stage, 3);
}
assert.equal(CONSTRUCTION_OBJECTS.length, 30);
assert(
  !peopleClear({ x: -2, z: 0 }, { x: 2, z: 0 }, [{ x: 0, z: 0 }]),
  "swept collision blocks walking through somebody",
);
assert(
  peopleClear({ x: 0, z: 0 }, { x: -0.2, z: 0 }, [{ x: 0.1, z: 0 }]),
  "an existing overlap can recover by moving away",
);
assert(!peopleClear({ x: 0, z: 0 }, { x: 0.05, z: 0 }, [{ x: 0.1, z: 0 }]));
const safe = safePersonStep(
  { x: -1, z: 0 },
  { x: 1, z: 0 },
  [{ x: 0, z: 0 }],
  () => true,
  0.4,
);
assert(peopleClear({ x: -1, z: 0 }, safe, [{ x: 0, z: 0 }]));
console.log(
  "PASS: six construction catalogues, carry-before-build, dependencies, tested opening, road clearance and swept personal space.",
);
const T = await import("../../public/games/shared/vendor/three.module.js");
const { createConstructionScene } =
  await import("../../public/games/city/construction-scene.mjs");
const renderer = createConstructionScene(T),
  root = new T.Group(),
  groups = new Map();
renderer.draw(root, projects, groups, (parent, w, h, d, c, x, y, z) => {
  const m = new T.Mesh(
    new T.BoxGeometry(w, h, d),
    new T.MeshBasicMaterial({ color: c }),
  );
  m.position.set(x, y, z);
  parent.add(m);
  return m;
});
for (const project of CITY_PROJECTS) {
  for (const kind of ["kit", "base", "structure", "services"])
    assert.equal(
      groups.get(project.id + ":" + kind).visible,
      false,
      "completed sites remove construction clutter",
    );
  assert.equal(groups.get(project.id + ":open").visible, true);
  const body = root.children.find(
      (g) => g.position.x === project.x && g.position.z === project.z,
    ),
    bounds = new T.Box3().setFromObject(body),
    size = bounds.getSize(new T.Vector3()),
    centre = bounds.getCenter(new T.Vector3());
  assert(
    !overlapsRoad(centre.x, centre.z, size.x, size.z, 0.25),
    "actual finished geometry clears streets",
  );
}
console.log(
  "PASS: completed sites remove cranes/materials, retain entrances, and their actual geometry clears streets.",
);

assert(
  !peopleClear({ x: 0, z: 0 }, { x: 0.5, z: 0 }, [{ x: 0.1, z: 0 }]),
  "recovering an old overlap must not cross through the other person",
);

const { newEpisode, episodeAction, advanceApprentice, missionUnlocked } =
  await import("../../public/games/city/builder-episode.mjs");
const { crewReplicas } =
  await import("../../public/games/city/crew-replication.mjs");
let episode = newEpisode(),
  held = null;
const task = (id) => {
  const before = JSON.stringify(episode),
    r = episodeAction(episode, held, id);
  assert.equal(JSON.stringify(episode), before);
  episode = r.state;
  held = r.carrying;
  return r;
};
assert.equal(task("care:test").changed, false);
for (const id of ["resident", "tank", "pump", "test"])
  task("investigate:" + id);
assert.equal(episode.investigate.done, false);
assert.equal(episode.investigate.partsSpent, 1);
task("investigate:valve");
task("investigate:valve");
task("investigate:test");
assert.equal(episode.investigate.done, true);
assert(missionUnlocked(episode, "care"));
task("care:test");
assert.equal(episode.care.served, 0);
for (let i = 0; i < 2; i++) {
  task("care:supplies");
  task("care:deliver");
}
task("care:test");
assert.equal(episode.care.done, false, "supplies cannot replace support staff");
task("care:support");
task("care:test");
assert.equal(episode.care.done, true);
task("care:support");
task("care:test");
assert.equal(
  episode.care.done,
  true,
  "two different staffing allocations succeed",
);
task("teach:test");
let trial = advanceApprentice(episode, 2, false);
assert.equal(trial.state.teach.trial, 0);
trial = advanceApprentice(episode, 2, true);
episode = trial.state;
assert.equal(episode.teach.done, false);
task("teach:tools");
task("teach:demonstrate");
task("teach:test");
episode = advanceApprentice(episode, 2, true).state;
assert.equal(episode.teach.done, false);
task("teach:jig");
task("teach:test");
episode = advanceApprentice(episode, 2, true).state;
assert.equal(episode.teach.done, true);
task("teach:jig");
task("teach:demonstrate");
task("teach:test");
episode = advanceApprentice(episode, 2, true).state;
assert.equal(
  episode.teach.done,
  true,
  "clearer teaching offers another successful strategy",
);
const noCrews = crewReplicas(newConstruction(), episode);
assert.equal(noCrews.length, 0);
const towerOnly = {
  ...newConstruction(),
  tower: { stage: 3, open: true, tests: 1 },
};
const batch = crewReplicas(towerOnly, episode);
assert(batch.length > 1);
assert(batch.every((p) => p.type === "tower"));
assert.deepEqual(
  batch,
  crewReplicas(towerOnly, episode),
  "reopening does not duplicate a crew batch",
);
const allBatches = crewReplicas(projects, episode);
assert.equal(new Set(allBatches.map((p) => p.id)).size, allBatches.length);
assert(
  allBatches.every(
    (p) => p.type !== "airport" && !overlapsRoad(p.x, p.z, 4.5, 4.5, 0.25),
  ),
);
console.log(
  "PASS: evidence-led investigation, two clinic strategies, independent apprentice trials, staged mission gates and deterministic road-safe crew replication.",
);

const {
  BUILDER_CHAPTERS,
  SYSTEM_CHAPTERS,
  newChapterSystems,
  evaluateChapter,
  systemAction,
  completedChapters,
} = await import("../../public/games/city/builder-chapters.mjs");
assert.equal(BUILDER_CHAPTERS.length, 12);
assert.equal(new Set(BUILDER_CHAPTERS.map((c) => c.field)).size, 12);
const solutions = {
  food: [1, 1, 1],
  invent: [1, 1, 2],
  culture: [1, 1, 0],
  enterprise: [1, 1, 1],
  connect: [1, 1, 1],
  trust: [1, 1, 1],
  environment: [1, 1, 1],
  legacy: [1, 1, 1],
};
const systems = newChapterSystems();
const context = {
  episode: {
    investigate: { done: true },
    care: { done: true },
    teach: { done: true },
  },
  market: { opened: true },
  systems: Object.fromEntries(
    SYSTEM_CHAPTERS.map((c) => [c.id, { done: true }]),
  ),
  projects: Object.fromEntries(
    CITY_PROJECTS.map((p) => [p.id, { open: true }]),
  ),
};
for (const chapter of SYSTEM_CHAPTERS) {
  assert.equal(
    evaluateChapter(chapter.id, systems[chapter.id], context).success,
    false,
    chapter.id + " has a real failure",
  );
  let next = systems;
  for (const [i, action] of ["a", "b", "c"].entries())
    for (let j = 0; j < solutions[chapter.id][i]; j++)
      next = systemAction(next, chapter.id, action, context).state;
  const tested = systemAction(next, chapter.id, "test", context);
  assert.equal(
    tested.state[chapter.id].done,
    true,
    chapter.id + " useful outcome",
  );
  assert.equal(systems[chapter.id].tests, 0, "immutable starting state");
  assert.equal(
    systemAction(tested.state, chapter.id, "a", context).state[chapter.id].done,
    false,
    "changes invalidate a previous test",
  );
}
for (const [id, alt] of Object.entries({
  food: [2, 1, 0],
  invent: [2, 0, 2],
  culture: [2, 2, 1],
  enterprise: [2, 1, 2],
  connect: [2, 0, 1],
}))
  assert(
    evaluateChapter(id, { a: alt[0], b: alt[1], c: alt[2] }, context).success,
    id + " alternate strategy",
  );
assert(
  !evaluateChapter("legacy", { a: 1, b: 1, c: 1 }, { ...context, projects: {} })
    .success,
  "handover cannot bypass prototypes",
);
assert(
  !evaluateChapter(
    "legacy",
    { a: 1, b: 1, c: 1 },
    { ...context, systems: newChapterSystems() },
  ).success,
  "handover cannot bypass other fields",
);
assert.equal(
  completedChapters(context.episode, context.market, context.systems),
  12,
);
const finalCity = crewReplicas(
  context.projects,
  context.episode,
  undefined,
  12,
);
assert.equal(finalCity.length, 70);
assert.equal(new Set(finalCity.map((p) => p.id)).size, 70);
assert(!finalCity.some((p) => p.type === "airport"));
for (const p of finalCity)
  assert(!overlapsRoad(p.x, p.z, p.width, p.depth, 0.25));
console.log(
  "PASS: all twelve chapter outcomes, eight distinct system trials, five alternate strategies, honest handover dependencies and a unique seventy-parcel final city.",
);
