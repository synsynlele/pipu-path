-- Release gate: real guardian authorization and fail-closed under-18 provider use.
-- Under-18 accounts require an independently authenticated adult account.
-- External AI provider calls are disabled in application generation code for all minors.

create table public.guardian_authorization_requests (
  id uuid primary key default gen_random_uuid(),
  minor_user_id uuid not null references public.profiles(id) on delete cascade,
  request_code text not null unique
    check (request_code ~ '^[A-Z0-9]{16}),
  status text not null default 'pending'
    check (status in ('pending', 'granted', 'expired', 'revoked')),
  guardian_user_id uuid references public.profiles(id) on delete cascade,
  guardian_relationship text
    check (guardian_relationship is null or guardian_relationship in ('parent', 'legal_guardian')),
  policy_version text
    check (policy_version is null or char_length(policy_version) between 1 and 40),
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  granted_at timestamptz,
  revoked_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint guardian_authorization_actor_distinct
    check (guardian_user_id is null or guardian_user_id <> minor_user_id),
  constraint guardian_authorization_grant_consistency check (
    (status = 'granted' and guardian_user_id is not null and granted_at is not null and revoked_at is null)
    or status <> 'granted'
  )
);

create index guardian_authorization_minor_status_idx
  on public.guardian_authorization_requests(minor_user_id, status, requested_at desc);
create index guardian_authorization_guardian_status_idx
  on public.guardian_authorization_requests(guardian_user_id, status, granted_at desc)
  where guardian_user_id is not null;

create trigger guardian_authorization_updated_at
before update on public.guardian_authorization_requests
for each row execute function public.set_updated_at();

alter table public.guardian_authorization_requests enable row level security;
revoke all on public.guardian_authorization_requests from public, anon, authenticated;
grant select, insert, update on public.guardian_authorization_requests to service_role;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.guardian_authorization_granted(user_id_input uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = user_id_input
      and (
        not profile.is_minor
        or exists (
          select 1
          from public.guardian_authorization_requests request
          where request.minor_user_id = profile.id
            and request.status = 'granted'
            and request.granted_at is not null
            and request.revoked_at is null
        )
      )
  );
$$;

revoke all on function private.guardian_authorization_granted(uuid)
  from public, anon, authenticated;

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

create or replace function public.ensure_guardian_authorization_request()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  profile_row public.profiles%rowtype;
  request_row public.guardian_authorization_requests%rowtype;
  new_code text;
begin
  if actor is null then
    raise exception 'GUARDIAN_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  select * into profile_row from public.profiles where id = actor;
  if profile_row.id is null or not profile_row.is_minor then
    raise exception 'GUARDIAN_MINOR_REQUIRED' using errcode = 'P0001';
  end if;

  if private.guardian_authorization_granted(actor) then
    return public.get_guardian_authorization_state();
  end if;

  update public.guardian_authorization_requests
  set status = 'expired'
  where minor_user_id = actor
    and status = 'pending'
    and expires_at <= now();

  select * into request_row
  from public.guardian_authorization_requests
  where minor_user_id = actor
    and status = 'pending'
    and expires_at > now()
  order by requested_at desc
  limit 1;

  if request_row.id is null then
    new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));
    insert into public.guardian_authorization_requests(minor_user_id, request_code)
    values (actor, new_code)
    returning * into request_row;
  end if;

  return jsonb_build_object(
    'required', true,
    'status', request_row.status,
    'requestId', request_row.id,
    'code', request_row.request_code,
    'expiresAt', request_row.expires_at
  );
end;
$$;

create or replace function public.grant_guardian_authorization(
  request_code_input text,
  policy_version_input text,
  relationship_input text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  guardian_profile public.profiles%rowtype;
  target public.guardian_authorization_requests%rowtype;
  normalized_code text := upper(regexp_replace(trim(request_code_input), '[^A-Za-z0-9]', '', 'g'));
begin
  if actor is null then
    raise exception 'GUARDIAN_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  if relationship_input not in ('parent', 'legal_guardian') then
    raise exception 'GUARDIAN_RELATIONSHIP_INVALID' using errcode = 'P0001';
  end if;
  if char_length(policy_version_input) not between 1 and 40 then
    raise exception 'GUARDIAN_POLICY_INVALID' using errcode = 'P0001';
  end if;

  select * into guardian_profile
  from public.profiles
  where id = actor;

  if guardian_profile.id is null
     or guardian_profile.age_band not in ('18_24', '25_plus')
     or guardian_profile.safeguarding_review_required then
    raise exception 'GUARDIAN_ADULT_REQUIRED' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.onboarding_checkpoints checkpoint
    where checkpoint.user_id = actor and checkpoint.status = 'completed'
  ) then
    raise exception 'GUARDIAN_IDENTITY_REQUIRED' using errcode = 'P0001';
  end if;

  select * into target
  from public.guardian_authorization_requests
  where request_code = normalized_code
    and status = 'pending'
    and expires_at > now()
  for update;

  if target.id is null then
    raise exception 'GUARDIAN_CODE_INVALID' using errcode = 'P0001';
  end if;
  if target.minor_user_id = actor then
    raise exception 'GUARDIAN_SELF_APPROVAL_DENIED' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from public.profiles minor_profile
    where minor_profile.id = target.minor_user_id and minor_profile.is_minor
  ) then
    raise exception 'GUARDIAN_MINOR_REQUIRED' using errcode = 'P0001';
  end if;

  update public.guardian_authorization_requests
  set status = 'granted',
      guardian_user_id = actor,
      guardian_relationship = relationship_input,
      policy_version = policy_version_input,
      granted_at = now(),
      revoked_at = null
  where id = target.id;

  insert into public.user_consents(
    user_id, consent_type, policy_version, status, source, metadata
  ) values
    (
      target.minor_user_id, 'guardian_required', policy_version_input, 'granted', 'guardian',
      jsonb_build_object('relationship', relationship_input, 'request_id', target.id)
    ),
    (
      target.minor_user_id, 'ai_processing', policy_version_input, 'granted', 'guardian',
      jsonb_build_object(
        'relationship', relationship_input,
        'request_id', target.id,
        'external_provider_minor_processing', false
      )
    );

  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values
    (
      target.minor_user_id, 'guardian_authorization_granted', 'success',
      jsonb_build_object('request_id', target.id, 'guardian_user_id', actor, 'relationship', relationship_input)
    ),
    (
      actor, 'guardian_authorization_confirmed', 'success',
      jsonb_build_object('request_id', target.id, 'minor_user_id', target.minor_user_id, 'relationship', relationship_input)
    );

  return target.id;
end;
$$;

revoke all on function public.get_guardian_authorization_state() from public, anon;
revoke all on function public.ensure_guardian_authorization_request() from public, anon;
revoke all on function public.grant_guardian_authorization(text, text, text) from public, anon;
grant execute on function public.get_guardian_authorization_state() to authenticated;
grant execute on function public.ensure_guardian_authorization_request() to authenticated;
grant execute on function public.grant_guardian_authorization(text, text, text) to authenticated;

create or replace function public.complete_identity_checkpoint(
  preferred_name_input text,
  username_input text,
  age_band_input public.age_band,
  policy_version_input text,
  accept_terms boolean,
  accept_privacy boolean,
  accept_ai boolean
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  checkpoint_status public.identity_checkpoint_status;
  minor_account boolean := age_band_input in ('under_13', '13_15', '16_17');
  guardian_code text;
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not (accept_terms and accept_privacy) then
    raise exception 'required consent missing' using errcode = '22023';
  end if;
  if not minor_account and not accept_ai then
    raise exception 'AI consent required for adult account' using errcode = '22023';
  end if;
  if age_band_input = 'unknown' then
    raise exception 'age declaration required' using errcode = '22023';
  end if;

  perform public.provision_identity(actor);

  select status into checkpoint_status
  from public.onboarding_checkpoints
  where user_id = actor
  for update;

  if checkpoint_status = 'completed' then
    return;
  end if;

  update public.profiles set
    preferred_name = trim(preferred_name_input),
    display_name = trim(preferred_name_input),
    username = lower(trim(username_input))::extensions.citext,
    age_band = age_band_input,
    onboarding_status = 'stage_3_ready'
  where id = actor;

  insert into public.user_consents(
    user_id, consent_type, policy_version, status, source
  ) values
    (actor, 'terms', policy_version_input, 'granted', 'identity_checkpoint'),
    (actor, 'privacy', policy_version_input, 'granted', 'identity_checkpoint'),
    (actor, 'age_declaration', policy_version_input, 'granted', 'identity_checkpoint');

  if minor_account then
    insert into public.user_consents(
      user_id, consent_type, policy_version, status, source, metadata
    ) values
      (
        actor, 'ai_processing', policy_version_input, 'declined', 'identity_checkpoint',
        jsonb_build_object('reason', 'guardian_authorization_required', 'external_provider_minor_processing', false)
      ),
      (
        actor, 'guardian_required', policy_version_input, 'declined', 'identity_checkpoint',
        jsonb_build_object('reason', 'guardian_authorization_required')
      );

    guardian_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));
    insert into public.guardian_authorization_requests(minor_user_id, request_code)
    values (actor, guardian_code);
  else
    insert into public.user_consents(
      user_id, consent_type, policy_version, status, source
    ) values (
      actor, 'ai_processing', policy_version_input, 'granted', 'identity_checkpoint'
    );
  end if;

  update public.onboarding_checkpoints set
    current_step = 'completed',
    status = 'completed',
    resume_path = '/app',
    completed_at = now(),
    version = version + 1
  where user_id = actor and status <> 'completed';

  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values (
    actor,
    'identity_checkpoint_completed',
    'success',
    jsonb_build_object('minor_account', minor_account)
  );
exception
  when unique_violation then
    raise exception 'username unavailable' using errcode = '23505';
end;
$$;

revoke all on function public.complete_identity_checkpoint(
  text, text, public.age_band, text, boolean, boolean, boolean
) from public;
grant execute on function public.complete_identity_checkpoint(
  text, text, public.age_band, text, boolean, boolean, boolean
) to authenticated;
),
  status text not null default 'pending'
    check (status in ('pending', 'granted', 'expired', 'revoked')),
  guardian_user_id uuid references public.profiles(id) on delete cascade,
  guardian_relationship text
    check (guardian_relationship is null or guardian_relationship in ('parent', 'legal_guardian')),
  policy_version text
    check (policy_version is null or char_length(policy_version) between 1 and 40),
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  granted_at timestamptz,
  revoked_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint guardian_authorization_actor_distinct
    check (guardian_user_id is null or guardian_user_id <> minor_user_id),
  constraint guardian_authorization_grant_consistency check (
    (status = 'granted' and guardian_user_id is not null and granted_at is not null and revoked_at is null)
    or status <> 'granted'
  )
);

create index guardian_authorization_minor_status_idx
  on public.guardian_authorization_requests(minor_user_id, status, requested_at desc);
create index guardian_authorization_guardian_status_idx
  on public.guardian_authorization_requests(guardian_user_id, status, granted_at desc)
  where guardian_user_id is not null;

create trigger guardian_authorization_updated_at
before update on public.guardian_authorization_requests
for each row execute function public.set_updated_at();

alter table public.guardian_authorization_requests enable row level security;
revoke all on public.guardian_authorization_requests from public, anon, authenticated;
grant select, insert, update on public.guardian_authorization_requests to service_role;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.guardian_authorization_granted(user_id_input uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = user_id_input
      and (
        not profile.is_minor
        or exists (
          select 1
          from public.guardian_authorization_requests request
          where request.minor_user_id = profile.id
            and request.status = 'granted'
            and request.granted_at is not null
            and request.revoked_at is null
        )
      )
  );
$$;

revoke all on function private.guardian_authorization_granted(uuid)
  from public, anon, authenticated;

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

create or replace function public.ensure_guardian_authorization_request()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  profile_row public.profiles%rowtype;
  request_row public.guardian_authorization_requests%rowtype;
  new_code text;
begin
  if actor is null then
    raise exception 'GUARDIAN_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  select * into profile_row from public.profiles where id = actor;
  if profile_row.id is null or not profile_row.is_minor then
    raise exception 'GUARDIAN_MINOR_REQUIRED' using errcode = 'P0001';
  end if;

  if private.guardian_authorization_granted(actor) then
    return public.get_guardian_authorization_state();
  end if;

  update public.guardian_authorization_requests
  set status = 'expired'
  where minor_user_id = actor
    and status = 'pending'
    and expires_at <= now();

  select * into request_row
  from public.guardian_authorization_requests
  where minor_user_id = actor
    and status = 'pending'
    and expires_at > now()
  order by requested_at desc
  limit 1;

  if request_row.id is null then
    new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));
    insert into public.guardian_authorization_requests(minor_user_id, request_code)
    values (actor, new_code)
    returning * into request_row;
  end if;

  return jsonb_build_object(
    'required', true,
    'status', request_row.status,
    'requestId', request_row.id,
    'code', request_row.request_code,
    'expiresAt', request_row.expires_at
  );
end;
$$;

create or replace function public.grant_guardian_authorization(
  request_code_input text,
  policy_version_input text,
  relationship_input text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  guardian_profile public.profiles%rowtype;
  target public.guardian_authorization_requests%rowtype;
  normalized_code text := upper(regexp_replace(trim(request_code_input), '[^A-Za-z0-9]', '', 'g'));
begin
  if actor is null then
    raise exception 'GUARDIAN_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  if relationship_input not in ('parent', 'legal_guardian') then
    raise exception 'GUARDIAN_RELATIONSHIP_INVALID' using errcode = 'P0001';
  end if;
  if char_length(policy_version_input) not between 1 and 40 then
    raise exception 'GUARDIAN_POLICY_INVALID' using errcode = 'P0001';
  end if;

  select * into guardian_profile
  from public.profiles
  where id = actor;

  if guardian_profile.id is null
     or guardian_profile.age_band not in ('18_24', '25_plus')
     or guardian_profile.safeguarding_review_required then
    raise exception 'GUARDIAN_ADULT_REQUIRED' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.onboarding_checkpoints checkpoint
    where checkpoint.user_id = actor and checkpoint.status = 'completed'
  ) then
    raise exception 'GUARDIAN_IDENTITY_REQUIRED' using errcode = 'P0001';
  end if;

  select * into target
  from public.guardian_authorization_requests
  where request_code = normalized_code
    and status = 'pending'
    and expires_at > now()
  for update;

  if target.id is null then
    raise exception 'GUARDIAN_CODE_INVALID' using errcode = 'P0001';
  end if;
  if target.minor_user_id = actor then
    raise exception 'GUARDIAN_SELF_APPROVAL_DENIED' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from public.profiles minor_profile
    where minor_profile.id = target.minor_user_id and minor_profile.is_minor
  ) then
    raise exception 'GUARDIAN_MINOR_REQUIRED' using errcode = 'P0001';
  end if;

  update public.guardian_authorization_requests
  set status = 'granted',
      guardian_user_id = actor,
      guardian_relationship = relationship_input,
      policy_version = policy_version_input,
      granted_at = now(),
      revoked_at = null
  where id = target.id;

  insert into public.user_consents(
    user_id, consent_type, policy_version, status, source, metadata
  ) values
    (
      target.minor_user_id, 'guardian_required', policy_version_input, 'granted', 'guardian',
      jsonb_build_object('relationship', relationship_input, 'request_id', target.id)
    ),
    (
      target.minor_user_id, 'ai_processing', policy_version_input, 'granted', 'guardian',
      jsonb_build_object(
        'relationship', relationship_input,
        'request_id', target.id,
        'external_provider_minor_processing', false
      )
    );

  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values
    (
      target.minor_user_id, 'guardian_authorization_granted', 'success',
      jsonb_build_object('request_id', target.id, 'guardian_user_id', actor, 'relationship', relationship_input)
    ),
    (
      actor, 'guardian_authorization_confirmed', 'success',
      jsonb_build_object('request_id', target.id, 'minor_user_id', target.minor_user_id, 'relationship', relationship_input)
    );

  return target.id;
end;
$$;

revoke all on function public.get_guardian_authorization_state() from public, anon;
revoke all on function public.ensure_guardian_authorization_request() from public, anon;
revoke all on function public.grant_guardian_authorization(text, text, text) from public, anon;
grant execute on function public.get_guardian_authorization_state() to authenticated;
grant execute on function public.ensure_guardian_authorization_request() to authenticated;
grant execute on function public.grant_guardian_authorization(text, text, text) to authenticated;

create or replace function public.complete_identity_checkpoint(
  preferred_name_input text,
  username_input text,
  age_band_input public.age_band,
  policy_version_input text,
  accept_terms boolean,
  accept_privacy boolean,
  accept_ai boolean
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  checkpoint_status public.identity_checkpoint_status;
  minor_account boolean := age_band_input in ('under_13', '13_15', '16_17');
  guardian_code text;
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not (accept_terms and accept_privacy) then
    raise exception 'required consent missing' using errcode = '22023';
  end if;
  if not minor_account and not accept_ai then
    raise exception 'AI consent required for adult account' using errcode = '22023';
  end if;
  if age_band_input = 'unknown' then
    raise exception 'age declaration required' using errcode = '22023';
  end if;

  perform public.provision_identity(actor);

  select status into checkpoint_status
  from public.onboarding_checkpoints
  where user_id = actor
  for update;

  if checkpoint_status = 'completed' then
    return;
  end if;

  update public.profiles set
    preferred_name = trim(preferred_name_input),
    display_name = trim(preferred_name_input),
    username = lower(trim(username_input))::extensions.citext,
    age_band = age_band_input,
    onboarding_status = 'stage_3_ready'
  where id = actor;

  insert into public.user_consents(
    user_id, consent_type, policy_version, status, source
  ) values
    (actor, 'terms', policy_version_input, 'granted', 'identity_checkpoint'),
    (actor, 'privacy', policy_version_input, 'granted', 'identity_checkpoint'),
    (actor, 'age_declaration', policy_version_input, 'granted', 'identity_checkpoint');

  if minor_account then
    insert into public.user_consents(
      user_id, consent_type, policy_version, status, source, metadata
    ) values
      (
        actor, 'ai_processing', policy_version_input, 'declined', 'identity_checkpoint',
        jsonb_build_object('reason', 'guardian_authorization_required', 'external_provider_minor_processing', false)
      ),
      (
        actor, 'guardian_required', policy_version_input, 'declined', 'identity_checkpoint',
        jsonb_build_object('reason', 'guardian_authorization_required')
      );

    guardian_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));
    insert into public.guardian_authorization_requests(minor_user_id, request_code)
    values (actor, guardian_code);
  else
    insert into public.user_consents(
      user_id, consent_type, policy_version, status, source
    ) values (
      actor, 'ai_processing', policy_version_input, 'granted', 'identity_checkpoint'
    );
  end if;

  update public.onboarding_checkpoints set
    current_step = 'completed',
    status = 'completed',
    resume_path = '/app',
    completed_at = now(),
    version = version + 1
  where user_id = actor and status <> 'completed';

  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values (
    actor,
    'identity_checkpoint_completed',
    'success',
    jsonb_build_object('minor_account', minor_account)
  );
exception
  when unique_violation then
    raise exception 'username unavailable' using errcode = '23505';
end;
$$;

revoke all on function public.complete_identity_checkpoint(
  text, text, public.age_band, text, boolean, boolean, boolean
) from public;
grant execute on function public.complete_identity_checkpoint(
  text, text, public.age_band, text, boolean, boolean, boolean
) to authenticated;
