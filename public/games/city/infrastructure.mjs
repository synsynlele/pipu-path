export { infrastructurePlan } from "./construction-plans.mjs";
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
  const blue = 0x517c90,
    wood = 0x9c7652,
    green = 0x61987c;
  function equipmentTable(x, color = wood) {
    B(1.12, 0.1, 0.7, color, x, 0.77, 0.15);
    for (const dx of [-0.43, 0.43])
      B(0.08, 0.7, 0.1, 0x566975, x + dx, 0.39, 0.15);
  }
  function cross(x, y, z, color = 0xc84c58, size = 0.5) {
    B(size, 0.13, 0.05, color, x, y, z);
    B(0.13, size, 0.05, color, x, y, z);
  }
  function gate() {
    for (const x of [-0.4, 0.4]) B(0.05, 0.48, 0.06, 0x925b50, x, 0.32, 0.86);
    B(0.85, 0.07, 0.06, 0xcd8b5c, 0, 0.55, 0.86);
  }
  function facility(type) {
    const facilityTypes = [
      "housing-court",
      "unfinished-housing",
      "luxury-home",
      "housing-service",
      "gated-service",
      "waterworks",
      "damaged-waterworks",
      "gated-waterworks",
      "water-treatment",
      "health-centre",
      "private-clinic",
      "pharmacy",
      "overstocked-pharmacy",
      "logistics-depot",
      "accessible-transit",
      "fast-road",
      "technology-hub",
      "unfinished-tech",
      "offline-centre",
      "disconnected-centre",
      "unattended-centre",
      "market-shop",
      "discount-shop",
      "enterprise-office",
      "drainage-basin",
      "sealed-yard",
      "recycling-centre",
      "civic-hall",
      "exclusive-hall",
      "service-depot",
      "arts-centre",
      "unpaid-stage",
      "copied-stage",
      "media-studio",
      "exclusive-stage",
      "manufacturing-workshop",
      "unsafe-factory",
      "unused-goods",
      "skills-workshop",
      "robot-workshop",
    ];
    if (!facilityTypes.includes(type)) return false;
    const medical = [
      "health-centre",
      "private-clinic",
      "pharmacy",
      "overstocked-pharmacy",
    ].includes(type);
    const tech = [
      "technology-hub",
      "unfinished-tech",
      "offline-centre",
      "disconnected-centre",
      "unattended-centre",
    ].includes(type);
    const industrial = [
      "manufacturing-workshop",
      "unsafe-factory",
      "unused-goods",
      "skills-workshop",
      "robot-workshop",
      "service-depot",
      "housing-service",
      "gated-service",
    ].includes(type);
    B(2.4, 0.08, 1.92, 0xc8c3ae, 0, 0.04, 0);
    if (type === "accessible-transit" || type === "fast-road") {
      B(1.74, 0.035, 1.9, 0x65777f, 0, 0.08, 0);
      if (type === "accessible-transit") {
        for (const z of [-0.65, -0.4, -0.15, 0.1, 0.35, 0.6])
          B(1.7, 0.02, 0.12, 0xf3e9d1, 0, 0.12, z);
        for (const x of [-1.12, 1.12]) {
          B(0.17, 0.1, 1.8, 0xd3cab3, x, 0.13, 0);
          C(0.025, 1.6, 0x627d8b, x, 0.86, 0.65);
          B(0.18, 0.27, 0.12, 0xe6bd60, x, 1.65, 0.65);
        }
      } else {
        for (const x of [-0.42, 0.42]) B(0.06, 0.02, 0.6, 0xe4be67, x, 0.12, 0);
      }
      return true;
    }
    if (
      [
        "waterworks",
        "damaged-waterworks",
        "gated-waterworks",
        "water-treatment",
      ].includes(type)
    ) {
      for (const x of [-0.65, 0.65]) {
        C(
          0.45,
          1.15,
          type === "damaged-waterworks" ? 0x9a8c7a : 0x78aab6,
          x,
          0.68,
          -0.3,
        );
        C(0.49, 0.12, 0x365e78, x, 1.3, -0.3);
        for (const z of [-0.57, -0.03])
          B(0.06, 0.5, 0.06, 0x657c86, x, 0.31, z);
      }
      B(1.8, 0.12, 0.13, 0x5f8494, 0, 0.38, 0.45);
      for (const x of [-0.72, 0.72]) {
        C(0.035, 0.5, 0x647e8a, x, 0.64, 0.45);
        B(0.25, 0.05, 0.07, 0xe3be65, x, 0.91, 0.45);
      }
      if (type === "water-treatment") {
        B(1.9, 0.06, 0.45, 0x5a99af, 0, 0.16, 0.68);
        for (let x = -0.8; x < 1; x += 0.4)
          B(0.16, 0.05, 0.46, 0xb2c9c5, x, 0.22, 0.68);
      }
      if (type === "damaged-waterworks") {
        B(0.8, 0.03, 0.38, 0x6f9eac, 0.55, 0.13, 0.5);
        gate();
      }
      if (type === "gated-waterworks") gate();
      return true;
    }
    if (type === "drainage-basin" || type === "sealed-yard") {
      B(
        2.2,
        0.08,
        1.65,
        type === "sealed-yard" ? 0x879598 : 0x84a68b,
        0,
        0.11,
        0,
      );
      B(1.7, 0.025, 0.75, 0x649faf, 0, 0.17, 0);
      if (type === "drainage-basin")
        for (const x of [-1.03, 1.03]) {
          B(0.13, 0.16, 1.7, 0x678483, x, 0.2, 0);
          for (const z of [-0.6, 0, 0.6]) C(0.13, 0.25, green, x, 0.4, z);
        }
      return true;
    }
    if (type === "recycling-centre") {
      for (const [i, color] of [green, 0x5f87aa, 0xceac58].entries()) {
        const x = -0.7 + i * 0.7;
        B(0.6, 0.6, 1, color, x, 0.42, -0.1);
        B(0.63, 0.08, 1.05, 0x506d72, x, 0.76, -0.1);
      }
      for (const x of [-1.05, 1.05])
        B(0.06, 1.4, 0.06, 0x668273, x, 0.79, -0.7);
      B(2.25, 0.12, 0.38, green, 0, 1.52, -0.7);
      for (let x = -0.85; x <= 0.85; x += 0.42)
        B(0.25, 0.1, 0.25, 0xa2b29e, x, 0.24, 0.7);
      return true;
    }
    if (["housing-court", "unfinished-housing", "luxury-home"].includes(type)) {
      const homes = type === "luxury-home" ? [0] : [-0.6, 0.6];
      for (const x of homes) {
        const width = type === "luxury-home" ? 1.8 : 0.98;
        if (type === "unfinished-housing") {
          for (const dx of [-0.43, 0.43])
            for (const z of [-0.65, 0.15])
              B(0.08, 0.75, 0.08, wood, x + dx, 0.49, z);
          B(0.95, 0.1, 0.9, 0xb7a18b, x, 0.21, -0.25);
        } else {
          B(width, 0.98, 1.1, 0xe2c2a1, x, 0.61, -0.23);
          for (const side of [-1, 1]) {
            const roof = B(
              width * 0.58,
              0.1,
              1.24,
              0x926750,
              x + side * width * 0.25,
              1.23,
              -0.23,
            );
            roof.rotation.z = side * -0.4;
          }
          B(0.25, 0.65, 0.06, 0x586c78, x, 0.43, 0.35);
          for (const dx of [-0.3, 0.3])
            B(0.18, 0.22, 0.06, 0x7caeb5, x + dx, 0.83, 0.35);
        }
      }
      if (type === "unfinished-housing")
        B(1.9, 0.025, 0.45, 0x6f9eaf, 0, 0.14, 0.56);
      else B(2, 0.04, 0.37, 0xe8dfc9, 0, 0.14, 0.68);
      return true;
    }
    if (
      [
        "arts-centre",
        "unpaid-stage",
        "copied-stage",
        "exclusive-stage",
      ].includes(type)
    ) {
      B(2.15, 0.24, 1.45, 0x8f7194, 0, 0.22, -0.12);
      for (const x of [-0.98, 0.98]) {
        B(0.06, 1.65, 0.06, 0x687d8a, x, 1.02, -0.68);
        B(0.15, 0.4, 0.15, 0x454c5c, x, 0.57, 0.3);
      }
      B(2.2, 0.15, 1.5, 0xc79e75, 0, 1.88, -0.12);
      for (let x = -0.6; x < 0.8; x += 0.6)
        B(0.36, 0.18, 0.22, 0xb59974, x, 0.24, 0.8);
      if (type === "exclusive-stage" || type === "copied-stage") gate();
      if (type === "unpaid-stage") B(0.6, 0.03, 0.3, 0xb8aea1, 0.5, 0.38, 0.5);
      return true;
    }
    if (type === "unfinished-tech") {
      for (const x of [-1, 0, 1])
        for (const z of [-0.7, 0.5]) B(0.07, 1.65, 0.07, 0x718a98, x, 0.91, z);
      B(2.2, 0.1, 0.1, 0x718a98, 0, 1.75, -0.7);
      B(0.9, 0.65, 0.7, 0x7e8f9c, 0, 0.44, -0.1);
      B(0.65, 0.4, 0.08, 0x566470, 0, 0.95, 0.25);
      gate();
      return true;
    }
    if (industrial) {
      // Open industrial bays expose machinery; they cannot be mistaken for homes.
      B(2.18, 1.3, 0.12, 0x8ea2a6, 0, 0.75, -0.75);
      for (const x of [-1.02, 1.02])
        for (const z of [-0.7, 0.65]) B(0.09, 1.45, 0.1, 0x546f80, x, 0.82, z);
      for (const side of [-1, 1]) {
        const roof = B(
          1.2,
          0.12,
          1.65,
          type === "unsafe-factory" ? 0x936b5b : 0x547b8c,
          side * 0.52,
          1.64,
          -0.05,
        );
        roof.rotation.z = side * -0.22;
      }
      for (const x of [-0.65, 0.65]) {
        B(0.68, 0.6, 0.65, 0x547d8f, x, 0.46, -0.16);
        B(0.7, 0.07, 0.7, 0xbac8bd, x, 0.8, -0.16);
        C(0.16, 0.12, 0xe0b56b, x, 1.01, -0.16);
      }
      if (type === "skills-workshop") {
        for (const x of [-0.65, 0.65]) {
          B(0.2, 0.3, 0.05, 0xe0b26b, x, 1.12, -0.64);
          B(0.07, 0.18, 0.08, 0xc2d6da, x + 0.2, 0.96, -0.56);
        }
      }
      if (type === "robot-workshop")
        for (const x of [-0.65, 0.65]) {
          B(0.09, 0.63, 0.1, 0xe1b35e, x, 0.91, 0.16);
          B(0.35, 0.09, 0.1, 0xe1b35e, x + 0.13, 1.25, 0.16);
        }
      if (type === "manufacturing-workshop") {
        B(0.5, 0.11, 0.28, 0xe1c178, 0, 0.5, 0.64);
        B(0.1, 0.38, 0.11, 0x607c87, 0, 0.7, 0.64);
      }
      if (type === "unsafe-factory") gate();
      if (type === "unused-goods")
        for (const x of [-0.7, 0, 0.7])
          B(0.38, 0.32, 0.35, 0xa27b5b, x, 0.3, 0.65);
      if (type === "gated-service") gate();
      return true;
    }
    // Civic, enterprise, medical and technology buildings use distinct facades,
    // roofs and equipment rather than a renamed generic house silhouette.
    B(
      2.18,
      1.35,
      1.25,
      medical ? 0xf0ece1 : tech ? 0xc1d5dd : 0xd9c6a6,
      0,
      0.8,
      -0.22,
    );
    B(
      2.35,
      0.13,
      1.5,
      medical ? 0x6c99a4 : tech ? 0x395f89 : 0x7c8c71,
      0,
      1.53,
      -0.18,
    );
    B(1, 0.09, 0.53, medical ? 0x80b4b4 : 0xe5ba62, 0, 1.17, 0.62);
    B(0.6, 0.95, 0.07, 0x5b8a9f, 0, 0.61, 0.45);
    for (const x of [-0.73, 0.73]) {
      B(0.46, 0.62, 0.07, tech ? 0x4e91b5 : 0x81aeb6, x, 0.99, 0.45);
      B(0.035, 0.62, 0.08, 0xe3dfcd, x, 1, 0.49);
    }
    if (medical) {
      cross(-0.7, 1.58, 0.59, 0xc45361, 0.48);
      B(0.65, 0.025, 0.16, 0xc45361, 0.55, 1.62, -0.2);
      B(0.16, 0.025, 0.65, 0xc45361, 0.55, 1.62, -0.2);
      const ramp = B(0.65, 0.09, 0.52, 0xbdc6bd, 0, 0.18, 0.66);
      ramp.rotation.x = -0.12;
      for (const x of [-0.42, 0.42])
        B(0.045, 0.32, 0.53, 0x748e95, x, 0.36, 0.66);
      if (type.includes("pharmacy"))
        for (const x of [-0.82, -0.55, 0.55, 0.82]) {
          C(0.045, 0.13, 0x81bda5, x, 0.58, 0.67);
          C(0.047, 0.035, 0xf2e9ce, x, 0.66, 0.67);
        }
      if (type === "overstocked-pharmacy")
        for (const x of [-0.8, 0.8]) B(0.34, 0.3, 0.32, wood, x, 0.25, 0.67);
      if (type === "private-clinic") gate();
    } else if (tech) {
      for (const x of [-0.72, 0.72]) {
        B(0.26, 0.65, 0.2, 0x476681, x, 0.45, 0.7);
        B(
          0.22,
          0.25,
          0.03,
          type === "disconnected-centre" ? 0x4a5057 : 0x82c4cb,
          x,
          0.68,
          0.82,
        );
      }
      C(0.025, 0.7, 0x617e94, 0.8, 1.9, -0.6);
      B(0.35, 0.04, 0.14, 0xb8d0d1, 0.8, 2.2, -0.6);
      // Circuit motif is geometry, visible from both street and aerial cameras.
      B(0.68, 0.05, 0.52, 0x345a7e, 0, 1.64, -0.25);
      for (const x of [-0.42, 0.42])
        for (const z of [-0.42, -0.25, -0.08])
          B(0.13, 0.045, 0.045, 0xc5d5c5, x, 1.65, z);
      if (type === "offline-centre") {
        B(0.48, 0.07, 0.35, 0x385b89, -0.64, 1.66, -0.4);
        B(0.5, 0.25, 0.3, wood, 0, 0.24, 0.7);
      }
      if (type === "disconnected-centre")
        B(0.24, 0.04, 0.04, 0xca795d, -0.72, 0.68, 0.84);
      if (type === "unattended-centre")
        B(0.5, 0.3, 0.27, 0x7b898e, 0, 0.26, 0.7);
    } else if (type === "civic-hall" || type === "exclusive-hall") {
      for (const x of [-0.9, -0.45, 0.45, 0.9])
        B(0.09, 1.25, 0.09, 0xf0e1c3, x, 0.78, 0.63);
      B(2.3, 0.2, 0.55, 0xbfa882, 0, 1.69, 0.53);
      if (type === "exclusive-hall") gate();
    } else if (type === "media-studio") {
      C(0.035, 0.65, 0x61778e, 0.75, 1.9, -0.6);
      B(0.5, 0.16, 0.4, 0x688aa0, 0.75, 2.2, -0.6);
      B(0.44, 0.6, 0.05, 0x294c70, -0.73, 0.98, 0.51);
      for (const y of [0.83, 0.98, 1.13])
        B(0.28, 0.04, 0.04, 0xe2c587, -0.73, y, 0.56);
    } else {
      B(2.2, 0.2, 0.5, 0xdab26a, 0, 1.21, 0.55);
      for (const x of [-0.8, 0.8]) B(0.33, 0.3, 0.35, wood, x, 0.27, 0.69);
    }
    return true;
  }
  const aliases = {
    "parts-store": "shelves",
    "overstocked-parts": "shelves",
    "maintenance-tools": "tools",
    "load-meter": "meter",
    "supplier-desk": "desk",
    "food-sorting": "bins",
    "fraction-kit": "fractions",
    "accessible-kit": "access-kit",
    "worksheet-desk": "desk",
    "feedback-desk": "feedback-kit",
    "repair-backlog": "scrap-pile",
    "unsafe-food": "spoiled-food",
    "dispatch-map": "route",
    "flooded-route": "flood-route",
    "clinic-advert": "advert",
    "locked-kiosk": "privacy-gate",
  };
  const groupScale = scale;
  parent.scale.setScalar(groupScale);
  for (const [index, raw] of plan.assets.entries()) {
    const x = (index - (plan.assets.length - 1) / 2) * 1.12;
    if (facility(raw)) continue;
    const type =
      aliases[raw] ?? raw.replace(/^(empty-|broken-|unfinished-)/, "");
    const broken = raw.startsWith("broken-"),
      empty = raw.startsWith("empty-");
    B(1.04, 0.08, 1.25, 0xb8ac92, x, 0.04, 0);
    switch (type) {
      case "repair-intake":
        B(1.1, 0.55, 0.08, blue, x, 0.96, -0.4);
        for (const dx of [-0.34, 0, 0.34])
          B(0.22, 0.13, 0.03, 0xf0d9a1, x + dx, 1, -0.34);
        B(1.1, 0.1, 0.4, wood, x, 0.45, 0.3);
        for (const dx of [-0.42, 0.42])
          B(0.08, 0.36, 0.1, 0x5d7480, x + dx, 0.23, 0.3);
        break;
      case "training-bench":
      case "unsafe-bench":
      case "extra-bench":
        equipmentTable(x);
        B(0.3, 0.3, 0.32, blue, x, 0.99, 0.1);
        B(0.12, 0.16, 0.2, 0xd5b67d, x + 0.28, 0.93, 0.1);
        if (type === "training-bench") {
          B(0.9, 0.55, 0.06, 0x6f8d8b, x, 1.18, -0.4);
          for (const dx of [-0.3, 0, 0.3])
            B(0.06, 0.22, 0.05, 0xe3c780, x + dx, 1.2, -0.35);
        }
        if (type === "unsafe-bench") B(0.9, 0.08, 0.08, 0xc38153, x, 0.89, 0.5);
        if (type === "extra-bench") {
          B(1.1, 0.1, 0.42, wood, x, 0.5, -0.3);
          for (const dx of [-0.42, 0.42])
            B(0.08, 0.4, 0.08, 0x687d7f, x + dx, 0.27, -0.3);
        }
        break;
      case "ewaste-station":
        for (const [i, c] of [green, blue, 0xc7aa68].entries()) {
          const dx = -0.4 + i * 0.4;
          B(0.32, 0.65, 0.65, c, x + dx, 0.42, 0);
          B(0.34, 0.08, 0.69, 0x536d71, x + dx, 0.79, 0);
          B(0.18, 0.09, 0.03, 0xe2d6b4, x + dx, 0.57, 0.35);
        }
        break;
      case "storage-bank":
      case "clinic-backup":
      case "unsafe-cabinet":
      case "overloaded-cabinet":
        for (const dx of [-0.3, 0.3]) {
          B(
            0.5,
            1,
            0.7,
            type === "clinic-backup" ? 0xe8e4d8 : blue,
            x + dx,
            0.59,
            0,
          );
          for (const y of [0.35, 0.6, 0.85])
            B(0.3, 0.1, 0.03, 0x9dc5ae, x + dx, y, 0.37);
        }
        if (type === "clinic-backup") cross(x, 1.31, 0.38, 0xc65361, 0.34);
        if (type === "unsafe-cabinet" || type === "overloaded-cabinet")
          B(1.1, 0.1, 0.1, 0xce8c52, x, 0.8, 0.45);
        break;
      case "harvest-shelter":
        for (const dx of [-0.5, 0.5])
          for (const z of [-0.4, 0.4])
            B(0.06, 1.15, 0.06, wood, x + dx, 0.66, z);
        B(1.18, 0.1, 1.08, green, x, 1.3, 0);
        for (const dx of [-0.3, 0.3]) {
          B(0.48, 0.3, 0.56, wood, x + dx, 0.3, 0);
          C(0.09, 0.1, 0x84a969, x + dx, 0.52, 0);
        }
        break;
      case "cold-room":
        B(1.1, 1.3, 1, 0xd1e0dc, x, 0.76, 0);
        B(0.6, 0.95, 0.05, 0x91adb3, x, 0.63, 0.53);
        B(0.04, 0.23, 0.04, 0x536f7c, x + 0.2, 0.67, 0.58);
        for (const y of [0.95, 1.05, 1.15])
          B(0.25, 0.04, 0.035, 0x657b86, x - 0.35, y, 0.54);
        break;
      case "learning-light":
      case "unlit-class":
        equipmentTable(x);
        C(0.035, 1.5, 0x627981, x - 0.4, 0.84, -0.35);
        B(0.95, 0.1, 0.24, 0x9eacaa, x, 1.62, -0.35);
        B(
          0.8,
          0.04,
          0.19,
          type === "learning-light" ? 0xf4d887 : 0x485963,
          x,
          1.55,
          -0.35,
        );
        break;
      case "access-kit":
      case "feedback-kit":
        equipmentTable(x);
        B(1.02, 0.6, 0.06, blue, x, 1.12, -0.43);
        for (const dx of [-0.32, 0, 0.32]) {
          B(
            0.22,
            0.12,
            0.28,
            [green, 0xd2ae60, 0x709aba][Math.round((dx + 0.32) / 0.32)],
            x + dx,
            0.91,
            0.14,
          );
          B(0.16, 0.11, 0.035, 0xe4dbc4, x + dx, 1.15, -0.38);
        }
        break;
      case "scrap-pile":
        for (let i = 0; i < 7; i++) {
          const m = B(
            0.3,
            0.2,
            0.35,
            [0x7e8b8c, 0xa18c72, 0x677e89][i % 3],
            x + (i % 3) * 0.34 - 0.34,
            0.23 + Math.floor(i / 3) * 0.22,
            (i % 2) * 0.35 - 0.17,
          );
          m.rotation.y = i * 0.4;
        }
        break;
      case "flood-route":
        B(1.1, 0.025, 1.1, 0x679fb0, x, 0.15, 0);
        for (const dx of [-0.4, 0.4])
          B(0.07, 0.5, 0.07, wood, x + dx, 0.35, 0.3);
        B(1, 0.09, 0.08, 0xd6a35c, x, 0.57, 0.3);
        break;
      case "advert":
        for (const dx of [-0.45, 0.45])
          B(0.06, 1.6, 0.08, wood, x + dx, 0.9, 0);
        B(1.18, 0.75, 0.1, 0x6e98ad, x, 1.5, 0);
        cross(x, 1.5, 0.08, 0xf0ded0, 0.36);
        break;
      case "privacy-gate":
        B(0.5, 1.3, 0.45, blue, x, 0.76, 0);
        B(0.38, 0.35, 0.03, 0xb68574, x, 1, 0.25);
        B(1.1, 0.08, 0.08, 0xc6925a, x, 0.55, 0.5);
        break;
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
