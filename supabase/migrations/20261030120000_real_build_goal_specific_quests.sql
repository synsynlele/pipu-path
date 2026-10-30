-- Private learner-defined improvement goal; public templates are reused only for
-- an exact normalized goal key. Old attempts remain untouched and readable.
alter table public.real_build_templates
  add column focus_key text not null default 'general'
  constraint real_build_template_focus_key_length check (length(focus_key) between 1 and 64);

alter table public.real_build_attempts
  add column focus text not null default 'A useful improvement'
  constraint real_build_attempt_focus_length check (length(focus) between 10 and 160);

-- Previous templates were broadly reusable, but free-form goal-derived templates
-- must never be readable by unrelated signed-in browsers.
drop policy if exists real_build_templates_read on public.real_build_templates;
revoke select on public.real_build_templates from authenticated;

-- Duplicate titles are now unique only within one specific topic, time,
-- difficulty and goal key, not across unrelated learners and requests.
drop index if exists public.real_build_template_title;
create unique index real_build_template_title on public.real_build_templates
  (topic, minutes, difficulty, focus_key, lower(challenge->>'title'));

create index real_build_template_focus_lookup on public.real_build_templates
  (topic, minutes, difficulty, focus_key, created_at desc);

create function public.find_unseen_real_build_template_for_goal(
  user_input uuid, topic_input text, minutes_input integer,
  difficulty_input integer, focus_key_input text
) returns setof public.real_build_templates
language sql stable security invoker set search_path = '' as $$
  select t.* from public.real_build_templates t
  where t.topic = topic_input and t.minutes = minutes_input
    and t.difficulty = difficulty_input and t.focus_key = focus_key_input
    and not exists (
      select 1 from public.real_build_attempts a
      where a.user_id = user_input and a.template_id = t.id
    )
  order by t.created_at desc, t.id
  limit 1;
$$;
revoke all on function public.find_unseen_real_build_template_for_goal(uuid,text,integer,integer,text)
  from public, anon, authenticated;
grant execute on function public.find_unseen_real_build_template_for_goal(uuid,text,integer,integer,text)
  to service_role;

-- Each genuinely recorded new Quest contributes experience (even if the
-- attempt failed). A reported success gives one extra practice point.
-- Repeating the same Quest through "Improve" is valuable practice but does
-- not rapidly unlock harder new challenges or masquerade as mastery.
create or replace function public.next_real_build_difficulty(
  user_input uuid, topic_input text
) returns integer
language sql stable security invoker set search_path = '' as $$
  select case
    when practice_points >= 21 then 5
    when practice_points >= 13 then 4
    when practice_points >= 7 then 3
    when practice_points >= 3 then 2
    else 1
  end
  from (
    select coalesce(sum(case
      when draft->>'outcome' = 'worked' then 2
      else 1 end),0) as practice_points
    from public.real_build_attempts
    where user_id = user_input and topic = topic_input
      and status = 'recorded' and previous_attempt_id is null
  ) as activity;
$$;
revoke all on function public.next_real_build_difficulty(uuid,text)
  from public, anon, authenticated;
grant execute on function public.next_real_build_difficulty(uuid,text) to service_role;
