// Additional city work: two independently tested outcomes per builder chapter.
// Authored briefs come from production; actions operate on bounded fictional systems.
import { PRODUCTION_CHALLENGE_LIBRARY } from "./production-challenge-library.mjs";
import { BUILDER_CHAPTERS } from "./builder-chapters.mjs";
import { CITY_PROJECTS } from "./city-construction.mjs";
import { BUILDER_MISSIONS } from "./builder-episode.mjs";
const flag = (key, value = true) => [key, value];
const act = (id, name, effect, needs = [], detail = "") => ({
  id,
  name,
  effect,
  needs,
  detail,
});
const set = (id, name, key, needs = [], detail = "") =>
  act(id, name, { set: { [key]: true } }, needs, detail);
const take = (id, name, item) => act(id, name, { take: item });
const put = (id, name, item, key, needs = []) =>
  act(id, name, { put: item, set: { [key]: true } }, needs);
const pay = (id, name, cost, key, needs = []) =>
  act(id, name, { spend: cost, set: { [key]: true } }, needs);
const check = (key, message, value = true) => ({ key, value, message });
const mission = (
  chapter,
  slot,
  id,
  source,
  title,
  goal,
  kind,
  initial,
  actions,
  checks,
  solution,
  steps,
) => ({
  chapter,
  slot,
  id,
  source,
  title,
  goal,
  kind,
  initial,
  actions,
  checks,
  solution,
  steps,
});
export const PRACTICAL_MISSIONS = [
  mission(
    "investigate",
    2,
    "runoff",
    "water-sanitation",
    "Keep dirty runoff away",
    "Find the storm path. Clear the blockage and place a barrier so dirty runoff cannot reach the collection point.",
    "water",
    {},
    [
      set("trace", "Trace the dirty runoff", "traced"),
      take("barrier", "Lift the clean-water barrier", "barrier"),
      put("edge", "Place barrier beside the source", "barrier", "protected", [
        flag("traced"),
      ]),
      set("drain", "Remove the drain blockage", "drain", [flag("traced")]),
    ],
    [
      check("traced", "Trace the runoff before changing its route."),
      check(
        "protected",
        "Dirty water still crosses the collection area. Place the barrier.",
      ),
      check("drain", "Runoff has nowhere to go. Clear the downstream drain."),
    ],
    ["trace", "barrier", "edge", "drain", "test"],
    [
      "Follow the runoff",
      "Inspect the blocked route",
      "Carry the barrier",
      "Protect the water edge",
      "Run the storm test",
    ],
  ),
  mission(
    "investigate",
    3,
    "service-tickets",
    "tech-booking",
    "Make the service queue reliable",
    "Carry each resident’s request to the right service desk. Keep one record per person, then check both arrivals.",
    "tickets",
    {},
    [
      take("water-request", "Collect Ada’s water request", "Ada · water"),
      put(
        "water-desk",
        "Register request at water desk",
        "Ada · water",
        "water",
      ),
      take("repair-request", "Collect Bayo’s repair request", "Bayo · repair"),
      put(
        "repair-desk",
        "Register request at repair desk",
        "Bayo · repair",
        "repair",
      ),
      set("board", "Publish the shared arrival board", "board", [
        flag("water"),
        flag("repair"),
      ]),
    ],
    [
      check("water", "Ada is missing from the water queue."),
      check("repair", "Bayo is missing from the repair queue."),
      check(
        "board",
        "Residents cannot see their confirmed place. Publish the shared board.",
      ),
    ],
    [
      "water-request",
      "water-desk",
      "repair-request",
      "repair-desk",
      "board",
      "test",
    ],
    [
      "Read the residents’ requests",
      "Carry a request",
      "Find its service desk",
      "Publish confirmed places",
      "Test both arrivals",
    ],
  ),
  mission(
    "market",
    2,
    "spare-stock",
    "repair-parts",
    "Keep a repair bench supplied",
    "Recover a usable gear, bring the matching bearing, and fit both on the repair bench. Keep the reserve separate from the live job.",
    "workshop",
    {},
    [
      take("gear", "Recover the reusable gear", "gear"),
      put("bench", "Fit gear on the repair bench", "gear", "gear"),
      take("bearing", "Collect a matching bearing", "bearing"),
      put("fit", "Fit the bearing beside the gear", "bearing", "bearing", [
        flag("gear"),
      ]),
      take("reserve", "Collect the reserve part", "reserve part"),
      put(
        "rack",
        "Store reserve on the labelled rack",
        "reserve part",
        "reserve",
      ),
    ],
    [
      check("gear", "The mechanism has no gear."),
      check("bearing", "The gear cannot run without its matching bearing."),
      check(
        "reserve",
        "This job works once, but the next job has no spare. Stock the reserve rack.",
      ),
    ],
    ["gear", "bench", "bearing", "fit", "reserve", "rack", "test"],
    [
      "Inspect the missing parts",
      "Recover the gear",
      "Match the bearing",
      "Stock the reserve",
      "Run two repair jobs",
    ],
  ),
  mission(
    "market",
    3,
    "device-recovery",
    "repair-waste",
    "Recover value without mixing hazards",
    "Move the battery to the isolated tray, the board to the reuse bench and the shell to recycling. Test the cleared work area.",
    "recovery",
    {},
    [
      take("battery", "Lift the marked battery pack", "battery"),
      put("isolate", "Place battery in isolated tray", "battery", "battery"),
      take("board", "Recover the reusable circuit board", "circuit board"),
      put("reuse", "Place board on reuse bench", "circuit board", "board"),
      take("shell", "Lift the empty device shell", "shell"),
      put("recycle", "Place shell in recycling bay", "shell", "shell"),
    ],
    [
      check("battery", "The battery is still mixed with reusable parts."),
      check("board", "A usable board is still in the waste pile."),
      check("shell", "The shell still obstructs the work area."),
    ],
    ["battery", "isolate", "board", "reuse", "shell", "recycle", "test"],
    [
      "Inspect the three materials",
      "Isolate the marked battery",
      "Recover the usable board",
      "Recycle the shell",
      "Check the clear work area",
    ],
  ),
  mission(
    "food",
    2,
    "harvest-chain",
    "food-harvest",
    "Protect a delayed harvest",
    "Keep two harvest crates cool while transport is delayed. A cold store only works after its supply is connected.",
    "coldstore",
    {},
    [
      set("supply", "Connect the cold-store supply", "powered"),
      take("crate-a", "Lift harvest crate A", "harvest A"),
      put("cold-a", "Put crate A inside cold storage", "harvest A", "a", [
        flag("powered"),
      ]),
      take("crate-b", "Lift harvest crate B", "harvest B"),
      put("cold-b", "Put crate B inside cold storage", "harvest B", "b", [
        flag("powered"),
      ]),
      set("vehicle", "Reserve the delayed collection vehicle", "vehicle"),
      set(
        "dispatch",
        "Release both cooled crates to collection",
        "dispatched",
        [flag("a"), flag("b"), flag("vehicle")],
      ),
    ],
    [
      check("powered", "The cold room has no working supply."),
      check(
        "dispatched",
        "Both crates must reach the reserved vehicle through the cold chain.",
      ),
    ],
    [
      "supply",
      "crate-a",
      "cold-a",
      "crate-b",
      "cold-b",
      "vehicle",
      "dispatch",
      "test",
    ],
    [
      "Inspect the delayed collection",
      "Power the cold store",
      "Carry both crates under cover",
      "Reserve collection",
      "Test the delivery after the delay",
    ],
  ),
  mission(
    "food",
    3,
    "grower-payments",
    "food-small-suppliers",
    "Keep small growers in the system",
    "Three small growers need 3 tokens before the next harvest. The buyer offers a 3-token advance and pays 5 more after collection. Settle all 8 owed.",
    "finance",
    { cash: 0 },
    [
      act("advance", "Collect the buyer’s 3-token advance", {
        earn: 3,
        set: { advance: true },
      }),
      pay("small", "Pay the three small growers · 3 tokens", 3, "small", [
        flag("advance"),
      ]),
      set("collect", "Collect the prepared harvest", "harvest", [
        flag("small"),
      ]),
      act(
        "buyer",
        "Deliver harvest and collect 5 tokens",
        { earn: 5, set: { sold: true } },
        [flag("harvest")],
      ),
      pay("settle", "Settle the remaining growers · 5 tokens", 5, "settled", [
        flag("sold"),
      ]),
    ],
    [
      check(
        "small",
        "The small growers could not prepare the harvest without their payment.",
      ),
      check("settled", "The remaining growers are still owed money."),
      check("cash", "The payment ledger does not balance.", 0),
    ],
    ["advance", "small", "collect", "buyer", "settle", "test"],
    [
      "Inspect the payment timing",
      "Collect the advance",
      "Pay small growers first",
      "Deliver the prepared harvest",
      "Settle and check the ledger",
    ],
  ),
  mission(
    "care",
    2,
    "clinic-stock",
    "clinic-supply",
    "Make clinic stock dependable",
    "Keep an expired training box out of usable stock. Carry two sealed supply boxes to the shelf and place a reorder before the delivery trial.",
    "clinic",
    {},
    [
      take("expired", "Collect the expired training box", "expired box"),
      put(
        "quarantine",
        "Move expired box to quarantine",
        "expired box",
        "quarantine",
      ),
      take("supply-a", "Collect sealed supply box A", "sealed A"),
      put("shelf-a", "Stock sealed box A", "sealed A", "a"),
      take("supply-b", "Collect sealed supply box B", "sealed B"),
      put("shelf-b", "Stock sealed box B", "sealed B", "b"),
      set("reorder", "Record the reorder with the delivery desk", "reorder", [
        flag("a"),
        flag("b"),
      ]),
    ],
    [
      check("quarantine", "The expired box is still mixed with clinic stock."),
      check("a", "One usable supply box is missing."),
      check("b", "The second usable supply box is missing."),
      check(
        "reorder",
        "Today’s shelf is stocked, but no replacement delivery is arranged.",
      ),
    ],
    [
      "expired",
      "quarantine",
      "supply-a",
      "shelf-a",
      "supply-b",
      "shelf-b",
      "reorder",
      "test",
    ],
    [
      "Read the box dates",
      "Quarantine expired training stock",
      "Carry sealed stock to the shelf",
      "Record the reorder",
      "Run the next-day supply trial",
    ],
  ),
  mission(
    "care",
    3,
    "clinic-wayfinding",
    "clinic-arrival",
    "Make care easier to reach",
    "Clear the accessible route, place signs at both turns, and connect the appointment desk. Test whether four arrivals reach reception.",
    "access",
    {},
    [
      take("obstruction", "Move the bench out of the access route", "bench"),
      put("bay", "Park the bench in the rest bay", "bench", "clear"),
      take("sign-a", "Lift the street direction sign", "street sign"),
      put("corner", "Place sign at the street turn", "street sign", "street"),
      take("sign-b", "Lift the reception direction sign", "reception sign"),
      put("door", "Place sign at the reception turn", "reception sign", "door"),
      set("desk", "Connect appointments to reception", "desk"),
    ],
    [
      check("clear", "The bench blocks the level route."),
      check("street", "Arrivals miss the street turn."),
      check("door", "Arrivals cannot identify reception."),
      check("desk", "The appointment list is not available at reception."),
    ],
    [
      "obstruction",
      "bay",
      "sign-a",
      "corner",
      "sign-b",
      "door",
      "desk",
      "test",
    ],
    [
      "Walk the arrival route",
      "Clear the level path",
      "Carry signs to both turns",
      "Connect the appointment desk",
      "Run four arrivals",
    ],
  ),
  mission(
    "teach",
    2,
    "equal-parts",
    "learn-equal-parts",
    "Make equal parts visible",
    "Cut one whole into two equal halves, then four equal quarters. Fit all four pieces into the comparison frame so a learner can verify the whole.",
    "fractions",
    {},
    [
      set("halves", "Cut the whole into equal halves", "halves"),
      set("quarters", "Divide both halves into equal quarters", "quarters", [
        flag("halves"),
      ]),
      ...["a", "b", "c", "d"].map((id, i) =>
        set(id, `Fit quarter ${i + 1} into the comparison frame`, id, [
          flag("quarters"),
        ]),
      ),
    ],
    [
      check(
        "quarters",
        "Four unequal pieces are not quarters. Divide the equal halves.",
      ),
      ...["a", "b", "c", "d"].map((k) =>
        check(k, "The comparison frame has a gap. Fit every equal quarter."),
      ),
    ],
    ["halves", "quarters", "a", "b", "c", "d", "test"],
    [
      "Compare the whole",
      "Make two equal halves",
      "Divide each half equally",
      "Fit the four pieces",
      "Let the learner compare the full frame",
    ],
  ),
  mission(
    "teach",
    3,
    "learning-feedback",
    "learn-feedback",
    "Find what each learner needs",
    "Two learners made different mistakes. Observe each attempt, then place the model with the learner who needs the concept and the audio card with the learner who misread.",
    "learning",
    {},
    [
      set("observe-a", "Watch Sade explain her model", "observedA"),
      set("observe-b", "Listen to Emeka read the task", "observedB"),
      take("model", "Collect the comparison model", "comparison model"),
      put(
        "sade",
        "Place model at Sade’s practice table",
        "comparison model",
        "model",
        [flag("observedA")],
      ),
      take("audio", "Collect the spoken instruction card", "audio card"),
      put("emeka", "Place audio card at Emeka’s table", "audio card", "audio", [
        flag("observedB"),
      ]),
      set(
        "independent",
        "Step back and invite independent attempts",
        "independent",
        [flag("model"), flag("audio")],
      ),
    ],
    [
      check("observedA", "Observe Sade’s reasoning before assigning support."),
      check("observedB", "Observe Emeka reading before assigning support."),
      check(
        "independent",
        "The learners have not tried independently with the matched support.",
      ),
    ],
    [
      "observe-a",
      "observe-b",
      "model",
      "sade",
      "audio",
      "emeka",
      "independent",
      "test",
    ],
    [
      "Observe both attempts",
      "Identify the different barriers",
      "Carry the comparison model",
      "Carry spoken instructions",
      "Check independent attempts",
    ],
  ),
  mission(
    "invent",
    2,
    "offline-board",
    "tech-reliability",
    "Keep a service running offline",
    "Charge the backup, disconnect the network, record two requests locally, reconnect and sync once. Disconnect again and check that no requests disappear or duplicate.",
    "network",
    { online: true, local: 0, synced: 0 },
    [
      set("backup", "Charge the board’s backup supply", "backup"),
      act(
        "disconnect",
        "Disconnect the network cable",
        { set: { online: false } },
        [flag("backup")],
      ),
      act(
        "request-a",
        "Record offline request A",
        { add: { local: 1 }, set: { a: true } },
        [flag("online", false)],
      ),
      act(
        "request-b",
        "Record offline request B",
        { add: { local: 1 }, set: { b: true } },
        [flag("online", false)],
      ),
      act(
        "reconnect",
        "Reconnect the network cable",
        { set: { online: true } },
        [flag("a"), flag("b")],
      ),
      act(
        "sync",
        "Synchronise the two local records",
        { set: { synced: 2, sync: true } },
        [flag("online"), flag("a"), flag("b")],
      ),
    ],
    [
      check("backup", "The board cannot survive a power interruption."),
      check(
        "synced",
        "Both local requests must be synchronised exactly once.",
        2,
      ),
      check("local", "A request is missing or duplicated.", 2),
      check(
        "online",
        "Disconnect again to prove local records remain available.",
        false,
      ),
    ],
    [
      "backup",
      "disconnect",
      "request-a",
      "request-b",
      "reconnect",
      "sync",
      "disconnect",
      "test",
    ],
    [
      "Charge the backup supply",
      "Disconnect the network",
      "Record both requests locally",
      "Reconnect and synchronise",
      "Disconnect and check the same two records",
    ],
  ),
  mission(
    "invent",
    3,
    "local-spares",
    "industry-spares",
    "Make a matching replacement part",
    "Use the worn gear as a template. Fit the gauge before casting two replacement gears, then move both to the load-test bench.",
    "fabrication",
    { cast: 0 },
    [
      take("template", "Collect the worn gear template", "gear template"),
      put(
        "gauge",
        "Fit the template in the measuring gauge",
        "gear template",
        "gauged",
      ),
      set("jig", "Set the casting jig from the gauge", "jig", [flag("gauged")]),
      act(
        "cast-a",
        "Cast replacement gear A",
        { take: "new gear A", add: { cast: 1 }, set: { castA: true } },
        [flag("jig")],
      ),
      put("bench-a", "Fit replacement A on the test bench", "new gear A", "a"),
      act(
        "cast-b",
        "Cast replacement gear B",
        { take: "new gear B", add: { cast: 1 }, set: { castB: true } },
        [flag("jig")],
      ),
      put("bench-b", "Fit replacement B on the test bench", "new gear B", "b"),
    ],
    [
      check("gauged", "A copied shape without measurement will not mesh."),
      check("a", "Replacement A has not reached the test bench."),
      check("b", "Replacement B has not reached the test bench."),
      check("cast", "The job needs two measured parts.", 2),
    ],
    [
      "template",
      "gauge",
      "jig",
      "cast-a",
      "bench-a",
      "cast-b",
      "bench-b",
      "test",
    ],
    [
      "Recover the worn template",
      "Measure its fit",
      "Set the matching jig",
      "Cast and carry two parts",
      "Run the loaded mechanism",
    ],
  ),
  mission(
    "culture",
    2,
    "creator-pay",
    "creative-fairpay",
    "Make a festival fair to its makers",
    "The festival has 8 tokens: two creators need 3 each and shared access costs 2. Agree the terms before the performance and settle every commitment.",
    "festival",
    { cash: 8 },
    [
      set("terms", "Agree clear terms with both creators", "terms"),
      pay("maker", "Pay the maker · 3 tokens", 3, "maker", [flag("terms")]),
      pay("performer", "Pay the performer · 3 tokens", 3, "performer", [
        flag("terms"),
      ]),
      pay("access", "Fund shared stall access · 2 tokens", 2, "access"),
      set("stage", "Invite both creators to the stage", "stage", [
        flag("maker"),
        flag("performer"),
        flag("access"),
      ]),
    ],
    [
      check("terms", "Creators cannot join on unclear terms."),
      check("stage", "Both paid creators and shared access must be ready."),
      check("cash", "The festival commitments must balance.", 0),
    ],
    ["terms", "maker", "performer", "access", "stage", "test"],
    [
      "Read the festival budget",
      "Agree clear terms",
      "Pay both creators",
      "Fund shared access",
      "Run an inclusive performance",
    ],
  ),
  mission(
    "culture",
    3,
    "offline-audience",
    "creative-audience",
    "Reach people beyond a phone screen",
    "Carry event posters to the market and learning club. Add a spoken announcement and a caption strip so people can find the event in different ways.",
    "media",
    {},
    [
      take("poster-a", "Collect the market event poster", "market poster"),
      put(
        "market",
        "Place poster on market noticeboard",
        "market poster",
        "market",
      ),
      take("poster-b", "Collect the learning-club poster", "learning poster"),
      put(
        "club",
        "Place poster at the learning club",
        "learning poster",
        "club",
      ),
      set("spoken", "Record a spoken event announcement", "spoken"),
      take("caption", "Collect the large-print caption strip", "caption strip"),
      put(
        "screen",
        "Fit captions beside the announcement",
        "caption strip",
        "captions",
      ),
    ],
    [
      check("market", "Offline market residents have no event information."),
      check("club", "Learning-club residents have no event information."),
      check("spoken", "Residents who need spoken information are excluded."),
      check("captions", "The spoken announcement has no readable alternative."),
    ],
    [
      "poster-a",
      "market",
      "poster-b",
      "club",
      "spoken",
      "caption",
      "screen",
      "test",
    ],
    [
      "Map who cannot find events",
      "Carry posters to both public places",
      "Record a spoken invitation",
      "Fit a readable caption strip",
      "Test who can discover the event",
    ],
  ),
  mission(
    "enterprise",
    2,
    "order-trust",
    "enterprise-trust",
    "Deliver what was promised",
    "Match each marked order to its parcel. Deliver both, then honour the marked return with a refund and an updated stock record.",
    "orders",
    { cash: 2 },
    [
      take("order-a", "Collect parcel A · Ada’s order", "parcel A"),
      put("ada", "Deliver parcel A to Ada", "parcel A", "a"),
      take("order-b", "Collect parcel B · Bayo’s order", "parcel B"),
      put("bayo", "Deliver parcel B to Bayo", "parcel B", "b"),
      take("return", "Collect Bayo’s marked return", "returned B"),
      put(
        "stock",
        "Return parcel B to inspected stock",
        "returned B",
        "returned",
        [flag("b")],
      ),
      pay("refund", "Refund Bayo · 2 tokens", 2, "refunded", [
        flag("returned"),
      ]),
    ],
    [
      check("a", "Ada has not received her matching parcel."),
      check("b", "Bayo has not received his matching parcel."),
      check("returned", "The returned item is not accounted for."),
      check(
        "refunded",
        "The agreed return was received but the refund is still owed.",
      ),
    ],
    ["order-a", "ada", "order-b", "bayo", "return", "stock", "refund", "test"],
    [
      "Read each named order",
      "Match and deliver both parcels",
      "Collect the marked return",
      "Inspect and record returned stock",
      "Refund and audit the promises",
    ],
  ),
  mission(
    "enterprise",
    3,
    "working-cash",
    "enterprise-cash",
    "Turn sales into a solvent enterprise",
    "A 4-token cooperative advance buys a batch. The buyer owes 6 on collection. Collect the cash, repay 4 and pay 2 for delivery; an unpaid order is not spendable cash.",
    "cashflow",
    { cash: 0 },
    [
      act("advance", "Receive the cooperative’s 4-token advance", {
        earn: 4,
        set: { advance: true, debt: 4 },
      }),
      pay("stock", "Buy the production batch · 4 tokens", 4, "stock", [
        flag("advance"),
      ]),
      set("invoice", "Deliver batch and issue the 6-token invoice", "invoice", [
        flag("stock"),
      ]),
      act(
        "collect",
        "Collect the buyer’s 6-token payment",
        { earn: 6, set: { paid: true } },
        [flag("invoice")],
      ),
      act(
        "repay",
        "Repay the cooperative · 4 tokens",
        { spend: 4, set: { debt: 0, repaid: true } },
        [flag("paid")],
      ),
      pay("delivery", "Pay the delivery crew · 2 tokens", 2, "delivery", [
        flag("invoice"),
      ]),
    ],
    [
      check("paid", "The buyer’s order is not yet cash in hand."),
      check("debt", "The advance still needs repayment.", 0),
      check("delivery", "The delivery crew has not been paid."),
      check("cash", "The cash ledger must reconcile.", 0),
    ],
    ["advance", "stock", "invoice", "collect", "repay", "delivery", "test"],
    [
      "Read cash and obligations",
      "Fund a small production batch",
      "Deliver and record the invoice",
      "Collect actual payment",
      "Settle the advance and crew",
    ],
  ),
  mission(
    "connect",
    2,
    "priority-delivery",
    "transit-delivery",
    "Deliver through a closed road",
    "Close the flooded shortcut and open the longer dry route. Carry clinic supplies first, then the farm load. The clinic must receive its load before the route’s first slot is used.",
    "logistics",
    { slot: 0 },
    [
      set("closure", "Place a closure barrier at the flooded road", "closed"),
      set("bypass", "Open the signed dry bypass", "bypass", [flag("closed")]),
      take("medical", "Collect the clinic delivery", "clinic load"),
      act(
        "clinic",
        "Deliver clinic load through the bypass",
        { put: "clinic load", set: { clinic: true }, add: { slot: 1 } },
        [flag("bypass")],
      ),
      take("farm", "Collect the farm delivery", "farm load"),
      act(
        "market",
        "Deliver farm load through the bypass",
        { put: "farm load", set: { farm: true }, add: { slot: 1 } },
        [flag("bypass")],
      ),
    ],
    [
      check("closed", "The flooded shortcut is still open to vehicles."),
      check(
        "clinicFirst",
        "The clinic missed the first delivery slot. Reset this delivery trial and prioritise its load.",
      ),
      check("farm", "The farm load has not arrived."),
      check("slot", "Both deliveries must be accounted for.", 2),
    ],
    ["closure", "bypass", "medical", "clinic", "farm", "market", "test"],
    [
      "Inspect the road closure",
      "Sign the dry route",
      "Carry the urgent clinic load first",
      "Complete the farm delivery",
      "Check both arrival slots",
    ],
  ),
  mission(
    "connect",
    3,
    "safe-crossing",
    "transit-people",
    "Give people a safe crossing",
    "Hold vehicle traffic before escorting the group. Place the ramp and both approach barriers, bring the children across, then release traffic after the crossing is clear.",
    "crossing",
    {},
    [
      set("hold", "Hold vehicle traffic at the stop line", "held"),
      set("ramp", "Place the level crossing ramp", "ramp"),
      set("barriers", "Place both approach barriers", "barriers"),
      set("escort", "Escort the group across the marked route", "crossed", [
        flag("held"),
        flag("ramp"),
        flag("barriers"),
      ]),
      act(
        "release",
        "Release traffic after the group arrives",
        { set: { held: false, released: true } },
        [flag("crossed")],
      ),
    ],
    [
      check(
        "crossed",
        "The group has not crossed on the protected level route.",
      ),
      check(
        "released",
        "Vehicles remain stopped. Clear the crossing and release traffic.",
      ),
      check("held", "The crossing is still holding the whole road.", false),
    ],
    ["hold", "ramp", "barriers", "escort", "release", "test"],
    [
      "Stop approaching vehicles",
      "Make the level route accessible",
      "Protect both approaches",
      "Escort the group across",
      "Clear the route and release traffic",
    ],
  ),
  mission(
    "trust",
    2,
    "shared-voices",
    "civic-voices",
    "Build a decision everyone can enter",
    "Carry seats for traders, young residents and residents with access needs. Bring each group’s proposal to the common table before opening the decision meeting.",
    "council",
    {},
    [
      take("trader-seat", "Lift the traders’ seat", "trader seat"),
      put(
        "trader",
        "Place traders’ seat at the common table",
        "trader seat",
        "trader",
      ),
      take("youth-seat", "Lift the young residents’ seat", "youth seat"),
      put(
        "youth",
        "Place young residents’ seat at the table",
        "youth seat",
        "youth",
      ),
      set("level", "Open the level entrance for access needs", "level"),
      set(
        "proposals",
        "Bring all three groups’ proposals to the table",
        "proposals",
        [flag("trader"), flag("youth"), flag("level")],
      ),
      set("meeting", "Give every group a speaking turn", "meeting", [
        flag("proposals"),
      ]),
    ],
    [
      check("level", "Some residents cannot enter the meeting."),
      check(
        "meeting",
        "Not every group has had access, a proposal and a speaking turn.",
      ),
    ],
    [
      "trader-seat",
      "trader",
      "youth-seat",
      "youth",
      "level",
      "proposals",
      "meeting",
      "test",
    ],
    [
      "Find the missing voices",
      "Carry seats to one shared table",
      "Open level access",
      "Bring every group’s proposal",
      "Test equal speaking turns",
    ],
  ),
  mission(
    "trust",
    3,
    "repair-accountability",
    "civic-repairs",
    "Close the loop on reported faults",
    "Carry the water and path fault tickets to their responsible crews. Inspect the completed work, then return confirmed receipts to the reporting residents.",
    "accountability",
    {},
    [
      take("water-ticket", "Collect the water fault ticket", "water ticket"),
      put(
        "water-crew",
        "Give water ticket to the water crew",
        "water ticket",
        "water",
      ),
      take("path-ticket", "Collect the path fault ticket", "path ticket"),
      put(
        "path-crew",
        "Give path ticket to the path crew",
        "path ticket",
        "path",
      ),
      set("inspect", "Inspect both completed repairs", "inspected", [
        flag("water"),
        flag("path"),
      ]),
      set("receipts", "Return checked receipts to residents", "receipts", [
        flag("inspected"),
      ]),
    ],
    [
      check("water", "The water fault has no responsible crew."),
      check("path", "The path fault has no responsible crew."),
      check("inspected", "Assigned does not mean fixed. Inspect the work."),
      check(
        "receipts",
        "Residents still cannot tell whether their reports were resolved.",
      ),
    ],
    [
      "water-ticket",
      "water-crew",
      "path-ticket",
      "path-crew",
      "inspect",
      "receipts",
      "test",
    ],
    [
      "Collect both reported faults",
      "Carry each ticket to its crew",
      "Let the crews act",
      "Inspect the work",
      "Return verified receipts",
    ],
  ),
  mission(
    "environment",
    2,
    "waste-loop",
    "green-waste",
    "Keep recovered waste moving",
    "Put food scraps in the compost bay and plastic in the recovery bay. Clear the collection lane and arrange the next collection so both streams keep moving.",
    "compost",
    {},
    [
      take("scraps", "Collect the food-scrap crate", "food scraps"),
      put(
        "compost",
        "Carry scraps to the compost bay",
        "food scraps",
        "organics",
      ),
      take("plastic", "Collect the plastic crate", "plastic"),
      put(
        "recovery",
        "Carry plastic to the recovery bay",
        "plastic",
        "plastic",
      ),
      set("lane", "Clear the collection lane", "lane"),
      set("collection", "Arrange the next separate collection", "collection", [
        flag("lane"),
        flag("organics"),
        flag("plastic"),
      ]),
    ],
    [
      check("organics", "Food scraps remain in the mixed pile."),
      check("plastic", "Plastic must stay out of the compost."),
      check(
        "collection",
        "Sorting once will not prevent tomorrow’s pile. Clear the lane and arrange collection.",
      ),
    ],
    ["scraps", "compost", "plastic", "recovery", "lane", "collection", "test"],
    [
      "Inspect the mixed pile",
      "Carry organics to compost",
      "Carry plastic to recovery",
      "Clear the collection lane",
      "Test the next collection cycle",
    ],
  ),
  mission(
    "environment",
    3,
    "power-sharing",
    "power-demand",
    "Share a limited midday supply",
    "The midday supply has 4 units. Clinic and cooling each need 2; the workshop needs 3. Move the workshop to stored evening power and keep both priority services supplied at midday.",
    "energy",
    { midday: 0 },
    [
      act("clinic", "Connect clinic’s 2-unit midday load", {
        add: { midday: 2 },
        set: { clinic: true },
      }),
      act("cooling", "Connect cooling’s 2-unit midday load", {
        add: { midday: 2 },
        set: { cooling: true },
      }),
      act("workshop", "Connect workshop at midday", {
        add: { midday: 3 },
        set: { workshopMidday: true },
      }),
      act(
        "shift",
        "Move workshop to the evening circuit",
        { set: { workshopEvening: true, workshopMidday: false } },
        [],
      ),
      set("storage", "Charge the 3-unit evening storage", "storage"),
    ],
    [
      check("clinic", "The clinic has no allocated midday supply."),
      check("cooling", "The food store has no cooling supply."),
      check(
        "workshopEvening",
        "The workshop needs a separate evening operating slot.",
      ),
      check(
        "storage",
        "Moving a load does not create energy. Charge the evening storage.",
      ),
      check("capacity", "Midday demand exceeds the 4 available units."),
    ],
    ["clinic", "cooling", "shift", "storage", "test"],
    [
      "Inspect supply and each load",
      "Connect priority midday services",
      "Check the overloaded circuit",
      "Shift workshop work to evening",
      "Charge storage and test both periods",
    ],
  ),
  mission(
    "legacy",
    2,
    "resident-upkeep",
    "homes-upkeep",
    "Give the neighbourhood a maintenance system",
    "Residents need named owners for drains, paths and shared gardens. Carry each duty card to its team, fund three upkeep tokens, then test an absence handover.",
    "maintenance",
    { cash: 3 },
    [
      take("drain-card", "Collect the drain duty card", "drain card"),
      put(
        "drain-team",
        "Give drain duty to the water team",
        "drain card",
        "drain",
      ),
      take("path-card", "Collect the path duty card", "path card"),
      put(
        "path-team",
        "Give path duty to the access team",
        "path card",
        "path",
      ),
      set("garden", "Assign shared garden care to residents", "garden"),
      pay("reserve", "Fund the 3-token upkeep reserve", 3, "reserve"),
      set("deputy", "Practise the named deputy handover", "deputy", [
        flag("drain"),
        flag("path"),
        flag("garden"),
      ]),
    ],
    [
      check("drain", "Drain care has no named owner."),
      check("path", "Path care has no named owner."),
      check("garden", "The shared garden has no owner."),
      check("reserve", "Maintenance has no operating reserve."),
      check("deputy", "The system still stops when one person is absent."),
    ],
    [
      "drain-card",
      "drain-team",
      "path-card",
      "path-team",
      "garden",
      "reserve",
      "deputy",
      "test",
    ],
    [
      "Inspect shared upkeep needs",
      "Carry named duty cards",
      "Agree garden ownership",
      "Fund ongoing care",
      "Test a deputy handover",
    ],
  ),
  mission(
    "legacy",
    3,
    "next-generation",
    "industry-workers",
    "Build a team that can continue without you",
    "Prepare an isolated training station, demonstrate to the first apprentice, then let that apprentice teach the next. Finish with a fault drill and a city-wide handover.",
    "handover",
    {},
    [
      set("isolate", "Isolate the fictional training machine", "isolated"),
      set("demonstrate", "Demonstrate the measured practice job", "shown", [
        flag("isolated"),
      ]),
      set("first", "Invite apprentice A to complete the job", "first", [
        flag("shown"),
      ]),
      set("peer", "Let apprentice A teach apprentice B", "peer", [
        flag("first"),
      ]),
      set("second", "Invite apprentice B’s independent attempt", "second", [
        flag("peer"),
      ]),
      set("drill", "Run a fault-report and repair drill", "drill", [
        flag("second"),
      ]),
      set("guide", "Publish the team’s shared operating guide", "guide", [
        flag("drill"),
      ]),
    ],
    [
      check(
        "second",
        "The next apprentice has not succeeded through peer teaching.",
      ),
      check("drill", "The team has not practised responding to a fault."),
      check("guide", "The operating knowledge is still private."),
      check(
        "cityReady",
        "Finish the other 35 challenges and all six tested construction prototypes before the city handover.",
      ),
    ],
    [
      "isolate",
      "demonstrate",
      "first",
      "peer",
      "second",
      "drill",
      "guide",
      "test",
    ],
    [
      "Prepare the isolated practice station",
      "Demonstrate and test the first apprentice",
      "Let that apprentice teach another",
      "Run a fault-response drill",
      "Hand over the tested city system",
    ],
  ),
].map((m) =>
  Object.freeze({
    ...m,
    brief: PRODUCTION_CHALLENGE_LIBRARY.find((c) => c.id === m.source)
      .situation,
    reflection: PRODUCTION_CHALLENGE_LIBRARY.find((c) => c.id === m.source)
      .reflection,
  }),
);
export const practicalForChapter = (id) =>
  PRACTICAL_MISSIONS.filter((m) => m.chapter === id);
export const practicalById = (id) =>
  PRACTICAL_MISSIONS.find((m) => m.id === id);
export function freshPractical(m) {
  return {
    ...m.initial,
    carrying: null,
    used: [],
    tests: 0,
    done: false,
    result: null,
  };
}
export const newPracticalState = () =>
  Object.fromEntries(PRACTICAL_MISSIONS.map((m) => [m.id, freshPractical(m)]));
export function practicalReport(m, s, context = {}) {
  const derived = { ...s };
  if (m.id === "priority-delivery") derived.clinicFirst = !!s.clinicFirst;
  if (m.id === "power-sharing")
    derived.capacity =
      (s.clinic ? 2 : 0) + (s.cooling ? 2 : 0) + (s.workshopMidday ? 3 : 0) <=
      4;
  if (m.id === "next-generation")
    derived.cityReady =
      context.otherChallenges === 35 && context.prototypes === 6;
  const issues = m.checks
    .filter((c) => derived[c.key] !== c.value)
    .map((c) => c.message);
  if (s.carrying)
    issues.push(
      "Finish carrying this item to its matching place before testing.",
    );
  const completed =
    m.checks.length - m.checks.filter((c) => derived[c.key] !== c.value).length;
  return {
    success: issues.length === 0,
    issues,
    completed,
    total: m.checks.length,
    metrics:
      m.kind === "energy"
        ? `Midday ${(s.clinic ? 2 : 0) + (s.cooling ? 2 : 0) + (s.workshopMidday ? 3 : 0)}/4 units · Evening ${s.workshopEvening && s.storage ? "3/3 supplied" : "not supplied"}`
        : m.kind === "finance" || m.kind === "cashflow" || m.kind === "festival"
          ? `Cash ${s.cash} tokens${s.debt !== undefined ? ` · Owed ${s.debt}` : ""}`
          : m.kind === "network"
            ? `Local ${s.local}/2 · Synced ${s.synced}/2 · ${s.online ? "online" : "offline"}`
            : `${completed}/${m.checks.length} outcome checks ready`,
  };
}
export function practicalAction(states, id, action, context = {}) {
  const m = practicalById(id),
    before = states[id];
  if (!m || !before)
    return {
      state: states,
      changed: false,
      message: "Choose a city work object.",
    };
  if (action === "test") {
    const result = practicalReport(m, before, context),
      s = { ...before, tests: before.tests + 1, done: result.success, result };
    return {
      state: { ...states, [id]: s },
      changed: true,
      tested: true,
      message: result.success
        ? `${m.title} works. ${result.metrics}.`
        : result.issues.join(" "),
    };
  }
  const a = m.actions.find((a) => a.id === action);
  if (!a)
    return {
      state: states,
      changed: false,
      message: "Choose a labelled work object.",
    };
  const repeatable =
    id === "offline-board" && ["disconnect", "reconnect"].includes(action);
  if (before.used.includes(action) && !repeatable)
    return {
      state: states,
      changed: false,
      message:
        "That work is already in place. Check the result or restart this challenge to try another approach.",
    };
  const missing = a.needs.find(([key, value]) => before[key] !== value);
  if (missing)
    return {
      state: states,
      changed: false,
      message: `Not ready: ${m.actions.find((a) => Object.hasOwn(a.effect.set ?? {}, missing[0]))?.name ?? missing[0]}. ${a.detail || "Inspect the connected objects before trying again."}`,
    };
  const e = a.effect;
  if (e.take && before.carrying)
    return {
      state: states,
      changed: false,
      message: `Your hands hold ${before.carrying}. Put it in its matching place first.`,
    };
  if (e.put && before.carrying !== e.put)
    return {
      state: states,
      changed: false,
      message: `This place needs ${e.put}${before.carrying ? `, not ${before.carrying}` : ""}. Carry the matching item here.`,
    };
  if (e.spend && (before.cash ?? 0) < e.spend)
    return {
      state: states,
      changed: false,
      message: `Only ${before.cash ?? 0} cash tokens are available; this commitment needs ${e.spend}. Collect payment before spending it.`,
    };
  const s = {
    ...before,
    used: [...new Set([...before.used, action])],
    done: false,
    result: null,
    ...e.set,
  };
  if (e.take) s.carrying = e.take;
  if (e.put) s.carrying = null;
  if (e.earn || e.spend)
    s.cash = (s.cash ?? 0) + (e.earn ?? 0) - (e.spend ?? 0);
  for (const [key, n] of Object.entries(e.add ?? {}))
    s[key] = (s[key] ?? 0) + n;
  if (id === "priority-delivery" && action === "clinic")
    s.clinicFirst = before.slot === 0;
  if (id === "power-sharing" && action === "shift")
    s.midday = (s.clinic ? 2 : 0) + (s.cooling ? 2 : 0);
  return {
    state: { ...states, [id]: s },
    changed: true,
    message: `${a.name}. ${practicalReport(m, s, context).metrics}. Test to observe the consequence.`,
  };
}
export function practicalCentre(m) {
  const chapter = BUILDER_CHAPTERS.find((c) => c.id === m.chapter);
  return (
    CITY_PROJECTS.find(
      (p) =>
        p.id === (chapter.site ?? (m.chapter === "market" ? "homes" : null)),
    ) ??
    BUILDER_MISSIONS.find((c) => c.id === m.chapter) ?? { x: 19.5, z: 15 }
  );
}
export const PRACTICAL_OBJECTS = PRACTICAL_MISSIONS.flatMap((m) =>
  [...m.actions, { id: "test", name: `Test · ${m.title}` }].map((a, i, all) => {
    const c = practicalCentre(m),
      angle = (i / all.length) * Math.PI * 2;
    const x = c.x + Math.sin(angle) * 4.2,
      z = c.z + Math.cos(angle) * 4.2;
    return {
      id: `${m.id}:${a.id}`,
      extra: m.id,
      chapter: m.chapter,
      action: a.id,
      name: a.name,
      x,
      z,
      approach: {
        x: c.x + Math.sin(angle) * 5.6,
        z: c.z + Math.cos(angle) * 5.6,
      },
    };
  }),
);
