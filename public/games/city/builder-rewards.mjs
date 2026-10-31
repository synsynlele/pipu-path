// Virtual-only Builder Credits. Never mix with fictional city operating funds,
// verified PipuPath XP, capability evidence, or real-world opportunities.
import { CITY_CASES, getChoice } from "./cases.mjs";
import { CITY_DISTRICTS } from "./districts.mjs";
import { resilienceReport } from "./resilience.mjs";

export const BUILDER_ITEMS = Object.freeze([
  {
    id: "flowers",
    name: "Flower Garden",
    category: "city",
    cost: 20,
    icon: "🌸",
    detail: "Plant a bright flower bed in a built district.",
  },
  {
    id: "trees",
    name: "Shade Trees",
    category: "city",
    cost: 30,
    icon: "🌳",
    detail: "Add welcoming greenery to your city.",
  },
  {
    id: "benches",
    name: "Park Benches",
    category: "city",
    cost: 40,
    icon: "🪑",
    detail: "Make a pleasant resting place.",
  },
  {
    id: "lights",
    name: "Garden Lights",
    category: "city",
    cost: 60,
    icon: "✨",
    detail: "Light up a small public space.",
  },
  {
    id: "fountain",
    name: "Decorative Fountain",
    category: "city",
    cost: 80,
    icon: "⛲",
    detail: "Add a beautiful centrepiece, not a water service.",
  },
  {
    id: "helmet",
    name: "Builder Helmet",
    category: "builder",
    cost: 30,
    icon: "🪖",
    detail: "Show your builder spirit.",
  },
  {
    id: "backpack",
    name: "Builder Backpack",
    category: "builder",
    cost: 40,
    icon: "🎒",
    detail: "Carry a colourful builder pack.",
  },
  {
    id: "jacket",
    name: "Special Builder Jacket",
    category: "builder",
    cost: 80,
    icon: "🧥",
    detail: "Give your builder a striking new outfit.",
  },
]);
const ITEMS = new Map(BUILDER_ITEMS.map((item) => [item.id, item]));
const DISTRICTS = new Set(CITY_DISTRICTS.map((item) => item.id));
const TIERS = Object.freeze({
  thriving: {
    credits: 50,
    title: "Thriving City",
    note: "Your choices protected more needs and helped the city grow.",
  },
  growing: {
    credits: 30,
    title: "Growing City",
    note: "You made progress. Some needs are still waiting for a better solution.",
  },
  repair: {
    credits: 10,
    title: "City Needs Attention",
    note: "You finished the chapter. Revisit strained services and keep improving.",
  },
});
export const emptyBuilderRewards = () => ({
  version: 2,
  awards: [],
  purchases: [],
  equipped: [],
  viewed: [],
});
function isRecord(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
function numberIn(v, min, max) {
  return Number.isInteger(v) && v >= min && v <= max;
}
// Repeatable cosmetics stay bounded per built district and overall to protect
// mobile 3D performance. Virtual credits cannot be redeemed for real rewards.
export const MAX_DISTRICT_DECOR = 6;
export const MAX_ITEM_PER_DISTRICT = 3;
export const MAX_TOTAL_DECOR = 84;
export function decorationCount(value,district,id=null) {
  const safe=sanitizeBuilderRewards(value);
  return safe.purchases.filter((p)=>ITEMS.get(p.id)?.category==="city"&&
    (district==null||p.district===district)&&(id==null||p.id===id)).length;
}
export function sanitizeBuilderRewards(value) {
  if(!isRecord(value)||![1,2].includes(value.version))return emptyBuilderRewards();
  const awards=[],seenChapters=new Set();
  for(const a of Array.isArray(value.awards)?value.awards.slice(0,12):[]){
    if(!isRecord(a)||!numberIn(a.chapter,1,12)||!Object.hasOwn(TIERS,a.tier)||
      a.credits!==TIERS[a.tier].credits||seenChapters.has(a.chapter))continue;
    awards.push({chapter:a.chapter,tier:a.tier,credits:a.credits});
    seenChapters.add(a.chapter);
  }
  const earned=awards.reduce((n,a)=>n+a.credits,0);
  const purchases=[],usedSerials=new Set(),owned=new Set();
  const byDistrict=new Map(),byType=new Map();
  let spent=0,decorCount=0,serialCounter=1;
  const raw=Array.isArray(value.purchases)?value.purchases.slice(0,MAX_TOTAL_DECOR+BUILDER_ITEMS.length):[];
  for(const p of raw){
    const item=ITEMS.get(p?.id);
    if(!item||spent+item.cost>earned)continue;
    const city=item.category==="city";
    if(city && !DISTRICTS.has(p.district))continue;
    if(!city && (p.district!=null||owned.has(item.id)))continue;
    const n=byDistrict.get(p.district)??0;
    const k=p.id+"|"+p.district,perItem=byType.get(k)??0;
    if(city&&(decorCount>=MAX_TOTAL_DECOR||n>=MAX_DISTRICT_DECOR||perItem>=MAX_ITEM_PER_DISTRICT))continue;
    const serial=value.version===2?p.serial:serialCounter;
    if(!Number.isInteger(serial)||serial<1||serial>10000||usedSerials.has(serial))continue;
    // New versions keep immutable purchase identity for stable 3D placement.
    serialCounter=Math.max(serialCounter,serial+1);
    usedSerials.add(serial);
    purchases.push({id:item.id,district:city?p.district:null,serial});
    spent+=item.cost;
    owned.add(item.id);
    if(city){
      decorCount++;
      byDistrict.set(p.district,n+1);
      byType.set(k,perItem+1);
    }
  }
  const equipped=[...new Set((Array.isArray(value.equipped)?value.equipped:[])
    .filter(id=>typeof id==="string"&&owned.has(id)&&ITEMS.get(id).category==="builder"))];
  const viewed=[...new Set((Array.isArray(value.viewed)?value.viewed:[])
    .filter(id=>numberIn(id,1,12)&&seenChapters.has(id)))];
  return {version:2,awards,purchases,equipped,viewed};
}
export function builderBalance(value) {
  const safe = sanitizeBuilderRewards(value);
  return (
    safe.awards.reduce((n, a) => n + a.credits, 0) -
    safe.purchases.reduce((n, p) => n + ITEMS.get(p.id).cost, 0)
  );
}
function caseQuality(decisions, chapter) {
  const relevant = CITY_CASES.filter((c, i) =>
    chapter === 1 ? i < 16 : chapter === 2 ? i >= 16 : true,
  );
  let helpful = 0,
    count = 0;
  for (const item of relevant) {
    const choice = getChoice(item.id, decisions?.[item.id]);
    if (!choice || !Array.isArray(choice.impact)) continue;
    count++;
    const social =
      (choice.impact[0] ?? 0) +
      (choice.impact[1] ?? 0) +
      (choice.impact[3] ?? 0);
    helpful += social >= 3 ? 1 : social >= 0 ? 0.5 : 0;
  }
  return count ? helpful / count : 0;
}
function serviceQuality(rows) {
  const served = rows.reduce((n, row) => n + row.served, 0);
  const requested = rows.reduce((n, row) => n + row.requested, 0);
  return requested > 0 ? served / requested : 0;
}
export function chapterRating(chapter, state) {
  let quality = caseQuality(state.decisions, chapter);
  if (chapter === 3) {
    const history = state.economy?.history ?? [];
    const served = history.reduce(
      (n, r) => n + (r.meals ?? 0) + (r.patients ?? 0) + (r.repairs ?? 0),
      0,
    );
    const missed = history.reduce((n, r) => n + (r.unserved ?? 0), 0);
    quality = served + missed ? served / (served + missed) : 0;
  } else if (chapter === 4) {
    const results = resilienceReport(state.resilience)?.history ?? [];
    const rows = results
      .flatMap((r) => Object.values(r.requests ?? {}))
      .filter(
        (r) =>
          numberIn(r?.requested, 0, 100000) && numberIn(r?.served, 0, 100000),
      );
    // Use resolved fictional service requests; no made-up impact statistics.
    quality = rows.length
      ? serviceQuality(rows)
      : caseQuality(state.decisions, 0);
  } else if (chapter >= 5) {
    // Each chapter's simulation score now determines its reward tier.
    // Previous-edition completed missions retain a neutral passing score.
    const records = state.advanced?.records?.slice((chapter - 5) * 2, (chapter - 5) * 2 + 2) ?? [];
    quality = records.length === 2
      ? records.reduce((n, rec) => n + (rec.legacy ? 75 : (rec.score ?? 0)), 0) / 200
      : 0;
  }
  const tier =
    quality >= 0.7 ? "thriving" : quality >= 0.35 ? "growing" : "repair";
  return { tier, ...TIERS[tier], percentage: Math.round(quality * 100) };
}
export function awardCompletedChapters(rewards, chapters, state) {
  const safe = sanitizeBuilderRewards(rewards);
  const claimed = new Set(safe.awards.map((item) => item.chapter));
  const newly = [];
  for (const chapter of chapters) {
    if (!chapter.completed || claimed.has(chapter.chapter)) continue;
    const rating = chapterRating(chapter.chapter, state);
    const award = {
      chapter: chapter.chapter,
      tier: rating.tier,
      credits: rating.credits,
    };
    safe.awards.push(award);
    newly.push(award);
    claimed.add(chapter.chapter);
  }
  return { rewards: safe, newly };
}
export function purchaseBuilderItem(value,itemId,district,allowedDistricts=[]) {
  const safe=sanitizeBuilderRewards(value),item=ITEMS.get(itemId);
  if(!item)return {ok:false,reason:"That item is unavailable.",rewards:safe};
  if(item.category==="builder"&&safe.purchases.some(p=>p.id===itemId))
    return {ok:false,reason:"You already own this outfit or accessory.",rewards:safe};
  if(builderBalance(safe)<item.cost)
    return {ok:false,reason:"Earn more Builder Credits by completing chapters.",rewards:safe};
  if(item.category==="city"){
    if(!DISTRICTS.has(district)||!allowedDistricts.includes(district))
      return {ok:false,reason:"Choose a district you have built first.",rewards:safe};
    const city=safe.purchases.filter(p=>ITEMS.get(p.id)?.category==="city");
    if(city.length>=MAX_TOTAL_DECOR)
      return {ok:false,reason:"Your city has reached its decoration limit.",rewards:safe};
    if(city.filter(p=>p.district===district).length>=MAX_DISTRICT_DECOR)
      return {ok:false,reason:"This district is full. Decorate another neighbourhood.",rewards:safe};
    if(city.filter(p=>p.district===district&&p.id===itemId).length>=MAX_ITEM_PER_DISTRICT)
      return {ok:false,reason:"You have three of this item here. Try another district or decoration.",rewards:safe};
  }
  const serial=Math.max(0,...safe.purchases.map(p=>p.serial))+1;
  safe.purchases.push({id:itemId,district:item.category==="city"?district:null,serial});
  if(item.category==="builder")safe.equipped.push(itemId);
  return {ok:true,rewards:safe};
}
export function toggleBuilderItem(value, itemId) {
  const safe = sanitizeBuilderRewards(value);
  if (
    !safe.purchases.some((p) => p.id === itemId) ||
    ITEMS.get(itemId)?.category !== "builder"
  )
    return safe;
  safe.equipped = safe.equipped.includes(itemId)
    ? safe.equipped.filter((i) => i !== itemId)
    : [...safe.equipped, itemId];
  return safe;
}
export function acknowledgeChapter(value, chapter) {
  const safe = sanitizeBuilderRewards(value);
  if (
    safe.awards.some((item) => item.chapter === chapter) &&
    !safe.viewed.includes(chapter)
  )
    safe.viewed.push(chapter);
  return safe;
}
export function nextCelebration(value) {
  const safe = sanitizeBuilderRewards(value);
  return (
    safe.awards.find((item) => !safe.viewed.includes(item.chapter)) ?? null
  );
}
