# ADR 0004: Stage 2 identity and access

- Status: Accepted
- Date: 2026-07-24

Supabase Auth owns email/password and Google OAuth identities. Supabase
PostgreSQL owns private profiles, preferences, append-only consent and the
identity checkpoint. SSR cookie clients refresh sessions; Proxy performs only
optimistic redirects; server DAL checks and RLS remain authoritative.

An Auth trigger provisions one profile, preference row and checkpoint. RLS
allows authenticated self-only reads. Approved profile and preference columns
alone are directly updateable. Consent and checkpoint transitions use
restricted security-definer functions with an empty search path.

Stage 2 ends at `stage_3_ready`; it does not fabricate Discovery state.
