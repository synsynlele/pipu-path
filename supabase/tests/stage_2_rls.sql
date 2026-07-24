begin;
select plan(19);

select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'user_preferences', 'preferences exists');
select has_table('public', 'user_consents', 'consents exists');
select has_table('public', 'onboarding_checkpoints', 'checkpoint exists');
select policies_are(
  'public', 'profiles',
  array['profiles_select_own', 'profiles_update_safe_fields'],
  'profiles has only self policies'
);
select isnt_empty(
  $$select 1 from pg_class where relname = 'profiles' and relrowsecurity$$,
  'profiles RLS is enabled'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'a@example.test', '', now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'b@example.test', '', now(), '{}', '{}', now(), now());

set local role anon;
set local "request.jwt.claim.sub" = '';
select throws_ok($$select count(*)::int from public.profiles$$, '42501', null, 'anon cannot count profiles');
select throws_ok($$insert into public.profiles(id) values ('30000000-0000-0000-0000-000000000003')$$, '42501', null, 'anon cannot insert profiles');
select throws_ok($$update public.profiles set preferred_name='x'$$, '42501', null, 'anon cannot update profiles');
select throws_ok($$delete from public.profiles$$, '42501', null, 'anon cannot delete profiles');
select throws_ok($$select count(*)::int from public.user_preferences$$, '42501', null, 'anon cannot access preferences');
select throws_ok($$select count(*)::int from public.user_consents$$, '42501', null, 'anon cannot access consents');

set local role authenticated;
set local "request.jwt.claim.sub" = '10000000-0000-0000-0000-000000000001';
select results_eq($$select count(*)::int from public.profiles$$, array[1], 'user A reads own profile');
select results_eq($$select count(*)::int from public.profiles where id='20000000-0000-0000-0000-000000000002'$$, array[0], 'user A cannot read B');
select lives_ok($$update public.profiles set preferred_name='Builder A' where id='10000000-0000-0000-0000-000000000001'$$, 'user A updates allowed own field');
select throws_ok($$update public.profiles set account_status='suspended' where id='10000000-0000-0000-0000-000000000001'$$, '42501', null, 'user A cannot update protected status');
select lives_ok($$update public.profiles set preferred_name='Blocked' where id='20000000-0000-0000-0000-000000000002'$$, 'cross-user update affects no visible rows');
select results_eq($$select count(*)::int from public.user_preferences$$, array[1], 'user A reads own preferences');

set local "request.jwt.claim.sub" = '20000000-0000-0000-0000-000000000002';
select results_eq($$select count(*)::int from public.profiles$$, array[1], 'user B reads own profile');

select * from finish();
rollback;
