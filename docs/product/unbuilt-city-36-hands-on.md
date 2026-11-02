# The Unbuilt City: 36 hands-on challenges

This implementation extends the retained production city. Each chapter has its existing primary outcome and two new independently tested practical challenges. The 24 new missions reuse 24 distinct production briefs and their relevant practical needs. They are city interactions, not question cards or a replacement tile puzzle.

| Chapter                        | Challenge 1                      | Challenge 2                                 | Challenge 3                                |
| ------------------------------ | -------------------------------- | ------------------------------------------- | ------------------------------------------ |
| 1. Notice what matters         | Observation & public services    | Keep dirty runoff away                      | Make the service queue reliable            |
| 2. Make things work again      | Repair & useful spaces           | Keep a repair bench supplied                | Recover value without mixing hazards       |
| 3. Grow and share enough       | Agriculture & food security      | Protect a delayed harvest                   | Keep small growers in the system           |
| 4. Care for people             | Health & service operations      | Make clinic stock dependable                | Make care easier to reach                  |
| 5. Help others learn           | Education & human development    | Make equal parts visible                    | Find what each learner needs               |
| 6. Invent useful tools         | Engineering & technology         | Keep a service running offline              | Make a matching replacement part           |
| 7. Bring people together       | Arts, sport & inclusion          | Make a festival fair to its makers          | Reach people beyond a phone screen         |
| 8. Create value people need    | Enterprise & responsible finance | Deliver what was promised                   | Turn sales into a solvent enterprise       |
| 9. Connect the city            | Transport & coordination         | Deliver through a closed road               | Give people a safe crossing                |
| 10. Build trust and teams      | Leadership & cooperation         | Build a decision everyone can enter         | Close the loop on reported faults          |
| 11. Protect tomorrow           | Environment & resilience         | Keep recovered waste moving                 | Share a limited midday supply              |
| 12. Leave something that lasts | Stewardship & city systems       | Give the neighbourhood a maintenance system | Build a team that can continue without you |

## Play and completion

The original avatar must walk to each city object before its action runs. The practical engine supports single-item carrying, matched deliveries, finite stock, cash and obligations, observation prerequisites, repair sequences, offline records, accessible routes and outcome trials. Opening a challenge or pressing Test early does not pass it. Wrong deliveries and spending beyond available cash are rejected. A late urgent delivery or overloaded power circuit fails its trial. Restart resets only the current practical challenge; repeated completed operations cannot generate duplicate items or money.

Each chapter unlocks its next challenge in order. All three must pass before the next chapter unlocks or the existing once-per-chapter credit reward is issued. Previous chapters and their challenges are reachable through City menu. Six construction prototypes remain separate practical worksites; the final handover requires all six opened prototypes and the other 35 useful outcomes. Crews use the production building recipes to fill the same bounded 70-parcel city plan. Replays do not multiply parcels.

## Camera and first visit

Start first shows a short city welcome with purpose, 12 chapters/36 challenges and tap/drag/pinch controls. Begin enters the first challenge; Continue in the same page session retains the current task and does not repeat the welcome. Instructions remain at the bottom. Site names are transparent outlined text, with target dots and collision-aware label placement. Crowded labels can be reached through City menu object controls and the city object itself.

Pinch, wheel, keyboard +/− and visible +/− buttons control worksite and city-overview zoom. The safe fitted camera remains the default; manual inspection may crop the full work area while keeping camera clearance. Every worked object or test starts a bounded 2.6-second reveal: the camera moves towards the changed area, makes a small orbit and pulls back. Labels step aside during the reveal; manual camera input interrupts it. Chapter celebration follows the reveal rather than covering it. Reduced-motion preferences skip cinematic motion while keeping the final result and feedback.

## Content sources and practical actions

### 1.2 Keep dirty runoff away

Production source: `water-sanitation`. After a storm, dirty runoff approaches the neighbourhood's shared water area and a nearby drainage channel is blocked.

Outcome: Find the storm path. Clear the blockage and place a barrier so dirty runoff cannot reach the collection point.

1. Follow the runoff
2. Inspect the blocked route
3. Carry the barrier
4. Protect the water edge
5. Run the storm test

Completion checks: Trace the runoff before changing its route. Dirty water still crosses the collection area. Place the barrier. Runoff has nowhere to go. Clear the downstream drain.

Real-world bridge: Observe how drainage, sanitation and water professionals work together; do not handle unsafe water.

### 1.3 Make the service queue reliable

Production source: `tech-booking`. Residents travel to three different service desks only to find that their name is missing from the queue. A youth team proposes a digital tool.

Outcome: Carry each resident’s request to the right service desk. Keep one record per person, then check both arrivals.

1. Read the residents’ requests
2. Carry a request
3. Find its service desk
4. Publish confirmed places
5. Test both arrivals

Completion checks: Ada is missing from the water queue. Bayo is missing from the repair queue. Residents cannot see their confirmed place. Publish the shared board.

Real-world bridge: Ask users which problem is most important and consider people without smartphones.

### 2.2 Keep a repair bench supplied

Production source: `repair-parts`. The workshop keeps running out of a small part. Deliveries come once a week, and customers bring different devices.

Outcome: Recover a usable gear, bring the matching bearing, and fit both on the repair bench. Keep the reserve separate from the live job.

1. Inspect the missing parts
2. Recover the gear
3. Match the bearing
4. Stock the reserve
5. Run two repair jobs

Completion checks: The mechanism has no gear. The gear cannot run without its matching bearing. This job works once, but the next job has no spare. Stock the reserve rack.

Real-world bridge: Notice how a repair shop could use records without collecting private customer information.

### 2.3 Recover value without mixing hazards

Production source: `repair-waste`. A pile of broken items grows behind the workshop. Some contain batteries; some have reusable components.

Outcome: Move the battery to the isolated tray, the board to the reuse bench and the shell to recycling. Test the cleared work area.

1. Inspect the three materials
2. Isolate the marked battery
3. Recover the usable board
4. Recycle the shell
5. Check the clear work area

Completion checks: The battery is still mixed with reusable parts. A usable board is still in the waste pile. The shell still obstructs the work area.

Real-world bridge: Ask a qualified recycler which household devices require special handling.

### 3.2 Protect a delayed harvest

Production source: `food-harvest`. Growers have eight usable crates today, but transport is delayed and the market has limited cold storage.

Outcome: Keep two harvest crates cool while transport is delayed. A cold store only works after its supply is connected.

1. Inspect the delayed collection
2. Power the cold store
3. Carry both crates under cover
4. Reserve collection
5. Test the delivery after the delay

Completion checks: The cold room has no working supply. Both crates must reach the reserved vehicle through the cold chain.

Real-world bridge: Observe how markets coordinate deliveries; do not test spoiled food for safety.

### 3.3 Keep small growers in the system

Production source: `food-small-suppliers`. A buyer will pay later, but three small growers need money today to prepare their next harvest.

Outcome: Three small growers need 3 tokens before the next harvest. The buyer offers a 3-token advance and pays 5 more after collection. Settle all 8 owed.

1. Inspect the payment timing
2. Collect the advance
3. Pay small growers first
4. Deliver the prepared harvest
5. Settle and check the ledger

Completion checks: The small growers could not prepare the harvest without their payment. The remaining growers are still owed money. The payment ledger does not balance.

Real-world bridge: Ask a trusted adult why cash-flow timing differs from making a profit.

### 4.2 Make clinic stock dependable

Production source: `clinic-supply`. Clinic workers discover that commonly used supplies run out unexpectedly. Deliveries depend on roads and careful records.

Outcome: Keep an expired training box out of usable stock. Carry two sealed supply boxes to the shelf and place a reorder before the delivery trial.

1. Read the box dates
2. Quarantine expired training stock
3. Carry sealed stock to the shelf
4. Record the reorder
5. Run the next-day supply trial

Completion checks: The expired box is still mixed with clinic stock. One usable supply box is missing. The second usable supply box is missing. Today’s shelf is stocked, but no replacement delivery is arranged.

Real-world bridge: Ask professionals how stock lists and verified supply chains prevent shortages.

### 4.3 Make care easier to reach

Production source: `clinic-arrival`. The clinic sees many people arriving only after their problems worsen. Travel and appointment information are confusing.

Outcome: Clear the accessible route, place signs at both turns, and connect the appointment desk. Test whether four arrivals reach reception.

1. Walk the arrival route
2. Clear the level path
3. Carry signs to both turns
4. Connect the appointment desk
5. Run four arrivals

Completion checks: The bench blocks the level route. Arrivals miss the street turn. Arrivals cannot identify reception. The appointment list is not available at reception.

Real-world bridge: Ask a healthcare worker how clear referral information and early support help families.

### 5.2 Make equal parts visible

Production source: `learn-equal-parts`. A learner calls any of four unequal pieces a quarter. Another understands visually but struggles with a written explanation.

Outcome: Cut one whole into two equal halves, then four equal quarters. Fit all four pieces into the comparison frame so a learner can verify the whole.

1. Compare the whole
2. Make two equal halves
3. Divide each half equally
4. Fit the four pieces
5. Let the learner compare the full frame

Completion checks: Four unequal pieces are not quarters. Divide the equal halves. The comparison frame has a gap. Fit every equal quarter. The comparison frame has a gap. Fit every equal quarter. The comparison frame has a gap. Fit every equal quarter. The comparison frame has a gap. Fit every equal quarter.

Real-world bridge: Try drawing four equal parts and four unequal parts of the same whole.

### 5.3 Find what each learner needs

Production source: `learn-feedback`. Two learners get the same answer wrong. One misunderstands the idea; the other misreads the instruction.

Outcome: Two learners made different mistakes. Observe each attempt, then place the model with the learner who needs the concept and the audio card with the learner who misread.

1. Observe both attempts
2. Identify the different barriers
3. Carry the comparison model
4. Carry spoken instructions
5. Check independent attempts

Completion checks: Observe Sade’s reasoning before assigning support. Observe Emeka reading before assigning support. The learners have not tried independently with the matched support.

Real-world bridge: Ask how explanation and feedback can reveal more than a score alone.

### 6.2 Keep a service running offline

Production source: `tech-reliability`. The new service board helps residents, but internet access sometimes disappears and phones run out of power.

Outcome: Charge the backup, disconnect the network, record two requests locally, reconnect and sync once. Disconnect again and check that no requests disappear or duplicate.

1. Charge the backup supply
2. Disconnect the network
3. Record both requests locally
4. Reconnect and synchronise
5. Disconnect and check the same two records

Completion checks: The board cannot survive a power interruption. Both local requests must be synchronised exactly once. A request is missing or duplicated. Disconnect again to prove local records remain available.

Real-world bridge: Observe how services work when there is no connection or electricity.

### 6.3 Make a matching replacement part

Production source: `industry-spares`. The making yard can produce a few useful parts locally. Repair shops and farmers report frequent delays for simple replacements.

Outcome: Use the worn gear as a template. Fit the gauge before casting two replacement gears, then move both to the load-test bench.

1. Recover the worn template
2. Measure its fit
3. Set the matching jig
4. Cast and carry two parts
5. Run the loaded mechanism

Completion checks: A copied shape without measurement will not mesh. Replacement A has not reached the test bench. Replacement B has not reached the test bench. The job needs two measured parts.

Real-world bridge: Observe how prototypes, safety standards and real customer needs shape useful manufacturing.

### 7.2 Make a festival fair to its makers

Production source: `creative-fairpay`. Young artists, makers and performers are invited to a popular city festival, but payment terms are unclear and some creators cannot afford to participate.

Outcome: The festival has 8 tokens: two creators need 3 each and shared access costs 2. Agree the terms before the performance and settle every commitment.

1. Read the festival budget
2. Agree clear terms
3. Pay both creators
4. Fund shared access
5. Run an inclusive performance

Completion checks: Creators cannot join on unclear terms. Both paid creators and shared access must be ready. The festival commitments must balance.

Real-world bridge: Discuss why creators need clear consent, attribution and fair agreements.

### 7.3 Reach people beyond a phone screen

Production source: `creative-audience`. A community storyteller shares valuable local work, but residents who are not online cannot easily find events or opportunities.

Outcome: Carry event posters to the market and learning club. Add a spoken announcement and a caption strip so people can find the event in different ways.

1. Map who cannot find events
2. Carry posters to both public places
3. Record a spoken invitation
4. Fit a readable caption strip
5. Test who can discover the event

Completion checks: Offline market residents have no event information. Learning-club residents have no event information. Residents who need spoken information are excluded. The spoken announcement has no readable alternative.

Real-world bridge: Ask how public events can work for people with different abilities and access to technology.

### 8.2 Deliver what was promised

Production source: `enterprise-trust`. A new enterprise has customers but no clear stock records or return arrangements. Some people complain about missing orders.

Outcome: Match each marked order to its parcel. Deliver both, then honour the marked return with a refund and an updated stock record.

1. Read each named order
2. Match and deliver both parcels
3. Collect the marked return
4. Inspect and record returned stock
5. Refund and audit the promises

Completion checks: Ada has not received her matching parcel. Bayo has not received his matching parcel. The returned item is not accounted for. The agreed return was received but the refund is still owed.

Real-world bridge: Ask a small business how it records orders and handles customer complaints fairly.

### 8.3 Turn sales into a solvent enterprise

Production source: `enterprise-cash`. Several new shop owners sell goods on credit. They have orders but cannot always pay growers and transport workers on time.

Outcome: A 4-token cooperative advance buys a batch. The buyer owes 6 on collection. Collect the cash, repay 4 and pay 2 for delivery; an unpaid order is not spendable cash.

1. Read cash and obligations
2. Fund a small production batch
3. Deliver and record the invoice
4. Collect actual payment
5. Settle the advance and crew

Completion checks: The buyer’s order is not yet cash in hand. The advance still needs repayment. The delivery crew has not been paid. The cash ledger must reconcile.

Real-world bridge: Discuss why sales, cash received and payments due are different numbers.

### 9.2 Deliver through a closed road

Production source: `transit-delivery`. Roadworks block a route used by farms, workshop customers and the clinic. A delivery vehicle has limited time.

Outcome: Close the flooded shortcut and open the longer dry route. Carry clinic supplies first, then the farm load. The clinic must receive its load before the route’s first slot is used.

1. Inspect the road closure
2. Sign the dry route
3. Carry the urgent clinic load first
4. Complete the farm delivery
5. Check both arrival slots

Completion checks: The flooded shortcut is still open to vehicles. The clinic missed the first delivery slot. Reset this delivery trial and prioritise its load. The farm load has not arrived. Both deliveries must be accounted for.

Real-world bridge: Notice how safe road access and clear schedules connect different city services.

### 9.3 Give people a safe crossing

Production source: `transit-people`. More residents are moving into the city. A busy road divides homes from the learning centre and shops.

Outcome: Hold vehicle traffic before escorting the group. Place the ramp and both approach barriers, bring the children across, then release traffic after the crossing is clear.

1. Stop approaching vehicles
2. Make the level route accessible
3. Protect both approaches
4. Escort the group across
5. Clear the route and release traffic

Completion checks: The group has not crossed on the protected level route. Vehicles remain stopped. Clear the crossing and release traffic. The crossing is still holding the whole road.

Real-world bridge: Discuss safer walking routes and crossing designs with a qualified road-safety professional.

### 10.2 Build a decision everyone can enter

Production source: `civic-voices`. The city council wants to spend its limited fund. Traders speak loudly, while young people and residents with disabilities rarely attend meetings.

Outcome: Carry seats for traders, young residents and residents with access needs. Bring each group’s proposal to the common table before opening the decision meeting.

1. Find the missing voices
2. Carry seats to one shared table
3. Open level access
4. Bring every group’s proposal
5. Test equal speaking turns

Completion checks: Some residents cannot enter the meeting. Not every group has had access, a proposal and a speaking turn.

Real-world bridge: Compare ways different residents can contribute to decisions without pressure or exclusion.

### 10.3 Close the loop on reported faults

Production source: `civic-repairs`. Faults are reported across the city, but no one knows who should act or whether a repair request has been addressed.

Outcome: Carry the water and path fault tickets to their responsible crews. Inspect the completed work, then return confirmed receipts to the reporting residents.

1. Collect both reported faults
2. Carry each ticket to its crew
3. Let the crews act
4. Inspect the work
5. Return verified receipts

Completion checks: The water fault has no responsible crew. The path fault has no responsible crew. Assigned does not mean fixed. Inspect the work. Residents still cannot tell whether their reports were resolved.

Real-world bridge: Study how clear responsibilities and non-identifying issue records can guide public service.

### 11.2 Keep recovered waste moving

Production source: `green-waste`. As homes and businesses open, unmanaged waste collects near the market. Residents complain about blocked walkways and drains.

Outcome: Put food scraps in the compost bay and plastic in the recovery bay. Clear the collection lane and arrange the next collection so both streams keep moving.

1. Inspect the mixed pile
2. Carry organics to compost
3. Carry plastic to recovery
4. Clear the collection lane
5. Test the next collection cycle

Completion checks: Food scraps remain in the mixed pile. Plastic must stay out of the compost. Sorting once will not prevent tomorrow’s pile. Clear the lane and arrange collection.

Real-world bridge: Notice how waste prevention, collection and safe handling depend on many people.

### 11.3 Share a limited midday supply

Production source: `power-demand`. A food seller requests cooling at midday, while the workshop has moved repairs into the same period.

Outcome: The midday supply has 4 units. Clinic and cooling each need 2; the workshop needs 3. Move the workshop to stored evening power and keep both priority services supplied at midday.

1. Inspect supply and each load
2. Connect priority midday services
3. Check the overloaded circuit
4. Shift workshop work to evening
5. Charge storage and test both periods

Completion checks: The clinic has no allocated midday supply. The food store has no cooling supply. The workshop needs a separate evening operating slot. Moving a load does not create energy. Charge the evening storage. Midday demand exceeds the 4 available units.

Real-world bridge: Write a simple fictional timetable of when different services need power.

### 12.2 Give the neighbourhood a maintenance system

Production source: `homes-upkeep`. Residents move into the housing quarter. Shared drainage, pathways and rubbish areas need upkeep, but nobody has been assigned responsibility.

Outcome: Residents need named owners for drains, paths and shared gardens. Carry each duty card to its team, fund three upkeep tokens, then test an absence handover.

1. Inspect shared upkeep needs
2. Carry named duty cards
3. Agree garden ownership
4. Fund ongoing care
5. Test a deputy handover

Completion checks: Drain care has no named owner. Path care has no named owner. The shared garden has no owner. Maintenance has no operating reserve. The system still stops when one person is absent.

Real-world bridge: Ask how shared facilities are maintained and who contributes to their upkeep.

### 12.3 Build a team that can continue without you

Production source: `industry-workers`. Demand for locally made goods is growing. Workers have different levels of experience, and new machines create safety and training requirements.

Outcome: Prepare an isolated training station, demonstrate to the first apprentice, then let that apprentice teach the next. Finish with a fault drill and a city-wide handover.

1. Prepare the isolated practice station
2. Demonstrate and test the first apprentice
3. Let that apprentice teach another
4. Run a fault-response drill
5. Hand over the tested city system

Completion checks: The next apprentice has not succeeded through peer teaching. The team has not practised responding to a fault. The operating knowledge is still private. Finish the other 35 challenges and all six tested construction prototypes before the city handover.

Real-world bridge: Ask why supervised practice, safe methods and fair work are central to production.

## Scope and recovery

This is a bounded fictional game, not certification of real skills, medical practice or real-world evidence. Hands-on progress still belongs to the open page session; no new durable save, cloud migration or XP is claimed. Production campaign saves and rewards remain separate except for the existing shared capped Builder Credit ledger and cosmetic shop. Closing or refreshing may reset this experimental hands-on journey.

## Verification

The practical-model regression solves all 24 new missions, rejects empty tests and duplicate-resource attempts, checks wrong delivery, cash-flow shortfall, overloaded power recovery and late urgent delivery, and enforces final handover prerequisites. Actual-game regression walks the original avatar through all 36 outcomes, tests early failure and sequential gates, completes all six prototypes, checks shop purchases, verifies 36/36 and the 70-parcel city, then invalidates and recovers the final handover after earlier work changes. Camera regressions cover portrait/wide framing, bounded closer inspection and collision transitions. Browser QA and full validation are recorded in implementation status.

## Free exploration controls

Drag sideways for unrestricted rotation and up/down for elevation. Both the worksite and city overview honour the selected angle. Pinch or +/− controls zoom; two-finger dragging pans the overview. The walking pad, WASD and arrow keys move relative to the current camera. Q/E rotate and R/F tilt on a keyboard. Free walking follows the character and stops the pending guided route, preserving the mission outcome state. Tap a work object to resume work. Solid buildings, people and city edges remain respected. Release, cancellation, lost pointer capture, window blur and modal entry stop held movement.
