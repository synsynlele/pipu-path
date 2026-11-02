import {
  JOBS,
  newRepairQueue,
  repairAction,
  advanceRepair,
  restoreRepair,
  repairReport,
} from "./repair-queue.mjs";
export function mountRepairQueue({
  T,
  scene,
  actor,
  getCamera,
  walk,
  cancelWalk,
  frame,
  canSave,
  onExit,
  getWalking = () => true,
  onCue = () => {},
}) {
  const KEY = "unbuilt-city:repair-workshop:v1";
  let state = newRepairQueue(),
    active = false,
    selected = null,
    message = "",
    busy = false,
    lastView = "",
    revealTime = 0,
    saveTime = 0,
    busyTime = 0;
  const root = new T.Group();
  root.visible = false;
  scene.add(root);
  const hud = document.createElement("section");
  hud.id = "repair-hud";
  hud.hidden = true;
  hud.setAttribute("aria-label", "Hands-on workshop");
  hud.innerHTML =
    '<div id="repair-status"></div><h2 id="repair-goal"></h2><p id="repair-message" role="status"></p><p id="repair-queue"></p><label for="repair-job">Walk to a job or work area </label><select id="repair-job"><option value="">Choose a waiting device…</option></select><div id="repair-actions"></div><small id="repair-save"></small>';
  document.body.append(hud);
  const $ = (id) => hud.querySelector("#" + id),
    pins = document.createElement("div");
  pins.id = "repair-pins";
  pins.hidden = true;
  document.body.append(pins);
  const welcome = document.createElement("dialog");
  welcome.id = "repair-welcome";
  welcome.innerHTML =
    '<h2>Ama needs a working workshop.</h2><p>Six jobs. One skilled repairer. Twelve shift minutes.</p><p>Inspect the devices, arrange the work and watch what finishes. Restore all three essential services on time and finish at least five jobs.</p><p>Drag to look around. Pinch or scroll to zoom. Tap the city to walk. These are fictional repair trials.</p><button type="button">Enter the workshop →</button>';
  document.body.append(welcome);
  welcome.querySelector("button").onclick = () => welcome.close();
  for (const j of JOBS) {
    const option = document.createElement("option");
    option.value = j.id;
    option.textContent = j.name;
    $("repair-job").append(option);
  }
  const mat = new Map(),
    geo = new T.BoxGeometry(1, 1, 1),
    jobs = new Map(),
    stations = [];
  function box(parent, w, h, d, c, x, y, z) {
    if (!mat.has(c))
      mat.set(c, new T.MeshStandardMaterial({ color: c, roughness: 0.9 }));
    const m = new T.Mesh(geo, mat.get(c));
    m.scale.set(w, h, d);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function station(id, name, x, z) {
    const g = new T.Group();
    root.add(g);
    g.position.set(x, 0, z);
    const b = document.createElement("button");
    b.className = "repair-pin";
    b.textContent = name;
    b.onclick = () => visit(id);
    pins.append(b);
    const o = { id, g, b, approach: { x, z: 4.8 } };
    stations.push(o);
    return o;
  }
  JOBS.forEach((j, i) => {
    const o = station(
      j.id,
      ["Pump", "Cooler", "Cart", "Radio", "Lamp", "Chair"][i],
      -5.5 + i * 1.5,
      3.45,
    );
    o.home = o.g.position.clone();
    box(o.g, 0.8, 0.16, 0.65, 0xa08a5b, 0, 0.38, 0);
    if (j.id === "pump") {
      box(o.g, 0.35, 0.6, 0.35, 0x668b92, 0, 0.72, 0);
      box(o.g, 0.75, 0.12, 0.14, 0x526459, 0.12, 1.06, 0);
      box(o.g, 0.12, 0.3, 0.14, 0x526459, 0.44, 0.95, 0);
    } else if (j.id === "cold") {
      box(o.g, 0.6, 0.85, 0.5, 0xd5ded3, 0, 0.88, 0);
      box(o.g, 0.48, 0.65, 0.06, 0x779b9e, 0, 0.9, 0.28);
      box(o.g, 0.05, 0.25, 0.06, 0x526459, 0.17, 0.94, 0.32);
    } else if (j.id === "cart") {
      box(o.g, 0.68, 0.12, 0.48, 0x8f7953, 0, 0.7, 0);
      for (const x of [-0.31, 0.31])
        box(o.g, 0.1, 0.3, 0.3, 0x48534e, x, 0.5, 0);
      box(o.g, 0.08, 0.65, 0.08, 0x526459, 0.3, 0.95, -0.22);
    } else if (j.id === "radio") {
      box(o.g, 0.55, 0.38, 0.3, 0x526459, 0, 0.65, 0);
      box(o.g, 0.22, 0.22, 0.04, 0x343e3c, -0.1, 0.66, 0.17);
      box(o.g, 0.035, 0.55, 0.035, 0xaab4ad, 0.2, 0.98, 0);
    } else if (j.id === "lamp") {
      box(o.g, 0.35, 0.06, 0.3, 0x526459, 0, 0.5, 0);
      box(o.g, 0.05, 0.52, 0.05, 0x80968a, 0, 0.78, 0);
      box(o.g, 0.5, 0.22, 0.35, 0xcfb66c, 0, 1.08, 0);
    } else {
      box(o.g, 0.6, 0.1, 0.5, 0x8f7953, 0, 0.8, 0);
      box(o.g, 0.6, 0.48, 0.08, 0x8f7953, 0, 1.08, -0.22);
      for (const x of [-0.24, 0.24])
        for (const z of [-0.18, 0.18])
          box(o.g, 0.08, 0.35, 0.08, 0x526459, x, 0.6, z);
    }
    o.lamp = box(o.g, 0.12, 0.12, 0.12, 0xc3794a, 0.28, 0.55, 0.25);
    jobs.set(j.id, o);
  });
  const queue = station("queue", "Queue desk", 3.8, 3.6);
  box(queue.g, 1.1, 0.12, 0.65, 0x8f7953, 0, 0.9, 0);
  box(queue.g, 0.15, 0.85, 0.15, 0x526459, -0.4, 0.45, 0);
  box(queue.g, 0.15, 0.85, 0.15, 0x526459, 0.4, 0.45, 0);
  const workflow = station("workflow", "Organise tools", -3.8, 2.4);
  box(workflow.g, 0.9, 0.1, 0.45, 0x80968a, 0, 0.55, 0);
  for (let i = 0; i < 4; i++)
    box(workflow.g, 0.07, 0.12, 0.25, 0xd1b975, -0.3 + i * 0.2, 0.66, 0);
  const bench = station("bench", "Restore bench", 0.7, 1);
  bench.approach = { x: 1.8, z: 2.9 };
  const benchTop = box(bench.g, 1.6, 0.15, 0.8, 0x927a56, 0, 1, 0);
  for (const x of [-0.65, 0.65])
    box(bench.g, 0.12, 0.9, 0.6, 0x526459, x, 0.5, 0);
  const helper = station("helper", "Meet repairer", -5, 1.4);
  helper.approach = { x: -4.8, z: 2.8 };
  box(helper.g, 0.42, 0.7, 0.3, 0x5c7fa3, 0, 1.15, 0);
  box(helper.g, 0.28, 0.34, 0.28, 0x9b6343, 0, 1.68, 0);
  for (const x of [-0.14, 0.14])
    box(helper.g, 0.14, 0.7, 0.18, 0x4c5759, x, 0.5, 0);
  for (const o of [queue, workflow, bench, helper]) {
    const option = document.createElement("option");
    option.value = o.id;
    option.textContent = o.b.textContent;
    $("repair-job").append(option);
  }
  // Props have stable footprints; the host rebuilds normal navigation when opening.
  function save() {
    if (!canSave()) {
      $("repair-save").textContent =
        "Session only · enable device saving at the entrance to keep this workshop";
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      $("repair-save").textContent = "Workshop saved on this device";
    } catch {
      $("repair-save").textContent =
        "Device saving unavailable · keep this page open";
    }
  }
  function apply(type, id) {
    const n = repairAction(state, type, id);
    if (n === state) return false;
    state = n;
    save();
    render();
    return true;
  }
  function arrive(o, fn) {
    if (busy || state.running) return;
    busy = true;
    message =
      "Walking to " +
      (JOBS.find((j) => j.id === o.id)?.name ?? o.b.textContent) +
      "…";
    render();
    const accepted = walk(
      o.approach,
      () => {
        busy = false;
        if (!active) return;
        if (
          Math.hypot(
            actor.position.x - o.approach.x,
            actor.position.z - o.approach.z,
          ) > 2.3
        ) {
          message = "Get closer to the work area and try again.";
          render();
          return;
        }
        fn();
        render();
      },
      o.b.textContent,
    );
    if (!accepted) {
      busy = false;
      message = "Choose a clear approach and try again.";
      render();
    }
  }
  function visit(id) {
    if (state.running || state.time > 0 || busy) return;
    const o = stations.find((o) => o.id === id);
    if (!o) return;
    arrive(o, () => {
      selected = id;
      if (JOBS.some((j) => j.id === id)) {
        apply("inspect", id);
        message = JOBS.find((j) => j.id === id).detail;
      } else
        message = {
          queue:
            "Place carried jobs here. The order on this desk controls who gets repaired first.",
          workflow:
            "A clear tool layout reduces work time by a quarter. Inspect every job before adapting the workflow.",
          bench:
            "Restore this spare bench for 6 tokens. It needs another skilled repairer to increase capacity.",
          helper:
            "Bring a trained neighbour into this shift for 2 tokens. A second person needs a working bench.",
        }[id];
    });
  }
  $("repair-job").onchange = (e) => {
    visit(e.target.value);
    e.target.value = "";
  };
  function button(text, fn, disabled = false, primary = false) {
    const b = document.createElement("button");
    b.textContent = text;
    b.disabled = disabled || busy;
    b.className = primary ? "primary" : "";
    b.onclick = fn;
    $("repair-actions").append(b);
  }
  function work(type, o) {
    arrive(o, () => {
      if (apply(type)) {
        message = {
          workflow: "Tools organised. Each job now needs 25% less repair time.",
          bench:
            "The second bench is restored. Check that a skilled repairer can use it.",
          helper:
            "A trained neighbour has joined. Check there is a usable bench.",
        }[type];
        frame(o.g.position);
        revealTime = 2.5;
      } else
        message = "Inspect all six jobs first, or check your remaining tokens.";
    });
  }
  function render(persist = true) {
    hud.classList.toggle("repair-success", !!state.result?.success);
    const r = state.result ?? repairReport(state),
      names = state.queue.map((id) => jobs.get(id).b.textContent);
    $("repair-status").textContent =
      `AMA’S WORKSHOP · ${state.time.toFixed(1)}/12 shift minutes · ${state.cash}/8 tokens · ${r.total}/6 repaired · ${r.essential}/3 essential services`;
    $("repair-goal").textContent = state.result
      ? state.result.success
        ? "Your workshop serves the neighbourhood."
        : "The shift revealed a problem."
      : state.running
        ? "Watch your plan work."
        : state.time > 0
          ? "Shift paused."
          : state.inspected.length < 6
            ? `Inspect the waiting jobs · ${state.inspected.length}/6`
            : "Arrange the work. Restore three services; finish five jobs.";
    $("repair-message").textContent = state.result
      ? state.result.success
        ? `${r.total} jobs finished. All three essential services recovered on time. ${r.spent} tokens used.`
        : `${r.total} jobs finished. Essential services on time: ${r.essential}/3. Still needed: ${r.late.join(", ") || "at least five completed jobs"}. Reorder or improve the workshop, then test again.`
      : message ||
        "Tap a device in the city, or choose it below. Discover who is waiting and how long each job needs.";
    $("repair-queue").textContent =
      (state.held
        ? "Carrying: " + JOBS.find((j) => j.id === state.held).name + ". "
        : "") +
      "Queue: " +
      (names.join(" → ") || "empty");
    $("repair-actions").replaceChildren();
    $("repair-job").disabled = busy || state.running || state.time > 0;
    if (state.result) {
      button("Improve this workshop", () => {
        apply("retry");
        selected = null;
        message =
          "Your improvements remain. Arrange a new queue and try again.";
        render();
      });
      button("Explore my city", () => {
        message =
          "Your result is kept. Drag to look around or tap clear ground to walk.";
        frame({ x: -1, z: 2 }, true);
        render();
      });
      button("Return to game entrance", close);
    } else if (state.running || state.time > 0) {
      button(
        state.running ? "Pause shift" : "Resume shift",
        () => apply("pause"),
        false,
        true,
      );
      button("Stop and improve", () => {
        cancelWalk();
        busy = false;
        apply("retry");
        message = "Trial reset. Tools and tokens remain; rearrange the work.";
        render();
      });
    } else {
      if (state.held) {
        button(
          "Carry to queue desk",
          () =>
            arrive(queue, () => {
              apply("place");
              message =
                "Job placed at the end of the queue. Lift a queued job to change its order.";
            }),
          false,
          true,
        );
        button("Return to waiting area", () => {
          apply("return");
          message = "Job returned.";
          render();
        });
      } else if (JOBS.some((j) => j.id === selected)) {
        const queued = state.queue.includes(selected);
        button(
          queued ? "Lift from queue" : "Carry this job",
          () =>
            arrive(
              state.queue.includes(selected) ? queue : jobs.get(selected),
              () => {
                apply(queued ? "take" : "lift", selected);
                message =
                  "Carry this job to the queue desk, or return it to the waiting area.";
              },
            ),
          false,
          true,
        );
      } else if (selected === "workflow")
        button(
          state.workflow ? "Workflow organised" : "Organise the tools",
          () => work("workflow", workflow),
          state.workflow || state.inspected.length < 6,
          true,
        );
      else if (selected === "bench")
        button(
          state.bench ? "Bench restored" : "Restore bench · 6 tokens",
          () => work("bench", bench),
          state.bench || state.cash < 6,
          true,
        );
      else if (selected === "helper")
        button(
          state.helper ? "Repairer ready" : "Bring in repairer · 2 tokens",
          () => work("helper", helper),
          state.helper || state.cash < 2,
          true,
        );
      button(
        "Run the shift",
        () =>
          arrive(queue, () => {
            if (apply("run")) {
              selected = null;
              message =
                "The queue is being repaired. Watch the bench and service lights.";
            }
          }),
        state.inspected.length < 6 || state.queue.length === 0 || !!state.held,
        true,
      );
    }
    button("Reset workshop", () => {
      if (confirm("Reset this workshop and its local checkpoint?")) {
        cancelWalk();
        busy = false;
        apply("reset");
        selected = null;
        message = "A fresh shift is ready.";
        render();
      }
    });
    if (persist) save();
    sync();
  }
  function sync() {
    benchTop.material =
      mat.get(state.bench ? 0x927a56 : 0x80968a) ?? benchTop.material;
    bench.g.visible = active;
    helper.g.visible = active;
    for (const [id, o] of jobs) {
      const i = state.queue.indexOf(id),
        working = state.workers.findIndex((w) => w.id === id),
        finished = state.finished.find((f) => f.id === id);
      if (state.held === id)
        o.g.position.set(actor.position.x + 0.55, 0.5, actor.position.z);
      else if (finished)
        o.g.position.set(-5 + JOBS.findIndex((j) => j.id === id) * 1.3, 0, 2.5);
      else if (working >= 0)
        o.g.position.set(
          working === 0 ? -4 : 0.7,
          0.4,
          working === 0 ? -3.7 : 1,
        );
      else if (i >= 0) o.g.position.set(3.8 + i * 0.3, 0, 3.6 - i * 0.45);
      else o.g.position.copy(o.home);
      o.g.scale.setScalar(finished ? 0.72 : 1);
      if (!mat.has(0x8caa6f))
        mat.set(0x8caa6f, new T.MeshStandardMaterial({ color: 0x8caa6f }));
      o.lamp.material = mat.get(finished ? 0x8caa6f : 0xc3794a);
    }
  }
  function tick(dt) {
    if (!active) return;
    saveTime += dt;
    if (saveTime > 3) {
      saveTime = 0;
      save();
    }
    if (busy) {
      busyTime += dt;
      if (busyTime > 0.4 && !getWalking()) {
        busy = false;
        busyTime = 0;
        message = "Walk cancelled. Choose the job or tool again.";
        render();
      }
    } else busyTime = 0;
    if (
      !document.hidden &&
      !document.querySelector("dialog[open]") &&
      state.running
    ) {
      state = advanceRepair(state, dt * 0.5);
      if (state.result) {
        onCue(state.result.success ? "chapter" : "test");
        message = "";
        save();
        frame({ x: -1, z: 1 });
        revealTime = 2.5;
      }
    }
    if (revealTime > 0) revealTime -= dt;
    sync();
    const key = JSON.stringify([
      state.time.toFixed(1),
      state.result,
      state.workers.map((w) => w.id),
      state.finished,
    ]);
    if (key !== lastView) {
      lastView = key;
      render(false);
    }
    const occupied = [];
    for (const o of stations) {
      const p = new T.Vector3(
        o.g.position.x,
        1.5 + (JOBS.findIndex((j) => j.id === o.id) % 2) * 0.4,
        o.g.position.z,
      ).project(getCamera());
      const x = (p.x * 0.5 + 0.5) * innerWidth,
        y = (-p.y * 0.5 + 0.5) * innerHeight;
      const overlap = occupied.some((a) => Math.hypot(a.x - x, a.y - y) < 68);
      o.b.hidden =
        !active ||
        busy ||
        state.running ||
        state.time > 0 ||
        p.z > 1 ||
        p.z < -1 ||
        x < 35 ||
        x > innerWidth - 35 ||
        y < 100 ||
        y > innerHeight - 240 ||
        overlap;
      if (!o.b.hidden) occupied.push({ x, y });
      o.b.style.left = x + "px";
      o.b.style.top = y + "px";
    }
  }
  function open() {
    active = true;
    root.visible = true;
    hud.hidden = false;
    pins.hidden = false;
    document.body.classList.add("repair-pilot");
    if (canSave()) {
      try {
        state = restoreRepair(localStorage.getItem(KEY)) ?? state;
      } catch {
        /* Session remains usable. */
      }
    }
    frame({ x: -1, z: 2 });
    render();
    welcome.showModal();
  }
  function close() {
    state.running = false;
    busy = false;
    save();
    active = false;
    root.visible = false;
    hud.hidden = true;
    pins.hidden = true;
    welcome.close();
    document.body.classList.remove("repair-pilot");
    cancelWalk();
    onExit();
  }
  document.getElementById("city-menu").addEventListener("toggle", () => {
    if (active && document.getElementById("city-menu").open) {
      state.running = false;
      busy = false;
      cancelWalk();
      render();
    }
  });
  window.addEventListener("blur", () => {
    if (active) {
      state.running = false;
      busy = false;
      cancelWalk();
      render();
    }
  });
  window.addEventListener("pagehide", () => {
    if (active) {
      state.running = false;
      save();
    }
  });
  return {
    open,
    help: () => welcome.showModal(),
    close,
    tick,
    visit,
    get active() {
      return active;
    },
    get state() {
      return state;
    },
    get busy() {
      return busy;
    },
    pick(ray) {
      if (!active) return false;
      const hit = ray.intersectObjects(root.children, true)[0];
      if (!hit) return false;
      for (let o = hit.object; o && o !== root; o = o.parent) {
        const target = stations.find((s) => s.g === o);
        if (target) {
          visit(target.id);
          return true;
        }
      }
      return false;
    },
  };
}
