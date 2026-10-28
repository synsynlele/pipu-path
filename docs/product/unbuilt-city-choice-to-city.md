# Choice-to-City v2 — useful infrastructure and honest consequences

Date: 28 October 2026 · Status: development preview · Not production

## Purpose

A choice changes the same city through relevant buildings, tools, service
capacity, visible damage, or the absence of needed construction. Answering a
question is not itself evidence that the player built something useful.

## Construction contract

- All 36 cases and 108 stable choice IDs have explicit entries in
  `construction-plans.mjs`. No mapping depends on the shuffled answer position.
- Each entry identifies working, limited, failed or no-construction status,
  physical assets (which may be empty), whether infrastructure was constructed,
  and a concise explanation tied to the authored answer's result.
- Good health and technology choices produce recognisable medical and technology
  facilities and appropriate equipment. They do not share a generic house or
  token-object silhouette with every other sector.
- A physical object can be unhelpful: an advert is not a functioning clinic;
  unfinished framing is not a tested technology service; burnt waste is damage.
- Thirty no-construction choices add no mesh, marker pretending to be a building,
  infrastructure count, service capacity or new ambient population. Their unmet
  need remains visible through the empty plot and honest city summary.
- Poor choices that genuinely construct something can still create a limited,
  unsafe or unfinished site. City quality reflects usefulness, not just size.
- Revision replaces the same site's consequence, including removing a formerly
  useful building after an ineffective revision. Other decisions are preserved.
- Working infrastructure assembles from foundation to equipment and roof.
  No-construction answers show their explanation without a build celebration.
- The protected transport crossing is installed on its reserved road, remains
  walkable, and does not place a miniature road in a development plot.

## Progress and simulation

Answered decisions still control the existing chapter prerequisites. Physical
infrastructure, working solutions and unresolved needs are separate counters.
Limited plans reduce useful capacity. An answered district with no productive
solution has zero service and no automatic enterprise capacity. New ambient
residents, working courtyard activity and deliveries require productive service.
Connected-city effects remain fictional and deterministic.

## State and privacy

Existing allowlisted choice IDs and optional same-device saves remain the source
of truth. Geometry, city summaries and service activity are reconstructed from
those IDs. This version adds no cloud saves, account permissions, learner data,
verified achievements, capability claims or XP.

## Acceptance

- Check all 108 IDs and the intended sector assets, including all 30 empty cases.
- Check geometry, plot boundaries and the one designated road-surface project.
- Check a good clinic choice, an advert-only choice, a medical shortage concealed
  without construction, a functioning technology hub and unfinished technology.
- Verify that revising to or from an empty choice updates the same plot, city
  counts, population and capacity without losing decision progress.
- Preserve software road rendering, reduced motion, continuous navigation and
  Android stability. Automated model/runtime/raster checks supplement actual
  physical Android and WebGL testing; they do not replace it.
