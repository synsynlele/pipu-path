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
