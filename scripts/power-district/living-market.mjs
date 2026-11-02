import assert from "node:assert/strict";
import * as M from "../../public/games/market-world/model.mjs";
const points = {
  crates: { x: -12, z: -11 },
  cargo: { x: -12, z: -11 },
  team: { x: 9, z: 16 },
  bridge: { x: -6, z: -2 },
  shade: { x: -11, z: -9.5 },
  solar: { x: 4, z: 19 },
  battery: { x: 4, z: 23 },
  coldroom: { x: 9, z: 19 },
};
function construct(kinds, initial = M.freshWorld()) {
  let s = initial;
  for (const kind of kinds) {
    const r = M.build(s, kind, points[kind]);
    assert(r.ok, `${kind}: ${r.message}`);
    s = r.state;
  }
  return s;
}
function conservation(s) {
  const inv = M.inventory(s);
  assert.equal(
    Object.values(inv).reduce((a, b) => a + b, 0),
    s.harvested,
  );
  assert.equal(inv.served, s.served);
  assert.equal(inv.lost, s.lost);
  assert.equal(new Set(s.goods.map((g) => g.id)).size, s.goods.length);
  assert(s.cash >= 0 && s.materials >= 0);
}
function trial(s) {
  s = M.beginDay(s);
  for (let i = 0; i < 400 && s.running; i++) {
    s = M.advance(s, 0.25);
    conservation(s);
    assert(M.restoreWorld(M.saveWorld(s)), "every travel checkpoint restores");
  }
  return s;
}
const fresh = M.freshWorld();
assert.equal(M.advance(fresh, 30), fresh, "paused world does not advance");
let baseline = trial(fresh);
assert.equal(baseline.result.success, false);
assert(baseline.damage > 0);
assert.equal(baseline.cart.leg, "idle");
assert(baseline.result.issues.some((i) => i.includes("team")));
for (const solution of [
  ["crates", "team", "cargo"],
  ["crates", "team", "bridge", "shade"],
]) {
  let s = construct(solution);
  const invested = s.cash;
  s = trial(s);
  assert.equal(s.result.success, true);
  assert.equal(s.served, 12);
  assert.equal(s.damage, 0);
  assert(s.cash > invested);
  let again = trial(s);
  assert.equal(
    again.cash,
    s.cash,
    "replaying a passed trial does not duplicate payout",
  );
  s = M.nextPhase(s);
  assert(M.restoreWorld(M.saveWorld(s)));
  assert.equal(s.weather, "rain");
  if (!solution.includes("bridge"))
    assert.equal(M.deliveryRoute(s).id, "public");
  s = trial(s);
  assert.equal(s.result.success, true, "alternative strategy survives rain");
  s = M.beginDay(s);
  s.observing = true;
  const day = s.day;
  s = M.advance(s, 250);
  assert(s.running);
  assert.equal(s.day, day + 2);
  assert(s.history.length >= 4);
  conservation(s);
  assert(M.restoreWorld(M.saveWorld(s)));
}
let s = construct(["crates", "team", "bridge"]);
s = trial(s);
s = trial(M.nextPhase(s));
assert.equal(
  s.result.success,
  false,
  "shorter route alone needs storage in rain",
);
assert.equal(s.served, 10);
assert.equal(M.buildCheck(fresh, "solar", { x: 0, z: -2 }).ok, false);
assert.equal(M.buildCheck(fresh, "solar", { x: -20, z: 13 }).ok, false);
assert.equal(M.buildCheck(fresh, "shade", { x: -12, z: -16 }).ok, false);
assert.equal(
  M.buildCheck({ ...fresh, cash: 0 }, "cargo", points.cargo).ok,
  false,
);
assert.equal(M.buildCheck(fresh, "bridge", { x: 18, z: -2 }).ok, false);
assert.equal(M.buildCheck(fresh, "crates", { x: 25, z: 20 }).ok, false);
s = construct(["crates"]);
assert.equal(M.buildCheck(s, "crates", points.crates).ok, false);
s = M.reclaim(s, s.buildings[0].id);
assert.equal(s.cash, 90);
assert.equal(s.materials, 40);
assert.equal(M.reclaim(s, "absent"), s);
// Cooling requires a locally connected supply; remote panels do not energize it.
s = construct(["solar", "battery", "coldroom"], {
  ...M.freshWorld(),
  cash: 200,
});
assert.equal(M.power(s).supplied, true);
s = M.advance(M.beginDay(s), 4);
assert(s.battery > 0);
s.weather = "rain";
s.phase = 2;
assert.equal(M.power(s).supplied, true);
s = M.advance(s, 30);
assert.equal(s.battery, 0);
assert.equal(M.power(s).supplied, false);
const detached = structuredClone(s);
detached.buildings.find((b) => b.kind === "solar").x = -25;
assert.equal(M.power(detached).linked, false);
let noPower = construct(["coldroom"], { ...M.freshWorld(), cash: 200 });
noPower.buildings[0].x = -9;
noPower.buildings[0].z = -10;
let powered = structuredClone(noPower);
powered = construct(["solar"], powered);
powered.buildings.find((b) => b.kind === "solar").x = -5;
powered.buildings.find((b) => b.kind === "solar").z = -10;
noPower = M.advance(M.beginDay(noPower), 10);
powered = M.advance(M.beginDay(powered), 10);
assert(
  powered.goods.find((g) => g.place === "farm").age <
    noPower.goods.find((g) => g.place === "farm").age,
);
assert.equal(
  powered.damage,
  noPower.damage,
  "cooling cannot undo loading damage",
);
const saved = M.saveWorld(construct(["crates", "team", "cargo"]));
assert(M.restoreWorld(saved));
assert.equal(M.restoreWorld("{bad"), null);
assert.equal(M.restoreWorld("x".repeat(120001)), null);
for (const mutate of [
  (s) => (s.cash = -1),
  (s) => (s.buildings[0].cost = 500),
  (s) => (s.goods[0].age = -1),
  (s) => (s.cart.path = [{ x: Infinity, z: 0 }]),
  (s) => (s.served = 12),
  (s) => (s.goods[1].id = s.goods[0].id),
  (s) => (s.observing = "yes"),
  (s) => (s.result = { success: true, issues: [{}] }),
]) {
  const data = JSON.parse(saved);
  mutate(data.state);
  assert.equal(M.restoreWorld(JSON.stringify(data)), null);
}
console.log(
  "PASS: two independent market strategies, dry/rain failure and recovery, actual stock conservation, local power/storage, crew autonomy, once-only trial payouts, continuing operation and versioned checkpoint recovery.",
);
