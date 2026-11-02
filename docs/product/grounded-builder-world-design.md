# The Unbuilt City — grounded world-building adventure

Status: proposed design for agreement; no replacement gameplay implemented.  
Date: 2 November 2026.  
Owner: PipuPath product team.  
User direction: a simple, challenging, entertaining world-builder that encourages real-world initiative, with much more realistic environments and problems grounded primarily in Nigeria and other African contexts.

## 1. Product promise

Explore a living region, understand what limits its communities, create useful solutions and help residents keep those systems working independently.

The game's reward is visible human and environmental progress. Building, repair, invention, teaching, enterprise, culture, coordination and stewardship all contribute. The player grows from a useful local contributor into someone who can establish teams and connect settlements.

The preceding prototype's passing tests demonstrate its programmed rules, not that it is enjoyable or changes real-world behaviour. This redesign needs playtesting of both outcomes. The earlier request to discuss and agree before implementation remains in force. The current game and production release remain untouched by this document.

## 2. Reference mechanics

| Reference               | Verified mechanic                                                                                              | Proposed adaptation                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Dragon Quest Builders 2 | Functional rooms, villagers using facilities, cooperating on construction and tending crops during exploration | A character-led adventure with useful spaces, residents and visible autonomous activity |
| Eco                     | Specialisation, economic interdependence and environmental consequences                                        | Distinct resident roles and interacting service, resource and ecological systems        |
| Terra Nil               | Restoration that visibly transforms landscapes                                                                 | Recovering land, water, vegetation and public spaces as a central source of pleasure    |
| ISLANDERS               | Simple spatial interaction and a readable visual world                                                         | A small, clear tool set and progressive introduction of complexity                      |

Game sources: [Dragon Quest Builders 2](https://www.nintendo.com/en-gb/Games/Nintendo-Switch-games/DRAGON-QUEST-BUILDERS-2-1514364.html), [Eco getting started](https://wiki.play.eco/en/Getting_Started), [Eco laws and ecosystem evidence](https://wiki.play.eco/en/Laws), [Terra Nil](https://www.nintendo.com/us/store/products/terra-nil-switch/), [ISLANDERS](https://playislanders.com/islanders1).

## 3. World and visual direction

A fictional connected region takes its initial visual and social references from southwestern Nigeria. This is one specific setting; it does not stand for every Nigerian or African community. Later regions require their own architectural, climatic, cultural and economic references.

The visual target is grounded 3D realism: adult human proportions, convincing building dimensions, textured plaster and concrete, metal roofs, fabric canopies, vegetation, believable roads and drainage, coherent lighting and readable material wear. Ordinary mixed-use neighbourhoods connect to farmland and waterways. Established businesses and well-maintained spaces exist alongside opportunities to improve services.

Characters have varied identities, clothing, occupations, abilities and ambitions. Residents bargain, laugh, rest, learn, work and celebrate. Local ingenuity and competence are present from the start. The player cooperates with existing knowledge and institutions. Specialist work uses qualified fictional residents.

The generated rain-washed market image is an art-direction concept, not a screenshot, asset inventory, performance result or guarantee of final phone rendering quality. A mobile rendering prototype must establish achievable geometry, texture, lighting, character and memory budgets before a fidelity promise.

| Layer     | Direction                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------ |
| Streets   | Connected paths, entrances, kerbs, crossings, drainage and identifiable destinations                                     |
| Buildings | Believable local construction and proportions; modular assets support careful variation                                  |
| Activity  | People and goods actually travel between work, homes and services                                                        |
| Weather   | Rain, drying, sunlight and visible consequences; effects remain readable on a phone                                      |
| Sound     | Spatial footsteps, tools, water, traffic and market life; optional music and independent volume controls                 |
| Camera    | Free orbit, bounded tilt, zoom and accessible controls; brief interruptible reveals; no enforced orientation             |
| Interface | A clear current purpose near the bottom, context-sensitive tools, optional detail, readable text and large touch targets |

## 4. Real-world problem foundations

These are researched scenario themes. Their game models will be explicit simplifications, not forecasts or professional instruction.

| Area                              | Situations to model                                                                            | Player decisions and consequences                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Food and agriculture              | Handling losses, delayed collection, storage limitations, water availability and market access | Packaging, shade, transport, storage and growing conditions affect usable produce, resource use and household supply |
| Energy                            | Inadequate or unreliable supply and competing service needs                                    | Generation, storage, maintenance and operating schedules affect what can keep running                                |
| Water and sanitation              | Unequal service access, contamination pathways and upkeep                                      | Protected supplies, accessible collection, drainage and maintenance influence reliability and use                    |
| Flooding and access               | Rain, obstructed drainage, exposed routes and downstream effects                               | Site choice, runoff routes, ground cover and raised access change who remains connected                              |
| Education and skills              | Access barriers, teaching capacity, tools and continuity                                       | Learning spaces, appropriate support and mentors affect independent capability and service capacity                  |
| Health-service access             | Transport, reception, staffing, supplies and service reliability                               | Service design affects arrivals and continuity; clinical diagnoses and treatment are outside the player's role       |
| Enterprise and livelihoods        | Unsold stock, payment delays, cash-flow gaps and unreliable delivery                           | Customer value, resource costs, working capital and trust influence whether an enterprise can continue               |
| Waste and repair                  | Disposal routes, reusable materials, repair access and maintenance gaps                        | Recovery, repair and collection systems influence costs, access, cleanliness and ongoing capacity                    |
| Community, culture and leadership | Participation, accessibility, coordination and shared ownership                                | Useful public places, creative activity, accountable roles and handovers influence participation and resilience      |

Research anchors:

- [Nigeria Rural Electrification Agency: DARES](https://nep.rea.gov.ng/dares.html) identifies household and MSME electricity access and distributed renewable generation as programme objectives.
- [World Bank: Nigeria flood and drought resilience](https://www.worldbank.org/en/events/2024/11/21/drmhubtokyo-strengthening-nigeria-s-resilience-an-epic-response-framework-for-flood-and-drought-risk-management) describes rainfall, drainage, environmental and governance factors in flood risk.
- [CGIAR: tomato transport packaging in Nigeria](https://ccafs.cgiar.org/resources/publications/business-models-reducing-greenhouse-gas-emissions-food-loss-and-waste-1) examines packaging and transport-related food loss.
- [UNICEF: State of Nigeria's Children 2024](https://www.unicef.org/nigeria/reports/updated-situation-analysis-nigeria-2024) covers education, nutrition, health and climate-related barriers.
- [World Bank: Lagos transport](https://blogs.worldbank.org/en/developmenttalk/who-wins-when-public-transit-challenges-private-transit--lessons) examines public/private transit and mobility challenges.

Each future scenario needs local references and a subject reviewer. Current real-world prices, prevalence figures and technical performance must never be invented from game parameters. Financial balances are fictional and identified as such.

## 5. Simulation contract

World state changes through independent processes and physical relationships. A named action setting a completion flag is insufficient evidence of a working service.

1. **Flow:** tracked resources move through actual connected destinations. Goods in a store, on a vehicle, at a stall or consumed by a household have distinct states. Resource conservation prevents duplicated stock.
2. **Capacity:** facilities have limited space, throughput and people. A warehouse without transport does not deliver food.
3. **Reliability:** services operate over time and changing conditions. An empty cold room or an unpowered machine provides no benefit.
4. **People:** residents have schedules, skills and access needs. Workers require appropriate roles and resources; their visible activity corresponds to simulation state.
5. **Economy:** cash, credit, stock and obligations remain distinct. Construction and upkeep have costs. User-facing prices are fictional scenario values.
6. **Environment:** land, runoff, vegetation and waste affect one another within deliberately bounded models. Sending a problem downstream is visible.
7. **Handover:** teams can continue a proven operation while the player explores elsewhere. Independent operation is observable evidence of a stronger system.

At least two structurally different solutions must be demonstrated for a main problem before it is accepted. Optional guidance gives observations and clues; it does not reveal a fixed tap sequence. Failure preserves a practical route to revise, recover materials and try again.

## 6. First playable: Bring the Market Back

### Situation

A small established neighbourhood has growers, traders, households and a market. Food is available, but handling damage, a disrupted access route and unreliable storage prevent dependable supply. Residents already have skills and working practices the player can learn from.

### Goal

Restore dependable deliveries of usable produce to the neighbourhood while keeping the operation affordable and ready for residents to maintain. Exact quantities, budgets, time compression and success windows must be tuned through prototype playtests; none is claimed to be validated here.

### Five quest phases

1. Explore the market and follow a shipment with a resident. Observe where time, stock and access are lost.
2. Inspect available materials, land, routes, existing facilities, trained residents and operating costs.
3. Create and organise a response using a small set of functional tools and modules.
4. Let a delivery cycle operate. Inspect observed losses, queues, energy use, unmet need and cash obligations.
5. Improve the design, test under a changed condition, and give the resident team ownership of its continuing operation.

### Tools and choices

A small catalogue supports route work, protective handling, sheltered storage and optional powered cooling. A player can emphasise reduced handling damage and shorter supply cycles, or invest more in powered storage and its supporting operation. A combined design may also work. The model must expose the conditions under which each approach succeeds, including cases where cooling does not fix earlier damage or where route improvement does not prevent heat-related loss.

Residents operate an established design. The player's meaningful activity includes exploring, inspecting, positioning functional modules, carrying critical items when appropriate, recruiting suitable help, running experiments and modifying the system.

### Visible consequences

Usable produce reaches real stall stock. Vendors open and serve actual household demand. Queues and travel change. Operators perform their roles. Retained earnings can fund maintenance. The market becomes an active social place. The next area opens because the tested local system has created capacity to help elsewhere.

### Challenge and entertainment

Limited resources, spatial decisions and interacting needs provide strategic depth. Discoveries, resident stories, playful incidental moments, satisfying construction, animation, sound and transformation provide pleasure. A forecast rain event changes access conditions after an initial success. The player has enough information to prepare and enough recovery options to experiment.

### Reflection and next action

A short reflection asks what observation changed the player's design and who still needs a better service. A small optional real-world invitation encourages noticing a local loss of time, materials or access, talking to an appropriate person and trying a safe useful improvement. The existing protected Real Quests journey owns real-world evidence and capability development. Game success does not certify real-world competence or grant verified XP.

## 7. First-slice boundaries and acceptance

The first slice is one neighbourhood, a small cast, one coherent food-and-market problem and selected supply, energy and access interactions. Later education, clinical logistics, culture, manufacturing and governance are expansion areas, not promised first-slice implementations.

| Area               | Evidence required before calling the slice ready                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agency             | New players can inspect the need and attempt a meaningful intervention without following a prescribed sequence                                              |
| Multiple solutions | Two materially different approaches meet the same useful outcome; counterexamples fail for causal reasons                                                   |
| Realism            | Goods, people, routes, supply, money and upkeep are connected; visuals communicate the same state                                                           |
| Operation          | An established resident team continues its service while the player leaves the immediate area                                                               |
| Recovery           | Failed experiments can be revised without losing the whole world; undo/reclaim rules are visible                                                            |
| Retention          | Versioned local checkpoints survive reload and recover safely from invalid state; earlier game saves are not silently replaced                              |
| Performance        | A measured phone rendering prototype establishes budgets and an agreed supported-device baseline; a provisional 30 FPS target is tested rather than claimed |
| Accessibility      | Touch and keyboard input, readable text, optional hints, reduced motion, pause and independent sound controls work                                          |
| Fun                | Playtests record voluntary experimentation, repeat attempts, navigation friction and whether players want to return                                         |
| Transfer           | Follow-up observes voluntary real-world initiative and truthful evidence; no causal behaviour-change claim follows merely from gameplay scores              |

## 8. Compounding content system

Shared validated world rules, a modular environment kit and bounded scenario definitions are the reusable assets. A future scenario editor could allow trained facilitators to choose local needs, starting conditions and outcome targets within those rules. Content validation must check solvability, alternative approaches, resource accounting and accessible instructions.

A candidate scenario progresses through author draft, domain review, simulation tests, independent playtest and release review. The founder defines the product standard and reviews major direction changes; routine scenario authoring and validation should have designated team roles. This workflow is proposed, not a claim of existing app roles or permissions.

The ambition is 100 times more scenario variety without 100 times more bespoke implementation. Reuse and measured authoring effort must establish whether that ambition is achievable. Regions, characters and player designs can contribute to later stories and scenarios; progress should create new possibilities rather than disposable task completion.

## 9. Immediate agreement and implementation sequence

This brief and the generated market concept establish a concrete review target. Before replacement implementation, agree on:

- The character-led realistic visual direction and fictional initial region.
- Independent world simulation, several useful solutions and resident handover as the core experience.
- Bring the Market Back as the first complete slice, including checkpoint recovery and measured phone performance.

After agreement: build a bounded interaction/rendering test, validate core flows and alternative solutions, produce the complete first playable slice, test with players, then expand the world based on observed results. This is not a commitment to reproduce console-scale graphics or every referenced game's systems in a browser release.
