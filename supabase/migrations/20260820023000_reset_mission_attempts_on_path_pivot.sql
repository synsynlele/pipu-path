-- Reset Mission generation attempts when the Builder selects or changes Path.
-- A Path is a new experiment cycle even when the Human Potential Profile stays the same.

create or replace function public.create_stage5_mission_request(
  profile_id_input uuid,
  generation_kind_input public.mission_generation_kind,
  source_mission_id_input uuid default null::uuid,
  refinement_instruction_input text default null::text,
  prompt_version_input text default 'mission-gemini-v1'::text
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  actor uuid := auth.uid();
  profile_row public.human_potential_profile_versions%rowtype;
  source_row public.user_missions%rowtype;
  latest_consent public.user_consents%rowtype;
  request_id uuid;
  attempt_count integer;
  current_path_selected_at timestamptz;
begin
  if actor is null then
    raise exception 'MISSION_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select * into profile_row
  from public.human_potential_profile_versions
  where id = profile_id_input
    and user_id = actor
    and status = 'active';
  if profile_row.id is null then
    raise exception 'MISSION_PROFILE_REQUIRED' using errcode = 'P0001';
  end if;

  select * into latest_consent
  from public.user_consents
  where user_id = actor
    and consent_type = 'ai_processing'
  order by occurred_at desc
  limit 1;
  if latest_consent.id is null
    or latest_consent.status <> 'granted'
    or latest_consent.withdrawn_at is not null then
    raise exception 'MISSION_CONSENT_REQUIRED' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.user_missions
    where user_id = actor
      and human_potential_profile_id = profile_id_input
      and status = 'active'
  ) then
    raise exception 'MISSION_GENERATION_DISABLED' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.mission_generation_requests
    where user_id = actor
      and status in ('ready', 'processing')
  ) then
    raise exception 'MISSION_REQUEST_ALREADY_RUNNING' using errcode = 'P0001';
  end if;

  select selected_at
  into current_path_selected_at
  from public.economic_pathway_recommendations
  where user_id = actor
    and human_potential_profile_id = profile_id_input
    and selected_path_key is not null
  order by created_at desc
  limit 1;

  select count(*)
  into attempt_count
  from public.mission_generation_requests
  where user_id = actor
    and human_potential_profile_id = profile_id_input
    and (
      current_path_selected_at is null
      or created_at >= current_path_selected_at
    );

  if attempt_count >= 3 then
    raise exception 'MISSION_GENERATION_LIMIT_REACHED' using errcode = 'P0001';
  end if;

  if generation_kind_input = 'initial' and attempt_count > 0 then
    raise exception 'MISSION_GENERATION_DISABLED' using errcode = 'P0001';
  end if;

  if generation_kind_input = 'refine' then
    if refinement_instruction_input is null
      or char_length(trim(refinement_instruction_input)) not between 3 and 240 then
      raise exception 'MISSION_OUTPUT_INVALID' using errcode = 'P0001';
    end if;

    select * into source_row
    from public.user_missions
    where id = source_mission_id_input
      and user_id = actor
      and human_potential_profile_id = profile_id_input
      and status = 'draft';
    if source_row.id is null then
      raise exception 'MISSION_NOT_FOUND' using errcode = 'P0001';
    end if;
  elsif source_mission_id_input is not null
    or refinement_instruction_input is not null then
    raise exception 'MISSION_OUTPUT_INVALID' using errcode = 'P0001';
  end if;

  insert into public.mission_generation_requests (
    user_id,
    human_potential_profile_id,
    source_mission_id,
    generation_kind,
    refinement_instruction,
    prompt_version
  ) values (
    actor,
    profile_id_input,
    source_mission_id_input,
    generation_kind_input,
    nullif(trim(refinement_instruction_input), ''),
    prompt_version_input
  )
  returning id into request_id;

  insert into public.identity_audit_events (user_id, operation, result, metadata)
  values (
    actor,
    'mission_generation_requested',
    'success',
    jsonb_build_object(
      'request_id', request_id,
      'kind', generation_kind_input,
      'path_selected_at', current_path_selected_at
    )
  );

  return request_id;
end;
$function$;

revoke all on function public.create_stage5_mission_request(
  uuid,
  public.mission_generation_kind,
  uuid,
  text,
  text
) from public;
revoke all on function public.create_stage5_mission_request(
  uuid,
  public.mission_generation_kind,
  uuid,
  text,
  text
) from anon;
grant execute on function public.create_stage5_mission_request(
  uuid,
  public.mission_generation_kind,
  uuid,
  text,
  text
) to authenticated;
grant execute on function public.create_stage5_mission_request(
  uuid,
  public.mission_generation_kind,
  uuid,
  text,
  text
) to service_role;
