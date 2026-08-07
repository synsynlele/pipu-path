-- Minor status and safeguarding restriction are separate concepts.
-- Minors retain age-aware processing through is_minor/age_band; only an explicit
-- safeguarding_review_required flag should block private profile generation.

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
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not (accept_terms and accept_privacy and accept_ai) then
    raise exception 'required consent missing' using errcode = '22023';
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

  insert into public.user_consents (
    user_id, consent_type, policy_version, status, source
  ) values
    (actor, 'terms', policy_version_input, 'granted', 'identity_checkpoint'),
    (actor, 'privacy', policy_version_input, 'granted', 'identity_checkpoint'),
    (actor, 'ai_processing', policy_version_input, 'granted', 'identity_checkpoint'),
    (actor, 'age_declaration', policy_version_input, 'granted', 'identity_checkpoint');

  if age_band_input in ('under_13', '13_15', '16_17') then
    insert into public.user_consents (
      user_id, consent_type, policy_version, status, source
    ) values (
      actor, 'guardian_required', policy_version_input, 'declined',
      'identity_checkpoint'
    );
  end if;

  update public.onboarding_checkpoints set
    current_step = 'completed',
    status = 'completed',
    resume_path = '/app',
    completed_at = now(),
    version = version + 1
  where user_id = actor and status <> 'completed';

  insert into public.identity_audit_events (user_id, operation, result)
  values (actor, 'identity_checkpoint_completed', 'success');
exception
  when unique_violation then
    raise exception 'username unavailable' using errcode = '23505';
end;
$$;

create or replace function public.create_stage4_interpretation_request(
  idempotency_key_input uuid,
  interpretation_schema_version_input text,
  prompt_version_input text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  completed_session public.discovery_sessions%rowtype;
  profile_row public.profiles%rowtype;
  consent_row public.user_consents%rowtype;
  request_id uuid;
begin
  if actor is null then raise exception 'HPI_ACCESS_DENIED' using errcode = 'P0001'; end if;
  if idempotency_key_input is null or length(interpretation_schema_version_input) = 0 or length(prompt_version_input) = 0 then
    raise exception 'HPI_REQUEST_INVALID_STATE' using errcode = 'P0001';
  end if;

  perform public.normalize_stage4_discovery_evidence();
  select * into completed_session from public.discovery_sessions
    where user_id = actor and status = 'completed' and completed_at is not null
    order by completed_at desc limit 1;
  select * into profile_row from public.profiles where id = actor;
  select * into consent_row from public.user_consents
    where user_id = actor and consent_type = 'ai_processing' and status = 'granted' and withdrawn_at is null
    order by occurred_at desc limit 1;

  if completed_session.id is null then raise exception 'HPI_DISCOVERY_INCOMPLETE' using errcode = 'P0001'; end if;
  if consent_row.id is null then raise exception 'HPI_CONSENT_REQUIRED' using errcode = 'P0001'; end if;
  if coalesce(profile_row.safeguarding_review_required, false) then
    raise exception 'HPI_SAFEGUARDING_RESTRICTION' using errcode = 'P0001';
  end if;

  insert into public.interpretation_requests (
    user_id, status, question_set_version, interpretation_schema_version,
    prompt_version, consent_policy_version, age_band, is_minor,
    safeguarding_review_required, idempotency_key
  ) values (
    actor, 'ready', completed_session.question_set_version,
    interpretation_schema_version_input, prompt_version_input, consent_row.policy_version,
    profile_row.age_band, coalesce(profile_row.is_minor, false),
    profile_row.safeguarding_review_required, idempotency_key_input
  )
  on conflict (user_id, idempotency_key) do update set updated_at = now()
  returning id into request_id;

  insert into public.interpretation_request_evidence (
    interpretation_request_id, evidence_record_id, included_reason, source_version
  )
  select request_id, evidence.id, 'Completed Discovery evidence', evidence.source_version
  from public.evidence_records evidence
  where evidence.user_id = actor and evidence.evidence_status = 'eligible'
  on conflict do nothing;

  if not exists (
    select 1 from public.interpretation_request_evidence where interpretation_request_id = request_id
  ) then
    raise exception 'HPI_EVIDENCE_SNAPSHOT_FAILED' using errcode = 'P0001';
  end if;

  insert into public.identity_audit_events (user_id, operation, result, metadata)
  values (actor, 'hpi_interpretation_request_created', 'success', jsonb_build_object('request_id', request_id));
  return request_id;
end;
$$;

with repaired as (
  update public.profiles p
  set safeguarding_review_required = false
  where p.safeguarding_review_required = true
    and p.age_band in ('under_13', '13_15', '16_17')
    and exists (
      select 1 from public.onboarding_checkpoints c
      where c.user_id = p.id and c.status = 'completed'
    )
    and exists (
      select 1 from public.user_consents uc
      where uc.user_id = p.id
        and uc.consent_type = 'guardian_required'
        and uc.status = 'declined'
        and uc.source = 'identity_checkpoint'
    )
  returning p.id
)
insert into public.identity_audit_events (user_id, operation, result, metadata)
select id, 'legacy_minor_safeguarding_flag_cleared', 'success',
  jsonb_build_object('reason', 'minor_status_is_not_a_safeguarding_incident')
from repaired;
