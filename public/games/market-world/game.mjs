import * as T from "../shared/vendor/three.module.js";
import { createNavigator } from "../shared/navigation.mjs";
import { safePersonStep } from "../city/personal-space.mjs";
import { walkingVector, orbitDelta } from "../city/free-city-controls.mjs";
import { clearBoomDistance } from "../city/camera-rig.mjs";
import { createScreenAwake } from "../city/screen-awake.mjs";
import * as M from "./model.mjs";
import { createNeighbourhood } from "./scene.mjs";
const $ = (id) => document.getElementById(id),
  canvas = $("world"),
  STORAGE = "pipupath.living-market.v1";
let state = M.freshWorld(),
  loaded = false,
  storageAvailable = true;
try {
  const raw = localStorage.getItem(STORAGE);
  const restored = M.restoreWorld(raw);
  if (restored) {
    state = restored;
    loaded = true;
  } else if (raw)
    $("save-status").textContent = "Old checkpoint could not be read";
} catch {
  storageAvailable = false;
}
const scene = new T.Scene();
scene.background = new T.Color(0xdce5de);
scene.fog = new T.Fog(0xdce5de, 65, 135);
const camera = new T.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 700);
let renderer;
try {
  renderer = new T.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
} catch {
  $("graphics-error").hidden = false;
}
if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const hemi = new T.HemisphereLight(0xeef3e8, 0x898366, 2.35);
  scene.add(hemi);
  const sun = new T.DirectionalLight(0xffe4ba, 3.4);
  sun.position.set(-22, 45, 24);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  Object.assign(sun.shadow.camera, {
    left: -36,
    right: 36,
    top: 32,
    bottom: -32,
    near: 1,
    far: 110,
  });
  sun.shadow.normalBias = 0.035;
  sun.shadow.bias = -0.00015;
  scene.add(sun);
  const world = createNeighbourhood(scene);
  world.player.g.position.set(state.player.x, 0.05, state.player.z);
  const awake = createScreenAwake();
  let navigator,
    navSignature = "",
    waypoints = [],
    pending = null,
    workTime = 0,
    selectedTool = null,
    proposal = null,
    started = false,
    overview = false,
    pan = { x: 0, z: 0 },
    cameraFocus = new T.Vector3(state.player.x, 1.2, state.player.z),
    reveal = null,
    elapsed = 0,
    last = 0,
    saveElapsed = 0,
    lastHUD = "",
    lastBuild = "",
    pausedForMenu = false;
  const keys = new Set(),
    held = new Map(),
    pointers = new Map();
  let down = null,
    multi = false,
    pinch = null,
    mid = null;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const ray = new T.Raycaster(),
    pointer = new T.Vector2(),
    ground = new T.Plane(new T.Vector3(0, 1, 0), 0);
  function notice(text) {
    $("message").textContent = text;
  }
  function persist() {
    state.player = {
      x: world.player.g.position.x,
      z: world.player.g.position.z,
    };
    try {
      localStorage.setItem(STORAGE, M.saveWorld(state));
      $("save-status").textContent = "Saved on this device";
      storageAvailable = true;
    } catch {
      storageAvailable = false;
      $("save-status").textContent = "Saving unavailable · keep this page open";
    }
  }
  function rebuildNavigation() {
    const signature = JSON.stringify([state.weather, state.buildings]);
    if (navSignature === signature) return;
    navSignature = signature;
    const blocks = world.sites
      .filter((s) => !["market", "farm"].includes(s.id))
      .map((s) => ({
        minX: s.x - s.w / 2,
        maxX: s.x + s.w / 2,
        minZ: s.z - s.d / 2,
        maxZ: s.z + s.d / 2,
      }));
    for (let i = 0; i < 4; i++) {
      const x = M.MARKET.x + (i % 2 ? 1 : -1) * 2.8,
        z = M.MARKET.z + (i < 2 ? -2.4 : 2.4);
      blocks.push({
        minX: x - 1.8,
        maxX: x + 1.8,
        minZ: z - 1.3,
        maxZ: z + 1.3,
      });
    }
    for (let i = 0; i < 4; i++) {
      const x = M.FARM.x - 3 + i * 2;
      blocks.push({
        minX: x - 0.6,
        maxX: x + 0.6,
        minZ: M.FARM.z - 4,
        maxZ: M.FARM.z + 2.5,
      });
    }
    const crossings = [
      18,
      ...(state.weather === "dry" ? [-12] : []),
      ...state.buildings.filter((b) => b.kind === "bridge").map((b) => b.x),
    ].sort((a, b) => a - b);
    let edge = -30;
    for (const x of crossings) {
      blocks.push({ minX: edge, maxX: x - 1.35, minZ: -4.7, maxZ: 0.7 });
      edge = x + 1.35;
    }
    blocks.push({ minX: edge, maxX: 30, minZ: -4.7, maxZ: 0.7 });
    for (const t of world.trees)
      blocks.push({
        minX: t.x - t.r,
        maxX: t.x + t.r,
        minZ: t.z - t.r,
        maxZ: t.z + t.r,
      });
    for (const b of state.buildings)
      if (["coldroom", "shade", "solar", "battery"].includes(b.kind))
        blocks.push({
          minX: b.x - 1.6,
          maxX: b.x + 1.6,
          minZ: b.z - 1.5,
          maxZ: b.z + 1.5,
        });
    navigator = createNavigator(blocks, {
      minX: -29,
      maxX: 29,
      minZ: -25,
      maxZ: 25,
      step: 0.5,
      radius: 0.28,
    });
    if (waypoints.length) {
      const plan = navigator.route(world.player.g.position, waypoints.at(-1));
      waypoints = plan?.points ?? [];
      if (!waypoints.length) pending = null;
    }
  }
  function cancelWalk() {
    keys.clear();
    held.clear();
    waypoints = [];
    pending = null;
    workTime = 0;
  }
  function travelTo(point, intent = null) {
    rebuildNavigation();
    const plan = navigator.route(world.player.g.position, point);
    if (!plan) {
      notice("That approach is blocked. Try the clear side of the street.");
      return false;
    }
    cancelWalk();
    waypoints = [...plan.points];
    pending = intent;
    overview = false;
    pan = { x: 0, z: 0 };
    reveal = null;
    if (!waypoints.length && intent) workTime = 1.4;
    return true;
  }
  function beginManual() {
    if (!keys.size && !held.size) cancelWalk();
    overview = false;
    pan = { x: 0, z: 0 };
    reveal = null;
  }
  function placement(id, p) {
    const report = M.buildCheck(state, id, p);
    if (!report.ok) return report;
    if (
      M.item(id).placement === "land" &&
      world.trees.some((t) => Math.hypot(t.x - p.x, t.z - p.z) < 2)
    )
      return {
        ok: false,
        message: "Keep this mature tree and its walking space clear.",
      };
    return report;
  }
  const suggestions = {
    crates: { x: -12, z: -11 },
    shade: { x: -11, z: -9.5 },
    bridge: { x: -6, z: -2 },
    cargo: { x: -12, z: -11 },
    solar: { x: 4, z: 19 },
    battery: { x: 4, z: 23 },
    coldroom: { x: 9, z: 19 },
    team: { x: 9, z: 16 },
  };
  function selectTool(id) {
    selectedTool = id;
    proposal = { ...suggestions[id] };
    $("catalogue").hidden = true;
    $("context").hidden = false;
    document.body.classList.add("placing");
    const spec = M.item(id);
    $("context-kicker").textContent = "PLACE A USEFUL TOOL";
    $("context-title").textContent = spec.name;
    $("context-copy").textContent =
      spec.detail + " Choose a place in the world, or use the suggested site.";
    $("context-action").hidden = false;
    $("context-action").textContent = "Use suggested site";
    $("context-action").onclick = () => queueBuild(proposal);
    world.showGhost(id, proposal, placement(id, proposal).ok);
    notice(
      "Tap a place to build. Green marks a possible site. Build again cancels placement.",
    );
  }
  function finishPlacement() {
    selectedTool = null;
    proposal = null;
    document.body.classList.remove("placing");
    world.showGhost(null, {}, false);
    $("context").hidden = true;
  }
  function queueBuild(point) {
    if (!selectedTool) return;
    const report = placement(selectedTool, point);
    if (!report.ok) {
      notice(report.message);
      return;
    }
    const id = selectedTool,
      p = { ...point },
      spec = M.item(id);
    const approach =
      spec.placement === "river"
        ? { x: p.x, z: 2.2 }
        : spec.placement === "farm"
          ? { x: M.FARM.x - 3, z: M.FARM.z + 5.5 }
          : spec.placement === "market"
            ? { x: M.MARKET.x - 4, z: M.MARKET.z + 5.5 }
            : (navigator.nearestFree({ x: p.x - 2.4, z: p.z + 2.4 }) ?? p);
    if (travelTo(approach, { kind: "build", id, point: p })) {
      finishPlacement();
      notice(`Walking to establish ${spec.name.toLowerCase()}…`);
    }
  }
  function runIntent(intent) {
    if (!intent) return;
    if (intent.kind === "build") {
      const result = M.build(state, intent.id, intent.point);
      state = result.state;
      notice(result.message);
      if (result.ok) {
        reveal = { x: intent.point.x, z: intent.point.z, time: 0 };
        tone("build");
        navSignature = "";
        rebuildNavigation();
        world.sync(state);
        persist();
      }
    }
    if (intent.kind === "dispatch") {
      state.dispatch = true;
      notice(
        "The next available harvest is assigned to this delivery. Watch the cart and its stock.",
      );
      tone("tap");
      persist();
    }
    if (intent.kind === "reclaim") {
      state = M.reclaim(state, intent.id);
      navSignature = "";
      world.sync(state);
      rebuildNavigation();
      notice(
        "Resources recovered. The reclaimed equipment no longer contributes to the system.",
      );
      persist();
    }
    if (intent.kind === "talk")
      notice(
        "Ama: “Watch one load from the farm to these stalls. A good building is only useful when the whole service works.”",
      );
  }
  function inspect(id) {
    if (selectedTool) return;
    const inv = M.inventory(state),
      route = M.deliveryRoute(state),
      p = M.power(state);
    const details = {
      farm: [
        "GROWER’S COLLECTION",
        "Follow the harvest",
        `${inv.farm} usable crates are waiting. A second harvest arrives during the trial. Loading without protective crates damages some produce. The current route takes about ${Math.ceil(route.seconds)} simulation seconds each way.`,
      ],
      depot: [
        "COLLECTION POINT",
        "A load has somewhere to go",
        `${inv.farm} crates are ready. ${M.has(state, "team") ? "Your resident team loads and dispatches automatically." : "Dispatch a load yourself, or train a resident delivery team."}`,
      ],
      market: [
        "AMA · MARKET ORGANISER",
        "A market is a connection",
        `${state.served}/12 households have received usable produce. ${inv.market} usable crates are at the stalls. A trained team can keep collection moving while you explore.`,
      ],
      crossing: [
        "ACCESS & WEATHER",
        state.weather === "rain"
          ? "The low crossing is flooded"
          : "A route that depends on the weather",
        `The current delivery uses ${route.name.toLowerCase()}. A raised crossing can shorten the route. A faster vehicle can use the longer public bridge. Watch the travel time and condition of the load.`,
      ],
      delivery: [
        "A WORKING SUPPLY CHAIN",
        "Follow this load",
        `${inv.cart} usable crates are on the cart. ${state.damage} crates have been lost in handling and ${state.spoiled} through deterioration. ${state.cart.routeName ?? route.name}.`,
      ],
      school: [
        "COMMUNITY SCHOOL",
        "A place for tomorrow",
        "This school belongs to the wider neighbourhood. Learning and skills will become later adventures. In this episode, focus on food reaching people.",
      ],
      clinic: [
        "HEALTH CENTRE",
        "Services depend on a connected world",
        "Roads, people, supplies and dependable power support community services. Clinical work is outside this episode.",
      ],
      workshop: [
        "REPAIR & REUSE",
        "Local skills already exist",
        "Residents have knowledge, tools and useful ways of working. Your role is to help connect those strengths.",
      ],
    };
    let content = details[id];
    const b = state.buildings.find((b) => b.id === id);
    if (b) {
      const spec = M.item(b.kind);
      content = [
        "YOUR DESIGN",
        spec.name,
        b.kind === "coldroom"
          ? `${p.supplied ? "Supplied" : "Not supplied"} · demand 2 units. Solar ${p.generation.toFixed(1)} · stored power ${state.battery.toFixed(1)}/16. Cooling helps only produce inside its 6 m service area.`
          : spec.detail,
      ];
    }
    if (!content)
      content = [
        "NEIGHBOURHOOD LIFE",
        "People live and work here",
        "Explore the streets and meet the market team. Keep homes and entrances clear when you build.",
      ];
    $("context").hidden = false;
    $("context-kicker").textContent = content[0];
    $("context-title").textContent = content[1];
    $("context-copy").textContent = content[2];
    $("context-action").hidden =
      !["farm", "depot", "market"].includes(id) && !b;
    if (id === "farm" || id === "depot") {
      $("context-action").textContent = M.has(state, "team")
        ? "Visit the collection point"
        : "Walk over and dispatch";
      $("context-action").onclick = () => {
        if (
          travelTo({ x: M.FARM.x - 3, z: M.FARM.z + 5.5 }, { kind: "dispatch" })
        )
          notice("Walking to the collection point…");
      };
    }
    if (id === "market") {
      $("context-action").textContent = "Meet Ama";
      $("context-action").onclick = () =>
        travelTo({ x: M.MARKET.x - 4, z: M.MARKET.z + 5.5 }, { kind: "talk" });
    }
    if (b) {
      $("context-action").textContent = `Reclaim · ${b.cost} tokens`;
      $("context-action").onclick = () => {
        if (
          travelTo(
            { x: b.x - 2.5, z: b.kind === "bridge" ? 2.3 : b.z + 2.5 },
            { kind: "reclaim", id: b.id },
          )
        )
          $("context").hidden = true;
      };
    }
  }
  function showResult() {
    if (!state.result) return;
    const report = state.result;
    $("result-kicker").textContent = report.success
      ? "A USEFUL SYSTEM, PROVEN IN PRACTICE"
      : "YOUR EXPERIMENT HAS SOMETHING TO TELL YOU";
    $("result-title").textContent = report.success
      ? state.phase === 1
        ? "The market is coming back."
        : "People can keep this working."
      : "Look at what happened.";
    $("result-copy").textContent = report.success
      ? state.phase === 1
        ? "Twelve households received usable produce. Now the rain will close the low crossing and reduce solar output. Improve your design, then test it again."
        : "Your resident team kept food moving through the rain. The neighbourhood can continue operating while you explore. What will you make possible next?"
      : report.issues.join(" ");
    $("result-metrics").replaceChildren();
    for (const [value, label] of [
      [report.served, "HOUSEHOLDS"],
      [report.loss, "CRATES LOST"],
      [report.independent ? "Yes" : "Not yet", "RESIDENT TEAM"],
    ]) {
      const d = document.createElement("div");
      const b = document.createElement("b");
      b.textContent = value;
      const small = document.createElement("small");
      small.textContent = label;
      d.append(b, small);
      $("result-metrics").append(d);
    }
    const complete = report.success && state.phase === 2;
    $("reflection-label").hidden = !complete;
    $("reflection").value = state.reflection;
    $("real-quest").hidden = !complete;
    $("result-next").textContent = report.success
      ? state.phase === 1
        ? "Prepare for the rain →"
        : "Let the neighbourhood operate →"
      : "Improve my design →";
    $("result").showModal();
    tone(report.success ? "success" : "tap");
  }
  function updateHUD() {
    const signature = JSON.stringify([
      state.phase,
      state.served,
      state.lost,
      state.cash,
      state.materials,
      state.running,
      Math.floor(state.dayTime),
      state.cart.leg,
      state.result,
      selectedTool,
    ]);
    if (signature === lastHUD) return;
    lastHUD = signature;
    $("served").innerHTML = `${state.served}<span>/12</span>`;
    $("losses").textContent = state.lost;
    $("cash").textContent = state.cash;
    $("materials").textContent = state.materials;
    $("phase-name").textContent = state.observing
      ? "A NEIGHBOURHOOD IN OPERATION"
      : state.phase === 1
        ? "BRING THE MARKET BACK"
        : "WHEN THE RAIN COMES";
    $("weather").textContent = state.dayTime
      ? `${state.weather === "rain" ? "Rain · low crossing closed" : "Dry-day pilot"} · ${Math.min(100, Math.floor(state.dayTime))}/100 simulation seconds`
      : state.weather === "rain"
        ? "Rain is forecast. Plan a dependable route."
        : "Dry-day pilot · plan your first experiment";
    $("goal").textContent = selectedTool
      ? `Place ${M.item(selectedTool).name.toLowerCase()}.`
      : state.observing
        ? "Your team is keeping the market moving."
        : state.phase === 2
          ? "Keep food moving when the rain comes."
          : "Food is growing. Help it reach people.";
    $("run").innerHTML = state.running
      ? "Pause the day <span>Ⅱ</span>"
      : state.result
        ? "Run another trial <span>▶</span>"
        : state.dayTime
          ? "Resume the day <span>▶</span>"
          : "Run market day <span>▶</span>";
    $("speed").textContent = state.speed + "×";
    if (lastBuild !== JSON.stringify(state.buildings)) {
      lastBuild = JSON.stringify(state.buildings);
      renderTools();
    }
  }
  function renderTools() {
    $("tools").replaceChildren();
    for (const spec of M.ITEMS) {
      const button = document.createElement("button");
      button.className = "tool" + (M.has(state, spec.id) ? " owned" : "");
      button.dataset.tool = spec.id;
      const title = document.createElement("b"),
        cost = document.createElement("span"),
        detail = document.createElement("small");
      title.textContent = spec.name;
      cost.textContent = `${spec.cost} reserve · ${spec.materials} materials`;
      detail.textContent = spec.detail;
      button.append(title, cost, detail);
      button.disabled =
        (M.has(state, spec.id) && !["shade", "solar"].includes(spec.id)) ||
        state.buildings.filter((b) => b.kind === spec.id).length >= 3 ||
        state.cash < spec.cost ||
        state.materials < spec.materials;
      button.onclick = () => selectTool(spec.id);
      $("tools").append(button);
    }
  }
  $("build").onclick = () => {
    if (selectedTool) {
      finishPlacement();
      notice("Placement cancelled. Your resources are unchanged.");
      return;
    }
    state.running = false;
    cancelWalk();
    $("context").hidden = true;
    $("catalogue").hidden = !$("catalogue").hidden;
    renderTools();
    updateHUD();
  };
  $("close-build").onclick = () => ($("catalogue").hidden = true);
  $("close-context").onclick = () => {
    finishPlacement();
    $("context").hidden = true;
  };
  $("run").onclick = () => {
    finishPlacement();
    $("catalogue").hidden = true;
    if ((state.result && !state.observing) || state.dayTime >= 100)
      state = M.beginDay(state);
    else if (!state.dayTime) state = M.beginDay(state);
    else state.running = !state.running;
    updateHUD();
    persist();
  };
  $("speed").onclick = () => {
    state.speed = state.speed === 1 ? 2 : 1;
    updateHUD();
  };
  $("view").onclick = () => {
    overview = !overview;
    pan = { x: 0, z: 0 };
    reveal = null;
    $("view").textContent = overview ? "↙" : "⌖";
    $("view").setAttribute(
      "aria-label",
      overview ? "Return to character" : "View whole neighbourhood",
    );
  };
  $("centre").onclick = () => {
    overview = false;
    pan = { x: 0, z: 0 };
    reveal = null;
  };
  function zoom(factor) {
    reveal = null;
    state.camera.distance = Math.max(
      14,
      Math.min(70, state.camera.distance * factor),
    );
  }
  $("zoom-in").onclick = () => zoom(0.85);
  $("zoom-out").onclick = () => zoom(1 / 0.85);
  $("menu").onclick = () => {
    pausedForMenu = state.running;
    state.running = false;
    cancelWalk();
    persist();
    $("checkpoint-info").textContent = storageAvailable
      ? "Your neighbourhood is checkpointed on this device. Opening this menu pauses the day."
      : "Device saving is unavailable. Keep this page open to retain your neighbourhood.";
    $("settings").showModal();
  };
  $("help").onclick = () => {
    $("settings").close();
    $("help-dialog").showModal();
  };
  for (const b of document.querySelectorAll("[data-close]"))
    b.onclick = () => $(b.dataset.close).close();
  $("settings").addEventListener("close", () => {
    if (pausedForMenu) notice("The day is paused. Resume when you are ready.");
    pausedForMenu = false;
  });
  $("retry").onclick = () => {
    state = M.beginDay(state);
    state.running = false;
    $("settings").close();
    notice(
      "A fresh delivery trial is ready. Your builds and reserve are retained; unearned trial income is reset.",
    );
    persist();
  };
  let restartArmed = false;
  $("restart").onclick = () => {
    if (!restartArmed) {
      restartArmed = true;
      $("restart").textContent = "Confirm · reset this neighbourhood";
      return;
    }
    state = M.freshWorld();
    cancelWalk();
    world.player.g.position.set(2, 0.05, 15);
    navSignature = "";
    world.sync(state);
    rebuildNavigation();
    $("settings").close();
    restartArmed = false;
    $("restart").textContent = "Start a new neighbourhood";
    notice("A new neighbourhood is ready. Explore, observe and try a design.");
    persist();
  };
  $("result-next").onclick = () => {
    if (state.result?.success && state.phase === 1) {
      state = M.nextPhase(state);
      navSignature = "";
      rebuildNavigation();
      notice(
        "Rain will close the low crossing. Inspect the route and storage before running the next day.",
      );
    } else if (state.result?.success && state.phase === 2) {
      state.reflection = $("reflection").value.slice(0, 600);
      state = M.beginDay(state);
      state.observing = true;
      notice(
        "The resident team is operating independently. Explore or improve the system as conditions change.",
      );
    } else {
      state.running = false;
      notice(
        "Use the observed losses, route time and stock to improve your next trial.",
      );
    }
    $("result").close();
    persist();
  };
  $("result-explore").onclick = () => {
    $("result").close();
    overview = true;
    pan = { x: 0, z: 0 };
    notice(
      "Take a look around. Your tested design is part of this neighbourhood.",
    );
  };
  $("reflection").onchange = () => {
    state.reflection = $("reflection").value.slice(0, 600);
    persist();
  };
  for (const a of [
    $("real-quest"),
    ...document.querySelectorAll('a[href="/real-quests"]'),
  ])
    a.href = "/real-quests?district=market";
  $("begin").textContent = loaded
    ? "Continue my neighbourhood →"
    : "Step into the neighbourhood →";
  $("begin").onclick = () => {
    started = true;
    $("welcome").close();
    void awake.setPlaying(true);
    notice(
      loaded
        ? "Your checkpoint is restored and paused. Explore or resume the day."
        : "Ama is by the market. Inspect the farm or run a first delivery to discover what needs work.",
    );
  };
  for (const button of document.querySelectorAll("[data-move]")) {
    button.onpointerdown = (e) => {
      if (!started || document.querySelector("dialog[open]")) return;
      e.preventDefault();
      beginManual();
      held.set(e.pointerId, button.dataset.move);
      button.setPointerCapture?.(e.pointerId);
    };
    button.onpointerup =
      button.onpointercancel =
      button.onlostpointercapture =
        (e) => held.delete(e.pointerId);
  }
  function pointFrom(e) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      (-(e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    camera.updateMatrixWorld();
    ray.setFromCamera(pointer, camera);
    return ray.ray.intersectPlane(ground, new T.Vector3());
  }
  canvas.addEventListener("pointerdown", (e) => {
    if (!started || document.querySelector("dialog[open]")) return;
    reveal = null;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    canvas.setPointerCapture(e.pointerId);
    if (pointers.size > 1) {
      multi = true;
      const [a, b] = [...pointers.values()];
      pinch = Math.hypot(a.x - b.x, a.y - b.y);
      mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }
    down = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      drag: false,
    };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (selectedTool && !pointers.has(e.pointerId)) {
      const p = pointFrom(e);
      if (p) {
        proposal = { x: p.x, z: p.z };
        world.showGhost(
          selectedTool,
          proposal,
          placement(selectedTool, proposal).ok,
        );
      }
      return;
    }
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()],
        d = Math.hypot(a.x - b.x, a.y - b.y),
        m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      if (pinch && d) zoom(pinch / d);
      if (mid) {
        const scale = (overview ? 72 : state.camera.distance) / innerHeight;
        pan.x -=
          ((m.x - mid.x) * Math.cos(state.camera.yaw) +
            (m.y - mid.y) * Math.sin(state.camera.yaw)) *
          scale;
        pan.z -=
          (-(m.x - mid.x) * Math.sin(state.camera.yaw) +
            (m.y - mid.y) * Math.cos(state.camera.yaw)) *
          scale;
        pan.x = Math.max(-22, Math.min(22, pan.x));
        pan.z = Math.max(-20, Math.min(20, pan.z));
      }
      pinch = d;
      mid = m;
      return;
    }
    if (!down || multi) return;
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 7)
      down.drag = true;
    if (down.drag) {
      const p = orbitDelta(
        state.camera,
        e.clientX - down.lastX,
        e.clientY - down.lastY,
      );
      state.camera.yaw = p.yaw;
      state.camera.pitch = p.pitch;
    }
    down.lastX = e.clientX;
    down.lastY = e.clientY;
  });
  canvas.addEventListener("pointerup", (e) => {
    pointers.delete(e.pointerId);
    pinch = null;
    mid = null;
    if (multi) {
      if (!pointers.size) multi = false;
      down = null;
      return;
    }
    const tap = down && !down.drag && e.pointerId === down.id;
    down = null;
    if (!tap) return;
    const point = pointFrom(e);
    if (!point) return;
    if (selectedTool) {
      queueBuild({ x: point.x, z: point.z });
      return;
    }
    scene.updateMatrixWorld(true);
    const hits = ray.intersectObjects(scene.children, true);
    let id = null;
    for (const hit of hits) {
      if (hit.object.userData.targets) {
        id = hit.object.userData.targets[hit.instanceId];
        if (id) break;
      }
      for (let o = hit.object; o; o = o.parent)
        if (o.userData.target) {
          id = o.userData.target;
          break;
        }
      if (id) break;
    }
    if (id) {
      inspect(id);
      return;
    }
    if (travelTo(point))
      notice("Walking. Look around, or tap a place to inspect it.");
  });
  const clearPointers = () => {
    pointers.clear();
    pinch = null;
    mid = null;
    down = null;
    multi = false;
  };
  canvas.addEventListener("pointercancel", clearPointers);
  canvas.addEventListener("lostpointercapture", (e) => {
    pointers.delete(e.pointerId);
    if (!pointers.size) clearPointers();
  });
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (!document.querySelector("dialog[open]"))
        zoom(Math.exp(e.deltaY * 0.001));
    },
    { passive: false },
  );
  const keyDirection = (e) =>
    ({
      w: "up",
      ArrowUp: "up",
      s: "down",
      ArrowDown: "down",
      a: "left",
      ArrowLeft: "left",
      d: "right",
      ArrowRight: "right",
    })[e.key];
  document.addEventListener("keydown", (e) => {
    if (
      !started ||
      document.querySelector("dialog[open]") ||
      /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)
    )
      return;
    const dir = keyDirection(e);
    if (dir) {
      e.preventDefault();
      beginManual();
      keys.add(dir);
      return;
    }
    if (["q", "e", "r", "f"].includes(e.key)) {
      const p = orbitDelta(
        state.camera,
        e.key === "q" ? -30 : e.key === "e" ? 30 : 0,
        e.key === "r" ? -25 : e.key === "f" ? 25 : 0,
      );
      Object.assign(state.camera, p);
      reveal = null;
    }
    if (e.key === "Escape") {
      finishPlacement();
      $("catalogue").hidden = true;
      $("context").hidden = true;
      cancelWalk();
    }
    if (["+", "="].includes(e.key)) zoom(0.85);
    if (e.key === "-") zoom(1 / 0.85);
  });
  document.addEventListener("keyup", (e) => {
    const dir = keyDirection(e);
    if (dir) keys.delete(dir);
  });
  const suspend = () => {
    cancelWalk();
    clearPointers();
    state.running = false;
    persist();
    awake.setPlaying(false);
  };
  window.addEventListener("blur", suspend);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) suspend();
    else if (started) awake.setPlaying(true);
  });
  window.addEventListener("pagehide", persist);
  for (const pin of world.pins) {
    const b = document.createElement("button");
    b.className = "pin";
    b.textContent = pin.title;
    b.onclick = () => inspect(pin.id);
    $("pins").append(b);
    pin.button = b;
  }
  let audio = null,
    sound = false;
  function tone(kind) {
    if (!sound) return;
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      const t = audio.currentTime;
      for (const [i, f] of (kind === "success"
        ? [392, 494, 587, 784]
        : kind === "build"
          ? [294, 440, 587]
          : [330]
      ).entries()) {
        const o = audio.createOscillator(),
          g = audio.createGain();
        o.type = "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t + i * 0.1);
        g.gain.linearRampToValueAtTime(0.07, t + i * 0.1 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3);
        o.connect(g);
        g.connect(audio.destination);
        o.start(t + i * 0.1);
        o.stop(t + i * 0.1 + 0.32);
      }
    } catch {
      sound = false;
    }
  }
  $("sound").onclick = () => {
    sound = !sound;
    $("sound").setAttribute("aria-pressed", String(sound));
    $("sound").setAttribute(
      "aria-label",
      sound ? "Turn sound off" : "Turn sound on",
    );
    tone("tap");
  };
  const rainGeometry = new T.BufferGeometry(),
    rainPositions = new Float32Array(180 * 6);
  for (let i = 0; i < 180; i++) {
    const x = ((i * 13.77) % 60) - 30,
      z = ((i * 7.31) % 50) - 25,
      y = ((i * 3.19) % 18) + 2;
    rainPositions.set([x, y, z, x - 0.2, y - 0.8, z], i * 6);
  }
  rainGeometry.setAttribute(
    "position",
    new T.BufferAttribute(rainPositions, 3),
  );
  const rain = new T.LineSegments(
    rainGeometry,
    new T.LineBasicMaterial({
      color: 0xc7dcd8,
      transparent: true,
      opacity: 0.35,
    }),
  );
  scene.add(rain);
  function frame(dt) {
    elapsed += dt;
    if (document.querySelector("dialog[open]")) {
      keys.clear();
      held.clear();
    }
    rebuildNavigation();
    let moving = false;
    const inputs = new Set([...keys, ...held.values()]);
    const player = world.player.g;
    if (inputs.size) {
      const v = walkingVector(
          Number(inputs.has("right")) - Number(inputs.has("left")),
          Number(inputs.has("down")) - Number(inputs.has("up")),
          state.camera.yaw,
        ),
        d = dt * 4.4;
      const next = safePersonStep(
        player.position,
        { x: player.position.x + v.x * d, z: player.position.z + v.z * d },
        world.people.map((p) => p.g.position),
        navigator.segmentFree,
        d,
      );
      moving =
        Math.hypot(next.x - player.position.x, next.z - player.position.z) >
        0.001;
      if (moving) {
        player.rotation.y = Math.atan2(
          next.x - player.position.x,
          next.z - player.position.z,
        );
        player.position.x = next.x;
        player.position.z = next.z;
      }
    }
    if (waypoints.length) {
      const p = waypoints[0],
        d = Math.hypot(p.x - player.position.x, p.z - player.position.z);
      if (d < 0.12) {
        waypoints.shift();
        if (!waypoints.length && pending) workTime = 1.4;
      } else {
        const amount = Math.min(d, dt * 4.4),
          desired = {
            x: player.position.x + ((p.x - player.position.x) / d) * amount,
            z: player.position.z + ((p.z - player.position.z) / d) * amount,
          };
        const next = safePersonStep(
          player.position,
          desired,
          world.people.map((p) => p.g.position),
          navigator.segmentFree,
          amount,
        );
        moving =
          Math.hypot(next.x - player.position.x, next.z - player.position.z) >
          0.001;
        if (moving) {
          player.rotation.y = Math.atan2(
            next.x - player.position.x,
            next.z - player.position.z,
          );
          player.position.x = next.x;
          player.position.z = next.z;
        } else if (elapsed % 1 < dt) {
          const replanned = navigator.route(player.position, waypoints.at(-1));
          waypoints = replanned?.points ?? [];
          if (!waypoints.length) {
            pending = null;
            notice(
              "This route needs another approach. Try open ground beside the destination.",
            );
          }
        }
      }
    }
    if (workTime > 0) {
      workTime -= dt;
      world.player.arms.forEach(
        (a, i) => (a.rotation.x = Math.sin(elapsed * 15 + i) * 0.4 - 0.4),
      );
      if (workTime <= 0) {
        const intent = pending;
        pending = null;
        runIntent(intent);
      }
    }
    player.position.y = world.heightAt(
      player.position.x,
      player.position.z,
      state,
    );
    if (started && !document.querySelector("dialog[open]")) {
      const before = state.result;
      state = M.advance(state, dt * state.speed);
      if (state.result && !before && !state.observing) {
        cancelWalk();
        persist();
        showResult();
      }
    }
    const weather = state.weather === "rain";
    sun.intensity = weather ? 2.1 : 3.4;
    hemi.intensity = weather ? 2.1 : 2.35;
    rain.visible = weather && !reduced.matches;
    rain.position.y = -((elapsed * 8) % 8);
    scene.background.setHex(weather ? 0xcfdcd7 : 0xdce5de);
    world.animate(state, elapsed, moving, reduced.matches);
    const aim = overview
      ? { x: 0, z: 0 }
      : reveal
        ? { x: reveal.x, z: reveal.z }
        : player.position;
    cameraFocus.lerp(
      new T.Vector3(aim.x + pan.x, 1.25, aim.z + pan.z),
      reduced.matches ? 1 : 1 - Math.exp(-dt * 5),
    );
    if (reveal) {
      reveal.time += dt;
      if (reveal.time > 2.5) reveal = null;
    }
    const zoomFactor =
      reveal && !reduced.matches
        ? 1 - 0.12 * Math.sin((reveal.time / 2.5) * Math.PI)
        : 1;
    const distance =
      (overview
        ? Math.max(80, 80 / camera.aspect) * (state.camera.distance / 34)
        : state.camera.distance) * zoomFactor;
    let pitch = state.camera.pitch,
      position = null;
    const cameraBoxes = world.sites
      .filter((s) => !["market", "farm"].includes(s.id))
      .map((s) => ({
        minX: s.x - s.w / 2,
        maxX: s.x + s.w / 2,
        minZ: s.z - s.d / 2,
        maxZ: s.z + s.d / 2,
        minY: 0,
        maxY: 6.4,
      }));
    for (const candidate of [pitch, Math.min(1.3, pitch + 0.25), 1.35]) {
      const dir = {
        x: Math.sin(state.camera.yaw) * Math.cos(candidate),
        y: Math.sin(candidate),
        z: Math.cos(state.camera.yaw) * Math.cos(candidate),
      };
      if (
        clearBoomDistance(cameraFocus, dir, distance, cameraBoxes) >=
        distance - 0.1
      ) {
        pitch = candidate;
        position = new T.Vector3(
          cameraFocus.x + dir.x * distance,
          cameraFocus.y + dir.y * distance,
          cameraFocus.z + dir.z * distance,
        );
        break;
      }
    }
    position ??= new T.Vector3(
      cameraFocus.x + Math.sin(state.camera.yaw) * distance * 0.2,
      cameraFocus.y + distance,
      cameraFocus.z + Math.cos(state.camera.yaw) * distance * 0.2,
    );
    // Portrait overview needs a longer boom; keep the city inside the fog
    // and clipping range instead of letting it disappear at that distance.
    scene.fog.near = Math.max(65, distance * 0.95);
    scene.fog.far = Math.max(135, distance * 1.8);
    camera.position.lerp(position, reduced.matches ? 1 : 1 - Math.exp(-dt * 7));
    camera.lookAt(cameraFocus);
    camera.updateMatrixWorld();
    for (const pin of world.pins) {
      const p = new T.Vector3(pin.x, pin.y, pin.z).project(camera);
      pin.button.hidden =
        !!selectedTool ||
        overview ||
        !!reveal ||
        p.z > 1 ||
        p.x < -0.85 ||
        p.x > 0.85 ||
        p.y < -0.45 ||
        p.y > 0.65;
      pin.button.style.left = `${(p.x * 0.5 + 0.5) * innerWidth}px`;
      pin.button.style.top = `${(-p.y * 0.5 + 0.5) * innerHeight}px`;
    }
    updateHUD();
    saveElapsed += dt;
    if (saveElapsed > 3 && started) {
      saveElapsed = 0;
      persist();
    }
    renderer.render(scene, camera);
  }
  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.setViewOffset(
      innerWidth,
      innerHeight,
      0,
      innerHeight * 0.1,
      innerWidth,
      innerHeight,
    );
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();
  rebuildNavigation();
  world.sync(state);
  updateHUD();
  renderTools();
  $("welcome").showModal();
  let graphicsFailed = false;
  function animate(time) {
    if (graphicsFailed) return;
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, Math.max(0.001, (time - last) / 1000));
    last = time;
    if (document.hidden) return;
    try {
      frame(dt);
    } catch (error) {
      graphicsFailed = true;
      console.error("Market world frame interrupted", error);
      state.running = false;
      $("graphics-error").textContent =
        "The world paused after a drawing error. Your last checkpoint remains on this device. Reload to recover.";
      $("graphics-error").hidden = false;
    }
  }
  requestAnimationFrame((time) => {
    last = time;
    animate(time);
  });
}
