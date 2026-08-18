# Route map

Stage 20 classifies every application route. Server authorization is repeated
inside each private data boundary; middleware is navigation defence, not the
sole authorization control.

| Route                                       | Classification                                                    | Purpose / required next action                                           |
| ------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `/`                                         | Public; authenticated users continue automatically                | University for Human Potential landing and primary Start Journey action  |
| `/login`, `/signup`                         | Public authentication; authenticated users continue automatically | Email and Google authentication                                          |
| `/forgot-password`, `/reset-password`       | Public recovery flow                                              | Request and complete password recovery                                   |
| `/auth/callback`                            | Internal callback                                                 | PKCE exchange, cookie persistence and safe progression redirect          |
| `/auth/error`                               | Internal safe error                                               | Privacy-safe authentication failure and retry                            |
| `/continue`                                 | Auth-only internal router                                         | Resolve the first incomplete state                                       |
| `/app`                                      | Auth-only                                                         | Real-data Home and one primary next action                               |
| `/onboarding/identity`                      | Auth-only, identity incomplete                                    | Minimum profile, consent and safeguarding checkpoint                     |
| `/onboarding/discovery`                     | Auth-only, identity complete                                      | Start or resume 15-question Discovery                                    |
| `/onboarding/discovery/[section]`           | Session owner                                                     | Answer the current eligible question                                     |
| `/onboarding/discovery/review`              | Session owner in review                                           | Review and edit evidence                                                 |
| `/onboarding/discovery/complete`            | Completed session owner                                           | Discovery completion handoff                                             |
| `/onboarding/discovery/profile`             | Completed Discovery owner                                         | Private Human Potential Profile / Discovery baseline and Possible Paths  |
| `/onboarding/discovery/profile/complete`    | Profile owner                                                     | Mission handoff                                                          |
| `/profile`                                  | Auth-only profile owner                                           | Private Living Builder Profile, evidence, feedback and version history   |
| `/profile/verification`                     | Auth-only profile owner / exact authorised verifier               | Collaborator and Builder-authorised institution capability verification  |
| `/mission`, `/mission/complete`             | Auth-only eligible owner                                          | Generate, refine, activate and continue Practical Mission                |
| `/journey`, `/journey/complete`             | Active Mission owner                                              | Generate, refine, activate and continue Builder Journey / 30-Day Pathway |
| `/build`                                    | Auth-only contextual router                                       | Active Project first, then Quest, then Project creation                  |
| `/quests`                                   | Active Journey owner                                              | Current HQLS Quest set                                                   |
| `/quests/[questId]`                         | Quest owner                                                       | Action and private evidence                                              |
| `/quests/[questId]/complete`                | Quest owner with evidence                                         | Nortnspoil reflection and completion                                     |
| `/projects`                                 | Auth-only owner                                                   | Project list, eligibility and current work                               |
| `/projects/new`                             | Eligible completed-Quest owner                                    | Create one private Project                                               |
| `/projects/[projectId]`                     | Project owner                                                     | Execute evidence-backed milestones                                       |
| `/connect`                                  | Auth-only; eligible adults                                        | Private profile, Discover Builders and My Network                        |
| `/connect/builders/[username]`              | Auth-only; eligible adults and allow-listed relationship access   | Safe Builder detail, relationship controls, block and report             |
| `/connect/collaborations`                   | Auth-only; eligible adults                                        | Structured invitations, active collaboration and completed evidence      |
| `/connect/collaborations/[collaborationId]` | Collaboration participant; eligible adult                         | Safe working agreement, contribution evidence and mutual completion      |
| `/portfolio`                                | Auth-only owner                                                   | Portfolio status and completed Project selection                         |
| `/portfolio/[projectId]`                    | Eligible adult Project owner                                      | Prepare or manage public-safe proof                                      |
| `/portfolio/[projectId]/preview`            | Eligible adult Project owner                                      | Exact private preview and publication consent                            |
| `/proof/[slug]`                             | Public Portfolio allow-list                                       | Eleven approved public fields for a published slug                       |
| `/proof-unavailable`                        | Internal public 404                                               | Withdrawn or unknown proof response                                      |
| `/guide`                                    | Auth-only                                                         | Evidence-aware AI Personal Builder Guide                                 |
| `/opportunities`                            | Auth-only                                                         | Explainable curated/marketplace discovery and application state          |
| `/opportunities/[opportunityId]`            | Auth-only                                                         | Vetted opportunity detail, provider trust and application path           |
| `/opportunities/[opportunityId]/apply`      | Eligible adult Builder / existing application owner               | Exact private application packet selection, preview, consent, history    |
| `/provider`                                 | Active provider member                                            | Provider-scoped workspace; no Builder directory                          |
| `/provider/opportunities`                   | Active approved provider member                                   | Provider-owned drafts; independent platform review still required        |
| `/provider/applications`                    | Active approved provider member                                   | Packets explicitly submitted to that provider only                       |
| `/institution`                              | Auth-only active institution operator                             | Aggregate cohort intelligence and Builder-authorised verification queue  |
| `/admin`                                    | Authenticated platform administrator                              | Aggregate Mission Control with no private development narratives         |
| `/admin/institutions`                       | Platform owner/operator                                           | Provision institution workspaces and explicit operator roles             |
| `/admin/providers`                          | Platform owner/operator                                           | Approve/suspend/revoke providers and scoped provider memberships         |
| `/admin/opportunities`                      | Authenticated platform administrator                              | Independent curated/provider opportunity review and publication          |
| `/integrations/khpos`                       | Authenticated learner                                             | Voluntary institutional cohort join/withdrawal boundary                  |
| `/privacy`, `/terms`                        | Public                                                            | MVP privacy and terms notices                                            |
| `/api/health`                               | Public operational                                                | Non-secret health response                                               |
| `/api/discovery/save`                       | Auth-only API                                                     | Controlled Discovery save boundary                                       |
| `/api/product-events/feature-view`          | Auth-only API                                                     | Privacy-safe allow-listed feature telemetry                              |

Unknown paths use the global not-found experience. Major route groups provide
loading and safe retry states. Private routes are excluded from indexing.
