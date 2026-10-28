# Unbuilt City — single journey controller and recoverable interruptions

Status: preview only, 28 October 2026.

## Reported learner defects

1. The original school/power/food station controls sometimes surface the
   old details panel and compete with the automatic next problem.
2. Stopping a walk cancels the arrival callback, so students can't
   find their way back to the unsolved question.
3. Closing a question, pausing during building or reading, or returning
   after an opted-in save should not restart the whole city.

## Resulting behaviour

**One journey owns navigation.** The 16-case sequence no longer calls
`goToStation()` (which calls `inspect()`) during the guided flow.
It travels directly to a question. While running, legacy Build,
City map, Next step, Explore, Places, practice listing, tap-to-walk,
keyboard movement and hotspots are hidden or prevented from hijacking
the current route. The modern city buildings and economy still exist.

A **Pause journey** button stays visible above the active gameplay.
When paused it becomes **Resume journey**. It is independent of the
scene's legacy Stop control and remains discoverable on mobile.

| Stop point                  | Resume behaviour                                     |
| --------------------------- | ---------------------------------------------------- |
| Before arrival              | Plan the route again to the same question            |
| At a question               | Return to the same three decisions                   |
| During a building animation | Repeat the visual response and consequence           |
| While reading an outcome    | Reopen that outcome and restart its reading interval |
| At the final case           | Show completion and permit free exploration          |

Manually leaving a problem pauses (rather than destroys) progression.
Zero-distance arrival calls the question immediately. Failed routes
fall back to a question so nobody is stuck.

## Retention and privacy

Without local save opt-in, this works while the session remains open.
With opt-in browser save, the allowlisted snapshot stores the same
game choices plus only the current case ID, stage and choice ID;
restore is validated and exposes it as paused. An old save lacking
a cursor resumes from the first unanswered case. Nothing writes
usernames, chats, private text, personal evidence, XP or location.
This is not account or cross-device synchronisation.

## Regression gates

Run the pure journey cursor tests (travel, question, building, outcome,
invalid cursor and completion), save sanitisation tests, and source
wiring tests for the single controller. Test on a physical Android
phone: enter city, answer, stop movement, resume, close an outcome,
pause on a building animation, navigate elsewhere while paused,
return to the same case, reload with device save, finish all 16.
Verify no old inspector panel overrides the new question and no
double timer advances the student without reading.
