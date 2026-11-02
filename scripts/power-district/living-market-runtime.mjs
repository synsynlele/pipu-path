// Exercise the actual scene/controller with a no-draw renderer. This verifies
// geometry, controls and physical arrival; it does not claim GPU/visual QA.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
const root = process.cwd() + "/",
  base = root + "public/games/market-world/";
const dom = new JSDOM(readFileSync(base + "index.html", "utf8"), {
  url: "https://example.test/games/market-world/index.html",
  pretendToBeVisual: true,
});
const w = dom.window;
w.HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
w.HTMLDialogElement.prototype.close = function () {
  this.open = false;
  this.dispatchEvent(new w.Event("close"));
};
const ctx = new Proxy(
  {
    canvas: {},
    measureText: () => ({ width: 120 }),
    createLinearGradient: () => ({ addColorStop() {} }),
  },
  { get: (o, k) => (k in o ? o[k] : () => {}) },
);
w.HTMLCanvasElement.prototype.getContext = () => ctx;
for (const [key, value] of Object.entries({
  window: w,
  document: w.document,
  innerWidth: 390,
  innerHeight: 844,
  devicePixelRatio: 1,
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  requestAnimationFrame: () => {},
  localStorage: w.localStorage,
}))
  Object.defineProperty(globalThis, key, {
    value,
    writable: true,
    configurable: true,
  });
const three = pathToFileURL(
  root + "public/games/shared/vendor/three.module.js",
).href;
const mock = `export * from ${JSON.stringify(three)}; export class WebGLRenderer {constructor(){this.shadowMap={};}setPixelRatio(){}setSize(){}render(){}}`;
const mockURL =
  "data:text/javascript;base64," + Buffer.from(mock).toString("base64");
let code = readFileSync(base + "game.mjs", "utf8").replace(
  /from "(\.\.?\/[^\"]+)"/g,
  (_, p) =>
    "from " + JSON.stringify(new URL(p, pathToFileURL(base + "game.mjs")).href),
);
code = code.replace(JSON.stringify(three), JSON.stringify(mockURL));
const end = code.lastIndexOf("\n}");
code =
  code.slice(0, end) +
  "\n probe = {frame, world, camera, get state(){return state;}, get pending(){return pending;}, inspect, rebuildNavigation, scene};" +
  code.slice(end);
code = "let probe;\n" + code + "\nexport {probe};";
const { probe: g } = await import(
  "data:text/javascript;base64," + Buffer.from(code).toString("base64")
);
assert(g);
const $ = (id) => w.document.getElementById(id);
assert($("welcome").open);
$("begin").click();
assert(!$("welcome").open);
function step(seconds) {
  for (let i = 0; i < seconds * 30; i++) g.frame(1 / 30);
}
function build(kind) {
  $("build").click();
  w.document.querySelector(`[data-tool="${kind}"]`).click();
  $("context-action").click();
  assert.equal(
    g.state.buildings.some((b) => b.kind === kind),
    false,
    "work is not instantaneous",
  );
  for (
    let i = 0;
    i < 1800 && !g.state.buildings.some((b) => b.kind === kind);
    i++
  )
    g.frame(1 / 30);
  assert(
    g.state.buildings.some((b) => b.kind === kind),
    `${kind} reached and built: ${$("message").textContent}`,
  );
  assert(!$("graphics-error").hidden === false);
}
const canvas = $("world");
canvas.setPointerCapture = () => {};
function pointer(type, id, x, y) {
  const e = new w.Event(type, { bubbles: true });
  Object.assign(e, { pointerId: id, clientX: x, clientY: y });
  canvas.dispatchEvent(e);
}
const initialYaw = g.state.camera.yaw,
  initialPitch = g.state.camera.pitch;
pointer("pointerdown", 1, 100, 100);
pointer("pointermove", 1, 220, 150);
pointer("pointerup", 1, 220, 150);
assert.notEqual(g.state.camera.yaw, initialYaw);
assert.notEqual(g.state.camera.pitch, initialPitch);
const initialDistance = g.state.camera.distance;
pointer("pointerdown", 1, 100, 100);
pointer("pointerdown", 2, 200, 100);
pointer("pointermove", 2, 260, 120);
pointer("pointerup", 1, 100, 100);
pointer("pointerup", 2, 260, 120);
assert(
  g.state.camera.distance < initialDistance,
  "pinch zoom works without triggering a tap",
);
assert.equal(g.pending, null);
const startPosition = g.world.player.g.position.clone();
w.document.dispatchEvent(
  new w.KeyboardEvent("keydown", { key: "w", bubbles: true }),
);
step(1);
w.document.dispatchEvent(
  new w.KeyboardEvent("keyup", { key: "w", bubbles: true }),
);
assert(
  g.world.player.g.position.distanceTo(startPosition) > 0.2,
  "free camera-relative walking",
);
const stopped = g.world.player.g.position.clone();
step(1);
assert(g.world.player.g.position.distanceTo(stopped) < 0.001);
assert.equal(g.state.cash, 90);
assert.equal(g.state.buildings.length, 0);
$("centre").click();
for (const kind of ["crates", "team", "cargo"]) build(kind);
$("run").click();
step(100);
assert.equal(g.state.result?.success, true);
assert($("result").open);
assert.equal(g.state.served, 12);
$("result-next").click();
assert.equal(g.state.phase, 2);
$("run").click();
step(100);
assert.equal(g.state.result?.success, true);
assert.equal(g.state.served, 12);
const before = g.camera.position.clone();
$("view").click();
step(1);
const far = g.camera.position.clone();
$("zoom-in").click();
step(1);
assert(
  g.camera.position.distanceTo(far) > 1,
  "overview zoom changes the actual camera",
);
assert(before.distanceTo(far) > 1);
$("result-next").click();
step(120);
assert(g.state.observing);
assert(g.state.running);
assert(g.state.day >= 4);
assert(w.localStorage.getItem("pipupath.living-market.v1"));
// Every offered tool has a physically reachable suggested placement.
$("restart").click();
$("restart").click();
for (const kind of ["solar", "battery", "coldroom", "shade"]) build(kind);
$("restart").click();
$("restart").click();
for (const kind of ["bridge", "shade"]) build(kind);
for (const b of [...g.state.buildings]) {
  g.inspect(b.id);
  $("context-action").click();
  step(60);
  assert(
    !g.state.buildings.some((a) => a.id === b.id),
    "reclaim requires arrival and removes structure",
  );
}
assert.equal(g.state.cash, 90);
assert.equal(g.state.materials, 40);
// Restore a visible build for the geometry assertion.
build("crates");
let meshes = 0;
g.world.buildRoot.traverse((o) => {
  if (o.isMesh) meshes++;
});
assert(meshes > 0);
assert(g.camera.far > 500);
assert(g.scene.fog.far > g.camera.position.length());
assert.equal($("graphics-error").hidden, true);
console.log(
  "PASS: actual controller and Three scene initialize; avatar physically builds all eight tools; both complete market trials pass via UI handlers; local checkpoint, whole-city zoom and ongoing resident operation work. GPU rendering remains unverified.",
);
