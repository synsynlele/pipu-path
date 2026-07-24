# Quality attributes

| Attribute         | Stage 1 baseline                                                 | Product-stage obligation                          |
| ----------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| Security          | No secrets in client code; hardened headers; dependency lockfile | Threat model, authorization tests, rate limits    |
| Privacy           | No product data collected; safe logging contract                 | Data classification, consent, retention, deletion |
| Accessibility     | Semantic shells, focus visibility, contrast, reduced motion      | Automated and manual critical-path checks         |
| Reliability       | Deterministic build and tests; error/404 boundaries              | Idempotency, retries, recovery, SLOs              |
| Performance       | Server Components by default; minimal client JS                  | Budgets and measured critical-path metrics        |
| Observability     | Structured logger with safe context                              | Request correlation, metrics, traces, alerts      |
| Maintainability   | Strict TypeScript, modules, CI, decision records                 | Boundary tests and migration discipline           |
| Low-bandwidth use | Lightweight CSS-first shells and no decorative assets            | Offline/resume rules for long workflows           |
