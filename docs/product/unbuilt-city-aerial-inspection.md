# Unbuilt City — View My City / Builder's aerial inspection

Status: Development preview only, 28 October 2026.

## Classroom goal

Learners should be able to admire and examine the *real fictional city*
their actions have constructed, not just see progress numbers on a card.
The city keeps existing chapter navigation and all 36 reversible
decisions. No new city, account data, rewards, scores, photo storage
or export is created.

## Player interaction

1. Enter The Unbuilt City and complete one or more decisions.
2. Tap **View My City** in the city navigation. Active auto-play pauses,
   so no new decisions or walking actions occur in the background.
3. The question/outcome card and navigation tuck away, opening a wide
   3D overhead view. A small header shows projects built and the number
   of districts with construction.
4. Tap **Whole city** for the full 14-district view, or use the district
   selector to focus any area. District labels show N/N buildings
   built. Built districts appear first in the selector.
5. Rotate the camera by dragging. Pinch (or tap +/-) to zoom.
6. Tap **Resume journey** when coming from an active run or
   **Return to game** after an already-paused run. The original
   progress checkpoint and camera configuration return.

If a review of an earlier decision was in progress, its question card
and event handlers remain intact on return. If the player paused on
purpose before opening the view, return never starts automatic
progression by surprise.

## Safety and correctness

Aerial inspection is read-only and recomputed from the very same
decision-derived city model as My City. Empty districts are not
represented as completed. The view hides conflicting navigation
overlays and prevents accidental ground-click travel or keyboard
movement. It neither writes to browser storage nor changes backend,
Quest XP, location or identity. Fictional service indicators should
never be presented as verified real-world measures.

## Device acceptance tests

Test Android portrait/landscape and a tablet:
- open during travel, while choosing, during city construction and
  while reading consequences;
- inspect built and unbuilt neighbourhoods, orbit and zoom without
  accidentally moving the avatar;
- leave with the prior question and choice buttons present;
- leave with deliberately paused state still paused;
- revise a prior decision and re-open the view: the visible structures
  and built counts should reflect the new selected outcome;
- reopen an opt-in device save, then view the corresponding city;
- verify 3D software fallback and no clipped Return button.
