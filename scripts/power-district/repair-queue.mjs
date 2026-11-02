import assert from "node:assert/strict";
import {
  JOBS,
  newRepairQueue,
  repairAction as act,
  advanceRepair,
  restoreRepair,
} from "../../public/games/city/repair-queue.mjs";
function plan(order, upgrades = []) {
  let s = newRepairQueue();
  for (const j of JOBS) s = act(s, "inspect", j.id);
  for (const u of upgrades) s = act(s, u);
  for (const id of order) {
    s = act(s, "lift", id);
    s = act(s, "place");
  }
  return s;
}
const order = ["pump", "cold", "cart", "radio", "lamp", "chair"];
for (const upgrades of [["workflow"], ["bench", "helper"]]) {
  let s = plan(order, upgrades);
  s = act(s, "run");
  for (let i = 0; i < 480; i++) s = advanceRepair(s, 0.025);
  assert.equal(s.result.success, true);
  assert.equal(s.result.essential, 3);
  assert(s.result.total >= 5);
  assert(restoreRepair(JSON.stringify(s)));
}
for (const upgrades of [[], ["bench"], ["helper"]]) {
  let s = advanceRepair(act(plan(order, upgrades), "run"), 12);
  assert.equal(
    s.result.success,
    false,
    "hardware alone does not create skilled capacity",
  );
}
let bad = advanceRepair(
  act(plan([...order].reverse(), ["workflow"]), "run"),
  12,
);
assert.equal(
  bad.result.success,
  false,
  "queue order changes service deadlines",
);
let s = newRepairQueue();
assert.equal(act(s, "run"), s);
assert.equal(act(s, "lift", "pump"), s);
s = act(s, "inspect", "pump");
s = act(s, "lift", "pump");
assert.equal(act(s, "lift", "cold"), s);
s = act(s, "place");
assert.equal(act(s, "lift", "pump"), s);
s = act(s, "take", "pump");
assert.equal(s.queue.length, 0);
assert.equal(s.held, "pump");
s = act(s, "return");
assert.equal(s.held, null);
s = plan(order, ["workflow"]);
s = act(s, "run");
s = advanceRepair(s, 3);
const paused = act(s, "pause");
assert.equal(advanceRepair(paused, 5), paused);
assert.equal(act(s, "bench"), s);
let restored = restoreRepair(JSON.stringify(s));
assert.equal(restored.running, false);
assert.equal(restored.time, s.time);
restored = act(restored, "pause");
assert(advanceRepair(restored, 12).result.success);
s = act(s, "retry");
assert(s.workflow);
assert.equal(s.time, 0);
assert.equal(s.queue.length, 0);
for (const mutate of [
  (s) => (s.cash = 100),
  (s) => (s.queue = ["pump", "pump"]),
  (s) => (s.time = -1),
  (s) => (s.held = "unknown"),
  (s) => (s.workers = [{ id: "pump", remaining: -1 }]),
  (s) => (s.finished = [{ id: "cold", at: 5 }]),
]) {
  const x = newRepairQueue();
  mutate(x);
  assert.equal(restoreRepair(JSON.stringify(x)), null);
}
assert.equal(restoreRepair("{bad"), null);
console.log(
  "PASS: two working workshop strategies, causal queue/capacity failures, one carried job, real deadlines, pause/retry and validated separate checkpoints.",
);
