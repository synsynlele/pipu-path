# Stage 2 test matrix

| Layer                            | Current result                                               |
| -------------------------------- | ------------------------------------------------------------ |
| Unit/component                   | 21 passed; 94.20% statements and 94.02% lines                |
| Structural integration           | 11 passed                                                    |
| Migration clean replay           | Three migrations passed from an empty transactional schema   |
| Remote generated types           | Generated and TypeScript reconciled                          |
| pgTAP RLS                        | 19/19 passed                                                 |
| Anonymous API                    | Tables and controlled RPCs denied with `42501`               |
| Authenticated API/RLS            | 19/19 passed across users A/B and service role               |
| Email signup/confirmation/login  | Passed with two approved inbox aliases                       |
| Duplicate/invalid/logout/refresh | Passed                                                       |
| Recovery token/update/invalid    | Passed using an Admin-generated recovery link                |
| Recovery email delivery          | Passed with approved staging inbox                           |
| Google OAuth initiation/config   | Passed; redirects to `accounts.google.com`                   |
| Google OAuth completion          | Passed with approved Google test account                     |
| Browser E2E                      | 4/4 desktop/mobile staging tests passed in GitHub Actions    |
| Deployed anonymous browser       | Public routes and protected-route redirects passed           |
| Deployed OAuth client config     | Repaired and verified                                        |
| HTTP route smoke                 | Public `200`; protected `307`; invalid callback fails closed |
| Production build                 | Passed                                                       |
| Dependency audit                 | Zero vulnerabilities                                         |
| Secret scan                      | Server secrets absent from Git files and browser bundle      |

No unexecuted test is reported as passed.

## Stage 3

| Layer                  | Result                                                             |
| ---------------------- | ------------------------------------------------------------------ |
| Domain/unit            | 4 Discovery tests; 25 repository tests pass                        |
| Structural integration | 21/21 repository assertions pass                                   |
| Migration              | `004`, `005`, `006` dry-run and apply passed on disposable staging |
| Generated types        | Management API generation exactly matches committed types          |
| pgTAP/RLS              | 24/24 passed                                                       |
| Staging API            | 12/12 passed with two deterministic users and cleanup              |
| Age variants           | Youth-safe/adult-only filtering enforced server-side               |
| Concurrency            | Stale version returns stable non-retryable conflict                |
| Review/completion      | Required denial, review, completion and idempotency pass           |
| Anonymous browser      | Discovery protected-route redirect covered                         |
| Authenticated browser  | Pending deployment of this Stage 3 commit                          |
| Formatting/lint/types  | Passed; lint has zero warnings                                     |
| Production build       | Passed; four Discovery routes compiled                             |
| Dependency audit       | Zero vulnerabilities                                               |
| Secret scan            | No credential values tracked                                       |

No private response content is used or retained by verification fixtures.
