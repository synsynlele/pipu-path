-- Additive progression. Existing learners and cached Quest templates remain level 1.
-- Level numbers represent task complexity, not verified capability or mastery.
alter table public.real_build_templates
  add column difficulty smallint not null default 1
  constraint real_build_template_difficulty_check check (difficulty between 1 and 5);

alter table public.real_build_attempts
  add column difficulty smallint not null default 1
  constraint real_build_attempt_difficulty_check check (difficulty between 1 and 5);

create index real_build_template_level_lookup
  on public.real_build_templates(topic, minutes, difficulty, created_at desc);

create index real_build_attempt_level_history
  on public.real_build_attempts(user_id, topic, status, created_at desc);

-- Reported outcome is treated as practice feedback, not a verified skill.
-- A successful recorded attempt advances one step early; partial progress
-- advances more gradually, while a failed test is never treated as mastery.
create function public.next_real_build_difficulty(
  user_input uuid, topic_input text
) returns integer
language sql stable security invoker set search_path = '' as $$
  select case
    when practice_points >= 20 then 5
    when practice_points >= 12 then 4
    when practice_points >= 6 then 3
    when practice_points >= 2 then 2
    else 1
  end
  from (
    select coalesce(sum(case
      when draft->>'outcome' = 'worked' then 2
      when draft->>'outcome' = 'partly' then 1
      else 0 end), 0) as practice_points
    from public.real_build_attempts
    where user_id = user_input and topic = topic_input and status = 'recorded'
  ) as activity;
$$;

revoke all on function public.next_real_build_difficulty(uuid,text)
  from public, anon, authenticated;
grant execute on function public.next_real_build_difficulty(uuid,text)
  to service_role;

-- Keep the original 3-argument lookup available for previous consumers.
-- The new flow requests only reusable templates at the user's computed level.
create function public.find_unseen_real_build_template_level(
  user_input uuid, topic_input text, minutes_input integer, difficulty_input integer
) returns setof public.real_build_templates
language sql stable security invoker set search_path = '' as $$
  select t.* from public.real_build_templates t
  where t.topic = topic_input and t.minutes = minutes_input
    and t.difficulty = difficulty_input
    and not exists (
      select 1 from public.real_build_attempts a
      where a.user_id = user_input and a.template_id = t.id
    )
  order by t.created_at desc, t.id
  limit 1;
$$;

revoke all on function public.find_unseen_real_build_template_level(uuid,text,integer,integer)
  from public, anon, authenticated;
grant execute on function public.find_unseen_real_build_template_level(uuid,text,integer,integer)
  to service_role;
