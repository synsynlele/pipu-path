# Service map

| Capability         | Server boundary                    | Core guarantee                                                                |
| ------------------ | ---------------------------------- | ----------------------------------------------------------------------------- |
| Authentication     | Supabase Auth server actions       | Email and Google use server-owned redirects and privacy-safe errors           |
| OAuth callback     | `/auth/callback` + callback client | PKCE exchange, response-cookie persistence, trusted origin and safe next path |
| Progress routing   | Identity progress DAL/domain       | One canonical first-incomplete destination for OAuth, email and returners     |
| Identity/consent   | Controlled identity RPCs           | Ownership, age band, consent and safeguarding checkpoint                      |
| Discovery          | Discovery DAL and RPCs             | Owner evidence, optimistic versioning, review and completion                  |
| Potential Profile  | Server-only Gemini provider        | Validated private synthesis with provenance and feedback                      |
| Mission            | Mission actions/provider/RPCs      | One practical active Mission, refinement and recovery                         |
| Journey            | Journey actions/provider/RPCs      | Ordered realistic milestones and explicit activation                          |
| Quests             | Quest actions/provider/RPCs        | Action, evidence, reflection, exactly-once XP and progression                 |
| Projects           | Project actions/RPCs               | Quest provenance, three milestones and append-only proof updates              |
| Portfolio          | Portfolio actions/RPCs             | Adult safeguarding, explicit consent, narrow public projection and withdrawal |
| Auth rate limiting | `consume_stage10_auth_rate_limit`  | Atomic cross-instance limits using SHA-256 request fingerprints               |
| Home               | Authenticated progress DAL         | Current data only and one contextual next action                              |

Gemini keys and service-role credentials remain server-only. Browser writes use
server actions and controlled database functions rather than direct private
writes.
