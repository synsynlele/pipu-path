-- Stage 4.1 lifecycle and request-idempotency corrections.

create or replace function public.supersede_replaced_hpi_evidence()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.evidence_records
  set evidence_status = 'superseded', updated_at = now()
  where user_id = new.user_id
    and source_type = new.source_type
    and source_id = new.source_id
    and evidence_status = 'eligible'
    and content_hash <> new.content_hash;

  return new;
end;
$$;

create trigger evidence_records_supersede_replaced_source
before insert on public.evidence_records
for each row execute function public.supersede_replaced_hpi_evidence();

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
  if actor is null then
    raise exception 'HPI_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  if idempotency_key_input is null
    or nullif(trim(interpretation_schema_version_input), '') is null
    or nullif(trim(prompt_version_input), '') is null then
    raise exception 'HPI_REQUEST_INVALID_STATE' using errcode = 'P0001';
  end if;

  select id into request_id
  from public.interpretation_requests
  where user_id = actor and idempotency_key = idempotency_key_input;

  if request_id is not null then
    return request_id;
  end if;

  perform public.normalize_stage4_discovery_evidence();

  select * into completed_session
  from public.discovery_sessions
  where user_id = actor
    and status = 'completed'
    and completed_at is not null
    and stage_4_processing_status = 'ready_for_stage_4'
  order by completed_at desc
  limit 1;

  select * into profile_row from public.profiles where id = actor;
  select * into consent_row
  from public.user_consents
  where user_id = actor
    and consent_type = 'ai_processing'
    and status = 'granted'
    and withdrawn_at is null
  order by occurred_at desc
  limit 1;

  if completed_session.id is null then
    raise exception 'HPI_DISCOVERY_INCOMPLETE' using errcode = 'P0001';
  end if;
  if profile_row.id is null then
    raise exception 'HPI_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  if consent_row.id is null then
    raise exception 'HPI_CONSENT_REQUIRED' using errcode = 'P0001';
  end if;
  if profile_row.is_minor and profile_row.safeguarding_review_required then
    raise exception 'HPI_SAFEGUARDING_RESTRICTION' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.interpretation_requests
    where user_id = actor
      and question_set_version = completed_session.question_set_version
      and interpretation_schema_version = interpretation_schema_version_input
      and prompt_version = prompt_version_input
      and status in ('pending', 'validating', 'ready', 'processing')
  ) then
    raise exception 'HPI_REQUEST_ALREADY_EXISTS' using errcode = 'P0001';
  end if;

  insert into public.interpretation_requests (
    user_id, status, question_set_version, interpretation_schema_version,
    prompt_version, consent_policy_version, age_band, is_minor,
    safeguarding_review_required, idempotency_key
  ) values (
    actor, 'ready', completed_session.question_set_version,
    interpretation_schema_version_input, prompt_version_input,
    consent_row.policy_version, profile_row.age_band,
    coalesce(profile_row.is_minor, false),
    coalesce(profile_row.safeguarding_review_required, false),
    idempotency_key_input
  )
  returning id into request_id;

  insert into public.interpretation_request_evidence (
    interpretation_request_id, evidence_record_id, included_reason, source_version
  )
  select request_id, evidence.id, 'Completed Discovery evidence', evidence.source_version
  from public.evidence_records evidence
  where evidence.user_id = actor
    and evidence.evidence_status = 'eligible'
  on conflict do nothing;

  if not exists (
    select 1 from public.interpretation_request_evidence
    where interpretation_request_id = request_id
  ) then
    raise exception 'HPI_EVIDENCE_SNAPSHOT_FAILED' using errcode = 'P0001';
  end if;

  insert into public.identity_audit_events (user_id, operation, result, metadata)
  values (
    actor,
    'hpi_interpretation_request_created',
    'success',
    jsonb_build_object('request_id', request_id)
  );

  return request_id;
end;
$$;

revoke all on function public.supersede_replaced_hpi_evidence() from public;
revoke all on function public.create_stage4_interpretation_request(uuid, text, text) from public, anon;
grant execute on function public.create_stage4_interpretation_request(uuid, text, text) to authenticated;

