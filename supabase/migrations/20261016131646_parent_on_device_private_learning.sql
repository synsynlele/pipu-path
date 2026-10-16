-- Parent-on-device attestation for private learning. This is not identity verification.
-- Use the existing append-only consent ledger; its RLS/grants deny direct client writes.
create or replace function public.record_parent_learning_attestation(
  parent_name_input text,
  relationship_input text,
  declaration_input boolean
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  profile_row public.profiles%rowtype;
begin
  if actor is null then
    raise exception 'PARENT_AUTH_REQUIRED' using errcode = '42501';
  end if;
  -- Serialize duplicate submissions without creating duplicate consent events.
  select * into profile_row from public.profiles where id = actor for update;
  if profile_row.id is null or not profile_row.is_minor
    or profile_row.account_status <> 'active'
    or not exists (select 1 from public.onboarding_checkpoints
                   where user_id = actor and status = 'completed') then
    raise exception 'PARENT_MINOR_ACCOUNT_REQUIRED' using errcode = '42501';
  end if;
  if declaration_input is distinct from true
    or parent_name_input is null or char_length(trim(parent_name_input)) not between 2 and 80
    or relationship_input is null or relationship_input not in ('parent', 'legal_guardian') then
    raise exception 'PARENT_DECLARATION_REQUIRED' using errcode = '22023';
  end if;
  if exists (
    select 1 from (
      select status, metadata, policy_version from public.user_consents
      where user_id = actor and consent_type = 'guardian_required'
      order by occurred_at desc, created_at desc, id desc limit 1
    ) latest
    where latest.status = 'granted'
      and latest.policy_version = '2026-10-16-parent-device-v1'
      and latest.metadata->>'approval_method' = 'parent_on_device'
  ) then return; end if;

  insert into public.user_consents (
    user_id, consent_type, policy_version, status, source, metadata
  ) values (
    actor, 'guardian_required', '2026-10-16-parent-device-v1', 'granted', 'guardian',
    jsonb_build_object(
      'approval_method', 'parent_on_device', 'assurance', 'self_declared',
      'parent_declared_name', trim(parent_name_input),
      'relationship', relationship_input, 'scope', 'private_learning',
      'recorded_by_user_id', actor, 'adult_and_guardian_declaration', true
    )
  );
  insert into public.identity_audit_events(user_id, operation, result)
  values (actor, 'parent_learning_attestation_recorded', 'success');
end;
$$;
revoke all on function public.record_parent_learning_attestation(text, text, boolean) from public, anon;
grant execute on function public.record_parent_learning_attestation(text, text, boolean) to authenticated;

create or replace function public.get_guardian_authorization_state()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  profile_row public.profiles%rowtype;
  request_row public.guardian_authorization_requests%rowtype;
begin
  if actor is null then
    raise exception 'GUARDIAN_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select * into profile_row from public.profiles where id = actor;
  if profile_row.id is null then
    raise exception 'GUARDIAN_PROFILE_REQUIRED' using errcode = 'P0001';
  end if;

  if not profile_row.is_minor then
    return jsonb_build_object(
      'required', false,
      'status', 'not_required',
      'requestId', null,
      'code', null,
      'expiresAt', null
    );
  end if;

  select * into request_row
  from public.guardian_authorization_requests
  where minor_user_id = actor
    and status in ('granted', 'pending')
  order by case when status = 'granted' then 0 else 1 end, requested_at desc
  limit 1;

  -- A declaration unlocks private learning only. The independently authenticated
  -- guardian helper and school-network permissions remain unchanged.
  if request_row.status is distinct from 'granted' and exists (
    select 1 from (
      select status, metadata, policy_version
      from public.user_consents
      where user_id = actor and consent_type = 'guardian_required'
      order by occurred_at desc, created_at desc, id desc
      limit 1
    ) latest
    where latest.status = 'granted'
      and latest.policy_version = '2026-10-16-parent-device-v1'
      and latest.metadata->>'approval_method' = 'parent_on_device'
      and latest.metadata->>'assurance' = 'self_declared'
  ) then
    return jsonb_build_object(
      'required', true, 'status', 'parent_declared',
      'requestId', null, 'code', null, 'expiresAt', null
    );
  end if;

  if request_row.id is null then
    return jsonb_build_object(
      'required', true,
      'status', 'missing',
      'requestId', null,
      'code', null,
      'expiresAt', null
    );
  end if;

  if request_row.status = 'pending' and request_row.expires_at <= now() then
    return jsonb_build_object(
      'required', true,
      'status', 'expired',
      'requestId', request_row.id,
      'code', null,
      'expiresAt', request_row.expires_at
    );
  end if;

  return jsonb_build_object(
    'required', true,
    'status', request_row.status,
    'requestId', request_row.id,
    'code', case when request_row.status = 'pending' then request_row.request_code else null end,
    'expiresAt', request_row.expires_at
  );
end;
$$;

revoke all on function public.get_guardian_authorization_state() from public, anon;
grant execute on function public.get_guardian_authorization_state() to authenticated;
