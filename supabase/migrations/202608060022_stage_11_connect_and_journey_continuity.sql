-- Stage 11: opt-in adult Builder Connect and repeatable Journey cycles.

create type public.builder_connection_reason as enum (
  'collaborate', 'learn', 'support', 'share_resources'
);
create type public.builder_connection_status as enum (
  'pending', 'accepted', 'declined', 'cancelled', 'removed', 'blocked'
);
create type public.builder_report_reason as enum (
  'unsafe_contact', 'harassment', 'false_identity', 'inappropriate_content', 'other'
);

create table public.builder_network_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  headline text not null check (char_length(headline) between 10 and 160),
  can_help_with text[] not null default '{}' check (cardinality(can_help_with) between 1 and 6),
  needs_help_with text[] not null default '{}' check (cardinality(needs_help_with) between 1 and 6),
  interests text[] not null default '{}' check (cardinality(interests) between 1 and 8),
  is_discoverable boolean not null default false,
  consent_version text,
  enabled_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint builder_network_visibility_consistency check (
    (is_discoverable and consent_version is not null and enabled_at is not null and disabled_at is null)
    or (not is_discoverable)
  )
);

create table public.builder_connection_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  reason public.builder_connection_reason not null,
  status public.builder_connection_status not null default 'pending',
  pair_key text generated always as (
    least(requester_id::text, recipient_id::text) || ':' || greatest(requester_id::text, recipient_id::text)
  ) stored,
  responded_at timestamptz,
  cancelled_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint builder_connection_not_self check (requester_id <> recipient_id)
);

create unique index builder_connections_one_live_pair_idx
  on public.builder_connection_requests(pair_key)
  where status in ('pending', 'accepted');
create index builder_connections_requester_idx
  on public.builder_connection_requests(requester_id, created_at desc);
create index builder_connections_recipient_idx
  on public.builder_connection_requests(recipient_id, created_at desc);

create table public.builder_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint builder_block_not_self check (blocker_id <> blocked_id)
);

create table public.builder_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  reason public.builder_report_reason not null,
  created_at timestamptz not null default now(),
  constraint builder_report_not_self check (reporter_id <> reported_user_id)
);

alter table public.builder_network_profiles enable row level security;
alter table public.builder_connection_requests enable row level security;
alter table public.builder_blocks enable row level security;
alter table public.builder_reports enable row level security;

revoke all on public.builder_network_profiles, public.builder_connection_requests,
  public.builder_blocks, public.builder_reports from public, anon, authenticated;
grant select on public.builder_network_profiles, public.builder_connection_requests,
  public.builder_blocks, public.builder_reports to authenticated;

create policy builder_network_profile_own_select
  on public.builder_network_profiles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy builder_connection_participant_select
  on public.builder_connection_requests for select to authenticated
  using ((select auth.uid()) in (requester_id, recipient_id));
create policy builder_blocks_own_select
  on public.builder_blocks for select to authenticated
  using ((select auth.uid()) = blocker_id);
create policy builder_reports_own_select
  on public.builder_reports for select to authenticated
  using ((select auth.uid()) = reporter_id);

create or replace function public.stage11_network_eligible(actor uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles profile
    where profile.id = actor
      and profile.account_status = 'active'
      and profile.age_band in ('18_24', '25_plus')
      and not profile.safeguarding_review_required
      and profile.username is not null
  );
$$;
revoke all on function public.stage11_network_eligible(uuid) from public, anon, authenticated;
grant execute on function public.stage11_network_eligible(uuid) to service_role;

create or replace function public.save_stage11_network_profile(
  headline_input text,
  can_help_with_input text[],
  needs_help_with_input text[],
  interests_input text[],
  discoverable_input boolean,
  consent_version_input text default 'builder-connect-v1'
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare actor uuid := auth.uid();
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode = 'P0001'; end if;
  if not public.stage11_network_eligible(actor) then
    raise exception 'CONNECT_ADULT_ELIGIBILITY_REQUIRED' using errcode = 'P0001';
  end if;
  if char_length(trim(headline_input)) not between 10 and 160
    or cardinality(can_help_with_input) not between 1 and 6
    or cardinality(needs_help_with_input) not between 1 and 6
    or cardinality(interests_input) not between 1 and 8 then
    raise exception 'CONNECT_PROFILE_INVALID' using errcode = 'P0001';
  end if;

  insert into public.builder_network_profiles (
    user_id, headline, can_help_with, needs_help_with, interests,
    is_discoverable, consent_version, enabled_at, disabled_at
  ) values (
    actor, trim(headline_input), can_help_with_input, needs_help_with_input,
    interests_input, discoverable_input,
    case when discoverable_input then consent_version_input else null end,
    case when discoverable_input then now() else null end,
    case when discoverable_input then null else now() end
  )
  on conflict (user_id) do update set
    headline = excluded.headline,
    can_help_with = excluded.can_help_with,
    needs_help_with = excluded.needs_help_with,
    interests = excluded.interests,
    is_discoverable = excluded.is_discoverable,
    consent_version = excluded.consent_version,
    enabled_at = case
      when excluded.is_discoverable then coalesce(public.builder_network_profiles.enabled_at, now())
      else public.builder_network_profiles.enabled_at
    end,
    disabled_at = case when excluded.is_discoverable then null else now() end,
    updated_at = now();

  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values (actor, 'builder_network_profile_saved', 'success',
    jsonb_build_object('discoverable', discoverable_input));
  return true;
end $$;

create or replace function public.search_stage11_builders(
  search_input text default null,
  limit_input integer default 24
) returns table (
  user_id uuid,
  username text,
  display_name text,
  headline text,
  can_help_with text[],
  needs_help_with text[],
  interests text[],
  portfolio_slug text,
  portfolio_title text,
  relationship_status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare actor uuid := auth.uid(); safe_limit integer := least(greatest(limit_input, 1), 50);
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode = 'P0001'; end if;
  if not public.stage11_network_eligible(actor) then
    raise exception 'CONNECT_ADULT_ELIGIBILITY_REQUIRED' using errcode = 'P0001';
  end if;
  return query
  select profile.id,
    profile.username::text,
    coalesce(profile.display_name, profile.preferred_name, profile.username::text),
    network.headline,
    network.can_help_with,
    network.needs_help_with,
    network.interests,
    portfolio.slug::text,
    portfolio.public_title,
    coalesce((
      select request.status::text
      from public.builder_connection_requests request
      where request.pair_key = least(actor::text, profile.id::text) || ':' || greatest(actor::text, profile.id::text)
      order by request.created_at desc limit 1
    ), 'none')
  from public.builder_network_profiles network
  join public.profiles profile on profile.id = network.user_id
  left join public.builder_project_portfolios portfolio
    on portfolio.user_id = profile.id and portfolio.status = 'published'
  where network.is_discoverable
    and profile.id <> actor
    and profile.account_status = 'active'
    and profile.age_band in ('18_24', '25_plus')
    and not profile.safeguarding_review_required
    and not exists (
      select 1 from public.builder_blocks block
      where (block.blocker_id = actor and block.blocked_id = profile.id)
         or (block.blocker_id = profile.id and block.blocked_id = actor)
    )
    and (
      nullif(trim(search_input), '') is null
      or profile.username::text ilike '%' || trim(search_input) || '%'
      or coalesce(profile.display_name, '') ilike '%' || trim(search_input) || '%'
      or network.headline ilike '%' || trim(search_input) || '%'
      or exists (select 1 from unnest(network.interests) interest where interest ilike '%' || trim(search_input) || '%')
    )
  order by network.updated_at desc
  limit safe_limit;
end $$;

create or replace function public.get_stage11_builder(username_input text)
returns table (
  user_id uuid,
  username text,
  display_name text,
  headline text,
  can_help_with text[],
  needs_help_with text[],
  interests text[],
  portfolio_slug text,
  portfolio_title text,
  relationship_status text
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select * from public.search_stage11_builders(username_input, 50)
  where username = lower(trim(username_input))
  limit 1;
$$;

create or replace function public.send_stage11_connection_request(
  recipient_id_input uuid,
  reason_input public.builder_connection_reason
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare actor uuid := auth.uid(); request_id uuid;
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode = 'P0001'; end if;
  if not public.stage11_network_eligible(actor) then raise exception 'CONNECT_ADULT_ELIGIBILITY_REQUIRED' using errcode = 'P0001'; end if;
  if actor = recipient_id_input then raise exception 'CONNECT_SELF_REQUEST' using errcode = 'P0001'; end if;
  if not exists (
    select 1 from public.builder_network_profiles network
    join public.profiles profile on profile.id = network.user_id
    where network.user_id = recipient_id_input and network.is_discoverable
      and profile.account_status = 'active' and profile.age_band in ('18_24', '25_plus')
      and not profile.safeguarding_review_required
  ) then raise exception 'CONNECT_BUILDER_NOT_AVAILABLE' using errcode = 'P0001'; end if;
  if exists (
    select 1 from public.builder_blocks block
    where (block.blocker_id = actor and block.blocked_id = recipient_id_input)
       or (block.blocker_id = recipient_id_input and block.blocked_id = actor)
  ) then raise exception 'CONNECT_BUILDER_NOT_AVAILABLE' using errcode = 'P0001'; end if;

  insert into public.builder_connection_requests(requester_id, recipient_id, reason)
  values(actor, recipient_id_input, reason_input)
  returning id into request_id;
  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values(actor, 'builder_connection_requested', 'success', jsonb_build_object('request_id', request_id));
  return request_id;
exception when unique_violation then
  raise exception 'CONNECT_REQUEST_EXISTS' using errcode = 'P0001';
end $$;

create or replace function public.respond_stage11_connection_request(
  request_id_input uuid,
  action_input text
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare actor uuid := auth.uid(); request_row public.builder_connection_requests%rowtype;
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode = 'P0001'; end if;
  select * into request_row from public.builder_connection_requests
  where id = request_id_input and actor in (requester_id, recipient_id) for update;
  if request_row.id is null then raise exception 'CONNECT_REQUEST_NOT_FOUND' using errcode = 'P0001'; end if;

  if action_input in ('accept', 'decline') then
    if actor <> request_row.recipient_id or request_row.status <> 'pending' then
      raise exception 'CONNECT_ACTION_NOT_ALLOWED' using errcode = 'P0001';
    end if;
    update public.builder_connection_requests set
      status = case when action_input = 'accept' then 'accepted'::public.builder_connection_status else 'declined'::public.builder_connection_status end,
      responded_at = now(), updated_at = now()
    where id = request_row.id;
  elsif action_input = 'cancel' then
    if actor <> request_row.requester_id or request_row.status <> 'pending' then
      raise exception 'CONNECT_ACTION_NOT_ALLOWED' using errcode = 'P0001';
    end if;
    update public.builder_connection_requests set status = 'cancelled', cancelled_at = now(), updated_at = now()
    where id = request_row.id;
  elsif action_input = 'remove' then
    if request_row.status <> 'accepted' then raise exception 'CONNECT_ACTION_NOT_ALLOWED' using errcode = 'P0001'; end if;
    update public.builder_connection_requests set status = 'removed', removed_at = now(), updated_at = now()
    where id = request_row.id;
  else
    raise exception 'CONNECT_ACTION_NOT_ALLOWED' using errcode = 'P0001';
  end if;
  return true;
end $$;

create or replace function public.get_stage11_my_network()
returns table (
  request_id uuid,
  other_user_id uuid,
  username text,
  display_name text,
  headline text,
  relationship_status text,
  direction text,
  reason text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare actor uuid := auth.uid();
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode = 'P0001'; end if;
  return query
  select request.id,
    case when request.requester_id = actor then request.recipient_id else request.requester_id end,
    profile.username::text,
    coalesce(profile.display_name, profile.preferred_name, profile.username::text),
    network.headline,
    request.status::text,
    case when request.requester_id = actor then 'outgoing' else 'incoming' end,
    request.reason::text,
    request.created_at
  from public.builder_connection_requests request
  join public.profiles profile
    on profile.id = case when request.requester_id = actor then request.recipient_id else request.requester_id end
  left join public.builder_network_profiles network on network.user_id = profile.id
  where actor in (request.requester_id, request.recipient_id)
    and request.status in ('pending', 'accepted')
  order by case when request.status = 'pending' then 0 else 1 end, request.created_at desc;
end $$;

create or replace function public.block_stage11_builder(blocked_id_input uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare actor uuid := auth.uid();
begin
  if actor is null or actor = blocked_id_input then raise exception 'CONNECT_ACTION_NOT_ALLOWED' using errcode = 'P0001'; end if;
  insert into public.builder_blocks(blocker_id, blocked_id) values(actor, blocked_id_input)
  on conflict do nothing;
  update public.builder_connection_requests set status = 'blocked', updated_at = now()
  where pair_key = least(actor::text, blocked_id_input::text) || ':' || greatest(actor::text, blocked_id_input::text)
    and status in ('pending', 'accepted');
  return true;
end $$;

create or replace function public.report_stage11_builder(
  reported_user_id_input uuid,
  reason_input public.builder_report_reason
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare actor uuid := auth.uid(); report_id uuid;
begin
  if actor is null or actor = reported_user_id_input then raise exception 'CONNECT_ACTION_NOT_ALLOWED' using errcode = 'P0001'; end if;
  insert into public.builder_reports(reporter_id, reported_user_id, reason)
  values(actor, reported_user_id_input, reason_input) returning id into report_id;
  return report_id;
end $$;

revoke all on function public.save_stage11_network_profile(text,text[],text[],text[],boolean,text) from public, anon;
revoke all on function public.search_stage11_builders(text,integer) from public, anon;
revoke all on function public.get_stage11_builder(text) from public, anon;
revoke all on function public.send_stage11_connection_request(uuid,public.builder_connection_reason) from public, anon;
revoke all on function public.respond_stage11_connection_request(uuid,text) from public, anon;
revoke all on function public.get_stage11_my_network() from public, anon;
revoke all on function public.block_stage11_builder(uuid) from public, anon;
revoke all on function public.report_stage11_builder(uuid,public.builder_report_reason) from public, anon;
grant execute on function public.save_stage11_network_profile(text,text[],text[],text[],boolean,text) to authenticated;
grant execute on function public.search_stage11_builders(text,integer) to authenticated;
grant execute on function public.get_stage11_builder(text) to authenticated;
grant execute on function public.send_stage11_connection_request(uuid,public.builder_connection_reason) to authenticated;
grant execute on function public.respond_stage11_connection_request(uuid,text) to authenticated;
grant execute on function public.get_stage11_my_network() to authenticated;
grant execute on function public.block_stage11_builder(uuid) to authenticated;
grant execute on function public.report_stage11_builder(uuid,public.builder_report_reason) to authenticated;

-- Continuing Journey cycles. Existing Journeys become Cycle 1 without rewriting history.
alter table public.journey_generation_requests
  add column if not exists request_purpose text not null default 'standard'
    check (request_purpose in ('standard', 'continuation')),
  add column if not exists cycle_number smallint not null default 1 check (cycle_number between 1 and 50);
alter table public.user_journeys
  add column if not exists cycle_number smallint not null default 1 check (cycle_number between 1 and 50),
  add column if not exists continuation_of_journey_id uuid references public.user_journeys(id) on delete restrict;
create unique index if not exists user_journeys_one_continuation_source_idx
  on public.user_journeys(continuation_of_journey_id)
  where continuation_of_journey_id is not null;

create or replace function public.create_stage11_journey_continuation_request(
  source_journey_id_input uuid,
  prompt_version_input text default 'journey-continuity-openai-v1'
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare actor uuid := auth.uid(); source_row public.user_journeys%rowtype; request_id uuid; attempt_count integer;
begin
  if actor is null then raise exception 'JOURNEY_ACCESS_DENIED' using errcode = 'P0001'; end if;
  select * into source_row from public.user_journeys
  where id = source_journey_id_input and user_id = actor and status = 'completed';
  if source_row.id is null then raise exception 'JOURNEY_NOT_FOUND' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.user_missions where id = source_row.mission_id and user_id = actor and status = 'active') then
    raise exception 'JOURNEY_MISSION_REQUIRED' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.user_journeys where mission_id = source_row.mission_id and status in ('active', 'draft')) then
    raise exception 'JOURNEY_GENERATION_DISABLED' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.user_journeys where continuation_of_journey_id = source_row.id) then
    raise exception 'JOURNEY_GENERATION_DISABLED' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.journey_generation_requests where user_id = actor and status in ('ready', 'processing')) then
    raise exception 'JOURNEY_REQUEST_ALREADY_RUNNING' using errcode = 'P0001';
  end if;
  select count(*) into attempt_count from public.journey_generation_requests
  where user_id = actor and source_journey_id = source_row.id and request_purpose = 'continuation';
  if attempt_count >= 3 then raise exception 'JOURNEY_GENERATION_LIMIT_REACHED' using errcode = 'P0001'; end if;
  insert into public.journey_generation_requests(
    user_id, mission_id, source_journey_id, generation_kind, request_purpose,
    cycle_number, prompt_version
  ) values (
    actor, source_row.mission_id, source_row.id, 'initial', 'continuation',
    source_row.cycle_number + 1, prompt_version_input
  ) returning id into request_id;
  return request_id;
end $$;

create or replace function public.persist_stage11_journey_continuation(
  request_id_input uuid,
  journey_input jsonb
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare request_row public.journey_generation_requests%rowtype; source_row public.user_journeys%rowtype; journey_id uuid; milestone jsonb; expected_order integer := 1;
begin
  select * into request_row from public.journey_generation_requests
  where id = request_id_input and status = 'processing' and request_purpose = 'continuation' for update;
  if request_row.id is null then raise exception 'JOURNEY_SAVE_FAILED' using errcode = 'P0001'; end if;
  select * into source_row from public.user_journeys
  where id = request_row.source_journey_id and user_id = request_row.user_id and status = 'completed';
  if source_row.id is null then raise exception 'JOURNEY_NOT_FOUND' using errcode = 'P0001'; end if;
  if jsonb_typeof(journey_input -> 'milestones') <> 'array'
    or jsonb_array_length(journey_input -> 'milestones') not between 4 and 6 then
    raise exception 'JOURNEY_OUTPUT_INVALID' using errcode = 'P0001';
  end if;
  insert into public.user_journeys(
    user_id, mission_id, generation_request_id, continuation_of_journey_id,
    cycle_number, title, summary, target_outcome, suggested_duration, model, prompt_version
  ) values (
    request_row.user_id, request_row.mission_id, request_row.id, source_row.id,
    request_row.cycle_number, journey_input ->> 'title', journey_input ->> 'summary',
    journey_input ->> 'target_outcome', journey_input ->> 'suggested_duration',
    request_row.model, request_row.prompt_version
  ) returning id into journey_id;
  for milestone in select value from jsonb_array_elements(journey_input -> 'milestones') loop
    if (milestone ->> 'sequence_order')::integer <> expected_order then raise exception 'JOURNEY_OUTPUT_INVALID' using errcode = 'P0001'; end if;
    insert into public.journey_milestones(
      journey_id, title, purpose, expected_outcome, suggested_duration,
      capabilities_to_develop, completion_signal, resource_note, sequence_order
    ) values (
      journey_id, milestone ->> 'title', milestone ->> 'purpose',
      milestone ->> 'expected_outcome', milestone ->> 'suggested_duration',
      array(select jsonb_array_elements_text(milestone -> 'capabilities_to_develop')),
      milestone ->> 'completion_signal', milestone ->> 'resource_note', expected_order
    );
    expected_order := expected_order + 1;
  end loop;
  update public.journey_generation_requests set status = 'completed', completed_at = now(), updated_at = now()
  where id = request_row.id;
  return journey_id;
end $$;

revoke all on function public.create_stage11_journey_continuation_request(uuid,text) from public, anon;
grant execute on function public.create_stage11_journey_continuation_request(uuid,text) to authenticated;
revoke all on function public.persist_stage11_journey_continuation(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.persist_stage11_journey_continuation(uuid,jsonb) to service_role;
