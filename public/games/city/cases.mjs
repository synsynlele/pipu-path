// Authored, fictional decision cases. These are practice narratives, not
// engineering, healthcare, food safety, or financial advice. No XP is awarded.
// Impact signals are scenario-local relative comparisons, NOT city economy data.
import { GROWING_CITY_CASES } from "./chapter-two.mjs";

const choice = (id, title, result, tradeoff, links, impact) => ({
  id,
  title,
  result,
  tradeoff,
  links,
  impact,
});
const caseFile = (
  id,
  district,
  title,
  situation,
  question,
  options,
  bridge,
) => ({
  id,
  district,
  title,
  situation,
  question,
  options,
  bridge,
});
const FOUNDATION_CASES = [
  caseFile(
    "repair-queue",
    "workshop",
    "The long repair queue",
    "Ama has six urgent repair requests and only one working bench. A community water pump and three household devices are waiting.",
    "What should Ama do first?",
    [
      choice(
        "first",
        "Assess urgency and organise a queue",
        "Ama asks which failures affect basic services. She protects time for the pump, shares expected collection times, and documents what can wait.",
        "Less urgent customers wait longer, so she must keep communicating.",
        "Water services and household trust",
        [2, 2, 0, 2],
      ),
      choice(
        "rush",
        "Promise everybody a same-day fix",
        "Customers arrive expecting immediate repairs. The bench is overloaded; unfinished devices pile up.",
        "An attractive promise without capacity makes trust fragile.",
        "Community services and customer trust",
        [-2, -1, 0, -2],
      ),
      choice(
        "expensive",
        "Buy another bench immediately",
        "There are more workstations, but there is still only one skilled repairer. Cash is tied up before the staffing problem is solved.",
        "Equipment cannot replace scheduling or skill.",
        "Enterprise cash and repair work",
        [0, 0, -2, -1],
      ),
    ],
    "Ask a skilled adult how they prioritise urgent work without compromising safety.",
  ),
  caseFile(
    "repair-parts",
    "workshop",
    "The missing spare parts",
    "The workshop keeps running out of a small part. Deliveries come once a week, and customers bring different devices.",
    "How could the workshop reduce repeat delays?",
    [
      choice(
        "track",
        "Record failures and order the common parts",
        "A simple parts log identifies which items fail most. The next order targets the real demand.",
        "The log takes time and must be maintained.",
        "Technology, suppliers and cash",
        [2, 1, 1, 1],
      ),
      choice(
        "all",
        "Stock every possible part",
        "The shelves look full, but rare parts absorb money and many may never be used.",
        "Inventory has a cost even before anything breaks.",
        "Finance and supply chains",
        [1, 0, -2, 0],
      ),
      choice(
        "guess",
        "Order only when someone complains",
        "Cash stays free initially, but repeated waiting increases and customers make extra trips.",
        "Reactive work can cost people more time.",
        "Transport and community trust",
        [-1, -2, 1, -1],
      ),
    ],
    "Notice how a repair shop could use records without collecting private customer information.",
  ),
  caseFile(
    "repair-training",
    "workshop",
    "One expert, many learners",
    "Ama knows how to diagnose faults, but the younger apprentices only watch. Repair work slows whenever she steps away.",
    "Which training approach builds more independent ability?",
    [
      choice(
        "practice",
        "Demonstrate, then supervise safe practice",
        "Apprentices practise with de-energised mock equipment and explain their decisions. Ama gives feedback.",
        "Practice requires time and appropriate adult supervision.",
        "Education and long-term repair capacity",
        [2, 2, -1, 2],
      ),
      choice(
        "lecture",
        "Give a long list of rules to memorise",
        "Learners can repeat instructions but cannot yet diagnose an unfamiliar fault.",
        "Knowing words is not the same as demonstrating skill.",
        "Learning and workplace safety",
        [0, -1, 0, 0],
      ),
      choice(
        "alone",
        "Let everyone repair real faults unaided",
        "Work begins quickly, but mistakes create serious safety and quality risks.",
        "Unsupervised electrical repairs are not acceptable.",
        "Safety and community trust",
        [-2, -2, 0, -2],
      ),
    ],
    "With a trained adult, observe how a learner practises safely using non-hazardous materials.",
  ),
  caseFile(
    "repair-waste",
    "workshop",
    "A mountain of broken devices",
    "A pile of broken items grows behind the workshop. Some contain batteries; some have reusable components.",
    "How should the team respond?",
    [
      choice(
        "sort",
        "Separate reusable items and use authorised recycling",
        "Repairable items are catalogued and hazardous components go to qualified collection services.",
        "Sorting and authorised collection require effort and coordination.",
        "Environment, manufacturing and health",
        [1, 2, -1, 2],
      ),
      choice(
        "burn",
        "Burn everything to clear the yard",
        "The yard looks clearer temporarily but releases harmful pollution and risks injury.",
        "Fast disposal is not necessarily responsible disposal.",
        "Public health and environment",
        [-2, -2, 1, -2],
      ),
      choice(
        "store",
        "Keep the whole pile indefinitely",
        "Nothing is immediately thrown away, but clutter spreads and battery-related risks remain.",
        "Storage is not a complete waste-management plan.",
        "Workplace safety and land use",
        [-1, -1, 0, -1],
      ),
    ],
    "Ask a qualified recycler which household devices require special handling.",
  ),
  caseFile(
    "power-evening",
    "power",
    "The evening power gap",
    "The learning club meets after sunset. The workshop also wants to run its machines, while solar generation peaks at midday.",
    "How might the city protect essential evening services?",
    [
      choice(
        "mix",
        "Shift flexible work and evaluate storage",
        "Repairs move earlier where possible, and the team studies storage needs for the evening load.",
        "Storage costs money and its capacity must be checked.",
        "Learning, repair scheduling and finance",
        [2, 2, -1, 2],
      ),
      choice(
        "lights",
        "Add more panels without checking timing",
        "Midday generation rises, but the evening gap may remain.",
        "More generation at the wrong hour does not solve demand timing.",
        "Energy and education",
        [0, -1, -2, 0],
      ),
      choice(
        "random",
        "Cut evening supply without warning",
        "Some power is saved, but families and learners cannot plan.",
        "A surprise shutdown shifts the cost to other people.",
        "Education and public trust",
        [-1, -2, 1, -2],
      ),
    ],
    "Ask how a service provider plans around the time electricity is needed.",
  ),
  caseFile(
    "power-upkeep",
    "power",
    "When the equipment stops",
    "The city generator works today, but nobody owns routine checks or keeps a service record.",
    "What would improve reliability?",
    [
      choice(
        "routine",
        "Assign a trained maintenance team and schedule",
        "Qualified staff record inspections, faults and service dates. Problems become visible before major downtime.",
        "Maintenance uses operating funds, even on quiet days.",
        "Workshop, healthcare and city management",
        [2, 2, -1, 2],
      ),
      choice(
        "wait",
        "Repair only after a breakdown",
        "The budget seems larger today, but service interruptions are more disruptive later.",
        "Deferred care can create expensive emergencies.",
        "Health, education and repair",
        [-2, -1, 1, -1],
      ),
      choice(
        "untrained",
        "Let anyone open the electrical cabinet",
        "The team acts quickly, but unqualified intervention is dangerous.",
        "Safety requirements cannot be traded for speed.",
        "Public safety and trustworthy operations",
        [-2, -2, 0, -2],
      ),
    ],
    "Observe a maintenance checklist with a trained adult; never handle live equipment.",
  ),
  caseFile(
    "power-clinic",
    "power",
    "A clinic needs dependable power",
    "A small clinic cannot predict power interruptions. The city also has workshops, shops and homes on the same network.",
    "How should leaders begin planning?",
    [
      choice(
        "audit",
        "Map critical needs, backup options and responsibilities",
        "The team identifies which clinic services are critical, consults qualified technicians and sets emergency procedures.",
        "A plan requires consultation and ongoing upkeep.",
        "Healthcare, safety and electricity",
        [2, 2, -1, 2],
      ),
      choice(
        "promise",
        "Guarantee uninterrupted power immediately",
        "The announcement raises expectations without a proven operating plan.",
        "A promise does not increase capacity.",
        "Healthcare and trust",
        [-1, -2, 0, -2],
      ),
      choice(
        "exclude",
        "Prioritise only profitable customers",
        "Revenue may rise briefly, but essential services become less reliable for vulnerable residents.",
        "A city must account for who bears the cost.",
        "Fairness and public health",
        [0, -2, 2, -2],
      ),
    ],
    "Find out how an institution identifies essential services during interruptions.",
  ),
  caseFile(
    "power-demand",
    "power",
    "A busy midday",
    "A food seller requests cooling at midday, while the workshop has moved repairs into the same period.",
    "What is the best starting point?",
    [
      choice(
        "calculate",
        "Measure demand by time before adding equipment",
        "The team sees the shared midday constraint and plans scheduling, capacity and costs together.",
        "Measurement takes work; the result may require several changes.",
        "Food preservation and repair timetables",
        [2, 2, 1, 2],
      ),
      choice(
        "approve",
        "Approve every new load immediately",
        "Equipment is connected on paper, but supply may not cover the new demand.",
        "Unmeasured commitments increase disruption.",
        "Food and electrical reliability",
        [-2, -2, -1, -1],
      ),
      choice(
        "deny",
        "Refuse all requests for extra electricity",
        "Demand remains unchanged, but potentially valuable enterprises cannot develop.",
        "Reliability matters, but so does useful growth.",
        "Enterprise opportunities",
        [1, -2, 0, -1],
      ),
    ],
    "Write a simple fictional timetable of when different services need power.",
  ),
  caseFile(
    "food-harvest",
    "market",
    "Too much harvest, too little storage",
    "Growers have eight usable crates today, but transport is delayed and the market has limited cold storage.",
    "Which first step protects value?",
    [
      choice(
        "timing",
        "Match pickup time with realistic protection",
        "Growers coordinate transport and packaging with the length of the delay before buying larger equipment.",
        "This still requires dependable partners and monitoring.",
        "Transport, cooling and farmer income",
        [2, 2, 1, 2],
      ),
      choice(
        "buy",
        "Purchase expensive refrigeration before checking power",
        "A cold room is ordered, but reliable electricity and operating costs are unresolved.",
        "Infrastructure can fail if connected systems are ignored.",
        "Power and shared finance",
        [0, 0, -2, 0],
      ),
      choice(
        "wait",
        "Leave produce in the sun until buyers arrive",
        "The delay remains and more food may become unusable.",
        "Waiting carries an invisible cost.",
        "Nutrition and local livelihoods",
        [-2, -2, 1, -1],
      ),
    ],
    "Observe how markets coordinate deliveries; do not test spoiled food for safety.",
  ),
  caseFile(
    "food-small-suppliers",
    "market",
    "Small suppliers need payment",
    "A buyer will pay later, but three small growers need money today to prepare their next harvest.",
    "How could the group manage the timing conflict?",
    [
      choice(
        "agreement",
        "Negotiate a clear advance or consent-based schedule",
        "The buyer and growers agree who is paid when, and every obligation is recorded.",
        "An agreement still requires cash discipline and trust.",
        "Farming, finance and fair trading",
        [2, 2, 0, 2],
      ),
      choice(
        "hide",
        "Delay payments without telling growers",
        "Cash stays in hand briefly, but growers cannot plan and confidence falls.",
        "The cost is shifted unfairly to the weakest suppliers.",
        "Community livelihoods and trust",
        [-1, -2, 1, -2],
      ),
      choice(
        "loan",
        "Borrow an unlimited amount immediately",
        "Payments happen today, but future obligations may be unaffordable.",
        "Finance without a repayment plan can deepen the problem.",
        "Entrepreneurship and solvency",
        [0, 1, -2, -1],
      ),
    ],
    "Ask a trusted adult why cash-flow timing differs from making a profit.",
  ),
  caseFile(
    "food-waste",
    "market",
    "What happens to unsold food?",
    "Vendors have unsold produce. Some is still usable, while damaged items cannot be treated as safe.",
    "How can the market reduce waste responsibly?",
    [
      choice(
        "sort",
        "Prevent losses upstream and use safe verified channels",
        "The market improves forecasting and handling, and uses qualified guidance for any redistribution or disposal.",
        "Checking safety and coordinating demand takes effort.",
        "Health, logistics and environment",
        [2, 2, -1, 2],
      ),
      choice(
        "give",
        "Distribute everything without checks",
        "More items leave the market, but damaged food may put people at risk.",
        "Good intentions do not replace food-safety checks.",
        "Public health and trust",
        [-2, -1, 1, -2],
      ),
      choice(
        "dump",
        "Dispose of all unsold produce at once",
        "The stall empties quickly, but preventable waste and lost income continue.",
        "Speed can hide an avoidable systemic loss.",
        "Environment and livelihoods",
        [-1, -2, 0, -1],
      ),
    ],
    "Ask a food professional how they distinguish prevention from unsafe redistribution.",
  ),
  caseFile(
    "food-route",
    "market",
    "A road closure changes deliveries",
    "A flood blocks the usual delivery route. Traders must choose how to inform customers and allocate a limited vehicle.",
    "What is the strongest first response?",
    [
      choice(
        "reroute",
        "Map safe routes and prioritise urgent deliveries",
        "Traders coordinate the vehicle, notify buyers and publish revised times.",
        "Some deliveries will still be late.",
        "Transport, governance and food",
        [2, 2, -1, 2],
      ),
      choice(
        "shortcut",
        "Send drivers through an unverified flooded road",
        "A shortcut looks faster but could endanger the driver and goods.",
        "Safety is not a reasonable price for speed.",
        "Road safety and community health",
        [-2, -2, 0, -2],
      ),
      choice(
        "silence",
        "Keep the old timetable and say nothing",
        "Customers wait for deliveries that may not arrive and cannot make other plans.",
        "Poor information multiplies disruption.",
        "Customer trust and enterprise",
        [-1, -2, 0, -2],
      ),
    ],
    "Notice how one road closure affects several kinds of work.",
  ),
  caseFile(
    "learn-equal-parts",
    "school",
    "Four pieces are not always quarters",
    "A learner calls any of four unequal pieces a quarter. Another understands visually but struggles with a written explanation.",
    "Which teaching move targets both barriers?",
    [
      choice(
        "show",
        "Use equal-part objects and oral or visual explanations",
        "Learners compare equal and unequal pieces, explain the whole and test a rotated example.",
        "The educator still needs to check each learner independently.",
        "Inclusive education and assessment",
        [2, 2, -1, 2],
      ),
      choice(
        "repeat",
        "Ask learners to copy the rule ten times",
        "Notes become longer, but the misconception may remain.",
        "Repetition alone does not diagnose misunderstanding.",
        "Learning quality",
        [0, -1, 1, 0],
      ),
      choice(
        "speed",
        "Reward only the first written answer",
        "Some fast writers succeed, while other learners lose opportunities to demonstrate understanding.",
        "Speed is not the same as mastery.",
        "Equity and motivation",
        [-1, -2, 1, -1],
      ),
    ],
    "Try drawing four equal parts and four unequal parts of the same whole.",
  ),
  caseFile(
    "learn-dark-class",
    "school",
    "The class meets after sunset",
    "An evening learning club needs lighting. The repair workshop also wants electricity at the same time.",
    "How should the class and workshop solve the conflict?",
    [
      choice(
        "coordinate",
        "Protect learning time and reschedule flexible repairs",
        "The two groups agree on a timetable and confirm the available energy with the operators.",
        "Work may take longer for repair customers.",
        "Power, learning and livelihoods",
        [2, 2, -1, 2],
      ),
      choice(
        "ignore",
        "Schedule both at full demand without discussion",
        "People arrive for both activities, but the shared supply can be overloaded.",
        "Separate plans fail when they share infrastructure.",
        "Electricity and city operations",
        [-2, -2, 0, -1],
      ),
      choice(
        "cancel",
        "Cancel every evening session indefinitely",
        "The immediate energy conflict disappears, but learners lose access.",
        "Avoiding a problem is not the same as solving it.",
        "Education and opportunity",
        [1, -2, 1, -1],
      ),
    ],
    "Sketch how two activities can use the same resource at different times.",
  ),
  caseFile(
    "learn-access",
    "school",
    "Everyone deserves a way in",
    "Some young people cannot afford printed materials. Others have different reading needs but strong ideas.",
    "How could the club increase participation?",
    [
      choice(
        "inclusive",
        "Share reusable materials and offer multiple ways to respond",
        "Learners use objects, diagrams and short explanations while the guide checks what each understands.",
        "Planning varied materials takes preparation.",
        "Equity, resource use and participation",
        [2, 2, -1, 2],
      ),
      choice(
        "same",
        "Require one printed worksheet for everybody",
        "The routine is simple, but some learners remain excluded.",
        "Identical treatment does not ensure equal access.",
        "Education and household costs",
        [-1, -2, 1, -1],
      ),
      choice(
        "lower",
        "Remove every challenging task",
        "Activities become easier but may not help learners develop new abilities.",
        "Access should not mean abandoning learning goals.",
        "Mastery and confidence",
        [0, 0, 1, -1],
      ),
    ],
    "Design one simple learning activity that works with or without a printed worksheet.",
  ),
  caseFile(
    "learn-feedback",
    "school",
    "Scores don't show the whole story",
    "Two learners get the same answer wrong. One misunderstands the idea; the other misreads the instruction.",
    "What kind of assessment will help the teacher?",
    [
      choice(
        "diagnose",
        "Ask learners to explain their thinking",
        "The teacher discovers different barriers and chooses a specific next activity for each.",
        "Useful feedback takes attention and time.",
        "Assessment and human potential",
        [2, 2, -1, 2],
      ),
      choice(
        "rank",
        "Publish a list of the slowest learners",
        "A ranking appears, but it does not explain the learning barriers and may discourage participation.",
        "Comparison is not a teaching diagnosis.",
        "Motivation and social trust",
        [-1, -2, 1, -2],
      ),
      choice(
        "more",
        "Repeat the same test with no feedback",
        "Another score is produced without revealing what should change.",
        "Data without interpretation rarely changes learning.",
        "Mastery and instructional design",
        [0, -1, 0, -1],
      ),
    ],
    "Ask how explanation and feedback can reveal more than a score alone.",
  ),
];

export const FOUNDATION_CASE_COUNT = FOUNDATION_CASES.length;
export const CITY_CASES = [...FOUNDATION_CASES, ...GROWING_CITY_CASES];
export const CASE_BY_ID = new Map(CITY_CASES.map((c) => [c.id, c]));
export const CASE_DISTRICTS = Object.freeze([
  ...new Set(CITY_CASES.map((c) => c.district)),
]);
export const IMPACT_LABELS = Object.freeze([
  "Reliability",
  "Access",
  "Resources",
  "Trust",
]);

export function casesFor(district) {
  return CITY_CASES.filter((c) => c.district === district);
}
export function getCase(id) {
  return CASE_BY_ID.get(id) ?? null;
}
export function getChoice(caseId, choiceId) {
  const c = getCase(caseId);
  return c?.options.find((o) => o.id === choiceId) ?? null;
}
export function saveDecision(decisions, caseId, choiceId) {
  if (!getChoice(caseId, choiceId)) return decisions;
  return { ...decisions, [caseId]: choiceId };
}
export function caseProgress(decisions) {
  return CITY_CASES.filter((c) => getChoice(c.id, decisions[c.id])).length;
}
export function districtProgress(decisions, district) {
  return casesFor(district).filter((c) => getChoice(c.id, decisions[c.id]))
    .length;
}
