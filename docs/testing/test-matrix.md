# MVP test matrix

No unexecuted critical flow is reported as passed.

| Layer                  | Stage 10 requirement                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Unit/component         | Progress precedence, OAuth origin/redirect safety, navigation, UI states and rate-limit fingerprint                                |
| Structural integration | Stages 2–10 contracts, route inventory, security headers, no banned Stage 10 features and release documentation                    |
| Database/RLS           | All existing RLS plus Stage 10 private rate-limit table and controlled RPC                                                         |
| Email authentication   | Signup/login, incomplete routing, completed-user Home, sign-out and recovery                                                       |
| Google OAuth           | Provider initiation, approved account completion, callback cookie persistence and correct next incomplete route                    |
| Fresh-user browser     | Landing through Identity, Discovery, Profile, Mission, Journey, Quests, Project and Portfolio lifecycle                            |
| Returning-user browser | Correct destination at each major persisted checkpoint and refresh recovery                                                        |
| Portfolio browser      | Publish 200, withdraw 404, same-slug republish 200 and no private content                                                          |
| Viewports              | Narrow mobile, tablet and desktop; fixed bottom navigation does not cover actions                                                  |
| Accessibility          | Labels, keyboard focus, status announcements, reduced motion and non-colour status meaning                                         |
| Build/runtime          | Formatting, zero-warning lint, strict TypeScript, coverage, integration, database tests, production build and console/runtime logs |
| Release                | Exact Git head, matching Preview/staging, checklist, rollback and debt disposition                                                 |
