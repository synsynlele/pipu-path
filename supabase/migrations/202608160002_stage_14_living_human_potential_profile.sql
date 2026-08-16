-- Stage 14: Living Human Potential Profile.
--
-- The profile already supports immutable versions and evidence provenance. This
-- migration makes that foundation compound by capturing two additional private
-- evidence sources:
--   1. completed Builder Projects (observed real-world action), and
--   2. explicit feedback the Builder gives on a prior profile insight.
--
-- No new public profile surface is created. Evidence remains owner-readable and
-- system-managed under the existing Stage 4 RLS/grant boundary.

create or replace function public.capture_stage14_builder_project_evidence(
  project_id_input uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  project_row public.builder_projects%rowtype;
  profile_age public.age_band;
  evidence_text text;
  content_hash_value text;
  evidence_id uuid;
begin
  select * into project_row
  from public.builder_projects
  where id = project_id_input
    and status = 'completed'
    and completed_at is not null;

  if project_row.id is null then
    return null;
  end if;

  select age_band into profile_age
  from public.profiles
  where id = project_row.user_id;

  select left(
    concat_ws(
      ' ',
      'Completed Builder Project:', project_row.title || '.',
      'Problem addressed:', project_row.problem_statement,
      'People served:', project_row.people_served,
      'Intended outcome:', project_row.desired_outcome,
      'Smallest useful version:', project_row.smallest_useful_version,
      'Success signal:', project_row.success_signal,
      coalesce(
        (
          select string_agg(
            'Milestone evidence: ' || left(update_row.proof_text, 260),
            ' ' order by update_row.created_at
          )
          from public.builder_project_updates update_row
          where update_row.project_id = project_row.id
            and update_row.user_id = project_row.user_id
            and update_row.marks_milestone_complete
        ),
        ''
      )
    ),
    1200
  ) into evidence_text;

  content_hash_value := encode(
    digest(
      concat_ws(
        chr(31),
        project_row.user_id::text,
        project_row.id::text,
        coalesce(project_row.completed_at::text, ''),
        evidence_text
      ),
      'sha256'
    ),
    'hex'
  );

  insert into public.evidence_records (
    user_id,
    source_type,
    source_id,
    source_version,
    source_key,
    category,
    subcategory,
    content_summary,
    structured_value,
    sensitivity_level,
    age_restriction,
    evidence_status,
    occurred_at,
    content_hash,
    metadata
  ) values (
    project_row.user_id,
    'builder_project'::public.hpi_evidence_source_type,
    project_row.id,
    1,
    'completed_builder_project',
    'capability'::public.hpi_evidence_category,
    'real_world_project_completion',
    left(project_row.title, 240),
    jsonb_build_object(
      'response_type', 'reflection',
      'text', evidence_text
    ),
    'standard'::public.hpi_sensitivity_level,
    profile_age,
    'eligible'::public.hpi_evidence_status,
    project_row.completed_at,
    content_hash_value,
    jsonb_build_object(
      'response_type', 'reflection',
      'evidence_kind', 'builder_project_completion',
      'project_id', project_row.id,
      'journey_id', project_row.journey_id,
      'mission_id', project_row.mission_id
    )
  )
  on conflict (user_id, source_type, source_id, source_version, content_hash)
  do update set
    evidence_status = 'eligible',
    updated_at = now()
  returning id into evidence_id;

  insert into public.identity_audit_events (user_id, operation, result, metadata)
  values (
    project_row.user_id,
    'hpi_builder_project_evidence_captured',
    'success',
    jsonb_build_object(
      'project_id', project_row.id,
      'evidence_record_id', evidence_id
    )
  );

  return evidence_id;
end;
$$;

create or replace function public.capture_stage14_profile_feedback_evidence(
  feedback_id_input uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  feedback_row public.insight_user_feedback%rowtype;
  insight_row public.potential_insights%rowtype;
  profile_age public.age_band;
  evidence_text text;
  content_hash_value text;
  evidence_id uuid;
begin
  select * into feedback_row
  from public.insight_user_feedback
  where id = feedback_id_input;

  if feedback_row.id is null
    or feedback_row.feedback_type::text = 'unsure' then
    return null;
  end if;

  select * into insight_row
  from public.potential_insights
  where id = feedback_row.insight_id
    and user_id = feedback_row.user_id;

  if insight_row.id is null then
    return null;
  end if;

  select age_band into profile_age
  from public.profiles
  where id = feedback_row.user_id;

  evidence_text := left(
    concat_ws(
      ' ',
      'The Builder reviewed a prior Human Potential Profile insight.',
      'Insight:', insight_row.title || '.',
      'Feedback:', replace(feedback_row.feedback_type::text, '_', ' ') || '.',
      case
        when nullif(trim(coalesce(feedback_row.reason, '')), '') is not null
          then 'Builder context: ' || trim(feedback_row.reason)
        else null
      end,
      case
        when nullif(trim(coalesce(feedback_row.replacement_text, '')), '') is not null
          then 'Builder correction: ' || trim(feedback_row.replacement_text)
        else null
      end
    ),
    1200
  );

  content_hash_value := encode(
    digest(
      concat_ws(
        chr(31),
        feedback_row.user_id::text,
        feedback_row.id::text,
        feedback_row.insight_id::text,
        feedback_row.feedback_type::text,
        coalesce(feedback_row.reason, ''),
        coalesce(feedback_row.replacement_text, '')
      ),
      'sha256'
    ),
    'hex'
  );

  insert into public.evidence_records (
    user_id,
    source_type,
    source_id,
    source_version,
    source_key,
    category,
    subcategory,
    content_summary,
    structured_value,
    sensitivity_level,
    age_restriction,
    evidence_status,
    occurred_at,
    content_hash,
    metadata
  ) values (
    feedback_row.user_id,
    'profile_feedback'::public.hpi_evidence_source_type,
    feedback_row.id,
    1,
    'profile_feedback',
    'current_reality'::public.hpi_evidence_category,
    'explicit_builder_feedback',
    left('Profile feedback: ' || insight_row.title, 240),
    jsonb_build_object(
      'response_type', 'reflection',
      'text', evidence_text
    ),
    'standard'::public.hpi_sensitivity_level,
    profile_age,
    'eligible'::public.hpi_evidence_status,
    feedback_row.created_at,
    content_hash_value,
    jsonb_build_object(
      'response_type', 'reflection',
      'evidence_kind', 'profile_feedback',
      'feedback_type', feedback_row.feedback_type,
      'prior_insight_id', insight_row.id
    )
  )
  on conflict (user_id, source_type, source_id, source_version, content_hash)
  do update set
    evidence_status = 'eligible',
    updated_at = now()
  returning id into evidence_id;

  insert into public.identity_audit_events (user_id, operation, result, metadata)
  values (
    feedback_row.user_id,
    'hpi_profile_feedback_evidence_captured',
    'success',
    jsonb_build_object(
      'feedback_id', feedback_row.id,
      'evidence_record_id', evidence_id
    )
  );

  return evidence_id;
end;
$$;

create or replace function public.capture_stage14_builder_project_evidence_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.capture_stage14_builder_project_evidence(new.id);
  return new;
end;
$$;

create or replace function public.capture_stage14_profile_feedback_evidence_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.capture_stage14_profile_feedback_evidence(new.id);
  return new;
end;
$$;

drop trigger if exists stage14_builder_project_evidence_on_complete
  on public.builder_projects;
create trigger stage14_builder_project_evidence_on_complete
after update of status on public.builder_projects
for each row
when (
  old.status is distinct from new.status
  and new.status = 'completed'
)
execute function public.capture_stage14_builder_project_evidence_trigger();

drop trigger if exists stage14_profile_feedback_evidence_on_insert
  on public.insight_user_feedback;
create trigger stage14_profile_feedback_evidence_on_insert
after insert on public.insight_user_feedback
for each row
execute function public.capture_stage14_profile_feedback_evidence_trigger();

-- Existing users must benefit from Stage 14 without repeating work or feedback.
do $$
declare
  project_id_value uuid;
  feedback_id_value uuid;
begin
  for project_id_value in
    select id
    from public.builder_projects
    where status = 'completed'
      and completed_at is not null
  loop
    perform public.capture_stage14_builder_project_evidence(project_id_value);
  end loop;

  for feedback_id_value in
    select id
    from public.insight_user_feedback
    where feedback_type::text <> 'unsure'
  loop
    perform public.capture_stage14_profile_feedback_evidence(feedback_id_value);
  end loop;
end;
$$;

-- Keep the original RPC name and permissions so the application contract does
-- not fork. The only Stage 14 change is a bounded, provenance-preserving
-- evidence snapshot: all Discovery baseline evidence plus the newest real-world
-- and feedback evidence, capped at the provider contract's 100-record limit.
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
  if idempotency_key_input is null
    or length(interpretation_schema_version_input) = 0
    or length(prompt_version_input) = 0 then
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
  select
    request_id,
    evidence.id,
    case evidence.source_key
      when 'completed_builder_project' then 'Completed Builder Project evidence'
      when 'profile_feedback' then 'Explicit Builder feedback on a prior profile'
      else 'Completed Discovery evidence'
    end,
    evidence.source_version
  from public.evidence_records evidence
  where evidence.user_id = actor
    and evidence.evidence_status = 'eligible'
  order by
    case when evidence.source_type = 'discovery_response' then 0 else 1 end,
    case when evidence.source_type = 'discovery_response' then evidence.captured_at end asc,
    evidence.captured_at desc
  limit 100
  on conflict do nothing;

  if not exists (
    select 1
    from public.interpretation_request_evidence
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

revoke all on function public.capture_stage14_builder_project_evidence(uuid)
  from public, anon, authenticated;
revoke all on function public.capture_stage14_profile_feedback_evidence(uuid)
  from public, anon, authenticated;
revoke all on function public.capture_stage14_builder_project_evidence_trigger()
  from public, anon, authenticated;
revoke all on function public.capture_stage14_profile_feedback_evidence_trigger()
  from public, anon, authenticated;

revoke all on function public.create_stage4_interpretation_request(uuid, text, text)
  from public, anon;
grant execute on function public.create_stage4_interpretation_request(uuid, text, text)
  to authenticated;
