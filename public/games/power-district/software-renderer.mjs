import * as T from "./vendor/three.module.js";
// A true projected 3D fallback for browsers without WebGL. Same scene and controls.
export class SoftwareRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.shadowMap = {};
    this.bg = "#e9e2d2";
    this.w = 1;
    this.h = 1;
    this.lastDraw = 0;
    this.pixelRatio = 1;
    this.normal = new T.Vector3();
    this.normalMatrix = new T.Matrix3();
    this.light = new T.Vector3(-0.45, 0.85, 0.3).normalize();
    this.m = new T.Matrix4();
    this.world = new T.Vector3();
    this.points = [];
    this.faces = [];
    this.lastWidth = 0;
  }
  setPixelRatio(n) {
    this.pixelRatio = Math.min(n, 1.2);
  }
  setSize(w, h) {
    this.w = w;
    this.h = h;
    this.canvas.width = w * this.pixelRatio;
    this.canvas.height = h * this.pixelRatio;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }
  setClearColor(c) {
    this.bg = "#" + new T.Color(c).getHexString();
  }
  render(scene, camera) {
    const now = performance.now();
    if (now - this.lastDraw < 65) return;
    this.lastDraw = now;
    scene.updateMatrixWorld();
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    this.m.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const ctx = this.ctx,
      w = this.w,
      h = this.h;
    ctx.fillStyle = this.bg;
    ctx.fillRect(0, 0, w, h);
    const faces = [];
    scene.traverseVisible((o) => {
      if (!o.isMesh || !o.geometry?.attributes.position) return;
      const geo = o.geometry;
      if (geo.parameters?.width > 70) return;
      const pos = geo.attributes.position,
        idx = geo.index,
        normal = geo.attributes.normal;
      const matrix = new T.Matrix4().multiplyMatrices(this.m, o.matrixWorld);
      const pts = [];
      for (let i = 0; i < pos.count; i++) {
        const p = new T.Vector3()
          .fromBufferAttribute(pos, i)
          .applyMatrix4(matrix);
        pts.push([(p.x * 0.5 + 0.5) * w, (-p.y * 0.5 + 0.5) * h, p.z]);
      }
      this.normalMatrix.getNormalMatrix(o.matrixWorld);
      const count = idx ? idx.count : pos.count;
      for (let i = 0; i < count; i += 3) {
        const a = idx ? idx.getX(i) : i,
          b = idx ? idx.getX(i + 1) : i + 1,
          c = idx ? idx.getX(i + 2) : i + 2;
        const p = pts[a],
          q = pts[b],
          r = pts[c];
        if (
          !p ||
          !q ||
          !r ||
          p[2] > 1 ||
          q[2] > 1 ||
          r[2] > 1 ||
          p[2] < -1 ||
          q[2] < -1 ||
          r[2] < -1
        )
          continue;
        if (
          Math.max(p[0], q[0], r[0]) < 0 ||
          Math.min(p[0], q[0], r[0]) > w ||
          Math.max(p[1], q[1], r[1]) < 0 ||
          Math.min(p[1], q[1], r[1]) > h
        )
          continue;
        const cross =
          (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
        const material = Array.isArray(o.material)
          ? o.material[Math.floor(i / 6) % o.material.length]
          : o.material;
        if (!material || material.visible === false) continue;
        if (cross >= 0 && material.side !== T.DoubleSide) continue;
        let shade = 1;
        if (normal) {
          this.normal
            .fromBufferAttribute(normal, a)
            .applyMatrix3(this.normalMatrix)
            .normalize();
          shade = 0.76 + 0.28 * Math.max(0, this.normal.dot(this.light));
        }
        const color = material.color?.clone() ?? new T.Color(0xffffff);
        color.multiplyScalar(shade);
        const opacity = material.opacity ?? 1;
        faces.push({
          p,
          q,
          r,
          z: (p[2] + q[2] + r[2]) / 3,
          color: "#" + color.getHexString(),
          opacity,
          map: material.map,
          uv: geo.attributes.uv,
          a,
          b,
          c,
        });
      }
    }); // Depth-buffered rasterization prevents intersecting floors and objects from
    // relying on triangle ordering on devices without a graphics context.
    const scale = Math.min(1, 900 / w),
      rw = Math.ceil(w * scale),
      rh = Math.ceil(h * scale);
    if (
      !this.bufferCanvas ||
      this.bufferCanvas.width !== rw ||
      this.bufferCanvas.height !== rh
    ) {
      this.bufferCanvas = document.createElement("canvas");
      this.bufferCanvas.width = rw;
      this.bufferCanvas.height = rh;
      this.bufferCtx = this.bufferCanvas.getContext("2d");
      this.image = this.bufferCtx.createImageData(rw, rh);
      this.depth = new Float32Array(rw * rh);
      this.textureCache = new WeakMap();
    }
    const pixels = this.image.data,
      depth = this.depth;
    depth.fill(Infinity);
    const bg = parseInt(this.bg.slice(1), 16);
    for (let i = 0; i < depth.length; i++) {
      pixels[i * 4] = bg >> 16;
      pixels[i * 4 + 1] = (bg >> 8) & 255;
      pixels[i * 4 + 2] = bg & 255;
      pixels[i * 4 + 3] = 255;
    }
    for (const f of faces) {
      const ax = f.p[0] * scale,
        ay = f.p[1] * scale,
        bx = f.q[0] * scale,
        by = f.q[1] * scale,
        cx = f.r[0] * scale,
        cy = f.r[1] * scale;
      const den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
      if (Math.abs(den) < 0.01) continue;
      const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx))),
        maxX = Math.min(rw - 1, Math.ceil(Math.max(ax, bx, cx))),
        minY = Math.max(0, Math.floor(Math.min(ay, by, cy))),
        maxY = Math.min(rh - 1, Math.ceil(Math.max(ay, by, cy)));
      const hex = parseInt(f.color.slice(1), 16),
        red = hex >> 16,
        green = (hex >> 8) & 255,
        blue = hex & 255;
      let tex = null,
        uv = null;
      if (f.map?.image && f.uv) {
        const img = f.map.image;
        if (!this.textureCache.has(img)) {
          const tcv = document.createElement("canvas");
          tcv.width = img.width;
          tcv.height = img.height;
          const tc = tcv.getContext("2d");
          tc.drawImage(img, 0, 0);
          this.textureCache.set(img, {
            w: img.width,
            h: img.height,
            data: tc.getImageData(0, 0, img.width, img.height).data,
          });
        }
        tex = this.textureCache.get(img);
        uv = [f.a, f.b, f.c].map((i) => [f.uv.getX(i), 1 - f.uv.getY(i)]);
      }
      for (let y = minY; y <= maxY; y++)
        for (let x = minX; x <= maxX; x++) {
          const u =
              ((by - cy) * (x + 0.5 - cx) + (cx - bx) * (y + 0.5 - cy)) / den,
            v = ((cy - ay) * (x + 0.5 - cx) + (ax - cx) * (y + 0.5 - cy)) / den,
            t = 1 - u - v;
          if (u < 0 || v < 0 || t < 0) continue;
          const z = u * f.p[2] + v * f.q[2] + t * f.r[2],
            at = y * rw + x;
          if (z >= depth[at]) continue;
          depth[at] = z;
          const pp = at * 4;
          if (tex) {
            const tx = Math.max(
                0,
                Math.min(
                  tex.w - 1,
                  Math.floor(
                    (u * uv[0][0] + v * uv[1][0] + t * uv[2][0]) * tex.w,
                  ),
                ),
              ),
              ty = Math.max(
                0,
                Math.min(
                  tex.h - 1,
                  Math.floor(
                    (u * uv[0][1] + v * uv[1][1] + t * uv[2][1]) * tex.h,
                  ),
                ),
              ),
              ti = (ty * tex.w + tx) * 4;
            pixels[pp] = tex.data[ti];
            pixels[pp + 1] = tex.data[ti + 1];
            pixels[pp + 2] = tex.data[ti + 2];
          } else {
            pixels[pp] = red;
            pixels[pp + 1] = green;
            pixels[pp + 2] = blue;
          }
        }
    }
    this.bufferCtx.putImageData(this.image, 0, 0);
    ctx.drawImage(this.bufferCanvas, 0, 0, w, h);
    ctx.globalAlpha = 1;
  }
}
