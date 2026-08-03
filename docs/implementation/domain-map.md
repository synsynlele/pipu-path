# Domain map

| Domain            | Stage | Responsibility                                                                | Boundary                         |
| ----------------- | ----: | ----------------------------------------------------------------------------- | -------------------------------- |
| Platform          |   0â€“1 | Runtime, design system, logging, validation                                   | No product state                 |
| Identity          |     2 | Authentication, private profile, preferences, consent, eligibility checkpoint | No public profile                |
| Discovery         |     3 | Versioned questions, private sessions/responses, progress, review, completion | Evidence only; no interpretation |
| Potential Profile |     4 | Interpret verified Discovery handoff                                          | Not implemented                  |

Discovery owns `discovery_question_sets`, `discovery_questions`,
`discovery_sessions`, `discovery_responses` and privacy-safe audit events.
Identity owns age band, consent and the checkpoint that authorizes entry.
Stage 4 may consume `Stage4DiscoveryHandoff`; it must not consume raw tables.
Ÿ®8