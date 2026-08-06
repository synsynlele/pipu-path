-- Stage 11 Builder Connect controlled mutation RPCs.
create or replace function public.save_stage11_builder_connect_profile(
  interests_input text[],
  capabilities_input text[],
  can_help_with_input text,
  needs_help_with_input text,
  contact_email_input text default null,
  contact_whatsapp_input text default null,
  visibility_input public.builder_connect_visibility default 'private'
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  normalized_interests text[];
  normalized_capabilities text[];
begin
  if actor is null then
    raise exception 'CONNECT_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  if not private.stage11_builder_connect_eligible(actor) then
    raise exception 'CONNECT_ADULT_REQUIRED' using errcode = 'P0001';
  end if;

  select coalesce(array_agg(value order by value), '{}') into normalized_interests
  from (
    select distinct left(trim(item), 80) as value
    from unnest(coalesce(interests_input, '{}')) item
    where char_length(trim(item)) between 2 and 80
    limit 8
  ) values_list;

  select coalesce(array_agg(value order by value), '{}') into normalized_capabilities
  from (
    select distinct left(trim(item), 80) as value
    from unnest(coalesce(capabilities_input, '{}')) item
    where char_length(trim(item)) between 2 and 80
    limit 8
  ) values_list;

  if char_length(trim(coalesce(can_help_with_input, ''))) > 320
     or char_length(trim(coalesce(needs_help_with_input, ''))) > 320 then
    raise exception 'CONNECT_INPUT_INVALID' using errcode = 'P0001';
  end if;
  if visibility_input = 'discoverable'
     and (cardinality(normalized_interests) = 0 or cardinality(normalized_capabilities) = 0) then
    raise exception 'CONNECT_PROFILE_INCOMPLETE' using errcode = 'P0001';
  end if;

  insert into public.builder_connect_profiles(
    user_id, interests, capabilities, can_help_with, needs_help_with,
    contact_email, contact_whatsapp, visibility, discoverable_at
  ) values (
    actor, normalized_interests, normalized_capabilities,
    trim(coalesce(can_help_with_input, '')), trim(coalesce(needs_help_with_input, '')),
    nullif(lower(trim(coalesce(contact_email_input, ''))), ''),
    nullif(trim(coalesce(contact_whatsapp_input, '')), ''),
    visibility_input,
    case when visibility_input = 'discoverable' then now() else null end
  )
  on conflict (user_id) do update set
    interests = excluded.interests,
    capabilities = excluded.capabilities,
    can_help_with = excluded.can_help_with,
    needs_help_with = excluded.needs_help_with,
    contact_email = excluded.contact_email,
    contact_whatsapp = excluded.contact_whatsapp,
    visibility = excluded.visibility,
    discoverable_at = case
      when excluded.visibility = 'discoverable'
        then coalesce(public.builder_connect_profiles.discoverable_at, now())
      else null
    end;

  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values(actor, 'builder_connect_profile_saved', 'success', jsonb_build_object('visibility', visibility_input));
  return true;
end;
$$;

create or replace function public.send_stage11_connection_request(target_user_id_input uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  existing public.builder_connections%rowtype;
  connection_id uuid;
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode='P0001'; end if;
  if actor = target_user_id_input then raise exception 'CONNECT_SELF_REQUEST' using errcode='P0001'; end if;
  if not private.stage11_builder_connect_eligible(actor)
     or not private.stage11_builder_connect_eligible(target_user_id_input) then
    raise exception 'CONNECT_ADULT_REQUIRED' using errcode='P0001';
  end if;
  if not exists (
    select 1 from public.builder_connect_profiles profile
    where profile.user_id = target_user_id_input and profile.visibility = 'discoverable'
  ) then raise exception 'CONNECT_BUILDER_NOT_FOUND' using errcode='P0001'; end if;
  if private.stage11_builder_pair_blocked(actor, target_user_id_input) then
    raise exception 'CONNECT_BLOCKED' using errcode='P0001';
  end if;

  select * into existing from public.builder_connections connection
  where least(connection.requester_id, connection.recipient_id) = least(actor, target_user_id_input)
    and greatest(connection.requester_id, connection.recipient_id) = greatest(actor, target_user_id_input)
  for update;

  if existing.id is not null and existing.status in ('pending', 'accepted') then
    raise exception 'CONNECT_REQUEST_EXISTS' using errcode='P0001';
  end if;

  if existing.id is null then
    insert into public.builder_connections(requester_id, recipient_id)
    values(actor, target_user_id_input) returning id into connection_id;
  else
    update public.builder_connections set
      requester_id = actor,
      recipient_id = target_user_id_input,
      status = 'pending',
      requested_at = now(),
      responded_at = null,
      accepted_at = null,
      closed_at = null
    where id = existing.id returning id into connection_id;
    delete from public.builder_contact_shares where connection_id = existing.id;
  end if;

  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values(actor, 'builder_connection_requested', 'success', jsonb_build_object('connection_id', connection_id));
  return connection_id;
end;
$$;

create or replace function public.respond_stage11_connection_request(
  connection_id_input uuid,
  accept_input boolean
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target public.builder_connections%rowtype;
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode='P0001'; end if;
  select * into target from public.builder_connections
  where id = connection_id_input and recipient_id = actor and status = 'pending'
  for update;
  if target.id is null then raise exception 'CONNECT_REQUEST_NOT_FOUND' using errcode='P0001'; end if;
  if private.stage11_builder_pair_blocked(target.requester_id, target.recipient_id) then
    raise exception 'CONNECT_BLOCKED' using errcode='P0001';
  end if;
  update public.builder_connections set
    status = case when accept_input then 'accepted' else 'declined' end,
    responded_at = now(),
    accepted_at = case when accept_input then now() else null end,
    closed_at = case when accept_input then null else now() end
  where id = target.id;
  return true;
end;
$$;

create or replace function public.close_stage11_connection(
  connection_id_input uuid,
  action_input text
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target public.builder_connections%rowtype;
  next_status public.builder_connection_status;
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode='P0001'; end if;
  select * into target from public.builder_connections
  where id = connection_id_input and actor in (requester_id, recipient_id)
  for update;
  if target.id is null then raise exception 'CONNECT_REQUEST_NOT_FOUND' using errcode='P0001'; end if;
  if action_input = 'cancel' and target.requester_id = actor and target.status = 'pending' then
    next_status := 'cancelled';
  elsif action_input = 'remove' and target.status = 'accepted' then
    next_status := 'removed';
  else
    raise exception 'CONNECT_ACTION_INVALID' using errcode='P0001';
  end if;
  update public.builder_connections set status = next_status, closed_at = now() where id = target.id;
  delete from public.builder_contact_shares where connection_id = target.id;
  return true;
end;
$$;

create or replace function public.block_stage11_builder(target_user_id_input uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode='P0001'; end if;
  if actor = target_user_id_input then raise exception 'CONNECT_ACTION_INVALID' using errcode='P0001'; end if;
  insert into public.builder_blocks(blocker_id, blocked_id)
  values(actor, target_user_id_input) on conflict do nothing;
  update public.builder_connections set status='removed', closed_at=now()
  where status in ('pending','accepted')
    and least(requester_id, recipient_id)=least(actor,target_user_id_input)
    and greatest(requester_id, recipient_id)=greatest(actor,target_user_id_input);
  delete from public.builder_contact_shares shares
  using public.builder_connections connection
  where shares.connection_id = connection.id
    and least(connection.requester_id, connection.recipient_id)=least(actor,target_user_id_input)
    and greatest(connection.requester_id, connection.recipient_id)=greatest(actor,target_user_id_input);
  return true;
end;
$$;

create or replace function public.unblock_stage11_builder(target_user_id_input uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode='P0001'; end if;
  delete from public.builder_blocks where blocker_id=actor and blocked_id=target_user_id_input;
  return found;
end;
$$;

create or replace function public.report_stage11_builder(
  target_user_id_input uuid,
  reason_code_input text,
  detail_input text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := auth.uid(); report_id uuid;
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode='P0001'; end if;
  if actor = target_user_id_input then raise exception 'CONNECT_ACTION_INVALID' using errcode='P0001'; end if;
  if reason_code_input not in ('spam','harassment','unsafe_contact','impersonation','other') then
    raise exception 'CONNECT_INPUT_INVALID' using errcode='P0001';
  end if;
  if detail_input is not null and char_length(trim(detail_input)) not between 3 and 500 then
    raise exception 'CONNECT_INPUT_INVALID' using errcode='P0001';
  end if;
  insert into public.builder_reports(reporter_id,reported_id,reason_code,detail)
  values(actor,target_user_id_input,reason_code_input,nullif(trim(coalesce(detail_input,'')),''))
  returning id into report_id;
  return report_id;
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
declare actor uuid := auth.uid(); target public.builder_connections%rowtype; own_profile public.builder_connect_profiles%rowtype;
begin
  if actor is null then raise exception 'CONNECT_ACCESS_DENIED' using errcode='P0001'; end if;
  select * into target from public.builder_connections
  where id=connection_id_input and status='accepted' and actor in (requester_id,recipient_id);
  if target.id is null then raise exception 'CONNECT_REQUEST_NOT_FOUND' using errcode='P0001'; end if;
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

