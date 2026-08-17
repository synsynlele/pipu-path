-- Stage 15 safeguarding hardening.
-- Ineligible actors receive no cross-user collaboration state. Completion also
-- re-checks the live Connect relationship before writing mutual proof.

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
    and private.stage11_builder_connect_eligible(other_profile.id)
    and not private.stage11_builder_pair_blocked(actor, other_profile.id);

  select coalesce(jsonb_agg(private.stage15_collaboration_item(collaboration.id, actor) order by collaboration.invited_at desc), '[]'::jsonb)
  into incoming
  from public.builder_collaborations collaboration
  where collaboration.collaborator_id = actor and collaboration.status = 'pending'
    and private.stage11_builder_connect_eligible(collaboration.owner_id)
    and not private.stage11_builder_pair_blocked(actor, collaboration.owner_id)
    and private.stage15_connection_for_pair(actor, collaboration.owner_id) is not null;

  select coalesce(jsonb_agg(private.stage15_collaboration_item(collaboration.id, actor) order by collaboration.invited_at desc), '[]'::jsonb)
  into sent
  from public.builder_collaborations collaboration
  where collaboration.owner_id = actor and collaboration.status = 'pending'
    and private.stage11_builder_connect_eligible(collaboration.collaborator_id)
    and not private.stage11_builder_pair_blocked(actor, collaboration.collaborator_id)
    and private.stage15_connection_for_pair(actor, collaboration.collaborator_id) is not null;

  select coalesce(jsonb_agg(private.stage15_collaboration_item(collaboration.id, actor) order by collaboration.accepted_at desc), '[]'::jsonb)
  into active_items
  from public.builder_collaborations collaboration
  where actor in (collaboration.owner_id, collaboration.collaborator_id)
    and collaboration.status = 'accepted'
    and private.stage11_builder_connect_eligible(
      case when collaboration.owner_id = actor then collaboration.collaborator_id else collaboration.owner_id end
    )
    and not private.stage11_builder_pair_blocked(collaboration.owner_id, collaboration.collaborator_id)
    and private.stage15_connection_for_pair(collaboration.owner_id, collaboration.collaborator_id) is not null;

  select coalesce(jsonb_agg(private.stage15_collaboration_item(collaboration.id, actor) order by collaboration.completed_at desc), '[]'::jsonb)
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
  if not private.stage11_builder_connect_eligible(actor) then
    raise exception 'COLLABORATION_ACCOUNT_INELIGIBLE' using errcode = 'P0001';
  end if;

  select * into target
  from public.builder_collaborations
  where id = collaboration_id_input
    and actor in (owner_id, collaborator_id);
  if target.id is null then
    raise exception 'COLLABORATION_NOT_FOUND' using errcode = 'P0001';
  end if;

  if target.status in ('pending', 'accepted') and (
    not private.stage11_builder_connect_eligible(
      case when target.owner_id = actor then target.collaborator_id else target.owner_id end
    )
    or private.stage11_builder_pair_blocked(target.owner_id, target.collaborator_id)
    or private.stage15_connection_for_pair(target.owner_id, target.collaborator_id) is null
  ) then
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
  if not private.stage11_builder_connect_eligible(target.owner_id)
     or not private.stage11_builder_connect_eligible(target.collaborator_id)
     or private.stage11_builder_pair_blocked(target.owner_id, target.collaborator_id)
     or private.stage15_connection_for_pair(target.owner_id, target.collaborator_id) is null then
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

revoke all on function public.get_stage15_collaboration_state() from public, anon;
revoke all on function public.get_stage15_collaboration_detail(uuid) from public, anon;
revoke all on function public.confirm_stage15_collaboration_completion(uuid) from public, anon;
grant execute on function public.get_stage15_collaboration_state() to authenticated;
grant execute on function public.get_stage15_collaboration_detail(uuid) to authenticated;
grant execute on function public.confirm_stage15_collaboration_completion(uuid) to authenticated;
