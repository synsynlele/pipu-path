// Explicit, stable choice contracts. A promise or ignored need never earns a
// building. Physical harm can remain visible without counting as infrastructure.
import { getCase, getChoice } from "./cases.mjs";
const working = (asset, label) => ({
  status: "working",
  assets: [asset],
  construction: true,
  label,
});
const limited = (asset, label) => ({
  status: "limited",
  assets: [asset],
  construction: true,
  label,
});
const failed = (asset, label, construction = false) => ({
  status: "failed",
  assets: asset ? [asset] : [],
  construction,
  label,
});
const none = (label) => ({
  status: "none",
  assets: [],
  construction: false,
  label,
});
const plans = {
  "repair-queue": {
    first: working("repair-intake", "Repair intake and organised waiting area"),
    rush: failed("repair-backlog", "Unfinished repairs pile up"),
    expensive: limited(
      "extra-bench",
      "Extra bench without an extra skilled repairer",
    ),
  },
  "repair-parts": {
    track: working("parts-store", "Labelled spare-parts store"),
    all: limited(
      "overstocked-parts",
      "Overstocked shelves tie up workshop funds",
    ),
    guess: none("No dependable parts system is added"),
  },
  "repair-training": {
    practice: working(
      "training-bench",
      "Supervised apprentice training station",
    ),
    lecture: none("Memorising rules does not add practical training capacity"),
    alone: failed("unsafe-bench", "Unsupervised repairs leave unsafe work"),
  },
  "repair-waste": {
    sort: working(
      "ewaste-station",
      "Authorised e-waste sorting and collection station",
    ),
    burn: failed("burn-pit", "Burnt waste and pollution remain"),
    store: failed("scrap-pile", "Unsorted hazardous scrap occupies the yard"),
  },
  "power-evening": {
    mix: working(
      "storage-bank",
      "Essential-load storage and scheduling station",
    ),
    lights: limited(
      "solar",
      "Additional solar panels; the evening gap remains",
    ),
    random: none("Power cuts add no energy infrastructure"),
  },
  "power-upkeep": {
    routine: working("maintenance-tools", "Qualified maintenance tool station"),
    wait: none("No preventive maintenance system is added"),
    untrained: failed(
      "unsafe-cabinet",
      "Unsafe electrical intervention leaves a hazard",
    ),
  },
  "power-clinic": {
    audit: working(
      "clinic-backup",
      "Critical-load monitoring and clinic backup station",
    ),
    promise: none("An announcement does not install clinic backup power"),
    exclude: none("Excluding residents adds no reliable clinic supply"),
  },
  "power-demand": {
    calculate: working(
      "load-meter",
      "Shared demand meter and scheduling console",
    ),
    approve: failed(
      "overloaded-cabinet",
      "Extra connections overload the existing supply",
    ),
    deny: none("Refusing requests adds no capacity"),
  },
  "food-harvest": {
    timing: working(
      "harvest-shelter",
      "Covered produce handling and pickup station",
    ),
    buy: limited("cold-room", "Cold room with unresolved power supply"),
    wait: failed("spoiled-food", "Harvest spoils without protection"),
  },
  "food-small-suppliers": {
    agreement: working("supplier-desk", "Supplier payment and collection desk"),
    hide: none("Hidden payment delays add no useful infrastructure"),
    loan: none("Unplanned debt adds no production capacity"),
  },
  "food-waste": {
    sort: working("food-sorting", "Food inspection and safe sorting station"),
    give: failed("unsafe-food", "Unchecked food distribution remains unsafe"),
    dump: failed("spoiled-food", "Discarded produce remains a loss"),
  },
  "food-route": {
    reroute: working("dispatch-map", "Safe delivery dispatch station"),
    shortcut: failed(
      "flooded-route",
      "A flooded shortcut threatens deliveries",
    ),
    silence: none("Keeping silent adds no safe delivery route"),
  },
  "learn-equal-parts": {
    show: working(
      "fraction-kit",
      "Equal-part manipulatives and explanation station",
    ),
    repeat: none("Copying a rule adds no new learning tools"),
    speed: none("Rewarding speed adds no inclusive learning resource"),
  },
  "learn-dark-class": {
    coordinate: working(
      "learning-light",
      "Scheduled learning lights and shared-power control",
    ),
    ignore: failed(
      "unlit-class",
      "An overloaded learning station remains dark",
    ),
    cancel: none("Cancelled classes add no learning infrastructure"),
  },
  "learn-access": {
    inclusive: working(
      "accessible-kit",
      "Reusable visual and tactile learning station",
    ),
    same: limited("worksheet-desk", "Print-only desk excludes some learners"),
    lower: none("Removing challenge adds no accessible learning tools"),
  },
  "learn-feedback": {
    diagnose: working(
      "feedback-desk",
      "Teacher feedback and diagnostic learning station",
    ),
    rank: none("Public ranking adds no teaching support"),
    more: none("Another test without feedback adds no learning support"),
  },
  "homes-materials": {
    assess: working(
      "housing-court",
      "Safe homes with drainage and shared access",
    ),
    rush: failed(
      "unfinished-housing",
      "Unfinished foundations stand in flood-prone ground",
      true,
    ),
    luxury: limited(
      "luxury-home",
      "One large home serves fewer waiting families",
    ),
  },
  "homes-upkeep": {
    committee: working(
      "housing-service",
      "Resident maintenance and repair depot",
    ),
    delay: none("No maintenance depot or repair system is added"),
    charge: limited(
      "gated-service",
      "A fee-gated maintenance depot excludes households",
    ),
  },
  "water-breakdown": {
    inspect: working(
      "waterworks",
      "Inspected waterworks with safe temporary collection",
    ),
    guess: failed(
      "damaged-waterworks",
      "The faulty water pump remains damaged",
    ),
    private: limited(
      "gated-waterworks",
      "A gated water point serves only some households",
    ),
  },
  "water-sanitation": {
    protect: working(
      "water-treatment",
      "Protected water-treatment and drainage works",
    ),
    ignore: none("No source protection or treatment works are added"),
    announce: none("A message does not build sanitation works"),
  },
  "clinic-arrival": {
    access: working(
      "health-centre",
      "Clinic reception, triage and accessible entrance",
    ),
    billboard: failed(
      "clinic-advert",
      "An advert appears; clinic access is not improved",
    ),
    premium: limited(
      "private-clinic",
      "A fee-gated clinic entrance restricts access",
    ),
  },
  "clinic-supply": {
    track: working(
      "pharmacy",
      "Medical supply store with verified stock control",
    ),
    bulk: limited(
      "overstocked-pharmacy",
      "Medical stock fills the store without demand planning",
    ),
    silence: none("Concealed shortages add no medical supply facility"),
  },
  "transit-delivery": {
    prioritise: working(
      "logistics-depot",
      "Delivery depot with route and dispatch controls",
    ),
    flood: failed("flooded-route", "The unsafe flooded route remains a hazard"),
    promise: none("An unchanged promise adds no transport improvement"),
  },
  "transit-people": {
    safe: working(
      "accessible-transit",
      "Accessible walking and protected crossing works",
    ),
    cars: limited(
      "fast-road",
      "Vehicle-focused road lacks protected pedestrian access",
    ),
    ban: none("A blanket ban creates no safer route or delivery facility"),
  },
  "tech-booking": {
    prototype: working(
      "technology-hub",
      "Public technology hub with queue displays and accessible help",
    ),
    features: failed(
      "unfinished-tech",
      "An unfinished technology hub has screens but no tested service",
      true,
    ),
    collect: failed(
      "locked-kiosk",
      "A privacy-invasive registration gate deters residents",
    ),
  },
  "tech-reliability": {
    offline: working(
      "offline-centre",
      "Offline service centre with local access and a staffed desk",
    ),
    online: limited(
      "disconnected-centre",
      "Online-only service centre fails when the network drops",
    ),
    replace: limited(
      "unattended-centre",
      "Unattended terminals leave residents without human help",
    ),
  },
  "enterprise-trust": {
    records: working(
      "market-shop",
      "Neighbourhood shop with order collection and service desk",
    ),
    discount: limited(
      "discount-shop",
      "Discount shop grows demand before fixing order reliability",
    ),
    blame: none("Blaming customers adds no reliable shop service"),
  },
  "enterprise-cash": {
    plan: working(
      "enterprise-office",
      "Enterprise accounts and supplier payment office",
    ),
    borrow: none("Unplanned borrowing adds no business service infrastructure"),
    delay: none("Hidden invoices add no useful business facility"),
  },
  "green-drainage": {
    survey: working(
      "drainage-basin",
      "Surveyed drainage channels and rainwater retention basin",
    ),
    pave: failed("sealed-yard", "Sealed paving increases runoff", true),
    ignore: none("No flood protection is built"),
  },
  "green-waste": {
    system: working(
      "recycling-centre",
      "Separated collection and materials recovery centre",
    ),
    dump: failed("scrap-pile", "Waste has been displaced rather than managed"),
    burn: failed("burn-pit", "Burning waste leaves pollution"),
  },
  "civic-voices": {
    include: working(
      "civic-hall",
      "Accessible civic hall and public priorities display",
    ),
    loud: limited(
      "exclusive-hall",
      "A meeting hall serves only the loudest group",
    ),
    secret: none("Closed decisions add no accountable civic service"),
  },
  "civic-repairs": {
    track: working(
      "service-depot",
      "Public repair-response and service-tracking depot",
    ),
    announce: none("Claiming completion does not repair public services"),
    ignore: none("Archived reports create no response system"),
  },
  "creative-fairpay": {
    fair: working(
      "arts-centre",
      "Community arts stage with fair participation desk",
    ),
    exposure: limited(
      "unpaid-stage",
      "An unpaid stage excludes creators who need income",
    ),
    copy: failed(
      "copied-stage",
      "Uncredited work leaves an unfair event",
      true,
    ),
  },
  "creative-audience": {
    channels: working(
      "media-studio",
      "Media studio with digital and community notice points",
    ),
    viral: none("A viral post adds no accessible community venue"),
    exclusive: limited(
      "exclusive-stage",
      "A gated venue excludes emerging creators",
    ),
  },
  "industry-spares": {
    test: working(
      "manufacturing-workshop",
      "Manufacturing workshop with prototype and quality-test stations",
    ),
    copy: failed(
      "unsafe-factory",
      "Untested parts accumulate in an unsafe production line",
      true,
    ),
    fashion: limited(
      "unused-goods",
      "A workshop accumulates goods the city did not request",
    ),
  },
  "industry-workers": {
    train: working(
      "skills-workshop",
      "Apprentice workshop with supervised work bays and safety equipment",
    ),
    speed: failed(
      "unsafe-factory",
      "An untrained production line creates unsafe work",
      true,
    ),
    automate: limited(
      "robot-workshop",
      "Automated work bays remove local training places",
    ),
  },
};
export function infrastructurePlan(caseId, choiceId) {
  const scenario = getCase(caseId),
    choice = getChoice(caseId, choiceId),
    plan = plans[caseId]?.[choiceId];
  if (!scenario || !choice || !plan) return null;
  return {
    caseId,
    choiceId,
    district: scenario.district,
    title: choice.title,
    ...plan,
    assets: [...plan.assets],
    explanation:
      plan.status === "none"
        ? "No new infrastructure. " + choice.result
        : plan.label + ". " + choice.result,
  };
}
