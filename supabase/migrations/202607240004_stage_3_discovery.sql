create type public.discovery_question_set_status as enum ('draft', 'published', 'retired');
create type public.discovery_response_type as enum (
  'reflection', 'single_select', 'multi_select', 'scale'
);
create type public.discovery_sensitivity as enum ('standard', 'sensitive');
create type public.discovery_session_status as enum (
  'in_progress', 'review', 'completed'
);
create type public.discovery_processing_status as enum (
  'not_ready', 'ready_for_stage_4'
);
create type public.discovery_checkpoint_status as enum (
  'not_started', 'in_progress', 'completed'
);

create table public.discovery_question_sets (
  id uuid primary key default gen_random_uuid(),
  stable_key text not null check (stable_key ~ '^[a-z][a-z0-9_]{2,39}$'),
  version integer not null check (version > 0),
  status public.discovery_question_set_status not null default 'draft',
  title text not null check (char_length(title) between 1 and 120),
  description text not null check (char_length(description) between 1 and 500),
  intended_age_bands public.age_band[] not null,
  intended_life_stages text[] not null default '{}',
  published_at timestamptz,
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stable_key, version),
  constraint discovery_question_set_dates check (
    (status = 'draft' and published_at is null and retired_at is null)
    or (status = 'published' and published_at is not null and retired_at is null)
    or (status = 'retired' and published_at is not null and retired_at is not null)
  )
);

create table public.discovery_questions (
  id uuid primary key default gen_random_uuid(),
  question_set_id uuid not null references public.discovery_question_sets(id),
  stable_key text not null check (stable_key ~ '^[a-z][a-z0-9_]{2,49}$'),
  section_key text not null check (section_key ~ '^[a-z][a-z0-9_]{2,39}$'),
  section_title text not null check (char_length(section_title) between 1 and 80),
  prompt text not null check (char_length(prompt) between 1 and 500),
  supporting_text text check (
    supporting_text is null or char_length(supporting_text) <= 500
  ),
  response_type public.discovery_response_type not null,
  is_required boolean not null default true,
  display_order integer not null check (display_order > 0),
  min_selections integer,
  max_selections integer,
  min_scale integer,
  max_scale integer,
  max_text_length integer check (
    max_text_length is null or max_text_length between 1 and 1200
  ),
  option_definitions jsonb not null default '[]'::jsonb check (
    jsonb_typeof(option_definitions) = 'array'
  ),
  eligible_age_bands public.age_band[] not null,
  conditional_rule jsonb,
  sensitivity public.discovery_sensitivity not null default 'standard',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_set_id, stable_key),
  unique (question_set_id, display_order),
  constraint discovery_question_type_configuration check (
    (
      response_type = 'reflection'
      and max_text_length is not null
      and jsonb_array_length(option_definitions) = 0
      and min_scale is null and max_scale is null
    )
    or (
      response_type in ('single_select', 'multi_select')
      and jsonb_array_length(option_definitions) > 0
      and max_text_length is null
      and min_scale is null and max_scale is null
    )
    or (
      response_type = 'scale'
      and min_scale is not null and max_scale is not null
      and min_scale < max_scale
      and max_text_length is null
      and jsonb_array_length(option_definitions) = 0
    )
  ),
  constraint discovery_selection_limits check (
    response_type <> 'multi_select'
    or (
      min_selections is not null and max_selections is not null
      and min_selections >= 1 and min_selections <= max_selections
    )
  )
);

create table public.discovery_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_set_id uuid not null references public.discovery_question_sets(id),
  question_set_version integer not null check (question_set_version > 0),
  status public.discovery_session_status not null default 'in_progress',
  current_section_key text,
  current_question_key text,
  progress_percent integer not null default 0 check (
    progress_percent between 0 and 100
  ),
  version integer not null default 1 check (version > 0),
  stage_4_processing_status public.discovery_processing_status
    not null default 'not_ready',
  started_at timestamptz not null default now(),
  last_resumed_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint discovery_session_completion check (
    (
      status = 'completed' and completed_at is not null
      and progress_percent = 100
      and stage_4_processing_status = 'ready_for_stage_4'
    )
    or (
      status <> 'completed' and completed_at is null
      and stage_4_processing_status = 'not_ready'
    )
  )
);

create unique index discovery_one_active_session_idx
on public.discovery_sessions (user_id, question_set_id)
where status in ('in_progress', 'review');

create table public.discovery_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.discovery_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.discovery_questions(id),
  question_key text not null,
  response_type public.discovery_response_type not null,
  text_response text,
  selected_options text[],
  numeric_response integer,
  skipped boolean not null default false,
  sensitivity public.discovery_sensitivity not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, question_id),
  constraint discovery_response_shape check (
    (
      skipped and text_response is null
      and selected_options is null and numeric_response is null
    )
    or (
      not skipped and response_type = 'reflection'
      and text_response is not null
      and selected_options is null and numeric_response is null
    )
    or (
      not skipped and response_type in ('single_select', 'multi_select')
      and text_response is null
      and selected_options is not null and numeric_response is null
    )
    or (
      not skipped and response_type = 'scale'
      and text_response is null
      and selected_options is null and numeric_response is not null
    )
  )
);

create table public.discovery_audit_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  session_id uuid references public.discovery_sessions(id) on delete set null,
  operation text not null check (operation in (
    'discovery_started', 'discovery_resumed', 'response_saved',
    'optional_question_skipped', 'review_opened', 'discovery_completed'
  )),
  result text not null default 'success' check (result in ('success', 'failure')),
  error_code text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

alter table public.onboarding_checkpoints
add column discovery_status public.discovery_checkpoint_status
  not null default 'not_started',
add column discovery_resume_path text not null default '/onboarding/discovery';

create trigger discovery_question_sets_updated_at
before update on public.discovery_question_sets
for each row execute function public.set_updated_at();
create trigger discovery_questions_updated_at
before update on public.discovery_questions
for each row execute function public.set_updated_at();
create trigger discovery_sessions_updated_at
before update on public.discovery_sessions
for each row execute function public.set_updated_at();
create trigger discovery_responses_updated_at
before update on public.discovery_responses
for each row execute function public.set_updated_at();

insert into public.discovery_question_sets (
  stable_key, version, status, title, description, intended_age_bands,
  intended_life_stages, published_at
) values (
  'foundation_discovery', 1, 'published', 'My Discovery',
  'A calm conversation about your reality, interests, evidence and readiness.',
  array['under_13', '13_15', '16_17', '18_24', '25_plus']::public.age_band[],
  array['student', 'working', 'between_stages', 'other'],
  now()
);

with question_set as (
  select id from public.discovery_question_sets
  where stable_key = 'foundation_discovery' and version = 1
)
insert into public.discovery_questions (
  question_set_id, stable_key, section_key, section_title, prompt,
  supporting_text, response_type, is_required, display_order,
  max_text_length, option_definitions, min_selections, max_selections,
  min_scale, max_scale, eligible_age_bands, sensitivity
)
select question_set.id, question.stable_key, question.section_key,
  question.section_title, question.prompt, question.supporting_text,
  question.response_type::public.discovery_response_type,
  question.is_required, question.display_order, question.max_text_length,
  question.option_definitions::jsonb, question.min_selections,
  question.max_selections, question.min_scale, question.max_scale,
  question.eligible_age_bands::public.age_band[],
  question.sensitivity::public.discovery_sensitivity
from question_set cross join (values
  ('current_focus', 'current_reality', 'My Current Reality',
   'What takes most of your time and attention right now?',
   'Choose the answer that is closest. You can change it later.',
   'single_select', true, 10, null,
   '["School or study","Work or business","Caring for people or home","Looking for my next step","A mixture of these"]',
   null, null, null, null,
   array['under_13','13_15','16_17','18_24','25_plus'], 'standard'),
  ('important_now', 'current_reality', 'My Current Reality',
   'What feels most important for you to improve right now?',
   'A short, honest answer is enough.', 'reflection', true, 20, 600,
   '[]', null, null, null, null,
   array['under_13','13_15','16_17','18_24','25_plus'], 'standard'),
  ('activities_enjoyed', 'what_draws_me', 'What Draws Me',
   'Which activities do you enjoy enough to return to?',
   'Choose up to three.', 'multi_select', true, 30, null,
   '["Making or designing","Explaining or teaching","Organising people or plans","Investigating or researching","Helping people","Fixing or improving","Performing or expressing","Working with numbers"]',
   1, 3, null, null,
   array['under_13','13_15','16_17','18_24','25_plus'], 'standard'),
  ('curiosity', 'what_draws_me', 'What Draws Me',
   'What topic or problem do you keep thinking, reading or asking about?',
   'It is fine if your curiosity is still changing.', 'reflection', false, 40, 600,
   '[]', null, null, null, null,
   array['under_13','13_15','16_17','18_24','25_plus'], 'standard'),
  ('relied_on_for', 'comes_naturally', 'What Comes Naturally',
   'What do people already rely on you to help with?',
   'Think about home, school, work, community or online spaces.',
   'reflection', true, 50, 800, '[]', null, null, null, null,
   array['under_13','13_15','16_17','18_24','25_plus'], 'standard'),
  ('contribution_evidence', 'comes_naturally', 'What Comes Naturally',
   'Describe one real moment when you made something, solved a problem, helped someone or improved a situation.',
   'Small examples count. Say what you did and what changed.',
   'reflection', true, 60, 1200, '[]', null, null, null, null,
   array['under_13','13_15','16_17','18_24','25_plus'], 'standard'),
  ('shaping_experience', 'shaped_me', 'What Has Shaped Me',
   'Is there an experience that taught you something important about yourself?',
   'This is optional. Do not share anything that feels unsafe or too private.',
   'reflection', false, 70, 800, '[]', null, null, null, null,
   array['under_13','13_15','16_17','18_24','25_plus'], 'sensitive'),
  ('support_environment', 'shaped_me', 'What Has Shaped Me',
   'Which environment helps you do your best work?',
   'Choose what is closest today.', 'single_select', true, 80, null,
   '["Quiet space to focus","A supportive team","Clear guidance and examples","Freedom to experiment","A deadline or challenge","I do not know yet"]',
   null, null, null, null,
   array['under_13','13_15','16_17','18_24','25_plus'], 'standard'),
  ('values', 'what_matters', 'What Matters to Me',
   'Which values matter most in the contribution you make?',
   'Choose up to three.', 'multi_select', true, 90, null,
   '["Creativity","Fairness","Service","Excellence","Freedom","Security","Learning","Leadership","Community"]',
   1, 3, null, null,
   array['under_13','13_15','16_17','18_24','25_plus'], 'standard'),
  ('problems_noticed', 'what_matters', 'What Matters to Me',
   'What situation around you do you wish worked better?',
   'Focus on what you have noticed; you do not need the solution yet.',
   'reflection', true, 100, 800, '[]', null, null, null, null,
   array['under_13','13_15','16_17','18_24','25_plus'], 'standard'),
  ('build_experiment', 'could_build', 'What I Could Build',
   'Which small experiment would you most willingly try for 30 days?',
   'This is a test, not a permanent identity decision.',
   'single_select', true, 110, null,
   '["Make and share something useful","Teach something practical","Organise a team around a need","Investigate and publish what I learn","Help one person reach an outcome","Improve a broken process, tool or space"]',
   null, null, null, null,
   array['under_13','13_15','16_17','18_24','25_plus'], 'standard'),
  ('guidance_needed', 'could_build', 'What I Could Build',
   'Where would guidance help you move forward?',
   'Choose up to two.', 'multi_select', false, 120, null,
   '["Choosing a direction","Building a skill","Starting a project","Finding collaborators","Accessing tools or resources","Building confidence"]',
   1, 2, null, null,
   array['under_13','13_15','16_17','18_24','25_plus'], 'standard'),
  ('weekly_time', 'readiness', 'My Readiness',
   'How much time could you realistically give to a small experiment each week?',
   'Choose what you can sustain, not what sounds impressive.',
   'single_select', true, 130, null,
   '["Less than 1 hour","1–2 hours","3–5 hours","More than 5 hours","I am not sure yet"]',
   null, null, null, null,
   array['under_13','13_15','16_17','18_24','25_plus'], 'standard'),
  ('readiness_confidence', 'readiness', 'My Readiness',
   'How ready do you feel to take one small practical step?',
   '1 means “I need plenty of support.” 5 means “I am ready to begin.”',
   'scale', true, 140, null, '[]', null, null, 1, 5,
   array['under_13','13_15','16_17','18_24','25_plus'], 'standard')
) as question(
  stable_key, section_key, section_title, prompt, supporting_text,
  response_type, is_required, display_order, max_text_length,
  option_definitions, min_selections, max_selections, min_scale, max_scale,
  eligible_age_bands, sensitivity
);

alter table public.discovery_question_sets enable row level security;
alter table public.discovery_questions enable row level security;
alter table public.discovery_sessions enable row level security;
alter table public.discovery_responses enable row level security;
alter table public.discovery_audit_events enable row level security;

create policy discovery_question_sets_read_published
on public.discovery_question_sets for select to authenticated
using (status = 'published');

create policy discovery_questions_read_eligible
on public.discovery_questions for select to authenticated
using (
  is_active
  and exists (
    select 1 from public.discovery_question_sets question_set
    where question_set.id = question_set_id and question_set.status = 'published'
  )
  and exists (
    select 1 from public.profiles profile
    where profile.id = auth.uid()
      and profile.age_band = any(eligible_age_bands)
  )
);

create policy discovery_sessions_select_own
on public.discovery_sessions for select to authenticated
using (user_id = auth.uid());

create policy discovery_responses_select_own
on public.discovery_responses for select to authenticated
using (user_id = auth.uid());

revoke all on public.discovery_question_sets, public.discovery_questions,
  public.discovery_sessions, public.discovery_responses,
  public.discovery_audit_events
from public, anon, authenticated;

grant select on public.discovery_question_sets, public.discovery_questions,
  public.discovery_sessions, public.discovery_responses to authenticated;

create or replace function public.discovery_progress(
  session_id_input uuid
) returns integer
language sql
security definer
set search_path = ''
as $$
  with eligible as (
    select question.id as question_id
    from public.discovery_sessions session
    join public.profiles profile on profile.id = session.user_id
    join public.discovery_questions question
      on question.question_set_id = session.question_set_id
    where session.id = session_id_input
      and question.is_active
      and profile.age_band = any(question.eligible_age_bands)
  ),
  answered as (
    select response.question_id
    from public.discovery_responses response
    where response.session_id = session_id_input
  )
  select case when count(*) = 0 then 0 else
    floor(100.0 * count(answered.question_id) / count(*))::integer end
  from eligible left join answered using (question_id);
$$;

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
    and status in ('in_progress', 'review');
  if session_id is not null then
    resumed := true;
    update public.discovery_sessions set last_resumed_at = now()
    where id = session_id;
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
    discovery_status = 'in_progress',
    discovery_resume_path = '/onboarding/discovery'
  where user_id = actor and discovery_status = 'not_started';

  insert into public.discovery_audit_events (
    user_id, session_id, operation
  ) values (
    actor, session_id,
    case when resumed then 'discovery_resumed' else 'discovery_started' end
  );
  return session_id;
end;
$$;

create or replace function public.save_discovery_response(
  session_id_input uuid,
  question_key_input text,
  text_response_input text,
  selected_options_input text[],
  numeric_response_input integer,
  skip_input boolean,
  expected_version_input integer
) returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  session_record public.discovery_sessions%rowtype;
  question_record public.discovery_questions%rowtype;
  actor_age public.age_band;
  cleaned_text text := nullif(trim(text_response_input), '');
  selected_count integer := coalesce(cardinality(selected_options_input), 0);
  next_question public.discovery_questions%rowtype;
  next_version integer;
  next_progress integer;
begin
  if actor is null then
    raise exception 'DISCOVERY_ACCESS_DENIED' using errcode = '42501';
  end if;
  select * into session_record from public.discovery_sessions
  where id = session_id_input and user_id = actor for update;
  if not found then
    raise exception 'DISCOVERY_SESSION_NOT_FOUND' using errcode = '42501';
  end if;
  if session_record.status = 'completed' then
    raise exception 'DISCOVERY_SESSION_ALREADY_COMPLETED' using errcode = '22023';
  end if;
  if session_record.version <> expected_version_input then
    raise exception 'DISCOVERY_SAVE_CONFLICT' using errcode = '40001';
  end if;

  select age_band into actor_age from public.profiles where id = actor;
  select * into question_record from public.discovery_questions
  where question_set_id = session_record.question_set_id
    and stable_key = question_key_input and is_active
    and actor_age = any(eligible_age_bands);
  if not found then
    raise exception 'DISCOVERY_QUESTION_NOT_ELIGIBLE' using errcode = '42501';
  end if;
  if skip_input and question_record.is_required then
    raise exception 'DISCOVERY_REQUIRED_RESPONSE_MISSING' using errcode = '22023';
  end if;

  if not skip_input then
    if question_record.response_type = 'reflection' and (
      cleaned_text is null
      or char_length(cleaned_text) > question_record.max_text_length
      or selected_count > 0 or numeric_response_input is not null
    ) then raise exception 'DISCOVERY_RESPONSE_INVALID' using errcode = '22023';
    elsif question_record.response_type = 'single_select' and (
      selected_count <> 1 or cleaned_text is not null
      or numeric_response_input is not null
    ) then raise exception 'DISCOVERY_RESPONSE_INVALID' using errcode = '22023';
    elsif question_record.response_type = 'multi_select' and (
      selected_count < question_record.min_selections
      or selected_count > question_record.max_selections
      or cleaned_text is not null or numeric_response_input is not null
    ) then raise exception 'DISCOVERY_RESPONSE_INVALID' using errcode = '22023';
    elsif question_record.response_type = 'scale' and (
      numeric_response_input is null
      or numeric_response_input < question_record.min_scale
      or numeric_response_input > question_record.max_scale
      or cleaned_text is not null or selected_count > 0
    ) then raise exception 'DISCOVERY_RESPONSE_INVALID' using errcode = '22023';
    end if;
    if question_record.response_type in ('single_select', 'multi_select')
      and exists (
        select 1 from unnest(selected_options_input) selected
        where not exists (
          select 1 from jsonb_array_elements_text(
            question_record.option_definitions
          ) allowed where allowed = selected
        )
      )
    then raise exception 'DISCOVERY_RESPONSE_INVALID' using errcode = '22023';
    end if;
  end if;

  insert into public.discovery_responses (
    session_id, user_id, question_id, question_key, response_type,
    text_response, selected_options, numeric_response, skipped, sensitivity
  ) values (
    session_id_input, actor, question_record.id, question_record.stable_key,
    question_record.response_type,
    case when skip_input then null else cleaned_text end,
    case when skip_input then null else selected_options_input end,
    case when skip_input then null else numeric_response_input end,
    skip_input, question_record.sensitivity
  ) on conflict (session_id, question_id) do update set
    text_response = excluded.text_response,
    selected_options = excluded.selected_options,
    numeric_response = excluded.numeric_response,
    skipped = excluded.skipped,
    response_type = excluded.response_type,
    sensitivity = excluded.sensitivity;

  select * into next_question from public.discovery_questions
  where question_set_id = session_record.question_set_id and is_active
    and actor_age = any(eligible_age_bands)
    and display_order > question_record.display_order
  order by display_order limit 1;
  next_progress := public.discovery_progress(session_id_input);

  update public.discovery_sessions set
    status = 'in_progress',
    progress_percent = next_progress,
    current_section_key = coalesce(next_question.section_key, question_record.section_key),
    current_question_key = coalesce(next_question.stable_key, question_record.stable_key),
    version = version + 1
  where id = session_id_input returning version into next_version;

  insert into public.discovery_audit_events (
    user_id, session_id, operation, metadata
  ) values (
    actor, session_id_input,
    case when skip_input then 'optional_question_skipped' else 'response_saved' end,
    jsonb_build_object(
      'question_key', question_record.stable_key,
      'section_key', question_record.section_key
    )
  );
  return next_version;
end;
$$;

create or replace function public.open_discovery_review(
  session_id_input uuid,
  expected_version_input integer
) returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  session_record public.discovery_sessions%rowtype;
  actor_age public.age_band;
  missing_count integer;
  next_version integer;
begin
  select * into session_record from public.discovery_sessions
  where id = session_id_input and user_id = actor for update;
  if not found then
    raise exception 'DISCOVERY_SESSION_NOT_FOUND' using errcode = '42501';
  end if;
  if session_record.status = 'completed' then
    return session_record.version;
  end if;
  if session_record.version <> expected_version_input then
    raise exception 'DISCOVERY_SAVE_CONFLICT' using errcode = '40001';
  end if;
  select age_band into actor_age from public.profiles where id = actor;
  select count(*) into missing_count
  from public.discovery_questions question
  where question.question_set_id = session_record.question_set_id
    and question.is_active and question.is_required
    and actor_age = any(question.eligible_age_bands)
    and not exists (
      select 1 from public.discovery_responses response
      where response.session_id = session_id_input
        and response.question_id = question.id
        and not response.skipped
    );
  if missing_count > 0 then
    raise exception 'DISCOVERY_REQUIRED_RESPONSE_MISSING' using errcode = '22023';
  end if;
  update public.discovery_sessions set
    status = 'review', progress_percent = 100, version = version + 1
  where id = session_id_input returning version into next_version;
  insert into public.discovery_audit_events (
    user_id, session_id, operation
  ) values (actor, session_id_input, 'review_opened');
  return next_version;
end;
$$;

create or replace function public.complete_discovery(
  session_id_input uuid,
  expected_version_input integer
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  session_record public.discovery_sessions%rowtype;
begin
  select * into session_record from public.discovery_sessions
  where id = session_id_input and user_id = actor for update;
  if not found then
    raise exception 'DISCOVERY_SESSION_NOT_FOUND' using errcode = '42501';
  end if;
  if session_record.status = 'completed' then
    return;
  end if;
  if session_record.status <> 'review' then
    raise exception 'DISCOVERY_SESSION_INVALID_STATE' using errcode = '22023';
  end if;
  if session_record.version <> expected_version_input then
    raise exception 'DISCOVERY_SAVE_CONFLICT' using errcode = '40001';
  end if;

  update public.discovery_sessions set
    status = 'completed', completed_at = now(), progress_percent = 100,
    stage_4_processing_status = 'ready_for_stage_4', version = version + 1
  where id = session_id_input;
  update public.onboarding_checkpoints set
    discovery_status = 'completed',
    discovery_resume_path = '/onboarding/discovery/complete'
  where user_id = actor;
  insert into public.discovery_audit_events (
    user_id, session_id, operation,
    metadata
  ) values (
    actor, session_id_input, 'discovery_completed',
    jsonb_build_object(
      'question_set_id', session_record.question_set_id,
      'question_set_version', session_record.question_set_version
    )
  );
end;
$$;

revoke all on function public.discovery_progress(uuid)
from public, anon, authenticated, service_role;
revoke all on function public.start_or_resume_discovery()
from public, anon, authenticated, service_role;
revoke all on function public.save_discovery_response(
  uuid, text, text, text[], integer, boolean, integer
) from public, anon, authenticated, service_role;
revoke all on function public.open_discovery_review(uuid, integer)
from public, anon, authenticated, service_role;
revoke all on function public.complete_discovery(uuid, integer)
from public, anon, authenticated, service_role;

grant execute on function public.start_or_resume_discovery() to authenticated;
grant execute on function public.save_discovery_response(
  uuid, text, text, text[], integer, boolean, integer
) to authenticated;
grant execute on function public.open_discovery_review(uuid, integer)
to authenticated;
grant execute on function public.complete_discovery(uuid, integer)
to authenticated;

