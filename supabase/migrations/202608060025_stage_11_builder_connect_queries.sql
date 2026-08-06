-- Stage 11 Builder Connect allow-listed query RPCs.
create or replace function public.get_stage11_connect_state()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  eligible boolean;
  result jsonb;
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode='P0001'; end if;
  eligible := private.stage11_builder_connect_eligible(actor);

  select jsonb_build_object(
    'eligible', eligible,
    'profile', (
      select jsonb_build_object(
        'interests', connect.interests,
        'capabilities', connect.capabilities,
        'canHelpWith', connect.can_help_with,
        'needsHelpWith', connect.needs_help_with,
        'contactEmail', connect.contact_email,
        'contactWhatsapp', connect.contact_whatsapp,
        'visibility', connect.visibility
      ) from public.builder_connect_profiles connect where connect.user_id=actor
    ),
    'discover', case when eligible then coalesce((
      select jsonb_agg(item order by item->>'preferredName')
      from (
        select jsonb_build_object(
          'userId', profile.id,
          'username', profile.username::text,
          'preferredName', profile.preferred_name,
          'missionTitle', mission.title,
          'missionStatement', mission.mission_statement,
          'interests', connect.interests,
          'capabilities', connect.capabilities,
          'canHelpWith', connect.can_help_with,
          'needsHelpWith', connect.needs_help_with,
          'relationship', coalesce(connection.status::text, 'none')
        ) item
        from public.builder_connect_profiles connect
        join public.profiles profile on profile.id=connect.user_id
        left join lateral (
          select title, mission_statement from public.user_missions
          where user_id=connect.user_id and status='active'
          order by created_at desc limit 1
        ) mission on true
        left join public.builder_connections connection
          on least(connection.requester_id,connection.recipient_id)=least(actor,connect.user_id)
         and greatest(connection.requester_id,connection.recipient_id)=greatest(actor,connect.user_id)
        where connect.visibility='discoverable'
          and connect.user_id<>actor
          and private.stage11_builder_connect_eligible(connect.user_id)
          and not private.stage11_builder_pair_blocked(actor,connect.user_id)
        limit 50
      ) rows
    ), '[]'::jsonb) else '[]'::jsonb end,
    'incoming', coalesce((
      select jsonb_agg(jsonb_build_object(
        'connectionId', connection.id,
        'userId', profile.id,
        'username', profile.username::text,
        'preferredName', profile.preferred_name,
        'status', connection.status,
        'updatedAt', connection.updated_at
      ) order by connection.updated_at desc)
      from public.builder_connections connection
      join public.profiles profile on profile.id=connection.requester_id
      where connection.recipient_id=actor and connection.status='pending'
    ), '[]'::jsonb),
    'sent', coalesce((
      select jsonb_agg(jsonb_build_object(
        'connectionId', connection.id,
        'userId', profile.id,
        'username', profile.username::text,
        'preferredName', profile.preferred_name,
        'status', connection.status,
        'updatedAt', connection.updated_at
      ) order by connection.updated_at desc)
      from public.builder_connections connection
      join public.profiles profile on profile.id=connection.recipient_id
      where connection.requester_id=actor and connection.status='pending'
    ), '[]'::jsonb),
    'connections', coalesce((
      select jsonb_agg(jsonb_build_object(
        'connectionId', connection.id,
        'userId', other_profile.id,
        'username', other_profile.username::text,
        'preferredName', other_profile.preferred_name,
        'status', connection.status,
        'updatedAt', connection.updated_at,
        'sharedEmail', case when other_share.share_email then other_connect.contact_email else null end,
        'sharedWhatsapp', case when other_share.share_whatsapp then other_connect.contact_whatsapp else null end,
        'myShareEmail', coalesce(my_share.share_email,false),
        'myShareWhatsapp', coalesce(my_share.share_whatsapp,false)
      ) order by connection.updated_at desc)
      from public.builder_connections connection
      join public.profiles other_profile on other_profile.id = case when connection.requester_id=actor then connection.recipient_id else connection.requester_id end
      left join public.builder_connect_profiles other_connect on other_connect.user_id=other_profile.id
      left join public.builder_contact_shares other_share on other_share.connection_id=connection.id and other_share.owner_id=other_profile.id
      left join public.builder_contact_shares my_share on my_share.connection_id=connection.id and my_share.owner_id=actor
      where actor in (connection.requester_id,connection.recipient_id)
        and connection.status='accepted'
        and not private.stage11_builder_pair_blocked(actor,other_profile.id)
    ), '[]'::jsonb),
    'blocked', coalesce((
      select jsonb_agg(jsonb_build_object(
        'userId', profile.id,
        'username', profile.username::text,
        'preferredName', profile.preferred_name
      ) order by block.created_at desc)
      from public.builder_blocks block
      join public.profiles profile on profile.id=block.blocked_id
      where block.blocker_id=actor
    ), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;

create or replace function public.get_stage11_builder_detail(username_input text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); target_id uuid; result jsonb;
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode='P0001'; end if;
  if not private.stage11_builder_connect_eligible(actor) then
    raise exception 'CONNECT_ADULT_REQUIRED' using errcode='P0001';
  end if;
  select profile.id into target_id from public.profiles profile
  join public.builder_connect_profiles connect on connect.user_id=profile.id
  where lower(profile.username::text)=lower(trim(username_input))
    and connect.visibility='discoverable'
    and private.stage11_builder_connect_eligible(profile.id);
  if target_id is null or private.stage11_builder_pair_blocked(actor,target_id) then
    raise exception 'CONNECT_BUILDER_NOT_FOUND' using errcode='P0001';
  end if;
  select jsonb_build_object(
    'userId', profile.id,
    'username', profile.username::text,
    'preferredName', profile.preferred_name,
    'missionTitle', mission.title,
    'missionStatement', mission.mission_statement,
    'interests', connect.interests,
    'capabilities', connect.capabilities,
    'canHelpWith', connect.can_help_with,
    'needsHelpWith', connect.needs_help_with,
    'relationship', coalesce(connection.status::text,'none'),
    'connectionId', connection.id,
    'requesterId', connection.requester_id
  ) into result
  from public.profiles profile
  join public.builder_connect_profiles connect on connect.user_id=profile.id
  left join lateral (
    select title,mission_statement from public.user_missions
    where user_id=profile.id and status='active'
    order by created_at desc limit 1
  ) mission on true
  left join public.builder_connections connection
    on least(connection.requester_id,connection.recipient_id)=least(actor,profile.id)
   and greatest(connection.requester_id,connection.recipient_id)=greatest(actor,profile.id)
  where profile.id=target_id;
  return result;
end;
$$;

