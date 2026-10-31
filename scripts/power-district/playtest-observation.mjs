import assert from "node:assert/strict";
import {
  PLAYTEST_EVENTS,
  createPlaytestObservation,
} from "../../public/games/city/playtest-observation.mjs";
let clock = 0;
const events = createPlaytestObservation(() => clock);
assert.equal(events.note("full-name"), false);
events.note("start");
clock = 4500;
events.note("prototype_retry");
events.note("decision");
clock = 17000;
events.note("prototype_pass");
events.note("revision");
assert.deepEqual(events.snapshot(), {
  version: 1,
  scope: "this open game only",
  start: 1,
  decision: 1,
  revision: 1,
  prototype_pass: 1,
  prototype_retry: 1,
  service_test: 0,
  service_apply: 0,
  firstActionSeconds: 5,
});
assert.equal(PLAYTEST_EVENTS.length, 7);
assert(events.note("service_test"));
assert(events.note("service_apply"));
assert.equal(events.snapshot().service_apply, 1);
assert(!("userId" in events.snapshot()));
assert(!("city" in events.snapshot()));
assert(!events.report().includes("full-name"));
assert(events.report().includes("No personal data"));
const empty = createPlaytestObservation(() => 0);
assert.equal(empty.snapshot().firstActionSeconds, null);
console.log(
  "PASS: privacy-first local game playtest counts, bounded timing and no identifiers.",
);
