-- Stage 11 Builder Connect schema, RLS and private helper predicates.
-- Stage 11: adult-only Builder Connect and renewable Builder Journey cycles.
-- New tables remain private by default. Cross-user reads and every mutation use
-- explicit authenticated RPCs with allow-listed output.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

alter table public.journey_generation_requests
  add column if not exists cycle_number integer not null default 1,
  add column if not exists continues_journey_id uuid references public.user_journeys(id) on delete restrict;

alter table public.user_journeys
  add column if not exists cycle_number integer not null default 1,
  add column if not exists continues_journey_id uuid references public.user_journeys(id) on delete restrict;

alter table public.journey_generation_requests
  add constraint journey_generation_requests_cycle_positive
  check (cycle_number > 0) not valid;
alter table public.journey_generation_requests
  validate constraint journey_generation_requests_cycle_positive;

alter table public.user_journeys
  add constraint user_journeys_cycle_positive
  check (cycle_number > 0) not valid;
alter table public.user_journeys
  validate constraint user_journeys_cycle_positive;

create index if not exists journey_requests_mission_cycle_idx
  on public.journey_generation_requests(user_id, mission_id, cycle_number, requested_at desc);
create index if not exists user_journeys_mission_cycle_idx
  on public.user_journeys(user_id, mission_id, cycle_number desc, created_at desc);

create type public.builder_connect_visibility as enum ('private', 'discoverable');
create type public.builder_connection_status as enum (
  'pending', 'accepted', 'declined', 'cancelled', 'removed'
);

create table public.builder_connect_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  interests text[] not null default '{}',
  capabilities text[] not null default '{}',
  can_help_with text not null default '',
  needs_help_with text not null default '',
  contact_email text,
  contact_whatsapp text,
  visibility public.builder_connect_visibility not null default 'private',
  discoverable_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint builder_connect_interests_count check (cardinality(interests) between 0 and 8),
  constraint builder_connect_capabilities_count check (cardinality(capabilities) between 0 and 8),
  constraint builder_connect_help_length check (
    char_length(can_help_with) <= 320 and char_length(needs_help_with) <= 320
  ),
  constraint builder_connect_email_length check (
    contact_email is null or char_length(contact_email) between 5 and 254
  ),
  constraint builder_connect_whatsapp_length check (
    contact_whatsapp is null or char_length(contact_whatsapp) between 7 and 32
  )
);

create table public.builder_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status public.builder_connection_status not null default 'pending',
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  accepted_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint builder_connections_distinct_users check (requester_id <> recipient_id)
);

create unique index builder_connections_unique_pair_idx
  on public.builder_connections(
    least(requester_id, recipient_id), greatest(requester_id, recipient_id)
  );
create index builder_connections_requester_status_idx
  on public.builder_connections(requester_id, status, updated_at desc);
create index builder_connections_recipient_status_idx
  on public.builder_connections(recipient_id, status, updated_at desc);

create table public.builder_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint builder_blocks_distinct_users check (blocker_id <> blocked_id)
);

create table public.builder_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  reason_code text not null check (
    reason_code in ('spam', 'harassment', 'unsafe_contact', 'impersonation', 'other')
  ),
  detail text check (detail is null or char_length(detail) between 3 and 500),
  created_at timestamptz not null default now(),
  constraint builder_reports_distinct_users check (reporter_id <> reported_id)
);
create index builder_reports_reported_idx
  on public.builder_reports(reported_id, created_at desc);

create table public.builder_contact_shares (
  connection_id uuid not null references public.builder_connections(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  share_email boolean not null default false,
  share_whatsapp boolean not null default false,
  shared_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (connection_id, owner_id),
  constraint builder_contact_share_has_channel check (share_email or share_whatsapp)
);

create trigger builder_connect_profiles_updated_at
before update on public.builder_connect_profiles
for each row execute function public.set_updated_at();
create trigger builder_connections_updated_at
before update on public.builder_connections
for each row execute function public.set_updated_at();
create trigger builder_contact_shares_updated_at
before update on public.builder_contact_shares
for each row execute function public.set_updated_at();

alter table public.builder_connect_profiles enable row level security;
alter table public.builder_connections enable row level security;
alter table public.builder_blocks enable row level security;
alter table public.builder_reports enable row level security;
alter table public.builder_contact_shares enable row level security;

revoke all on public.builder_connect_profiles, public.builder_connections,
  public.builder_blocks, public.builder_reports, public.builder_contact_shares
from public, anon, authenticated;

grant select on public.builder_connect_profiles, public.builder_connections,
  public.builder_blocks, public.builder_reports, public.builder_contact_shares
  to authenticated;

create policy builder_connect_profiles_own_select
on public.builder_connect_profiles for select to authenticated
using ((select auth.uid()) = user_id);

create policy builder_connections_participant_select
on public.builder_connections for select to authenticated
using ((select auth.uid()) in (requester_id, recipient_id));

create policy builder_blocks_own_select
on public.builder_blocks for select to authenticated
using ((select auth.uid()) = blocker_id);

create policy builder_reports_own_select
on public.builder_reports for select to authenticated
using ((select auth.uid()) = reporter_id);

create policy builder_contact_shares_participant_select
on public.builder_contact_shares for select to authenticated
using (
  exists (
    select 1 from public.builder_connections connection
    where connection.id = connection_id
      and (select auth.uid()) in (connection.requester_id, connection.recipient_id)
  )
);

create or replace function private.stage11_builder_connect_eligible(user_id_input uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    join public.onboarding_checkpoints checkpoint on checkpoint.user_id = profile.id
    where profile.id = user_id_input
      and checkpoint.status = 'completed'
      and profile.age_band in ('18_24', '25_plus')
      and not coalesce(profile.safeguarding_review_required, false)
      and profile.username is not null
  );
$$;

create or replace function private.stage11_builder_pair_blocked(first_user uuid, second_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.builder_blocks block
    where (block.blocker_id = first_user and block.blocked_id = second_user)
       or (block.blocker_id = second_user and block.blocked_id = first_user)
  );
$$;

revoke all on function private.stage11_builder_connect_eligible(uuid) from public, anon, authenticated;
revoke all on function private.stage11_builder_pair_blocked(uuid, uuid) from public, anon, authenticated;

