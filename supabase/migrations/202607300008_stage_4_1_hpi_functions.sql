-- Stage 4.1 controlled operations. No live provider execution is introduced here.

create or replace function public.normalize_stage4_discovery_evidence()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  completed_session public.discovery_sessions%rowtype;
  inserted_count integer := 0;
begin
  if actor is null then raise exception 'HPI_ACCESS_DENIED' using errcode = 'P0001'; end if;

  select * into completed_session
  from public.discovery_sessions
  where user_id = actor
    and status = 'completed'
    and completed_at is not null
    and stage_4_processing_status = 'ready_for_stage_4'
  order by completed_at desc
  limit 1;

  if completed_session.id is null then
    raise exception 'HPI_DISCOVERY_INCOMPLETE' using errcode = 'P0001';
  end if;

  insert into public.evidence_records (
    user_id, source_type, source_id, source_version, source_key, category,
    content_summary, structured_value, sensitivity_level, age_restriction,
    evidence_status, occurred_at, content_hash, metadata
  )
  select
    actor,
    'discovery_response'::public.hpi_evidence_source_type,
    response.id,
    completed_session.question_set_version,
    response.question_key,
    case question.section_key
      when 'current_reality' then 'current_reality'::public.hpi_evidence_category
      when 'what_draws_me' then 'interest'::public.hpi_evidence_category
      when 'comes_naturally' then 'capability'::public.hpi_evidence_category
      when 'what_has_shaped_me' then 'experience'::public.hpi_evidence_category
      when 'what_matters' then 'value'::public.hpi_evidence_category
      when 'conditions_for_growth' then 'environment'::public.hpi_evidence_category
      when 'readiness' then 'readiness'::public.hpi_evidence_category
      else 'constraint'::public.hpi_evidence_category
    end,
    null,
    case when response.sensitivity = 'sensitive' then
      jsonb_build_object('response_type', response.response_type, 'redacted', true)
    else
      jsonb_strip_nulls(jsonb_build_object(
        'response_type', response.response_type,
        'text', response.text_response,
        'selected_options', response.selected_options,
        'numeric', response.numeric_response
      ))
    end,
    case when response.sensitivity = 'sensitive'
      then 'sensitive'::public.hpi_sensitivity_level
      else 'standard'::public.hpi_sensitivity_level end,
    profile.age_band,
    'eligible'::public.hpi_evidence_status,
    response.updated_at,
    encode(digest(concat_ws(chr(31),
      actor::text, response.id::text, completed_session.question_set_version::text,
      response.question_key, response.response_type::text,
      coalesce(response.text_response, ''),
      coalesce(array_to_string(response.selected_options, chr(30)), ''),
      coalesce(response.numeric_response::text, '')
    ), 'sha256'), 'hex'),
    jsonb_build_object('response_type', response.response_type, 'question_id', response.question_id)
  from public.discovery_responses response
  join public.discovery_questions question on question.id = response.question_id
  join public.profiles profile on profile.id = actor
  where response.user_id = actor
    and response.session_id = completed_session.id
    and not response.skipped
    and (response.text_response is not null or response.selected_options is not null or response.numeric_response is not null)
  on conflict (user_id, source_type, source_id, source_version, content_hash)
  do update set
    evidence_status = 'eligible',
    updated_at = now()
  where public.evidence_records.evidence_status <> 'eligible';

  get diagnostics inserted_count = row_count;
  insert into public.identity_audit_events (user_id, operation, result, metadata)
  values (actor, 'hpi_evidence_normalized', 'success', jsonb_build_object('affected_count', inserted_count));
  return inserted_count;
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
  if profile_row.is_minor and profile_row.safeguarding_review_required then
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

create or replace function public.record_stage4_insight_feedback(
  insight_id_input uuid,
  feedback_type_input public.hpi_feedback_type,
  replacement_text_input text default null,
  reason_input text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  feedback_id uuid;
begin
  if actor is null then raise exception 'HPI_ACCESS_DENIED' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.potential_insights where id = insight_id_input and user_id = actor) then
    raise exception 'HPI_INSIGHT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if feedback_type_input = 'edited' and nullif(trim(replacement_text_input), '') is null then
    raise exception 'HPI_FEEDBACK_INVALID' using errcode = 'P0001';
  end if;

  insert into public.insight_user_feedback (user_id, insight_id, feedback_type, replacement_text, reason)
  values (actor, insight_id_input, feedback_type_input, nullif(trim(replacement_text_input), ''), nullif(trim(reason_input), ''))
  returning id into feedback_id;
  insert into public.identity_audit_events (user_id, operation, result, metadata)
  values (actor, 'hpi_insight_feedback_recorded', 'success', jsonb_build_object('insight_id', insight_id_input));
  return feedback_id;
end;
$$;

revoke all on function public.normalize_stage4_discovery_evidence() from public, anon;
revoke all on function public.create_stage4_interpretation_request(uuid, text, text) from public, anon;
revoke all on function public.record_stage4_insight_feedback(uuid, public.hpi_feedback_type, text, text) from public, anon;
grant execute on function public.normalize_stage4_discovery_evidence() to authenticated;
grant execute on function public.create_stage4_interpretation_request(uuid, text, text) to authenticated;
grant execute on function public.record_stage4_insight_feedback(uuid, public.hpi_feedback_type, text, text) to authenticated;

