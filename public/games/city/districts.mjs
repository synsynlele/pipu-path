// One city catalogue. Only the four core districts have a playable operating model.
// The ten outer districts are explorable places with truthful future-work briefs.
export const CITY_DISTRICTS = [
  {
    id: "workshop",
    name: "Repair & Maintenance",
    short: "Repair Works",
    status: "active",
    x: -3.3,
    z: -2.7,
    emoji: "🔧",
  },
  {
    id: "power",
    name: "Power & Energy",
    short: "Power District",
    status: "active",
    x: 1.6,
    z: -6.7,
    emoji: "⚡",
  },
  {
    id: "market",
    name: "Agriculture & Food",
    short: "Harvest Exchange",
    status: "active",
    x: 19,
    z: 7.2,
    emoji: "🌱",
  },
  {
    id: "school",
    name: "Education & Skills",
    short: "Learning Commons",
    status: "active",
    x: -15,
    z: 12.3,
    emoji: "🎓",
  },
  {
    id: "housing",
    name: "Housing & Construction",
    short: "Homes Quarter",
    status: "explore",
    x: -45,
    z: -24,
    emoji: "🏠",
    type: "homes",
    color: 0xc4a48c,
    challenge:
      "How could neighbours build safe, affordable homes with scarce materials?",
  },
  {
    id: "water",
    name: "Water & Sanitation",
    short: "Water Works",
    status: "explore",
    x: -27,
    z: -39,
    emoji: "💧",
    type: "water",
    color: 0x7babae,
    challenge: "How can families get clean water when pumps fail?",
  },
  {
    id: "health",
    name: "Healthcare",
    short: "Community Health",
    status: "explore",
    x: 1,
    z: -39,
    emoji: "🏥",
    type: "health",
    color: 0xd5c6bd,
    challenge: "What would help families reach care earlier?",
  },
  {
    id: "transport",
    name: "Transport & Logistics",
    short: "Transit Yard",
    status: "explore",
    x: 29,
    z: -39,
    emoji: "🚚",
    type: "transport",
    color: 0xaeb8ac,
    challenge:
      "How could deliveries arrive faster without making the streets unsafe?",
  },
  {
    id: "technology",
    name: "Technology & Innovation",
    short: "Innovation Hub",
    status: "explore",
    x: 47,
    z: -21,
    emoji: "💻",
    type: "technology",
    color: 0x8496ae,
    challenge: "Could a small useful tool save people time every day?",
  },
  {
    id: "business",
    name: "Business & Finance",
    short: "Enterprise Row",
    status: "explore",
    x: 47,
    z: 4,
    emoji: "🏪",
    type: "business",
    color: 0xd3b078,
    challenge: "How can a promising business earn trust and manage cash?",
  },
  {
    id: "environment",
    name: "Environment & Climate",
    short: "Green Commons",
    status: "explore",
    x: 43,
    z: 33,
    emoji: "🌿",
    type: "environment",
    color: 0x89aa86,
    challenge: "How could this neighbourhood stay safe during heavy rain?",
  },
  {
    id: "governance",
    name: "Community & Governance",
    short: "Civic Square",
    status: "explore",
    x: 19,
    z: 39,
    emoji: "🏛️",
    type: "governance",
    color: 0xb7aea0,
    challenge: "Whose voice is missing when the city chooses its priorities?",
  },
  {
    id: "creative",
    name: "Creative Economy",
    short: "Creative Park",
    status: "explore",
    x: -9,
    z: 39,
    emoji: "🎨",
    type: "creative",
    color: 0xc59dab,
    challenge:
      "How could local creators reach an audience and get paid fairly?",
  },
  {
    id: "industry",
    name: "Industry & Manufacturing",
    short: "Making Yard",
    status: "explore",
    x: -44,
    z: 26,
    emoji: "🏭",
    type: "industry",
    color: 0xab9d8d,
    challenge:
      "What could makers produce locally instead of throwing away or importing?",
  },
];

export const OUTER_DISTRICTS = CITY_DISTRICTS.filter(
  (d) => d.status === "explore",
);
export const DISTRICT_INDEX = new Map(CITY_DISTRICTS.map((d) => [d.id, d]));

export function countDistricts() {
  return {
    all: CITY_DISTRICTS.length,
    active: CITY_DISTRICTS.filter((d) => d.status === "active").length,
    exploring: OUTER_DISTRICTS.length,
  };
}

export function createOuterDistricts({
  box,
  cyl,
  building,
  tree,
  visual,
  textPlane,
  person,
}) {
  const scenery = [];
  const ground = (w, d, color, x, z) =>
    visual(box(w, 0.035, d, color, x, 0.15, z));
  const detail = (w, h, d, color, x, y, z) =>
    visual(box(w, h, d, color, x, y, z));
  for (const d of OUTER_DISTRICTS) {
    const { x, z, type } = d;
    ground(15, 12, type === "environment" ? 0x94b28a : 0xd3ccb8, x, z);
    // Entrance at x-3,z+4: always leave a clear apron for the arriving avatar.
    const mainZ = z - 2.7;
    if (type !== "environment" && type !== "creative") {
      building(
        x + 2.3,
        mainZ,
        5.4,
        type === "governance" ? 4.4 : 3.35,
        4,
        d.color,
      );
    }
    if (type === "homes") {
      building(x - 4, z - 3, 3.2, 2.7, 3, 0xd4b59e);
      detail(2.5, 0.12, 0.65, 0xb39a73, x + 2.1, 0.4, z + 1.3);
    } else if (type === "water") {
      visual(cyl(1.45, 2.9, 0x6b99a6, x - 3.5, 2.1, z - 2.8));
      visual(cyl(1.55, 0.22, 0x427988, x - 3.5, 3.65, z - 2.8));
      for (const dx of [-4.5, -2.5])
        detail(0.15, 2, 0.15, 0x5b7278, x + dx, 1.1, z - 2.8);
    } else if (type === "health") {
      detail(1.3, 0.3, 0.2, 0xb73a43, x + 2.3, 3.05, z - 0.62);
      detail(0.3, 1.3, 0.2, 0xb73a43, x + 2.3, 3.05, z - 0.6);
      detail(3.2, 0.12, 1.2, 0xf0ede1, x - 3.6, 0.75, z - 3.5);
    } else if (type === "transport") {
      detail(3.8, 1.4, 1.8, 0xdbb45d, x - 3.4, 1.0, z - 3.1);
      for (const dx of [-4.7, -2.1]) {
        visual(cyl(0.37, 0.17, 0x333d45, x + dx, 0.45, z - 2.15));
        visual(cyl(0.37, 0.17, 0x333d45, x + dx, 0.45, z - 4.05));
      }
    } else if (type === "technology") {
      visual(cyl(0.12, 6.2, 0x67798e, x - 3, 3.2, z - 3.2));
      detail(1.9, 0.08, 0.8, 0x456d9d, x - 3, 5.8, z - 3.2);
      detail(1.7, 0.8, 0.2, 0x284f89, x - 3, 1.2, z - 2);
    } else if (type === "business") {
      for (const dx of [-4.5, -2.9, -1.3]) {
        detail(1.4, 1.2, 1.5, 0xb18b68, x + dx, 0.75, z - 3);
        detail(1.5, 0.13, 1.85, 0xe8bf68, x + dx, 1.5, z - 3);
      }
    } else if (type === "environment") {
      ground(10, 7.5, 0x729a7c, x + 0.5, z - 2.4);
      detail(4.2, 0.035, 2.1, 0x6796a3, x + 1, 0.21, z - 3.4);
      for (const [dx, dz] of [
        [-3, -4],
        [-1, -5],
        [4, -5],
        [3, 0],
      ])
        tree(x + dx, z + dz, 0.95);
      detail(2, 0.25, 0.35, 0x9e754c, x - 3, 0.7, z + 1);
    } else if (type === "governance") {
      for (const dx of [-1.4, 0, 1.4]) {
        visual(cyl(0.2, 2.85, 0xe6dcc4, x + 2.3 + dx, 2, z - 0.6));
      }
      detail(7, 0.25, 2, 0xe7dcc5, x + 2.3, 3.6, z - 0.6);
    } else if (type === "creative") {
      detail(7.5, 0.35, 4, 0x665a73, x + 1.5, 0.4, z - 2.5);
      detail(7.5, 0.18, 0.28, 0xe6c2a3, x + 1.5, 2.6, z - 4.5);
      for (const dx of [-1.9, 1.9]) {
        detail(0.18, 2.5, 0.18, 0x866984, x + 1.5 + dx, 1.5, z - 4.5);
      }
      for (let i = 0; i < 4; i++)
        detail(4.5 + i, 0.15, 0.45, 0x9e8c9c, x + 1.5, 0.25, z + i);
    } else if (type === "industry") {
      detail(0.6, 6.5, 0.6, 0xb58c57, x - 3.4, 3.3, z - 2.7);
      detail(6.3, 0.35, 0.35, 0xb58c57, x - 0.5, 6.2, z - 2.7);
      detail(0.15, 2.2, 0.15, 0x564b3e, x + 2, 4.8, z - 2.7);
      detail(3, 1.0, 2, 0x9a8c80, x - 3.8, 0.7, z - 0.2);
    }
    // Compact welcome sign and a neighbour: decorative only, distinct from authored quests.
    detail(2.6, 1.15, 0.14, 0x253d72, x - 4.2, 1.9, z - 4.7);
    textPlane(
      d.short.toUpperCase(),
      2.5,
      0.48,
      x - 4.2,
      2.0,
      z - 4.58,
      "#253d72",
      "#f5e9c9",
    );
    const neighbour = person(
      x + 0.1,
      z + 2.1,
      [0xa46c58, 0x688d87, 0x9d864e][scenery.length % 3],
    );
    neighbour.g.userData.character = true;
    scenery.push(neighbour);
  }
  return scenery;
}
