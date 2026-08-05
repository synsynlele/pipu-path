-- Stage 8: evidence-linked private Builder Projects and truthful execution.
create type public.builder_project_status as enum (
  'active',
  'completed',
  'archived'
);

create type public.builder_project_milestone_status as enum (
  'locked',
  'available',
  'active',
  'completed'
);

create table public.builder_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_quest_id uuid not null unique references public.user_quests(id) on delete restrict,
  journey_id uuid not null references public.user_journeys(id) on delete restrict,
  mission_id uuid not null references public.user_missions(id) on delete restrict,
  title text not null check (char_length(title) between 3 and 100),
  problem_statement text not null check (char_length(problem_statement) between 20 and 800),
  people_served text not null check (char_length(people_served) between 10 and 400),
  desired_outcome text not null check (char_length(desired_outcome) between 20 and 800),
  smallest_useful_version text not null check (char_length(smallest_useful_version) between 20 and 800),
  success_signal text not null check (char_length(success_signal) between 10 and 500),
  target_date date not null,
  status public.builder_project_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.builder_project_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.builder_projects(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 100),
  intended_outcome text not null check (char_length(intended_outcome) between 10 and 500),
  completion_signal text not null check (char_length(completion_signal) between 10 and 400),
  sequence_order smallint not null check (sequence_order between 1 and 3),
  status public.builder_project_milestone_status not null default 'locked',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  unique (project_id, sequence_order)
);

create table public.builder_project_updates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.builder_projects(id) on delete cascade,
  milestone_id uuid not null references public.builder_project_milestones(id) on delete cascade,
  progress_note text not null check (char_length(progress_note) between 20 and 2000),
  proof_text text not null check (char_length(proof_text) between 20 and 2000),
  proof_link text check (
    proof_link is null
    or (
      char_length(proof_link) between 8 and 500
      and proof_link ~* '^https?://'
    )
  ),
  next_step text not null check (char_length(next_step) between 10 and 1000),
  marks_milestone_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index builder_projects_one_active_user_idx
  on public.builder_projects(user_id)
  where status = 'active';

create unique index builder_project_updates_one_completion_idx
  on public.builder_project_updates(milestone_id)
  where marks_milestone_complete;

create index builder_projects_user_created_idx
  on public.builder_projects(user_id, created_at desc);
create index builder_projects_journey_idx
  on public.builder_projects(journey_id);
create index builder_projects_mission_idx
  on public.builder_projects(mission_id);
create index builder_project_milestones_user_idx
  on public.builder_project_milestones(user_id);
create index builder_project_milestones_project_order_idx
  on public.builder_project_milestones(project_id, sequence_order);
create index builder_project_updates_user_idx
  on public.builder_project_updates(user_id);
create index builder_project_updates_project_created_idx
  on public.builder_project_updates(project_id, created_at desc);
create index builder_project_updates_milestone_created_idx
  on public.builder_project_updates(milestone_id, created_at desc);

alter table public.builder_projects enable row level security;
alter table public.builder_project_milestones enable row level security;
alter table public.builder_project_updates enable row level security;

revoke all on public.builder_projects,
  public.builder_project_milestones,
  public.builder_project_updates
from public, anon, authenticated;

grant select on public.builder_projects,
  public.builder_project_milestones,
  public.builder_project_updates
to authenticated;

create policy builder_projects_own_select
on public.builder_projects for select to authenticated
using ((select auth.uid()) = user_id);

create policy builder_project_milestones_own_select
on public.builder_project_milestones for select to authenticated
using ((select auth.uid()) = user_id);

create policy builder_project_updates_own_select
on public.builder_project_updates for select to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.create_stage8_builder_project(
  source_quest_id_input uuid,
  title_input text,
  problem_statement_input text,
  people_served_input text,
  desired_outcome_input text,
  smallest_useful_version_input text,
  success_signal_input text,
  target_date_input date,
  milestones_input jsonb
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor uuid := auth.uid();
  source_quest public.user_quests%rowtype;
  source_journey public.user_journeys%rowtype;
  milestone_item jsonb;
  expected_order integer := 1;
  project_id uuid;
begin
  if actor is null then
    raise exception 'PROJECT_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select quest.* into source_quest
  from public.user_quests quest
  where quest.id = source_quest_id_input
    and quest.user_id = actor
    and quest.status = 'completed'
  for update;

  if source_quest.id is null then
    raise exception 'PROJECT_COMPLETED_QUEST_REQUIRED' using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.quest_evidence
    where quest_id = source_quest.id
      and user_id = actor
  ) or not exists (
    select 1
    from public.quest_reflections
    where quest_id = source_quest.id
      and user_id = actor
  ) then
    raise exception 'PROJECT_PROOF_REQUIRED' using errcode = 'P0001';
  end if;

  select * into source_journey
  from public.user_journeys
  where id = source_quest.journey_id
    and user_id = actor;

  if source_journey.id is null then
    raise exception 'PROJECT_JOURNEY_REQUIRED' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.builder_projects
    where user_id = actor
      and status = 'active'
  ) then
    raise exception 'PROJECT_ALREADY_ACTIVE' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.builder_projects
    where source_quest_id = source_quest.id
  ) then
    raise exception 'PROJECT_SOURCE_ALREADY_USED' using errcode = 'P0001';
  end if;

  if target_date_input < current_date
    or target_date_input > current_date + 365 then
    raise exception 'PROJECT_TARGET_DATE_INVALID' using errcode = 'P0001';
  end if;

  if jsonb_typeof(milestones_input) <> 'array'
    or jsonb_array_length(milestones_input) <> 3 then
    raise exception 'PROJECT_MILESTONES_INVALID' using errcode = 'P0001';
  end if;

  insert into public.builder_projects (
    user_id,
    source_quest_id,
    journey_id,
    mission_id,
    title,
    problem_statement,
    people_served,
    desired_outcome,
    smallest_useful_version,
    success_signal,
    target_date
  )
  values (
    actor,
    source_quest.id,
    source_quest.journey_id,
    source_journey.mission_id,
    trim(title_input),
    trim(problem_statement_input),
    trim(people_served_input),
    trim(desired_outcome_input),
    trim(smallest_useful_version_input),
    trim(success_signal_input),
    target_date_input
  )
  returning id into project_id;

  for milestone_item in
    select value from jsonb_array_elements(milestones_input)
  loop
    if (milestone_item ->> 'sequence_order')::integer <> expected_order
      or char_length(trim(coalesce(milestone_item ->> 'title', ''))) not between 3 and 100
      or char_length(trim(coalesce(milestone_item ->> 'intended_outcome', ''))) not between 10 and 500
      or char_length(trim(coalesce(milestone_item ->> 'completion_signal', ''))) not between 10 and 400 then
      raise exception 'PROJECT_MILESTONES_INVALID' using errcode = 'P0001';
    end if;

    insert into public.builder_project_milestones (
      user_id,
      project_id,
      title,
      intended_outcome,
      completion_signal,
      sequence_order,
      status
    )
    values (
      actor,
      project_id,
      trim(milestone_item ->> 'title'),
      trim(milestone_item ->> 'intended_outcome'),
      trim(milestone_item ->> 'completion_signal'),
      expected_order,
      case
        when expected_order = 1 then 'available'::public.builder_project_milestone_status
        else 'locked'::public.builder_project_milestone_status
      end
    );

    expected_order := expected_order + 1;
  end loop;

  insert into public.identity_audit_events (
    user_id,
    operation,
    result,
    metadata
  )
  values (
    actor,
    'builder_project_created',
    'success',
    jsonb_build_object(
      'project_id', project_id,
      'source_quest_id', source_quest.id
    )
  );

  return project_id;
exception
  when check_violation then
    raise exception 'PROJECT_INPUT_INVALID' using errcode = 'P0001';
end
$$;

create or replace function public.add_stage8_builder_project_update(
  project_id_input uuid,
  milestone_id_input uuid,
  progress_note_input text,
  proof_text_input text,
  proof_link_input text default null,
  next_step_input text default 'Review the result and choose the next practical action.',
  marks_milestone_complete_input boolean default false
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor uuid := auth.uid();
  project_row public.builder_projects%rowtype;
  milestone_row public.builder_project_milestones%rowtype;
  next_milestone_id uuid;
  clean_link text := nullif(trim(coalesce(proof_link_input, '')), '');
  update_id uuid;
begin
  if actor is null then
    raise exception 'PROJECT_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select * into project_row
  from public.builder_projects
  where id = project_id_input
    and user_id = actor
    and status = 'active'
  for update;

  if project_row.id is null then
    raise exception 'PROJECT_ACTIVE_REQUIRED' using errcode = 'P0001';
  end if;

  select * into milestone_row
  from public.builder_project_milestones
  where id = milestone_id_input
    and project_id = project_row.id
    and user_id = actor
    and status in ('available', 'active')
  for update;

  if milestone_row.id is null then
    raise exception 'PROJECT_MILESTONE_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.builder_project_milestones
    where project_id = project_row.id
      and sequence_order < milestone_row.sequence_order
      and status <> 'completed'
  ) then
    raise exception 'PROJECT_MILESTONE_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if char_length(trim(progress_note_input)) not between 20 and 2000
    or char_length(trim(proof_text_input)) not between 20 and 2000
    or char_length(trim(next_step_input)) not between 10 and 1000 then
    raise exception 'PROJECT_UPDATE_INVALID' using errcode = 'P0001';
  end if;

  if clean_link is not null
    and (
      char_length(clean_link) not between 8 and 500
      or clean_link !~* '^https?://'
    ) then
    raise exception 'PROJECT_UPDATE_INVALID' using errcode = 'P0001';
  end if;

  insert into public.builder_project_updates (
    user_id,
    project_id,
    milestone_id,
    progress_note,
    proof_text,
    proof_link,
    next_step,
    marks_milestone_complete
  )
  values (
    actor,
    project_row.id,
    milestone_row.id,
    trim(progress_note_input),
    trim(proof_text_input),
    clean_link,
    trim(next_step_input),
    marks_milestone_complete_input
  )
  returning id into update_id;

  if marks_milestone_complete_input then
    update public.builder_project_milestones
    set
      status = 'completed',
      started_at = coalesce(started_at, now()),
      completed_at = now(),
      updated_at = now()
    where id = milestone_row.id;

    select id into next_milestone_id
    from public.builder_project_milestones
    where project_id = project_row.id
      and sequence_order = milestone_row.sequence_order + 1
      and status = 'locked'
    for update;

    if next_milestone_id is not null then
      update public.builder_project_milestones
      set
        status = 'available',
        updated_at = now()
      where id = next_milestone_id;
    else
      update public.builder_projects
      set
        status = 'completed',
        completed_at = now(),
        updated_at = now()
      where id = project_row.id;
    end if;
  else
    update public.builder_project_milestones
    set
      status = 'active',
      started_at = coalesce(started_at, now()),
      updated_at = now()
    where id = milestone_row.id;
  end if;

  update public.builder_projects
  set updated_at = now()
  where id = project_row.id;

  insert into public.identity_audit_events (
    user_id,
    operation,
    result,
    metadata
  )
  values (
    actor,
    case
      when marks_milestone_complete_input then 'builder_project_milestone_completed'
      else 'builder_project_progress_recorded'
    end,
    'success',
    jsonb_build_object(
      'project_id', project_row.id,
      'milestone_id', milestone_row.id,
      'update_id', update_id
    )
  );

  return update_id;
exception
  when unique_violation then
    raise exception 'PROJECT_MILESTONE_ALREADY_COMPLETED' using errcode = 'P0001';
  when check_violation then
    raise exception 'PROJECT_UPDATE_INVALID' using errcode = 'P0001';
end
$$;

revoke all on function public.create_stage8_builder_project(
  uuid, text, text, text, text, text, text, date, jsonb
) from public, anon;
grant execute on function public.create_stage8_builder_project(
  uuid, text, text, text, text, text, text, date, jsonb
) to authenticated;

revoke all on function public.add_stage8_builder_project_update(
  uuid, uuid, text, text, text, text, boolean
) from public, anon;
grant execute on function public.add_stage8_builder_project_update(
  uuid, uuid, text, text, text, text, boolean
) to authenticated;
