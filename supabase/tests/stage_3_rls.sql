begin;
select plan(24);

select has_table('public', 'discovery_question_sets', 'question sets exist');
select has_table('public', 'discovery_questions', 'questions exist');
select has_table('public', 'discovery_sessions', 'sessions exist');
select has_table('public', 'discovery_responses', 'responses exist');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '31000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'discovery-a@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '32000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'discovery-b@example.test', '', now(), '{}', '{}', now(), now());

update public.profiles set
  age_band = '16_17', onboarding_status = 'stage_3_ready'
where id = '31000000-0000-0000-0000-000000000001';
update public.profiles set
  age_band = '25_plus', onboarding_status = 'stage_3_ready'
where id = '32000000-0000-0000-0000-000000000002';

set local role anon;
set local "request.jwt.claim.sub" = '';
select throws_ok(
  $$select count(*)::int from public.discovery_sessions$$,
  '42501', null, 'anonymous cannot count sessions'
);
select throws_ok(
  $$select count(*)::int from public.discovery_responses$$,
  '42501', null, 'anonymous cannot read responses'
);
select throws_ok(
  $$select count(*)::int from public.discovery_questions$$,
  '42501', null, 'anonymous cannot read questions'
);

set local role authenticated;
set local "request.jwt.claim.sub" = '31000000-0000-0000-0000-000000000001';
select lives_ok(
  $$select public.start_or_resume_discovery()$$,
  'user A starts Discovery'
);
select lives_ok(
  $$select public.save_discovery_response(
    (select id from public.discovery_sessions where user_id = auth.uid()),
    'current_focus', null, array['School or study'], null, false, 1
  )$$,
  'user A saves an eligible response'
);
select results_eq(
  $$select count(*)::int from public.discovery_sessions$$,
  array[1], 'user A reads own session'
);
select results_eq(
  $$select count(*)::int from public.discovery_responses$$,
  array[1], 'user A reads own response'
);
select results_eq(
  $$select count(*)::int from public.discovery_questions where stable_key='learning_support'$$,
  array[1], 'minor sees youth-safe question'
);
select results_eq(
  $$select count(*)::int from public.discovery_questions where stable_key='adult_resources'$$,
  array[0], 'minor cannot read adult-only question'
);
select throws_ok(
  $$select public.save_discovery_response(
    (select id from public.discovery_sessions where user_id = auth.uid()),
    'adult_resources', null, array['Time'], null, false, 2
  )$$,
  '42501', 'DISCOVERY_QUESTION_NOT_ELIGIBLE',
  'minor cannot answer adult-only question through RPC'
);
select throws_ok(
  $$update public.discovery_question_sets set title='Tampered'$$,
  '42501', null, 'user cannot edit question definitions'
);
select throws_ok(
  $$update public.discovery_sessions set status='completed'$$,
  '42501', null, 'user cannot force completion'
);

set local "request.jwt.claim.sub" = '32000000-0000-0000-0000-000000000002';
select lives_ok(
  $$select public.start_or_resume_discovery()$$,
  'user B starts Discovery'
);
select lives_ok(
  $$select public.save_discovery_response(
    (select id from public.discovery_sessions where user_id = auth.uid()),
    'current_focus', null, array['Work or business'], null, false, 1
  )$$,
  'user B saves a response'
);

set local "request.jwt.claim.sub" = '31000000-0000-0000-0000-000000000001';
select results_eq(
  $$select count(*)::int from public.discovery_sessions
    where user_id='32000000-0000-0000-0000-000000000002'$$,
  array[0], 'user A cannot read user B session'
);
select results_eq(
  $$select count(*)::int from public.discovery_responses
    where user_id='32000000-0000-0000-0000-000000000002'$$,
  array[0], 'user A cannot read user B responses'
);
select throws_ok(
  $$insert into public.discovery_responses(
    session_id, user_id, question_id, question_key, response_type,
    text_response, sensitivity
  ) select
    session.id, '31000000-0000-0000-0000-000000000001', question.id,
    question.stable_key, question.response_type, 'tampered', question.sensitivity
  from public.discovery_sessions session
  join public.discovery_questions question
    on question.question_set_id=session.question_set_id
  where session.user_id='32000000-0000-0000-0000-000000000002'
  limit 1$$,
  '42501', null, 'user cannot insert response directly'
);
select throws_ok(
  $$update public.discovery_responses set sensitivity='standard'
    where user_id=auth.uid()$$,
  '42501', null, 'user cannot downgrade response sensitivity'
);
select throws_ok(
  $$delete from public.discovery_sessions where user_id=auth.uid()$$,
  '42501', null, 'user cannot delete Discovery sessions directly'
);
select results_eq(
  $$select count(*)::int from public.discovery_question_sets
    where status='draft'$$,
  array[0], 'draft question sets are hidden'
);

select * from finish();
rollback;

