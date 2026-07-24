# Stage 2 security boundaries

1. Browser code receives only the Supabase URL and anonymous key.
2. The service-role key is server-only and bypasses RLS only for authorised
   recovery/administrative operations.
3. Server actions derive identity from `auth.getUser()`, never form user IDs.
4. Every private identity table has RLS.
5. Anonymous roles have no table privileges or security-definer execution.
6. Authenticated users read only their own private records.
7. Protected ownership, status, safeguarding and onboarding columns are not
   directly updateable.
8. Consent is append-only and checkpoint completion is a controlled RPC.
9. Private identity is not public Builder discovery.
10. Age is stored only as a band; minor status is database-derived.
11. OAuth initiation, PKCE state creation and callback exchange execute on the
    server; the browser receives only the provider redirect.

Staging verification found and repaired inherited Supabase default table and
function grants in migrations `202607240002` and `202607240003`.

## Stage 3 Discovery boundaries

1. Anonymous users receive no Discovery table or function access.
2. Published definitions are limited to authenticated, eligible age bands;
   draft and retired definitions remain hidden.
3. Users read only their own sessions and responses and cannot mutate tables
   directly.
4. Controlled functions derive `auth.uid()`, validate the Stage 2 checkpoint,
   session ownership, question eligibility, response shape and valid state.
5. Progress, ownership, completion, processing status and sensitivity are
   server-managed.
6. Sensitive answers remain private and are never copied into audit metadata.
7. Optimistic version checks reject stale tabs without database retry loops.
8. Internal migrated function implementations have all execution revoked;
   only stable controlled wrappers are granted to `authenticated`.
9. The normal application path never uses service-role credentials.
10. The Stage 4 handoff is a completed-only normalized projection, not raw
    records and not an interpretation.
