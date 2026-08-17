-- Stage 15: structured, evidence-producing Builder collaboration.
-- Collaboration is available only across accepted adult Connect relationships.
-- Cross-user reads and all writes use authenticated allow-listed RPCs.

create type public.builder_collaboration_status as enum (
  'pending',
  'accepted',
  'declined',
  'withdrawn',
  'cancelled',
  'completed'
);

create table public.builder_collaborations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.builder_projects(id) on delete restrict,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  collaborator_id uuid not null references public.profiles(id) on delete cascade,
  connection_id uuid not null references public.builder_connections(id) on delete restrict,
  objective text not null check (char_length(objective) between 20 and 800),
  role_needed text not null check (char_length(role_needed) between 3 and 120),
  expected_contribution text not null check (char_length(expected_contribution) between 20 and 800),
  owner_contribution text not null check (char_length(owner_contribution) between 20 and 800),
  commitment_note text not null check (char_length(commitment_note) between 10 and 400),
  status public.builder_collaboration_status not null default 'pending',
  invited_at timestamptz not null default now(),
  responded_at timestamptz,
  accepted_at timestamptz,
  closed_at timestamptz,
  owner_confirmed_at timestamptz,
  collaborator_confirmed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint builder_collaborations_distinct_people check (owner_id <> collaborator_id),
  constraint builder_collaborations_completion_consistency check (
    (status = 'completed'
      and owner_confirmed_at is not null
      and collaborator_confirmed_at is not null
      and completed_at is not null
      and closed_at is not null)
    or status <> 'completed'
  )
);

create unique index builder_collaborations_active_pair_idx
  on public.builder_collaborations(project_id, collaborator_id)
  where status in ('pending', 'accepted');
create index builder_collaborations_owner_status_idx
  on public.builder_collaborations(owner_id, status, updated_at desc);
create index builder_collaborations_collaborator_status_idx
  on public.builder_collaborations(collaborator_id, status, updated_at desc);
create index builder_collaborations_connection_idx
  on public.builder_collaborations(connection_id, status);

create table public.builder_collaboration_contributions (
  id uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references public.builder_collaborations(id) on delete cascade,
  contributor_id uuid not null references public.profiles(id) on delete cascade,
  contribution_summary text not null check (char_length(contribution_summary) between 20 and 1200),
  evidence_note text not null check (char_length(evidence_note) between 10 and 1200),
  evidence_link text check (
    evidence_link is null
    or (
      char_length(evidence_link) between 8 and 500
      and evidence_link ~* '^https?://'
    )
  ),
  next_step text not null check (char_length(next_step) between 10 and 600),
  created_at timestamptz not null default now()
);

create index builder_collaboration_contributions_collaboration_time_idx
  on public.builder_collaboration_contributions(collaboration_id, created_at);
create index builder_collaboration_contributions_contributor_idx
  on public.builder_collaboration_contributions(contributor_id, created_at desc);

create trigger builder_collaborations_updated_at
before update on public.builder_collaborations
for each row execute function public.set_updated_at();

alter table public.builder_collaborations enable row level security;
alter table public.builder_collaboration_contributions enable row level security;
revoke all on public.builder_collaborations, public.builder_collaboration_contributions
  from public, anon, authenticated;
grant select, insert, update on public.builder_collaborations,
  public.builder_collaboration_contributions to service_role;

create or replace function private.stage15_connection_for_pair(first_user uuid, second_user uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select connection.id
  from public.builder_connections connection
  where connection.status = 'accepted'
    and (
      (connection.requester_id = first_user and connection.recipient_id = second_user)
      or (connection.requester_id = second_user and connection.recipient_id = first_user)
    )
  limit 1;
$$;

revoke all on function private.stage15_connection_for_pair(uuid, uuid)
  from public, anon, authenticated;

create or replace function public.create_stage15_collaboration_invitation(
  project_id_input uuid,
  collaborator_id_input uuid,
  objective_input text,
  role_needed_input text,
  expected_contribution_input text,
  owner_contribution_input text,
  commitment_note_input text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  project_row public.builder_projects%rowtype;
  accepted_connection uuid;
  collaboration_id uuid;
begin
  if actor is null then
    raise exception 'COLLABORATION_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  if not private.stage11_builder_connect_eligible(actor)
     or not private.stage11_builder_connect_eligible(collaborator_id_input) then
    raise exception 'COLLABORATION_ACCOUNT_INELIGIBLE' using errcode = 'P0001';
  end if;
  if actor = collaborator_id_input then
    raise exception 'COLLABORATION_INPUT_INVALID' using errcode = 'P0001';
  end if;
  if private.stage11_builder_pair_blocked(actor, collaborator_id_input) then
    raise exception 'COLLABORATION_BLOCKED' using errcode = 'P0001';
  end if;

  select * into project_row
  from public.builder_projects
  where id = project_id_input and user_id = actor and status = 'active';
  if project_row.id is null then
    raise exception 'COLLABORATION_PROJECT_REQUIRED' using errcode = 'P0001';
  end if;

  accepted_connection := private.stage15_connection_for_pair(actor, collaborator_id_input);
  if accepted_connection is null then
    raise exception 'COLLABORATION_CONNECTION_REQUIRED' using errcode = 'P0001';
  end if;

  if coalesce(char_length(trim(objective_input)), 0) not between 20 and 800
     or coalesce(char_length(trim(role_needed_input)), 0) not between 3 and 120
     or coalesce(char_length(trim(expected_contribution_input)), 0) not between 20 and 800
     or coalesce(char_length(trim(owner_contribution_input)), 0) not between 20 and 800
     or coalesce(char_length(trim(commitment_note_input)), 0) not between 10 and 400 then
    raise exception 'COLLABORATION_INPUT_INVALID' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.builder_collaborations collaboration
    where collaboration.project_id = project_id_input
      and collaboration.collaborator_id = collaborator_id_input
      and collaboration.status in ('pending', 'accepted')
  ) then
    raise exception 'COLLABORATION_ALREADY_ACTIVE' using errcode = 'P0001';
  end if;

  insert into public.builder_collaborations (
    project_id, owner_id, collaborator_id, connection_id, objective,
    role_needed, expected_contribution, owner_contribution, commitment_note
  ) values (
    project_id_input, actor, collaborator_id_input, accepted_connection,
    trim(objective_input), trim(role_needed_input), trim(expected_contribution_input),
    trim(owner_contribution_input), trim(commitment_note_input)
  ) returning id into collaboration_id;

  return collaboration_id;
end;
$$;

create or replace function public.respond_stage15_collaboration(
  collaboration_id_input uuid,
  accept_input boolean
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target public.builder_collaborations%rowtype;
begin
  if actor is null then
    raise exception 'COLLABORATION_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  select * into target from public.builder_collaborations
  where id = collaboration_id_input and collaborator_id = actor and status = 'pending'
  for update;
  if target.id is null then
    raise exception 'COLLABORATION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if not private.stage11_builder_connect_eligible(target.owner_id)
     or not private.stage11_builder_connect_eligible(target.collaborator_id)
     or private.stage11_builder_pair_blocked(target.owner_id, target.collaborator_id)
     or private.stage15_connection_for_pair(target.owner_id, target.collaborator_id) is null then
    raise exception 'COLLABORATION_CONNECTION_REQUIRED' using errcode = 'P0001';
  end if;

  update public.builder_collaborations
  set status = case when accept_input then 'accepted'::public.builder_collaboration_status else 'declined'::public.builder_collaboration_status end,
      responded_at = now(),
      accepted_at = case when accept_input then now() else null end,
      closed_at = case when accept_input then null else now() end
  where id = target.id;
  return true;
end;
$$;

create or replace function public.close_stage15_collaboration(
  collaboration_id_input uuid,
  action_input text
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target public.builder_collaborations%rowtype;
begin
  if actor is null then
    raise exception 'COLLABORATION_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  select * into target from public.builder_collaborations
  where id = collaboration_id_input and actor in (owner_id, collaborator_id)
  for update;
  if target.id is null then
    raise exception 'COLLABORATION_NOT_FOUND' using errcode = 'P0001';
  end if;

  if action_input = 'withdraw' then
    if target.status <> 'pending' or actor <> target.owner_id then
      raise exception 'COLLABORATION_STATE_INVALID' using errcode = 'P0001';
    end if;
    update public.builder_collaborations
    set status = 'withdrawn', closed_at = now()
    where id = target.id;
  elsif action_input = 'cancel' then
    if target.status <> 'accepted' then
      raise exception 'COLLABORATION_STATE_INVALID' using errcode = 'P0001';
    end if;
    update public.builder_collaborations
    set status = 'cancelled', closed_at = now()
    where id = target.id;
  else
    raise exception 'COLLABORATION_INPUT_INVALID' using errcode = 'P0001';
  end if;
  return true;
end;
$$;

create or replace function public.add_stage15_collaboration_contribution(
  collaboration_id_input uuid,
  contribution_summary_input text,
  evidence_note_input text,
  evidence_link_input text default null,
  next_step_input text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target public.builder_collaborations%rowtype;
  contribution_id uuid;
begin
  if actor is null then
    raise exception 'COLLABORATION_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  select * into target from public.builder_collaborations
  where id = collaboration_id_input and actor in (owner_id, collaborator_id) and status = 'accepted';
  if target.id is null then
    raise exception 'COLLABORATION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if not private.stage11_builder_connect_eligible(target.owner_id)
     or not private.stage11_builder_connect_eligible(target.collaborator_id)
     or private.stage11_builder_pair_blocked(target.owner_id, target.collaborator_id)
     or private.stage15_connection_for_pair(target.owner_id, target.collaborator_id) is null then
    raise exception 'COLLABORATION_CONNECTION_REQUIRED' using errcode = 'P0001';
  end if;
  if coalesce(char_length(trim(contribution_summary_input)), 0) not between 20 and 1200
     or coalesce(char_length(trim(evidence_note_input)), 0) not between 10 and 1200
     or coalesce(char_length(trim(next_step_input)), 0) not between 10 and 600
     or (evidence_link_input is not null and (char_length(trim(evidence_link_input)) not between 8 and 500 or trim(evidence_link_input) !~* '^https?://')) then
    raise exception 'COLLABORATION_INPUT_INVALID' using errcode = 'P0001';
  end if;

  insert into public.builder_collaboration_contributions (
    collaboration_id, contributor_id, contribution_summary, evidence_note,
    evidence_link, next_step
  ) values (
    target.id, actor, trim(contribution_summary_input), trim(evidence_note_input),
    nullif(trim(coalesce(evidence_link_input, '')), ''), trim(next_step_input)
  ) returning id into contribution_id;
  return contribution_id;
end;
$$;

create or replace function public.confirm_stage15_collaboration_completion(
  collaboration_id_input uuid
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target public.builder_collaborations%rowtype;
  complete_now boolean := false;
begin
  if actor is null then
    raise exception 'COLLABORATION_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  select * into target from public.builder_collaborations
  where id = collaboration_id_input and actor in (owner_id, collaborator_id) and status = 'accepted'
  for update;
  if target.id is null then
    raise exception 'COLLABORATION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from public.builder_collaboration_contributions contribution
    where contribution.collaboration_id = target.id and contribution.contributor_id = actor
  ) then
    raise exception 'COLLABORATION_CONTRIBUTION_REQUIRED' using errcode = 'P0001';
  end if;

  update public.builder_collaborations
  set owner_confirmed_at = case when actor = owner_id then coalesce(owner_confirmed_at, now()) else owner_confirmed_at end,
      collaborator_confirmed_at = case when actor = collaborator_id then coalesce(collaborator_confirmed_at, now()) else collaborator_confirmed_at end
  where id = target.id
  returning owner_confirmed_at is not null and collaborator_confirmed_at is not null into complete_now;

  if complete_now then
    update public.builder_collaborations
    set status = 'completed', completed_at = now(), closed_at = now()
    where id = target.id;
  end if;
  return complete_now;
end;
$$;

create or replace function private.stage15_collaboration_item(
  collaboration_id_input uuid,
  viewer_id_input uuid
) returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', collaboration.id,
    'projectId', collaboration.project_id,
    'projectTitle', project.title,
    'owner', jsonb_build_object(
      'userId', owner_profile.id,
      'username', owner_profile.username::text,
      'preferredName', coalesce(owner_profile.preferred_name, owner_profile.display_name, owner_profile.username::text)
    ),
    'collaborator', jsonb_build_object(
      'userId', collaborator_profile.id,
      'username', collaborator_profile.username::text,
      'preferredName', coalesce(collaborator_profile.preferred_name, collaborator_profile.display_name, collaborator_profile.username::text)
    ),
    'objective', collaboration.objective,
    'roleNeeded', collaboration.role_needed,
    'expectedContribution', collaboration.expected_contribution,
    'ownerContribution', collaboration.owner_contribution,
    'commitmentNote', collaboration.commitment_note,
    'status', collaboration.status,
    'invitedAt', collaboration.invited_at,
    'acceptedAt', collaboration.accepted_at,
    'completedAt', collaboration.completed_at,
    'ownerConfirmed', collaboration.owner_confirmed_at is not null,
    'collaboratorConfirmed', collaboration.collaborator_confirmed_at is not null,
    'myRole', case when collaboration.owner_id = viewer_id_input then 'owner' else 'collaborator' end
  )
  from public.builder_collaborations collaboration
  join public.builder_projects project on project.id = collaboration.project_id
  join public.profiles owner_profile on owner_profile.id = collaboration.owner_id
  join public.profiles collaborator_profile on collaborator_profile.id = collaboration.collaborator_id
  where collaboration.id = collaboration_id_input
    and viewer_id_input in (collaboration.owner_id, collaboration.collaborator_id);
$$;

revoke all on function private.stage15_collaboration_item(uuid, uuid)
  from public, anon, authenticated;

create or replace function public.get_stage15_collaboration_state()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  eligible boolean;
  active_project jsonb;
  available_connections jsonb := '[]'::jsonb;
  incoming jsonb := '[]'::jsonb;
  sent jsonb := '[]'::jsonb;
  active_items jsonb := '[]'::jsonb;
  completed_items jsonb := '[]'::jsonb;
begin
  if actor is null then
    raise exception 'COLLABORATION_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  eligible := private.stage11_builder_connect_eligible(actor);

  select jsonb_build_object('id', project.id, 'title', project.title)
  into active_project
  from public.builder_projects project
  where project.user_id = actor and project.status = 'active'
  order by project.created_at desc
  limit 1;

  if eligible then
    select coalesce(jsonb_agg(jsonb_build_object(
      'userId', other_profile.id,
      'username', other_profile.username::text,
      'preferredName', coalesce(other_profile.preferred_name, other_profile.display_name, other_profile.username::text)
    ) order by coalesce(other_profile.preferred_name, other_profile.display_name, other_profile.username::text)), '[]'::jsonb)
    into available_connections
    from public.builder_connections connection
    join public.profiles other_profile
      on other_profile.id = case when connection.requester_id = actor then connection.recipient_id else connection.requester_id end
    where connection.status = 'accepted'
      and actor in (connection.requester_id, connection.recipient_id)
      and private.stage11_builder_connect_eligible(other_profile.id)
      and not private.stage11_builder_pair_blocked(actor, other_profile.id);
  end if;

  select coalesce(jsonb_agg(private.stage15_collaboration_item(collaboration.id, actor) order by collaboration.invited_at desc), '[]'::jsonb)
  into incoming
  from public.builder_collaborations collaboration
  where collaboration.collaborator_id = actor and collaboration.status = 'pending';

  select coalesce(jsonb_agg(private.stage15_collaboration_item(collaboration.id, actor) order by collaboration.invited_at desc), '[]'::jsonb)
  into sent
  from public.builder_collaborations collaboration
  where collaboration.owner_id = actor and collaboration.status = 'pending';

  select coalesce(jsonb_agg(private.stage15_collaboration_item(collaboration.id, actor) order by collaboration.accepted_at desc), '[]'::jsonb)
  into active_items
  from public.builder_collaborations collaboration
  where actor in (collaboration.owner_id, collaboration.collaborator_id)
    and collaboration.status = 'accepted';

  select coalesce(jsonb_agg(private.stage15_collaboration_item(collaboration.id, actor) order by collaboration.completed_at desc), '[]'::jsonb)
  into completed_items
  from public.builder_collaborations collaboration
  where actor in (collaboration.owner_id, collaboration.collaborator_id)
    and collaboration.status = 'completed';

  return jsonb_build_object(
    'eligible', eligible,
    'activeProject', active_project,
    'availableConnections', available_connections,
    'incoming', incoming,
    'sent', sent,
    'active', active_items,
    'completed', completed_items
  );
end;
$$;

create or replace function public.get_stage15_collaboration_detail(
  collaboration_id_input uuid
) returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  item jsonb;
  contribution_items jsonb := '[]'::jsonb;
begin
  if actor is null then
    raise exception 'COLLABORATION_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  item := private.stage15_collaboration_item(collaboration_id_input, actor);
  if item is null then
    raise exception 'COLLABORATION_NOT_FOUND' using errcode = 'P0001';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', contribution.id,
    'contributor', jsonb_build_object(
      'userId', profile.id,
      'username', profile.username::text,
      'preferredName', coalesce(profile.preferred_name, profile.display_name, profile.username::text)
    ),
    'contributionSummary', contribution.contribution_summary,
    'evidenceNote', contribution.evidence_note,
    'evidenceLink', contribution.evidence_link,
    'nextStep', contribution.next_step,
    'createdAt', contribution.created_at
  ) order by contribution.created_at), '[]'::jsonb)
  into contribution_items
  from public.builder_collaboration_contributions contribution
  join public.profiles profile on profile.id = contribution.contributor_id
  join public.builder_collaborations collaboration on collaboration.id = contribution.collaboration_id
  where contribution.collaboration_id = collaboration_id_input
    and actor in (collaboration.owner_id, collaboration.collaborator_id);

  return jsonb_build_object(
    'collaboration', item,
    'contributions', contribution_items
  );
end;
$$;

create or replace function private.stage15_cancel_after_connection_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'accepted' and new.status <> 'accepted' then
    update public.builder_collaborations
    set status = 'cancelled', closed_at = now()
    where connection_id = new.id and status in ('pending', 'accepted');
  end if;
  return new;
end;
$$;

create trigger stage15_cancel_collaboration_on_connection_change
after update of status on public.builder_connections
for each row execute function private.stage15_cancel_after_connection_change();

create or replace function private.stage15_cancel_after_block()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.builder_collaborations
  set status = 'cancelled', closed_at = now()
  where status in ('pending', 'accepted')
    and (
      (owner_id = new.blocker_id and collaborator_id = new.blocked_id)
      or (owner_id = new.blocked_id and collaborator_id = new.blocker_id)
    );
  return new;
end;
$$;

create trigger stage15_cancel_collaboration_on_block
after insert on public.builder_blocks
for each row execute function private.stage15_cancel_after_block();

revoke all on function public.create_stage15_collaboration_invitation(uuid,uuid,text,text,text,text,text) from public, anon;
revoke all on function public.respond_stage15_collaboration(uuid,boolean) from public, anon;
revoke all on function public.close_stage15_collaboration(uuid,text) from public, anon;
revoke all on function public.add_stage15_collaboration_contribution(uuid,text,text,text,text) from public, anon;
revoke all on function public.confirm_stage15_collaboration_completion(uuid) from public, anon;
revoke all on function public.get_stage15_collaboration_state() from public, anon;
revoke all on function public.get_stage15_collaboration_detail(uuid) from public, anon;

grant execute on function public.create_stage15_collaboration_invitation(uuid,uuid,text,text,text,text,text) to authenticated;
grant execute on function public.respond_stage15_collaboration(uuid,boolean) to authenticated;
grant execute on function public.close_stage15_collaboration(uuid,text) to authenticated;
grant execute on function public.add_stage15_collaboration_contribution(uuid,text,text,text,text) to authenticated;
grant execute on function public.confirm_stage15_collaboration_completion(uuid) to authenticated;
grant execute on function public.get_stage15_collaboration_state() to authenticated;
grant execute on function public.get_stage15_collaboration_detail(uuid) to authenticated;

alter table public.product_events
  drop constraint if exists product_events_event_name_check;
alter table public.product_events
  add constraint product_events_event_name_check check (event_name in (
    'possible_paths_generated',
    'possible_paths_viewed',
    'path_selected',
    'path_changed',
    'pathway_started',
    'first_value_challenge_started',
    'first_value_challenge_completed',
    'feature_viewed',
    'collaboration_invited',
    'collaboration_accepted',
    'collaboration_contribution_added',
    'collaboration_completed'
  ));
