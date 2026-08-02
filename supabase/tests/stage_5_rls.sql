begin;
select plan(14);

select has_table('public', 'mission_generation_requests', 'mission requests exist');
select has_table('public', 'user_missions', 'missions exist');
select has_index('public', 'user_missions', 'user_missions_one_active_idx', 'one-active index exists');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '51000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'mission-a@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '52000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'mission-b@example.test', '', now(), '{}', '{}', now(), now());

insert into public.interpretation_requests (
  id, user_id, status, question_set_version, interpretation_schema_version,
  prompt_version, consent_policy_version, age_band, is_minor,
  safeguarding_review_required, idempotency_key
) values
  ('51100000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001', 'completed', 1, 'hpi-profile-v1', 'test', 'v1', '18_24', false, false, '51110000-0000-4000-8000-000000000001'),
  ('52200000-0000-4000-8000-000000000002', '52000000-0000-4000-8000-000000000002', 'completed', 1, 'hpi-profile-v1', 'test', 'v1', '18_24', false, false, '52220000-0000-4000-8000-000000000002');

insert into public.human_potential_profile_versions (
  id, user_id, version, status, source_interpretation_request_id, schema_version
) values
  ('51300000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001', 1, 'active', '51100000-0000-4000-8000-000000000001', 'hpi-profile-v1'),
  ('52400000-0000-4000-8000-000000000002', '52000000-0000-4000-8000-000000000002', 1, 'active', '52200000-0000-4000-8000-000000000002', 'hpi-profile-v1');

insert into public.mission_generation_requests (
  id, user_id, human_potential_profile_id, generation_kind, status, provider, model, prompt_version
) values
  ('51500000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001', '51300000-0000-4000-8000-000000000001', 'initial', 'completed', 'test', 'test', 'v1'),
  ('52600000-0000-4000-8000-000000000002', '52000000-0000-4000-8000-000000000002', '52400000-0000-4000-8000-000000000002', 'initial', 'completed', 'test', 'test', 'v1');

insert into public.user_missions (
  id, user_id, human_potential_profile_id, generation_request_id, title,
  mission_statement, why_this_fits, who_this_helps, first_meaningful_outcome,
  time_horizon, success_signal, current_caution, profile_evidence_refs, model, prompt_version
) values
  ('51700000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001', '51300000-0000-4000-8000-000000000001', '51500000-0000-4000-8000-000000000001', 'Mission A', 'Help a small group solve a real problem.', 'It fits the approved profile evidence and current context.', 'Students nearby', 'Test one small useful guide with three students.', 'four_weeks', 'Three students use it and respond.', 'Start small with trusted guidance.', array['51100000-0000-4000-8000-000000000001'::uuid, '51300000-0000-4000-8000-000000000001'::uuid], 'test', 'v1'),
  ('52800000-0000-4000-8000-000000000002', '52000000-0000-4000-8000-000000000002', '52400000-0000-4000-8000-000000000002', '52600000-0000-4000-8000-000000000002', 'Mission B', 'Help a small group solve a real problem.', 'It fits the approved profile evidence and current context.', 'Students nearby', 'Test one small useful guide with three students.', 'four_weeks', 'Three students use it and respond.', 'Start small with trusted guidance.', array['52200000-0000-4000-8000-000000000002'::uuid, '52400000-0000-4000-8000-000000000002'::uuid], 'test', 'v1');

set local role anon;
set local "request.jwt.claim.sub" = '';
select throws_ok($$select count(*)::int from public.user_missions$$, '42501', null, 'anonymous cannot read missions');
select throws_ok($$select count(*)::int from public.mission_generation_requests$$, '42501', null, 'anonymous cannot read requests');
select throws_ok($$select public.activate_stage5_mission('51700000-0000-4000-8000-000000000001')$$, '42501', null, 'anonymous cannot activate');

set local role authenticated;
set local "request.jwt.claim.sub" = '51000000-0000-4000-8000-000000000001';
select results_eq($$select count(*)::int from public.user_missions$$, array[1], 'user A reads own mission');
select results_eq($$select count(*)::int from public.mission_generation_requests$$, array[1], 'user A reads own request');
select results_eq($$select count(*)::int from public.user_missions where user_id='52000000-0000-4000-8000-000000000002'$$, array[0], 'user A cannot read user B mission');
select throws_ok($$update public.user_missions set status='active'$$, '42501', null, 'user cannot set mission status directly');
select throws_ok($$insert into public.user_missions (user_id) values ('51000000-0000-4000-8000-000000000001')$$, '42501', null, 'user cannot forge generated mission');
select throws_ok($$select public.activate_stage5_mission('52800000-0000-4000-8000-000000000002')$$, 'P0001', 'MISSION_NOT_FOUND', 'user A cannot activate user B mission');
select lives_ok($$select public.activate_stage5_mission('51700000-0000-4000-8000-000000000001')$$, 'user A activates own draft mission');
select results_eq($$select count(*)::int from public.user_missions where status='active'$$, array[1], 'only one own active mission is visible');

select * from finish();
rollback;
