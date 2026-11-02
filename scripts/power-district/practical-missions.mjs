import assert from "node:assert/strict";
import {
  PRACTICAL_MISSIONS,
  newPracticalState,
  practicalAction,
  practicalReport,
  PRACTICAL_OBJECTS,
  practicalForChapter,
} from "../../public/games/city/practical-missions.mjs";
import { BUILDER_CHAPTERS } from "../../public/games/city/builder-chapters.mjs";
const context = { otherChallenges: 35, prototypes: 6 };
assert.equal(PRACTICAL_MISSIONS.length, 24);
assert.equal(new Set(PRACTICAL_MISSIONS.map((m) => m.source)).size, 24);
for (const c of BUILDER_CHAPTERS)
  assert.deepEqual(
    practicalForChapter(c.id).map((m) => m.slot),
    [2, 3],
  );
for (const m of PRACTICAL_MISSIONS) {
  let states = newPracticalState();
  assert.equal(
    practicalReport(m, states[m.id], context).success,
    false,
    `${m.id} is not completed by opening it`,
  );
  states = practicalAction(states, m.id, "test", context).state;
  assert.equal(states[m.id].done, false);
  for (const action of m.solution) {
    const next = practicalAction(states, m.id, action, context);
    assert(next.changed, `${m.id}:${action}: ${next.message}`);
    states = next.state;
  }
  assert.equal(states[m.id].done, true, m.id);
  const cash = states[m.id].cash,
    used = states[m.id].used.length;
  const repeat = practicalAction(states, m.id, m.solution[0], context);
  assert.equal(
    repeat.changed,
    false,
    `${m.id} cannot duplicate stock or money`,
  );
  assert.equal(repeat.state[m.id].cash, cash);
  assert.equal(repeat.state[m.id].used.length, used);
  for (const a of [...m.actions, { id: "test" }])
    assert(
      PRACTICAL_OBJECTS.some((o) => o.id === `${m.id}:${a.id}`),
      `${m.id} has physical object ${a.id}`,
    );
}
let s = newPracticalState();
s = practicalAction(s, "device-recovery", "battery").state;
assert.equal(
  practicalAction(s, "device-recovery", "reuse").changed,
  false,
  "wrong material cannot be delivered",
);
assert.equal(
  practicalAction(s, "device-recovery", "board").changed,
  false,
  "one carried item at a time",
);
assert.equal(
  practicalAction(newPracticalState(), "working-cash", "delivery").changed,
  false,
  "unpaid sales cannot fund crew payment",
);
s = newPracticalState();
for (const a of ["clinic", "cooling", "workshop", "storage", "test"])
  s = practicalAction(s, "power-sharing", a).state;
assert.equal(s["power-sharing"].done, false, "overloaded circuit fails");
s = practicalAction(s, "power-sharing", "shift").state;
s = practicalAction(s, "power-sharing", "test").state;
assert.equal(s["power-sharing"].done, true, "load scheduling restores service");
s = newPracticalState();
for (const a of [
  "closure",
  "bypass",
  "farm",
  "market",
  "medical",
  "clinic",
  "test",
])
  s = practicalAction(s, "priority-delivery", a).state;
assert.equal(
  s["priority-delivery"].done,
  false,
  "late urgent delivery is not a pass",
);
s = newPracticalState();
for (const a of PRACTICAL_MISSIONS.at(-1).solution)
  s = practicalAction(s, "next-generation", a, {
    otherChallenges: 34,
    prototypes: 6,
  }).state;
assert.equal(
  s["next-generation"].done,
  false,
  "final handover requires the other 35 outcomes",
);
console.log(
  "PASS: 24 practical missions, 24 production sources, 12 three-challenge chapters, actual delivery/stock/cash/sequence constraints, failure recovery, no duplicate resources and final handover gate.",
);
