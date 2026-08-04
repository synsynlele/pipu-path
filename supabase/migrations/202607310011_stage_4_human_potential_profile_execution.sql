-- Stage 4: controlled private Human Potential Profile execution.
-- These functions are callable only by the server's service-role adapter. Browser
-- roles retain no write access to generated profile records.

create or replace function public.claim_stage4_interpretation_request(
  request_id_input uuid,
  provider_input text,
  model_input text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if nullif(trim(provider_input), '') is null
    or nullif(trim(model_input), '') is null then
    raise exception 'HPI_REQUEST_INVALID_STATE' using errcode = 'P0001';
  end if;

  update public.interpretation_requests
  set status = 'processing',
      provider = provider_input,
      model = model_input,
      started_at = coalesce(started_at, now()),
      attempt_count = attempt_count + 1,
      failure_code = null,
      failure_detail_safe = null,
      updated_at = now()
  where id = request_id_input
    and status = 'ready';

  return found;
end;
$$;

create or replace function public.fail_stage4_interpretation_request(
  request_id_input uuid,
  failure_code_input text,
  failure_detail_safe_input text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if nullif(trim(failure_code_input), '') is null then
    raise exception 'HPI_REQUEST_INVALID_STATE' using errcode = 'P0001';
  end if;

  update public.interpretation_requests
  set status = 'failed',
      failed_at = now(),
      failure_code = left(failure_code_input, 96),
      failure_detail_safe = nullif(left(trim(coalesce(failure_detail_safe_input, '')), 240), ''),
      updated_at = now()
  where id = request_id_input
    and status = 'processing';

  return found;
end;
$$;

create or replace function public.persist_stage4_human_potential_profile(
  request_id_input uuid,
  profile_summary_input text,
  profile_metadata_input jsonb,
  insights_input jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.interpretation_requests%rowtype;
  next_version integer;
  profile_id uuid;
  insight_value jsonb;
  evidence_value jsonb;
  uncertainty_value jsonb;
  insight_id uuid;
  evidence_id uuid;
  display_order_value integer := 0;
begin
  if jsonb_typeof(insights_input) <> 'array'
    or jsonb_array_length(insights_input) = 0
    or jsonb_array_length(insights_input) > 20
    or nullif(trim(profile_summary_input), '') is null then
    raise exception 'HPI_OUTPUT_INVALID' using errcode = 'P0001';
  end if;

  select * into request_row
  from public.interpretation_requests
  where id = request_id_input
    and status = 'processing'
  for update;

  if request_row.id is null then
    raise exception 'HPI_REQUEST_INVALID_STATE' using errcode = 'P0001';
  end if;

  select coalesce(max(version), 0) + 1 into next_version
  from public.human_potential_profile_versions
  where user_id = request_row.user_id;

  insert into public.human_potential_profile_versions (
    user_id, version, status, source_interpretation_request_id, schema_version, metadata
  ) values (
    request_row.user_id,
    next_version,
    'draft',
    request_row.id,
    request_row.interpretation_schema_version,
    jsonb_build_object('summary', left(profile_summary_input, 1200))
      || coalesce(profile_metadata_input, '{}'::jsonb)
  ) returning id into profile_id;

  for insight_value in select value from jsonb_array_elements(insights_input)
  loop
    insert into public.potential_insights (
      user_id, interpretation_request_id, insight_type, insight_key, title, summary,
      description, confidence_level, confidence_score, confidence_factors, status,
      sensitivity_level, schema_version, suggested_confirmation_question,
      age_appropriate, metadata
    ) values (
      request_row.user_id,
      request_row.id,
      (insight_value->>'insightType')::public.hpi_insight_type,
      insight_value->>'insightKey',
      insight_value->>'title',
      insight_value->>'summary',
      insight_value->>'explanation',
      (insight_value->>'confidenceLevel')::public.hpi_confidence_level,
      (insight_value->>'confidenceScore')::numeric,
      coalesce(insight_value->'confidenceFactors', '[]'::jsonb),
      'draft',
      (insight_value->>'sensitivity')::public.hpi_sensitivity_level,
      request_row.interpretation_schema_version,
      insight_value->>'confirmationQuestion',
      coalesce((insight_value->>'ageAppropriate')::boolean, false),
      jsonb_build_object('profile_section', insight_value->>'profileSection')
    ) returning id into insight_id;

    for evidence_value in select value from jsonb_array_elements(insight_value->'evidence')
    loop
      evidence_id := (evidence_value->>'evidenceId')::uuid;
      if not exists (
        select 1 from public.interpretation_request_evidence
        where interpretation_request_id = request_row.id
          and evidence_record_id = evidence_id
      ) then
        raise exception 'HPI_OUTPUT_UNKNOWN_EVIDENCE' using errcode = 'P0001';
      end if;
      insert into public.insight_evidence_links (
        insight_id, evidence_record_id, support_type, support_weight, explanation
      ) values (
        insight_id,
        evidence_id,
        (evidence_value->>'supportType')::public.hpi_support_type,
        (evidence_value->>'weight')::numeric,
        evidence_value->>'explanation'
      );
    end loop;

    for uncertainty_value in select value from jsonb_array_elements(insight_value->'uncertainties')
    loop
      insert into public.insight_uncertainties (
        insight_id, uncertainty_type, description
      ) values (
        insight_id,
        (uncertainty_value->>'type')::public.hpi_uncertainty_type,
        uncertainty_value->>'description'
      );
    end loop;

    update public.potential_insights set status = 'active', updated_at = now()
    where id = insight_id;

    insert into public.human_potential_profile_items (
      profile_version_id, insight_id, display_order, visibility
    ) values (profile_id, insight_id, display_order_value, 'private');
    display_order_value := display_order_value + 1;
  end loop;

  update public.human_potential_profile_versions
  set status = 'superseded', superseded_at = now()
  where user_id = request_row.user_id
    and id <> profile_id
    and status = 'active';

  update public.human_potential_profile_versions
  set status = 'active', activated_at = now()
  where id = profile_id and status = 'draft';

  update public.interpretation_requests
  set status = 'completed', completed_at = now(), updated_at = now()
  where id = request_row.id;

  insert into public.identity_audit_events (user_id, operation, result, metadata)
  values (
    request_row.user_id,
    'hpi_profile_generated',
    'success',
    jsonb_build_object('request_id', request_row.id, 'profile_version_id', profile_id)
  );

  return profile_id;
end;
$$;

revoke all on function public.claim_stage4_interpretation_request(uuid, text, text) from public, anon, authenticated;
revoke all on function public.fail_stage4_interpretation_request(uuid, text, text) from public, anon, authenticated;
revoke all on function public.persist_stage4_human_potential_profile(uuid, text, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.claim_stage4_interpretation_request(uuid, text, text) to service_role;
grant execute on function public.fail_stage4_interpretation_request(uuid, text, text) to service_role;
grant execute on function public.persist_stage4_human_potential_profile(uuid, text, jsonb, jsonb) to service_role;

