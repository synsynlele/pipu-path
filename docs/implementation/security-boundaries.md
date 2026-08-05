# Security boundaries

1. Browser code receives only the Supabase URL and anonymous key.
2. Service-role and Gemini credentials remain server-only.
3. Private tables retain RLS, owner policies and controlled transition RPCs.
4. Server actions derive identity from `auth.getUser()`, never submitted user IDs.
5. OAuth uses PKCE, exchanges the code server-side and copies session cookies to
   the redirect response.
6. OAuth and post-auth redirects reject external or protocol-relative targets.
7. Trusted callback origins are limited to the configured app, localhost and
   Vercel Preview hostnames; non-local HTTP origins are rejected.
8. Password recovery retains its explicit reset route.
9. Authenticated users cannot be routed back to the public landing, login or
   signup experience.
10. Authentication attempts use an atomic Supabase rate-limit bucket. Only a
    SHA-256 fingerprint is stored; raw addresses and submitted credentials are
    not retained.
11. The rate-limit table has RLS and no browser table grants. Anonymous access is
    limited to the validated consume RPC.
12. Public Project proof is adult-only, consented, reversible and limited to the
    Stage 9 eleven-field projection.
13. Unknown or withdrawn proof slugs return HTTP 404 before private data can
    render.
14. Security headers deny framing, MIME sniffing and unnecessary browser
    capabilities and restrict resource origins.
15. Error states never expose SQL, provider payloads, stack traces, secrets or
    internal identifiers.
16. Production infrastructure is unchanged until exact Preview and staging
    verification pass.
