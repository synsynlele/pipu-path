# The Unbuilt City — guided journey with accessible navigation and revision

Status: Development preview, 28 October 2026

## Student findings addressed

1. Essential controls disappeared while students were making decisions.
2. Students need to revisit earlier decisions, revise them, and actually see
   the city change without losing the point reached in the journey.

## Navigation contract

Keep the existing primary city navigation accessible at all times, including
while the automatic journey is running. Order essential actions for mobile:
**Decisions, My City, City map, Places, Build, Explore, Guide**.

A horizontally scrollable control row keeps all actions discoverable
without piling them over the 3D scene. The separate Pause/Resume and
Last decision buttons remain visible during the 16-case run.

Opening Map, Places, Build, Explore, Guide, My City or Decisions automatically
pauses the guided sequence and preserves its destination/case. Using the
legacy panel cannot trigger a competing, forgotten station walkthrough.
The learner can resume the guided sequence using Resume journey.

## Revision contract

- **Last decision:** revisit the most recent earlier completed case.
- **Decisions:** see the full 16-case list, with earlier choices marked
  clearly "Change: [selected approach]". Any previously solved problem
  can be selected, even after completing the full journey.
- A review is a separate temporary branch, not a reset of the journey.
- Choosing a new answer immediately replaces the previous 3D construction,
  updates cross-district relationships and presents the result.
- After the short consequence interval, the review returns to the player's
  original journey stage. If review was opened from active play, progress
  resumes automatically; from an explicitly paused journey, it remains
  paused and ready to resume. A Return button allows early exit.
- "Return without changing" keeps the original answer.
- If a review is abandoned to open another navigation panel, do not
  automatically restart the journey unexpectedly.
- Existing optional device save already captures the revised choice and
  the original checkpoint. No extra personal state is persisted.

## Regression gates

Automated: previous-choice selection, distinct completed-history labels,
revision modifies city model but not journey checkpoint, all navigation
handlers pause, review does not enter standard auto-next flow, all
mobile controls are accessible and no CSS hides the nav, existing
save and journey recovery unchanged.

Manual: Android portrait and tablet, scroll navigation in both directions,
review first and penultimate cases, open/close multiple panels,
pause while walking, revise and auto-return, revise from paused mode,
complete 16 and revise after completion, return from reopened device
save. Verify no doubled timer or overlap in the pause header.
