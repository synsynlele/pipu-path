-- Stage 6: private practical Journey lifecycle. AI writes remain service-role-only.
create type public.journey_status as enum ('draft', 'active', 'paused', 'completed', 'replaced');
create type public.journey_milestone_status as enum ('locked', 'available', 'active', 'completed');
create type public.journey_request_status as enum ('ready', 'processing', 'completed', 'failed');
create type public.journey_generation_kind as enum ('initial', 'regenerate', 'refine');

create table public.journey_generation_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  mission_id uuid not null references public.user_missions(id) on delete restrict, source_journey_id uuid,
  generation_kind public.journey_generation_kind not null, status public.journey_request_status not null default 'ready',
  refinement_instruction text check (refinement_instruction is null or char_length(refinement_instruction) between 3 and 240),
  provider text, model text, prompt_version text not null, failure_code text, failure_detail_safe text,
  requested_at timestamptz not null default now(), started_at timestamptz, completed_at timestamptz, failed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.user_journeys (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  mission_id uuid not null references public.user_missions(id) on delete restrict,
  generation_request_id uuid not null unique references public.journey_generation_requests(id) on delete restrict,
  replaces_journey_id uuid references public.user_journeys(id) on delete restrict,
  title text not null check (char_length(title) between 3 and 100), summary text not null check (char_length(summary) between 20 and 800),
  target_outcome text not null check (char_length(target_outcome) between 10 and 400),
  suggested_duration text not null check (suggested_duration in ('two_weeks','four_weeks','six_weeks','eight_weeks','twelve_weeks')),
  status public.journey_status not null default 'draft', model text not null, prompt_version text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), activated_at timestamptz,
  completed_at timestamptz, replaced_at timestamptz
);
alter table public.journey_generation_requests add constraint journey_requests_source_fkey foreign key (source_journey_id) references public.user_journeys(id) on delete restrict;

create table public.journey_milestones (
  id uuid primary key default gen_random_uuid(), journey_id uuid not null references public.user_journeys(id) on delete cascade,
  title text not null, purpose text not null, expected_outcome text not null, suggested_duration text not null,
  capabilities_to_develop text[] not null check (cardinality(capabilities_to_develop) between 1 and 6),
  completion_signal text not null, resource_note text not null, sequence_order smallint not null check (sequence_order between 1 and 6),
  status public.journey_milestone_status not null default 'locked', created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), started_at timestamptz, completed_at timestamptz,
  unique (journey_id, sequence_order)
);

create unique index journey_requests_running_idx on public.journey_generation_requests(user_id) where status in ('ready','processing');
create unique index user_journeys_one_active_mission_idx on public.user_journeys(mission_id) where status = 'active';
create index journey_milestones_order_idx on public.journey_milestones(journey_id, sequence_order);

alter table public.journey_generation_requests enable row level security;
alter table public.user_journeys enable row level security;
alter table public.journey_milestones enable row level security;
revoke all on public.journey_generation_requests, public.user_journeys, public.journey_milestones from public, anon, authenticated;
grant select on public.journey_generation_requests, public.user_journeys, public.journey_milestones to authenticated;
create policy journey_requests_own_select on public.journey_generation_requests for select to authenticated using ((select auth.uid()) = user_id);
create policy journeys_own_select on public.user_journeys for select to authenticated using ((select auth.uid()) = user_id);
create policy journey_milestones_own_select on public.journey_milestones for select to authenticated using (exists (select 1 from public.user_journeys j where j.id = journey_id and j.user_id = (select auth.uid())));

create or replace function public.create_stage6_journey_request(
  mission_id_input uuid,
  generation_kind_input public.journey_generation_kind,
  source_journey_id_input uuid default null,
  refinement_instruction_input text default null,
  prompt_version_input text default 'journey-gemini-v1'
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  actor uuid := auth.uid(); mission_row public.user_missions%rowtype;
  source_row public.user_journeys%rowtype; latest_consent public.user_consents%rowtype;
  request_id uuid; attempt_count integer;
begin
  if actor is null then raise exception 'JOURNEY_ACCESS_DENIED' using errcode='P0001'; end if;
  select * into mission_row from public.user_missions where id=mission_id_input and user_id=actor and status='active';
  if mission_row.id is null then raise exception 'JOURNEY_MISSION_REQUIRED' using errcode='P0001'; end if;
  if not exists(select 1 from public.human_potential_profile_versions where id=mission_row.human_potential_profile_id and user_id=actor and status='active') then
    raise exception 'JOURNEY_PROFILE_REQUIRED' using errcode='P0001';
  end if;
  select * into latest_consent from public.user_consents where user_id=actor and consent_type='ai_processing' order by occurred_at desc limit 1;
  if latest_consent.id is null or latest_consent.status <> 'granted' or latest_consent.withdrawn_at is not null then
    raise exception 'JOURNEY_CONSENT_REQUIRED' using errcode='P0001';
  end if;
  if exists(select 1 from public.user_journeys where mission_id=mission_id_input and status='active') then
    raise exception 'JOURNEY_GENERATION_DISABLED' using errcode='P0001';
  end if;
  if exists(select 1 from public.journey_generation_requests where user_id=actor and status in ('ready','processing')) then
    raise exception 'JOURNEY_REQUEST_ALREADY_RUNNING' using errcode='P0001';
  end if;
  select count(*) into attempt_count from public.journey_generation_requests where user_id=actor and mission_id=mission_id_input;
  if attempt_count >= 3 then raise exception 'JOURNEY_GENERATION_LIMIT_REACHED' using errcode='P0001'; end if;
  if generation_kind_input='initial' and attempt_count>0 then raise exception 'JOURNEY_GENERATION_DISABLED' using errcode='P0001'; end if;
  if generation_kind_input='refine' then
    if refinement_instruction_input is null or char_length(trim(refinement_instruction_input)) not between 3 and 240 then
      raise exception 'JOURNEY_OUTPUT_INVALID' using errcode='P0001';
    end if;
    select * into source_row from public.user_journeys where id=source_journey_id_input and user_id=actor and mission_id=mission_id_input and status='draft';
    if source_row.id is null then raise exception 'JOURNEY_NOT_FOUND' using errcode='P0001'; end if;
  elsif source_journey_id_input is not null or refinement_instruction_input is not null then
    raise exception 'JOURNEY_OUTPUT_INVALID' using errcode='P0001';
  end if;
  insert into public.journey_generation_requests(user_id,mission_id,source_journey_id,generation_kind,refinement_instruction,prompt_version)
  values(actor,mission_id_input,source_journey_id_input,generation_kind_input,nullif(trim(refinement_instruction_input),''),prompt_version_input)
  returning id into request_id;
  insert into public.identity_audit_events(user_id,operation,result,metadata)
  values(actor,'journey_generation_requested','success',jsonb_build_object('request_id',request_id,'kind',generation_kind_input));
  return request_id;
end $$;

create or replace function public.claim_stage6_journey_request(request_id_input uuid, provider_input text, model_input text)
returns boolean language plpgsql security definer set search_path=public as $$
begin
  update public.journey_generation_requests set status='processing',provider=provider_input,model=model_input,started_at=now(),updated_at=now()
  where id=request_id_input and status='ready'; return found;
end $$;

create or replace function public.fail_stage6_journey_request(request_id_input uuid, failure_code_input text, failure_detail_safe_input text default null)
returns boolean language plpgsql security definer set search_path=public as $$
begin
  update public.journey_generation_requests set status='failed',failed_at=now(),failure_code=left(failure_code_input,96),
  failure_detail_safe=nullif(left(trim(coalesce(failure_detail_safe_input,'')),120),''),updated_at=now()
  where id=request_id_input and status='processing'; return found;
end $$;

create or replace function public.persist_stage6_journey(request_id_input uuid, journey_input jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare request_row public.journey_generation_requests%rowtype; journey_id uuid; milestone jsonb; expected_order integer := 1;
begin
  select * into request_row from public.journey_generation_requests where id=request_id_input and status='processing' for update;
  if request_row.id is null then raise exception 'JOURNEY_SAVE_FAILED' using errcode='P0001'; end if;
  if jsonb_array_length(journey_input->'milestones') not between 4 and 6 then raise exception 'JOURNEY_OUTPUT_INVALID' using errcode='P0001'; end if;
  insert into public.user_journeys(user_id,mission_id,generation_request_id,replaces_journey_id,title,summary,target_outcome,suggested_duration,model,prompt_version)
  values(request_row.user_id,request_row.mission_id,request_row.id,request_row.source_journey_id,journey_input->>'title',journey_input->>'summary',journey_input->>'target_outcome',journey_input->>'suggested_duration',request_row.model,request_row.prompt_version)
  returning id into journey_id;
  for milestone in select value from jsonb_array_elements(journey_input->'milestones') loop
    if (milestone->>'sequence_order')::integer <> expected_order then raise exception 'JOURNEY_OUTPUT_INVALID' using errcode='P0001'; end if;
    insert into public.journey_milestones(journey_id,title,purpose,expected_outcome,suggested_duration,capabilities_to_develop,completion_signal,resource_note,sequence_order)
    values(journey_id,milestone->>'title',milestone->>'purpose',milestone->>'expected_outcome',milestone->>'suggested_duration',array(select jsonb_array_elements_text(milestone->'capabilities_to_develop')),milestone->>'completion_signal',milestone->>'resource_note',expected_order);
    expected_order := expected_order + 1;
  end loop;
  if request_row.source_journey_id is not null then update public.user_journeys set status='replaced',replaced_at=now(),updated_at=now() where id=request_row.source_journey_id and status='draft'; end if;
  update public.journey_generation_requests set status='completed',completed_at=now(),updated_at=now() where id=request_row.id;
  return journey_id;
end $$;

create or replace function public.activate_stage6_journey(journey_id_input uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare actor uuid := auth.uid(); target public.user_journeys%rowtype;
begin
  if actor is null then raise exception 'JOURNEY_ACCESS_DENIED' using errcode='P0001'; end if;
  select * into target from public.user_journeys where id=journey_id_input and user_id=actor and status='draft' for update;
  if target.id is null then raise exception 'JOURNEY_NOT_FOUND' using errcode='P0001'; end if;
  if not exists(select 1 from public.user_missions where id=target.mission_id and user_id=actor and status='active') then raise exception 'JOURNEY_MISSION_REQUIRED' using errcode='P0001'; end if;
  update public.user_journeys set status='replaced', replaced_at=now(), updated_at=now() where mission_id=target.mission_id and id<>target.id and status in ('active','draft');
  update public.user_journeys set status='active', activated_at=now(), updated_at=now() where id=target.id;
  update public.journey_milestones set status=case when sequence_order=1 then 'available'::public.journey_milestone_status else 'locked'::public.journey_milestone_status end, updated_at=now() where journey_id=target.id;
  insert into public.identity_audit_events(user_id,operation,result,metadata) values(actor,'journey_activated','success',jsonb_build_object('journey_id',target.id));
  return true;
end $$;
revoke all on function public.activate_stage6_journey(uuid) from public, anon;
grant execute on function public.activate_stage6_journey(uuid) to authenticated;

revoke all on function public.create_stage6_journey_request(uuid,public.journey_generation_kind,uuid,text,text) from public,anon;
grant execute on function public.create_stage6_journey_request(uuid,public.journey_generation_kind,uuid,text,text) to authenticated;
revoke all on function public.claim_stage6_journey_request(uuid,text,text) from public,anon,authenticated;
revoke all on function public.fail_stage6_journey_request(uuid,text,text) from public,anon,authenticated;
revoke all on function public.persist_stage6_journey(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.claim_stage6_journey_request(uuid,text,text) to service_role;
grant execute on function public.fail_stage6_journey_request(uuid,text,text) to service_role;
grant execute on function public.persist_stage6_journey(uuid,jsonb) to service_role;
