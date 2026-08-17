-- Stage 14: privacy-safe product intelligence and PipuPath Mission Control.
-- Browser clients never receive direct access to telemetry, administrator
-- membership or administrator audit records. Aggregate functions are service-role
-- only and return counts rather than learner-level records.

create type public.platform_admin_role as enum (
  'owner',
  'operator',
  'moderator',
  'analyst'
);

create type public.platform_admin_status as enum ('active', 'revoked');

create table public.platform_admins (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role public.platform_admin_role not null,
  status public.platform_admin_status not null default 'active',
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_admin_status_consistency check (
    (status = 'active' and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
  )
);

create trigger platform_admins_updated_at
before update on public.platform_admins
for each row execute function public.set_updated_at();

alter table public.platform_admins enable row level security;
revoke all on public.platform_admins from public, anon, authenticated;
grant select, insert, update, delete on public.platform_admins to service_role;

create table public.admin_audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(id) on delete set null,
  operation text not null check (char_length(operation) between 3 and 80),
  result text not null check (result in ('success', 'failure')),
  target_type text check (target_type is null or char_length(target_type) between 2 and 60),
  target_id text check (target_id is null or char_length(target_id) between 1 and 120),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index admin_audit_events_actor_time_idx
  on public.admin_audit_events(actor_user_id, occurred_at desc);
create index admin_audit_events_operation_time_idx
  on public.admin_audit_events(operation, occurred_at desc);

alter table public.admin_audit_events enable row level security;
revoke all on public.admin_audit_events from public, anon, authenticated;
grant select, insert on public.admin_audit_events to service_role;

alter table public.product_events
  drop constraint if exists product_events_event_name_check;

alter table public.product_events
  add column if not exists feature_key text;

alter table public.product_events
  add constraint product_events_event_name_check check (event_name in (
    'possible_paths_generated',
    'possible_paths_viewed',
    'path_selected',
    'path_changed',
    'pathway_started',
    'first_value_challenge_started',
    'first_value_challenge_completed',
    'feature_viewed'
  ));

alter table public.product_events
  add constraint product_events_feature_key_check check (
    feature_key is null or feature_key in (
      'home',
      'profile',
      'journey',
      'build',
      'portfolio',
      'connect'
    )
  );

alter table public.product_events
  add constraint product_events_feature_view_requires_key check (
    event_name <> 'feature_viewed' or feature_key is not null
  );

create index if not exists product_events_event_time_user_idx
  on public.product_events(event_name, occurred_at desc, user_id);
create index if not exists product_events_feature_time_user_idx
  on public.product_events(feature_key, occurred_at desc, user_id)
  where feature_key is not null;

create or replace function public.get_stage14_admin_dashboard_snapshot(
  window_days_input integer default 30
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  safe_days integer := least(greatest(coalesce(window_days_input, 30), 1), 365);
  window_start timestamptz := now() - make_interval(days => safe_days);
  total_builders bigint := 0;
  new_builders bigint := 0;
  weekly_active_builders bigint := 0;
  monthly_active_builders bigint := 0;
  window_active_builders bigint := 0;
  repeat_builders bigint := 0;
  progress_events bigint := 0;
  discovery_completed bigint := 0;
  profile_ready bigint := 0;
  path_selected bigint := 0;
  mission_started bigint := 0;
  journey_started bigint := 0;
  quest_completed bigint := 0;
  project_started bigint := 0;
  project_completed bigint := 0;
  connected_builders bigint := 0;
begin
  select count(*) into total_builders
  from public.profiles
  where account_status <> 'deleted';

  select count(*) into new_builders
  from public.profiles
  where account_status <> 'deleted'
    and created_at >= window_start;

  select count(distinct user_id) into weekly_active_builders
  from public.product_events
  where occurred_at >= now() - interval '7 days';

  select count(distinct user_id) into monthly_active_builders
  from public.product_events
  where occurred_at >= now() - interval '30 days';

  select count(distinct user_id) into window_active_builders
  from public.product_events
  where occurred_at >= window_start;

  select count(*) into repeat_builders
  from (
    select user_id
    from public.product_events
    where occurred_at >= window_start
    group by user_id
    having count(distinct occurred_at::date) >= 2
  ) repeat_users;

  select count(*) into progress_events
  from public.user_quests
  where status = 'completed'
    and completed_at >= window_start;

  select count(distinct user_id) into discovery_completed
  from public.discovery_sessions
  where status = 'completed';

  select count(distinct user_id) into profile_ready
  from public.human_potential_profile_versions;

  select count(distinct user_id) into path_selected
  from public.economic_pathway_recommendations
  where selected_path_key is not null;

  select count(distinct user_id) into mission_started
  from public.user_missions
  where activated_at is not null;

  select count(distinct user_id) into journey_started
  from public.user_journeys
  where activated_at is not null;

  select count(distinct user_id) into quest_completed
  from public.user_quests
  where status = 'completed';

  select count(distinct user_id) into project_started
  from public.builder_projects;

  select count(distinct user_id) into project_completed
  from public.builder_projects
  where status = 'completed';

  select count(distinct participant_id) into connected_builders
  from (
    select requester_id as participant_id
    from public.builder_connections
    where status = 'accepted'
    union
    select recipient_id as participant_id
    from public.builder_connections
    where status = 'accepted'
  ) accepted_participants;

  return jsonb_build_object(
    'windowDays', safe_days,
    'telemetryStartedAt', now(),
    'totals', jsonb_build_object(
      'builders', total_builders,
      'newBuilders', new_builders,
      'weeklyActiveBuilders', weekly_active_builders,
      'monthlyActiveBuilders', monthly_active_builders,
      'windowActiveBuilders', window_active_builders,
      'repeatBuilders', repeat_builders,
      'builderProgressEvents', progress_events
    ),
    'funnel', jsonb_build_object(
      'joined', total_builders,
      'discoveryCompleted', discovery_completed,
      'profileReady', profile_ready,
      'pathSelected', path_selected,
      'missionStarted', mission_started,
      'journeyStarted', journey_started,
      'questCompleted', quest_completed,
      'projectStarted', project_started,
      'projectCompleted', project_completed,
      'connected', connected_builders
    )
  );
end;
$$;

revoke all on function public.get_stage14_admin_dashboard_snapshot(integer)
  from public, anon, authenticated;
grant execute on function public.get_stage14_admin_dashboard_snapshot(integer)
  to service_role;

create or replace function public.get_stage14_admin_feature_usage(
  window_days_input integer default 30
) returns table (
  feature_key text,
  views bigint,
  builders bigint,
  repeat_builders bigint
)
language sql
security definer
set search_path = public, pg_temp
as $$
  with bounded as (
    select
      event.feature_key,
      event.user_id,
      event.occurred_at::date as active_day
    from public.product_events event
    where event.event_name = 'feature_viewed'
      and event.feature_key is not null
      and event.occurred_at >= now() - make_interval(
        days => least(greatest(coalesce(window_days_input, 30), 1), 365)
      )
  ), repeaters as (
    select feature_key, user_id
    from bounded
    group by feature_key, user_id
    having count(distinct active_day) >= 2
  )
  select
    bounded.feature_key,
    count(*)::bigint as views,
    count(distinct bounded.user_id)::bigint as builders,
    count(distinct repeaters.user_id)::bigint as repeat_builders
  from bounded
  left join repeaters
    on repeaters.feature_key = bounded.feature_key
   and repeaters.user_id = bounded.user_id
  group by bounded.feature_key
  order by builders desc, views desc, bounded.feature_key;
$$;

revoke all on function public.get_stage14_admin_feature_usage(integer)
  from public, anon, authenticated;
grant execute on function public.get_stage14_admin_feature_usage(integer)
  to service_role;
