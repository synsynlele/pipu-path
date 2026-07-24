# Stage 3 interaction inventory

| Control                  | Working behavior                                                    |
| ------------------------ | ------------------------------------------------------------------- |
| Begin/continue Discovery | Idempotently starts or resumes the user’s durable session           |
| Previous                 | Returns to the preceding eligible question                          |
| Save and continue        | Validates, persists, confirms on the server and advances            |
| Skip for now             | Available only for optional questions and persists an explicit skip |
| Progress indicator       | Uses server-derived eligible-question progress with ARIA values     |
| Review answers           | Requires all required responses and groups answers by section       |
| Edit                     | Returns to one question, saves, then restores review state          |
| Complete Discovery       | Confirms, locks completion and updates the onboarding checkpoint    |
| Completion destination   | Explains the Stage 4 boundary without invented results              |

Controls use native labels, fieldsets, legends, status/alert regions, keyboard
operability and mobile-first layouts. Failed saves retain the browser’s form
input; previously confirmed answers remain server-authoritative.
