// Authored physical consequences. Order follows stable option IDs, never UI shuffle.
import { CITY_CASES } from "./cases.mjs";
const catalogue = {
  "repair-queue": ["queue+bench", "bench+bench", "machine"],
  "repair-parts": ["shelves+board", "crates+crates", "empty-shelves"],
  "repair-training": ["bench+tools", "board+seats", "bench"],
  "repair-waste": ["bins+parts", "burn-pit", "crates+crates"],
  "power-evening": ["solar+battery", "street-lights", "generator"],
  "power-upkeep": ["tools+board", "broken-generator", "generator+barrier"],
  "power-clinic": ["battery+meter", "board", "barrier"],
  "power-demand": ["meter+board", "generator+generator", "barrier"],
  "food-harvest": ["store+crates", "crates+crates", "spoiled-food"],
  "food-small-suppliers": ["desk+board", "empty-desk", "desk+barrier"],
  "food-waste": ["bins+compost", "crates", "spoiled-food"],
  "food-route": ["route+loading", "route+barrier", "empty-board"],
  "learn-equal-parts": ["fractions+desk", "board+seats", "board"],
  "learn-dark-class": [
    "solar+street-lights",
    "unlit-class",
    "barrier+unlit-class",
  ],
  "learn-access": ["ramp+desk", "seats", "empty-desk"],
  "learn-feedback": ["desk+board", "ranking", "board+board"],
  "homes-materials": ["homes+drain", "unfinished-homes+water", "villa+barrier"],
  "homes-upkeep": ["tools+board", "broken-homes", "desk+barrier"],
  "water-breakdown": ["pump+tools", "broken-pump", "pump+barrier"],
  "water-sanitation": ["drain+pump", "water+broken-pump", "board+water"],
  "clinic-arrival": ["clinic+ramp", "board", "clinic+barrier"],
  "clinic-supply": [
    "medical-store+board",
    "crates+medical-store",
    "empty-shelves",
  ],
  "transit-delivery": ["loading+route", "loading+loading", "board"],
  "transit-people": ["crossing+street-lights", "road", "barrier"],
  "tech-booking": ["kiosk+seats", "computers+computers", "computers+crates"],
  "tech-reliability": ["kiosk+board", "broken-kiosk", "crates+computers"],
  "enterprise-trust": ["shop+board", "shop+crates", "empty-shop"],
  "enterprise-cash": ["desk+board", "desk+crates", "empty-desk"],
  "green-drainage": ["drain+garden", "road+water", "water"],
  "green-waste": ["bins+compost", "crates+spoiled-food", "burn-pit"],
  "civic-voices": ["seats+board", "stage", "barrier+board"],
  "civic-repairs": ["kiosk+tools", "board+board", "empty-board"],
  "creative-fairpay": ["stage+desk", "stage", "stage+barrier"],
  "creative-audience": ["kiosk+stage", "board", "stage+barrier"],
  "industry-spares": ["factory+tools", "machine+crates", "store+crates"],
  "industry-workers": ["bench+tools", "machine+barrier", "machine+machine"],
};
export function infrastructurePlan(caseId, choiceId) {
  const scenario = CITY_CASES.find((item) => item.id === caseId);
  const index =
    scenario?.options.findIndex((item) => item.id === choiceId) ?? -1;
  if (index < 0 || !catalogue[caseId]) return null;
  return {
    caseId,
    choiceId,
    title: scenario.options[index].title,
    assets: catalogue[caseId][index].split("+"),
    condition: index === 0 ? "planned" : "tradeoff",
  };
}

// Small reusable components: no textures, new downloads, or per-frame allocation.
export function constructInfrastructure({ plan, box, cyl, parent, scale = 1 }) {
  const pieces = [];
  function B(w, h, d, c, x, y, z) {
    const m = box(w, h, d, c, x, y, z, parent);
    m.userData.ignoreNavigation = true;
    pieces.push(m);
    return m;
  }
  function C(r, h, c, x, y, z) {
    const m = cyl(r, h, c, x, y, z, parent, r, 8);
    m.userData.ignoreNavigation = true;
    pieces.push(m);
    return m;
  }
  const cream = 0xe6d5b5,
    blue = 0x517c90,
    wood = 0x9c7652,
    green = 0x61987c;
  const groupScale = scale;
  parent.scale.setScalar(groupScale);
  for (const [index, raw] of plan.assets.entries()) {
    const x = (index - (plan.assets.length - 1) / 2) * 1.12;
    const type = raw.replace(/^(empty-|broken-|unfinished-)/, "");
    const broken = raw.startsWith("broken-"),
      empty = raw.startsWith("empty-");
    const c = broken ? 0x9b7c6b : cream;
    B(1.04, 0.08, 1.25, 0xb8ac92, x, 0.04, 0);
    switch (type) {
      case "homes":
      case "villa":
      case "clinic":
      case "shop":
      case "factory":
      case "store":
      case "medical-store":
      case "unlit-class": {
        const h = type === "factory" ? 1.15 : type === "villa" ? 1.4 : 0.9;
        if (raw.startsWith("unfinished-")) {
          for (const dx of [-0.43, 0.43])
            for (const z of [-0.45, 0.45])
              B(0.1, 0.85, 0.1, wood, x + dx, 0.5, z);
        } else B(0.96, h, 0.95, c, x, h / 2 + 0.08, 0);
        B(
          1.08,
          0.14,
          1.09,
          type === "clinic" ? 0xb75d64 : blue,
          x,
          h + 0.14,
          0,
        );
        B(0.23, 0.57, 0.05, wood, x, 0.38, 0.5);
        for (const dx of [-0.31, 0.31])
          B(
            0.19,
            0.25,
            0.05,
            type === "unlit-class" ? 0x454f56 : 0x7eaeb7,
            x + dx,
            0.65,
            0.5,
          );
        if (type === "clinic" || type === "medical-store") {
          B(0.4, 0.09, 0.05, 0xc75460, x, 1.15, 0.56);
          B(0.09, 0.4, 0.05, 0xc75460, x, 1.15, 0.56);
        }
        if (type === "factory") C(0.1, 0.8, 0x8a8176, x + 0.33, 1.55, -0.3);
        if (type === "shop") B(1.1, 0.12, 0.45, 0xe2b55c, x, 0.98, 0.54);
        break;
      }
      case "solar":
        for (const dx of [-0.4, 0.4]) B(0.07, 0.65, 0.08, wood, x + dx, 0.4, 0);
        for (const z of [-0.28, 0.28])
          B(0.95, 0.08, 0.48, 0x375b85, x, 0.79, z);
        break;
      case "battery":
      case "generator":
      case "machine":
        B(0.84, 0.65, 0.67, broken ? 0x997d70 : blue, x, 0.42, 0);
        for (const dx of [-0.26, 0.26])
          B(0.12, 0.4, 0.06, 0xbad1b6, x + dx, 0.48, 0.37);
        if (type !== "battery") C(0.2, 0.15, 0x424f56, x, 0.87, 0);
        break;
      case "pump":
        C(0.34, 0.85, broken ? wood : blue, x, 0.55, 0);
        B(0.58, 0.1, 0.12, 0x677b7e, x + 0.2, 1.03, 0.08);
        C(0.04, 0.65, 0x677b7e, x + 0.45, 0.7, 0.08);
        break;
      case "water":
        B(0.98, 0.02, 1.1, 0x6397ac, x, 0.11, 0);
        break;
      case "drain":
        B(0.85, 0.12, 1.1, 0x719ca1, x, 0.18, 0);
        for (let z = -0.4; z <= 0.4; z += 0.2)
          B(0.86, 0.035, 0.06, 0x586a6c, x, 0.26, z);
        break;
      case "garden":
      case "compost":
        B(0.85, 0.2, 1, wood, x, 0.18, 0);
        for (const dx of [-0.25, 0, 0.25])
          C(0.12, 0.23, green, x + dx, 0.39, 0);
        break;
      case "road":
      case "crossing":
      case "route":
      case "loading":
        B(0.98, 0.07, 1.1, 0x5f7077, x, 0.16, 0);
        if (type === "crossing")
          for (const z of [-0.35, -0.12, 0.12, 0.35])
            B(0.83, 0.02, 0.12, 0xf1e4c8, x, 0.21, z);
        else
          for (const z of [-0.3, 0.3]) B(0.08, 0.02, 0.2, 0xe7c975, x, 0.21, z);
        if (type === "route") {
          B(0.06, 0.9, 0.06, wood, x + 0.35, 0.6, -0.36);
          B(0.58, 0.25, 0.08, blue, x + 0.18, 1.02, -0.36);
        }
        if (type === "loading") B(0.8, 0.3, 0.65, wood, x, 0.36, 0);
        break;
      case "ramp": {
        const r = B(0.86, 0.13, 1.05, 0xa6a69a, x, 0.26, 0);
        r.rotation.x = -0.22;
        for (const dx of [-0.44, 0.44])
          B(0.04, 0.65, 1, 0x71868c, x + dx, 0.46, 0);
        break;
      }
      case "bins":
        for (const dx of [-0.3, 0, 0.3]) {
          B(
            0.25,
            0.55,
            0.45,
            [green, blue, 0xc5a35a][Math.round((dx + 0.3) / 0.3)],
            x + dx,
            0.36,
            0,
          );
          B(0.27, 0.06, 0.48, 0x596e68, x + dx, 0.66, 0);
        }
        break;
      case "crates":
      case "parts":
      case "spoiled-food":
        for (let n = 0; n < 4; n++) {
          B(
            0.4,
            0.25,
            0.4,
            type === "spoiled-food" ? 0x85764d : wood,
            x + (n % 2) * 0.44 - 0.22,
            0.21 + Math.floor(n / 2) * 0.26,
            0,
          );
        }
        break;
      case "burn-pit":
        C(0.46, 0.14, 0x5d5852, x, 0.18, 0);
        for (const dx of [-0.2, 0, 0.2])
          B(0.16, 0.26, 0.18, 0xb5653d, x + dx, 0.37, 0);
        break;
      case "shelves":
        for (const dx of [-0.42, 0.42])
          B(0.07, 1.1, 0.65, wood, x + dx, 0.65, 0);
        for (const y of [0.25, 0.65, 1.05]) {
          B(0.92, 0.07, 0.65, wood, x, y, 0);
          if (!empty)
            for (const dx of [-0.25, 0.25])
              B(0.22, 0.2, 0.3, blue, x + dx, y + 0.14, 0);
        }
        break;
      case "street-lights":
        C(0.045, 1.5, 0x61777e, x, 0.84, 0);
        B(0.72, 0.08, 0.3, 0xf3d580, x, 1.62, 0);
        break;
      case "barrier":
        for (const dx of [-0.38, 0.38])
          B(0.08, 0.6, 0.08, wood, x + dx, 0.4, 0.2);
        B(0.95, 0.12, 0.1, 0xce9953, x, 0.65, 0.2);
        break;
      case "seats":
        for (const z of [-0.3, 0.3]) {
          B(0.9, 0.12, 0.32, wood, x, 0.4, z);
          for (const dx of [-0.32, 0.32])
            B(0.08, 0.3, 0.1, 0x687b7d, x + dx, 0.22, z);
        }
        break;
      case "stage":
        B(0.95, 0.25, 1, 0x8e7492, x, 0.25, 0);
        for (const dx of [-0.43, 0.43])
          B(0.07, 1.15, 0.08, wood, x + dx, 0.86, -0.43);
        B(1.05, 0.08, 0.35, 0xd8b478, x, 1.45, -0.43);
        break;
      case "kiosk":
      case "computers":
      case "meter":
        B(0.85, 0.12, 0.65, wood, x, 0.6, 0);
        B(0.12, 0.5, 0.12, wood, x, 0.3, 0);
        B(0.65, 0.5, 0.12, broken ? 0x484c4e : blue, x, 0.96, -0.1);
        B(0.5, 0.33, 0.04, broken ? 0x7b6b68 : 0x8dc3c9, x, 0.98, -0.02);
        break;
      case "desk":
      case "bench":
      case "tools":
        B(0.95, 0.12, 0.7, wood, x, 0.67, 0);
        for (const dx of [-0.36, 0.36])
          B(0.08, 0.56, 0.12, 0x667777, x + dx, 0.36, 0);
        if (!empty) {
          B(
            0.4,
            0.06,
            0.26,
            type === "tools" ? 0x668d9e : 0xece6ce,
            x,
            0.78,
            0,
          );
          if (type === "bench") C(0.13, 0.25, blue, x + 0.2, 0.92, 0);
        }
        break;
      case "board":
      case "fractions":
      case "ranking":
      case "queue":
        for (const dx of [-0.35, 0.35])
          B(0.06, 0.95, 0.08, wood, x + dx, 0.55, 0);
        B(0.95, 0.65, 0.09, empty ? 0x7d827b : blue, x, 0.97, 0);
        if (!empty)
          for (let n = 0; n < 4; n++)
            B(
              0.14,
              type === "ranking" ? 0.1 + n * 0.1 : 0.18,
              0.035,
              n % 2 ? 0xf0dcac : 0xb6d4bd,
              x - 0.32 + n * 0.21,
              0.95,
              0.07,
            );
        break;
      default:
        throw new Error("Missing infrastructure asset: " + raw);
    }
  }
  // Each component appears from the foundation upward during the build reveal.
  pieces.sort((a, b) => a.position.y - b.position.y);
  return pieces;
}
