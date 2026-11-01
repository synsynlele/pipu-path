import {
  WIDTH,
  HEIGHT,
  HOMES,
  OUTLET,
  BLOCKED,
  BUDGET,
  newSite,
  spent,
  editSite,
  testRain,
} from "./hands-on-model.mjs";
export function mountHandsOnCity({
  T,
  scene,
  canvas,
  getCamera,
  enter,
  leave,
}) {
  let active = false,
    site = newSite(),
    history = [],
    tool = "drain",
    result = null;
  const root = new T.Group();
  root.position.set(86, 0, 0);
  root.visible = false;
  scene.add(root);
  const meshes = [],
    materials = [],
    geometries = [],
    drops = [];
  let rainUntil = 0;
  const panel = document.createElement("section");
  panel.className = "hands-on-panel";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Hands-on city building");
  panel.innerHTML = `<header><strong>Protect the homes</strong><button data-exit aria-label="Return to game entrance">✕</button></header><p>Rain enters three homes. Build drains to the blue outlet. Basins hold extra water.</p><div class="hands-on-tools" role="group" aria-label="Building tools"><button data-tool="drain">Drain · 1</button><button data-tool="basin">Basin · 3</button><button data-tool="clear">Clear · 1</button><button data-tool="remove">Remove</button></div><div class="hands-on-tools"><button data-test>Test with rain</button><button data-undo>Undo</button><button data-reset>Start again</button></div><p data-status role="status" aria-live="polite"></p><details><summary>Keyboard controls and building map</summary><p>Select a tool, then select a ground tile. Brown tiles are blockages. The blue outlet is at row 5, column 4. Practice stays in this session.</p><div class="hands-on-grid" role="group" aria-label="City ground tiles"></div></details><a href="/real-quests" target="_top">Try a real-world Quest →</a>`;
  document.body.append(panel);
  const grid = panel.querySelector(".hands-on-grid");
  function cube(w, h, d, color, x, y, z) {
    const geometry = new T.BoxGeometry(w, h, d),
      material = new T.MeshStandardMaterial({ color, roughness: 0.85 });
    geometries.push(geometry);
    materials.push(material);
    const mesh = new T.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    root.add(mesh);
    return mesh;
  }
  function draw(
    message = "Tap the ground to build. Materials: " + (BUDGET - spent(site)),
  ) {
    root.clear();
    meshes.length = 0;
    drops.length = 0;
    geometries.splice(0).forEach((g) => g.dispose());
    materials.splice(0).forEach((m) => m.dispose());
    grid.replaceChildren();
    for (let id = 0; id < WIDTH * HEIGHT; id++) {
      const x = ((id % WIDTH) - 3) * 2.2,
        z = (Math.floor(id / WIDTH) - 2) * 2.2;
      const blocked = BLOCKED.includes(id) && !site.cleared.includes(id),
        home = HOMES.includes(id),
        kind = site.tiles[id];
      const flooded = result?.flooded.includes(id);
      const color = flooded
        ? 0x409bd1
        : home
          ? result
            ? 0x78bf85
            : 0xe3c598
          : id === OUTLET
            ? 0x176cba
            : blocked
              ? 0x7a533c
              : kind === "basin"
                ? 0x30c6b4
                : kind === "drain"
                  ? 0x438ba0
                  : 0xb6c799;
      const tile = cube(2, 0.18, 2, color, x, 0.3, z);
      tile.userData.handsOnTile = id;
      meshes.push(tile);
      if (home) {
        const house = cube(1.4, 1.3, 1.3, 0xf4d7b0, x, 1, z);
        house.userData.handsOnTile = id;
        meshes.push(house);
        cube(1.65, 0.3, 1.6, flooded ? 0x426d91 : 0xb85d48, x, 1.8, z);
      }
      if (blocked) cube(1.1, 0.6, 1.1, 0x73503a, x, 0.7, z);
      if (kind === "basin") cube(1.6, 0.25, 1.6, 0x215a79, x, 0.55, z);
      const b = document.createElement("button");
      b.textContent = home
        ? "Home"
        : id === OUTLET
          ? "Outlet"
          : blocked
            ? "Blocked"
            : kind || "Ground";
      b.setAttribute(
        "aria-label",
        `Row ${Math.floor(id / WIDTH) + 1}, column ${(id % WIDTH) + 1}: ${b.textContent}`,
      );
      b.onclick = () => edit(id);
      grid.append(b);
    }
    if (result)
      for (let i = 0; i < 24; i++) {
        const drop = cube(
          0.035,
          0.45,
          0.035,
          0x7acbed,
          ((i % 8) - 3.5) * 1.8,
          2 + (i % 4),
          (Math.floor(i / 8) - 1) * 3,
        );
        drops.push(drop);
      }
    panel.querySelector("[data-status]").textContent = message;
    panel.querySelector("[data-undo]").disabled = !history.length;
    panel
      .querySelectorAll("[data-tool]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.tool === tool)),
      );
  }
  function edit(id) {
    const next = editSite(site, id, tool);
    if (next.site !== site) {
      history.push(site);
      site = next.site;
      result = null;
    }
    draw(next.message + ` Materials left: ${BUDGET - spent(site)}.`);
  }
  panel.querySelectorAll("[data-tool]").forEach(
    (b) =>
      (b.onclick = () => {
        tool = b.dataset.tool;
        draw(
          `Selected ${tool}. Tap a ground tile. Materials left: ${BUDGET - spent(site)}.`,
        );
      }),
  );
  panel.querySelector("[data-test]").onclick = () => {
    result = testRain(site);
    rainUntil = performance.now() + 2600;
    draw(
      result.success
        ? "All three homes stayed dry! You built a working drainage system. Improve your design or take a real-world Quest."
        : `${result.safe.length}/3 homes protected. ${result.capacity < 3 ? "Add a connected basin for extra capacity. " : ""}Connect drains beside each home all the way to the blue outlet, then test again.`,
    );
  };
  panel.querySelector("[data-undo]").onclick = () => {
    if (history.length) {
      site = history.pop();
      result = null;
      draw();
    }
  };
  panel.querySelector("[data-reset]").onclick = () => {
    history.push(site);
    site = newSite();
    result = null;
    draw();
  };
  function close() {
    active = false;
    root.visible = false;
    panel.hidden = true;
    document.body.classList.remove("hands-on-active");
    leave();
  }
  panel.querySelector("[data-exit]").onclick = close;
  const ray = new T.Raycaster(),
    pointer = new T.Vector2();
  let down = null;
  const held = new Set();
  let multiple = false;
  canvas.addEventListener(
    "pointerdown",
    (e) => {
      if (active) {
        held.add(e.pointerId);
        if (held.size > 1) multiple = true;
        down = { x: e.clientX, y: e.clientY, id: e.pointerId };
      }
    },
    true,
  );
  canvas.addEventListener(
    "pointercancel",
    () => {
      down = null;
      held.clear();
      multiple = false;
    },
    true,
  );
  canvas.addEventListener(
    "pointerup",
    (e) => {
      if (!active) return;
      held.delete(e.pointerId);
      if (multiple) {
        if (!held.size) multiple = false;
        down = null;
        return;
      }
      if (
        !down ||
        down.id !== e.pointerId ||
        Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10
      ) {
        down = null;
        return;
      }
      down = null;
      const rect = canvas.getBoundingClientRect();
      pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        (-(e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      root.updateMatrixWorld(true);
      getCamera().updateMatrixWorld();
      ray.setFromCamera(pointer, getCamera());
      const hit = ray.intersectObjects(meshes)[0];
      if (hit) edit(hit.object.userData.handsOnTile);
    },
    true,
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (active && e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
      }
    },
    true,
  );
  function positionCamera(camera) {
    const now = performance.now();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (let i = 0; i < drops.length; i++) {
      drops[i].visible = now < rainUntil && !reduced;
      drops[i].position.y = 1 + ((i * 0.47 + now / 400) % 4);
    }
    const span = Math.max(
      26,
      18 / (2 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect),
    );
    const centreX = 86 + (innerHeight <= 520 ? 7 : 0);
    camera.position.set(centreX, span * 0.86, 4 + span * 0.51);
    camera.lookAt(centreX, 0, 4);
  }
  return {
    get active() {
      return active;
    },
    open() {
      enter();
      active = true;
      root.visible = true;
      panel.hidden = false;
      document.body.classList.add("hands-on-active");
      draw();
      positionCamera(getCamera());
      panel.querySelector("[data-tool]").focus();
    },
    camera: positionCamera,
  };
}
