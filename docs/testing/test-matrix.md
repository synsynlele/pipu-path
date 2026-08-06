# Stage 11 critical test matrix

Stage 11 deliberately avoids re-running every historical browser scenario for
every small edit. The release still keeps the merge gate strong: changed domain
rules, database boundaries, production build and a small authenticated live
matrix must pass on the exact final head.

| Layer                  | Critical Stage 11 requirement                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| Unit/domain            | Connect validation, Journey continuation eligibility, distinct continuation fallback and progression order  |
| Structural integration | Connect routes/navigation, no messaging, RLS/grants/RPCs, adult safeguards and renewable-cycle contracts    |
| Database               | Enum order, migrations, RLS, policies, grants, helper privacy, relationship transitions and continuation    |
| Authenticated Connect  | Opt in, discover, detail, request, cancel, accept, decline, remove, block, report and contact consent       |
| Journey continuation   | Completed Journey + Project unlocks cycle 2; incomplete Project is denied; refresh recovers persisted state |
| Privacy                | Minor/ineligible users cannot activate; contacts are absent until explicit accepted-connection consent      |
| Viewports              | Connect navigation and critical controls remain usable on desktop and narrow mobile                         |
| Build                  | Format, zero-warning lint, strict TypeScript, targeted tests and Next.js production build                   |
| Release                | Exact Git head, matching READY Preview, critical smoke paths, merge and production health                   |

Historical Stage 0–10 unit and integration suites remain in CI as regression
protection. The live browser matrix is narrowed to changed critical paths to
conserve external provider and deployment limits.
