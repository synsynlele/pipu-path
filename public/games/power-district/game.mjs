import * as T from "../shared/vendor/three.module.js";
import { simulate, spent, COSTS } from "./model.mjs";
import { SoftwareRenderer } from "../shared/software-renderer.mjs";
import { createNavigator } from "../shared/navigation.mjs";
const $ = (id) => document.getElementById(id),
  clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const embedded = new URLSearchParams(location.search).get("embedded") === "1";
const initial = () => ({
  stage: 0,
  seen: [],
  config: { storage: false, solar: false, schedule: false, maintenance: false },
  baseline: false,
  stormTest: false,
  policy: "",
  handover: false,
  reflection: "",
});
let state = initial();
try {
  if (!embedded) {
    const old = JSON.parse(localStorage.getItem("pipupath-power-v1"));
    if (
      old &&
      Number.isInteger(old.stage) &&
      old.stage >= 0 &&
      old.stage <= 4 &&
      Array.isArray(old.seen) &&
      old.config
    ) {
      state = { ...initial(), ...old };
      for (const k of Object.keys(COSTS)) state.config[k] = !!old.config[k];
      if (spent(state.config) > 8) state = initial();
    }
  }
} catch {}
const save = () => {
  if (embedded) return;
  try {
    localStorage.setItem("pipupath-power-v1", JSON.stringify(state));
  } catch {}
};
let sound = false,
  audio,
  simulating = false,
  simPeriod = -1,
  simRows = [];
function tone(freq = 440) {
  if (!sound) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.035, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.25);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.25);
  } catch {}
}
let toastTimer;
function toast(msg) {
  $("toast").textContent = msg;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 3400);
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
const stations = [
  { id: "solar", label: "Solar garden", pos: new T.Vector3(1.6, 2.5, -6.7) },
  { id: "ama", label: "Ama · technician", pos: new T.Vector3(-3.3, 2.7, -2.7) },
  {
    id: "bisi",
    label: "Bisi · learning club",
    pos: new T.Vector3(-5, 3.8, 5.3),
  },
  { id: "console", label: "Test your system", pos: new T.Vector3(2, 2.8, 0.4) },
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
  solar: { x: 3.4, z: -5.6 },
  ama: { x: -2.6, z: -2.8 },
  bisi: { x: -3.15, z: 4.1 },
  console: { x: 2.8, z: 1.1 },
};
function goToStation(id) {
  if (!$("intro").hidden || simulating) return;
  closeDetail();
  const station = stations.find((s) => s.id === id);
  goTo(approaches[id], () => inspect(id), station.label);
}
$("stop-walking").onclick = cancelWalk;

function updateWorld() {
  battery.visible = state.config.storage;
  extraSolar.visible = state.config.solar;
  spareBox.visible = state.config.maintenance;
  stations.forEach((s) =>
    s.el.classList.toggle("seen", state.seen.includes(s.id)),
  );
  rebuildNavigation();
}
const chapters = [
  [
    "01 / DISCOVER",
    "A workshop worth keeping.",
    "Before you build, listen. Inspect the solar garden and meet the people who depend on this place.",
    "DISCOVER",
  ],
  [
    "02 / BUILD",
    "Make the whole day work.",
    "You have 8 credits. Balance power, timing and upkeep. Add options below, then test your design.",
    "BUILD & TEST",
  ],
  [
    "03 / ADAPT",
    "The sky has other plans.",
    "A dusty sky cuts generation. Test your system again, then agree on a fair response to the shortfall.",
    "ADAPT",
  ],
  [
    "04 / HAND OVER",
    "Let it last beyond you.",
    "A solution needs people to keep it working. Leave a clear operating agreement for the cooperative.",
    "HAND OVER",
  ],
  [
    "05 / REFLECT",
    "A builder leaves capability.",
    "You investigated, tested and made a difficult trade-off. Your next challenge is helping another team carry it forward.",
    "COMPLETE",
  ],
];
function objective(label, done) {
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
  const c = chapters[state.stage];
  $("chapter").textContent = c[0];
  $("mission-title").textContent = c[1];
  $("mission-copy").textContent = c[2];
  $("step-label").textContent = c[3];
  $("progress").style.width = [15, 38, 62, 83, 100][state.stage] + "%";
  $("credits").textContent = 8 - spent(state.config);
  $("resource").hidden = state.stage === 0 || state.stage === 4;
  $("build-dock").hidden = ![1, 2].includes(state.stage);
  document.body.classList.toggle("building", [1, 2].includes(state.stage));
  $("test").disabled = simulating;
  $("test").innerHTML =
    (state.stage === 2 ? "Test dusty day" : "Run a day") + " <span>→</span>";
  let obj = "",
    action = "";
  if (state.stage === 0) {
    obj =
      objective("Inspect the solar garden", state.seen.includes("solar")) +
      objective("Talk to Ama, the technician", state.seen.includes("ama")) +
      objective("Hear Bisi’s priorities", state.seen.includes("bisi"));
    if (["solar", "ama", "bisi"].every((x) => state.seen.includes(x)))
      action =
        '<button class="primary" id="begin-build">Start building <span>→</span></button>';
  }
  if (state.stage === 1)
    obj =
      objective("Build within 8 credits", spent(state.config) <= 8) +
      objective("Meet demand in every period", state.baseline) +
      objective("Make a maintenance plan", state.config.maintenance);
  if (state.stage === 2) {
    obj =
      objective("Test reduced generation", state.stormTest) +
      objective("Agree a fair service response", !!state.policy);
    if (state.stormTest && state.policy)
      action =
        '<button class="primary" id="begin-handover">Prepare the handover <span>→</span></button>';
  }
  if (state.stage === 3) {
    obj =
      objective("Name an operating role", state.handover) +
      objective("Fund maintenance", state.config.maintenance) +
      objective("Leave a useful reflection", state.handover);
    action =
      '<button class="primary" id="open-handover">Write the agreement <span>→</span></button>';
  }
  if (state.stage === 4) {
    obj =
      objective("Evidence before equipment", true) +
      objective("A system people can maintain", true) +
      objective("A clear response to disruption", true);
    action =
      '<button class="primary" id="view-report">View your builder record <span>↗</span></button>';
  }
  $("objectives").innerHTML = obj;
  $("mission-action").innerHTML = action;
  if ($("begin-build"))
    $("begin-build").onclick = () => {
      state.stage = 1;
      closeDetail();
      toast("Your budget is 8 credits. Try a design, then run a day.");
      render();
      save();
    };
  if ($("begin-handover"))
    $("begin-handover").onclick = () => {
      state.stage = 3;
      closeDetail();
      render();
      save();
      openHandover();
    };
  if ($("open-handover")) $("open-handover").onclick = openHandover;
  if ($("view-report")) $("view-report").onclick = report;
  const opts = [
    ["storage", "▥", "Battery storage", "Hold up to 4 units"],
    ["solar", "☀", "More solar", "+2 units at midday"],
    ["schedule", "⇄", "Shift workshop", "Move 2 units to midday"],
    ["maintenance", "⚒", "Care reserve", "Parts + service plan"],
  ];
  document.querySelector(".dock-title>span:last-child").textContent =
    state.stage === 2
      ? "Installed system · agree how to share the shortfall"
      : "Tap to add · tap again to remove";
  $("build-options").innerHTML = opts
    .map(
      ([k, i, t, d]) =>
        '<button class="build-item ' +
        (state.config[k] ? "active" : "") +
        '" data-option="' +
        k +
        '" aria-pressed="' +
        state.config[k] +
        '"><span class="build-symbol">' +
        i +
        '</span><span class="price">' +
        COSTS[k] +
        " ◈</span><b>" +
        t +
        "</b><small>" +
        d +
        "</small></button>",
    )
    .join("");
  document.querySelectorAll("[data-option]").forEach((b) => {
    b.disabled = simulating || state.stage === 2;
    b.onclick = () => toggle(b.dataset.option);
  });
  $("weather-icon").textContent = state.stage >= 2 ? "☁" : "☀";
  $("weather-title").textContent =
    state.stage >= 2 ? "Dust on the horizon" : "A bright beginning";
  updateWorld();
}
function toggle(k) {
  if (simulating || state.stage !== 1) return;
  if (!state.config[k] && spent(state.config) + COSTS[k] > 8) {
    toast("That exceeds your budget. Remove another option to compare.");
    tone(180);
    return;
  }
  state.config[k] = !state.config[k];
  state.baseline = false;
  state.stormTest = false;
  state.policy = "";
  unusedEnd = null;
  closeDetail();
  tone(400 + spent(state.config) * 45);
  render();
  save();
  if (k === "schedule" && state.config.schedule)
    toast("Ama agrees: flexible repair work moves to midday.");
  if (k === "maintenance" && state.config.maintenance)
    toast("2 credits reserved: service kit and an operating plan.");
}
function showDetail(html) {
  $("detail-body").innerHTML = html;
  $("detail").hidden = false;
}
function closeDetail() {
  $("detail").hidden = true;
}
function inspect(id) {
  if ($("intro").hidden === false || simulating) return;
  tone(510);

  if (!state.seen.includes(id)) {
    state.seen.push(id);
    save();
  }
  render();
  if (id === "solar")
    showDetail(
      '<div class="eyebrow">INSPECT / GENERATION</div><h2>The sun has a schedule.</h2><p>Plenty of energy at midday does not mean power is available in the evening.</p><div class="evidence"><strong>DAILY SUPPLY · ENERGY UNITS</strong>' +
        [3, 5, 2, 0]
          .map(
            (n, i) =>
              '<div class="energy-row"><span>' +
              ["Morning", "Midday", "Afternoon", "Evening"][i] +
              "</span><b>" +
              n +
              "</b></div>",
          )
          .join("") +
        '</div><p>A battery holds up to 4 units and can charge or discharge 2 per period. Extra panels add 2 units at midday only.</p><p class="hint">Toy model: no storage losses. Units and prices are fictional.</p><button class="primary" id="continue-detail">Evidence noted <span>✓</span></button>',
    );
  if (id === "ama")
    showDetail(
      '<div class="eyebrow">TALK / THE COOPERATIVE</div><div class="person"><span class="avatar">⚒</span><div><h3>Ama</h3><small>Technician & cooperative member</small></div></div><blockquote>“We can shift some repairs to midday. But if we buy equipment with no plan to service it, we’ll be back here next month.”</blockquote><div class="evidence"><strong>WHAT THE WORKSHOP NEEDS</strong>Essential demand: 2 units in each period.<br>Flexible repairs: 2 extra units in the evening.<br>With agreement, those 2 units can move to midday.</div><p>The care reserve costs 2 credits now. Ongoing servicing will still need 1 credit each week.</p><button class="primary" id="continue-detail">I understand <span>✓</span></button>',
    );
  if (id === "bisi")
    showDetail(
      '<div class="eyebrow">TALK / LEARNING COMMONS</div><div class="person"><span class="avatar">✎</span><div><h3>Bisi</h3><small>Learning club facilitator</small></div></div><blockquote>“Our learners arrive after work and school. Moving their class to midday would exclude them. Ask who can change their schedule—and who cannot.”</blockquote><div class="evidence"><strong>A DIFFERENT KIND OF CONSTRAINT</strong>The evening class is part of the essential 2-unit evening demand. Flexible workshop demand can move; the class cannot.</div><p>If supply falls, involve people in agreeing a reduced service. Do not quietly move the cost onto those with less choice.</p><button class="primary" id="continue-detail">Keep their needs visible <span>✓</span></button>',
    );
  if (id === "console") {
    if (state.stage === 0)
      showDetail(
        '<div class="eyebrow">CONTROL DESK</div><h2>Listen before you build.</h2><p>Inspect the solar garden, talk to Ama and hear Bisi’s priorities first. Their evidence will help you choose what to test.</p>',
      );
    else if (state.stage === 3) openHandover();
    else if (state.stage === 4) report();
    else
      showDetail(
        '<div class="eyebrow">CONTROL DESK</div><h2>Make a prediction.</h2><p>Will your system serve every period? Remember that unused midday energy cannot travel forward in time without storage.</p><div class="evidence"><strong>YOUR CURRENT PLAN</strong>' +
          Object.keys(COSTS)
            .filter((k) => state.config[k])
            .map(
              (k) =>
                ({
                  storage: "Battery storage",
                  solar: "Extra solar",
                  schedule: "Workshop rescheduling",
                  maintenance: "Maintenance reserve",
                })[k],
            )
            .join("<br>") +
          '</div><button class="primary" id="console-run">Run the simulation <span>→</span></button>',
      );
  }
  if ($("continue-detail")) $("continue-detail").onclick = closeDetail;
  if ($("console-run")) $("console-run").onclick = runDay;
}
let dayTimer;
function runDay() {
  if (simulating || ![1, 2].includes(state.stage)) return;
  cancelWalk();
  simulating = true;
  simPeriod = 0;
  simRows = simulate(state.config, state.stage === 2);
  closeDetail();
  tone(600);
  toast("Watch the workshop: one period at a time.");
  render();
  function tick() {
    if (simPeriod >= 4) {
      simulating = false;
      simPeriod = -1;
      clearTimeout(dayTimer);
      showResults();
      render();
      return;
    }
    const row = simRows[simPeriod];
    $("weather-title").textContent =
      row.period + " · " + row.served + "/" + row.needed + " units served";
    document.querySelector(".weather-time").textContent = [
      "08:00",
      "12:00",
      "16:00",
      "20:00",
    ][simPeriod];
    tone(row.unmet ? 220 : 620);
    simPeriod++;
    dayTimer = setTimeout(tick, 1100);
  }
  tick();
}
function showResults() {
  const total = simRows.reduce((n, r) => n + r.served, 0),
    need = simRows.reduce((n, r) => n + r.needed, 0),
    ok = total === need,
    storm = state.stage === 2;
  if (!storm) state.baseline = ok;
  if (storm) state.stormTest = true;
  save();
  let html =
    '<div class="eyebrow">TEST RESULTS / ' +
    (storm ? "DUSTY DAY" : "NORMAL DAY") +
    "</div><h2>" +
    (ok ? "The day holds together." : "Find the missing link.") +
    '</h2><div class="stat-row"><div class="stat"><b>' +
    total +
    "/" +
    need +
    '</b><small>UNITS SERVED</small></div><div class="stat"><b>' +
    (8 - spent(state.config)) +
    '</b><small>CREDITS LEFT</small></div></div><div class="timeline">' +
    simRows
      .map(
        (r) =>
          '<div class="time-row ' +
          (r.unmet ? "bad" : "") +
          '"><span>' +
          r.period +
          '</span><div class="bar"><i style="width:' +
          (r.served / r.needed) * 100 +
          '%"></i></div><span>' +
          r.served +
          "/" +
          r.needed +
          "</span></div>",
      )
      .join("") +
    '</div><div class="evidence"><strong>STORAGE AFTER EACH PERIOD</strong>' +
    simRows.map((r) => r.period + ": " + r.charge).join(" · ") +
    "</div>";
  if (!storm) {
    html +=
      "<p>" +
      (ok
        ? "Your generation, storage and timing work together. Now ask whether the cooperative can keep them working."
        : "More generation alone may leave the evening dark. Compare when energy arrives with when people need it. You can remove options and try again.") +
      "</p>";
    if (ok && !state.config.maintenance)
      html +=
        '<div class="result-label bad">Power works today, but upkeep is unfunded. Revise the plan to include the care reserve before continuing.</div>';
    if (ok && state.config.maintenance)
      html +=
        '<button class="primary" id="storm-next">Face a changed challenge <span>→</span></button>';
    else
      html +=
        '<button class="primary" id="revise">Revise the design <span>↻</span></button>';
  } else {
    html +=
      '<p>A dusty day supplies only 2, 3, 2 and 0 units. A shortfall remains with the original budget. Recognising this limit is part of good judgement.</p><div class="result-label bad">Choose an agreement with the community. These choices change who bears the shortfall; they do not create energy.</div><button class="detail-choice ' +
      (state.policy === "protect" ? "selected" : "") +
      '" data-policy="protect">Protect essential services<small>Cancel flexible repairs and share the remaining limits openly. Prioritise the evening class. Tell customers which jobs must wait.</small></button><button class="detail-choice ' +
      (state.policy === "rotate" ? "selected" : "") +
      '" data-policy="rotate">Agree a rotating reduced service<small>With consent, rotate access among essential users. Publish the schedule and tell the class and customers what is reduced.</small></button>';
  }
  showDetail(html);
  if ($("storm-next"))
    $("storm-next").onclick = () => {
      state.stage = 2;
      state.stormTest = false;
      closeDetail();
      render();
      save();
      toast("A new constraint. Test your system before choosing a response.");
    };
  if ($("revise")) $("revise").onclick = closeDetail;
  document.querySelectorAll("[data-policy]").forEach(
    (b) =>
      (b.onclick = () => {
        state.policy = b.dataset.policy;
        save();
        render();
        tone(700);
        showPolicy();
      }),
  );
}
function showPolicy() {
  showDetail(
    '<div class="eyebrow">AGREEMENT / SHARED CONSEQUENCES</div><h2>' +
      (state.policy === "protect"
        ? "Keep essential access first."
        : "Share the shortfall openly.") +
      "</h2><p>" +
      (state.policy === "protect"
        ? "The cooperative postpones flexible repair work. Essential users receive priority, with the evening class protected first. Some customers must wait, and the team must communicate that cost."
        : "The cooperative publishes a rotating reduced-service schedule. Access is shared by agreement, but the evening class may lose time. Bisi must be involved before the schedule is adopted.") +
      '</p><div class="evidence"><strong>THE HONEST LIMIT</strong>Your test showed ' +
      simulate(state.config, true).reduce((n, r) => n + r.unmet, 0) +
      ' units unmet under the original demand. A service agreement changes demand and allocation; the energy model has not magically improved.</div><div class="evidence"><strong>AGREED SERVICE · FICTIONAL UNITS</strong>' +
      (state.policy === "protect"
        ? "Morning 1/2 · Midday 2/4 · Afternoon 2/2 · Evening 2/2. One unit of morning essential service is reduced and two units of flexible repairs are postponed."
        : "Morning 2/2 · Midday 2/4 · Afternoon 2/2 · Evening 1/2. Two units of flexible repairs are postponed and evening service is halved by agreement.") +
      '</div><button class="secondary" id="replay-policy">Watch the agreed service run ↗</button><p>Next, leave an operating role, maintenance funding rule and escalation plan.</p><button class="primary" id="handover-next">Prepare the handover <span>→</span></button>',
  );
  $("replay-policy").onclick = () => {
    simRows = simulate(state.config, true, state.policy);
    simulating = true;
    simPeriod = 0;
    closeDetail();
    render();
    function next() {
      if (simPeriod >= 4) {
        simulating = false;
        simPeriod = -1;
        render();
        showPolicy();
        return;
      }
      const r = simRows[simPeriod];
      $("weather-title").textContent =
        r.period + " · agreed service " + r.served + "/" + r.needed;
      document.querySelector(".weather-time").textContent = [
        "08:00",
        "12:00",
        "16:00",
        "20:00",
      ][simPeriod];
      simPeriod++;
      dayTimer = setTimeout(next, 1100);
    }
    next();
  };
  $("handover-next").onclick = () => {
    state.stage = 3;
    save();
    render();
    openHandover();
  };
}
function openHandover() {
  showDetail(
    '<div class="eyebrow">HANDOVER / PEOPLE MAKE IT LAST</div><h2>Who keeps it working?</h2><p>Choose an operating role, a recurring funding rule and a clear response when the system cannot meet demand.</p><label class="field" for="operator">Operating responsibility</label><select id="operator"><option value="">Choose a responsible role…</option><option value="team">Trained cooperative rota, led by Ama</option><option value="founder">I approve every decision myself</option></select><label class="field" for="funding">Weekly servicing: 1 credit</label><select id="funding"><option value="">Choose a funding rule…</option><option value="reserve">Ring-fence 1 credit from weekly service income; review shortfalls</option><option value="later">Wait until something breaks</option></select><label class="field" for="escalation">When demand cannot be met</label><select id="escalation"><option value="">Choose a response…</option><option value="open">Use the agreed priorities, notify users and log the shortfall</option><option value="hide">Keep the shortfall quiet to protect trust</option></select><label class="field" for="reflection">What changed your thinking? Who bears a remaining cost?</label><textarea id="reflection" class="reflection" placeholder="Use your test results and the people’s needs…" maxlength="600"></textarea><p class="hint">' +
      (embedded
        ? "This reflection stays in this session only."
        : "This reflection stays on this device.") +
      ' No personal details needed.</p><button class="primary" id="finish">Test the handover <span>→</span></button>',
  );
  $("reflection").value = state.reflection;
  $("finish").onclick = () => {
    state.reflection = $("reflection").value.trim();
    save();
    if ($("operator").value !== "team") {
      toast(
        "A lasting system needs an accountable team, not your constant approval.",
      );
      return;
    }
    if ($("funding").value !== "reserve") {
      toast("Fund recurring servicing before equipment fails.");
      return;
    }
    if ($("escalation").value !== "open") {
      toast("Users need an honest warning and the agreed service priorities.");
      return;
    }
    if (state.reflection.length < 20) {
      toast("Add a short reflection about your evidence and a remaining cost.");
      return;
    }
    if (!state.config.maintenance) {
      toast("Return to Build and fund the care reserve.");
      return;
    }
    state.handover = true;
    state.stage = 4;
    save();
    render();
    tone(880);
    report();
  };
}
function report() {
  showDetail(
    '<div class="eyebrow">MISSION RECORD / POWER DISTRICT</div><h2>You built more than power.</h2><span class="badge">WORKSHOP KEEPER · PROTOTYPE</span><p>The cooperative has a tested normal-day plan, a response to disruption and a team responsible for upkeep.</p><div class="evidence"><strong>YOUR BUILDER RECORD</strong>✓ Inspected evidence and heard both users<br>✓ Met normal-day demand within 8 credits<br>✓ Recognised the dusty-day limit<br>✓ ' +
      (state.policy === "protect"
        ? "Prioritised essential services"
        : "Agreed rotating reduced service") +
      '<br>✓ Assigned the rota and weekly maintenance funding</div><label class="field">YOUR REFLECTION</label><p id="saved-reflection"></p><p class="hint">Completion records your choices in this prototype. It is not a validated assessment of real-world competence.</p><h3 style="font-size:17px">Take one safe next step.</h3><p>Ask a willing adult how a familiar service is maintained. Find out who notices faults, who pays and what happens when its operator is absent. Do not handle electrical equipment.</p><button class="primary" id="explore-again">Explore your workshop <span>↗</span></button>',
  );
  $("saved-reflection").textContent = state.reflection;
  $("explore-again").onclick = closeDetail;
}
$("test").onclick = runDay;
$("close-detail").onclick = closeDetail;
$("start").onclick = () => {
  $("intro").hidden = true;
  $("mission").hidden = false;
  $("mobile-move").hidden = innerWidth > 650;
  tone(520);
  render();
  if (state.stage > 0)
    toast("Welcome back. Your workshop progress is saved here.");
  else toast("Start with the people and the evidence. Tap a station label.");
};
$("sound").onclick = () => {
  sound = !sound;
  $("sound").textContent = sound ? "♪" : "♫";
  $("sound").setAttribute(
    "aria-label",
    sound ? "Turn sound off" : "Turn sound on",
  );
  $("sound").style.background = sound ? "#d8e7a8" : "";
  tone(650);
};
$("help").onclick = () => $("help-dialog").showModal();
$("help-done").onclick = $("close-help").onclick = () =>
  $("help-dialog").close();
$("reset").onclick = () => {
  if (!confirm("Restart this mission and clear this device’s progress?"))
    return;
  clearTimeout(dayTimer);
  simulating = false;
  simPeriod = -1;
  state = initial();
  unusedEnd = null;
  cancelWalk();
  save();
  closeDetail();
  render();
  toast("A fresh start. Listen, investigate, then build.");
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
  if (down && !dragging && $("intro").hidden) {
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
  const dt = Math.min((now - last) / 1000, 0.05);
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
    if (dx || dz) {
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
    night ? 0.3 : state.stage >= 2 ? 2.2 : 3.5,
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
if (embedded) {
  document.querySelector(".intro-card>small").textContent =
    "Practice prototype · in-session only · real Quest progress stays separate";
  document.querySelector("#help-dialog p:nth-of-type(3)").textContent =
    "Fictional energy units and costs. Practice stays in this session and does not earn verified XP or create Quest evidence.";
  document
    .querySelector(".brand")
    .setAttribute("aria-label", "The Unbuilt City controls");
}
$("loading").hidden = true;
requestAnimationFrame(animate);
