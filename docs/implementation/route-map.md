# Route map

Stage 11 classifies every application route. Server authorization is repeated
inside each private data boundary; middleware is navigation defence, not the
sole authorization control.

| Route                                    | Classification                                                    | Purpose / required next action                                          |
| ---------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `/`                                      | Public; authenticated users continue automatically                | University for Human Potential landing and primary Start Journey action |
| `/login`, `/signup`                      | Public authentication; authenticated users continue automatically | Email and Google authentication                                         |
| `/forgot-password`, `/reset-password`    | Public recovery flow                                              | Request and complete password recovery                                  |
| `/auth/callback`                         | Internal callback                                                 | PKCE exchange, cookie persistence and safe progression redirect         |
| `/auth/error`                            | Internal safe error                                               | Privacy-safe authentication failure and retry                           |
| `/continue`                              | Auth-only internal router                                         | Resolve the first incomplete state                                      |
| `/app`                                   | Auth-only                                                         | Real-data Home and one primary next action                              |
| `/onboarding/identity`                   | Auth-only, identity incomplete                                    | Minimum profile, consent and safeguarding checkpoint                    |
| `/onboarding/discovery`                  | Auth-only, identity complete                                      | Start or resume 15-question Discovery                                   |
| `/onboarding/discovery/[section]`        | Session owner                                                     | Answer the current eligible question                                    |
| `/onboarding/discovery/review`           | Session owner in review                                           | Review and edit evidence                                                |
| `/onboarding/discovery/complete`         | Completed session owner                                           | Discovery completion handoff                                            |
| `/onboarding/discovery/profile`          | Completed Discovery owner                                         | Generate or recover private Human Potential Profile                     |
| `/onboarding/discovery/profile/complete` | Profile owner                                                     | Mission handoff                                                         |
| `/mission`, `/mission/complete`          | Auth-only eligible owner                                          | Generate, refine, activate and continue Practical Mission               |
| `/journey`, `/journey/complete`          | Active Mission owner                                              | Generate, refine, activate and continue Builder Journey                 |
| `/build`                                 | Auth-only contextual router                                       | Active Project first, then Quest, then Project creation                 |
| `/quests`                                | Active Journey owner                                              | Current HQLS Quest set                                                  |
| `/quests/[questId]`                      | Quest owner                                                       | Action and private evidence                                             |
| `/quests/[questId]/complete`             | Quest owner with evidence                                         | Nortnspoil reflection and completion                                    |
| `/projects`                              | Auth-only owner                                                   | Project list, eligibility and current work                              |
| `/projects/new`                          | Eligible completed-Quest owner                                    | Create one private Project                                              |
| `/projects/[projectId]`                  | Project owner                                                     | Execute evidence-backed milestones                                      |
| `/connect`                               | Auth-only; eligible adults                                        | Private profile, Discover Builders and My Network                       |
| `/connect/builders/[username]`           | Auth-only; eligible adults and allow-listed relationship access   | Safe Builder detail, relationship controls, block and report            |
| `/portfolio`                             | Auth-only owner                                                   | Portfolio status and completed Project selection                        |
| `/portfolio/[projectId]`                 | Eligible adult Project owner                                      | Prepare or manage public-safe proof                                     |
| `/portfolio/[projectId]/preview`         | Eligible adult Project owner                                      | Exact private preview and publication consent                           |
| `/proof/[slug]`                          | Public Portfolio allow-list                                       | Eleven approved public fields for a published slug                      |
| `/proof-unavailable`                     | Internal public 404                                               | Withdrawn or unknown proof response                                     |
| `/privacy`, `/terms`                     | Public                                                            | MVP privacy and terms notices                                           |
| `/api/health`                            | Public operational                                                | Non-secret health response                                              |
| `/api/discovery/save`                    | Auth-only API                                                     | Controlled Discovery save boundary                                      |

Unknown paths use the global not-found experience. Major route groups provide
loading and safe retry states. Private routes are excluded from indexing.
