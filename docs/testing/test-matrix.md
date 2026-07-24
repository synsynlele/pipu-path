# Stage 2 test matrix

| Layer                             | Current result                                    |
| --------------------------------- | ------------------------------------------------- |
| Unit/component                    | 19 passed; coverage thresholds passed             |
| Structural integration            | 10 passed                                         |
| Migration dry run                 | Passed on empty staging                           |
| Remote generated types            | Generated and TypeScript reconciled               |
| pgTAP RLS                         | 19/19 passed                                      |
| Anonymous API                     | Tables and controlled RPCs denied with `42501`    |
| Email signup                      | Two approved users created; confirmation required |
| Email confirmation/login/recovery | Awaiting inbox confirmation                       |
| Google OAuth completion           | Awaiting interactive browser                      |
| Browser E2E                       | Browser download blocked in current runtime       |
| Production build                  | Passed                                            |
| Dependency audit                  | Zero vulnerabilities                              |

No unexecuted test is reported as passed.
