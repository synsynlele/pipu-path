import assert from "node:assert/strict";
import { createCityAudio } from "../../public/games/city/city-audio.mjs";

const events = [];
let scheduled = null;
let pending = null;
let resolvesResume = false;
let timersCancelled = 0;
const context = {
  state: "suspended",
  currentTime: 1,
  destination: {},
  resume() {
    events.push(["resume"]);
    if (resolvesResume) {
      this.state = "running";
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      pending = () => {
        this.state = "running";
        resolve();
      };
    });
  },
  suspend() {
    this.state = "suspended";
    return Promise.resolve();
  },
  createOscillator() {
    return {
      type: "sine",
      frequency: { setValueAtTime: (v) => events.push(["note", v]) },
      connect() {},
      start() {
        events.push(["start"]);
      },
      stop() {},
    };
  },
  createGain() {
    return {
      gain: {
        setValueAtTime() {},
        exponentialRampToValueAtTime(v) {
          events.push(["volume", v]);
        },
      },
      connect() {},
    };
  },
};
const audio = createCityAudio({
  contextFactory: () => context,
  schedule: (fn, ms) => {
    assert.equal(ms, 250);
    scheduled = fn;
    return 3;
  },
  cancel: (id) => {
    assert.equal(id, 3);
    timersCancelled++;
  },
});
assert.equal(audio.sound, false);
assert.equal(audio.music, false);
assert.equal(audio.cue("built"), false);
const first = audio.start();
assert.equal(audio.sound, false, "Must not claim sound on before resume");
assert.equal(audio.music, false, "Must not claim music on before resume");
assert.equal(events.filter((e) => e[0] === "resume").length, 1);
pending();
assert.equal(await first, true);
assert.equal(audio.available, true);
assert.equal(audio.sound, true);
assert.equal(audio.music, true);
assert(events.filter((e) => e[0] === "note").length >= 5);
assert(events.some((e) => e[0] === "volume" && e[1] >= 0.045));
assert.equal(audio.musicVolume, 0.85);
assert.equal(audio.effectsVolume, 1);
assert(
  events.some((e) => e[0] === "volume" && e[1] >= 0.3),
  "Effects must have the higher default amplitude",
);
const previous = events.length;
scheduled();
assert(events.length > previous, "Background beat must be audible");
const beforeMute = events.length;
assert.equal(audio.setVolume("music", 0), true);
scheduled();
assert.equal(events.length, beforeMute, "Zero music volume must emit no notes");
audio.setVolume("music", 0.85);
audio.setVolume("effects", 0);
assert.equal(audio.cue("built"), false);
audio.setVolume("effects", 1);
assert.equal(audio.setVolume("music", NaN), false);
assert.equal(await audio.toggleMusic(), false);
assert.equal(timersCancelled, 1);
assert.equal(await audio.toggleSound(), false);
assert.equal(audio.cue("built"), false);
assert.equal(await audio.toggleSound(), true);
const noteCount = events.length;
assert(noteCount > previous, "Re-enabling sound previews a real tone");
audio.suspend();
assert.equal(audio.music, false);

const blocked = createCityAudio({
  contextFactory: () => ({
    state: "suspended",
    resume: () => Promise.reject(new Error("NotAllowedError")),
  }),
});
assert.equal(await blocked.start(), false);
assert.equal(blocked.sound, false);
assert.equal(blocked.music, false);
assert.match(blocked.error, /blocked/i);
const unavailable = createCityAudio({ contextFactory: () => null });
assert.equal(await unavailable.start(), false);
assert.equal(unavailable.available, false);
assert.match(unavailable.error, /support/i);
resolvesResume = true;
console.log(
  "PASS: verified async resume, real audible notes and music, no false-on switches, gesture feedback, blocked fallback, and independent mute.",
);
