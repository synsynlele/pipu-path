import {
  PRACTICAL_OBJECTS,
  practicalForChapter,
  practicalById,
  newPracticalState,
  freshPractical,
  practicalAction,
  practicalReport,
  practicalCentre,
} from "./practical-missions.mjs";
import { drawPractical, animatePractical } from "./practical-scene.mjs";
import {
  BUILDER_CHAPTERS,
  CHAPTER_REFLECTIONS,
  SYSTEM_CHAPTERS,
  newChapterSystems,
  chapterComplete,
  chapterReadout,
  systemAction,
  evaluateChapter,
} from "./builder-chapters.mjs";
import { CHAPTER_OBJECTS, drawChapter } from "./chapter-scene.mjs";
import {
  BUILDER_MISSIONS,
  EPISODE_OBJECTS,
  newEpisode,
  missionUnlocked,
  episodeAction,
  advanceApprentice,
  episodeHint,
} from "./builder-episode.mjs";
import { drawEpisode } from "./episode-scene.mjs";
import { crewReplicas } from "./crew-replication.mjs";
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
  frameCamera = null,
  coverAsset = () => true,
  productionReplica = null,
  occupiedParcels = () => [],
  walkClear = () => true,
  planRoute,
  refreshNavigation,
  enter,
  leave,
  classic = () => {},
  toggleSound = async () => false,
  toggleMusic = async () => false,
  cue = () => {},
  onChapterComplete = () => 0,
}) {
  let active = false,
    state = newMarket(),
    waypoints = [],
    pending = null,
    work = null,
    walking = false,
    elapsed = 0,
    snapshot = null,
    cityView = false,
    unlockedThrough = 1,
    overviewFar = null;
  let practical = newPracticalState(),
    activeExtra = null,
    welcomeSeen = false;
  let zoom = 1,
    reveal = null;
  const reducedMotion = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const baseDone = (id) => chapterComplete(id, episode, state, systems);
  const chapterDone = (id) =>
    baseDone(id) && practicalForChapter(id).every((m) => practical[m.id].done);
  const chapterCount = () =>
    BUILDER_CHAPTERS.filter((c) => chapterDone(c.id)).length;
  const challengeCount = () =>
    BUILDER_CHAPTERS.filter((c) => baseDone(c.id)).length +
    Object.values(practical).filter((s) => s.done).length;
  const practicalContext = (id = activeExtra) => ({
    otherChallenges: challengeCount() - (practical[id]?.done ? 1 : 0),
    prototypes: Object.values(projects).filter((p) => p.open).length,
  });
  const currentPractical = () => practicalById(activeExtra);
  const objectVisible = (spec) =>
    spec.extra
      ? spec.extra === activeExtra
      : !activeExtra &&
        (spec.system ?? spec.mission ?? spec.project ?? "market") ===
          activeSite;
  const revealChange = (id) => {
    const spec = objects.find((o) => o.id === id);
    if (!spec || reducedMotion()) {
      reveal = null;
      return;
    }
    reveal = {
      x: spec.x,
      z: spec.z,
      elapsed: 0,
      duration: 2.6,
      yaw: cameraYaw,
    };
  };
  const celebrated = new Set();
  const objects = [
    ...MARKET_OBJECTS,
    ...CONSTRUCTION_OBJECTS,
    ...EPISODE_OBJECTS,
    ...CHAPTER_OBJECTS,
    ...PRACTICAL_OBJECTS,
  ];
  let projects = newConstruction(),
    activeSite = "investigate",
    episode = newEpisode(),
    systems = newChapterSystems(),
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
    celebrants = [],
    episodeResidents = [];
  let cartMesh,
    navigationDirty = false;
  const panel = document.createElement("section");
  panel.className = "hands-on-panel market-worksite";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Repair the market");
  panel.innerHTML = `<div class="hands-on-heading"><strong>Reopen the neighbourhood market</strong><button data-exit aria-label="Return to game entrance">✕</button></div><label class="worksite-picker">Worksite <select data-site aria-label="Choose a hands-on worksite"><option value="investigate">Mission · Find the missing water</option><option value="care">Mission · Help the clinic receive people</option><option value="teach">Mission · Help an apprentice succeed</option><option value="market">Repair the market</option><option value="homes">Build homes</option><option value="tower">Build a skyline tower</option><option value="hospital">Build a hospital</option><option value="farm">Grow a community farm</option><option value="stadium">Build a stadium</option><option value="airport">Build an airport</option></select></label><div class="next-instruction"><span>YOUR NEXT MOVE</span><p data-goal></p></div><p data-reflection hidden></p><button data-chapter-next hidden>Continue to next chapter →</button><div class="market-progress" data-progress></div><p class="crew-progress" data-crew></p><p data-status role="status" aria-live="polite"></p><div class="market-carry"><span data-carry></span><button data-next hidden></button><button data-drop hidden>Return item</button><button data-stop hidden>Stop walking</button></div><details><summary>Find an object · controls</summary><p>Tap an object or its name: your character walks there and does the work. Tap open ground to walk. Drag to turn the camera. Work stays in this page session.</p><div class="market-access" role="group" aria-label="Worksite objects"></div><button data-reset>Restart this worksite</button></details><a data-quest href="/real-quests" target="_top" hidden>Build something in real life →</a>`;
  const productionActions = document.querySelector(
    "#city-hud .city-hud-navigation .top-actions",
  );
  const productionShop = document.getElementById("menu-shop");
  const productionShopParent = productionShop?.parentNode;
  const productionShopNext = productionShop?.nextSibling;
  const productionActionsParent = productionActions?.parentNode;
  const productionActionsNext = productionActions?.nextSibling;
  const picker = panel.querySelector("[data-site]");
  for (const chapter of BUILDER_CHAPTERS) {
    let option = [...picker.options].find((o) => o.value === chapter.id);
    if (!option) {
      option = document.createElement("option");
      option.value = chapter.id;
    }
    option.textContent = `Chapter ${chapter.number} · ${chapter.name}`;
    picker.append(option);
  }
  // Chapters first; construction stays available as a separate set of worksites.
  for (const project of CITY_PROJECTS)
    picker.append([...picker.options].find((o) => o.value === project.id));
  panel
    .querySelector(".next-instruction")
    .append(panel.querySelector("[data-next]"));
  const toolbar = document.createElement("nav");
  toolbar.className = "hands-on-toolbar";
  toolbar.setAttribute("aria-label", "City controls");
  toolbar.innerHTML =
    '<button data-menu aria-expanded="false">☰ City menu</button><button data-city-view>View my city</button><div class="hands-on-zoom" role="group" aria-label="City zoom"><button data-zoom-out aria-label="Zoom out">−</button><button data-zoom-in aria-label="Zoom in">+</button></div>';
  const menu = document.createElement("div");
  menu.className = "hands-on-menu";
  menu.hidden = true;
  menu.setAttribute("aria-label", "City menu");
  menu.append(
    panel.querySelector(".worksite-picker"),
    panel.querySelector("[data-progress]"),
    panel.querySelector("[data-crew]"),
    panel.querySelector("details"),
    panel.querySelector("[data-quest]"),
    panel.querySelector("[data-exit]"),
  );
  menu.querySelector("[data-exit]").textContent = "Return to entrance";
  const extras = document.createElement("div");
  extras.className = "menu-extras";
  extras.innerHTML =
    "<button data-sound>Toggle sound effects</button><button data-music>Toggle music</button><button data-classic hidden>Production city challenges</button><p>Hands-on progress stays in this page session.</p>";
  const missionParts = document.createElement("div");
  missionParts.className = "mission-parts";
  missionParts.setAttribute("aria-label", "Challenges in this chapter");
  menu.append(missionParts, extras);
  const welcome = document.createElement("dialog");
  welcome.className = "hands-on-welcome";
  welcome.setAttribute("aria-labelledby", "hands-on-welcome-title");
  welcome.innerHTML =
    '<span class="welcome-kicker">BUILD A BETTER WORLD</span><h2 id="hands-on-welcome-title">This city needs what you can build.</h2><p>People are waiting for useful ideas. Help them by making things work, testing what changes and improving what fails.</p><p><strong>12 chapters · 36 hands-on challenges</strong><br>Tap a city object to walk there and work. Drag to look around. Pinch or use + and − to see closer.</p><button data-begin>Begin my first challenge →</button><button data-welcome-exit>Return to entrance</button>';
  document.body.append(welcome);
  const help = document.createElement("section");
  help.className = "hands-on-help";
  help.innerHTML =
    "<h2>Build a better world</h2><p>12 chapters, three hands-on challenges each. Your next move is written at the bottom of the city.</p><ol><li><strong>Explore the need.</strong> Tap an object or its transparent name. Your character walks to it before doing any work.</li><li><strong>Make something useful.</strong> Carry an item to its matching place, organise people or operate the city objects. You can carry one item at a time.</li><li><strong>Test the result.</strong> A failed test explains what is still missing. Improve the system and test again.</li><li><strong>See what changed.</strong> The camera shows the result. Drag, pinch or use + and − to inspect it yourself. Manual camera input stops the cinematic move.</li><li><strong>Continue.</strong> Finish all three challenges to celebrate a chapter, earn 30 virtual Builder Credits and unlock the next one.</li></ol><p>City menu contains challenge review, worksite controls and six construction prototypes. Build each prototype once; crews repeat the tested design across the city. View my city shows the whole city. The Builder Shop sells virtual decorations and builder cosmetics.</p><p>Work stays in this open page session. Refreshing or closing can reset the hands-on journey. These fictional outcomes do not award real-world XP. A real-world Quest lets you take an idea outside the game.</p>";
  document
    .getElementById("help-dialog")
    ?.insertBefore(help, document.getElementById("help-done"));
  welcome.querySelector("[data-begin]").onclick = () => {
    welcomeSeen = true;
    welcome.close();
    setCityView(false);
    walkToSite();
    updateUI(
      "People are waiting for water. Tap a labelled object to investigate.",
    );
  };
  welcome.querySelector("[data-welcome-exit]").onclick = () => {
    welcome.close();
    close();
  };
  welcome.addEventListener("cancel", (e) => {
    e.preventDefault();
    welcome.close();
    close();
  });
  panel.prepend(toolbar, menu);
  const celebration = document.createElement("section");
  celebration.className = "hands-on-celebration";
  celebration.hidden = true;
  celebration.setAttribute("aria-label", "Chapter celebration");
  celebration.setAttribute("role", "region");
  celebration.innerHTML =
    '<div class="celebration-flowers" aria-hidden="true">✿ ✦ ❀ ✧ ✿ ❀ ✦</div><strong data-celebration-title></strong><p data-celebration-message></p><button data-celebration-view>View my city</button><button data-celebration-next>Continue building →</button><button data-celebration-close>Keep exploring</button>';
  panel.append(celebration);
  const instructions = document.createElement("div");
  instructions.className = "hands-on-instructions";
  instructions.setAttribute("role", "region");
  instructions.setAttribute("aria-label", "Current mission instructions");
  for (const selector of [
    ".hands-on-heading",
    ".next-instruction",
    "[data-reflection]",
    "[data-chapter-next]",
    "[data-status]",
    ".market-carry",
  ])
    instructions.append(panel.querySelector(selector));
  panel.insertBefore(instructions, celebration);

  const setMenu = (open) => {
    menu.hidden = !open;
    toolbar
      .querySelector("[data-menu]")
      .setAttribute("aria-expanded", String(open));
  };
  function setCityView(value) {
    stop();
    const camera = getCamera();
    if (!frameCamera && value && !cityView) overviewFar = camera.far;
    if (!value && overviewFar !== null) {
      camera.far = overviewFar;
      camera.updateProjectionMatrix();
      overviewFar = null;
    }
    cityView = value;
    reveal = null;
    zoom = 1;
    celebration.hidden = true;
    setMenu(false);
    panel.classList.toggle("city-overview", cityView);
    toolbar.querySelector("[data-city-view]").textContent = cityView
      ? "Return to mission"
      : "View my city";
    if (!cityView) focus.copy(actor.g.position);
    productionVisibility();
    for (const child of root.children) {
      if (cityView) {
        child.userData.beforeCityView = child.visible;
        const project = child.userData.marketTarget?.split(":")[0];
        child.visible =
          !!child.userData.crewReplica || !!projects[project]?.open;
      } else if (child.userData.beforeCityView !== undefined) {
        child.visible = child.userData.beforeCityView;
        delete child.userData.beforeCityView;
      }
    }
    tick(0, getCamera());
  }
  toolbar.querySelector("[data-menu]").onclick = () => {
    const opening = menu.hidden;
    if (opening) stop();
    setMenu(opening);
  };
  toolbar.querySelector("[data-city-view]").onclick = () =>
    setCityView(!cityView);
  celebration.querySelector("[data-celebration-view]").onclick = () =>
    setCityView(true);
  celebration.querySelector("[data-celebration-next]").onclick = () => {
    celebration.hidden = true;
    panel.querySelector("[data-chapter-next]").click();
  };
  celebration.querySelector("[data-celebration-close]").onclick = () => {
    celebration.hidden = true;
  };
  extras.querySelector("[data-classic]").onclick = () => {
    if (active) close();
    classic();
  };
  extras.querySelector("[data-sound]").onclick = async (e) => {
    const on = await toggleSound();
    e.target.textContent = on ? "Sound effects on" : "Sound effects off";
  };
  extras.querySelector("[data-music]").onclick = async (e) => {
    const on = await toggleMusic();
    e.target.textContent = on ? "Music on" : "Music off";
  };
  document.addEventListener("keydown", (e) => {
    if (!active || e.key !== "Escape") return;
    if (cityView) setCityView(false);
    else if (!celebration.hidden) celebration.hidden = true;
    else setMenu(false);
  });
  function changeZoom(factor) {
    if (!active || welcome.open || document.querySelector("dialog[open]"))
      return;
    reveal = null;
    zoom = Math.max(0.48, Math.min(1.8, zoom * factor));
    tick(0, getCamera());
  }
  toolbar.querySelector("[data-zoom-in]").onclick = () => changeZoom(0.84);
  toolbar.querySelector("[data-zoom-out]").onclick = () => changeZoom(1 / 0.84);
  function replicas() {
    const occupied = new Set(occupiedParcels());
    return crewReplicas(projects, episode, undefined, chapterCount()).filter(
      (p) => !occupied.has(p.id),
    );
  }
  const tags = document.createElement("div");
  tags.className = "market-tags";
  tags.hidden = true;
  (document.getElementById("city-hud") ?? document.body).append(panel);
  document.body.append(tags);
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
    return [...getResidents(), ...customers, ...celebrants, ...episodeResidents]
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
    if (
      practical["next-generation"].done &&
      (challengeCount() < 36 ||
        Object.values(projects).filter((p) => p.open).length < 6)
    )
      practical = {
        ...practical,
        "next-generation": {
          ...practical["next-generation"],
          done: false,
          result: null,
        },
      };
    if (
      systems.legacy.done &&
      !evaluateChapter("legacy", systems.legacy, {
        episode,
        market: state,
        systems,
        projects,
      }).success
    )
      systems = {
        ...systems,
        legacy: { ...systems.legacy, done: false, result: null },
      };
    root.clear();
    carry.clear();
    objectGroups.clear();
    customers.length = 0;
    celebrants.length = 0;
    episodeResidents.length = 0;
    if ((activeSite === "market" && !activeExtra) || state.opened) {
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
      timber.visible = !state.opened;
      for (let n = 0; n < 5; n++)
        box(timber, 1.65, 0.15, 0.2, 0xb88c54, 0, 0.45 + n * 0.15, 0);
      const sheets = object("roofing");
      sheets.visible = !state.opened;
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
    }
    if (activeSite !== "market" && state.carrying && state.carrying !== "cart")
      box(carry, 0.8, 0.4, 0.5, 0xb49762, 0, 1, 0.6);
    const systemChapter = SYSTEM_CHAPTERS.find((c) => c.id === activeSite);
    constructionScene.draw(
      root,
      projects,
      objectGroups,
      box,
      activeExtra
        ? (systemChapter?.site ??
            (activeSite === "market" ? "homes" : undefined))
        : systemChapter?.site,
    );
    if (!activeExtra)
      drawChapter({
        root,
        active: activeSite,
        systems,
        objects: objectGroups,
        box,
        spawn: spawnPerson,
        people: episodeResidents,
      });
    if (!activeExtra)
      drawEpisode({
        root,
        state: episode,
        active: activeSite,
        objects: objectGroups,
        box,
        spawn: spawnPerson,
        people: episodeResidents,
      });
    if (activeExtra)
      drawPractical({
        root,
        mission: currentPractical(),
        state: practical[activeExtra],
        object,
        box,
        spawn: spawnPerson,
        people: episodeResidents,
        context: practicalContext(),
      });
    const held = practical[activeExtra]?.carrying;
    if (held) box(carry, 0.7, 0.45, 0.6, 0xd3b46c, 0, 1, 0.6);
    for (const parcel of replicas()) {
      if (productionReplica) productionReplica(root, parcel);
      else constructionScene.replica(root, parcel);
    }
    if (productionReplica)
      for (const child of root.children) {
        const project = CITY_PROJECTS.find(
          (p) => p.id === child.userData.marketTarget?.split(":")[0],
        );
        if (
          project &&
          projects[project.id].open &&
          project.id !== "airport" &&
          child.children[0]?.isMesh &&
          child.position.x === project.x &&
          child.position.z === project.z
        ) {
          child.clear();
          const mesh = productionReplica(child, {
            x: 0,
            z: 0,
            type: project.id,
            id: "prototype-" + project.id,
          });
          mesh.scale.set(
            project.width / 4.8,
            project.width / 4.8,
            project.depth / 4.8,
          );
        }
      }
    // Keep unfinished worksites out of the production skyline until selected.
    for (const child of root.children) {
      const id = child.userData.marketTarget?.split(":")[0];
      if (
        CITY_PROJECTS.some((p) => p.id === id) &&
        id !== activeSite &&
        !projects[id].open
      )
        child.visible = false;
    }
    productionVisibility();
    root.updateMatrixWorld(true);
    navigationDirty = true;
  }
  function productionVisibility() {
    if (!snapshot) return;
    const chapter = SYSTEM_CHAPTERS.find((c) => c.id === activeSite);
    const centre = (currentPractical() &&
      practicalCentre(currentPractical())) ??
      CITY_PROJECTS.find((p) => p.id === (chapter?.site ?? activeSite)) ??
      BUILDER_MISSIONS.find((m) => m.id === activeSite) ?? { x: 19.5, z: 15 };
    for (const [mesh, visible] of snapshot.assets)
      mesh.visible =
        visible &&
        !coverAsset(mesh, { activeSite, centre, view: cityView, projects });
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
    if (spec.extra || spec.mission || spec.system) return false;
    if (!spec.project)
      return state.opened && ["timber", "roofing"].includes(spec.id);
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
    const mission = BUILDER_MISSIONS.find((m) => m.id === activeSite);
    const system = SYSTEM_CHAPTERS.find((c) => c.id === activeSite);
    const chapter = BUILDER_CHAPTERS.find((c) => c.id === activeSite);
    const extra = currentPractical();
    const taskDone =
      chapter && (extra ? practical[extra.id].done : baseDone(chapter.id));
    const done = chapter && chapterDone(chapter.id);
    if (done && chapter.number === unlockedThrough)
      unlockedThrough = Math.min(12, unlockedThrough + 1);
    for (const c of BUILDER_CHAPTERS) {
      const option = [...picker.options].find((o) => o.value === c.id);
      option.disabled = c.number > unlockedThrough;
      option.textContent = `${option.disabled ? "Locked · " : chapterDone(c.id) ? "✓ " : ""}Chapter ${c.number} · ${c.name}`;
    }
    const heading = chapter
      ? `Chapter ${chapter.number}/12 · Challenge ${extra?.slot ?? 1}/3 · ${extra?.title ?? chapter.name}`
      : mission
        ? mission.name
        : project
          ? project.name
          : "Reopen the neighbourhood market";
    panel.querySelector(".hands-on-heading strong").textContent = heading;
    panel.setAttribute("aria-label", heading);
    panel.querySelector("[data-site]").value = activeSite;
    panel.querySelector("[data-reflection]").hidden = !taskDone;
    panel.querySelector("[data-reflection]").textContent = taskDone
      ? extra
        ? "Take it further: " + extra.reflection
        : "Think back: " + CHAPTER_REFLECTIONS[chapter.id]
      : "";
    const completed = done || (project && projects[project.id].open);
    const completionKey = chapter?.id ?? project?.id;
    if (!completed) celebrated.delete(completionKey);
    if (active && completed && !reveal && !celebrated.has(completionKey)) {
      celebrated.add(completionKey);
      const earned = chapter ? onChapterComplete(chapter.number) : 0;
      celebration.hidden = false;
      setMenu(false);
      celebration.querySelector("[data-celebration-title]").textContent =
        chapter
          ? `Chapter ${chapter.number} complete!`
          : `${project.name} is open!`;
      celebration.querySelector("[data-celebration-message]").textContent =
        chapter
          ? `${chapter.name}. Your tested work made a difference. ${earned ? `+${earned} Builder Credits. ` : ""}Look around and see what changed.`
          : `${project.benefit} Crews can now use your tested design across the city.`;
      celebration.querySelector("[data-celebration-next]").hidden = !chapter;
    }
    panel.querySelector("[data-chapter-next]").hidden = !taskDone;
    panel.querySelector("[data-chapter-next]").textContent =
      chapterCount() === 12
        ? "All 12 complete · explore your city"
        : !done
          ? `Continue to challenge ${(extra?.slot ?? 1) + 1} →`
          : "Continue to next chapter →";
    panel.querySelector("[data-reset]").textContent = extra
      ? "Restart this challenge"
      : system
        ? "Restart this chapter"
        : mission
          ? "Restart the three episode missions"
          : "Restart this worksite";
    panel.querySelector("[data-goal]").textContent = extra
      ? extra.goal
      : system
        ? systems[activeSite].done
          ? "Outcome tested. Continue to the next chapter or improve your design."
          : system.brief
        : mission
          ? episodeHint(episode, activeSite)
          : project
            ? constructionHint(projects, activeSite, state.carrying)
            : marketHint(state);
    panel.querySelector("[data-progress]").textContent = extra
      ? `${challengeCount()}/36 challenges · ${practicalReport(extra, practical[extra.id], practicalContext()).metrics}`
      : system
        ? `${challengeCount()}/36 challenges · ${chapterCount()}/12 chapters · ${chapterReadout(activeSite, systems[activeSite]).join(" · ")}`
        : mission
          ? `${challengeCount()}/36 challenges · ${chapterCount()}/12 chapters · ${episode[activeSite].done ? "Mission complete" : activeSite === "care" ? `Reception ${episode.care.reception} · Support ${episode.care.support} · Stock ${episode.care.stock}/2 · Reached staff ${episode.care.served}/4` : activeSite === "teach" ? `Demonstrations ${episode.teach.demonstrations} · Practice ${episode.teach.tools ? "ready" : "not ready"} · Clamp ${episode.teach.jig ? "fitted" : "not fitted"}` : "Find the cause and test the supply"}`
          : project
            ? `${projects[activeSite].stage}/3 build phases · ${projects[activeSite].open ? "Open · finished landscape" : "Test before opening"}`
            : `${state.roofs.filter(Boolean).length}/2 stalls sheltered · Entrance ${state.cart === "parking" ? "clear" : "blocked"} · Stock ${state.produce === "shelf" ? "safe" : "exposed"}`;
    missionParts.replaceChildren();
    if (chapter) {
      const labels = [
        { id: null, name: "1 · " + chapter.name },
        ...practicalForChapter(chapter.id).map((m) => ({
          id: m.id,
          name: `${m.slot} · ${m.title}`,
        })),
      ];
      labels.forEach((item, i) => {
        const button = document.createElement("button");
        button.textContent = item.name;
        button.disabled =
          i > 0 &&
          (!baseDone(chapter.id) || (i === 2 && !practical[labels[1].id].done));
        button.setAttribute("aria-current", String(item.id === activeExtra));
        button.onclick = () => selectTask(chapter.id, item.id);
        missionParts.append(button);
      });
      if (extra) {
        const steps = document.createElement("ol");
        for (const text of extra.steps) {
          const li = document.createElement("li");
          li.textContent = text;
          steps.append(li);
        }
        missionParts.append(steps);
      }
    }
    if (message !== undefined) {
      panel.querySelector("[data-status]").textContent = message;
    }
    panel.querySelector("[data-carry]").textContent = extra
      ? practical[extra.id].carrying
        ? `Carrying: ${practical[extra.id].carrying}`
        : "Hands free"
      : state.carrying === "cart"
        ? "Pushing the cart"
        : state.carrying
          ? `Carrying: ${state.carrying.startsWith("kit:") ? CITY_PROJECTS.find((p) => p.id === state.carrying.slice(4))?.kit : state.carrying === "roofing" ? "roof sheets" : state.carrying}`
          : "Hands free";
    panel.querySelector("[data-drop]").hidden =
      !state.carrying || state.carrying === "cart";
    panel.querySelector("[data-stop]").hidden = !waypoints.length;
    const nextWork = extra
      ? `${extra.id}:test`
      : system
        ? activeSite + ":test"
        : mission
          ? activeSite + ":test"
          : project
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
    nextButton.hidden = extra
      ? practical[extra.id].done
      : system
        ? systems[activeSite].done
        : mission
          ? episode[activeSite].done ||
            (activeSite === "teach" && episode.teach.running)
          : !project || projects[project.id].open;
    if (nextWork) {
      nextButton.textContent = objects.find((o) => o.id === nextWork).name;
      nextButton.dataset.action = nextWork;
    }
    nextButton.disabled = !!work || waypoints.length > 0;
    panel.querySelector("[data-crew]").textContent =
      `${replicas().length} crew-built parcels · Complete a prototype once to unlock a planned batch. Chapter outcomes grow the crew's reach to 70 planned parcels.`;
    panel.querySelector("[data-quest]").hidden = extra
      ? !practical[extra.id].done
      : system
        ? !systems[activeSite].done
        : mission
          ? !episode[activeSite].done
          : project
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
      accessible.hidden = !objectVisible(spec) || completedObject(spec);
      if (id === "investigate:valve" && episode.investigate.valveKnown)
        label = episode.investigate.valveOpen
          ? "Close the supply valve"
          : "Open the supply valve";
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
    if (spec) revealChange(id);
    if (spec?.extra) {
      const next = practicalAction(
        practical,
        spec.extra,
        spec.action,
        practicalContext(spec.extra),
      );
      practical = next.state;
      if (next.changed) {
        drawWorld();
        revealChange(id);
        cue(practical[spec.extra].done ? "built" : "tap");
      }
      updateUI(next.message);
      return;
    }
    if (spec?.system) {
      const next = systemAction(systems, spec.system, spec.action, {
        episode,
        market: state,
        systems,
        projects,
      });
      systems = next.state;
      if (next.changed) {
        drawWorld();
        revealChange(id);
        cue(systems[spec.system].done ? "built" : "tap");
      }
      updateUI(next.message);
      return;
    }
    if (spec?.mission) {
      const next = episodeAction(episode, state.carrying, id);
      episode = next.state;
      state = { ...state, carrying: next.carrying };
      if (next.changed) {
        drawWorld();
        revealChange(id);
        cue(next.completed ? "built" : "tap");
      }
      updateUI(next.message);
      return;
    }
    if (spec?.project) {
      const next = constructionAction(projects, state.carrying, id);
      projects = next.progress;
      state = { ...state, carrying: next.carrying };
      if (next.changed) {
        drawWorld();
        revealChange(id);
        cue(next.opened ? "built" : "tap");
      }
      updateUI(next.message);
      return;
    }
    const next = marketAction(state, id);
    state = next.state;
    if (next.changed) {
      drawWorld();
      revealChange(id);
      cue(next.report?.success ? "built" : "tap");
    }
    updateUI(next.message);
  }
  function request(id) {
    if (!active) return;
    celebration.hidden = true;
    reveal = null;
    setMenu(false);
    if (cityView) setCityView(false);
    const selected = objects.find((o) => o.id === id);
    if (!selected) return;
    const requestedChapter = BUILDER_CHAPTERS.find(
      (c) =>
        c.id ===
        (selected.chapter ??
          selected.system ??
          selected.mission ??
          (!selected.project ? "market" : null)),
    );
    if (requestedChapter && requestedChapter.number > unlockedThrough) {
      updateUI(`Finish Chapter ${unlockedThrough} to unlock the next chapter.`);
      return;
    }
    if (selected.extra) {
      const m = practicalById(selected.extra),
        previous = practicalForChapter(m.chapter)[0];
      if (
        !baseDone(m.chapter) ||
        (m.slot === 3 && !practical[previous.id].done)
      ) {
        updateUI(
          "Test the previous challenge in this chapter before starting this one.",
        );
        return;
      }
    }
    if (selected.mission && !missionUnlocked(episode, selected.mission)) {
      updateUI("Complete the previous episode mission first.");
      return;
    }
    const nextSite =
      selected.chapter ??
      selected.system ??
      selected.mission ??
      selected.project ??
      "market";
    if (nextSite !== activeSite || (selected.extra ?? null) !== activeExtra) {
      activeSite = nextSite;
      activeExtra = selected.extra ?? null;
      zoom = 1;
      drawWorld();
    }
    if (navigationDirty) {
      refreshNavigation();
      navigationDirty = false;
    }
    if (id === "produce" && state.produce === "shelf") {
      updateUI("The produce is already stored safely.");
      return;
    }
    const { approach } = positionFor(id);
    const planned = planRoute(
      approach,
      [...customers, ...celebrants, ...episodeResidents].map(
        (p) => p.g.position,
      ),
    );
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
    if (!pending) {
      updateUI("Ready. Tap a labelled city object or use the main action.");
      return;
    }
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
    if (cityView) setCityView(false);
    celebration.hidden = true;
    panel.classList.remove("city-overview");
    toolbar.querySelector("[data-city-view]").textContent = "View my city";
    setMenu(false);
    stop();
    const chosenChapter = BUILDER_CHAPTERS.find((c) => c.id === nextSite);
    if (chosenChapter && chosenChapter.number > unlockedThrough) {
      updateUI(`Finish Chapter ${unlockedThrough} to unlock the next chapter.`);
      return;
    }
    if (
      BUILDER_MISSIONS.some((m) => m.id === nextSite) &&
      !missionUnlocked(episode, nextSite)
    ) {
      updateUI("Complete the previous episode mission first.");
      return;
    }
    activeSite = nextSite;
    activeExtra = null;
    drawWorld();
    if (navigationDirty) {
      refreshNavigation();
      navigationDirty = false;
    }
    activeExtra = null;
    zoom = 1;
    reveal = null;
    drawWorld();
    walkToSite();
    updateUI(
      "Walking to your chosen worksite. Tap a labelled object to begin.",
    );
  };
  function walkToSite() {
    const extra = currentPractical();
    const point = extra
      ? PRACTICAL_OBJECTS.find((o) => o.extra === extra.id).approach
      : (CHAPTER_OBJECTS.find((o) => o.system === activeSite)?.approach ??
        EPISODE_OBJECTS.find((o) => o.mission === activeSite)?.approach ??
        (() => {
          const p = CITY_PROJECTS.find((p) => p.id === activeSite);
          return p ? { x: p.x - 4.8, z: p.z + 5.9 } : { x: 16.5, z: 18 };
        })());
    if (navigationDirty) {
      refreshNavigation();
      navigationDirty = false;
    }
    const plan = planRoute(
      point,
      [...customers, ...celebrants, ...episodeResidents].map(
        (p) => p.g.position,
      ),
    );
    if (plan) waypoints = [...plan.points];
  }
  function selectTask(chapter, id) {
    stop();
    if (cityView) setCityView(false);
    celebration.hidden = true;
    setMenu(false);
    activeSite = chapter;
    activeExtra = id;
    zoom = 1;
    reveal = null;
    drawWorld();
    walkToSite();
    updateUI(
      currentPractical()?.brief ?? "Return to the chapter’s first challenge.",
    );
  }
  panel.querySelector("[data-chapter-next]").onclick = () => {
    const chapter = BUILDER_CHAPTERS.find((c) => c.id === activeSite);
    if (chapter && !chapterDone(chapter.id)) {
      const next = practicalForChapter(chapter.id).find(
        (m) => !practical[m.id].done,
      );
      if (baseDone(chapter.id) && next) selectTask(chapter.id, next.id);
      return;
    }
    const next =
      chapterCount() === 12 ? null : BUILDER_CHAPTERS[unlockedThrough - 1];
    if (next) selectTask(next.id, null);
    else setCityView(true);
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
    if (activeExtra) {
      practical = {
        ...practical,
        [activeExtra]: freshPractical(currentPractical()),
      };
    } else if (systems[activeSite]) {
      systems = { ...systems, [activeSite]: newChapterSystems()[activeSite] };
    } else if (BUILDER_MISSIONS.some((m) => m.id === activeSite)) {
      episode = newEpisode();
      state = { ...state, carrying: null };
      activeSite = "investigate";
    } else if (activeSite === "market") state = newMarket();
    else {
      projects = {
        ...projects,
        [activeSite]: { stage: 0, open: false, tests: 0 },
      };
      state = { ...state, carrying: null };
    }
    drawWorld();
    updateUI(
      activeSite === "investigate"
        ? "Episode reset. Listen to the waiting residents to begin."
        : activeSite === "market"
          ? "Market reset. Collect timber to begin."
          : systems[activeSite]
            ? "Chapter reset. Adjust the city objects and test a useful outcome."
            : "Worksite reset. Collect its construction kit to begin.",
    );
  };
  function close() {
    stop();
    reveal = null;
    zoom = 1;
    if (welcome.open) welcome.close();
    if (frameCamera)
      frameCamera({
        view: false,
        focus: actor.g.position.clone(),
        yaw: cameraYaw,
        dt: 0,
      });
    active = false;
    if (overviewFar !== null) {
      const camera = getCamera();
      camera.far = overviewFar;
      camera.updateProjectionMatrix();
      overviewFar = null;
    }
    cityView = false;
    celebration.hidden = true;
    setMenu(false);
    root.visible = false;
    carry.visible = false;
    if (productionActionsParent && productionActions)
      productionActionsParent.insertBefore(
        productionActions,
        productionActionsNext?.parentNode === productionActionsParent
          ? productionActionsNext
          : null,
      );
    if (productionShopParent && productionShop)
      productionShopParent.insertBefore(
        productionShop,
        productionShopNext?.parentNode === productionShopParent
          ? productionShopNext
          : null,
      );
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
  productionShop?.addEventListener("click", () => {
    if (active) {
      stop();
      setMenu(false);
    }
  });
  const ray = new T.Raycaster(),
    pointer = new T.Vector2();
  let down = null,
    multiple = false;
  const pointers = new Map();
  let pinchSpan = null;
  canvas.addEventListener(
    "pointerdown",
    (e) => {
      if (!active) return;
      if (document.querySelector("dialog[open]")) return;
      reveal = null;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      canvas.setPointerCapture?.(e.pointerId);
      if (pointers.size > 1) {
        multiple = true;
        const [a, b] = [...pointers.values()];
        pinchSpan = Math.hypot(a.x - b.x, a.y - b.y);
      }
      down = { id: e.pointerId, x: e.clientX, y: e.clientY, lastX: e.clientX };
    },
    true,
  );
  canvas.addEventListener(
    "pointermove",
    (e) => {
      if (
        !active ||
        !pointers.has(e.pointerId) ||
        document.querySelector("dialog[open]")
      )
        return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const span = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchSpan && span > 0) changeZoom(pinchSpan / span);
        pinchSpan = span;
        return;
      }
      if (!down || pointers.size !== 1 || multiple) return;
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
      pinchSpan = null;
      multiple = false;
    },
    true,
  );
  canvas.addEventListener(
    "pointerup",
    (e) => {
      if (!active) return;
      pointers.delete(e.pointerId);
      pinchSpan = null;
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
        const planned = planRoute(
          point,
          [...customers, ...celebrants, ...episodeResidents].map(
            (p) => p.g.position,
          ),
        );
        stop();
        if (planned) {
          waypoints = [...planned.points];
          updateUI("Walking. Tap a worksite object when you are ready.");
        } else updateUI("Choose clear ground along the street.");
      }
    },
    true,
  );
  canvas.addEventListener(
    "wheel",
    (e) => {
      if (!active) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      changeZoom(Math.exp(e.deltaY * 0.001));
    },
    { capture: true, passive: false },
  );
  canvas.addEventListener(
    "lostpointercapture",
    (e) => {
      pointers.delete(e.pointerId);
      pinchSpan = null;
      if (!pointers.size) {
        down = null;
        multiple = false;
      }
    },
    true,
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (!active || document.querySelector("dialog[open]")) return;
      if (
        ["+", "=", "-", "_"].includes(e.key) &&
        !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
        changeZoom(["+", "="].includes(e.key) ? 0.84 : 1 / 0.84);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (cityView) setCityView(false);
        else if (reveal) reveal = null;
        else if (!celebration.hidden) celebration.hidden = true;
        else if (!menu.hidden) setMenu(false);
        else close();
      }
    },
    true,
  );
  const pause = () => {
    if (active) {
      stop();
      down = null;
      pointers.clear();
      pinchSpan = null;
      multiple = false;
      updateUI("Paused. Tap an object to continue.");
    }
  };
  window.addEventListener("blur", pause);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
  });
  let cameraYaw = 0.8;
  const focus = new T.Vector3();
  function tick(dt, camera) {
    if (document.querySelector("dialog[open]")) return;
    if (navigationDirty) {
      refreshNavigation();
      navigationDirty = false;
    }
    if (document.hidden) return;
    elapsed += dt;
    if (reveal) {
      reveal.elapsed += dt;
      if (reveal.elapsed >= reveal.duration) {
        reveal = null;
        updateUI();
      }
    }
    animatePractical(
      root,
      elapsed,
      reveal ? reveal.elapsed / reveal.duration : 1,
      reducedMotion(),
    );
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
          const around = safePersonStep(
            actor.g.position,
            candidate,
            residents(),
            walkClear,
            step,
          );
          if (
            Math.hypot(
              around.x - actor.g.position.x,
              around.z - actor.g.position.z,
            ) > 0.001
          ) {
            actor.g.position.x = around.x;
            actor.g.position.z = around.z;
            walking = true;
          }
          blockedFor += dt;
          if (blockedFor > 0.5) {
            const goal = waypoints.at(-1),
              detour = planRoute(
                goal,
                [...customers, ...celebrants, ...episodeResidents].map(
                  (p) => p.g.position,
                ),
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
    const independent = advanceApprentice(
      episode,
      dt,
      Math.hypot(actor.g.position.x + 17, actor.g.position.z - 9) > 2,
    );
    episode = independent.state;
    if (independent.finished) {
      drawWorld();
      revealChange("teach:test");
      updateUI(independent.message);
      cue(episode.teach.done ? "built" : "tap");
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
    for (const p of episodeResidents)
      if (p.g.userData.apprentice)
        p.arms.forEach(
          (a, i) =>
            (a.rotation.x = episode.teach.running
              ? Math.sin(elapsed * 12 + i) * 0.5
              : 0),
        );
    for (const c of celebrants)
      c.arms.forEach(
        (a, i) => (a.rotation.z = (i ? 1 : -1) * (state.opened ? 0.7 : 0.1)),
      );
    const selectedProject = CITY_PROJECTS.find((p) => p.id === activeSite);
    const selectedSystem = SYSTEM_CHAPTERS.find((c) => c.id === activeSite);
    const centre = (currentPractical() &&
      practicalCentre(currentPractical())) ??
      (selectedSystem &&
        CITY_PROJECTS.find((p) => p.id === selectedSystem.site)) ??
      selectedProject ??
      BUILDER_MISSIONS.find((m) => m.id === activeSite) ?? { x: 19.5, z: 15 };
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
    if (cityView) focus.set(0, 0, 0);
    if (frameCamera)
      camera =
        frameCamera({
          view: cityView,
          focus: reveal
            ? new T.Vector3(
                reveal.x * 0.5 + centre.x * 0.5,
                0,
                reveal.z * 0.5 + centre.z * 0.5,
              )
            : focus.clone(),
          yaw: reveal
            ? reveal.yaw +
              Math.sin((reveal.elapsed / reveal.duration) * Math.PI) * 0.18
            : cameraYaw,
          zoom: reveal
            ? zoom *
              (1 -
                0.22 * Math.sin((reveal.elapsed / reveal.duration) * Math.PI))
            : zoom,
          revealing: !!reveal,
          site: {
            x: centre.x,
            z: centre.z,
            width: selectedProject ? selectedProject.width + 6 : 14,
            depth: selectedProject ? selectedProject.depth + 6 : 14,
            height: selectedProject?.id === "tower" ? 18 : 5,
          },
          working: !!work,
          dt,
        }) ?? camera;
    else {
      const span = cityView
        ? Math.max(270, 320 / camera.aspect)
        : Math.max(
            selectedProject?.id === "tower" ? 36 : 26,
            17 / (2 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect),
          );
      if (cityView && camera.far < span * 2 + 100) {
        camera.far = span * 2 + 100;
        camera.updateProjectionMatrix();
      }
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
    }
    camera.updateMatrixWorld();
    const placedLabels = [];
    for (const spec of objects) {
      const { tag } = targets.get(spec.id),
        g = objectGroups.get(spec.id);
      if (!g) {
        tag.hidden = true;
        continue;
      }
      const v = new T.Vector3(
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
        cityView ||
        !celebration.hidden ||
        !!reveal ||
        !objectVisible(spec) ||
        completedObject(spec) ||
        !near ||
        v.z > 1 ||
        v.x < -0.93 ||
        v.x > 0.93 ||
        v.y < -0.45 ||
        v.y > 0.9 ||
        (spec.id === "produce" && state.carrying === "produce");
      if (tag.hidden) continue;
      const anchorX = (v.x * 0.5 + 0.5) * innerWidth,
        anchorY = (-v.y * 0.5 + 0.5) * innerHeight;
      const width = Math.min(146, innerWidth * 0.34),
        height = 48;
      let label = null;
      for (const [dx, dy] of [
        [0, -8],
        [-width * 0.65, -36],
        [width * 0.65, -36],
        [0, -68],
        [-width * 0.75, 24],
        [width * 0.75, 24],
        [0, 56],
        [-width, -100],
        [width, -100],
      ]) {
        const x = Math.max(
          width / 2 + 10,
          Math.min(innerWidth - width / 2 - 10, anchorX + dx),
        );
        const y = Math.max(180, Math.min(innerHeight * 0.59, anchorY + dy));
        if (
          placedLabels.every(
            (p) =>
              Math.abs(p.x - x) > width + 4 || Math.abs(p.y - y) > height + 4,
          )
        ) {
          label = { x, y };
          break;
        }
      }
      if (!label) {
        tag.hidden = true;
        continue;
      } // All objects remain in menu controls and on the scene itself.
      placedLabels.push(label);
      tag.style.left = `${label.x}px`;
      tag.style.top = `${label.y}px`;
      tag.style.setProperty("--target-dx", `${anchorX - label.x}px`);
      tag.style.setProperty("--target-dy", `${anchorY - label.y + height}px`);
    }
    panel.querySelector("[data-stop]").hidden = !waypoints.length;
    panel.querySelector("[data-next]").disabled =
      !!work || waypoints.length > 0;
  }
  return {
    openMenu() {
      stop();
      setMenu(true);
      const controls = menu.querySelector("details");
      if (controls) controls.open = true;
    },
    resetCamera() {
      cameraYaw = 0.8;
      zoom = 1;
      reveal = null;
      focus.copy(actor.g.position);
      tick(0, getCamera());
    },
    get active() {
      return active;
    },
    get state() {
      return state;
    },
    get systems() {
      return systems;
    },
    get chaptersCompleted() {
      return chapterCount();
    },
    get challengesCompleted() {
      return challengeCount();
    },
    get practical() {
      return practical;
    },
    get currentChallenge() {
      return activeExtra;
    },
    get cameraState() {
      return { zoom, revealing: !!reveal, cityView };
    },
    get episode() {
      return episode;
    },
    get replicas() {
      return replicas();
    },
    get projects() {
      return projects;
    },
    get residents() {
      return [
        ...getResidents(),
        ...customers,
        ...celebrants,
        ...episodeResidents,
      ];
    },
    get moving() {
      return !!(waypoints.length || work || episode.teach.running);
    },
    open() {
      if (active) return;
      snapshot = {
        position: actor.g.position.clone(),
        rotation: actor.g.rotation.y,
        assets: (typeof marketAssets === "function"
          ? marketAssets()
          : marketAssets
        ).map((mesh) => [mesh, mesh.visible]),
      };
      enter();
      active = true;
      cityView = false;
      panel.classList.remove("city-overview");
      toolbar.querySelector("[data-city-view]").textContent = "View my city";
      root.visible = true;
      carry.visible = true;
      productionVisibility();
      if (productionShop) toolbar.append(productionShop);
      if (productionActions) toolbar.append(productionActions);
      panel.hidden = false;
      tags.hidden = false;
      document.body.classList.add("hands-on-active");
      drawWorld();
      refreshNavigation();
      navigationDirty = false;
      focus.copy(actor.g.position);
      updateUI(
        BUILDER_MISSIONS.find((m) => m.id === activeSite)?.brief ??
          "Choose a meaningful task or a construction worksite.",
      );
      if (!welcomeSeen) {
        setCityView(true);
        welcome.showModal();
      } else {
        walkToSite();
        tick(0, getCamera());
        toolbar.querySelector("[data-menu]").focus();
      }
    },
    tick,
    close,
    request,
    report: () => marketReport(state),
  };
}
