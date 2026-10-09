-- New sessions use a shorter, versioned set. Existing answers and sessions
-- retain version 1 and its original evidence; no records are rewritten.
insert into public.discovery_question_sets (
  stable_key, version, status, title, description, intended_age_bands,
  intended_life_stages, published_at
)
select stable_key, 2, 'published', 'Your starting point',
  'Eight questions to find a useful first experiment.', intended_age_bands,
  intended_life_stages, now()
from public.discovery_question_sets
where stable_key = 'foundation_discovery' and version = 1;

insert into public.discovery_questions (
  question_set_id, stable_key, section_key, section_title, prompt,
  supporting_text, response_type, is_required, display_order,
  max_text_length, option_definitions, min_selections, max_selections,
  min_scale, max_scale, eligible_age_bands, sensitivity, is_active
)
select target.id, source.stable_key, source.section_key, 'Your starting point',
  choices.prompt, choices.hint, source.response_type,
  source.is_required, choices.position,
  source.max_text_length, source.option_definitions, source.min_selections,
  source.max_selections, source.min_scale, source.max_scale,
  source.eligible_age_bands, source.sensitivity, true
from public.discovery_question_sets original
join public.discovery_questions source on source.question_set_id = original.id
join public.discovery_question_sets target on target.stable_key = original.stable_key and target.version = 2
join (values
  ('important_now', 10, 'What would you like to improve in your life right now?', 'One thing is enough.'),
  ('activities_enjoyed', 20, 'What do you enjoy doing?', 'Pick up to three.'),
  ('contribution_evidence', 30, 'Tell us about one time you helped, made or improved something.', 'Small examples count. What did you do, and what changed?'),
  ('values', 40, 'What matters most to you?', 'Pick up to three values.'),
  ('problems_noticed', 50, 'What around you could work better?', 'Think about home, school, work or your community.'),
  ('build_experiment', 60, 'Which small experiment would you like to try?', 'A starting point, not a permanent label.'),
  ('weekly_time', 70, 'How much time can you give it each week?', 'Choose what fits your life.'),
  ('learning_support', 80, 'Who could safely support you?', 'Choose a trusted person. Do not share contact details.'),
  ('adult_resources', 90, 'What could help you get started?', 'Choose a resource you can use responsibly.')
) choices(stable_key, position, prompt, hint) on choices.stable_key = source.stable_key
where original.stable_key = 'foundation_discovery' and original.version = 1;

-- Seven common questions and one age-specific optional support question.
do $$
declare band public.age_band; total integer;
begin
  foreach band in array array['under_13','13_15','16_17','18_24','25_plus']::public.age_band[] loop
    select count(*) into total from public.discovery_questions q
    join public.discovery_question_sets s on s.id=q.question_set_id
    where s.stable_key='foundation_discovery' and s.version=2
      and band=any(q.eligible_age_bands);
    if total <> 8 then raise exception 'Expected 8 Discovery questions for %, got %', band,total; end if;
  end loop;
end $$;
