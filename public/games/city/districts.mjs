// One city catalogue: four foundation districts and ten playable growing-city districts.
// The outer-district geometry remains in place as those sites open in Chapter 2.
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
    z: 14.2,
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
    status: "active",
    x: -42,
    z: -32,
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
    status: "active",
    x: -18,
    z: -32,
    emoji: "💧",
    type: "water",
    color: 0x7babae,
    challenge: "How can families get clean water when pumps fail?",
  },
  {
    id: "health",
    name: "Healthcare",
    short: "Community Health",
    status: "active",
    x: 18,
    z: -32,
    emoji: "🏥",
    type: "health",
    color: 0xd5c6bd,
    challenge: "What would help families reach care earlier?",
  },
  {
    id: "transport",
    name: "Transport & Logistics",
    short: "Transit Yard",
    status: "active",
    x: 42,
    z: -32,
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
    status: "active",
    x: 42,
    z: -6,
    emoji: "💻",
    type: "technology",
    color: 0x8496ae,
    challenge: "Could a small useful tool save people time every day?",
  },
  {
    id: "business",
    name: "Business & Finance",
    short: "Enterprise Row",
    status: "active",
    x: 42,
    z: 16,
    emoji: "🏪",
    type: "business",
    color: 0xd3b078,
    challenge: "How can a promising business earn trust and manage cash?",
  },
  {
    id: "environment",
    name: "Environment & Climate",
    short: "Green Commons",
    status: "active",
    x: 42,
    z: 36,
    emoji: "🌿",
    type: "environment",
    color: 0x89aa86,
    challenge: "How could this neighbourhood stay safe during heavy rain?",
  },
  {
    id: "governance",
    name: "Community & Governance",
    short: "Civic Square",
    status: "active",
    x: 18,
    z: 36,
    emoji: "🏛️",
    type: "governance",
    color: 0xb7aea0,
    challenge: "Whose voice is missing when the city chooses its priorities?",
  },
  {
    id: "creative",
    name: "Creative Economy",
    short: "Creative Park",
    status: "active",
    x: -18,
    z: 36,
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
    status: "active",
    x: -42,
    z: 36,
    emoji: "🏭",
    type: "industry",
    color: 0xab9d8d,
    challenge:
      "What could makers produce locally instead of throwing away or importing?",
  },
];

export const FOUNDATION_DISTRICTS = Object.freeze([
  "workshop",
  "power",
  "market",
  "school",
]);
export const OUTER_DISTRICTS = CITY_DISTRICTS.filter(
  (d) => !FOUNDATION_DISTRICTS.includes(d.id),
);
export const DISTRICT_INDEX = new Map(CITY_DISTRICTS.map((d) => [d.id, d]));

export function countDistricts() {
  return {
    all: CITY_DISTRICTS.length,
    active: CITY_DISTRICTS.filter((d) => d.status === "active").length,
    exploring: CITY_DISTRICTS.filter((d) => d.status === "explore").length,
    growing: OUTER_DISTRICTS.length,
  };
}

export function createOuterDistricts({ box, tree, visual, textPlane, person }) {
  const scenery = [];
  for (const d of OUTER_DISTRICTS) {
    const { x, z } = d;
    // Reserved development plots stay empty until the player's choice builds them.
    visual(box(15, 0.035, 12, 0xd7cfba, x, 0.15, z));
    visual(box(14, 0.04, 1.2, 0xe7ddc7, x, 0.18, z + 4.2));
    for (const dx of [-3.2, 3.2]) {
      visual(box(5.4, 0.025, 4.8, 0xb7bc9a, x + dx, 0.18, z - 1));
      visual(box(0.14, 0.25, 0.14, 0xb49c77, x + dx - 2.6, 0.3, z + 1.3));
    }
    for (const dx of [-6.5, 6.5]) tree(x + dx, z - 4.4, 0.8);
    textPlane(
      d.short.toUpperCase(),
      4.6,
      0.65,
      x,
      1.5,
      z + 5.4,
      "#253d72",
      "#f5e9c9",
    );
    const neighbour = person(x + 0.1, z + 3.1, d.color);
    neighbour.g.userData.character = true;
    scenery.push(neighbour);
  }
  return scenery;
}
