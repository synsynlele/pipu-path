-- Stage 11 renewable Builder Journey cycle RPCs.
-- Rebuild Journey request creation so each completed cycle receives a fresh
-- three-attempt budget and only unlocks after a completed Project.
create or replace function public.create_stage6_journey_request(
  mission_id_input uuid,
  generation_kind_input public.journey_generation_kind,
  source_journey_id_input uuid default null,
  refinement_instruction_input text default null,
  prompt_version_input text default 'journey-openai-v2'
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  mission_row public.user_missions%rowtype;
  source_row public.user_journeys%rowtype;
  latest_consent public.user_consents%rowtype;
  request_id uuid;
  attempt_count integer;
  target_cycle integer := 1;
  replacement_source uuid := null;
  continuation_source uuid := null;
begin
  if actor is null then raise exception 'JOURNEY_ACCESS_DENIED' using errcode='P0001'; end if;
  select * into mission_row from public.user_missions
  where id=mission_id_input and user_id=actor and status='active';
  if mission_row.id is null then raise exception 'JOURNEY_MISSION_REQUIRED' using errcode='P0001'; end if;
  if not exists(select 1 from public.human_potential_profile_versions where id=mission_row.human_potential_profile_id and user_id=actor and status='active') then
    raise exception 'JOURNEY_PROFILE_REQUIRED' using errcode='P0001';
  end if;
  select * into latest_consent from public.user_consents
  where user_id=actor and consent_type='ai_processing'
  order by occurred_at desc limit 1;
  if latest_consent.id is null or latest_consent.status <> 'granted' or latest_consent.withdrawn_at is not null then
    raise exception 'JOURNEY_CONSENT_REQUIRED' using errcode='P0001';
  end if;
  if exists(select 1 from public.user_journeys where mission_id=mission_id_input and status='active') then
    raise exception 'JOURNEY_GENERATION_DISABLED' using errcode='P0001';
  end if;
  if exists(select 1 from public.journey_generation_requests where user_id=actor and status in ('ready','processing')) then
    raise exception 'JOURNEY_REQUEST_ALREADY_RUNNING' using errcode='P0001';
  end if;

  if generation_kind_input='continue' then
    select * into source_row from public.user_journeys
    where id=source_journey_id_input and user_id=actor and mission_id=mission_id_input and status='completed';
    if source_row.id is null then raise exception 'JOURNEY_NOT_FOUND' using errcode='P0001'; end if;
    if not exists(select 1 from public.builder_projects where user_id=actor and journey_id=source_row.id and status='completed') then
      raise exception 'JOURNEY_PROJECT_REQUIRED' using errcode='P0001';
    end if;
    if exists(select 1 from public.builder_projects where user_id=actor and status='active') then
      raise exception 'JOURNEY_PROJECT_REQUIRED' using errcode='P0001';
    end if;
    target_cycle := source_row.cycle_number + 1;
    continuation_source := source_row.id;
    if exists(select 1 from public.user_journeys where user_id=actor and mission_id=mission_id_input and cycle_number=target_cycle and status in ('draft','active')) then
      raise exception 'JOURNEY_GENERATION_DISABLED' using errcode='P0001';
    end if;
    if refinement_instruction_input is not null then raise exception 'JOURNEY_OUTPUT_INVALID' using errcode='P0001'; end if;
  elsif generation_kind_input='initial' then
    if exists(select 1 from public.user_journeys where user_id=actor and mission_id=mission_id_input) then
      raise exception 'JOURNEY_GENERATION_DISABLED' using errcode='P0001';
    end if;
    if source_journey_id_input is not null or refinement_instruction_input is not null then
      raise exception 'JOURNEY_OUTPUT_INVALID' using errcode='P0001';
    end if;
  elsif generation_kind_input='refine' then
    if refinement_instruction_input is null or char_length(trim(refinement_instruction_input)) not between 3 and 240 then
      raise exception 'JOURNEY_OUTPUT_INVALID' using errcode='P0001';
    end if;
    select * into source_row from public.user_journeys
    where id=source_journey_id_input and user_id=actor and mission_id=mission_id_input and status='draft';
    if source_row.id is null then raise exception 'JOURNEY_NOT_FOUND' using errcode='P0001'; end if;
    target_cycle := source_row.cycle_number;
    replacement_source := source_row.id;
  else
    select coalesce(max(cycle_number),1) into target_cycle from public.user_journeys
    where user_id=actor and mission_id=mission_id_input;
    if source_journey_id_input is not null or refinement_instruction_input is not null then
      raise exception 'JOURNEY_OUTPUT_INVALID' using errcode='P0001';
    end if;
  end if;

  select count(*) into attempt_count from public.journey_generation_requests
  where user_id=actor and mission_id=mission_id_input and cycle_number=target_cycle;
  if attempt_count >= 3 then raise exception 'JOURNEY_GENERATION_LIMIT_REACHED' using errcode='P0001'; end if;

  insert into public.journey_generation_requests(
    user_id,mission_id,source_journey_id,continues_journey_id,cycle_number,
    generation_kind,refinement_instruction,prompt_version
  ) values(
    actor,mission_id_input,replacement_source,continuation_source,target_cycle,
    generation_kind_input,nullif(trim(refinement_instruction_input),''),prompt_version_input
  ) returning id into request_id;
  insert into public.identity_audit_events(user_id,operation,result,metadata)
  values(actor,'journey_generation_requested','success',jsonb_build_object(
    'request_id',request_id,'kind',generation_kind_input,'cycle_number',target_cycle
  ));
  return request_id;
end;
$$;

create or replace function public.persist_stage6_journey(request_id_input uuid, journey_input jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.journey_generation_requests%rowtype;
  journey_id uuid;
  milestone jsonb;
  expected_order integer := 1;
begin
  select * into request_row from public.journey_generation_requests
  where id=request_id_input and status='processing' for update;
  if request_row.id is null then raise exception 'JOURNEY_SAVE_FAILED' using errcode='P0001'; end if;
  if jsonb_array_length(journey_input->'milestones') not between 4 and 6 then
    raise exception 'JOURNEY_OUTPUT_INVALID' using errcode='P0001';
  end if;
  insert into public.user_journeys(
    user_id,mission_id,generation_request_id,replaces_journey_id,continues_journey_id,
    cycle_number,title,summary,target_outcome,suggested_duration,model,prompt_version
  ) values(
    request_row.user_id,request_row.mission_id,request_row.id,request_row.source_journey_id,
    request_row.continues_journey_id,request_row.cycle_number,
    journey_input->>'title',journey_input->>'summary',journey_input->>'target_outcome',
    journey_input->>'suggested_duration',request_row.model,request_row.prompt_version
  ) returning id into journey_id;
  for milestone in select value from jsonb_array_elements(journey_input->'milestones') loop
    if (milestone->>'sequence_order')::integer <> expected_order then
      raise exception 'JOURNEY_OUTPUT_INVALID' using errcode='P0001';
    end if;
    insert into public.journey_milestones(
      journey_id,title,purpose,expected_outcome,suggested_duration,
      capabilities_to_develop,completion_signal,resource_note,sequence_order
    ) values(
      journey_id,milestone->>'title',milestone->>'purpose',milestone->>'expected_outcome',
      milestone->>'suggested_duration',array(select jsonb_array_elements_text(milestone->'capabilities_to_develop')),
      milestone->>'completion_signal',milestone->>'resource_note',expected_order
    );
    expected_order := expected_order + 1;
  end loop;
  if request_row.source_journey_id is not null then
    update public.user_journeys set status='replaced',replaced_at=now(),updated_at=now()
    where id=request_row.source_journey_id and status='draft';
  end if;
  update public.journey_generation_requests set status='completed',completed_at=now(),updated_at=now()
  where id=request_row.id;
  return journey_id;
end;
$$;
