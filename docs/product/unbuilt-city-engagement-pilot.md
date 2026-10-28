# The Unbuilt City — first engagement-case library

Status: isolated preview candidate, 28 October 2026.

## Learning product

There are sixteen versioned, authored practice problems in the four
currently playable districts:

- Repair: triage an urgent queue, manage spare parts, train apprentices safely,
  and handle discarded electronics.
- Power: coordinate evening demand, plan maintenance, assess clinic resilience,
  and anticipate a busy midday with competing services.
- Food: time harvest logistics, handle small-supplier cash flows, reduce unsafe
  food loss, and respond to road disruption.
- Education: diagnose misconceptions about quarters, coordinate evening class
  demand, improve inclusive access, and use feedback instead of ranking.

Each case includes a situation, question, three decisions, the consequence,
a trade-off, connections to another part of city life, four fictional relative
signals and one safe observation outside the game. Players travel to the
district before they practise; the same scenario can be revisited and revised.
The player chooses whether to keep an approach. A kept approach creates a small
landmark in that district. This is an authored response system, not generative
AI and not validated psychometrics. The 4 signals (−2 to +2) are comparisons
inside that particular case, NOT earned XP, budget, school grades, real income,
verified capability or additions to the existing two-day city model.

## Persistence boundary

In the Problems (16) panel players may explicitly select
"Save on this device"; after that the local browser stores only an
allowlisted, versioned fictional practice snapshot containing:

- current day, cash, scenario planning configuration, owned fictional assets,
- five visited original stations and at most two adopted-day summaries,
- one chosen decision per case, and a boolean handover state.

It **never stores personal reflection text**, identifiers, login/session
secrets, photos, uploads, age data, real achievements, or the user's actual
PipuPath Quest state. Storage uses a versioned key, bounded payload,
whitelist validation, maximum age, graceful handling of blocked storage and
a visible "Stop saving and clear device copy" control. Reset clears the copy.
It is opt-in per browser, not cloud storage, not guaranteed permanent, and
should not be represented as cross-device save.

## Pilot evaluation

A facilitator (not the founder) should observe a small group of consented
learners and adult players, checking:

1. Can they enter unaided, walk to their first problem and explain the question?
2. Can they compare at least two outcomes and describe the trade-off?
3. Can they identify what other district their decision could affect?
4. Can they revisit a case and alter a decision voluntarily?
5. Can they save and resume on the same browser or clear it?
6. Do they return voluntarily after the initial visit?
7. Can affordable Android devices sustain the view and not crash?

A case attempt is not evidence of capability. No rollout or
retention-learning outcomes should be claimed without observed data.

## Next architecture

Keep one shared district/case schema; add more cases by content review,
not custom screens. Once learner comprehension is demonstrated, connect
specific case actions to a formally versioned city simulation with traceable
costs and consequences. The live PipuPath Quest engine remains the only
authority for real-world proof and XP. Secure cloud-synced game state requires
separate user identity, consent, authorization and minor privacy design.
