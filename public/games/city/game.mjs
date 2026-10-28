import * as T from "../shared/vendor/three.module.js";
import { SoftwareRenderer } from "../shared/software-renderer.mjs";
import { createNavigator } from "../shared/navigation.mjs";
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
});
let state = fresh(),
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
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
renderer.setClearColor(0xe9e2d2);
renderer.outputColorSpace = T.SRGBColorSpace;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
const scene = new T.Scene();
scene.fog = new T.Fog(0xe9e2d2, 38, 80);
const camera = new T.PerspectiveCamera(39, innerWidth / innerHeight, 0.1, 140);
let yaw = 0.8,
  pitch = 0.72,
  distance = 29,
  target = new T.Vector3(0, 0, 0),
  desiredTarget = new T.Vector3(0, 0, 0);
const hemi = new T.HemisphereLight(0xfff9e4, 0x798268, 2.9);
scene.add(hemi);
const sun = new T.DirectionalLight(0xffe1af, 3.5);
sun.position.set(-12, 20, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -24;
sun.shadow.camera.right = 24;
sun.shadow.camera.top = 24;
sun.shadow.camera.bottom = -24;
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
const island = box(23, 0.45, 18, 0xc2bf9e, 0, -0.25, 0);
box(23.2, 0.12, 18.2, 0xddd7bd, 0, 0, 0);
box(4, 0.04, 18, 0xc6b596, 6, 0.1, 0);
box(23, 0.04, 2.2, 0xc6b596, 0, 0.1, 6.7);
for (let z = -7; z < 8; z += 1.4) box(0.1, 0.015, 0.65, 0xe7d9b7, 6, 0.13, z);
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
// School pavilion.
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
  [-5, 2.5, 5.3],
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
function building(x, z, w, h, d, c) {
  box(w, h, d, c, x, h / 2, z);
  box(w + 0.3, 0.2, d + 0.3, 0x969474, x, h + 0.1, z);
  for (let i = 0; i < 2; i++) {
    box(
      0.45,
      0.65,
      0.05,
      0x66796e,
      x - w * 0.25 + i * w * 0.5,
      h * 0.6,
      z + d / 2 + 0.035,
    );
  }
  textPlane(
    "LOCAL WORKS",
    w * 0.7,
    0.28,
    x,
    h * 0.85,
    z + d / 2 + 0.04,
    "#ad956e",
  );
}
building(9, -10, 5, 3, 3, 0xcbad80);
building(-9, -12, 5, 4, 4, 0xc4a37c);
building(12, 0, 3, 2.5, 4, 0xd9c89a);
building(0, -14, 5, 2.6, 3, 0xbca47b);
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
  cyl(0.22, 0.65, shirt, 0, 1.02, 0, g, 0.27);
  const head = new T.Mesh(new T.SphereGeometry(0.21, 12, 10), mat(skin));
  head.position.set(0, 1.6, 0);
  head.castShadow = true;
  g.add(head);
  cyl(0.22, 0.1, 0x393d31, 0, 1.77, 0, g);
  const legs = [];
  for (const k of [-1, 1]) {
    legs.push(box(0.14, 0.62, 0.16, 0x45544d, k * 0.115, 0.37, 0, g));
    box(0.17, 0.1, 0.27, 0x4b4939, k * 0.115, 0.08, 0.06, g);
    const arm = cyl(0.07, 0.62, shirt, k * 0.31, 1.02, 0, g);
    arm.rotation.z = k * 0.14;
  }
  return { g, legs };
}
const ama = person(-3.3, -2.7, 0xcb884d),
  bisi = person(-4.6, 4, 0x74978b),
  tunde = person(1.4, -0.8, 0x9b9d63);
const player = person(4, 4, 0xe4d6a6, 0x9b6343);
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
// The market and learning club occupy the same navigable workshop neighbourhood.
tunde.g.position.set(7.3, 0.3, 1.8);
box(3.5, 0.12, 5.8, 0xcbbd9b, 8, 0.25, -1.1);
for (const x of [6.6, 9.5])
  for (const z of [-2.5, 0.9]) box(0.1, 3, 0.1, 0x7d725c, x, 1.7, z);
box(3.5, 0.16, 3.9, 0x243b78, 8, 3.3, -0.8);
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
const lessonKit = box(0.6, 0.3, 0.45, 0xc9a54d, -4.7, 1.15, 4.8);
textPlane("EQUAL PARTS", 1.9, 0.27, -5, 1.63, 3.98, "#3b5c4a", "#fff4cd");
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
    pos: new T.Vector3(-5, 3.9, 5.3),
  },
  {
    id: "market",
    label: "Market · food & cash",
    pos: new T.Vector3(8, 3.9, -0.8),
  },
  {
    id: "council",
    label: "City desk · run the day",
    pos: new T.Vector3(2, 2.9, 0.4),
  },
];
for (const s of stations) {
  const b = document.createElement("button");
  b.className = "hotspot";
  b.innerHTML = '<span class="spot"></span>' + s.label;
  b.onclick = () => goToStation(s.id);
  $("scene-labels").append(b);
  s.el = b;
}
let navigationSignature = null;
let navigator,
  route = [],
  onArrival = null,
  routeLine = null;
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
  for (const p of [ama, bisi, tunde])
    obstacles.push({
      minX: p.g.position.x - 0.23,
      maxX: p.g.position.x + 0.23,
      minZ: p.g.position.z - 0.23,
      maxZ: p.g.position.z + 0.23,
    });
  navigator = createNavigator(obstacles);
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
  route = [];
  onArrival = null;

  walkTarget.copy(player.g.position);
  if (routeLine) {
    scene.remove(routeLine);
    routeLine.geometry.dispose();
    routeLine.material.dispose();
    routeLine = null;
  }
  $("travel").hidden = true;
}
function drawRoute() {
  if (routeLine) {
    scene.remove(routeLine);
    routeLine.geometry.dispose();
    routeLine.material.dispose();
  }
  const pts = [
    player.g.position,
    ...route.map((p) => new T.Vector3(p.x, 0.2, p.z)),
  ];
  const curve = new T.CurvePath();
  for (let i = 1; i < pts.length; i++)
    curve.add(
      new T.LineCurve3(
        new T.Vector3(pts[i - 1].x, 0.2, pts[i - 1].z),
        new T.Vector3(pts[i].x, 0.2, pts[i].z),
      ),
    );
  routeLine = new T.Mesh(
    new T.TubeGeometry(curve, Math.max(8, route.length * 8), 0.028, 4, false),
    new T.MeshBasicMaterial({ color: 0xd5e6aa }),
  );
  routeLine.userData.ignoreNavigation = true;
  scene.add(routeLine);
}
function goTo(point, arrival = null, label = "your destination") {
  const planned = navigator.route(player.g.position, point);
  if (!planned) {
    toast("No clear route there. Choose an open area or another approach.");
    return false;
  }
  cancelWalk();
  route = planned.points;
  onArrival = arrival;

  marker.position.set(planned.destination.x, 0.19, planned.destination.z);
  $("travel").hidden = false;
  $("travel-text").textContent = "Walking to " + label;
  drawRoute();
  if (planned.adjusted && !arrival)
    toast("That spot is occupied. Walking to the nearest clear space.");
  return true;
}
const approaches = {
  power: { x: 3.4, z: -5.6 },
  workshop: { x: -2.6, z: -2.8 },
  school: { x: -3.15, z: 4.1 },
  council: { x: 2.8, z: 1.1 },
  market: { x: 5.4, z: -1.6 },
};
function goToStation(id) {
  if (!$("intro").hidden || simulating) return;
  closeDetail();
  const station = stations.find((s) => s.id === id);
  goTo(approaches[id], () => inspect(id), station.label);
}
$("stop-walking").onclick = cancelWalk;

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
  $("detail").hidden = true;
}
function showDetail(html) {
  $("detail-body").innerHTML = html;
  $("detail").hidden = false;
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
function render() {
  const r = evaluateCity(state.config, {
      ...state,
      day: Math.min(state.day, 2),
    }),
    q = r.quote;
  $("chapter").textContent = "THE UNBUILT CITY · DAY " + state.day;
  $("mission-title").textContent =
    state.day === 1
      ? "Make the city work."
      : state.day === 2
        ? "Keep your city working."
        : "A city others can run.";
  $("mission-copy").textContent =
    state.day === 1
      ? "One city, one fund. Connect power, food and learning. Test how the whole day works."
      : state.day === 2
        ? "Dust cuts power. Collection slips to 15:00 and buyer payment arrives tomorrow. Adapt the same city."
        : "Your buildings and agreements remain here. Leave the people a clear operating plan.";
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
  $("step-label").textContent = "POWER ↔ FOOD ↔ LEARNING";
  $("credits").textContent = q.available;
  $("resource").hidden = !$("intro").hidden;
  $("build-dock").hidden = !$("intro").hidden;
  $("build-dock").classList.add("city-dock");
  $("mission").classList.add("city-board");
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
  $("mission-action").innerHTML =
    '<div class="district-buttons"><button data-district="power">Power</button><button data-district="market">Market</button><button data-district="school">Learning</button><button data-district="council">City desk</button></div>';
  document
    .querySelectorAll("[data-district]")
    .forEach((b) => (b.onclick = () => goToStation(b.dataset.district)));
  $("weather-title").textContent =
    state.day === 1 ? "Collection at 14:00" : "Dust · late collection";
  $("weather-icon").textContent = state.day === 1 ? "☀" : "☁";
  updateWorld();
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
  if (!state.seen.includes(id)) state.seen.push(id);
  render();
  if (id === "power" || id === "workshop") {
    showDetail(
      '<div class="eyebrow">POWER DISTRICT · THE SAME CITY</div><h2>Energy has a timetable.</h2><blockquote>Ama: “Repairs can move to midday. Bisi’s class cannot. Cooling at the market needs one more midday unit.”</blockquote><div class="evidence"><strong>GENERATION / MORNING · MIDDAY · AFTERNOON · EVENING</strong>' +
        (state.day === 1 ? "3 · 5 · 2 · 0" : "2 · 3 · 2 · 0") +
        ' units. Extra solar adds 2 at midday.<br>Essential demand: 2 each period. Repairs add 2 in the evening; shifting moves them to midday.<br>Storage holds 4 and moves at most 2 per period.<br>Cooling adds 1 midday unit. Care costs 1 credit each operating day.</div><p>Use the shared construction bar below to change the power system. Other districts keep their places, people and equipment.</p><button class="primary" id="noted">Return to the city →</button>',
    );
    $("noted").onclick = closeDetail;
  }
  if (id === "market") marketPanel();
  if (id === "school") schoolPanel();
  if (id === "council") councilPanel();
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
    '<div class="eyebrow">CITY STEWARDSHIP</div><h2>Who keeps this city working?</h2><p>The workshop, market and learning club now share an operating system. Leave responsibilities and a rule for responding to faults.</p><label class="field" for="operator">Who operates the city services?</label><select id="operator"><option value="">Choose…</option><option value="teams">Trained district teams with a shared coordinator</option><option value="me">I approve every decision</option></select><label class="field" for="reflection">What connection surprised you? Who still bears a cost?</label><textarea id="reflection" class="reflection" maxlength="600" placeholder="Use the power, food, cash or learning evidence…"></textarea><p class="hint">Practice stays in this session only. No personal details are needed.</p><button class="primary" id="handover">Leave the operating plan →</button>',
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
      '<div class="eyebrow">THE UNBUILT CITY · FIRST CONNECTED BUILD</div><h2>Your city can keep going.</h2><p>Power, food and learning remain connected here. The city has an agreed response to disruption and district teams to operate it.</p><div class="evidence"><strong>YOUR PRACTICE RECORD</strong>Two evaluated city days adopted. No verified XP or real-world capability is claimed. The reflection is length-checked, not independently assessed.</div><p id="reflection-record"></p><h3>Take one safe next step.</h3><p>With permission, ask a familiar adult how one local service is maintained and paid for. Notice which other services depend on it. Do not handle electrical equipment or potentially spoiled food.</p><button class="primary" id="keep-exploring">Keep exploring the city →</button>',
    );
    $("reflection-record").textContent = reflection;
    $("keep-exploring").onclick = closeDetail;
  };
}
$("test").onclick = runDay;
$("close-detail").onclick = closeDetail;
$("start").onclick = () => {
  $("intro").hidden = true;
  $("mission").hidden = false;
  $("mobile-move").hidden = innerWidth > 650;
  render();
  toast("Tap a place once to travel. The districts share one city.");
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
  if (
    !confirm("Restart this fictional city and clear its in-session progress?")
  )
    return;
  clearTimeout(runTimer);
  simulating = false;
  simPeriod = -1;
  state = fresh();
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
      distance = clamp(distance - (d - pinchDistance) * 0.055, 17, 42);
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
  if (down && !dragging && $("intro").hidden && !simulating) {
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
    distance = clamp(distance + e.deltaY * 0.02, 17, 42);
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
  target.lerp(desiredTarget, 0.04);
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
    if ((dx || dz) && !simulating) {
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
    const step = Math.min(diff.length(), dt * 3),
      next = player.g.position
        .clone()
        .add(diff.clone().normalize().multiplyScalar(step));
    if (navigator.segmentFree(player.g.position, next)) {
      player.g.position.copy(next);
      player.g.rotation.y = Math.atan2(diff.x, diff.z);
      player.legs.forEach(
        (l, i) => (l.rotation.x = Math.sin(time * 10 + i * Math.PI) * 0.4),
      );
    } else cancelWalk();
  } else {
    player.legs.forEach((l) => (l.rotation.x *= 0.85));
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
  });
  for (const s of stations) {
    v.copy(s.pos).project(camera);
    s.el.style.left = (v.x * 0.5 + 0.5) * innerWidth + "px";
    s.el.style.top = (-v.y * 0.5 + 0.5) * innerHeight + "px";
    s.el.style.visibility =
      v.z > 1 || !$("intro").hidden ? "hidden" : "visible";
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
  if ($("intro").hidden) $("mobile-move").hidden = innerWidth > 650;
}
window.addEventListener("resize", resize);
resize();
render();
document.querySelector(".intro-card>small").textContent =
  "One connected city · fictional simulation · this session only";
$("loading").hidden = true;
requestAnimationFrame(animate);
