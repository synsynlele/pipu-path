-- Add server-enforced age variants and make start/resume idempotent after
-- completion. Migration 004 is already applied to staging and remains immutable.

with question_set as (
  select id from public.discovery_question_sets
  where stable_key = 'foundation_discovery' and version = 1
)
insert into public.discovery_questions (
  question_set_id, stable_key, section_key, section_title, prompt,
  supporting_text, response_type, is_required, display_order,
  option_definitions, eligible_age_bands, sensitivity
)
select question_set.id, question.stable_key, 'readiness', 'My Readiness',
  question.prompt, question.supporting_text,
  'single_select'::public.discovery_response_type, false,
  question.display_order, question.option_definitions::jsonb,
  question.eligible_age_bands::public.age_band[], 'standard'
from question_set cross join (values
  (
    'learning_support', 135,
    'Who could safely support your next small experiment?',
    'Choose the closest answer. Do not share anyone’s contact details.',
    '["A parent or guardian","A teacher or school guide","A trusted family member","A youth group or community guide","I am not sure yet"]',
    array['under_13','13_15','16_17']
  ),
  (
    'adult_resources', 136,
    'Which resource is most available for your next small experiment?',
    'Choose what you can use responsibly right now.',
    '["Time","A useful skill","A small budget","Tools or workspace","A professional or community network","I am not sure yet"]',
    array['18_24','25_plus']
  )
) as question(
  stable_key, display_order, prompt, supporting_text,
  option_definitions, eligible_age_bands
);

create or replace function public.start_or_resume_discovery()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  actor_age public.age_band;
  selected_set public.discovery_question_sets%rowtype;
  session_id uuid;
  first_question public.discovery_questions%rowtype;
  resumed boolean := false;
begin
  if actor is null then
    raise exception 'DISCOVERY_ACCESS_DENIED' using errcode = '42501';
  end if;
  select age_band into actor_age from public.profiles
  where id = actor and onboarding_status = 'stage_3_ready';
  if actor_age is null or actor_age = 'unknown' then
    raise exception 'DISCOVERY_ACCESS_DENIED' using errcode = '42501';
  end if;

  select * into selected_set from public.discovery_question_sets
  where status = 'published' and actor_age = any(intended_age_bands)
  order by version desc limit 1;
  if not found then
    raise exception 'DISCOVERY_NOT_AVAILABLE' using errcode = '22023';
  end if;

  select id into session_id from public.discovery_sessions
  where user_id = actor and question_set_id = selected_set.id
  order by
    case when status in ('in_progress', 'review') then 0 else 1 end,
    created_at desc
  limit 1;
  if session_id is not null then
    resumed := true;
    update public.discovery_sessions set last_resumed_at = now()
    where id = session_id and status <> 'completed';
  else
    select * into first_question from public.discovery_questions
    where question_set_id = selected_set.id and is_active
      and actor_age = any(eligible_age_bands)
    order by display_order limit 1;
    insert into public.discovery_sessions (
      user_id, question_set_id, question_set_version,
      current_section_key, current_question_key
    ) values (
      actor, selected_set.id, selected_set.version,
      first_question.section_key, first_question.stable_key
    ) returning id into session_id;
  end if;

  update public.onboarding_checkpoints set
    discovery_status = case
      when discovery_status = 'not_started' then 'in_progress'
      else discovery_status
    end,
    discovery_resume_path = case
      when discovery_status = 'completed'
        then '/onboarding/discovery/complete'
      else '/onboarding/discovery'
    end
  where user_id = actor;

  insert into public.discovery_audit_events (
    user_id, session_id, operation
  ) values (
    actor, session_id,
    case when resumed then 'discovery_resumed' else 'discovery_started' end
  );
  return session_id;
end;
$$;

revoke all on function public.start_or_resume_discovery()
from public, anon, authenticated, service_role;
grant execute on function public.start_or_resume_discovery() to authenticated;

