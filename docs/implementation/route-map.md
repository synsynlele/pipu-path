# Route map

| Route                                        | Access                       | Purpose                                   |
| -------------------------------------------- | ---------------------------- | ----------------------------------------- |
| `/onboarding/discovery`                      | Authenticated, Stage 2 ready | Introduction, start or resume             |
| `/onboarding/discovery/[section]?question=…` | Session owner                | One eligible question, previous/save/skip |
| `/onboarding/discovery/review`               | Session owner in review      | Grouped answer review and edit            |
| `/onboarding/discovery/complete`             | Owner of completed session   | Honest Stage 4 boundary                   |
| `/onboarding/discovery/profile`              | Authenticated profile owner  | Generate/review private Stage 4 profile   |
| `/onboarding/discovery/profile/complete`     | Authenticated profile owner  | Handoff to Practical Mission              |
| `/mission`                                   | Authenticated profile owner  | Generate, review and activate one mission |
| `/mission/complete`                          | Active mission owner         | Honest Stage 6 Journey boundary           |
| `/journey`                                   | Active mission owner         | Generate, review and activate Journey     |
| `/journey/complete`                          | Active Journey owner         | Honest Stage 7 Quest boundary             |

Every route repeats authorization on the server. Middleware is not the sole
control. Mission generation requires a completed active profile; Journey
generation requires an active mission. Both require current AI-processing
consent. Stage 6 stops before Quest execution.
