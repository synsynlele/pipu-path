import type { GardenSymbolName } from "./cinematic-art";
import { adventureScenes } from "./adventure-scenes";

/** Fictional story context only. Never interpret game meters as measured impact. */
export type WorldScene = {
  intro: string;
  person: string;
  role: string;
  quote: string;
  challenge: string;
  goodNews: string;
  nextTeaser?: string;
  image?: string;
};

export type WorldPresentation = {
  category: string;
  tagline: string;
  image: string;
  secondImage: string;
  accent: string;
  reachLabel: string;
  benefitLabel: string;
  actionIcons: readonly GardenSymbolName[];
  scenes: Record<string, WorldScene>;
};

function photo(id: string, width = 1040, height = 680) {
  return `https://images.unsplash.com/${id}?fit=crop&crop=entropy&w=${width}&h=${height}&q=67&fm=webp`;
}

export const worldPresentations: Record<string, WorldPresentation> = {
  "neighbourhood-garden-v1": {
    category: "Nature & belonging",
    tagline: "Restore a forgotten space",
    image: adventureScenes.garden,
    secondImage: adventureScenes.gardenDetail,
    accent: "#94e0b4",
    reachLabel: "Neighbours reached",
    benefitLabel: "Welcome points",
    actionIcons: ["seed", "path", "water", "invite", "bench", "sun"],
    scenes: {
      day: {
        intro: "A neglected corner could become a place everyone enjoys. But you only have one day to make the first move.",
        person: "Amara", role: "Neighbour",
        quote: "My little brother wants to come too. Please make it a place we can all use.",
        challenge: "Create a welcoming garden without using more than the supplies, hours, or helpers available.",
        goodNews: "People can imagine spending time here. Your first plan has enough room for everyone.",
        nextTeaser: "The weather forecast just changed.",
      },
      heat: {
        intro: "The first planting worked. But a dry week is coming. Can your garden survive with fewer supplies?",
        person: "Kemi", role: "Garden helper",
        quote: "It is getting hotter. What happens to everything we planted if the water runs low?",
        challenge: "Plan for dry weather. Put watering and access ahead of decoration.",
        goodNews: "Your garden has a way to survive dry days while staying open to neighbours.",
        nextTeaser: "The community is ready to visit.",
        image: adventureScenes.gardenDetail,
      },
      opening: {
        intro: "It is opening day. More neighbours are coming, including families who need a place to sit and spend time together.",
        person: "Bola", role: "Community organiser",
        quote: "Some people can only stay if there is somewhere comfortable to sit.",
        challenge: "Prepare the space for visitors while protecting the essentials.",
        goodNews: "The community has a welcoming garden to enjoy. You solved the final garden challenge.",
      },
    },
  },
  "river-renewal-v1": {
    category: "Planet & community",
    tagline: "Bring a river back to life",
    image: photo("photo-1437482078695-73f5ca6c96e2"),
    secondImage: photo("photo-1470071459604-3b5ec3a7fe05", 780, 520),
    accent: "#a2dbf3",
    reachLabel: "People engaged",
    benefitLabel: "Care points",
    actionIcons: ["recycle", "water", "box", "path", "seed", "invite"],
    scenes: {
      waste: {
        intro: "The stream that runs through town is filled with litter. Nobody agrees on where to begin.",
        person: "Femi", role: "Riverside resident",
        quote: "We used to enjoy this place. I just want to see people care about it again.",
        challenge: "Choose a safe, shared first response that includes neighbours and checks the conditions.",
        goodNews: "People join the clean-up and know how to protect the area.",
        nextTeaser: "Dark clouds are gathering.",
      },
      rain: {
        intro: "Heavy rain is on the way. The stream banks and paths will be difficult to manage.",
        person: "Nneka", role: "Community volunteer",
        quote: "Can we make the area safer and help the banks recover before the next storm?",
        challenge: "Prioritise safe access and restoring the banks, not just visible litter.",
        goodNews: "Your plan considers access and natural recovery ahead of the next rainy spell.",
        nextTeaser: "One clean-up is not enough.",
        image: photo("photo-1501785888041-af3ef285b470"),
      },
      return: {
        intro: "Months later, the stream looks better. The real question is whether the community can keep caring for it.",
        person: "David", role: "Youth club leader",
        quote: "We need a plan that still works when the first volunteers go home.",
        challenge: "Build a long-term routine involving checks, sorting and neighbours.",
        goodNews: "The river now has a community stewardship plan, not just a one-day event.",
      },
    },
  },
  "learning-district-v1": {
    category: "Education & opportunity",
    tagline: "Open doors to learning",
    image: photo("photo-1509062522246-3755977927d7"),
    secondImage: photo("photo-1516321318423-f06f85e504b3", 780, 520),
    accent: "#f2d18c",
    reachLabel: "Learners reached",
    benefitLabel: "Learning points",
    actionIcons: ["book", "path", "people", "box", "wifi", "heart"],
    scenes: {
      opening: {
        intro: "An empty room could become a learning space. Children are waiting, but not everyone can access it.",
        person: "Zara", role: "Young learner",
        quote: "I love reading. I want every child in the area to be able to come.",
        challenge: "Open an inclusive learning space with people who can guide others.",
        goodNews: "The first class can begin, and different learners have a way in.",
        nextTeaser: "Exams are getting close.",
      },
      exams: {
        intro: "Exam season is near. Learners need time, resources and someone patient to help.",
        person: "Tobi", role: "Student",
        quote: "Sometimes we know what to read, but not how to practise together.",
        challenge: "Find a plan that supports students without relying on expensive equipment.",
        goodNews: "Students can practise together and learn from mentors.",
        nextTeaser: "The internet just stopped working.",
        image: photo("photo-1516321318423-f06f85e504b3"),
      },
      offline: {
        intro: "The internet is down during a session. No one can use the online materials.",
        person: "Adaeze", role: "Learning guide",
        quote: "There is still so much we can do without a screen. How will you keep everybody learning?",
        challenge: "Choose activities that still work offline and keep students collaborating.",
        goodNews: "Learning continues. The room stays useful, even without a connection.",
      },
    },
  },
  "makers-market-v1": {
    category: "Enterprise & creativity",
    tagline: "Turn skills into solutions",
    image: photo("photo-1497366754035-f200968a6e72"),
    secondImage: photo("photo-1542838132-92c53300491e", 780, 520),
    accent: "#ffcc95",
    reachLabel: "Customers reached",
    benefitLabel: "Value points",
    actionIcons: ["tool", "invite", "shield", "people", "sun", "book"],
    scenes: {
      opening: {
        intro: "Talented young makers have products ready. They need a safe place for their first market day.",
        person: "Rayo", role: "Young maker",
        quote: "I have made something useful. But how will people find us and feel welcome?",
        challenge: "Launch the market with a safe layout and a way to reach customers.",
        goodNews: "The first makers' market has a plan customers can find and use.",
        nextTeaser: "The power supply fails.",
      },
      blackout: {
        intro: "The power goes out just before visitors arrive. People are wondering if the event can still happen.",
        person: "Hassan", role: "Stall owner",
        quote: "We cannot depend on electricity today. What do we really need to keep going?",
        challenge: "Focus on a simple physical market with protection from the weather.",
        goodNews: "Your market can welcome customers without relying on electricity.",
        nextTeaser: "Supplies are now more expensive.",
        image: photo("photo-1542838132-92c53300491e"),
      },
      costs: {
        intro: "Prices are rising. The makers must find ways to reach people and make sales with very little money.",
        person: "Dami", role: "First-time founder",
        quote: "A product is not enough. I need to learn how to tell people why it matters.",
        challenge: "Choose affordable ways to communicate, build skills and show what the makers offer.",
        goodNews: "The makers found a leaner way to build customer trust and share their products.",
      },
    },
  },
  "food-rescue-v1": {
    category: "Kindness & food access",
    tagline: "Connect food with people",
    image: photo("photo-1547592180-85f173990554"),
    secondImage: photo("photo-1542838132-92c53300491e", 780, 520),
    accent: "#b6e6a3",
    reachLabel: "People reached",
    benefitLabel: "Care points",
    actionIcons: ["food", "box", "people", "shield", "truck", "map"],
    scenes: {
      first: {
        intro: "A local food event has prepared more food than it can use. Community groups want to help, but need a safe plan.",
        person: "Sade", role: "Community coordinator",
        quote: "The food must reach people responsibly. We cannot just rush to hand it out.",
        challenge: "Connect partners, packaging and delivery into one careful plan.",
        goodNews: "You created a coordinated distribution plan that considers packaging and trusted partners.",
        nextTeaser: "Temperatures are rising.",
      },
      heat: {
        intro: "The day is getting hotter. Some food needs safe storage before anybody can receive it.",
        person: "Musa", role: "Food partner",
        quote: "Help us keep the food properly stored and handled. Safety comes first.",
        challenge: "Prioritise storage and safe handling—not just fast delivery.",
        goodNews: "Your response makes safe storage part of the plan instead of an afterthought.",
        nextTeaser: "The available supply is smaller than expected.",
        image: photo("photo-1542838132-92c53300491e"),
      },
      shortage: {
        intro: "Less food arrives than expected. Now it is important to understand needs and work with local partners.",
        person: "Ife", role: "Community representative",
        quote: "Before you decide where to go, find out who needs help most.",
        challenge: "Map the need, work with trusted groups and deliver carefully.",
        goodNews: "Your plan puts coordination and people's needs first.",
      },
    },
  },
};

export const worldDirectory = [
  { id: "neighbourhood-garden-v1", number: "02" },
  { id: "river-renewal-v1", number: "03" },
  { id: "learning-district-v1", number: "04" },
  { id: "makers-market-v1", number: "05" },
  { id: "food-rescue-v1", number: "06" },
] as const;

export function getWorldPresentation(chapterId: string): WorldPresentation | null {
  return worldPresentations[chapterId] ?? null;
}
