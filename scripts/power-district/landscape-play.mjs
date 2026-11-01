import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { createLandscapePlay } from "../../public/games/city/landscape-play.mjs";
function setup({ reject = false, supported = true } = {}) {
  const dom = new JSDOM(
    '<button id="start">Start</button><button id="resume-city">Continue</button>',
  );
  const win = dom.window,
    doc = win.document;
  let locks = 0,
    unlocks = 0,
    fullscreens = 0;
  win.matchMedia = () => ({ matches: true });
  win.innerWidth = 390;
  win.innerHeight = 844;
  doc.documentElement.requestFullscreen = async () => {
    fullscreens++;
    if (reject) throw Error("Unavailable");
  };
  const screen = {
    orientation: {
      ...(supported
        ? {
            lock: async () => {
              locks++;
            },
          }
        : {}),
      unlock: () => {
        unlocks++;
      },
    },
  };
  const controller = createLandscapePlay({ doc, win, screen });
  return {
    doc,
    win,
    controller,
    counts: () => ({ locks, unlocks, fullscreens }),
    close: () => {
      controller.dispose();
      dom.window.close();
    },
  };
}
const a = setup();
a.win.dispatchEvent(new a.win.Event("resize"));
assert(
  a.doc.querySelector("aside").hidden,
  "landing does not show a rotation reminder before play",
);
await a.controller.start();
assert.deepEqual(a.counts(), { locks: 1, unlocks: 0, fullscreens: 1 });
assert.equal(
  a.doc.querySelector("[data-free-rotation]").textContent,
  "Allow rotation",
);
a.doc.querySelector("[data-free-rotation]").click();
assert.equal(a.counts().unlocks, 1);
assert(a.doc.querySelector("aside").hidden);
await a.controller.start();
assert.equal(
  a.counts().locks,
  1,
  "no repeated rotation after explicit opt-out",
);
a.close();
const b = setup({ reject: true });
await b.controller.start();
assert.equal(b.counts().locks, 0);
assert(!b.doc.querySelector("aside").hidden);
b.controller.allowRotation();
assert(b.doc.querySelector("aside").hidden);
b.close();
const c = setup({ supported: false });
await c.controller.start();
assert.equal(c.counts().fullscreens, 0);
assert.match(c.doc.querySelector("aside").textContent, /Turn your phone/);
c.win.innerWidth = 844;
c.win.innerHeight = 390;
c.win.dispatchEvent(new c.win.Event("resize"));
assert(c.doc.querySelector("aside").hidden);
c.close();
const d = setup();
d.win.innerWidth = 844;
d.win.innerHeight = 390;
await d.controller.start();
assert.equal(d.counts().locks, 0, "landscape play needs no lock");
d.close();
const e = setup();
let release;
const pause = new Promise((r) => (release = r));
e.doc.documentElement.requestFullscreen = () => pause;
const pending = e.controller.start();
e.controller.allowRotation();
release();
await pending;
assert.equal(e.counts().locks, 0, "late async request cannot override opt-out");
e.close();
const f = setup();
f.doc.querySelector("#resume-city").click();
await Promise.resolve();
await Promise.resolve();
assert.equal(f.counts().locks, 1, "Continue is an actual user-gesture entry");
f.close();
console.log(
  "PASS: landscape on supported portrait play, Continue gesture, unsupported/fullscreen failure, manual fallback, landscape no-op and late-request/opt-out recovery.",
);
