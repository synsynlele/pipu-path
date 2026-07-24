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
