import assert from "node:assert/strict";
import { createCityAudio } from "../../public/games/city/city-audio.mjs";
const events = [];
let scheduled = null;
const mock = {
  currentTime: 1,
  destination: {},
  resume() {
    return Promise.resolve();
  },
  suspend() {
    return Promise.resolve();
  },
  createOscillator() {
    return {
      type: "sine",
      frequency: { setValueAtTime: (f) => events.push(["freq", f]) },
      connect() {},
      start(t) {
        events.push(["start", t]);
      },
      stop() {
        events.push(["stop"]);
      },
    };
  },
  createGain() {
    return {
      gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      connect() {},
    };
  },
};
let calls = 0,
  cleared = 0;
const audio = createCityAudio({
  contextFactory: () => {
    calls++;
    return mock;
  },
  schedule: (fn, ms) => {
    scheduled = fn;
    assert.equal(ms, 760);
    return 8;
  },
  cancel: (id) => {
    assert.equal(id, 8);
    cleared++;
  },
});
assert.equal(audio.sound, false);
assert.equal(audio.music, false);
assert.equal(audio.cue("built"), false);
assert.equal(calls, 0, "No audio context before user consent");
assert.equal(audio.toggleSound(), true);
assert.equal(calls, 1);
assert.equal(audio.cue("built"), true);
assert(events.filter((x) => x[0] === "freq").length >= 5);
assert.equal(audio.toggleMusic(), true);
assert.equal(audio.music, true);
const before = events.length;
scheduled();
assert(events.length > before);
assert.equal(audio.toggleMusic(), false);
assert.equal(cleared, 1);
assert.equal(audio.music, false);
assert.equal(audio.toggleSound(), false);
const unsupported = createCityAudio({ contextFactory: () => null });
assert.equal(unsupported.toggleSound(), false);
assert.equal(unsupported.toggleMusic(), false);
console.log(
  "PASS: no unsolicited audio, independent sound/music, original cues, cancellable ambient motif, unsupported-device fallback.",
);
