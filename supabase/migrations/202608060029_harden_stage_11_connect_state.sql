-- Prevent an ineligible or safeguarding-flagged account from receiving any
-- cross-user Connect state, and prevent contact sharing across a blocked pair.
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
  if not eligible then
    return jsonb_build_object(
      'eligible', false,
      'profile', null,
      'discover', '[]'::jsonb,
      'incoming', '[]'::jsonb,
      'sent', '[]'::jsonb,
      'connections', '[]'::jsonb,
      'blocked', '[]'::jsonb
    );
  end if;

  select jsonb_build_object(
    'eligible', true,
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
    'discover', coalesce((
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
    ), '[]'::jsonb),
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
        and not private.stage11_builder_pair_blocked(actor,profile.id)
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
        and not private.stage11_builder_pair_blocked(actor,profile.id)
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

create or replace function public.share_stage11_contact(
  connection_id_input uuid,
  share_email_input boolean,
  share_whatsapp_input boolean
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target public.builder_connections%rowtype;
  own_profile public.builder_connect_profiles%rowtype;
  other_user uuid;
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode='P0001'; end if;
  if not private.stage11_builder_connect_eligible(actor) then
    raise exception 'CONNECT_ADULT_REQUIRED' using errcode='P0001';
  end if;
  select * into target from public.builder_connections
  where id=connection_id_input and status='accepted' and actor in (requester_id,recipient_id)
  for update;
  if target.id is null then raise exception 'CONNECT_REQUEST_NOT_FOUND' using errcode='P0001'; end if;
  other_user := case when target.requester_id=actor then target.recipient_id else target.requester_id end;
  if private.stage11_builder_pair_blocked(actor,other_user) then
    raise exception 'CONNECT_BLOCKED' using errcode='P0001';
  end if;
  select * into own_profile from public.builder_connect_profiles where user_id=actor;
  if share_email_input and own_profile.contact_email is null then
    raise exception 'CONNECT_CONTACT_MISSING' using errcode='P0001';
  end if;
  if share_whatsapp_input and own_profile.contact_whatsapp is null then
    raise exception 'CONNECT_CONTACT_MISSING' using errcode='P0001';
  end if;
  if not share_email_input and not share_whatsapp_input then
    delete from public.builder_contact_shares where connection_id=connection_id_input and owner_id=actor;
    return true;
  end if;
  insert into public.builder_contact_shares(connection_id,owner_id,share_email,share_whatsapp)
  values(connection_id_input,actor,share_email_input,share_whatsapp_input)
  on conflict (connection_id,owner_id) do update set
    share_email=excluded.share_email,
    share_whatsapp=excluded.share_whatsapp,
    shared_at=now();
  return true;
end;
$$;

revoke all on function public.get_stage11_connect_state() from public,anon;
grant execute on function public.get_stage11_connect_state() to authenticated;
revoke all on function public.share_stage11_contact(uuid,boolean,boolean) from public,anon;
grant execute on function public.share_stage11_contact(uuid,boolean,boolean) to authenticated;
