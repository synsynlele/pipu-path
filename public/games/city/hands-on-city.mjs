import {
  CITY_PROJECTS,
  CONSTRUCTION_OBJECTS,
  newConstruction,
  constructionAction,
  constructionHint,
} from "./city-construction.mjs";
import { createConstructionScene } from "./construction-scene.mjs";
import { peopleClear, safePersonStep } from "./personal-space.mjs";
import {
  MARKET_OBJECTS,
  newMarket,
  marketAction,
  marketHint,
  marketReport,
} from "./market-actions.mjs";
export function mountHandsOnCity({
  T,
  scene,
  canvas,
  getCamera,
  actor,
  marketAssets,
  getResidents = () => [],
  walkClear = () => true,
  planRoute,
  refreshNavigation,
  enter,
  leave,
  cue = () => {},
}) {
  let active = false,
    state = newMarket(),
    waypoints = [],
    pending = null,
    work = null,
    walking = false,
    elapsed = 0,
    snapshot = null;
  const objects = [...MARKET_OBJECTS, ...CONSTRUCTION_OBJECTS];
  let projects = newConstruction(),
    activeSite = "market",
    blockedFor = 0;
  const constructionScene = createConstructionScene(T);
  const root = new T.Group();
  root.visible = false;
  scene.add(root);
  const geometry = new Map(),
    materials = new Map(),
    targets = new Map(),
    objectGroups = new Map();
  const carry = new T.Group();
  carry.userData.character = true;
  actor.g.add(carry);
  const customers = [],
    celebrants = [];
  let cartMesh,
    navigationDirty = false;
  const panel = document.createElement("section");
  panel.className = "hands-on-panel market-worksite";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Repair the market");
  panel.innerHTML = `<div class="hands-on-heading"><strong>Reopen the neighbourhood market</strong><button data-exit aria-label="Return to game entrance">✕</button></div><label class="worksite-picker">Worksite <select data-site aria-label="Choose a hands-on worksite"><option value="market">Repair the market</option><option value="homes">Build homes</option><option value="tower">Build a skyline tower</option><option value="hospital">Build a hospital</option><option value="farm">Grow a community farm</option><option value="stadium">Build a stadium</option><option value="airport">Build an airport</option></select></label><p data-goal></p><div class="market-progress" data-progress></div><p data-status role="status" aria-live="polite"></p><div class="market-carry"><span data-carry></span><button data-next hidden></button><button data-drop hidden>Return item</button><button data-stop hidden>Stop walking</button></div><details><summary>Find an object · controls</summary><p>Tap an object or its name: your character walks there and does the work. Tap open ground to walk. Drag to turn the camera. Work stays in this page session.</p><div class="market-access" role="group" aria-label="Market objects"></div><button data-reset>Restart this market</button></details><a data-quest href="/real-quests" target="_top" hidden>Build something in real life →</a>`;
  const tags = document.createElement("div");
  tags.className = "market-tags";
  tags.hidden = true;
  document.body.append(panel, tags);
  function box(parent, w, h, d, color, x, y, z) {
    const key = [w, h, d].join(":");
    if (!geometry.has(key)) geometry.set(key, new T.BoxGeometry(w, h, d));
    if (!materials.has(color))
      materials.set(
        color,
        new T.MeshStandardMaterial({ color, roughness: 0.86 }),
      );
    const m = new T.Mesh(geometry.get(key), materials.get(color));
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }
  function object(id) {
    const spec = objects.find((o) => o.id === id),
      g = new T.Group();
    g.position.set(spec.x, 0, spec.z);
    g.userData.marketTarget = id;
    root.add(g);
    objectGroups.set(id, g);
    return g;
  }
  function person(parent, x, z, color) {
    const g = new T.Group();
    g.userData.character = true;
    g.position.set(x, 0.3, z);
    parent.add(g);
    box(g, 0.48, 0.68, 0.32, color, 0, 1, 0);
    box(g, 0.34, 0.38, 0.34, 0xb7815a, 0, 1.55, 0);
    const legs = [-1, 1].map((side) =>
      box(g, 0.15, 0.65, 0.18, 0x344b57, side * 0.13, 0.37, 0),
    );
    const arms = [-1, 1].map((side) =>
      box(g, 0.12, 0.57, 0.15, color, side * 0.32, 1, 0),
    );
    return { g, legs, arms };
  }
  function cartPosition() {
    const spec = objects.find(
      (o) => o.id === (state.cart === "entrance" ? "cart" : state.cart),
    );
    return { x: spec.x, z: spec.z };
  }
  function residents(except = null) {
    return [...getResidents(), ...customers, ...celebrants]
      .filter((p) => p !== except && p.g.visible)
      .map((p) => p.g.position);
  }
  function spawnPerson(x, z, color) {
    const occupied = [actor.g.position, ...residents()];
    for (const [dx, dz] of [
      [0, 0],
      [1.3, 0],
      [-1.3, 0],
      [0, 1.3],
      [0, -1.3],
      [2.6, 0],
      [-2.6, 0],
      [0, 2.6],
    ]) {
      const point = { x: x + dx, z: z + dz };
      if (
        walkClear(point, point) &&
        occupied.every((p) => Math.hypot(point.x - p.x, point.z - p.z) >= 0.95)
      )
        return person(root, point.x, point.z, color);
    }
    return null;
  }
  function drawWorld() {
    root.clear();
    carry.clear();
    objectGroups.clear();
    customers.length = 0;
    celebrants.length = 0;
    for (const id of ["stall-a", "stall-b"]) {
      const i = id === "stall-a" ? 0 : 1,
        g = object(id);
      box(g, 2.8, 0.12, 2.5, 0xb7a084, 0, 0.25, 0);
      for (const x of [-1.15, 1.15])
        for (const z of [-0.9, 0.9]) {
          const post = box(
            g,
            0.12,
            state.frames[i] ? 2.4 : 1.0,
            0.12,
            0x8c6846,
            x,
            state.frames[i] ? 1.5 : 0.8,
            z,
          );
          if (!state.frames[i]) post.rotation.z = x < 0 ? 0.23 : -0.23;
        }
      if (state.frames[i]) {
        box(g, 2.5, 0.14, 0.14, 0xa37950, 0, 2.65, -0.9);
        box(g, 2.5, 0.14, 0.14, 0xa37950, 0, 2.65, 0.9);
      }
      if (state.roofs[i]) {
        box(g, 3, 0.12, 2.8, i ? 0x417a72 : 0xb76943, 0, 2.85, 0);
        for (let n = 0; n < 7; n++)
          box(g, 0.04, 0.025, 2.8, 0xe2c08f, -1.35 + n * 0.45, 2.93, 0);
      }
      box(
        g,
        2.4,
        0.17,
        0.65,
        state.frames[i] ? 0xae8358 : 0x766552,
        0,
        1.0,
        0.8,
      );
      if (state.opened) {
        for (let n = 0; n < 5; n++)
          box(
            g,
            0.29,
            0.22,
            0.3,
            n % 2 ? 0xdaab4c : 0x799950,
            -0.9 + n * 0.42,
            1.2,
            0.8,
          );
        const merchant = spawnPerson(
          objects.find((o) => o.id === id).x,
          12.8,
          i ? 0xd6a64d : 0x618d8d,
        );
        if (merchant) celebrants.push(merchant);
      }
    }
    const timber = object("timber");
    for (let n = 0; n < 5; n++)
      box(timber, 1.65, 0.15, 0.2, 0xb88c54, 0, 0.45 + n * 0.15, 0);
    const sheets = object("roofing");
    for (let n = 0; n < 4; n++)
      box(sheets, 1.7, 0.08, 1.25, 0x698f9e, 0, 0.32 + n * 0.1, 0);
    const park = object("parking");
    box(park, 2.3, 0.025, 2.1, 0xd1c498, 0, 0.19, 0);
    for (const x of [-1.1, 1.1])
      box(park, 0.06, 0.03, 2.1, 0xffe08b, x, 0.23, 0);
    const loading = object("loading");
    box(loading, 2.1, 0.025, 1.6, 0xb9c4b0, 0, 0.2, 0);
    const shelf = object("shelf");
    box(shelf, 2.2, 0.15, 1.3, 0x8a6c50, 0, 0.7, 0);
    for (const x of [-1, 1]) {
      box(shelf, 0.1, 2.8, 0.1, 0x79684d, x, 1.6, -0.5);
      box(shelf, 0.1, 2.8, 0.1, 0x79684d, x, 1.6, 0.5);
    }
    box(shelf, 2.6, 0.15, 2.2, 0x4e776e, 0, 3.05, 0.5);
    const cart = object("cart");
    const at = cartPosition();
    cart.position.set(at.x, 0, at.z);
    cartMesh = cart;
    box(cart, 1.25, 0.65, 0.85, 0x967352, 0, 0.85, 0);
    for (const x of [-0.65, 0.65])
      box(cart, 0.13, 0.4, 0.4, 0x354341, x, 0.4, 0);
    const crate = object("produce");
    if (state.produce === "shelf") crate.position.set(23.5, 0.55, 9);
    box(crate, 0.75, 0.6, 0.65, 0xc18c4a, 0, 0.55, 0);
    for (let n = 0; n < 4; n++)
      box(crate, 0.23, 0.18, 0.2, 0x779344, -0.22 + n * 0.15, 0.92, 0);
    if (state.carrying === "produce") crate.visible = false;
    const bell = object("bell");
    box(bell, 0.12, 2.4, 0.12, 0x7c6951, 0, 1.4, 0);
    box(bell, 0.65, 0.45, 0.45, 0xe5bd5a, 0, 2.5, 0);
    if (state.carrying && state.carrying !== "cart") {
      const color =
        state.carrying === "timber"
          ? 0xb88c54
          : state.carrying === "roofing"
            ? 0x698f9e
            : 0xc18c4a;
      box(
        carry,
        state.carrying === "timber" ? 1.25 : 0.8,
        state.carrying === "roofing" ? 0.12 : 0.4,
        0.5,
        color,
        0,
        1,
        0.6,
      );
    }
    if (state.opened) {
      box(root, 7.9, 0.05, 0.7, 0xe4d6b9, 19.2, 0.28, 16.1);
      for (const x of [15.6, 22.8])
        box(root, 0.6, 0.3, 0.6, 0x739d75, x, 0.43, 15.6);
      for (let i = 0; i < 4; i++) {
        const customer = spawnPerson(
          17 + i * 0.8,
          20 + i * 0.25,
          [0x789a69, 0xc97f5e, 0x6e8ca9, 0xb7a16a][i],
        );
        if (customer) customers.push(customer);
      }
    }
    constructionScene.draw(root, projects, objectGroups, box);
    root.updateMatrixWorld(true);
    navigationDirty = true;
  }
  function positionFor(id) {
    const spec = objects.find((o) => o.id === id);
    let approach = { ...spec.approach },
      point = { x: spec.x, z: spec.z };
    if (id === "cart") {
      point = cartPosition();
      approach = { x: point.x - 1.2, z: point.z };
    }
    return { point, approach };
  }
  function completedObject(spec) {
    if (!spec.project) return false;
    const stage = projects[spec.project].stage;
    return (
      (spec.kind === "kit" &&
        (stage > 0 || state.carrying === "kit:" + spec.project)) ||
      (spec.kind === "base" &&
        (stage !== 0 || state.carrying !== "kit:" + spec.project)) ||
      (spec.kind === "structure" && stage !== 1) ||
      (spec.kind === "services" && stage !== 2)
    );
  }
  function updateUI(message) {
    const project = CITY_PROJECTS.find((p) => p.id === activeSite);
    panel.querySelector(".hands-on-heading strong").textContent = project
      ? project.name
      : "Reopen the neighbourhood market";
    panel.setAttribute(
      "aria-label",
      project ? project.name : "Repair the market",
    );
    panel.querySelector("[data-site]").value = activeSite;
    panel.querySelector("[data-goal]").textContent = project
      ? constructionHint(projects, activeSite, state.carrying)
      : marketHint(state);
    panel.querySelector("[data-progress]").textContent = project
      ? `${projects[activeSite].stage}/3 build phases · ${projects[activeSite].open ? "Open · finished landscape" : "Test before opening"}`
      : `${state.roofs.filter(Boolean).length}/2 stalls sheltered · Entrance ${state.cart === "parking" ? "clear" : "blocked"} · Stock ${state.produce === "shelf" ? "safe" : "exposed"}`;
    if (message !== undefined) {
      panel.querySelector("[data-status]").textContent = message;
    }
    panel.querySelector("[data-carry]").textContent =
      state.carrying === "cart"
        ? "Pushing the cart"
        : state.carrying
          ? `Carrying: ${state.carrying.startsWith("kit:") ? CITY_PROJECTS.find((p) => p.id === state.carrying.slice(4))?.kit : state.carrying === "roofing" ? "roof sheets" : state.carrying}`
          : "Hands free";
    panel.querySelector("[data-drop]").hidden =
      !state.carrying || state.carrying === "cart";
    panel.querySelector("[data-stop]").hidden = !waypoints.length;
    const nextWork = project
      ? project.id +
        ":" +
        (projects[project.id].stage === 0
          ? state.carrying === "kit:" + project.id
            ? "base"
            : "kit"
          : ["base", "structure", "services", "open"][
              projects[project.id].stage
            ])
      : null;
    const nextButton = panel.querySelector("[data-next]");
    nextButton.hidden = !project || projects[project.id].open;
    if (nextWork) {
      nextButton.textContent = objects.find((o) => o.id === nextWork).name;
      nextButton.dataset.action = nextWork;
    }
    nextButton.disabled = !!work || waypoints.length > 0;
    panel.querySelector("[data-quest]").hidden = project
      ? !projects[activeSite].open
      : !state.opened;
    for (const [id, { tag, accessible }] of targets) {
      const spec = objects.find((o) => o.id === id);
      const i = id === "stall-a" ? 0 : 1;
      let label = spec.name;
      if (id.startsWith("stall-"))
        label = state.roofs[i]
          ? "Sheltered stall"
          : state.frames[i]
            ? "Fit roof"
            : "Repair frame";
      if (id === "cart")
        label = state.carrying === "cart" ? "Pushing cart" : "Push cart";
      if (id === "produce" && state.produce === "shelf")
        label = "Produce stored";
      if (id === "bell")
        label = state.opened ? "Market open" : "Ring bell · test";
      if (spec.project)
        label =
          spec.kind === "open" && projects[spec.project].open
            ? "Site open"
            : spec.name;
      accessible.hidden =
        (spec.project ?? "market") !== activeSite || completedObject(spec);
      tag.textContent = label;
      accessible.textContent = spec.name;
      tag.disabled = state.carrying === "cart" && id === "cart";
    }
  }
  function stop() {
    waypoints = [];
    pending = null;
    work = null;
    walking = false;
    actor.legs.forEach((l) => (l.rotation.x = 0));
    actor.arms.forEach((a) => (a.rotation.x = 0));
    updateUI();
  }
  function apply(id) {
    const spec = objects.find((o) => o.id === id);
    if (spec?.project) {
      const next = constructionAction(projects, state.carrying, id);
      projects = next.progress;
      state = { ...state, carrying: next.carrying };
      if (next.changed) {
        drawWorld();
        cue(next.opened ? "built" : "tap");
      }
      updateUI(next.message);
      return;
    }
    const next = marketAction(state, id);
    state = next.state;
    if (next.changed) {
      drawWorld();
      cue(next.report?.success ? "built" : "tap");
    }
    updateUI(next.message);
  }
  function request(id) {
    if (!active) return;
    const selected = objects.find((o) => o.id === id);
    if (!selected) return;
    activeSite = selected.project ?? "market";
    if (navigationDirty) {
      refreshNavigation();
      navigationDirty = false;
    }
    if (id === "produce" && state.produce === "shelf") {
      updateUI("The produce is already stored safely.");
      return;
    }
    const { approach } = positionFor(id);
    const planned = planRoute(approach);
    if (!planned) {
      updateUI(
        "That approach is blocked. Tap nearby open ground, then try the object again.",
      );
      return;
    }
    if (
      Math.hypot(
        planned.destination.x - approach.x,
        planned.destination.z - approach.z,
      ) > 1.1
    ) {
      updateUI(
        "Move closer along the open path before working on that object.",
      );
      return;
    }
    stop();
    pending = id;
    waypoints = [...planned.points];
    if (!waypoints.length) arrive();
    else
      updateUI(
        `Walking to ${objects.find((o) => o.id === id).name.toLowerCase()}…`,
      );
  }
  function arrive() {
    if (!pending) return;
    const id = pending;
    pending = null;
    const { approach } = positionFor(id);
    if (
      Math.hypot(
        actor.g.position.x - approach.x,
        actor.g.position.z - approach.z,
      ) > 1.4
    ) {
      updateUI("Walk closer before working here.");
      return;
    }
    work = { id, remaining: 0.6 };
    updateUI(
      id.startsWith("stall-")
        ? "Working on the stall…"
        : id === "cart"
          ? "Taking hold of the cart…"
          : "Working…",
    );
  }
  for (const spec of objects) {
    const tag = document.createElement("button");
    tag.className = "market-object-tag";
    tag.setAttribute("aria-label", spec.name);
    tag.onclick = () => request(spec.id);
    tags.append(tag);
    const accessible = document.createElement("button");
    accessible.textContent = spec.name;
    accessible.onclick = () => request(spec.id);
    panel.querySelector(".market-access").append(accessible);
    targets.set(spec.id, { tag, accessible });
  }
  panel.querySelector("[data-next]").onclick = () =>
    request(panel.querySelector("[data-next]").dataset.action);
  panel.querySelector("[data-site]").onchange = (event) => {
    const nextSite = event.target.value;
    stop();
    activeSite = nextSite;
    const project = CITY_PROJECTS.find((p) => p.id === activeSite);
    const point = project
      ? { x: project.x - 4.8, z: project.z + 5.9 }
      : { x: 16.5, z: 18 };
    const plan = planRoute(point);
    if (plan) waypoints = [...plan.points];
    updateUI(
      plan
        ? "Walking to your chosen worksite. Tap a labelled object to begin."
        : "That route is blocked. Choose another approach.",
    );
  };
  panel.querySelector("[data-stop]").onclick = () => {
    stop();
    updateUI("Stopped. Tap another object or open ground.");
  };
  panel.querySelector("[data-drop]").onclick = () => {
    stop();
    apply("put-down");
  };
  panel.querySelector("[data-reset]").onclick = () => {
    stop();
    if (activeSite === "market") state = newMarket();
    else {
      projects = {
        ...projects,
        [activeSite]: { stage: 0, open: false, tests: 0 },
      };
      state = { ...state, carrying: null };
    }
    drawWorld();
    updateUI(
      activeSite === "market"
        ? "Market reset. Collect timber to begin."
        : "Worksite reset. Collect its construction kit to begin.",
    );
  };
  function close() {
    stop();
    active = false;
    root.visible = false;
    carry.visible = false;
    panel.hidden = true;
    tags.hidden = true;
    for (const [mesh, visible] of snapshot.assets) mesh.visible = visible;
    actor.g.position.copy(snapshot.position);
    actor.g.rotation.y = snapshot.rotation;
    actor.legs.forEach((l) => (l.rotation.x = 0));
    actor.arms.forEach((a) => (a.rotation.x = 0));
    document.body.classList.remove("hands-on-active");
    refreshNavigation();
    leave();
  }
  panel.querySelector("[data-exit]").onclick = close;
  const ray = new T.Raycaster(),
    pointer = new T.Vector2();
  let down = null,
    multiple = false;
  const pointers = new Set();
  canvas.addEventListener(
    "pointerdown",
    (e) => {
      if (!active) return;
      pointers.add(e.pointerId);
      if (pointers.size > 1) multiple = true;
      down = { id: e.pointerId, x: e.clientX, y: e.clientY, lastX: e.clientX };
    },
    true,
  );
  canvas.addEventListener(
    "pointermove",
    (e) => {
      if (!active || !down || pointers.size !== 1) return;
      if (Math.abs(e.clientX - down.x) > 7)
        cameraYaw += (e.clientX - down.lastX) * 0.006;
      down.lastX = e.clientX;
    },
    true,
  );
  canvas.addEventListener(
    "pointercancel",
    () => {
      down = null;
      pointers.clear();
      multiple = false;
    },
    true,
  );
  canvas.addEventListener(
    "pointerup",
    (e) => {
      if (!active) return;
      pointers.delete(e.pointerId);
      if (multiple) {
        if (!pointers.size) multiple = false;
        down = null;
        return;
      }
      if (
        !down ||
        e.pointerId !== down.id ||
        Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8
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
      scene.updateMatrixWorld(true);
      const camera = getCamera();
      camera.updateMatrixWorld();
      ray.setFromCamera(pointer, camera);
      const hits = ray.intersectObjects(root.children, true);
      let id = null;
      for (const hit of hits) {
        for (let o = hit.object; o && o !== root; o = o.parent)
          if (o.userData.marketTarget) {
            id = o.userData.marketTarget;
            break;
          }
        if (id) break;
      }
      if (id) {
        request(id);
        return;
      }
      const point = ray.ray.intersectPlane(
        new T.Plane(new T.Vector3(0, 1, 0), -0.3),
        new T.Vector3(),
      );
      if (point) {
        const planned = planRoute(point);
        stop();
        if (planned) {
          waypoints = [...planned.points];
          updateUI("Walking. Tap a worksite object when you are ready.");
        } else updateUI("Choose clear ground along the street.");
      }
    },
    true,
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (!active) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
      }
    },
    true,
  );
  const pause = () => {
    if (active) {
      stop();
      down = null;
      pointers.clear();
      multiple = false;
      updateUI("Paused. Tap an object to continue.");
    }
  };
  window.addEventListener("blur", pause);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
  });
  let cameraYaw = 0.35;
  const focus = new T.Vector3();
  function tick(dt, camera) {
    if (navigationDirty) {
      refreshNavigation();
      navigationDirty = false;
    }
    if (document.hidden) return;
    elapsed += dt;
    walking = false;
    if (waypoints.length) {
      const p = waypoints[0],
        dx = p.x - actor.g.position.x,
        dz = p.z - actor.g.position.z,
        length = Math.hypot(dx, dz),
        step = Math.min(length, dt * (state.carrying === "cart" ? 3.4 : 5));
      if (length > 0.015) {
        const candidate = {
          x: actor.g.position.x + (dx / length) * step,
          z: actor.g.position.z + (dz / length) * step,
        };
        if (
          peopleClear(actor.g.position, candidate, residents()) &&
          walkClear(actor.g.position, candidate)
        ) {
          actor.g.position.x = candidate.x;
          actor.g.position.z = candidate.z;
          actor.g.rotation.y = Math.atan2(dx, dz);
          walking = true;
          blockedFor = 0;
        } else {
          blockedFor += dt;
          if (blockedFor > 0.5) {
            const goal = waypoints.at(-1),
              detour = planRoute(
                goal,
                [...customers, ...celebrants].map((p) => p.g.position),
              );
            if (detour?.points.length) waypoints = [...detour.points];
            blockedFor = 0;
          }
        }
      } else {
        waypoints.shift();
        if (!waypoints.length) arrive();
      }
    }
    if (work) {
      work.remaining -= dt;
      if (work.remaining <= 0) {
        const id = work.id;
        work = null;
        apply(id);
      }
    }
    actor.legs.forEach(
      (l, i) =>
        (l.rotation.x = walking
          ? Math.sin(elapsed * 12 + i * Math.PI) * 0.45
          : 0),
    );
    actor.arms.forEach(
      (a, i) =>
        (a.rotation.x = work
          ? Math.sin(elapsed * 19 + i) * 0.65
          : state.carrying
            ? -1.0
            : walking
              ? Math.sin(elapsed * 12 + (i + 1) * Math.PI) * 0.3
              : 0),
    );
    if (state.carrying === "cart") {
      cartMesh.position.set(
        actor.g.position.x + Math.sin(actor.g.rotation.y) * 1.2,
        0,
        actor.g.position.z + Math.cos(actor.g.rotation.y) * 1.2,
      );
      cartMesh.rotation.y = actor.g.rotation.y;
    }
    for (let i = 0; i < customers.length; i++) {
      const c = customers[i],
        phase = (elapsed * 0.45 + i * 1.5) % (Math.PI * 2);
      const desired = {
        x: 19.2 + Math.sin(phase) * 1.4,
        z: 18.5 + Math.cos(phase) * 1.7,
      };
      const next = safePersonStep(
        c.g.position,
        desired,
        [actor.g.position, ...residents(c)],
        walkClear,
        dt * 1.2,
      );
      const moved =
        Math.hypot(next.x - c.g.position.x, next.z - c.g.position.z) > 0.001;
      c.g.position.x = next.x;
      c.g.position.z = next.z;
      c.legs.forEach(
        (l, j) =>
          (l.rotation.x = moved
            ? Math.sin(elapsed * 8 + j * Math.PI) * 0.3
            : 0),
      );
    }
    for (const c of celebrants)
      c.arms.forEach(
        (a, i) => (a.rotation.z = (i ? 1 : -1) * (state.opened ? 0.7 : 0.1)),
      );
    const selectedProject = CITY_PROJECTS.find((p) => p.id === activeSite);
    const centre = selectedProject ?? { x: 19.5, z: 15 };
    const nearSite =
      Math.hypot(actor.g.position.x - centre.x, actor.g.position.z - centre.z) <
      12;
    focus.lerp(
      new T.Vector3(
        nearSite
          ? actor.g.position.x * 0.4 + centre.x * 0.6
          : actor.g.position.x,
        0,
        nearSite
          ? actor.g.position.z * 0.4 + centre.z * 0.6
          : actor.g.position.z,
      ),
      Math.min(1, dt * 4),
    );
    const span = Math.max(
      selectedProject?.id === "tower" ? 36 : 26,
      17 / (2 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect),
    );
    camera.position.set(
      focus.x + Math.sin(cameraYaw) * span * 0.55,
      span * 0.75,
      focus.z + Math.cos(cameraYaw) * span * 0.55,
    );
    camera.lookAt(
      focus.x,
      selectedProject?.id === "tower" ? 3 : 0.5,
      focus.z - 1.2,
    );
    camera.updateMatrixWorld();
    for (const spec of objects) {
      const { tag } = targets.get(spec.id),
        g = objectGroups.get(spec.id),
        v = new T.Vector3(
          g.position.x,
          spec.id.startsWith("stall-") || spec.id === "shelf" ? 3.2 : 1.5,
          g.position.z,
        ).project(camera);
      const near =
        Math.hypot(
          actor.g.position.x - g.position.x,
          actor.g.position.z - g.position.z,
        ) < 13;
      tag.hidden =
        (spec.project ?? "market") !== activeSite ||
        completedObject(spec) ||
        !near ||
        v.z > 1 ||
        v.x < -0.93 ||
        v.x > 0.93 ||
        v.y < -0.45 ||
        v.y > 0.9 ||
        (spec.id === "produce" && state.carrying === "produce");
      tag.style.left = `${(v.x * 0.5 + 0.5) * innerWidth}px`;
      tag.style.top = `${(-v.y * 0.5 + 0.5) * innerHeight}px`;
    }
    panel.querySelector("[data-stop]").hidden = !waypoints.length;
    panel.querySelector("[data-next]").disabled =
      !!work || waypoints.length > 0;
  }
  return {
    get active() {
      return active;
    },
    get state() {
      return state;
    },
    get projects() {
      return projects;
    },
    get residents() {
      return [...getResidents(), ...customers, ...celebrants];
    },
    get moving() {
      return !!(waypoints.length || work);
    },
    open() {
      if (active) return;
      snapshot = {
        position: actor.g.position.clone(),
        rotation: actor.g.rotation.y,
        assets: marketAssets.map((mesh) => [mesh, mesh.visible]),
      };
      enter();
      active = true;
      root.visible = true;
      carry.visible = true;
      for (const [mesh] of snapshot.assets) mesh.visible = false;
      panel.hidden = false;
      tags.hidden = false;
      document.body.classList.add("hands-on-active");
      drawWorld();
      refreshNavigation();
      navigationDirty = false;
      focus.copy(actor.g.position);
      updateUI(
        "Tunde: “Rain ruined our stalls. Help us reopen this street.” Tap timber to start.",
      );
      const plan = planRoute({ x: 16.5, z: 18 });
      if (plan) waypoints = [...plan.points];
      tick(0, getCamera());
      panel.querySelector("[data-exit]").focus();
    },
    tick,
    close,
    request,
    report: () => marketReport(state),
  };
}
