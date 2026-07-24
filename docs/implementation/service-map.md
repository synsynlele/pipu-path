# Service map

| Operation          | Boundary                    | Guarantees                                                                |
| ------------------ | --------------------------- | ------------------------------------------------------------------------- |
| Start/resume       | `start_or_resume_discovery` | Server identity, age eligibility, idempotent active/completed session     |
| Load               | Discovery DAL               | Own session, eligible published questions, own responses                  |
| Save/skip          | `save_discovery_response`   | Ownership, type/constraint checks, server sensitivity, optimistic version |
| Progress           | `discovery_progress`        | Derived from eligible questions and saved responses                       |
| Review             | `open_discovery_review`     | Required answers present, valid transition                                |
| Complete           | `complete_discovery`        | Review state, idempotency, timestamp, checkpoint and handoff status       |
| Stage 4 projection | `getStage4DiscoveryHandoff` | Completed-only normalized typed input                                     |

All browser writes pass through server actions and controlled functions.
Service-role credentials are not used by the application flow.
