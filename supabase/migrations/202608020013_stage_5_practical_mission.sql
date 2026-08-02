-- Stage 5: practical, private mission generation and one-active-mission lifecycle.

create type public.mission_status as enum ('draft', 'active', 'paused', 'completed', 'replaced');
create type public.mission_request_status as enum ('ready', 'processing', 'completed', 'failed');
create type public.mission_generation_kind as enum ('initial', 'regenerate', 'refine');

create table public.mission_generation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  human_potential_profile_id uuid not null references public.human_potential_profile_versions(id) on delete restrict,
  source_mission_id uuid,
  generation_kind public.mission_generation_kind not null,
  status public.mission_request_status not null default 'ready',
  refinement_instruction text check (refinement_instruction is null or char_length(refinement_instruction) between 3 and 240),
  provider text,
  model text,
  prompt_version text not null,
  failure_code text,
  failure_detail_safe text,
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index mission_generation_requests_running_idx
  on public.mission_generation_requests (user_id)
  where status in ('ready', 'processing');
create index mission_generation_requests_profile_idx
  on public.mission_generation_requests (human_potential_profile_id, created_at desc);

create table public.user_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  human_potential_profile_id uuid not null references public.human_potential_profile_versions(id) on delete restrict,
  generation_request_id uuid not null unique references public.mission_generation_requests(id) on delete restrict,
  replaces_mission_id uuid references public.user_missions(id) on delete restrict,
  title text not null check (char_length(title) between 3 and 100),
  mission_statement text not null check (char_length(mission_statement) between 12 and 320),
  why_this_fits text not null check (char_length(why_this_fits) between 20 and 1000),
  who_this_helps text not null check (char_length(who_this_helps) between 3 and 200),
  first_meaningful_outcome text not null check (char_length(first_meaningful_outcome) between 10 and 400),
  time_horizon text not null check (time_horizon in ('two_weeks', 'four_weeks', 'six_weeks', 'eight_weeks')),
  success_signal text not null check (char_length(success_signal) between 8 and 400),
  current_caution text not null check (char_length(current_caution) between 8 and 400),
  profile_evidence_refs uuid[] not null check (cardinality(profile_evidence_refs) between 2 and 12),
  status public.mission_status not null default 'draft',
  model text not null,
  prompt_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  activated_at timestamptz,
  completed_at timestamptz
);

alter table public.mission_generation_requests
  add constraint mission_generation_requests_source_fkey
  foreign key (source_mission_id) references public.user_missions(id) on delete restrict;

create unique index user_missions_one_active_idx
  on public.user_missions (user_id) where status = 'active';
create index user_missions_user_status_idx
  on public.user_missions (user_id, status, created_at desc);

alter table public.mission_generation_requests enable row level security;
alter table public.user_missions enable row level security;

revoke all on public.mission_generation_requests, public.user_missions from public, anon, authenticated;
grant select on public.mission_generation_requests, public.user_missions to authenticated;

create policy mission_requests_own_select on public.mission_generation_requests
  for select to authenticated using ((select auth.uid()) = user_id);
create policy missions_own_select on public.user_missions
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.create_stage5_mission_request(
  profile_id_input uuid,
  generation_kind_input public.mission_generation_kind,
  source_mission_id_input uuid default null,
  refinement_instruction_input text default null,
  prompt_version_input text default 'mission-gemini-v1'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  profile_row public.human_potential_profile_versions%rowtype;
  source_row public.user_missions%rowtype;
  latest_consent public.user_consents%rowtype;
  request_id uuid;
  attempt_count integer;
begin
  if actor is null then raise exception 'MISSION_ACCESS_DENIED' using errcode = 'P0001'; end if;

  select * into profile_row from public.human_potential_profile_versions
  where id = profile_id_input and user_id = actor and status = 'active';
  if profile_row.id is null then raise exception 'MISSION_PROFILE_REQUIRED' using errcode = 'P0001'; end if;

  select * into latest_consent from public.user_consents
  where user_id = actor and consent_type = 'ai_processing'
  order by occurred_at desc limit 1;
  if latest_consent.id is null or latest_consent.status <> 'granted' or latest_consent.withdrawn_at is not null then
    raise exception 'MISSION_CONSENT_REQUIRED' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.user_missions
    where user_id = actor
      and human_potential_profile_id = profile_id_input
      and status = 'active'
  ) then
    raise exception 'MISSION_GENERATION_DISABLED' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.mission_generation_requests where user_id = actor and status in ('ready', 'processing')) then
    raise exception 'MISSION_REQUEST_ALREADY_RUNNING' using errcode = 'P0001';
  end if;

  select count(*) into attempt_count from public.mission_generation_requests
  where user_id = actor and human_potential_profile_id = profile_id_input;
  if attempt_count >= 3 then raise exception 'MISSION_GENERATION_LIMIT_REACHED' using errcode = 'P0001'; end if;

  if generation_kind_input = 'initial' and attempt_count > 0 then
    raise exception 'MISSION_GENERATION_DISABLED' using errcode = 'P0001';
  end if;
  if generation_kind_input = 'refine' then
    if refinement_instruction_input is null or char_length(trim(refinement_instruction_input)) not between 3 and 240 then
      raise exception 'MISSION_OUTPUT_INVALID' using errcode = 'P0001';
    end if;
    select * into source_row from public.user_missions
    where id = source_mission_id_input and user_id = actor and human_potential_profile_id = profile_id_input and status = 'draft';
    if source_row.id is null then raise exception 'MISSION_NOT_FOUND' using errcode = 'P0001'; end if;
  elsif source_mission_id_input is not null or refinement_instruction_input is not null then
    raise exception 'MISSION_OUTPUT_INVALID' using errcode = 'P0001';
  end if;

  insert into public.mission_generation_requests (
    user_id, human_potential_profile_id, source_mission_id, generation_kind,
    refinement_instruction, prompt_version
  ) values (
    actor, profile_id_input, source_mission_id_input, generation_kind_input,
    nullif(trim(refinement_instruction_input), ''), prompt_version_input
  ) returning id into request_id;

  insert into public.identity_audit_events (user_id, operation, result, metadata)
  values (actor, 'mission_generation_requested', 'success', jsonb_build_object('request_id', request_id, 'kind', generation_kind_input));
  return request_id;
end;
$$;

create or replace function public.claim_stage5_mission_request(request_id_input uuid, provider_input text, model_input text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update public.mission_generation_requests set status = 'processing', provider = provider_input,
    model = model_input, started_at = now(), updated_at = now()
  where id = request_id_input and status = 'ready';
  return found;
end; $$;

create or replace function public.fail_stage5_mission_request(request_id_input uuid, failure_code_input text, failure_detail_safe_input text default null)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update public.mission_generation_requests set status = 'failed', failed_at = now(),
    failure_code = left(failure_code_input, 96),
    failure_detail_safe = nullif(left(trim(coalesce(failure_detail_safe_input, '')), 120), ''), updated_at = now()
  where id = request_id_input and status = 'processing';
  return found;
end; $$;

create or replace function public.persist_stage5_mission(request_id_input uuid, mission_input jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  request_row public.mission_generation_requests%rowtype;
  mission_id uuid;
  evidence_ref uuid;
begin
  select * into request_row from public.mission_generation_requests where id = request_id_input and status = 'processing' for update;
  if request_row.id is null then raise exception 'MISSION_SAVE_FAILED' using errcode = 'P0001'; end if;

  foreach evidence_ref in array (select array_agg(value::uuid) from jsonb_array_elements_text(mission_input->'profile_evidence_refs')) loop
    if not exists (
      select 1 from public.human_potential_profile_items item
      join public.potential_insights insight on insight.id = item.insight_id
      where item.profile_version_id = request_row.human_potential_profile_id
        and insight.id = evidence_ref and insight.user_id = request_row.user_id
    ) then raise exception 'MISSION_OUTPUT_INVALID' using errcode = 'P0001'; end if;
  end loop;

  insert into public.user_missions (
    user_id, human_potential_profile_id, generation_request_id, replaces_mission_id,
    title, mission_statement, why_this_fits, who_this_helps, first_meaningful_outcome,
    time_horizon, success_signal, current_caution, profile_evidence_refs, model, prompt_version
  ) values (
    request_row.user_id, request_row.human_potential_profile_id, request_row.id, request_row.source_mission_id,
    mission_input->>'title', mission_input->>'mission_statement', mission_input->>'why_this_fits',
    mission_input->>'who_this_helps', mission_input->>'first_meaningful_outcome', mission_input->>'time_horizon',
    mission_input->>'success_signal', mission_input->>'current_caution',
    array(select jsonb_array_elements_text(mission_input->'profile_evidence_refs')::uuid),
    request_row.model, request_row.prompt_version
  ) returning id into mission_id;

  if request_row.source_mission_id is not null then
    update public.user_missions set status = 'replaced', updated_at = now()
    where id = request_row.source_mission_id and status = 'draft';
  end if;
  update public.mission_generation_requests set status = 'completed', completed_at = now(), updated_at = now()
  where id = request_row.id;
  return mission_id;
end; $$;

create or replace function public.activate_stage5_mission(mission_id_input uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare actor uuid := auth.uid(); target public.user_missions%rowtype;
begin
  if actor is null then raise exception 'MISSION_ACCESS_DENIED' using errcode = 'P0001'; end if;
  select * into target from public.user_missions where id = mission_id_input and user_id = actor and status = 'draft' for update;
  if target.id is null then raise exception 'MISSION_NOT_FOUND' using errcode = 'P0001'; end if;
  update public.user_missions set status = 'replaced', updated_at = now()
  where user_id = actor and status = 'active' and id <> target.id;
  update public.user_missions set status = 'replaced', updated_at = now()
  where user_id = actor and human_potential_profile_id = target.human_potential_profile_id and status = 'draft' and id <> target.id;
  update public.user_missions set status = 'active', activated_at = now(), updated_at = now() where id = target.id;
  insert into public.identity_audit_events (user_id, operation, result, metadata)
  values (actor, 'mission_activated', 'success', jsonb_build_object('mission_id', target.id));
  return true;
end; $$;

revoke all on function public.create_stage5_mission_request(uuid, public.mission_generation_kind, uuid, text, text) from public, anon;
revoke all on function public.activate_stage5_mission(uuid) from public, anon;
grant execute on function public.create_stage5_mission_request(uuid, public.mission_generation_kind, uuid, text, text) to authenticated;
grant execute on function public.activate_stage5_mission(uuid) to authenticated;

revoke all on function public.claim_stage5_mission_request(uuid, text, text) from public, anon, authenticated;
revoke all on function public.fail_stage5_mission_request(uuid, text, text) from public, anon, authenticated;
revoke all on function public.persist_stage5_mission(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.claim_stage5_mission_request(uuid, text, text) to service_role;
grant execute on function public.fail_stage5_mission_request(uuid, text, text) to service_role;
grant execute on function public.persist_stage5_mission(uuid, jsonb) to service_role;
