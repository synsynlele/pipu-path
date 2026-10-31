import assert from "node:assert/strict";
import { createScreenAwake } from "../../public/games/city/screen-awake.mjs";
const tick = () => new Promise((resolve) => setImmediate(resolve));
class Lock extends EventTarget {
  released = false;
  async release() {
    this.released = true;
    this.dispatchEvent(new Event("release"));
  }
}
const doc = new EventTarget();
doc.hidden = false;
const locks = [];
const controller = createScreenAwake({
  doc,
  nav: {
    wakeLock: {
      async request(kind) {
        assert.equal(kind, "screen");
        const lock = new Lock();
        locks.push(lock);
        return lock;
      },
    },
  },
});
assert.equal(locks.length, 0);
controller.setPlaying(true);
await tick();
assert(controller.status().active);
assert.equal(locks.length, 1);
doc.dispatchEvent(new Event("pointerdown"));
await tick();
assert.equal(locks.length, 1);
doc.hidden = true;
doc.dispatchEvent(new Event("visibilitychange"));
await tick();
assert(locks[0].released);
assert.equal(controller.status().active, false);
doc.hidden = false;
doc.dispatchEvent(new Event("visibilitychange"));
await tick();
assert.equal(locks.length, 2);
assert(controller.status().active);
controller.setEnabled(false);
await tick();
assert(locks[1].released);
assert.equal(controller.status().active, false);
controller.setEnabled(true);
await tick();
assert(controller.status().active);
controller.setPlaying(false);
await tick();
assert(locks.at(-1).released);
controller.dispose();
doc.dispatchEvent(new Event("pointerdown"));
await tick();
assert.equal(locks.length, 3);
let resolveRequest;
const pending = createScreenAwake({
  doc,
  nav: {
    wakeLock: {
      request() {
        return new Promise((resolve) => (resolveRequest = resolve));
      },
    },
  },
});
pending.setPlaying(true);
pending.setPlaying(false);
const late = new Lock();
resolveRequest(late);
await tick();
assert(late.released);
assert.equal(pending.status().active, false);
pending.dispose();
const denied = createScreenAwake({
  doc,
  nav: {
    wakeLock: {
      async request() {
        throw new Error("NotAllowedError");
      },
    },
  },
});
denied.setPlaying(true);
await tick();
assert.equal(denied.status().active, false);
denied.dispose();
const unsupported = createScreenAwake({ doc, nav: {} });
unsupported.setPlaying(true);
assert.equal(unsupported.status().supported, false);
unsupported.dispose();
console.log(
  "PASS: visible active-play wake lock, no duplicates, background release/reacquisition, explicit off/exit, pending-request race, denied and unsupported devices.",
);
