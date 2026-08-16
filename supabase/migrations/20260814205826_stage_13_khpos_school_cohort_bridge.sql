-- Stage 13: explicit school development cohorts for privacy-safe KHP-OS aggregates.
create extension if not exists pgcrypto with schema extensions;

create table public.khpos_school_cohorts (
  id uuid primary key default gen_random_uuid(),
  khpos_organisation_id uuid not null unique,
  organisation_name text not null check (char_length(organisation_name) between 2 and 160),
  join_token_hash text not null,
  contract_version text not null default '1.0' check (contract_version = '1.0'),
  reporting_minimum smallint not null default 5 check (reporting_minimum >= 5),
  status text not null default 'active' check (status in ('active','revoked')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.khpos_school_cohort_memberships (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.khpos_school_cohorts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active','withdrawn')),
  consent_policy_version text not null default 'khpos-cohort-aggregate-v1' check (consent_policy_version = 'khpos-cohort-aggregate-v1'),
  joined_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cohort_id,user_id),
  check ((status='active' and withdrawn_at is null) or (status='withdrawn' and withdrawn_at is not null))
);

create unique index khpos_school_cohort_one_active_user_idx
  on public.khpos_school_cohort_memberships(user_id) where status='active';
create index khpos_school_cohort_members_idx
  on public.khpos_school_cohort_memberships(cohort_id,status);

create trigger khpos_school_cohorts_updated_at
before update on public.khpos_school_cohorts
for each row execute function public.set_updated_at();
create trigger khpos_school_cohort_memberships_updated_at
before update on public.khpos_school_cohort_memberships
for each row execute function public.set_updated_at();

alter table public.khpos_school_cohorts enable row level security;
alter table public.khpos_school_cohort_memberships enable row level security;
revoke all on public.khpos_school_cohorts, public.khpos_school_cohort_memberships from public, anon, authenticated;
grant select,insert,update,delete on public.khpos_school_cohorts, public.khpos_school_cohort_memberships to service_role;

create or replace function public.join_stage13_khpos_school_cohort(join_token_input text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target public.khpos_school_cohorts%rowtype;
  existing public.khpos_school_cohort_memberships%rowtype;
  profile_row public.profiles%rowtype;
begin
  if actor is null then raise exception 'KHPOS_COHORT_AUTH_REQUIRED' using errcode='P0001'; end if;
  if length(trim(coalesce(join_token_input,''))) < 32 then raise exception 'KHPOS_COHORT_INVITE_INVALID' using errcode='P0001'; end if;

  select * into profile_row from public.profiles where id=actor;
  if profile_row.id is null or profile_row.account_status <> 'active' or profile_row.safeguarding_review_required then
    raise exception 'KHPOS_COHORT_ACCOUNT_INELIGIBLE' using errcode='P0001';
  end if;

  select * into target
  from public.khpos_school_cohorts
  where status='active'
    and join_token_hash=encode(extensions.digest(trim(join_token_input),'sha256'),'hex')
  limit 1;
  if target.id is null then raise exception 'KHPOS_COHORT_INVITE_INVALID' using errcode='P0001'; end if;

  select * into existing from public.khpos_school_cohort_memberships where user_id=actor and status='active' limit 1;
  if existing.id is not null and existing.cohort_id <> target.id then
    raise exception 'KHPOS_COHORT_ALREADY_LINKED' using errcode='P0001';
  end if;

  insert into public.khpos_school_cohort_memberships(cohort_id,user_id,status,consent_policy_version,joined_at,withdrawn_at)
  values(target.id,actor,'active','khpos-cohort-aggregate-v1',now(),null)
  on conflict(cohort_id,user_id) do update set status='active',consent_policy_version='khpos-cohort-aggregate-v1',joined_at=now(),withdrawn_at=null,updated_at=now();

  insert into public.identity_audit_events(user_id,operation,result,metadata)
  values(actor,'khpos_school_cohort_joined','success',jsonb_build_object('cohort_id',target.id,'consent_policy_version','khpos-cohort-aggregate-v1'));

  return jsonb_build_object('cohortId',target.id,'organisationName',target.organisation_name,'status','active');
end;
$$;

create or replace function public.withdraw_stage13_khpos_school_cohort()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); changed boolean;
begin
  if actor is null then raise exception 'KHPOS_COHORT_AUTH_REQUIRED' using errcode='P0001'; end if;
  update public.khpos_school_cohort_memberships
  set status='withdrawn',withdrawn_at=now(),updated_at=now()
  where user_id=actor and status='active';
  changed := found;
  if changed then
    insert into public.identity_audit_events(user_id,operation,result,metadata)
    values(actor,'khpos_school_cohort_withdrawn','success',jsonb_build_object('consent_policy_version','khpos-cohort-aggregate-v1'));
  end if;
  return changed;
end;
$$;

create or replace function public.get_stage13_khpos_school_cohort_membership()
returns table(cohort_id uuid, organisation_name text, joined_at timestamptz)
language sql
security definer
set search_path = ''
as $$
  select c.id,c.organisation_name,m.joined_at
  from public.khpos_school_cohort_memberships m
  join public.khpos_school_cohorts c on c.id=m.cohort_id
  where m.user_id=auth.uid() and m.status='active' and c.status='active'
  limit 1;
$$;

create or replace function public.get_stage13_khpos_cohort_aggregate_server(
  cohort_id_input uuid,
  window_start_input timestamptz,
  window_end_input timestamptz
)
returns table(
  reporting_eligible boolean,
  cohort_member_count integer,
  active_profile_count integer,
  path_selected_count integer,
  quest_participant_count integer,
  evidence_backed_quest_participant_count integer,
  project_participant_count integer,
  project_completion_participant_count integer,
  continuation_eligible_count integer,
  continuing_cycle_participant_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  member_count integer;
  minimum_count integer;
begin
  if window_end_input <= window_start_input or window_end_input-window_start_input > interval '180 days' then
    raise exception 'KHPOS_COHORT_WINDOW_INVALID' using errcode='P0001';
  end if;
  select reporting_minimum into minimum_count from public.khpos_school_cohorts where id=cohort_id_input and status='active';
  if minimum_count is null then raise exception 'KHPOS_COHORT_NOT_FOUND' using errcode='P0001'; end if;
  select count(*)::integer into member_count from public.khpos_school_cohort_memberships where cohort_id=cohort_id_input and status='active';

  if member_count < minimum_count then
    return query select false,0,0,0,0,0,0,0,0,0;
    return;
  end if;

  return query
  with members as (
    select m.user_id from public.khpos_school_cohort_memberships m where m.cohort_id=cohort_id_input and m.status='active'
  ),
  active_profiles as (
    select distinct hp.user_id
    from public.human_potential_profile_versions hp join members m on m.user_id=hp.user_id
    where hp.status='active'
  ),
  selected_paths as (
    select distinct e.user_id
    from public.economic_pathway_recommendations e
    join public.human_potential_profile_versions hp on hp.id=e.human_potential_profile_id and hp.user_id=e.user_id and hp.status='active'
    join members m on m.user_id=e.user_id
    where e.selected_path_key is not null and e.selected_at is not null
  ),
  quest_participants as (
    select distinct q.user_id
    from public.user_quests q join members m on m.user_id=q.user_id
    where q.status in ('active','evidence_submitted','completed')
      and coalesce(q.started_at,q.completed_at,q.created_at) >= window_start_input
      and coalesce(q.started_at,q.completed_at,q.created_at) < window_end_input
  ),
  evidence_quest_participants as (
    select distinct q.user_id
    from public.user_quests q
    join members m on m.user_id=q.user_id
    where q.status='completed' and q.completed_at >= window_start_input and q.completed_at < window_end_input
      and exists(select 1 from public.quest_evidence e where e.quest_id=q.id and e.user_id=q.user_id)
      and exists(select 1 from public.quest_reflections r where r.quest_id=q.id and r.user_id=q.user_id)
  ),
  project_participants as (
    select distinct p.user_id
    from public.builder_projects p join members m on m.user_id=p.user_id
    where (p.created_at >= window_start_input and p.created_at < window_end_input)
       or (p.completed_at >= window_start_input and p.completed_at < window_end_input)
  ),
  project_completers as (
    select distinct p.user_id
    from public.builder_projects p join members m on m.user_id=p.user_id
    where p.status='completed' and p.completed_at >= window_start_input and p.completed_at < window_end_input
  ),
  continuation_eligible as (
    select distinct p.user_id
    from public.builder_projects p join members m on m.user_id=p.user_id
    where p.status='completed'
  ),
  continuing_cycle as (
    select distinct j.user_id
    from public.user_journeys j
    join continuation_eligible e on e.user_id=j.user_id
    where j.cycle_number > 1
  )
  select true,
    member_count,
    (select count(*)::integer from active_profiles),
    (select count(*)::integer from selected_paths),
    (select count(*)::integer from quest_participants),
    (select count(*)::integer from evidence_quest_participants),
    (select count(*)::integer from project_participants),
    (select count(*)::integer from project_completers),
    (select count(*)::integer from continuation_eligible),
    (select count(*)::integer from continuing_cycle);
end;
$$;

revoke all on function public.join_stage13_khpos_school_cohort(text) from public,anon;
revoke all on function public.withdraw_stage13_khpos_school_cohort() from public,anon;
revoke all on function public.get_stage13_khpos_school_cohort_membership() from public,anon;
grant execute on function public.join_stage13_khpos_school_cohort(text) to authenticated;
grant execute on function public.withdraw_stage13_khpos_school_cohort() to authenticated;
grant execute on function public.get_stage13_khpos_school_cohort_membership() to authenticated;

revoke all on function public.get_stage13_khpos_cohort_aggregate_server(uuid,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.get_stage13_khpos_cohort_aggregate_server(uuid,timestamptz,timestamptz) to service_role;

comment on table public.khpos_school_cohorts is 'Explicit PipuPath school-development cohorts linked to KHP-OS. Learners join voluntarily; no school membership is inferred.';
comment on table public.khpos_school_cohort_memberships is 'Learner consent to contribute only privacy-thresholded cohort aggregates to KHP-OS.';
comment on function public.get_stage13_khpos_cohort_aggregate_server(uuid,timestamptz,timestamptz) is 'Service-role-only privacy boundary: returns one aggregate row and suppresses every detailed count when active cohort membership is below five.';
