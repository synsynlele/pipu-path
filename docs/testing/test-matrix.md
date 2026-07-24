# Stage 2 test matrix

| Layer                            | Current result                                               |
| -------------------------------- | ------------------------------------------------------------ |
| Unit/component                   | 19 passed; 95.45% statements and 95.31% lines                |
| Structural integration           | 10 passed                                                    |
| Migration clean replay           | Three migrations passed from an empty transactional schema   |
| Remote generated types           | Generated and TypeScript reconciled                          |
| pgTAP RLS                        | 19/19 passed                                                 |
| Anonymous API                    | Tables and controlled RPCs denied with `42501`               |
| Authenticated API/RLS            | 19/19 passed across users A/B and service role               |
| Email signup/confirmation/login  | Passed with two approved inbox aliases                       |
| Duplicate/invalid/logout/refresh | Passed                                                       |
| Recovery token/update/invalid    | Passed using an Admin-generated recovery link                |
| Recovery email delivery          | Blocked by built-in provider hourly quota (`429`)            |
| Google OAuth initiation/config   | Passed; redirects to `accounts.google.com`                   |
| Google OAuth completion          | Blocked by unavailable interactive browser                   |
| Browser E2E                      | Browser download blocked in current runtime                  |
| Deployed anonymous browser       | Public routes and protected-route redirects passed           |
| Deployed OAuth client config     | Defect found and repaired; redeployment verification pending |
| HTTP route smoke                 | Public `200`; protected `307`; invalid callback fails closed |
| Production build                 | Passed                                                       |
| Dependency audit                 | Zero vulnerabilities                                         |
| Secret scan                      | Server secrets absent from Git files and browser bundle      |

No unexecuted test is reported as passed.
