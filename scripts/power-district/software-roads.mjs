import assert from "node:assert/strict";
import * as T from "../../public/games/shared/vendor/three.module.js";
import { SoftwareRenderer } from "../../public/games/shared/software-renderer.mjs";
import { cityBoxGeometry } from "../../public/games/city/layout.mjs";
const ctx = {
  setTransform() {},
  fillRect() {},
  drawImage() {},
  putImageData() {},
  createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
};
globalThis.document = { createElement: () => ({ getContext: () => ctx }) };
const renderer = new SoftwareRenderer({ getContext: () => ctx, style: {} });
renderer.setSize(160, 120);
renderer.lastDraw = -Infinity;
const scene = new T.Scene(),
  camera = new T.PerspectiveCamera(39, 160 / 120, 0.1, 260);
camera.position.set(18, 18, 18);
camera.lookAt(0, 0, 0);
const road = new T.Mesh(
  cityBoxGeometry(T, 116, 0.04, 3.5, true),
  new T.MeshStandardMaterial({ color: 0x66757c }),
);
road.position.y = 0.105;
scene.add(road);
const ground = new T.Mesh(
  cityBoxGeometry(T, 120, 0.12, 102, true),
  new T.MeshStandardMaterial({ color: 0xddd7bd }),
);
scene.add(ground);
renderer.render(scene, camera);
const center = (60 * 160 + 80) * 4;
const [r, g, b] = renderer.image.data.slice(center, center + 3);
assert(b > r + 8 && g > r, "Close-view road surface disappeared: " + [r, g, b]);
console.log(
  "PASS: actual software rasterizer draws a long road in close perspective without losing it at the camera clip plane.",
);

const colouredScene = new T.Scene();
const coloured = new T.BoxGeometry(6, 6, 6).toNonIndexed();
coloured.setAttribute(
  "color",
  new T.Float32BufferAttribute(
    Array.from({ length: coloured.attributes.position.count }, () => [
      0.03, 0.6, 0.05,
    ]).flat(),
    3,
  ),
);
colouredScene.add(
  new T.Mesh(coloured, new T.MeshStandardMaterial({ vertexColors: true })),
);
renderer.lastDraw = -Infinity;
renderer.render(colouredScene, camera);
let greenPixels = 0;
for (let i = 0; i < renderer.image.data.length; i += 4) {
  if (
    renderer.image.data[i + 1] > renderer.image.data[i] * 2 &&
    renderer.image.data[i + 1] > renderer.image.data[i + 2] * 2
  )
    greenPixels++;
}
assert(
  greenPixels > 20,
  "Merged city projects must retain their colours without WebGL",
);
console.log(
  "PASS: fallback rasterizer retains vertex colours on merged city buildings.",
);
