-- Stage 29: extend evidence-producing collaboration to protected school Builder pairs.
-- Stage 11 adult Connect/contact eligibility remains unchanged.

create or replace function private.stage29_collaboration_actor_eligible(user_id_input uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.stage11_builder_connect_eligible(user_id_input)
    or exists (
      select 1
      from private.stage29_live_scope(user_id_input) network_scope
      where network_scope.scope = 'school'
    );
$$;

create or replace function private.stage29_collaboration_pair_allowed(
  first_user uuid,
  second_user uuid
) returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  first_scope text;
  second_scope text;
begin
  if first_user is null or second_user is null or first_user = second_user then
    return false;
  end if;
  if private.stage11_builder_pair_blocked(first_user, second_user) then
    return false;
  end if;
  if private.stage15_connection_for_pair(first_user, second_user) is null then
    return false;
  end if;

  if private.stage11_builder_connect_eligible(first_user)
     and private.stage11_builder_connect_eligible(second_user) then
    return true;
  end if;

  select scope into first_scope from private.stage29_live_scope(first_user);
  select scope into second_scope from private.stage29_live_scope(second_user);

  return first_scope = 'school'
    and second_scope = 'school'
    and private.stage29_pair_visible(first_user, second_user);
end;
$$;

revoke all on function private.stage29_collaboration_actor_eligible(uuid),
  private.stage29_collaboration_pair_allowed(uuid, uuid)
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
  if not private.stage29_collaboration_actor_eligible(actor)
     or not private.stage29_collaboration_actor_eligible(collaborator_id_input) then
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
  if not private.stage29_collaboration_pair_allowed(actor, collaborator_id_input) then
    raise exception 'COLLABORATION_NETWORK_NOT_ALLOWED' using errcode = 'P0001';
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
  if not private.stage29_collaboration_pair_allowed(target.owner_id, target.collaborator_id) then
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
  where id = collaboration_id_input
    and actor in (owner_id, collaborator_id)
    and status = 'accepted';
  if target.id is null then
    raise exception 'COLLABORATION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if not private.stage29_collaboration_pair_allowed(target.owner_id, target.collaborator_id) then
    raise exception 'COLLABORATION_CONNECTION_REQUIRED' using errcode = 'P0001';
  end if;
  if coalesce(char_length(trim(contribution_summary_input)), 0) not between 20 and 1200
     or coalesce(char_length(trim(evidence_note_input)), 0) not between 10 and 1200
     or coalesce(char_length(trim(next_step_input)), 0) not between 10 and 600
     or (evidence_link_input is not null and (
       char_length(trim(evidence_link_input)) not between 8 and 500
       or trim(evidence_link_input) !~* '^https?://'
     )) then
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
  eligible := private.stage29_collaboration_actor_eligible(actor);
  if not eligible then
    return jsonb_build_object(
      'eligible', false,
      'activeProject', null,
      'availableConnections', '[]'::jsonb,
      'incoming', '[]'::jsonb,
      'sent', '[]'::jsonb,
      'active', '[]'::jsonb,
      'completed', '[]'::jsonb
    );
  end if;

  select jsonb_build_object('id', project.id, 'title', project.title)
  into active_project
  from public.builder_projects project
  where project.user_id = actor and project.status = 'active'
  order by project.created_at desc
  limit 1;

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
    and private.stage29_collaboration_pair_allowed(actor, other_profile.id);

  select coalesce(jsonb_agg(
    private.stage15_collaboration_item(collaboration.id, actor)
    order by collaboration.invited_at desc
  ), '[]'::jsonb)
  into incoming
  from public.builder_collaborations collaboration
  where collaboration.collaborator_id = actor
    and collaboration.status = 'pending'
    and private.stage29_collaboration_pair_allowed(actor, collaboration.owner_id);

  select coalesce(jsonb_agg(
    private.stage15_collaboration_item(collaboration.id, actor)
    order by collaboration.invited_at desc
  ), '[]'::jsonb)
  into sent
  from public.builder_collaborations collaboration
  where collaboration.owner_id = actor
    and collaboration.status = 'pending'
    and private.stage29_collaboration_pair_allowed(actor, collaboration.collaborator_id);

  select coalesce(jsonb_agg(
    private.stage15_collaboration_item(collaboration.id, actor)
    order by collaboration.accepted_at desc
  ), '[]'::jsonb)
  into active_items
  from public.builder_collaborations collaboration
  where actor in (collaboration.owner_id, collaboration.collaborator_id)
    and collaboration.status = 'accepted'
    and private.stage29_collaboration_pair_allowed(collaboration.owner_id, collaboration.collaborator_id);

  select coalesce(jsonb_agg(
    private.stage15_collaboration_item(collaboration.id, actor)
    order by collaboration.completed_at desc
  ), '[]'::jsonb)
  into completed_items
  from public.builder_collaborations collaboration
  where actor in (collaboration.owner_id, collaboration.collaborator_id)
    and collaboration.status = 'completed';

  return jsonb_build_object(
    'eligible', true,
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
  target public.builder_collaborations%rowtype;
  item jsonb;
  contribution_items jsonb := '[]'::jsonb;
begin
  if actor is null then
    raise exception 'COLLABORATION_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  if not private.stage29_collaboration_actor_eligible(actor) then
    raise exception 'COLLABORATION_ACCOUNT_INELIGIBLE' using errcode = 'P0001';
  end if;

  select * into target
  from public.builder_collaborations
  where id = collaboration_id_input
    and actor in (owner_id, collaborator_id);
  if target.id is null then
    raise exception 'COLLABORATION_NOT_FOUND' using errcode = 'P0001';
  end if;

  if target.status in ('pending', 'accepted')
     and not private.stage29_collaboration_pair_allowed(target.owner_id, target.collaborator_id) then
    raise exception 'COLLABORATION_CONNECTION_REQUIRED' using errcode = 'P0001';
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
  where contribution.collaboration_id = collaboration_id_input;

  return jsonb_build_object(
    'collaboration', item,
    'contributions', contribution_items
  );
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
  where id = collaboration_id_input
    and actor in (owner_id, collaborator_id)
    and status = 'accepted'
  for update;
  if target.id is null then
    raise exception 'COLLABORATION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if not private.stage29_collaboration_pair_allowed(target.owner_id, target.collaborator_id) then
    raise exception 'COLLABORATION_CONNECTION_REQUIRED' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from public.builder_collaboration_contributions contribution
    where contribution.collaboration_id = target.id
      and contribution.contributor_id = actor
  ) then
    raise exception 'COLLABORATION_CONTRIBUTION_REQUIRED' using errcode = 'P0001';
  end if;

  update public.builder_collaborations
  set owner_confirmed_at = case
        when actor = owner_id then coalesce(owner_confirmed_at, now())
        else owner_confirmed_at
      end,
      collaborator_confirmed_at = case
        when actor = collaborator_id then coalesce(collaborator_confirmed_at, now())
        else collaborator_confirmed_at
      end
  where id = target.id
  returning owner_confirmed_at is not null
    and collaborator_confirmed_at is not null
  into complete_now;

  if complete_now then
    update public.builder_collaborations
    set status = 'completed', completed_at = now(), closed_at = now()
    where id = target.id;
  end if;
  return complete_now;
end;
$$;

revoke all on function public.create_stage15_collaboration_invitation(uuid, uuid, text, text, text, text, text),
  public.respond_stage15_collaboration(uuid, boolean),
  public.add_stage15_collaboration_contribution(uuid, text, text, text, text),
  public.get_stage15_collaboration_state(),
  public.get_stage15_collaboration_detail(uuid),
  public.confirm_stage15_collaboration_completion(uuid)
from public, anon;

grant execute on function public.create_stage15_collaboration_invitation(uuid, uuid, text, text, text, text, text),
  public.respond_stage15_collaboration(uuid, boolean),
  public.add_stage15_collaboration_contribution(uuid, text, text, text, text),
  public.get_stage15_collaboration_state(),
  public.get_stage15_collaboration_detail(uuid),
  public.confirm_stage15_collaboration_completion(uuid)
to authenticated;
