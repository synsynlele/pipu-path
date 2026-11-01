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
