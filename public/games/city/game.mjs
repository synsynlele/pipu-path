import * as T from "../shared/vendor/three.module.js";
import { SoftwareRenderer } from "../shared/software-renderer.mjs";
import { createCaseSceneEffects } from "./scene-feedback.mjs";
import { deriveBuilderCity } from "./city-growth.mjs";
import { cityViewSummary, findCityViewDistrict } from "./city-view.mjs";
import { chapterPressure } from "./chapter-two.mjs";
import {
  firstUnanswered,
  recoverJourney,
  foundationComplete,
  chapterForCase,
  isChapterTransition,
  nextPlayableAfter,
} from "./journey-flow.mjs";
import { previousKeptCase, canRevise } from "./decision-review.mjs";
import { CASE_BUILD_SITES, feedbackCopy, visualTone } from "./feedback.mjs";
import { createNavigator } from "../shared/navigation.mjs";
import {
  CASE_DISTRICTS,
  FOUNDATION_CASE_COUNT,
  CITY_CASES,
  IMPACT_LABELS,
  casesFor,
  getCase,
  getChoice,
  saveDecision,
  caseProgress,
  districtProgress,
} from "./cases.mjs";
import { loadPractice, savePractice, clearPractice } from "./practice-save.mjs";
import { choicesForCase, caseNumber, OUTCOME_VIEW_MS } from "./case-flow.mjs";
import {
  CITY_DISTRICTS,
  OUTER_DISTRICTS,
  FOUNDATION_DISTRICTS,
  DISTRICT_INDEX,
  createOuterDistricts,
} from "./districts.mjs";
import {
  initialPlan,
  INITIAL_CASH,
  quote,
  evaluateCity,
  adoptDay,
} from "./model.mjs";
const $ = (id) => document.getElementById(id),
  clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fresh = () => ({
  day: 1,
  cash: INITIAL_CASH,
  owned: initialPlan(),
  config: initialPlan(),
  seen: [],
  history: [],
  handedOver: false,
  reflection: "",
  decisions: {},
  journey: null,
});
const previousPractice = loadPractice();
// Once per current play session: stable positions while retrying each case,
// varied across sessions; no learner tracking or personally identifiable data.
const answerOrderSeed = Math.floor(Math.random() * 3);
let state = previousPractice ? { ...fresh(), ...previousPractice } : fresh(),
  saveEnabled = Boolean(previousPractice),
  freeExplore = false,
  mapMode = false,
  guideExpanded = true,
  dockExpanded = false,
  simulating = false,
  simPeriod = -1,
  simRows = [],
  lastResult = null,
  sound = false;
let cityAudio;
function playTone(frequency = 520) {
  if (!sound) return;
  try {
    cityAudio ??= new (window.AudioContext || window.webkitAudioContext)();
    cityAudio.resume();
    const o = cityAudio.createOscillator(),
      g = cityAudio.createGain();
    o.frequency.value = frequency;
    g.gain.setValueAtTime(0.025, cityAudio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, cityAudio.currentTime + 0.2);
    o.connect(g);
    g.connect(cityAudio.destination);
    o.start();
    o.stop(cityAudio.currentTime + 0.2);
  } catch {}
}
let toastTimer;
function toast(msg) {
  $("toast").textContent = msg;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 3200);
}
let renderer;
try {
  renderer = new T.WebGLRenderer({
    canvas: $("world"),
    antialias: true,
    alpha: false,
    powerPreference: "low-power",
  });
} catch {
  const old = $("world"),
    replacement = old.cloneNode();
  old.replaceWith(replacement);
  renderer = new SoftwareRenderer(replacement);
  $("webgl-note").textContent =
    "Software 3D mode is active on this device. All mission interactions remain available.";
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.4));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
renderer.setClearColor(0xe9e2d2);
renderer.outputColorSpace = T.SRGBColorSpace;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
const scene = new T.Scene();
scene.fog = new T.Fog(0xe9e2d2, 115, 225);
const camera = new T.PerspectiveCamera(39, innerWidth / innerHeight, 0.1, 260);
let yaw = 0.8,
  pitch = 0.72,
  distance = 84,
  target = new T.Vector3(0, 0, 0),
  desiredTarget = new T.Vector3(0, 0, 0);
const hemi = new T.HemisphereLight(0xfff9e4, 0x798268, 2.9);
scene.add(hemi);
const sun = new T.DirectionalLight(0xffe1af, 3.5);
sun.position.set(-12, 20, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -62;
sun.shadow.camera.right = 62;
sun.shadow.camera.top = 52;
sun.shadow.camera.bottom = -52;
sun.shadow.normalBias = 0.04;
scene.add(sun);
const mats = {};
function mat(c, rough = 0.85) {
  return (mats[c] ??= new T.MeshStandardMaterial({
    color: c,
    roughness: rough,
  }));
}
function box(w, h, d, c, x = 0, y = 0, z = 0, parent = scene) {
  const m = new T.Mesh(
    new T.BoxGeometry(
      w,
      h,
      d,
      w > 4 ? Math.ceil(w / 1.5) : 1,
      h > 4 ? Math.ceil(h / 1.5) : 1,
      d > 4 ? Math.ceil(d / 1.5) : 1,
    ),
    typeof c === "string" || typeof c === "number" ? mat(c) : c,
  );
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function cyl(r, h, c, x, y, z, parent = scene, r2 = r, sides = 12) {
  const m = new T.Mesh(new T.CylinderGeometry(r2, r, h, sides), mat(c));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function textPlane(
  text,
  w,
  h,
  x,
  y,
  z,
  bg = "#365342",
  color = "#f3ebd8",
  parent = scene,
) {
  const cv = document.createElement("canvas");
  cv.width = 768;
  cv.height = 128;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 768, 128);
  ctx.fillStyle = color;
  ctx.font = "bold 47px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 384, 68);
  const mesh = new T.Mesh(
    new T.PlaneGeometry(w, h),
    new T.MeshBasicMaterial({
      map: new T.CanvasTexture(cv),
      side: T.DoubleSide,
    }),
  );
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}
box(200, 0.3, 200, 0xe5ddc9, 0, -0.6, 0);
const island = box(120, 0.45, 102, 0xc2bf9e, 0, -0.25, 0);
box(120.2, 0.12, 102.2, 0xddd7bd, 0, 0, 0);
// District roads connect one continuous world. Surface paint never blocks walking.
for (const z of [-39, 6.7, 39]) box(115, 0.04, 3.5, 0x818586, 0, 0.105, z);
for (const x of [-45, -10, 6, 47]) box(3.5, 0.04, 98, 0x818586, x, 0.105, 0);
for (const z of [-36.85, 9, 41.2]) box(115, 0.025, 0.36, 0xb7ad9c, 0, 0.135, z);
for (const x of [-42.85, -7.85, 8.15, 49.15])
  box(0.36, 0.025, 97, 0xb7ad9c, x, 0.135, 0);
for (const [x, z] of [
  [-36, -9],
  [-30, 22],
  [32, 20],
  [10, 23],
  [-25, -20],
  [28, -18],
]) {
  box(8, 0.025, 8, 0x9aae87, x, 0.137, z);
}
for (const z of [-39, 39])
  for (const x of [-32, -20, -3, 12, 32, 40]) {
    const paint = box(1.5, 0.018, 0.13, 0xe7e3d6, x, 0.141, z);
    paint.userData.ignoreNavigation = true;
  }
// Low-profile roads and future lots are scenery, not invisible walls.
box(3.8, 0.04, 41, 0x818586, 6, 0.1, 0);
box(49, 0.04, 3.2, 0x818586, 0, 0.1, 6.7);
box(3.2, 0.04, 32, 0x818586, -10, 0.1, 1);
box(45, 0.04, 3, 0x818586, 0, 0.1, -12);
// Pavement edges and zebra crossings make the streets legible from above.
for (const x of [3.95, 8.05, -12.05, -7.95])
  box(0.14, 0.035, x > 0 ? 40 : 31, 0xb9b4a4, x, 0.14, 0);
for (const z of [4.94, 8.46, -13.65, -10.35])
  box(z > 0 ? 48 : 44, 0.035, 0.14, 0xb9b4a4, 0, 0.14, z);
for (const x of [-0.8, -0.15, 0.5, 1.15, 2]) {
  const stripe = box(0.33, 0.018, 2.35, 0xeee9d9, x, 0.156, 6.7);
  stripe.userData.ignoreNavigation = true;
}
for (const z of [-3, -2.3, -1.6, -0.9, -0.2]) {
  const stripe = box(2.4, 0.018, 0.32, 0xeee9d9, 6, 0.156, z);
  stripe.userData.ignoreNavigation = true;
}
for (let z = -19; z < 20; z += 2.1)
  box(0.12, 0.015, 0.95, 0xe7d9b7, 6, 0.13, z);
for (let x = -23; x < 24; x += 2.1)
  box(0.95, 0.015, 0.12, 0xe7d9b7, x, 0.13, 6.7);
box(8, 0.03, 8, 0x91ac7c, -8, 0.11, -11);
box(7, 0.03, 6, 0xa5bd8b, 15, 0.11, 15);
// Cutaway workshop: open south and east walls preserve sightlines.
// A raised concrete apron and timber awning add depth without hiding the work.
box(10.1, 0.09, 0.75, 0x9f9480, -2, 0.21, 2.68);
for (const x of [-6.2, -3.2, -0.2, 2]) {
  const beam = box(0.1, 0.14, 1.7, 0x75553e, x, 3.27, 2.28);
  beam.userData.ignoreNavigation = true;
}
for (let i = 0; i < 7; i++) {
  const sheet = box(
    9.0,
    0.055,
    0.12,
    i % 2 ? 0x65736d : 0x75857a,
    -2,
    3.37,
    1.55 + i * 0.21,
  );
  sheet.userData.ignoreNavigation = true;
}
// Cutaway workshop: open south and east walls preserve sightlines.
box(9, 0.24, 7.2, 0xc7baa1, -2, 0.15, -1);
box(9, 0.15, 0.15, 0xa89978, -2, 0.32, 2.6);
box(9, 3.6, 0.22, 0xc38c60, -2, 1.95, -4.6);
box(0.22, 3.6, 7.2, 0xb97e55, -6.5, 1.95, -1);
for (const x of [-6.35, 2.3])
  for (const z of [-4.45, 2.4]) box(0.2, 3.7, 0.2, 0x76654b, x, 2, z);
box(9.2, 0.22, 0.35, 0x796c50, -2, 3.8, -4.5);
box(0.35, 0.22, 7.2, 0x796c50, -6.4, 3.8, -1);
textPlane("TOMORROW REPAIR CO-OP", 5.8, 0.75, -2, 3.02, -4.46);
box(2.8, 0.12, 1.05, 0x7d6e51, -4, 1.05, -3.7);
for (const x of [-5.1, -2.9])
  for (const z of [-4, -3.35]) box(0.1, 1, 0.1, 0x4a5144, x, 0.55, z);
// Tools on back wall.
for (let i = 0; i < 8; i++) {
  box(
    0.045,
    0.45 + (i % 3) * 0.1,
    0.08,
    0x55645a,
    -5.3 + i * 0.37,
    2.05,
    -4.41,
  );
  box(0.17, 0.09, 0.1, 0xafaa8c, -5.3 + i * 0.37, 2.3, -4.36);
}
const machines = [];
function machine(x, z, c) {
  const g = new T.Group();
  scene.add(g);
  g.position.set(x, 0.3, z);
  box(1.2, 0.75, 0.9, c, 0, 0.375, 0, g);
  box(1.45, 0.1, 1, 0x8c9688, 0, 0.8, 0, g);
  box(0.3, 0.8, 0.35, 0x4e625c, 0.36, 1.22, 0, g);
  const wheel = cyl(0.26, 0.1, 0x343e37, 0.36, 1.64, 0.17, g);
  wheel.rotation.x = Math.PI / 2;
  const spindle = box(0.1, 0.25, 0.1, 0xc8c5ac, 0.36, 1.22, 0.35, g);
  machines.push({ g, wheel, spindle });
  return g;
}
machine(-4.5, 0, 0x708b80);
machine(-1.3, -2.2, 0xb1ac78);
box(2.1, 0.14, 1, 0x927955, -1, 1.1, 1.15);
for (const x of [-1.8, -0.2]) box(0.12, 1, 0.65, 0x7d6e51, x, 0.6, 1.15);
box(0.65, 0.3, 0.5, 0x8b6548, -1, 1.33, 1.15);
// School pavilion — move the completed group to its own district.
const schoolStart = scene.children.length;
box(3.8, 0.2, 3.3, 0xd1c4a5, -5, 0.2, 5.3);
for (const x of [-6.6, -3.4])
  for (const z of [4, 6.6]) box(0.12, 2.7, 0.12, 0x837759, x, 1.6, z);
const roof = box(4.3, 0.16, 3.8, 0x87936b, -5, 3, 5.3);
roof.rotation.z = 0.05;
box(2.5, 1.15, 0.1, 0x3b5c4a, -5, 1.9, 3.9);
textPlane("LEARN • BUILD • SHARE", 2.1, 0.3, -5, 2, 3.97, "#3b5c4a");
for (const z of [4.8, 5.8]) {
  box(2.5, 0.09, 0.6, 0xb59360, -5, 0.9, z);
  for (const x of [-5.9, -4.1]) box(0.09, 0.8, 0.1, 0x7c7557, x, 0.45, z);
}
for (const object of scene.children.slice(schoolStart)) {
  object.position.x -= 10;
  object.position.z += 7;
}
// Solar garden.
const solarBase = new T.Group();
scene.add(solarBase);
solarBase.position.set(1.8, 0, -6.7);
const extraSolar = new T.Group();
scene.add(extraSolar);
extraSolar.position.set(-2.8, 0, -6.7);
function panel(parent, x) {
  box(0.12, 1.05, 0.12, 0x727b69, x, 0.65, 0, parent);
  const g = new T.Group();
  g.position.set(x, 1.45, 0);
  g.rotation.x = -0.32;
  parent.add(g);
  box(2, 0.09, 1.35, 0x4d625e, 0, 0, 0, g);
  box(1.88, 0.025, 1.23, 0x2e5263, 0, 0.065, 0, g);
  for (let i = -0.7; i < 1; i += 0.45)
    box(0.015, 0.012, 1.22, 0x78979c, i, 0.083, 0, g);
  box(1.85, 0.015, 0.015, 0x78979c, 0, 0.087, 0, g);
}
panel(solarBase, -1.1);
panel(solarBase, 1.1);
panel(extraSolar, -1.1);
panel(extraSolar, 1.1);
// Battery cabinet.
const battery = new T.Group();
scene.add(battery);
battery.position.set(2, 0.35, -3.6);
box(1.15, 1.6, 0.75, 0x477d72, 0, 0.8, 0, battery);
box(1, 1.4, 0.03, 0x81a59a, 0, 0.8, 0.39, battery);
textPlane("ENERGY", 0.75, 0.2, 0, 1.3, 0.414, "#81a59a", "#eaf0d8", battery);
const batteryBars = [];
for (let i = 0; i < 4; i++)
  batteryBars.push(
    box(0.6, 0.1, 0.03, 0xc4db99, 0, 0.55 + i * 0.15, 0.43, battery),
  );
const spareBox = box(0.8, 0.55, 0.65, 0xbd874e, 1, 0.6, -1.8);
textPlane("CARE KIT", 0.64, 0.17, 1, 0.65, -1.465, "#bd874e");
// Control console with lamps.
box(0.75, 1.25, 0.5, 0x536b5e, 2, 0.95, 0.4);
box(0.9, 0.35, 0.65, 0xc7c4a7, 2, 1.65, 0.4);
const lampMat = new T.MeshStandardMaterial({
  color: 0x91bd60,
  emissive: 0x74a847,
  emissiveIntensity: 0.6,
});
const statusLamp = new T.Mesh(new T.SphereGeometry(0.12, 12, 8), lampMat);
statusLamp.position.set(2.26, 1.9, 0.59);
scene.add(statusLamp);
const lamps = [];
for (const p of [
  [-3, 2.8, -1],
  [-15, 2.5, 12.3],
]) {
  const g = new T.Group();
  g.position.set(...p);
  scene.add(g);
  cyl(0.22, 0.12, 0x60674e, 0, 0, 0, g);
  const bulb = new T.Mesh(
    new T.SphereGeometry(0.12, 10, 8),
    new T.MeshStandardMaterial({
      color: 0xffe8a2,
      emissive: 0xffcb60,
      emissiveIntensity: 1,
    }),
  );
  bulb.position.y = -0.11;
  g.add(bulb);
  lamps.push(bulb);
}
// The city keeps repeated scenery lightweight and outside collision sampling.
function visual(mesh) {
  mesh.userData.ignoreNavigation = true;
  return mesh;
}
function streetLight(x, z) {
  visual(cyl(0.055, 3.55, 0x4b5b64, x, 1.9, z));
  visual(box(0.75, 0.09, 0.14, 0x4b5b64, x + 0.33, 3.55, z));
  const glass = new T.Mesh(
    new T.SphereGeometry(0.14, 10, 8),
    new T.MeshStandardMaterial({
      color: 0xffebba,
      emissive: 0xf5c777,
      emissiveIntensity: 0.65,
    }),
  );
  glass.position.set(x + 0.62, 3.43, z);
  visual(glass);
  scene.add(glass);
}
function parkSeat(x, z) {
  for (const dz of [-0.36, 0.36])
    visual(box(1.7, 0.12, 0.18, 0x8d6348, x, 0.6, z + dz));
  visual(box(1.7, 0.68, 0.12, 0x8d6348, x, 0.99, z - 0.39));
  for (const dx of [-0.67, 0.67])
    visual(box(0.1, 0.61, 0.1, 0x435561, x + dx, 0.35, z));
}
for (const [x, z] of [
  [-12, -7],
  [-12, 10],
  [4, -17],
  [8, 16],
  [17, 4],
  [-2, 4],
])
  streetLight(x, z);
parkSeat(-4, 12);
parkSeat(12, 14);
// Everyday life around the cooperative.
function tree(x, z, s = 1) {
  const g = new T.Group();
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  scene.add(g);
  cyl(0.12, 1.8, 0x8b7352, 0, 0.9, 0, g);
  for (const [a, b, c, r] of [
    [0, 2.4, 0, 1],
    [-0.55, 2, 0.2, 0.7],
    [0.55, 2.25, -0.2, 0.75],
  ]) {
    const m = new T.Mesh(
      new T.IcosahedronGeometry(r, 0),
      mat(c === 0 ? 0x879b64 : 0x738957),
    );
    m.position.set(a, b, c);
    m.castShadow = true;
    m.userData.ignoreNavigation = true;
    g.add(m);
  }
}
for (const [x, z, s] of [
  [-9, -6, 1.3],
  [-9, 3, 1],
  [-8, 7, 1.2],
  [10, -6, 1.4],
  [10, 5, 1.1],
  [2, 7, 1],
])
  tree(x, z, s);
for (let i = 0; i < 17; i++) {
  const x = Math.sin(i * 7) * 10,
    z = Math.cos(i * 5) * 8;
  if (x > 4 && x < 8) continue;
  box(0.35, 0.18, 0.3, 0xa2a67b, x, 0.2, z);
}
// Procedural masonry keeps eight distinctive houses textured without an asset download.
const masonryCache = new Map();
function masonry(c) {
  if (masonryCache.has(c)) return masonryCache.get(c);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f4f1e9";
  ctx.fillRect(0, 0, 128, 128);
  for (let row = 0; row < 8; row++) {
    for (let col = -1; col < 5; col++) {
      const offset = row % 2 ? 14 : 0;
      const x = col * 32 + offset;
      const shade = 223 + ((row * 17 + col * 11 + 100) % 25);
      ctx.fillStyle =
        "rgb(" + shade + "," + (shade - 4) + "," + (shade - 12) + ")";
      ctx.fillRect(x + 1, row * 16 + 1, 30, 14);
    }
  }
  const texture = new T.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = T.RepeatWrapping;
  texture.repeat.set(2, 1.6);
  texture.colorSpace = T.SRGBColorSpace;
  const material = new T.MeshStandardMaterial({
    color: c,
    map: texture,
    roughness: 0.94,
  });
  masonryCache.set(c, material);
  return material;
}
function building(x, z, w, h, d, c) {
  box(w, h, d, masonry(c), x, h / 2, z);
  const trim = 0xe0d3b8;
  const roofColor = Math.round(x + z) & 1 ? 0x746d5c : 0x62746d;
  const rise = Math.min(1.15, w * 0.24);
  const slope = Math.atan2(rise, w / 2 + 0.3);
  const roofWidth = Math.hypot(w / 2 + 0.3, rise) + 0.18;
  for (const side of [-1, 1]) {
    const roof = visual(
      box(
        roofWidth,
        0.19,
        d + 0.58,
        roofColor,
        x + side * (w / 4 + 0.1),
        h + rise / 2,
        z,
      ),
    );
    roof.rotation.z = -side * slope;
  }
  // Recessed front door, inset windows, ledges and contrasting trim.
  visual(box(1.02, 1.68, 0.11, 0x705d49, x, 0.89, z + d / 2 + 0.075));
  visual(box(0.7, 0.12, 0.12, 0xb6a17a, x, 1.65, z + d / 2 + 0.15));
  visual(cyl(0.045, 0.035, 0xe2c579, x + 0.3, 0.82, z + d / 2 + 0.16));
  visual(box(1.55, 0.13, 0.42, 0x9f937d, x, 0.095, z + d / 2 + 0.29));
  for (const side of [-1, 1]) {
    const px = x + side * w * 0.31;
    const pz = z + d / 2 + 0.075;
    visual(box(0.88, 0.85, 0.065, trim, px, h * 0.58, pz));
    visual(box(0.7, 0.69, 0.075, 0x446d79, px, h * 0.58, pz + 0.04));
    visual(box(0.055, 0.72, 0.085, 0xd9d3bb, px, h * 0.58, pz + 0.088));
    visual(box(0.72, 0.055, 0.085, 0xd9d3bb, px, h * 0.58, pz + 0.09));
    visual(box(0.93, 0.09, 0.25, 0xb2a18a, px, h * 0.58 - 0.48, pz + 0.12));
  }
  // Roof ridge and rainwater pipe.
  visual(box(0.13, 0.11, d + 0.55, 0xada58c, x, h + rise + 0.03, z));
  visual(
    cyl(0.035, h - 0.1, 0x87918a, x + w / 2 - 0.08, h / 2, z + d / 2 + 0.08),
  );
}
building(9, -10, 5, 3, 3, 0xcbad80);
building(-9, -12, 5, 4, 4, 0xc4a37c);
building(12, 0, 3, 2.5, 4, 0xd9c89a);
building(0, -14, 5, 2.6, 3, 0xbca47b);
building(-20, -14, 4, 2.6, 3, 0xc8ab85);
building(20, -14, 4, 3.2, 3, 0xb8a582);
building(-20, 18, 4, 2.8, 3, 0xcab999);
building(20, 17, 4, 2.8, 3, 0xb3a283);
for (const [x, z, scale] of [
  [-19, -4, 1.4],
  [-17, 9, 1.3],
  [-10, 18, 1.2],
  [12, 19, 1.4],
  [23, 0, 1.2],
  [20, -6, 1.3],
  [-2, 17, 1.4],
])
  tree(x, z, scale);
// Cargo tricycle.
const bike = new T.Group();
bike.position.set(6, 0.4, 3.8);
scene.add(bike);
box(1, 0.8, 1.4, 0xb97442, 0, 0.4, 0, bike);
for (const x of [-0.65, 0.65]) {
  const wheel = cyl(0.32, 0.15, 0x3e493e, x, 0.05, 0, bike);
  wheel.rotation.z = Math.PI / 2;
}
const bw = cyl(0.28, 0.1, 0x3e493e, 0, 0.05, 1.1, bike);
bw.rotation.z = Math.PI / 2;
box(0.1, 0.7, 0.1, 0x5d6857, 0, 0.6, 0.9, bike);
function person(x, z, shirt, skin = 0x815239) {
  const g = new T.Group();
  g.userData.character = true;
  g.position.set(x, 0.3, z);
  scene.add(g);
  // Layered clothing, facial features and varied silhouettes remain low-poly
  // enough for constrained mobile devices.
  cyl(0.23, 0.7, shirt, 0, 1.03, 0, g, 0.3);
  visual(box(0.47, 0.1, 0.32, 0xe3cda9, 0, 1.37, 0.02, g));
  const head = new T.Mesh(new T.SphereGeometry(0.21, 12, 10), mat(skin));
  head.position.set(0, 1.6, 0);
  head.castShadow = true;
  g.add(head);
  const hair = new T.Mesh(new T.SphereGeometry(0.215, 12, 9), mat(0x292d2b));
  hair.scale.set(1.03, 0.42, 1.01);
  hair.position.set(0, 1.76, -0.018);
  visual(hair);
  g.add(hair);
  for (const side of [-1, 1]) {
    const eye = new T.Mesh(new T.SphereGeometry(0.023, 8, 6), mat(0x222523));
    eye.position.set(side * 0.088, 1.62, 0.192);
    visual(eye);
    g.add(eye);
    visual(box(0.05, 0.015, 0.012, 0x5d3427, side * 0.035, 1.49, 0.209, g));
  }
  const legs = [];
  const arms = [];
  for (const k of [-1, 1]) {
    legs.push(box(0.17, 0.62, 0.2, 0x3d4d59, k * 0.115, 0.37, 0, g));
    visual(box(0.19, 0.12, 0.32, 0x333a3e, k * 0.115, 0.075, 0.07, g));
    const arm = cyl(0.085, 0.61, shirt, k * 0.3, 1.0, 0, g);
    arm.rotation.z = k * 0.15;
    arms.push(arm);
    visual(cyl(0.068, 0.14, skin, k * 0.34, 0.63, 0, g));
  }
  return { g, legs, arms };
}
const ama = person(-3.3, -2.7, 0xcb884d),
  bisi = person(-14.6, 11, 0x74978b),
  tunde = person(1.4, -0.8, 0x9b9d63);
const player = person(4, 4, 0x547aa2, 0x9b6343);
player.g.scale.setScalar(0.9);
box(0.33, 0.42, 0.12, 0xb36742, 0, 1.1, -0.21, player.g);
const walkTarget = new T.Vector3(4, 0.3, 4);
const marker = new T.Mesh(
  new T.RingGeometry(0.3, 0.38, 32),
  new T.MeshBasicMaterial({
    color: 0xf6f4d6,
    transparent: true,
    opacity: 0.6,
    side: T.DoubleSide,
  }),
);
marker.rotation.x = -Math.PI / 2;
marker.position.set(4, 0.18, 4);
scene.add(marker);
// Cables show the route from generation to control to users.
function cable(points, color) {
  const curve = new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p)));
  const mesh = new T.Mesh(
    new T.TubeGeometry(curve, 40, 0.025, 6, false),
    mat(color),
  );
  scene.add(mesh);
}
cable(
  [
    [1.8, 0.2, -6.5],
    [3.2, 0.2, -5],
    [3.2, 0.2, 0.4],
    [2, 0.2, 0.4],
  ],
  0x6b7862,
);
cable(
  [
    [2, 0.2, 0.4],
    [0, 0.2, 2.8],
    [-5, 0.2, 3.4],
    [-5, 0.2, 5],
  ],
  0x8f9b64,
);
// Harvest Exchange is a separate, reachable district of the same city.
const marketStart = scene.children.length;
tunde.g.position.set(7.3, 0.3, 1.8);
box(3.5, 0.12, 5.8, 0xcbbd9b, 8, 0.25, -1.1);
for (const x of [6.6, 9.5])
  for (const z of [-2.5, 0.9]) box(0.1, 3, 0.1, 0x7d725c, x, 1.7, z);
box(3.5, 0.16, 3.9, 0x243b78, 8, 3.3, -0.8);
for (let i = 0; i < 7; i++)
  visual(
    box(
      0.12,
      0.018,
      3.8,
      i % 2 ? 0xe5c96f : 0xf0e1bf,
      6.4 + i * 0.47,
      3.395,
      -0.8,
    ),
  );
visual(box(2.75, 0.13, 0.75, 0xa88464, 8, 0.98, 0.65));
for (const x of [7.0, 9.0])
  visual(box(0.1, 0.86, 0.12, 0x705c4c, x, 0.53, 0.65));
textPlane("HARVEST EXCHANGE", 2.8, 0.45, 8, 2.85, 1.18, "#243b78", "#eed68c");
const crates = [];
for (let i = 0; i < 10; i++) {
  const g = new T.Group();
  g.position.set(7.1 + (i % 3) * 0.68, 0.3, -2.1 + Math.floor(i / 3) * 0.7);
  scene.add(g);
  box(0.52, 0.42, 0.5, 0xa87a48, 0, 0.23, 0, g);
  const produce = box(
    0.4,
    0.1,
    0.37,
    i < 2 ? 0x806b49 : 0x719057,
    0,
    0.49,
    0,
    g,
  );
  for (let n = 0; n < 3; n++)
    box(0.055, 0.04, 0.52, 0xcb9e65, -0.2 + n * 0.2, 0.47, 0, g);
  crates.push({ g, produce });
}
const coldRoom = new T.Group();
coldRoom.position.set(8, 0.3, -4.8);
scene.add(coldRoom);
box(2.6, 2.2, 1.8, 0xd7e0dc, 0, 1.1, 0, coldRoom);
box(1.1, 1.8, 0.06, 0x809caa, 0, 1, 0.94, coldRoom);
textPlane(
  "SHARED COOLING",
  2,
  0.3,
  0,
  1.95,
  0.96,
  "#d7e0dc",
  "#243b78",
  coldRoom,
);
const crateCover = new T.Group();
scene.add(crateCover);
for (const c of crates) {
  const p = c.g.position;
  box(0.57, 0.08, 0.55, 0xc2cfe3, p.x, 0.89, p.z, crateCover);
}
for (const object of scene.children.slice(marketStart)) {
  object.position.x += 11;
  object.position.z += 8;
}
tunde.g.position.x += 11;
tunde.g.position.z += 8;
const lessonKit = box(0.6, 0.3, 0.45, 0xc9a54d, -14.7, 1.15, 11.8);
textPlane("EQUAL PARTS", 1.9, 0.27, -15, 1.63, 10.98, "#3b5c4a", "#fff4cd");
// Original stations remain the four playable districts plus the city desk.
const stations = [
  { id: "power", label: "Power station", pos: new T.Vector3(1.6, 2.6, -6.7) },
  {
    id: "workshop",
    label: "Ama · workshop",
    pos: new T.Vector3(-3.3, 2.7, -2.7),
  },
  {
    id: "school",
    label: "Bisi · learning club",
    pos: new T.Vector3(-15, 3.9, 12.3),
  },
  {
    id: "market",
    label: "Market · food & cash",
    pos: new T.Vector3(19, 3.9, 7.2),
  },
  {
    id: "council",
    label: "City desk · run the day",
    pos: new T.Vector3(2, 2.9, 0.4),
  },
];
const futureNeighbours = createOuterDistricts({
  T,
  box,
  cyl,
  building,
  tree,
  visual,
  textPlane,
  person,
});
// Decisions construct fictional, scenario-specific objects in the 3D city.
const caseScenes = createCaseSceneEffects({ T, scene, box, cyl, mat });
const decisionSparks = new T.Group();
scene.add(decisionSparks);
const sparkUnits = Array.from({ length: 12 }, (_, i) => {
  const m = new T.Mesh(
    new T.BoxGeometry(0.12, 0.12, 0.12),
    mat(i % 2 ? 0xffd979 : 0xf6f0cd),
  );
  m.userData.ignoreNavigation = true;
  decisionSparks.add(m);
  return m;
});
decisionSparks.visible = false;
let previewDecision = null;
let journey = previousPractice?.journey
  ? { ...previousPractice.journey, status: "paused" }
  : { status: "idle", caseId: null, stage: "travelling", choiceId: null };
let autoAdvanceTimer = null;
let outcomePaused = false;
let reviewCaseId = null;
let autoResumeAfterReview = false;
let resumeFromDecisionList = false;
let feedbackTimer = null;
let feedbackRunId = 0;
let activeFeedback = null;
let journeyTravelTimer = null;
let builtCityView = null;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
function syncCaseScenes() {
  caseScenes.sync(state.decisions, previewDecision);
}
function rememberJourney() {
  state.journey =
    journey.status === "idle"
      ? null
      : {
          caseId: journey.caseId,
          stage: journey.stage,
          choiceId: journey.choiceId,
          status: journey.status,
        };
  if (saveEnabled) persistPractice();
}
function refreshJourneyControls() {
  rememberJourney();
  const entered = $("intro").hidden;
  const running = journey.status === "running";
  const paused = journey.status === "paused";
  const visible = entered && (running || paused);
  $("journey-bar").hidden = !visible;
  // Always keep essential navigation available. Opening it pauses the journey.
  $("city-tools").hidden = !entered || simulating;
  document.body.classList.toggle("city-journey", running);
  document.body.classList.toggle("city-journey-paused", paused);
  const previous = previousKeptCase(state.decisions, journey.caseId);
  $("journey-back").disabled = !previous;
  $("journey-back").title = previous
    ? "Change your earlier decision: " + previous.title
    : "No earlier decisions yet";
  $("decision-count").textContent =
    caseProgress(state.decisions) + "/" + CITY_CASES.length;
  if (!visible) return;
  $("journey-toggle").textContent = running
    ? "Pause journey"
    : "Resume journey →";
  const chapter = chapterForCase(journey.caseId) ?? 1;
  $("journey-status").textContent = running
    ? "Chapter " +
      chapter +
      " · problem " +
      caseNumber(journey.caseId) +
      "/" +
      CITY_CASES.length
    : "Paused · Chapter " +
      chapter +
      " · problem " +
      caseNumber(journey.caseId) +
      "/" +
      CITY_CASES.length;
}
// Read-only aerial inspection of the actual selected construction states.
// It pauses the guided flow and keeps its original stage, including review.
function updateBuiltCityView() {
  if (!builtCityView) return;
  const summary = cityViewSummary(state.decisions);
  $("city-view-summary").textContent =
    summary.built + "/" + summary.possible + " projects · " +
    summary.active + "/" + summary.total + " districts built";
  const select = $("city-view-district");
  select.replaceChildren();
  const first = document.createElement("option");
  first.value = "";
  first.textContent = "Choose a district";
  select.append(first);
  for (const district of [...summary.districts].sort((a, b) =>
    Number(b.built > 0) - Number(a.built > 0))) {
    const option = document.createElement("option");
    option.value = district.id;
    option.textContent = district.emoji + " " + district.name +
      " · " + district.built + "/" + district.possible + " built";
    select.append(option);
  }
  const focused = findCityViewDistrict(summary, builtCityView.districtId);
  select.value = focused?.id ?? "";
  $("city-view-overview").setAttribute("aria-pressed", String(!focused));
  if (focused) {
    $("city-view-info").textContent = focused.emoji + " " + focused.name +
      " · " + focused.built + "/" + focused.possible + " projects · " +
      (focused.built ? "City service: " + focused.activity :
        "Not built yet. Make decisions here to shape this district.");
  } else {
    $("city-view-info").textContent = summary.built
      ? "Your saved decisions built these structures. Look around or select a district."
      : "Your city is waiting for its first project. Return to the journey to begin building.";
  }
}
function focusBuiltCityDistrict(id = null) {
  if (!builtCityView) return;
  const selected = findCityViewDistrict(cityViewSummary(state.decisions), id);
  builtCityView.districtId = selected?.id ?? null;
  builtCityView.focus = selected ? { x: selected.x, z: selected.z } : null;
  mapMode = true;
  if (selected) {
    pitch = 1.05;
    distance = 37;
  } else {
    pitch = 1.38;
    distance = innerWidth <= 650 ? 201 : 153;
  }
  updateBuiltCityView();
}
function openBuiltCityView() {
  if (!$("intro").hidden || simulating || builtCityView) return;
  const wasRunning = journey.status === "running";
  const snapshot = {
    wasRunning,
    detailVisible: !$("detail").hidden,
    yaw,
    pitch,
    distance,
    mapMode,
    fov: camera.fov,
    far: camera.far,
    fogFar: scene.fog.far,
  };
  if (wasRunning) pauseJourney("Your journey is paused while you inspect your city.");
  cancelWalk();
  keys.clear();
  closeCasebook();
  closeCityStatus();
  closeDirectory();
  $("detail").hidden = true;
  $("mission").hidden = true;
  $("build-dock").hidden = true;
  $("travel").hidden = true;
  $("world-feedback").hidden = true;
  builtCityView = { snapshot, districtId: null, focus: null };
  mapMode = true;
  yaw = 0.55;
  pitch = 1.38;
  distance = innerWidth <= 650 ? 201 : 153;
  camera.fov = innerWidth <= 650 ? 65 : 49;
  camera.far = 440;
  camera.updateProjectionMatrix();
  scene.fog.far = 400;
  document.body.classList.add("city-viewing");
  $("view-city-toggle").setAttribute("aria-expanded", "true");
  $("city-view").hidden = false;
  $("city-view-return").textContent = wasRunning
    ? "Resume journey →"
    : "Return to game →";
  updateBuiltCityView();
}
function closeBuiltCityView() {
  if (!builtCityView) return;
  const { snapshot } = builtCityView;
  builtCityView = null;
  document.body.classList.remove("city-viewing");
  $("city-view").hidden = true;
  $("view-city-toggle").setAttribute("aria-expanded", "false");
  mapMode = snapshot.mapMode;
  yaw = snapshot.yaw;
  pitch = snapshot.pitch;
  distance = snapshot.distance;
  camera.fov = snapshot.fov;
  camera.far = snapshot.far;
  scene.fog.far = snapshot.fogFar;
  camera.updateProjectionMatrix();
  $("city-map").textContent = mapMode ? "Follow me" : "City map";
  $("detail").hidden = !snapshot.detailVisible;
  if (snapshot.wasRunning) resumeJourney();
  else refreshJourneyControls();
}
function pauseJourney(
  message = "Journey paused. Resume whenever you're ready.",
) {
  if (journey.status !== "running") return;
  journey.status = "paused";
  cancelAutoAdvance();
  if (journey.stage === "travelling") {
    cancelWalk();
    activeFeedback = null;
  }
  if (journey.stage === "building") cancelCasePreview();
  else if (journey.stage === "outcome" && $("autonext-caption")) {
    $("autonext-caption").textContent =
      "Paused. Tap Resume journey to continue.";
    document.querySelector(".auto-next")?.classList.add("paused");
  }
  refreshJourneyControls();
  toast(message);
}
function goToJourneyCase(id) {
  const caseFile = getCase(id);
  if (!caseFile || simulating) return;
  if (caseFile.chapter === 2 && !foundationComplete(state.decisions)) {
    toast("Finish the 16 foundation choices to unlock this district.");
    return;
  }
  journey = {
    status: "running",
    caseId: id,
    stage: "travelling",
    choiceId: null,
  };
  cancelAutoAdvance();
  $("detail").hidden = true;
  closeCasebook();
  closeCityStatus();
  closeDirectory();
  guideExpanded = false;
  dockExpanded = false;
  if (mapMode) {
    mapMode = false;
    distance = 27;
    $("city-map").textContent = "City map";
  }
  refreshJourneyControls();
  const point = approaches[caseFile.district];
  // Fast travel between distant districts. A long unskippable walk turns
  // a city-building game into waiting; local routes still walk normally.
  const metres = Math.hypot(
    player.g.position.x - point.x,
    player.g.position.z - point.z,
  );
  if (metres > 24) {
    cancelWalk();
    activeFeedback = { x: point.x, z: point.z, started: performance.now() };
    toast("Travelling to " + caseFile.district + "...");
    journeyTravelTimer = setTimeout(
      () => {
        journeyTravelTimer = null;
        if (journey.status !== "running" || journey.caseId !== id) return;
        const planned = navigator.route(point, point);
        const location = planned?.destination;
        // Never place the avatar in an obstacle. If all safe arrivals are
        // blocked, preserve the current position and open the problem.
        if (location && navigator.free(location)) {
          player.g.position.set(location.x, 0.3, location.z);
          walkTarget.copy(player.g.position);
        } else {
          toast("That spot is occupied. The next problem opens safely here.");
        }
        activeFeedback = null;
        showCase(id);
      },
      reduceMotion.matches ? 200 : 1050,
    );
    return;
  }
  const success = goTo(point, () => showCase(id), "the next problem");
  if (!success) {
    toast("The road is blocked, but you can still solve this problem.");
    showCase(id);
  }
}
function resumeJourney() {
  if (!$("intro").hidden || simulating || journey.status === "running") return;
  if (reviewCaseId) finishDecisionReview({ resume: false });
  const target = recoverJourney({ ...journey, decisions: state.decisions });
  if (target.stage === "complete") {
    journey.status = "complete";
    refreshJourneyControls();
    toast("All current chapters complete. Every decision remains revisable.");
    return;
  }
  // A returned learner must see the requested case, not a still-open
  // legacy map, district panel, construction dock or stale walking route.
  closeCasebook();
  closeCityStatus();
  closeDirectory();
  if (mapMode) {
    mapMode = false;
    distance = 27;
    $("city-map").textContent = "City map";
  }
  $("build-dock").hidden = true;
  if (target.stage !== "travelling") cancelWalk();
  journey = { status: "running", ...target };
  guideExpanded = false;
  dockExpanded = false;
  refreshJourneyControls();
  if (target.stage === "chapter") showChapterTransition();
  else if (target.stage === "question") showCase(target.caseId);
  else if (target.stage === "building")
    runCaseWorldAction(target.caseId, target.choiceId);
  else if (target.stage === "outcome")
    showCaseOutcome(target.caseId, target.choiceId);
  else goToJourneyCase(target.caseId);
}
function cancelAutoAdvance() {
  clearTimeout(autoAdvanceTimer);
  autoAdvanceTimer = null;
}
function cancelCasePreview() {
  cancelAutoAdvance();
  feedbackRunId++;
  clearTimeout(feedbackTimer);
  feedbackTimer = null;
  activeFeedback = null;
  decisionSparks.visible = false;
  previewDecision = null;
  $("world-feedback").hidden = true;
  document.body.classList.remove("city-impact-view");
  syncCaseScenes();
}
function runCaseWorldAction(caseId, choiceId) {
  const spec = CASE_BUILD_SITES[caseId];
  const choice = getChoice(caseId, choiceId);
  if (!spec || !choice) return;
  cancelCasePreview();
  if (reviewCaseId !== caseId) {
    journey = { status: "running", caseId, stage: "building", choiceId };
    refreshJourneyControls();
  }
  // One choice is the only required action: the world and practice record
  // update immediately. No second 'Keep' confirmation is needed.
  state.decisions = saveDecision(state.decisions, caseId, choiceId);
  previewDecision = { caseId, choiceId };
  render();
  syncCaseScenes();
  caseScenes.setTone(caseId, choice);
  const tone = visualTone(choice);
  $("world-feedback-title").textContent =
    tone === "improving"
      ? "YOUR IDEA IS TAKING SHAPE"
      : tone === "strained"
        ? "THE CITY FEELS THE CONSEQUENCES"
        : "YOUR DECISION CHANGES THE CITY";
  const city = deriveBuilderCity(state.decisions);
  const neighbourhood = city.districts[spec.district];
  const connected = neighbourhood.links
    .map((link) => city.districts[link.from].name)
    .slice(0, 2);
  $("world-feedback-copy").textContent =
    feedbackCopy(spec.kind, tone) +
    " " +
    neighbourhood.name +
    " is now " +
    neighbourhood.activity +
    (connected.length
      ? ". Connected to " + connected.join(" and ") + "."
      : ".");
  $("world-feedback").hidden = false;
  $("detail").hidden = true;
  guideExpanded = false;
  dockExpanded = false;
  $("build-dock").hidden = true;
  closeDirectory();
  closeCasebook();
  closeCityStatus();
  document.body.classList.add("city-impact-view");
  const priorDistance = distance;
  distance = Math.min(distance, 15);
  activeFeedback = {
    x: spec.x,
    z: spec.z,
    started: performance.now(),
    district: spec.district,
  };
  decisionSparks.position.set(spec.x, 0, spec.z);
  decisionSparks.visible = !reduceMotion.matches;
  playTone(tone === "improving" ? 690 : tone === "strained" ? 340 : 520);
  const run = feedbackRunId;
  feedbackTimer = setTimeout(
    () => {
      if (run !== feedbackRunId) return;
      $("world-feedback").hidden = true;
      document.body.classList.remove("city-impact-view");
      activeFeedback = null;
      decisionSparks.visible = false;
      distance = priorDistance;
      previewDecision = null;
      syncCaseScenes();
      if (reviewCaseId === caseId) showDecisionReviewOutcome(caseId, choiceId);
      else if (journey.status === "running") showCaseOutcome(caseId, choiceId);
    },
    reduceMotion.matches ? 700 : 1650,
  );
}
for (const d of OUTER_DISTRICTS)
  stations.push({
    id: d.id,
    label: d.short,
    pos: new T.Vector3(d.x, 3.2, d.z),
    upcoming: true,
  });
for (const s of stations) {
  const b = document.createElement("button");
  b.className = "hotspot" + (s.upcoming ? " upcoming" : "");
  b.title = s.upcoming
    ? "Explore a planned district"
    : "Visit an active city station";
  b.innerHTML = '<span class="spot"></span>' + s.label;
  b.onclick = () => goToStation(s.id);
  $("scene-labels").append(b);
  s.el = b;
}
let navigationSignature = null;
let navigator,
  route = [],
  onArrival = null;
function rebuildNavigation() {
  const signature = JSON.stringify(state.config);
  if (signature === navigationSignature) return;
  navigationSignature = signature;
  scene.updateMatrixWorld(true);
  const obstacles = [];
  scene.traverseVisible((o) => {
    if (
      !o.isMesh ||
      o.userData.ignoreNavigation ||
      o.geometry?.type === "PlaneGeometry" ||
      o.geometry?.type === "TubeGeometry" ||
      o === marker
    )
      return;
    for (let a = o; a; a = a.parent) if (a.userData.character) return;
    const b = new T.Box3().setFromObject(o);
    if (b.max.y < 0.52 || b.min.y > 1.7) return;
    obstacles.push({
      minX: b.min.x,
      maxX: b.max.x,
      minZ: b.min.z,
      maxZ: b.max.z,
    });
  });
  for (const p of [ama, bisi, tunde, ...futureNeighbours])
    obstacles.push({
      minX: p.g.position.x - 0.23,
      maxX: p.g.position.x + 0.23,
      minZ: p.g.position.z - 0.23,
      maxZ: p.g.position.z + 0.23,
    });
  navigator = createNavigator(obstacles, {
    minX: -57.5,
    maxX: 57.5,
    minZ: -49.5,
    maxZ: 49.5,
    step: 1,
  });
  if (!navigator.free(player.g.position)) {
    const rescue = navigator.route(
      { x: 4, z: 4 },
      { x: player.g.position.x, z: player.g.position.z },
    );
    if (rescue) {
      player.g.position.set(rescue.destination.x, 0.3, rescue.destination.z);
      walkTarget.copy(player.g.position);
    }
  }
  if (route.length) cancelWalk();
}
function cancelWalk() {
  clearTimeout(journeyTravelTimer);
  journeyTravelTimer = null;
  route = [];
  onArrival = null;

  walkTarget.copy(player.g.position);
  $("travel").hidden = true;
}
function goTo(point, arrival = null, label = "your destination") {
  const planned = navigator.route(player.g.position, point);
  if (!planned) {
    toast("No clear route there. Choose an open area or another approach.");
    return false;
  }
  cancelWalk();
  if (!planned.points.length) {
    arrival?.();
    return true;
  }
  route = planned.points;
  onArrival = arrival;

  marker.position.set(planned.destination.x, 0.19, planned.destination.z);
  $("travel").hidden = false;
  $("travel-text").textContent = "Walking to " + label;
  guideExpanded = false;
  dockExpanded = false;
  $("build-dock").hidden = true;
  $("build-toggle").textContent = "Build";
  updateGuideVisibility();
  if (planned.adjusted && !arrival)
    toast("That spot is occupied. Walking to the nearest clear space.");
  return true;
}
const approaches = {
  power: { x: 3.4, z: -5.6 },
  workshop: { x: -2.6, z: -2.8 },
  school: { x: -13.15, z: 11.1 },
  council: { x: 2.8, z: 1.1 },
  market: { x: 16.4, z: 6.4 },
};
for (const d of OUTER_DISTRICTS)
  approaches[d.id] = { x: d.x - 3.7, z: d.z + 3.9 };
function goToStation(id, afterArrival = null) {
  if (!$("intro").hidden || simulating) return;
  if (reviewCaseId) finishDecisionReview({ resume: false });
  if (journey.status === "running") pauseJourney();
  closeCityStatus();
  const station = stations.find((s) => s.id === id);
  if (!station) return;
  closeDirectory();
  closeCasebook();
  closeDetail();
  if (mapMode) {
    mapMode = false;
    distance = 27;
    $("city-map").textContent = "City map";
  }
  return goTo(
    approaches[id],
    () => {
      inspect(id);
      afterArrival?.();
    },
    station.label,
  );
}
$("stop-walking").onclick = () => {
  if (journey.status === "running") pauseJourney();
  else cancelWalk();
};

function updateWorld() {
  const c = state.config;
  battery.visible = c.storage;
  extraSolar.visible = c.solar;
  spareBox.visible = c.maintenance;
  lessonKit.visible = c.school;
  coldRoom.visible = c.food === "cooling";
  crateCover.visible = c.food === "packaging";
  crates.forEach((crate, i) => {
    crate.produce.material = mat(
      i < 2
        ? 0x806b49
        : lastResult && lastResult.usable === 0
          ? 0xad7547
          : 0x719057,
    );
  });
  stations.forEach((s) =>
    s.el.classList.toggle("seen", state.seen.includes(s.id)),
  );
  rebuildNavigation();
}
function closeDetail() {
  if (reviewCaseId) {
    finishDecisionReview();
    return;
  }
  if (
    journey.status === "running" &&
    ["question", "building", "outcome"].includes(journey.stage)
  )
    pauseJourney();
  cancelAutoAdvance();
  $("detail").hidden = true;
  if (previewDecision) cancelCasePreview();
}
function showDetail(html, mode = "other") {
  const panel = $("detail");
  panel.dataset.mode = mode;
  $("detail-body").innerHTML = html;
  panel.scrollTop = 0;
  panel.hidden = false;
}
function persistPractice() {
  if (!saveEnabled) return;
  if (!savePractice(state)) {
    saveEnabled = false;
    toast("Device storage is unavailable. Progress is only in this open game.");
  }
}
function closeCasebook() {
  $("casebook").hidden = true;
  $("cases-toggle").setAttribute("aria-expanded", "false");
}
function closeCityStatus() {
  $("city-status").hidden = true;
  $("city-status-toggle").setAttribute("aria-expanded", "false");
}
function renderCityStatus() {
  const city = deriveBuilderCity(state.decisions);
  $("city-health-badge").textContent =
    city.activeDistricts + "/" + city.districtCount;
  $("city-status-summary").textContent =
    city.visibleBuildings +
    " physical projects built. Fictional overall service health: " +
    city.cityHealth +
    "/100. Revise any decision to reshape the city.";
  const rows = $("city-status-list");
  rows.replaceChildren();
  for (const id of CASE_DISTRICTS) {
    const d = city.districts[id];
    const section = document.createElement("section");
    section.className = "city-status-district";
    const head = document.createElement("div");
    head.className = "city-status-heading";
    const title = document.createElement("strong");
    title.textContent =
      d.icon +
      " " +
      d.name +
      " · " +
      d.built +
      "/" +
      casesFor(id).length +
      " builds";
    const service = document.createElement("small");
    service.textContent = d.built
      ? d.service + "/100 · " + d.activity
      : "Not built yet";
    head.append(title, service);
    const meter = document.createElement("div");
    meter.className = "city-service-meter";
    meter.setAttribute("role", "meter");
    meter.setAttribute("aria-valuemin", "0");
    meter.setAttribute("aria-valuemax", "100");
    meter.setAttribute("aria-valuenow", String(d.service));
    meter.setAttribute("aria-label", d.name + " fictional service score");
    const bar = document.createElement("i");
    bar.style.width = d.service + "%";
    bar.className = d.activity;
    meter.append(bar);
    section.append(head, meter);
    if (d.links.length) {
      const effects = document.createElement("p");
      effects.className = "city-connections";
      effects.textContent = d.links
        .map(
          (link) =>
            city.districts[link.from].name +
            " " +
            (link.change > 0 ? "+" : "") +
            link.change +
            " · " +
            link.reason,
        )
        .join(" | ");
      section.append(effects);
    }
    rows.append(section);
  }
}
function openCityStatus() {
  if (reviewCaseId) finishDecisionReview({ resume: false });
  if (journey.status === "running") pauseJourney("Your place is saved.");
  closeDirectory();
  closeCasebook();
  closeDetail();
  guideExpanded = false;
  dockExpanded = false;
  render();
  renderCityStatus();
  $("city-status").hidden = false;
  $("city-status-toggle").setAttribute("aria-expanded", "true");
  $("city-status-close").focus();
}
function renderCasebook() {
  $("decision-count").textContent =
    caseProgress(state.decisions) + "/" + CITY_CASES.length;
  $("casebook-summary").textContent =
    caseProgress(state.decisions) +
    " of " +
    CITY_CASES.length +
    " practice decisions kept across " +
    CASE_DISTRICTS.length +
    " districts. Revise any decision to reshape your city.";
  $("save-practice").textContent = saveEnabled
    ? "Stop saving and clear device copy"
    : "Save on this device";
  $("save-note").textContent = saveEnabled
    ? "Saving fictional decisions and city settings on this browser only. Not synced to an account or backed up."
    : "Save is off. Practice remains in the open game until you opt in. No personal reflection or Quest evidence is stored.";
  const list = $("casebook-list");
  list.replaceChildren();
  for (const district of CASE_DISTRICTS) {
    const d = CITY_DISTRICTS.find((item) => item.id === district);
    const section = document.createElement("section");
    section.className = "case-section";
    const heading = document.createElement("h3");
    heading.textContent =
      d.emoji +
      " " +
      d.name +
      " · " +
      districtProgress(state.decisions, district) +
      "/" +
      casesFor(district).length;
    const grid = document.createElement("div");
    grid.className = "case-grid";
    const unlocked =
      FOUNDATION_DISTRICTS.includes(district) ||
      foundationComplete(state.decisions);
    for (const scenario of casesFor(district)) {
      const button = document.createElement("button");
      button.disabled = !unlocked;
      button.type = "button";
      button.className = "case-tile";
      const title = document.createElement("strong");
      title.textContent = scenario.title;
      const status = document.createElement("small");
      const savedChoice = getChoice(scenario.id, state.decisions[scenario.id]);
      status.textContent = savedChoice
        ? "↶ Change: " + savedChoice.title
        : unlocked
          ? "Not solved yet · start problem"
          : "Unlock after Chapter 1";
      if (savedChoice) button.classList.add("case-completed");
      button.append(title, status);
      button.onclick = () => startCase(scenario.id);
      grid.append(button);
    }
    section.append(heading, grid);
    list.append(section);
  }
}
function openCasebook() {
  if (reviewCaseId) finishDecisionReview({ resume: false });
  resumeFromDecisionList = journey.status === "running";
  if (journey.status === "running")
    pauseJourney("Your place is saved. Choose a decision to change.");
  closeCityStatus();
  closeDirectory();
  closeDetail();
  guideExpanded = false;
  dockExpanded = false;
  render();
  renderCasebook();
  $("casebook").hidden = false;
  $("cases-toggle").setAttribute("aria-expanded", "true");
  $("casebook-close").focus();
}
function showDistrictCases(district) {
  const d = CITY_DISTRICTS.find((entry) => entry.id === district);
  const scenarios = casesFor(district);
  showDetail(
    '<div class="eyebrow">PRACTISE IN THIS DISTRICT</div><h2>' +
      d.name +
      "</h2><p>These are authored fictional decisions. Each can be tried again." +
      " They do not award XP or change a real PipuPath Quest.</p>" +
      scenarios
        .map(
          (c) =>
            '<button class="detail-choice" data-local-case="' +
            c.id +
            '">' +
            c.title +
            "<small>" +
            (getChoice(c.id, state.decisions[c.id])
              ? "Decision kept · compare again"
              : "Try this problem") +
            "</small></button>",
        )
        .join(""),
  );
  document.querySelectorAll("[data-local-case]").forEach((button) => {
    button.onclick = () => startCase(button.dataset.localCase);
  });
}
function startCase(id) {
  if (!getCase(id)) return;
  if (getCase(id).chapter === 2 && !foundationComplete(state.decisions)) {
    toast("Finish Chapter 1 to open the growing city.");
    return;
  }
  if (canRevise(state.decisions, id)) {
    beginDecisionReview(id, resumeFromDecisionList);
    return;
  }
  resumeFromDecisionList = false;
  if (journey.status === "running") pauseJourney();
  goToJourneyCase(id);
}
function beginDecisionReview(id, autoResume = false) {
  if (!canRevise(state.decisions, id)) return;
  const wasRunning = journey.status === "running";
  if (wasRunning)
    pauseJourney("Change an earlier choice without losing your place.");
  autoResumeAfterReview = autoResume || wasRunning;
  resumeFromDecisionList = false;
  reviewCaseId = id;
  closeCasebook();
  closeCityStatus();
  closeDirectory();
  cancelAutoAdvance();
  cancelWalk();
  showCase(id);
}
function finishDecisionReview({ resume = true } = {}) {
  const shouldResume =
    resume && autoResumeAfterReview && journey.status === "paused";
  cancelAutoAdvance();
  reviewCaseId = null;
  autoResumeAfterReview = false;
  resumeFromDecisionList = false;
  $("detail").hidden = true;
  if (previewDecision) cancelCasePreview();
  refreshJourneyControls();
  if (shouldResume) resumeJourney();
}
function showDecisionReviewOutcome(id, choiceId) {
  const scenario = getCase(id);
  const choice = getChoice(id, choiceId);
  if (!scenario || !choice) return;
  cancelAutoAdvance();
  const district = deriveBuilderCity(state.decisions).districts[
    scenario.district
  ];
  showDetail(
    '<div class="eyebrow">YOUR CITY HAS CHANGED · ' +
      caseNumber(id) +
      "/" +
      CITY_CASES.length +
      "</div>" +
      "<h2>" +
      scenario.title +
      "</h2>" +
      "<p><strong>Revised choice:</strong> " +
      choice.title +
      "</p>" +
      '<div class="case-result"><b>What changed</b><p>' +
      choice.result +
      "</p><b>The trade-off</b><p>" +
      choice.tradeoff +
      "</p></div>" +
      '<div class="evidence"><strong>YOUR DISTRICT NOW</strong>' +
      district.name +
      ": " +
      district.activity +
      ". Connected systems have been recalculated.</div>" +
      '<div class="auto-next"><span>Your original journey is kept. Returning shortly.</span>' +
      '<div class="auto-next-track" aria-hidden="true"><i></i></div></div>' +
      '<div class="case-actions">' +
      '<button class="secondary" id="review-again">Change again</button>' +
      '<button class="primary" id="review-done">Return to my journey →</button></div>',
    "outcome",
  );
  $("review-again").onclick = () => {
    cancelAutoAdvance();
    showCase(id);
  };
  $("review-done").onclick = () => finishDecisionReview();
  autoAdvanceTimer = setTimeout(() => {
    if (!document.hidden) finishDecisionReview();
    else document.querySelector(".auto-next")?.classList.add("paused");
  }, OUTCOME_VIEW_MS);
}
function showCase(id) {
  if (journey.status === "running" && reviewCaseId !== id) {
    journey.caseId = id;
    journey.stage = "question";
    journey.choiceId = null;
    refreshJourneyControls();
  }
  cancelAutoAdvance();
  if (previewDecision) cancelCasePreview();
  const scenario = getCase(id);
  if (!scenario) return;
  const saved = getChoice(id, state.decisions[id]);
  const splitAt = scenario.situation.indexOf(". ");
  const shortSituation =
    splitAt < 0 ? scenario.situation : scenario.situation.slice(0, splitAt + 1);
  const extraSituation =
    splitAt < 0 ? "" : scenario.situation.slice(splitAt + 2);
  showDetail(
    '<div class="eyebrow">' +
      (reviewCaseId === id
        ? "REVISIT YOUR DECISION · PROBLEM "
        : "BUILDER PRACTICE · PROBLEM ") +
      caseNumber(id) +
      " / " +
      CITY_CASES.length +
      "</div>" +
      "<h2>" +
      scenario.title +
      "</h2>" +
      '<p class="case-intro">' +
      shortSituation +
      "</p>" +
      (extraSituation || scenario.chapter === 2
        ? '<details class="case-story"><summary>More about this problem</summary>' +
          (extraSituation ? "<p>" + extraSituation + "</p>" : "") +
          (scenario.chapter === 2
            ? '<p class="case-context"><strong>IN YOUR CITY:</strong> ' +
              chapterPressure(scenario, deriveBuilderCity(state.decisions)) +
              "</p>"
            : "") +
          "</details>"
        : "") +
      '<div class="evidence case-question"><strong>WHAT WOULD YOU DO?</strong>' +
      scenario.question +
      "</div>" +
      (saved
        ? '<p class="case-small">Your kept approach: ' +
          saved.title +
          ". Choosing another answer will replace the earlier construction.</p>"
        : "") +
      choicesForCase(id, answerOrderSeed)
        .map(
          (option) =>
            '<button class="case-choice" data-case-choice="' +
            option.id +
            '">' +
            option.title +
            "</button>",
        )
        .join("") +
      '<p class="case-small">Every approach has consequences. No real money is spent.</p>' +
      (reviewCaseId === id
        ? '<button class="secondary" id="review-cancel">Return without changing →</button>'
        : ""),
    "choice",
  );
  if ($("review-cancel"))
    $("review-cancel").onclick = () => finishDecisionReview();
  document.querySelectorAll("[data-case-choice]").forEach((button) => {
    button.onclick = () => runCaseWorldAction(id, button.dataset.caseChoice);
  });
}
function showChapterTransition() {
  if (!foundationComplete(state.decisions)) return;
  cancelAutoAdvance();
  cancelWalk();
  journey = {
    status: "running",
    caseId: CITY_CASES[FOUNDATION_CASE_COUNT - 1].id,
    stage: "chapter",
    choiceId: null,
  };
  // Pull the camera high over the unique city so this feels like a new chapter.
  mapMode = true;
  distance = 95;
  guideExpanded = false;
  dockExpanded = false;
  $("build-dock").hidden = true;
  $("city-map").textContent = "Follow me";
  closeCasebook();
  closeCityStatus();
  closeDirectory();
  refreshJourneyControls();
  const city = deriveBuilderCity(state.decisions);
  const stronger = Object.values(city.districts)
    .filter((d) => d.built && d.service >= 60)
    .map((d) => d.name);
  showDetail(
    '<div class="eyebrow">THE UNBUILT CITY · CHAPTER 2 UNLOCKED</div>' +
      "<h2>Your city is coming alive.</h2>" +
      "<p>Your first 16 decisions have shaped four districts. Look at the city you have begun: " +
      "new neighbours are arriving and ten more districts need your decisions.</p>" +
      '<div class="evidence"><strong>YOUR CITY SO FAR</strong>' +
      city.completed +
      "/" +
      CITY_CASES.length +
      " projects · " +
      city.activeDistricts +
      "/14 active neighbourhoods · " +
      "fictional service health " +
      city.cityHealth +
      "/100.</div>" +
      "<p>" +
      (stronger.length
        ? "Growing strengths: " + stronger.join(", ") + ". "
        : "Your foundation still has weaknesses. ") +
      "Housing, water, health, roads, technology, enterprise, environment, " +
      "governance, the arts and manufacturing now need builders.</p>" +
      "<p>Your earlier choices will influence the situations you face here. " +
      "You can return and improve any decision.</p>" +
      '<div class="auto-next"><span>Chapter 2 starts automatically.</span>' +
      '<div class="auto-next-track" aria-hidden="true"><i></i></div></div>' +
      '<button class="primary" id="chapter-start">Start the growing city now →</button>',
  );
  const advance = () => {
    cancelAutoAdvance();
    if (journey.status !== "running") return;
    const next = CITY_CASES[FOUNDATION_CASE_COUNT];
    if (next) goToJourneyCase(next.id);
  };
  $("chapter-start").onclick = advance;
  autoAdvanceTimer = setTimeout(() => {
    if (document.hidden) {
      pauseJourney("Chapter 2 is ready. Resume when you return.");
      return;
    }
    advance();
  }, OUTCOME_VIEW_MS);
}
function proceedAfterCase(id) {
  cancelAutoAdvance();
  $("detail").hidden = true;
  const next = nextPlayableAfter(id, state.decisions);
  if (journey.status === "paused") journey.status = "running";
  if (isChapterTransition(id) && foundationComplete(state.decisions)) {
    showChapterTransition();
    return;
  }
  if (!next) {
    journey.status = "complete";
    journey.stage = "complete";
    refreshJourneyControls();
    showDetail(
      '<div class="eyebrow">THE UNBUILT CITY · CHAPTER 2 COMPLETE</div>' +
        "<h2>All 14 districts are part of your city.</h2>" +
        "<p>You made decisions across housing, water, healthcare, transport, technology, " +
        "business, environment, governance, creativity and manufacturing. " +
        "You can explore, revise choices and keep testing how city services connect.</p>" +
        '<div class="evidence"><strong>BUILDER PRACTICE</strong>' +
        caseProgress(state.decisions) +
        " of " +
        CITY_CASES.length +
        " choices made. " +
        "Every decision can be revisited.</div>" +
        "<p>This is a fictional learning model, not a verified city economy or Quest achievement. Your city remains revisable.</p>" +
        '<button class="primary" id="finish-practice">Return to the city</button>',
    );
    $("finish-practice").onclick = closeDetail;
    return;
  }
  // A single journey owns travel, questions and outcomes. Legacy station
  // inspectors cannot replace the next question with their old panels.
  goToJourneyCase(next.id);
}
function showCaseOutcome(id, choiceId) {
  journey = { status: "running", caseId: id, stage: "outcome", choiceId };
  refreshJourneyControls();
  const scenario = getCase(id);
  const option = getChoice(id, choiceId);
  if (!scenario || !option) return;
  cancelAutoAdvance();
  outcomePaused = false;
  const next = nextPlayableAfter(id, state.decisions);
  const signals = option.impact
    .map(
      (value, i) =>
        "<span>" +
        IMPACT_LABELS[i] +
        ": " +
        (value > 0 ? "+" : "") +
        value +
        "</span>",
    )
    .join("");
  showDetail(
    '<div class="eyebrow">YOUR ACTION · ' +
      caseNumber(id) +
      " / " +
      CITY_CASES.length +
      "</div>" +
      "<h2>" +
      scenario.title +
      "</h2>" +
      "<p><strong>Your decision:</strong> " +
      option.title +
      "</p>" +
      '<div class="case-result"><b>What changed</b><p>' +
      option.result +
      "</p><b>The trade-off</b><p>" +
      option.tradeoff +
      '</p></div><div class="case-impact">' +
      signals +
      '</div><details class="case-more"><summary>Explore the connections</summary>' +
      "<p><strong>Related systems:</strong> " +
      option.links +
      "</p><p><strong>Safe observation:</strong> " +
      scenario.bridge +
      "</p><small>Fictional signals, not verified XP or actual city funds.</small></details>" +
      '<div class="auto-next"><span id="autonext-caption">✓ Your decision is kept.' +
      (next
        ? " Next: " + next.title
        : " All " + CITY_CASES.length + " problems reached.") +
      " The game continues automatically.</span>" +
      '<div class="auto-next-track" aria-hidden="true"><i></i></div></div>' +
      '<div class="case-actions">' +
      '<button class="secondary" id="case-pause">Pause to read</button>' +
      '<button class="secondary" id="case-replay">Replay action</button>' +
      '<button class="secondary" id="case-retry">Change decision</button>' +
      '<button class="primary" id="case-next">' +
      (next ? "Next now →" : "Finish →") +
      "</button></div>",
    "outcome",
  );
  $("case-pause").onclick = () => {
    pauseJourney("Paused to read. Use Resume journey when you're ready.");
    outcomePaused = true;
    $("autonext-caption").textContent =
      "Paused. You can examine the result, retry, or continue when ready.";
    document.querySelector(".auto-next").classList.add("paused");
    $("case-pause").textContent = "Resume journey →";
    $("case-pause").onclick = resumeJourney;
  };
  $("case-replay").onclick = () => runCaseWorldAction(id, choiceId);
  $("case-retry").onclick = () => showCase(id);
  $("case-next").onclick = () => proceedAfterCase(id);
  autoAdvanceTimer = setTimeout(() => {
    if (!outcomePaused && !document.hidden) proceedAfterCase(id);
    else if (!outcomePaused) {
      outcomePaused = true;
      $("autonext-caption").textContent =
        "Paused while you were away. Continue when you are ready.";
      document.querySelector(".auto-next").classList.add("paused");
      journey.status = "paused";
      refreshJourneyControls();
      $("case-pause").textContent = "Resume journey →";
      $("case-pause").onclick = resumeJourney;
    }
  }, OUTCOME_VIEW_MS);
}
function check(label, done) {
  return (
    '<div class="objective ' +
    (done ? "done" : "") +
    '"><span class="check">' +
    (done ? "✓" : "") +
    "</span>" +
    label +
    "</div>"
  );
}
const firstJourney = [
  {
    id: "workshop",
    title: "Meet Ama at the workshop",
    copy: "Ama repairs things for the neighbourhood. Find out why her work keeps stopping.",
  },
  {
    id: "power",
    title: "Find out where the power goes",
    copy: "The workshop cannot run all day. Visit the power station to see when electricity is available.",
  },
  {
    id: "market",
    title: "Help food reach the market",
    copy: "Fresh food is being lost. Meet the traders and look for the real problem before spending money.",
  },
  {
    id: "school",
    title: "Help Bisi teach everyone",
    copy: "The learning club needs a way to help people understand, not just memorise.",
  },
  {
    id: "council",
    title: "Bring your city together",
    copy: "You have met the people. Visit the city desk and test how your decisions work together.",
  },
];
function updateGuideVisibility() {
  const entered = $("intro").hidden;
  const visible =
    entered && guideExpanded && !simulating && journey.status !== "running";
  $("mission").hidden = !visible;
  $("guide-toggle").hidden = !entered || simulating;
  $("guide-toggle").textContent = visible ? "Hide guide" : "Next step";
  $("guide-toggle").setAttribute("aria-expanded", String(visible));
  document.body.classList.toggle("guide-open", visible);
  document.body.classList.toggle("city-testing", simulating);
  $("test-status").hidden = !simulating;
  $("districts-toggle").hidden = simulating;
  $("cases-toggle").hidden = simulating;
  $("city-status-toggle").hidden = simulating;
  $("view-city-toggle").hidden = simulating;
  refreshJourneyControls();
}
function render() {
  const guided =
    state.day === 1 && !freeExplore
      ? firstJourney.find((step) => !state.seen.includes(step.id))
      : null;
  const r = evaluateCity(state.config, {
      ...state,
      day: Math.min(state.day, 2),
    }),
    q = r.quote;
  $("chapter").textContent =
    "THE UNBUILT CITY · CHAPTER " +
    (foundationComplete(state.decisions) ? 2 : 1) +
    " · DAY " +
    state.day;
  $("mission-title").textContent = guided
    ? guided.title
    : state.day === 1
      ? "Make the city work."
      : state.day === 2
        ? "Keep your city working."
        : "A city others can run.";
  $("mission-copy").textContent = guided
    ? guided.copy
    : state.day === 1
      ? "One city, one fund. Connect power, food and learning. Test how the whole day works."
      : state.day === 2
        ? "Dust cuts power. Collection slips to 15:00 and buyer payment arrives tomorrow. Adapt the same city."
        : "Your buildings and agreements remain here. Leave the people a clear operating plan.";
  $("objectives").hidden = Boolean(guided);
  $("objectives").innerHTML =
    check("Reliable power & upkeep", r.powerReady) +
    check("8 usable crates, fair payments", r.foodReady) +
    check("A useful learning activity", r.learning);
  $("progress").style.width =
    (state.handedOver
      ? 100
      : state.day === 3
        ? 85
        : state.day === 2
          ? 55
          : 15) + "%";
  $("step-label").textContent = guided
    ? "ONE STEP AT A TIME"
    : "POWER ↔ FOOD ↔ LEARNING";
  $("credits").textContent = q.available;
  $("resource").hidden = !$("intro").hidden;
  $("build-dock").hidden =
    !$("intro").hidden || Boolean(guided) || !dockExpanded || simulating;
  $("build-toggle").hidden = Boolean(guided) || simulating;
  $("build-toggle").textContent = dockExpanded ? "Close Build" : "Build";
  $("build-dock").classList.add("city-dock");
  $("mission").classList.add("city-board");
  document.body.classList.toggle("city-guided", Boolean(guided));
  $("explore-free").textContent = freeExplore
    ? "Show my next step"
    : "Explore freely";
  document.body.classList.add("city-playing");
  const options = [
    ["storage", "▥", "Storage", 5],
    ["solar", "☀", "Solar", 4],
    ["schedule", "⇄", "Shift repairs", 1],
    ["maintenance", "⚒", "Care reserve", 2],
  ];
  $("build-options").innerHTML = options
    .map(
      ([id, symbol, label, cost]) =>
        '<button class="build-item ' +
        (state.config[id] ? "active" : "") +
        '" data-power="' +
        id +
        '" aria-pressed="' +
        state.config[id] +
        '" ' +
        (simulating ? "disabled" : "") +
        '><span class="build-symbol">' +
        symbol +
        '</span><span class="price">' +
        cost +
        " ◈</span><b>" +
        label +
        "</b><small>" +
        (state.owned[id] ? "Built in your city" : "Install / remove") +
        "</small></button>",
    )
    .join("");
  document
    .querySelectorAll("[data-power]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          change(b.dataset.power, !state.config[b.dataset.power])),
    );
  $("test").textContent = simulating
    ? "City day running…"
    : state.day > 2
      ? "Open the handover"
      : "Test the whole city →";
  $("test").disabled = simulating;
  $("mission-action").innerHTML = guided
    ? '<button class="primary" id="take-me-there">Take me there →</button>'
    : '<div class="district-buttons"><button data-district="power">Power</button><button data-district="market">Market</button><button data-district="school">Learning</button><button data-district="council">City desk</button></div>';
  if (guided) {
    $("take-me-there").onclick = () => goToStation(guided.id);
  } else {
    document
      .querySelectorAll("[data-district]")
      .forEach((b) => (b.onclick = () => goToStation(b.dataset.district)));
  }
  $("mobile-move").hidden = innerWidth > 650 || !freeExplore;
  $("weather-title").textContent =
    state.day === 1 ? "Collection at 14:00" : "Dust · late collection";
  $("weather-icon").textContent = state.day === 1 ? "☀" : "☁";
  updateGuideVisibility();
  updateWorld();
  syncCaseScenes();
  renderCityStatus();
  persistPractice();
}
function change(key, value) {
  if (simulating) return;
  const before = state.config;
  const proposed = { ...before, [key]: value };
  if (quote(proposed, state.owned, state.cash, state.day).available < 0) {
    toast(
      "Your city fund cannot cover that plan. Reuse or remove another asset.",
    );
    return;
  }
  state.config = proposed;
  lastResult = null;
  render();
  if (
    [
      "food",
      "school",
      "diagnosis",
      "support",
      "transfer",
      "policy",
      "agreement",
    ].includes(key)
  )
    inspect(
      key === "food" || key === "agreement"
        ? "market"
        : key === "policy"
          ? "council"
          : "school",
    );
}
function inspect(id) {
  const district = DISTRICT_INDEX.get(id);
  if (district && OUTER_DISTRICTS.some((d) => d.id === id)) {
    if (!foundationComplete(state.decisions)) {
      showDetail(
        '<div class="eyebrow">CHAPTER 2 · COMING NEXT</div>' +
          "<h2>" +
          district.name +
          "</h2><p>Finish the 16 Foundation decisions to " +
          "unlock this district and its two builder challenges.</p>",
      );
    } else showDistrictCases(id);
    return;
  }
  if (!state.seen.includes(id)) state.seen.push(id);
  render();
  if (id === "power" || id === "workshop") {
    showDetail(
      '<div class="eyebrow">POWER DISTRICT · THE SAME CITY</div><h2>Energy has a timetable.</h2><blockquote>Ama: “Repairs can move to midday. Bisi’s class cannot. Cooling at the market needs one more midday unit.”</blockquote><div class="evidence"><strong>GENERATION / MORNING · MIDDAY · AFTERNOON · EVENING</strong>' +
        (state.day === 1 ? "3 · 5 · 2 · 0" : "2 · 3 · 2 · 0") +
        ' units. Extra solar adds 2 at midday.<br>Essential demand: 2 each period. Repairs add 2 in the evening; shifting moves them to midday.<br>Storage holds 4 and moves at most 2 per period.<br>Cooling adds 1 midday unit. Care costs 1 credit each operating day.</div><p>Open Build from the top controls to change the power system. Other districts keep their places, people and equipment.</p><button class="primary" id="noted">Return to the city →</button>',
    );
    $("noted").onclick = closeDetail;
    $("detail-body").insertAdjacentHTML(
      "beforeend",
      '<button class="secondary" id="district-cases">Explore 4 ' +
        (id === "workshop" ? "repair" : "power") +
        " problems →</button>",
    );
    $("district-cases").onclick = () => showDistrictCases(id);
  }
  if (id === "market") marketPanel();
  if (id === "school") schoolPanel();
  if (id === "council") councilPanel();
}
function closeDirectory() {
  $("district-directory").hidden = true;
  $("districts-toggle").setAttribute("aria-expanded", "false");
}
function openDirectory() {
  if (reviewCaseId) finishDecisionReview({ resume: false });
  if (journey.status === "running") pauseJourney("Your place is saved.");
  closeCityStatus();
  closeCasebook();
  guideExpanded = false;
  dockExpanded = false;
  render();
  const list = $("district-list");
  list.replaceChildren();
  for (const d of CITY_DISTRICTS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "district-entry";
    const name = document.createElement("strong");
    name.textContent = d.emoji + " " + d.name;
    const info = document.createElement("small");
    info.textContent =
      d.status === "active"
        ? FOUNDATION_DISTRICTS.includes(d.id) ||
          foundationComplete(state.decisions)
          ? "Playable · go there"
          : "Chapter 2 · unlock after 16 choices"
        : "Explore";
    b.append(name, info);
    b.onclick = () => goToStation(d.id);
    list.append(b);
  }
  $("district-directory").hidden = false;
  $("districts-toggle").setAttribute("aria-expanded", "true");
  $("district-close").focus();
}
function marketPanel() {
  const c = state.config;
  showDetail(
    '<div class="eyebrow">HARVEST EXCHANGE · FOOD & CASH</div><h2>Food reaches people through a system.</h2><blockquote>Mariam: “Two of our ten crates arrived damaged. A fridge cannot undo that. Three crates belong to small suppliers who need their 3 credits today.”</blockquote><div class="evidence"><strong>INSPECT THE RECORDS</strong>8 usable crates at 08:00. Normal collection: 14:00; after disruption: 15:00.<br>Without protection, usable through 12:00. Protective crates: through 14:00. Shared cooling: through 16:00, if powered.<br>Buyer pays 2 per usable crate. Suppliers are owed 10 in total. ' +
      (state.day === 1
        ? "Buyer pays 15:00; suppliers due 16:00."
        : "Buyer pays next day; small suppliers still need 3 today.") +
      "</div>" +
      [
        ["none", "No intervention", "No construction cost; inspect the loss."],
        [
          "early",
          "Book an early route",
          "No asset to buy. 3 operating credits each day. Collection 11:00 on day 1; unavailable on day 2.",
        ],
        [
          "packaging",
          "Reusable protective crates",
          "4 construction credits; protection through 14:00. Reassigning the kit refunds its fictional purchase value.",
        ],
        [
          "cooling",
          "Install shared cooling",
          "5 construction credits + 1 operating credit. Adds 1 unit to midday power demand.",
        ],
      ]
        .map(
          ([v, t, d]) =>
            '<button class="detail-choice ' +
            (c.food === v ? "selected" : "") +
            '" data-food="' +
            v +
            '">' +
            t +
            "<small>" +
            d +
            "</small></button>",
        )
        .join("") +
      (state.day === 2
        ? "<h3>Agree a payment plan</h3>" +
          [
            ["", "No new agreement", "All 10 due today, buyer pays tomorrow."],
            [
              "advance",
              "Buyer pays 12 credits at 08:00",
              "The buyer agrees to an advance against this shipment; remaining sales value arrives next day.",
            ],
            [
              "shared",
              "Cooling partner + supplier agreement",
              "Partner defers 4 construction credits. Small suppliers get 3 today; other suppliers consent to 7 tomorrow. All balances settle after the buyer pays.",
            ],
          ]
            .map(
              ([v, t, d]) =>
                '<button class="detail-choice ' +
                (c.agreement === v ? "selected" : "") +
                '" data-agreement="' +
                v +
                '">' +
                t +
                "<small>" +
                d +
                "</small></button>",
            )
            .join("")
        : "") +
      '<p class="hint">All times, prices, storage windows and agreements are fictional. These records do not establish real food safety.</p>',
  );
  document
    .querySelectorAll("[data-food]")
    .forEach((b) => (b.onclick = () => change("food", b.dataset.food)));
  document
    .querySelectorAll("[data-agreement]")
    .forEach(
      (b) => (b.onclick = () => change("agreement", b.dataset.agreement)),
    );
  $("detail-body").insertAdjacentHTML(
    "beforeend",
    '<button class="secondary" id="district-cases">Explore 4 food problems →</button>',
  );
  $("district-cases").onclick = () => showDistrictCases("market");
}
function schoolPanel() {
  const c = state.config;
  const choices = (key, items) =>
    items
      .map(
        ([v, t]) =>
          '<button class="detail-choice ' +
          (c[key] === v ? "selected" : "") +
          '" data-lesson="' +
          key +
          '" data-value="' +
          v +
          '">' +
          t +
          "</button>",
      )
      .join("");
  showDetail(
    '<div class="eyebrow">LEARNING COMMONS · BISI’S CLUB</div><h2>Help understanding grow here.</h2><blockquote>“One learner calls any shaded piece a quarter, even when parts are unequal. Another explains the diagram orally but struggles with the written instruction.”</blockquote><div class="evidence"><strong>LOOK AT THE WHOLE</strong>These are authored fictional examples, not records of real children. Diagnose the barrier, build a small activity, then try the changed example.</div><button class="detail-choice ' +
      (c.school ? "selected" : "") +
      '" id="school-kit">' +
      (c.school
        ? "✓ Teaching kit installed"
        : "Install a reusable teaching kit · 2 credits") +
      "</button><h3>1. What explains the first error?</h3>" +
      choices("diagnosis", [
        [
          "unequal-parts",
          "They are counting pieces without checking equal parts.",
        ],
        ["speed", "They need to answer more quickly."],
      ]) +
      "<h3>2. How can both learners participate?</h3>" +
      choices("support", [
        [
          "oral-visual",
          "Use equal-part objects, oral instructions and visual examples.",
        ],
        ["copy", "Ask everyone to copy the rule repeatedly."],
      ]) +
      '<h3>3. A changed example</h3><div class="lesson-shape" aria-label="A rotated rectangle split into four equal parts, one shaded"><span></span><span></span><span></span><span></span></div><p>Is the shaded part still a quarter after rotating the whole?</p>' +
      choices("transfer", [
        ["same-whole", "Yes: one of four equal parts of the same whole."],
        ["rotation", "No: rotation changes how much is shaded."],
      ]) +
      '<p class="hint">The kit stays in this city. Running the evening class also depends on the power plan. Choosing these examples is practice, not verified teaching competence.</p>',
  );
  $("school-kit").onclick = () => change("school", !c.school);
  document
    .querySelectorAll("[data-lesson]")
    .forEach(
      (b) => (b.onclick = () => change(b.dataset.lesson, b.dataset.value)),
    );
  $("detail-body").insertAdjacentHTML(
    "beforeend",
    '<button class="secondary" id="district-cases">Explore 4 learning problems →</button>',
  );
  $("district-cases").onclick = () => showDistrictCases("school");
}
function councilPanel() {
  if (state.day > 2) {
    handoverPanel();
    return;
  }
  const q = quote(state.config, state.owned, state.cash, state.day);
  showDetail(
    '<div class="eyebrow">CITY DESK · ONE CLOCK, ONE FUND</div><h2>Run the city as a whole.</h2><p>Power, food and learning share this place. Construction uses the city fund; operating expenses and payments happen at their stated times.</p><div class="stat-row"><div class="stat"><b>' +
      q.available +
      '</b><small>AFTER CONSTRUCTION</small></div><div class="stat"><b>' +
      state.day +
      "</b><small>CITY DAY</small></div></div>" +
      (state.day === 2
        ? '<div class="evidence"><strong>THE DISRUPTION</strong>Dust reduces generation. Collection moves to 15:00. Buyer settlement slips to tomorrow. Assets from day 1 remain built.</div>' +
          [
            ["", "Keep original demand", "No changes to service priorities."],
            [
              "protect",
              "Agree to protect the evening class",
              "Postpone 2 repair units and reduce morning essential service by 1. Tell customers and affected users; the evening class keeps its 2 units.",
            ],
            [
              "rotate",
              "Agree a rotating reduced service",
              "Postpone 2 repair units and halve evening service by consent. Bisi’s class gets a shorter session; publish the reduced schedule.",
            ],
          ]
            .map(
              ([v, t, d]) =>
                '<button class="detail-choice ' +
                (state.config.policy === v ? "selected" : "") +
                '" data-policy="' +
                v +
                '">' +
                t +
                "<small>" +
                d +
                "</small></button>",
            )
            .join("")
        : "<p>Meet Ama, inspect the power records, visit the market and investigate learning before testing. A larger piece of equipment is not an automatic solution.</p>") +
      '<button class="primary" id="council-run">Test the whole city →</button>',
  );
  document
    .querySelectorAll("[data-policy]")
    .forEach((b) => (b.onclick = () => change("policy", b.dataset.policy)));
  $("council-run").onclick = runDay;
}
let runStarted = 0,
  runTimer;
function runDay() {
  if (simulating) return;
  if (state.day > 2) {
    handoverPanel();
    return;
  }
  if (!["power", "market", "school"].every((id) => state.seen.includes(id))) {
    toast("Visit the power station, market and learning club first.");
    return;
  }
  lastResult = evaluateCity(state.config, state);
  simRows = lastResult.power;
  simPeriod = 0;
  simulating = true;
  guideExpanded = false;
  dockExpanded = false;
  runStarted = performance.now();
  playTone(600);
  cancelWalk();
  closeDetail();
  render();
  function tick() {
    if (simPeriod >= 4) {
      simulating = false;
      simPeriod = -1;
      render();
      resultPanel();
      return;
    }
    const r = simRows[simPeriod];
    $("weather-title").textContent =
      r.period + " · power " + r.served + "/" + r.need;
    $("test-status").textContent =
      "Testing " + r.period + " · electricity " + r.served + "/" + r.need;
    document.querySelector(".weather-time").textContent = [
      "08:00",
      "12:00",
      "16:00",
      "20:00",
    ][simPeriod];
    simPeriod++;
    runTimer = setTimeout(tick, 1200);
  }
  tick();
}
function resultPanel() {
  const r = lastResult;
  showDetail(
    '<div class="eyebrow">CITY DAY ' +
      r.day +
      " · CONSEQUENCES</div><h2>" +
      (r.passed ? "The city holds together." : "The city shows you the gap.") +
      '</h2><div class="stat-row"><div class="stat"><b>' +
      r.usable +
      '/10</b><small>USABLE CRATES</small></div><div class="stat"><b>' +
      r.closingCash +
      "</b><small>AFTER SETTLEMENT</small></div></div>" +
      check("Power and maintenance", r.powerReady) +
      check("Food reaches people; payments viable", r.foodReady) +
      check("Learning activity ready", r.learning) +
      '<div class="evidence"><strong>SHARED POWER / SERVED : NEEDED</strong>' +
      r.power.map((p) => p.period + " " + p.served + ":" + p.need).join(" · ") +
      "<br>Collection at " +
      r.pickup +
      ":00; protection through " +
      r.window +
      ':00.</div><table class="city-table"><thead><tr><th>When / what</th><th>Cash</th></tr></thead><tbody>' +
      r.entries
        .map(
          (e) =>
            "<tr><td>" +
            e.time +
            " · " +
            e.label +
            "</td><td>" +
            e.balance +
            "</td></tr>",
        )
        .join("") +
      "</tbody></table><p>" +
      (r.passed
        ? "Adopt this tested plan to advance the shared city clock. The buildings stay where you put them. The same day cannot pay out twice."
        : "Revise the same city. Failed rehearsals do not spend your fund. Watch timing, power demands, supplier obligations and the learning activity together.") +
      "</p>" +
      (r.passed
        ? '<button class="primary" id="adopt">Adopt this city day →</button>'
        : '<button class="primary" id="revise">Return to the city →</button>'),
  );
  if ($("revise")) $("revise").onclick = closeDetail;
  if ($("adopt"))
    $("adopt").onclick = () => {
      const next = adoptDay(state, r);
      if (!next) {
        toast("That result is no longer the current city day.");
        return;
      }
      state = next;
      lastResult = null;
      render();
      closeDetail();
      toast(
        state.day === 2
          ? "Day 2: dust, delayed collection and a cash-flow shock. Your city remains built."
          : "The city has weathered both days. Leave its people a clear handover.",
      );
      if (state.day > 2) handoverPanel();
    };
}
function handoverPanel() {
  showDetail(
    '<div class="eyebrow">CITY STEWARDSHIP</div><h2>Who keeps this city working?</h2><p>The workshop, market and learning club now share an operating system. Leave responsibilities and a rule for responding to faults.</p><label class="field" for="operator">Who operates the city services?</label><select id="operator"><option value="">Choose…</option><option value="teams">Trained district teams with a shared coordinator</option><option value="me">I approve every decision</option></select><label class="field" for="reflection">What connection surprised you? Who still bears a cost?</label><textarea id="reflection" class="reflection" maxlength="600" placeholder="Use the power, food, cash or learning evidence…"></textarea><p class="hint">Only fictional choices and city settings can be saved on this device if you opt in. This reflection is never saved. No personal details are needed.</p><button class="primary" id="handover">Leave the operating plan →</button>',
  );
  $("reflection").value = state.reflection;
  $("handover").onclick = () => {
    const reflection = $("reflection").value.trim();
    if ($("operator").value !== "teams") {
      toast("Choose a trained team so the city does not depend on you.");
      return;
    }
    if (reflection.length < 20) {
      toast("Explain one connection and a remaining cost in your own words.");
      return;
    }
    state.handedOver = true;
    state.reflection = reflection;
    render();
    showDetail(
      '<div class="eyebrow">THE UNBUILT CITY · FIRST CONNECTED BUILD</div><h2>Your city can keep going.</h2><p>Power, food and learning remain connected here. The city has an agreed response to disruption and district teams to operate it.</p><div class="evidence"><strong>YOUR PRACTICE RECORD</strong>Two evaluated city days adopted. No verified XP or real-world capability is claimed. Reflections are not independently assessed or saved.</div><p id="reflection-record"></p><h3>Take one safe next step.</h3><p>With permission, ask a familiar adult how one local service is maintained and paid for. Notice which other services depend on it. Do not handle electrical equipment or potentially spoiled food.</p><button class="primary" id="keep-exploring">Keep exploring the city →</button>',
    );
    $("reflection-record").textContent = reflection;
    $("keep-exploring").onclick = closeDetail;
  };
}
$("test").onclick = () => {
  if (journey.status === "running") pauseJourney();
  runDay();
};
$("journey-toggle").onclick = () => {
  if (journey.status === "running") pauseJourney();
  else resumeJourney();
};
$("journey-back").onclick = () => {
  const previous = previousKeptCase(state.decisions, journey.caseId);
  if (previous) beginDecisionReview(previous.id);
};
$("close-detail").onclick = closeDetail;
$("view-city-toggle").onclick = openBuiltCityView;
$("city-view-return").onclick = closeBuiltCityView;
$("city-view-overview").onclick = () => focusBuiltCityDistrict();
$("city-view-district").onchange = (event) => {
  focusBuiltCityDistrict(event.target.value);
};
$("city-view-zoom-in").onclick = () => {
  if (builtCityView) distance = clamp(distance * 0.8, 20, 250);
};
$("city-view-zoom-out").onclick = () => {
  if (builtCityView) distance = clamp(distance * 1.25, 20, 250);
};
$("city-status-toggle").onclick = () => {
  if (simulating) return;
  if ($("city-status").hidden) openCityStatus();
  else closeCityStatus();
};
$("city-status-close").onclick = closeCityStatus;
$("cases-toggle").onclick = () => {
  if (simulating) return;
  if ($("casebook").hidden) openCasebook();
  else closeCasebook();
};
$("casebook-close").onclick = closeCasebook;
$("save-practice").onclick = () => {
  if (saveEnabled) {
    if (!clearPractice()) {
      toast("Could not clear device storage. Check browser settings.");
      return;
    }
    saveEnabled = false;
    toast("Device copy cleared. This open session remains playable.");
  } else if (savePractice(state)) {
    saveEnabled = true;
    toast("Practice saved to this browser only, not cloud backed.");
  } else {
    toast("Device storage is unavailable. Practice stays in this open game.");
  }
  renderCasebook();
};
$("districts-toggle").onclick = () => {
  if ($("district-directory").hidden) openDirectory();
  else closeDirectory();
};
$("district-close").onclick = closeDirectory;
$("explore-free").onclick = () => {
  if (reviewCaseId) finishDecisionReview({ resume: false });
  if (journey.status === "running")
    pauseJourney("Your journey is paused while you explore.");
  freeExplore = !freeExplore;
  guideExpanded = !freeExplore;
  dockExpanded = false;
  closeDetail();
  render();
};
$("guide-toggle").onclick = () => {
  if (simulating) return;
  if (reviewCaseId) finishDecisionReview({ resume: false });
  if (journey.status === "running")
    pauseJourney("Your journey is paused while you use the guide.");
  guideExpanded = !guideExpanded;
  if (guideExpanded) dockExpanded = false;
  render();
};
$("build-toggle").onclick = () => {
  if (simulating) return;
  if (reviewCaseId) finishDecisionReview({ resume: false });
  if (journey.status === "running")
    pauseJourney("Your journey is paused while you build.");
  dockExpanded = !dockExpanded;
  if (dockExpanded) guideExpanded = false;
  render();
};
$("city-map").onclick = () => {
  if (reviewCaseId) finishDecisionReview({ resume: false });
  if (journey.status === "running")
    pauseJourney("Your journey is paused while you explore the map.");
  mapMode = !mapMode;
  closeDirectory();
  if (mapMode) {
    guideExpanded = false;
    dockExpanded = false;
    $("build-dock").hidden = true;
    $("build-toggle").textContent = "Build";
  }
  updateGuideVisibility();
  distance = mapMode ? 115 : 27;
  $("city-map").textContent = mapMode ? "Follow me" : "City map";
};
$("start").onclick = () => {
  $("intro").hidden = true;
  $("city-tools").hidden = false;
  mapMode = false;
  closeCasebook();
  closeCityStatus();
  guideExpanded = true;
  dockExpanded = false;
  distance = 27;
  closeDirectory();
  $("mission").hidden = false;
  $("mobile-move").hidden = true;
  render();
  const nextUnsolved = firstUnanswered(state.decisions);
  if (nextUnsolved || journey.status === "paused") {
    // Preserve the Chapter 2 reveal for older saves that completed all 16
    // foundation cases before Chapter 2 existed.
    if (
      foundationComplete(state.decisions) &&
      caseProgress(state.decisions) === FOUNDATION_CASE_COUNT &&
      journey.stage === "complete"
    ) {
      showChapterTransition();
      return;
    }
    toast(
      previousPractice
        ? "Welcome back. Resuming your unfinished builder journey."
        : "Your first problem is ready.",
    );
    resumeJourney();
  } else {
    journey.status = "complete";
    refreshJourneyControls();
    toast("Your city is ready to explore. Revisit any of your decisions.");
  }
};
$("sound").onclick = () => {
  sound = !sound;
  playTone();
  $("sound").textContent = sound ? "♪" : "♫";
  $("sound").setAttribute(
    "aria-label",
    sound ? "Turn sound off" : "Turn sound on",
  );
  toast(sound ? "City sound enabled for this session." : "City sound off.");
};
$("help").onclick = () => $("help-dialog").showModal();
$("help-done").onclick = $("close-help").onclick = () =>
  $("help-dialog").close();
$("reset").onclick = () => {
  if (builtCityView) closeBuiltCityView();
  if (
    !confirm("Restart this fictional city and clear its in-session progress?")
  )
    return;
  clearTimeout(runTimer);
  cancelCasePreview();
  reviewCaseId = null;
  autoResumeAfterReview = false;
  resumeFromDecisionList = false;
  journey = {
    status: "idle",
    caseId: null,
    stage: "travelling",
    choiceId: null,
  };
  refreshJourneyControls();
  simulating = false;
  simPeriod = -1;
  const cleared = clearPractice();
  state = fresh();
  saveEnabled = false;
  closeCasebook();
  closeCityStatus();
  if (!cleared) toast("Could not clear saved practice. Check browser storage.");
  freeExplore = false;
  mapMode = false;
  closeDirectory();
  guideExpanded = true;
  dockExpanded = false;
  distance = 27;
  $("city-map").textContent = "City map";
  lastResult = null;
  cancelWalk();
  navigationSignature = null;
  render();
  closeDetail();
};
document.querySelector(".brand").onclick = (e) => {
  e.preventDefault();
  $("help-dialog").showModal();
};
// Orbit and ground movement; raycast only the observed floor geometry.
const ray = new T.Raycaster(),
  pointer = new T.Vector2();
let down = null,
  dragging = false,
  pinchDistance = null;
const pointers = new Map();
const canvas = $("world");
canvas.addEventListener("pointerdown", (e) => {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  canvas.setPointerCapture(e.pointerId);
  down = { x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY };
  dragging = false;
});
canvas.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) {
    const a = [...pointers.values()],
      d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
    if (pinchDistance)
      distance = clamp(distance - (d - pinchDistance) * 0.055, builtCityView ? 20 : 16, builtCityView ? 250 : 128);
    pinchDistance = d;
    dragging = true;
    return;
  }
  if (!down) return;
  const dx = e.clientX - down.lastX,
    dy = e.clientY - down.lastY;
  if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) dragging = true;
  if (dragging) {
    yaw -= dx * 0.006;
    pitch = clamp(pitch + dy * 0.004, 0.35, 1.16);
  }
  down.lastX = e.clientX;
  down.lastY = e.clientY;
});
canvas.addEventListener("pointerup", (e) => {
  pointers.delete(e.pointerId);
  pinchDistance = null;
  if (
    down &&
    !dragging &&
    $("intro").hidden &&
    !simulating &&
    !builtCityView &&
    journey.status !== "running"
  ) {
    pointer.set(
      (e.clientX / innerWidth) * 2 - 1,
      (-e.clientY / innerHeight) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    const hits = ray.intersectObject(island);
    if (hits.length) {
      const p = hits[0].point;
      goTo({ x: p.x, z: p.z });
    }
  }
  down = null;
});
canvas.addEventListener("pointercancel", (e) => {
  pointers.delete(e.pointerId);
  down = null;
  pinchDistance = null;
});
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    distance = clamp(distance + e.deltaY * 0.02, builtCityView ? 20 : 16, builtCityView ? 250 : 128);
  },
  { passive: false },
);
const keys = new Set();
window.addEventListener("keydown", (e) => {
  if (
    ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) ||
    $("help-dialog").open
  )
    return;
  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "w",
      "a",
      "s",
      "d",
    ].includes(e.key)
  ) {
    e.preventDefault();
    keys.add(e.key);
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.key));
window.addEventListener("blur", () => keys.clear());
document.querySelectorAll("[data-move]").forEach((b) => {
  const key = { up: "w", down: "s", left: "a", right: "d" }[b.dataset.move];
  b.onpointerdown = (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    keys.add(key);
  };
  b.onpointerup = b.onpointercancel = () => keys.delete(key);
});
let last = performance.now(),
  time = 0;
const v = new T.Vector3();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - last) / 1000, 0.2);
  last = now;
  time += dt;
  if (builtCityView?.focus)
    desiredTarget.set(builtCityView.focus.x, 0, builtCityView.focus.z);
  else if (builtCityView) desiredTarget.set(0, 0, 0);
  else if (activeFeedback) desiredTarget.set(activeFeedback.x, 0, activeFeedback.z);
  else if ($("intro").hidden && !mapMode)
    desiredTarget.set(player.g.position.x, 0, player.g.position.z);
  else desiredTarget.set(0, 0, 0);
  target.lerp(desiredTarget, 0.055);
  const aspect = innerWidth / innerHeight;
  camera.position.set(
    target.x + Math.sin(yaw) * Math.cos(pitch) * distance,
    target.y + Math.sin(pitch) * distance,
    target.z + Math.cos(yaw) * Math.cos(pitch) * distance,
  );
  camera.lookAt(target.x + (aspect > 1.3 ? -1.2 : 0), target.y + 0.5, target.z);
  if (!$("intro").hidden) {
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
      yaw += dt * 0.025;
  } else {
    let dx = 0,
      dz = 0;
    if (keys.has("w") || keys.has("ArrowUp")) dz -= 1;
    if (keys.has("s") || keys.has("ArrowDown")) dz += 1;
    if (keys.has("a") || keys.has("ArrowLeft")) dx -= 1;
    if (keys.has("d") || keys.has("ArrowRight")) dx += 1;
    if ((dx || dz) && !simulating && !builtCityView && journey.status !== "running") {
      cancelWalk();
      const mx = dx * Math.cos(yaw) + dz * Math.sin(yaw),
        mz = -dx * Math.sin(yaw) + dz * Math.cos(yaw),
        length = Math.hypot(mx, mz);
      const next = navigator.manual(player.g.position, {
        x: player.g.position.x + (mx / length) * dt * 3,
        z: player.g.position.z + (mz / length) * dt * 3,
      });
      walkTarget.set(next.x, 0.3, next.z);
    }
  }
  if (route.length) {
    const next = route[0];
    walkTarget.set(next.x, 0.3, next.z);
  }
  const diff = walkTarget.clone().sub(player.g.position);
  if (diff.length() > 0.035) {
    const step = Math.min(diff.length(), dt * (route.length ? 5 : 3)),
      next = player.g.position
        .clone()
        .add(diff.clone().normalize().multiplyScalar(step));
    if (navigator.segmentFree(player.g.position, next)) {
      player.g.position.copy(next);
      player.g.rotation.y = Math.atan2(diff.x, diff.z);
      player.legs.forEach(
        (l, i) => (l.rotation.x = Math.sin(time * 10 + i * Math.PI) * 0.4),
      );
      player.arms.forEach(
        (a, i) =>
          (a.rotation.x = Math.sin(time * 10 + (i + 1) * Math.PI) * 0.28),
      );
    } else if (journey.status === "running" && journey.stage === "travelling") {
      pauseJourney("The route is blocked. Tap Resume journey to retry.");
    } else cancelWalk();
  } else {
    player.legs.forEach((l) => (l.rotation.x *= 0.85));
    player.arms.forEach((a) => (a.rotation.x *= 0.85));
    if (route.length) {
      route.shift();
      if (!route.length) {
        const callback = onArrival;
        cancelWalk();
        toast("Arrived.");
        callback?.();
      }
    }
  }

  // City buildings and small community workers reflect each retained choice.
  // Construction rises, sparks scatter and nearby characters react.
  caseScenes.animate(now, reduceMotion.matches);
  if (activeFeedback && !reduceMotion.matches) {
    const progress = Math.min(1, (now - activeFeedback.started) / 1450);
    sparkUnits.forEach((particle, i) => {
      const theta = (i * Math.PI * 2) / sparkUnits.length;
      const radius = 0.15 + progress * (0.85 + (i % 3) * 0.25);
      particle.position.set(
        Math.cos(theta) * radius,
        0.5 + Math.sin(progress * Math.PI) * (1.4 + (i % 4) * 0.2),
        Math.sin(theta) * radius,
      );
      particle.scale.setScalar(Math.max(0.01, 1.2 - progress));
    });
  }
  const period = simulating ? Math.max(0, simPeriod - 1) : -1;
  const row = period >= 0 ? simRows[period] : null;
  const power = row ? row.unmet === 0 : true;
  machines.forEach((m, i) => {
    if (simulating && row && row.served > 0) {
      m.wheel.rotation.z += dt * 8;
      m.spindle.position.y = 1.22 + Math.sin(time * 17) * 0.04;
    }
    m.g.position.y =
      0.3 + (simulating && power ? Math.sin(time * 18 + i) * 0.003 : 0);
  });
  lampMat.emissiveIntensity = simulating ? (power ? 1 : 0.05) : 0.5;
  lampMat.color.setHex(power ? 0x91bd60 : 0xc47747);
  lamps.forEach(
    (l) =>
      (l.material.emissiveIntensity = simulating ? (power ? 1.7 : 0.03) : 0.7),
  );
  const night = period === 3;
  hemi.intensity = T.MathUtils.lerp(hemi.intensity, night ? 1 : 2.9, 0.04);
  sun.intensity = T.MathUtils.lerp(
    sun.intensity,
    night ? 0.3 : state.day >= 2 ? 2.2 : 3.5,
    0.04,
  );
  batteryBars.forEach((b, i) => {
    b.material = mat(row && i >= row.charge ? 0x536e5c : 0xc4db99);
  });
  [ama, bisi, tunde].forEach((p, i) => {
    p.g.rotation.y = 0.4 + Math.sin(time * 0.7 + i) * 0.09;
    const reacting =
      activeFeedback &&
      ((activeFeedback.district === "market" && p === tunde) ||
        (activeFeedback.district === "school" && p === bisi) ||
        (["workshop", "power"].includes(activeFeedback.district) && p === ama));
    if (reacting && !reduceMotion.matches) {
      p.arms.forEach((arm, side) => {
        arm.rotation.x = Math.sin(time * 13 + side * Math.PI) * 0.48 - 0.25;
      });
      p.g.position.y = 0.3 + Math.abs(Math.sin(time * 8)) * 0.035;
    } else {
      p.arms.forEach((arm) => (arm.rotation.x *= 0.85));
      p.g.position.y = 0.3;
    }
  });
  for (const s of stations) {
    v.copy(s.pos).project(camera);
    s.el.style.left = (v.x * 0.5 + 0.5) * innerWidth + "px";
    s.el.style.top = (-v.y * 0.5 + 0.5) * innerHeight + "px";
    const near =
      Math.hypot(s.pos.x - player.g.position.x, s.pos.z - player.g.position.z) <
      18;
    s.el.style.visibility =
      v.z > 1 ||
      Math.abs(v.x) > 0.88 ||
      Math.abs(v.y) > 0.82 ||
      !near ||
      mapMode ||
      !$("intro").hidden
        ? "hidden"
        : "visible";
  }
  if (simulating) {
    bike.position.z =
      3.8 - Math.sin(Math.min(1, (now - runStarted) / 4800) * Math.PI) * 7;
  }
  renderer.render(scene, camera);
}
function resize() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  if ($("intro").hidden)
    $("mobile-move").hidden = innerWidth > 650 || !freeExplore;
}
window.addEventListener("resize", resize);
resize();
render();
document.querySelector(".intro-card>small").textContent =
  "Build one connected city · 36 fictional choices across 14 districts · optional device-only save";
if (previousPractice) {
  $("start").textContent = "Continue saved city →";
}
$("loading").hidden = true;
requestAnimationFrame(animate);
