# Route map

| Route                                        | Access                       | Purpose                                   |
| -------------------------------------------- | ---------------------------- | ----------------------------------------- |
| `/onboarding/discovery`                      | Authenticated, Stage 2 ready | Introduction, start or resume             |
| `/onboarding/discovery/[section]?question=…` | Session owner                | One eligible question, previous/save/skip |
| `/onboarding/discovery/review`               | Session owner in review      | Grouped answer review and edit            |
| `/onboarding/discovery/complete`             | Owner of completed session   | Honest Stage 4 boundary                   |

Every route repeats authorization on the server. Middleware is not the sole
control. Users without the identity checkpoint return to the existing
onboarding boundary; completed users remain at the completion boundary until
Stage 4 is authorized.
