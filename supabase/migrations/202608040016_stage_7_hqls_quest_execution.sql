-- Stage 7: private HQLS Quest execution, evidence, reflection and idempotent XP.
create type public.quest_request_status as enum ('ready', 'processing', 'completed', 'failed');
create type public.quest_status as enum ('locked', 'available', 'active', 'evidence_submitted', 'completed');

create table public.quest_generation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  journey_id uuid not null references public.user_journeys(id) on delete cascade,
  milestone_id uuid not null references public.journey_milestones(id) on delete cascade,
  status public.quest_request_status not null default 'ready',
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

create table public.user_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  journey_id uuid not null references public.user_journeys(id) on delete cascade,
  milestone_id uuid not null references public.journey_milestones(id) on delete cascade,
  generation_request_id uuid not null references public.quest_generation_requests(id) on delete restrict,
  title text not null check (char_length(title) between 3 and 100),
  real_world_outcome text not null check (char_length(real_world_outcome) between 10 and 400),
  why_it_matters text not null check (char_length(why_it_matters) between 10 and 500),
  estimated_minutes smallint not null check (estimated_minutes between 15 and 240),
  action_steps text[] not null check (cardinality(action_steps) between 3 and 6),
  resources_needed text[] not null check (cardinality(resources_needed) between 0 and 6),
  low_resource_alternative text not null check (char_length(low_resource_alternative) between 10 and 400),
  evidence_requirements text[] not null check (cardinality(evidence_requirements) between 1 and 4),
  safety_guidance text not null check (char_length(safety_guidance) between 8 and 400),
  completion_criteria text not null check (char_length(completion_criteria) between 10 and 400),
  reflection_prompts text[] not null check (cardinality(reflection_prompts) = 4),
  sequence_order smallint not null check (sequence_order between 1 and 3),
  status public.quest_status not null default 'locked',
  xp_value smallint not null default 50 check (xp_value = 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  evidence_submitted_at timestamptz,
  completed_at timestamptz,
  unique (milestone_id, sequence_order)
);

create table public.quest_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quest_id uuid not null unique references public.user_quests(id) on delete cascade,
  evidence_text text not null check (char_length(evidence_text) between 20 and 2000),
  evidence_link text check (evidence_link is null or (char_length(evidence_link) between 8 and 500 and evidence_link ~* '^https?://')),
  image_path text check (image_path is null or char_length(image_path) between 10 and 500),
  happened_on date not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quest_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quest_id uuid not null unique references public.user_quests(id) on delete cascade,
  what_i_did text not null check (char_length(what_i_did) between 20 and 1200),
  what_happened text not null check (char_length(what_happened) between 20 and 1200),
  what_i_learned text not null check (char_length(what_i_learned) between 20 and 1200),
  what_i_will_change text not null check (char_length(what_i_will_change) between 20 and 1200),
  nortnspoil_reflection text not null check (char_length(nortnspoil_reflection) between 20 and 1200),
  created_at timestamptz not null default now()
);

create table public.builder_xp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quest_id uuid not null unique references public.user_quests(id) on delete restrict,
  amount smallint not null check (amount = 50),
  reason text not null check (reason = 'quest_completion'),
  created_at timestamptz not null default now()
);

create unique index quest_requests_running_user_idx on public.quest_generation_requests(user_id) where status in ('ready', 'processing');
create unique index user_quests_one_active_idx on public.user_quests(user_id) where status in ('active', 'evidence_submitted');
create index quest_requests_milestone_idx on public.quest_generation_requests(milestone_id, requested_at desc);
create index user_quests_milestone_order_idx on public.user_quests(milestone_id, sequence_order);
create index user_quests_journey_idx on public.user_quests(journey_id);
create index quest_evidence_user_idx on public.quest_evidence(user_id);
create index quest_reflections_user_idx on public.quest_reflections(user_id);
create index builder_xp_user_created_idx on public.builder_xp_transactions(user_id, created_at desc);

alter table public.quest_generation_requests enable row level security;
alter table public.user_quests enable row level security;
alter table public.quest_evidence enable row level security;
alter table public.quest_reflections enable row level security;
alter table public.builder_xp_transactions enable row level security;

revoke all on public.quest_generation_requests, public.user_quests, public.quest_evidence, public.quest_reflections, public.builder_xp_transactions from public, anon, authenticated;
grant select on public.quest_generation_requests, public.user_quests, public.quest_evidence, public.quest_reflections, public.builder_xp_transactions to authenticated;

create policy quest_requests_own_select on public.quest_generation_requests for select to authenticated using ((select auth.uid()) = user_id);
create policy user_quests_own_select on public.user_quests for select to authenticated using ((select auth.uid()) = user_id);
create policy quest_evidence_own_select on public.quest_evidence for select to authenticated using ((select auth.uid()) = user_id);
create policy quest_reflections_own_select on public.quest_reflections for select to authenticated using ((select auth.uid()) = user_id);
create policy builder_xp_own_select on public.builder_xp_transactions for select to authenticated using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('quest-evidence', 'quest-evidence', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists quest_evidence_images_select on storage.objects;
create policy quest_evidence_images_select on storage.objects for select to authenticated
using (bucket_id = 'quest-evidence' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists quest_evidence_images_insert on storage.objects;
create policy quest_evidence_images_insert on storage.objects for insert to authenticated
with check (bucket_id = 'quest-evidence' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists quest_evidence_images_delete on storage.objects;
create policy quest_evidence_images_delete on storage.objects for delete to authenticated
using (bucket_id = 'quest-evidence' and (storage.foldername(name))[1] = (select auth.uid())::text);

create or replace function public.create_stage7_quest_request(milestone_id_input uuid, prompt_version_input text default 'quest-gemini-v1') returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  actor uuid := auth.uid();
  milestone_row public.journey_milestones%rowtype;
  journey_row public.user_journeys%rowtype;
  latest_consent public.user_consents%rowtype;
  request_id uuid;
  attempt_count integer;
begin
  if actor is null then raise exception 'QUEST_ACCESS_DENIED' using errcode = 'P0001'; end if;
  select milestone.* into milestone_row
  from public.journey_milestones milestone
  join public.user_journeys journey on journey.id = milestone.journey_id
  where milestone.id = milestone_id_input
    and milestone.status in ('available', 'active')
    and journey.user_id = actor and journey.status = 'active'
  for update of milestone;
  if milestone_row.id is null then raise exception 'QUEST_MILESTONE_REQUIRED' using errcode = 'P0001'; end if;
  select * into journey_row from public.user_journeys where id = milestone_row.journey_id and user_id = actor and status = 'active';
  if journey_row.id is null then raise exception 'QUEST_JOURNEY_REQUIRED' using errcode = 'P0001'; end if;
  select * into latest_consent from public.user_consents where user_id = actor and consent_type = 'ai_processing' order by occurred_at desc limit 1;
  if latest_consent.id is null or latest_consent.status <> 'granted' or latest_consent.withdrawn_at is not null then raise exception 'QUEST_CONSENT_REQUIRED' using errcode = 'P0001'; end if;
  if exists (select 1 from public.user_quests where milestone_id = milestone_row.id) then raise exception 'QUEST_GENERATION_DISABLED' using errcode = 'P0001'; end if;
  if exists (select 1 from public.quest_generation_requests where user_id = actor and status in ('ready', 'processing')) then raise exception 'QUEST_REQUEST_ALREADY_RUNNING' using errcode = 'P0001'; end if;
  select count(*) into attempt_count from public.quest_generation_requests where user_id = actor and milestone_id = milestone_row.id;
  if attempt_count >= 3 then raise exception 'QUEST_GENERATION_LIMIT_REACHED' using errcode = 'P0001'; end if;
  insert into public.quest_generation_requests (user_id, journey_id, milestone_id, prompt_version)
  values (actor, journey_row.id, milestone_row.id, prompt_version_input) returning id into request_id;
  insert into public.identity_audit_events (user_id, operation, result, metadata)
  values (actor, 'quest_generation_requested', 'success', jsonb_build_object('request_id', request_id, 'milestone_id', milestone_row.id));
  return request_id;
end $$;

create or replace function public.claim_stage7_quest_request(request_id_input uuid, provider_input text, model_input text) returns boolean
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update public.quest_generation_requests set status = 'processing', provider = left(provider_input, 80), model = left(model_input, 120), started_at = now(), updated_at = now()
  where id = request_id_input and status = 'ready';
  return found;
end $$;

create or replace function public.fail_stage7_quest_request(request_id_input uuid, failure_code_input text, failure_detail_safe_input text default null) returns boolean
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update public.quest_generation_requests set status = 'failed', failed_at = now(), failure_code = left(failure_code_input, 96),
    failure_detail_safe = nullif(left(trim(coalesce(failure_detail_safe_input, '')), 120), ''), updated_at = now()
  where id = request_id_input and status = 'processing';
  return found;
end $$;

create or replace function public.persist_stage7_quest_pack(request_id_input uuid, quest_pack_input jsonb) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  request_row public.quest_generation_requests%rowtype;
  quest_item jsonb;
  expected_order integer := 1;
  first_quest_id uuid;
  created_quest_id uuid;
begin
  select * into request_row from public.quest_generation_requests where id = request_id_input and status = 'processing' for update;
  if request_row.id is null then raise exception 'QUEST_SAVE_FAILED' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.user_journeys where id = request_row.journey_id and user_id = request_row.user_id and status = 'active') then raise exception 'QUEST_JOURNEY_REQUIRED' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.journey_milestones where id = request_row.milestone_id and journey_id = request_row.journey_id and status in ('available', 'active')) then raise exception 'QUEST_MILESTONE_REQUIRED' using errcode = 'P0001'; end if;
  if jsonb_typeof(quest_pack_input -> 'quests') <> 'array' or jsonb_array_length(quest_pack_input -> 'quests') <> 3 then raise exception 'QUEST_OUTPUT_INVALID' using errcode = 'P0001'; end if;
  if exists (select 1 from public.user_quests where milestone_id = request_row.milestone_id) then raise exception 'QUEST_GENERATION_DISABLED' using errcode = 'P0001'; end if;
  for quest_item in select value from jsonb_array_elements(quest_pack_input -> 'quests') loop
    if (quest_item ->> 'sequence_order')::integer <> expected_order then raise exception 'QUEST_OUTPUT_INVALID' using errcode = 'P0001'; end if;
    insert into public.user_quests (user_id, journey_id, milestone_id, generation_request_id, title, real_world_outcome, why_it_matters, estimated_minutes, action_steps, resources_needed, low_resource_alternative, evidence_requirements, safety_guidance, completion_criteria, reflection_prompts, sequence_order, status)
    values (request_row.user_id, request_row.journey_id, request_row.milestone_id, request_row.id, quest_item ->> 'title', quest_item ->> 'real_world_outcome', quest_item ->> 'why_it_matters', (quest_item ->> 'estimated_minutes')::smallint,
      array(select jsonb_array_elements_text(quest_item -> 'action_steps')), array(select jsonb_array_elements_text(quest_item -> 'resources_needed')), quest_item ->> 'low_resource_alternative', array(select jsonb_array_elements_text(quest_item -> 'evidence_requirements')), quest_item ->> 'safety_guidance', quest_item ->> 'completion_criteria', array(select jsonb_array_elements_text(quest_item -> 'reflection_prompts')), expected_order,
      case when expected_order = 1 then 'available'::public.quest_status else 'locked'::public.quest_status end)
    returning id into created_quest_id;
    if expected_order = 1 then first_quest_id := created_quest_id; end if;
    expected_order := expected_order + 1;
  end loop;
  update public.quest_generation_requests set status = 'completed', completed_at = now(), updated_at = now() where id = request_row.id;
  return first_quest_id;
end $$;

create or replace function public.start_stage7_quest(quest_id_input uuid) returns boolean
language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid := auth.uid(); target public.user_quests%rowtype;
begin
  if actor is null then raise exception 'QUEST_ACCESS_DENIED' using errcode = 'P0001'; end if;
  select * into target from public.user_quests where id = quest_id_input and user_id = actor and status = 'available' for update;
  if target.id is null then raise exception 'QUEST_NOT_AVAILABLE' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.user_journeys where id = target.journey_id and user_id = actor and status = 'active') then raise exception 'QUEST_JOURNEY_REQUIRED' using errcode = 'P0001'; end if;
  if exists (select 1 from public.user_quests where user_id = actor and id <> target.id and status in ('active', 'evidence_submitted')) then raise exception 'QUEST_ANOTHER_ACTIVE' using errcode = 'P0001'; end if;
  update public.user_quests set status = 'active', started_at = coalesce(started_at, now()), updated_at = now() where id = target.id;
  update public.journey_milestones set status = 'active', started_at = coalesce(started_at, now()), updated_at = now() where id = target.milestone_id and status = 'available';
  insert into public.identity_audit_events (user_id, operation, result, metadata) values (actor, 'quest_started', 'success', jsonb_build_object('quest_id', target.id));
  return true;
end $$;

create or replace function public.submit_stage7_quest_evidence(quest_id_input uuid, evidence_text_input text, evidence_link_input text default null, image_path_input text default null, happened_on_input date default current_date) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid := auth.uid(); target public.user_quests%rowtype; evidence_id uuid; clean_link text := nullif(trim(coalesce(evidence_link_input, '')), ''); clean_image text := nullif(trim(coalesce(image_path_input, '')), '');
begin
  if actor is null then raise exception 'QUEST_ACCESS_DENIED' using errcode = 'P0001'; end if;
  select * into target from public.user_quests where id = quest_id_input and user_id = actor and status in ('active', 'evidence_submitted') for update;
  if target.id is null then raise exception 'QUEST_NOT_ACTIVE' using errcode = 'P0001'; end if;
  if char_length(trim(evidence_text_input)) not between 20 and 2000 then raise exception 'QUEST_EVIDENCE_INVALID' using errcode = 'P0001'; end if;
  if clean_link is not null and (char_length(clean_link) not between 8 and 500 or clean_link !~* '^https?://') then raise exception 'QUEST_EVIDENCE_INVALID' using errcode = 'P0001'; end if;
  if clean_image is not null and (char_length(clean_image) not between 10 and 500 or clean_image not like actor::text || '/' || target.id::text || '/%') then raise exception 'QUEST_EVIDENCE_INVALID' using errcode = 'P0001'; end if;
  if happened_on_input > current_date then raise exception 'QUEST_EVIDENCE_INVALID' using errcode = 'P0001'; end if;
  insert into public.quest_evidence (user_id, quest_id, evidence_text, evidence_link, image_path, happened_on)
  values (actor, target.id, trim(evidence_text_input), clean_link, clean_image, happened_on_input)
  on conflict (quest_id) do update set evidence_text = excluded.evidence_text, evidence_link = excluded.evidence_link, image_path = coalesce(excluded.image_path, public.quest_evidence.image_path), happened_on = excluded.happened_on, submitted_at = now(), updated_at = now()
  where public.quest_evidence.user_id = actor returning id into evidence_id;
  update public.user_quests set status = 'evidence_submitted', evidence_submitted_at = now(), updated_at = now() where id = target.id;
  insert into public.identity_audit_events (user_id, operation, result, metadata) values (actor, 'quest_evidence_submitted', 'success', jsonb_build_object('quest_id', target.id, 'has_link', clean_link is not null, 'has_image', clean_image is not null));
  return evidence_id;
end $$;

create or replace function public.complete_stage7_quest(quest_id_input uuid, what_i_did_input text, what_happened_input text, what_i_learned_input text, what_i_will_change_input text, nortnspoil_reflection_input text) returns boolean
language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid := auth.uid(); target public.user_quests%rowtype; next_quest_id uuid; next_milestone_id uuid; milestone_completed boolean := false;
begin
  if actor is null then raise exception 'QUEST_ACCESS_DENIED' using errcode = 'P0001'; end if;
  select * into target from public.user_quests where id = quest_id_input and user_id = actor for update;
  if target.id is null then raise exception 'QUEST_NOT_FOUND' using errcode = 'P0001'; end if;
  if target.status = 'completed' then return true; end if;
  if target.status <> 'evidence_submitted' or not exists (select 1 from public.quest_evidence where quest_id = target.id and user_id = actor) then raise exception 'QUEST_EVIDENCE_REQUIRED' using errcode = 'P0001'; end if;
  if char_length(trim(what_i_did_input)) not between 20 and 1200 or char_length(trim(what_happened_input)) not between 20 and 1200 or char_length(trim(what_i_learned_input)) not between 20 and 1200 or char_length(trim(what_i_will_change_input)) not between 20 and 1200 or char_length(trim(nortnspoil_reflection_input)) not between 20 and 1200 then raise exception 'QUEST_REFLECTION_INVALID' using errcode = 'P0001'; end if;
  insert into public.quest_reflections (user_id, quest_id, what_i_did, what_happened, what_i_learned, what_i_will_change, nortnspoil_reflection)
  values (actor, target.id, trim(what_i_did_input), trim(what_happened_input), trim(what_i_learned_input), trim(what_i_will_change_input), trim(nortnspoil_reflection_input)) on conflict (quest_id) do nothing;
  update public.user_quests set status = 'completed', completed_at = now(), updated_at = now() where id = target.id;
  insert into public.builder_xp_transactions (user_id, quest_id, amount, reason) values (actor, target.id, target.xp_value, 'quest_completion') on conflict (quest_id) do nothing;
  select id into next_quest_id from public.user_quests where milestone_id = target.milestone_id and sequence_order = target.sequence_order + 1 and status = 'locked' for update;
  if next_quest_id is not null then
    update public.user_quests set status = 'available', updated_at = now() where id = next_quest_id;
  else
    milestone_completed := true;
    update public.journey_milestones set status = 'completed', completed_at = now(), updated_at = now() where id = target.milestone_id;
    select next_milestone.id into next_milestone_id
    from public.journey_milestones current_milestone join public.journey_milestones next_milestone on next_milestone.journey_id = current_milestone.journey_id and next_milestone.sequence_order = current_milestone.sequence_order + 1
    where current_milestone.id = target.milestone_id and next_milestone.status = 'locked' for update of next_milestone;
    if next_milestone_id is not null then
      update public.journey_milestones set status = 'available', updated_at = now() where id = next_milestone_id;
    elsif not exists (select 1 from public.journey_milestones where journey_id = target.journey_id and status <> 'completed') then
      update public.user_journeys set status = 'completed', completed_at = now(), updated_at = now() where id = target.journey_id and user_id = actor and status = 'active';
    end if;
  end if;
  insert into public.identity_audit_events (user_id, operation, result, metadata) values (actor, 'quest_completed', 'success', jsonb_build_object('quest_id', target.id, 'xp_awarded', target.xp_value, 'milestone_completed', milestone_completed));
  return true;
end $$;

revoke all on function public.create_stage7_quest_request(uuid, text) from public, anon;
grant execute on function public.create_stage7_quest_request(uuid, text) to authenticated;
revoke all on function public.start_stage7_quest(uuid) from public, anon;
grant execute on function public.start_stage7_quest(uuid) to authenticated;
revoke all on function public.submit_stage7_quest_evidence(uuid, text, text, text, date) from public, anon;
grant execute on function public.submit_stage7_quest_evidence(uuid, text, text, text, date) to authenticated;
revoke all on function public.complete_stage7_quest(uuid, text, text, text, text, text) from public, anon;
grant execute on function public.complete_stage7_quest(uuid, text, text, text, text, text) to authenticated;
revoke all on function public.claim_stage7_quest_request(uuid, text, text) from public, anon, authenticated;
revoke all on function public.fail_stage7_quest_request(uuid, text, text) from public, anon, authenticated;
revoke all on function public.persist_stage7_quest_pack(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.claim_stage7_quest_request(uuid, text, text) to service_role;
grant execute on function public.fail_stage7_quest_request(uuid, text, text) to service_role;
grant execute on function public.persist_stage7_quest_pack(uuid, jsonb) to service_role;
