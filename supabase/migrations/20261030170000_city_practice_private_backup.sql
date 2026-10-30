-- Opt-in fictional city backup. Not real-life evidence, grades or user profiles.
create table public.city_practice_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision integer not null default 1 check (revision > 0),
  state jsonb not null check (
    jsonb_typeof(state) = 'object'
    and octet_length(state::text) <= 18000
  ),
  updated_at timestamptz not null default now()
);
alter table public.city_practice_saves enable row level security;
revoke all on public.city_practice_saves from public, anon, authenticated;
-- The server performs guardian and account checks; browser clients cannot write.
grant select on public.city_practice_saves to authenticated;
grant all on public.city_practice_saves to service_role;
create policy city_practice_owner_read
  on public.city_practice_saves for select to authenticated
  using ((select auth.uid()) = user_id);
comment on table public.city_practice_saves is
  'Optional, sanitized fictional city snapshot. Owner-only; signed-in server writes with conflict detection. No personal data, grades, AI messages or real Quest evidence.';
