create extension if not exists citext with schema extensions;

create type public.age_band as enum (
  'under_13', '13_15', '16_17', '18_24', '25_plus', 'unknown'
);
create type public.account_status as enum ('active', 'restricted', 'suspended', 'deleted');
create type public.identity_checkpoint_status as enum ('not_started', 'in_progress', 'completed');
create type public.onboarding_status as enum ('identity_required', 'stage_3_ready');
create type public.profile_visibility as enum ('private');
create type public.consent_status as enum ('granted', 'withdrawn', 'declined');
create type public.consent_source as enum (
  'identity_checkpoint', 'settings', 'guardian', 'institution', 'admin'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_name text,
  username extensions.citext unique,
  avatar_path text,
  general_location text,
  country_code text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  primary_language text,
  age_band public.age_band not null default 'unknown',
  life_stage text,
  education_level text,
  account_status public.account_status not null default 'active',
  onboarding_status public.onboarding_status not null default 'identity_required',
  profile_visibility public.profile_visibility not null default 'private',
  is_minor boolean generated always as (
    age_band in ('under_13', '13_15', '16_17')
  ) stored,
  safeguarding_review_required boolean not null default false,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint username_format check (
    username is null or username::text ~ '^[a-z][a-z0-9_]{2,29}$'
  ),
  constraint preferred_name_length check (
    preferred_name is null or char_length(preferred_name) between 1 and 80
  )
);

create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  interface jsonb not null default '{"theme":"system","reduced_motion":false}'::jsonb,
  accessibility jsonb not null default '{}'::jsonb,
  communication jsonb not null default '{}'::jsonb,
  magicpen jsonb not null default '{}'::jsonb,
  notifications jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  consent_type text not null check (consent_type in (
    'terms', 'privacy', 'ai_processing', 'age_declaration',
    'guardian_required', 'public_profile', 'research_analytics'
  )),
  policy_version text not null check (char_length(policy_version) between 1 and 40),
  status public.consent_status not null,
  source public.consent_source not null,
  occurred_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint withdrawal_consistency check (
    (status = 'withdrawn' and withdrawn_at is not null)
    or (status <> 'withdrawn' and withdrawn_at is null)
  )
);

create index user_consents_user_type_time_idx
  on public.user_consents (user_id, consent_type, occurred_at desc);

create table public.onboarding_checkpoints (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_stage text not null default 'identity',
  current_step text not null default 'profile',
  status public.identity_checkpoint_status not null default 'not_started',
  resume_path text not null default '/onboarding/identity',
  version integer not null default 1 check (version > 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stage_2_checkpoint_only check (current_stage = 'identity'),
  constraint checkpoint_completion_consistency check (
    (status = 'completed' and completed_at is not null and resume_path = '/app')
    or (
      status <> 'completed'
      and completed_at is null
      and resume_path = '/onboarding/identity'
    )
  )
);

create table public.identity_audit_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  operation text not null,
  result text not null check (result in ('success', 'failure')),
  error_code text,
  request_id uuid,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger preferences_updated_at before update on public.user_preferences
for each row execute function public.set_updated_at();
create trigger checkpoints_updated_at before update on public.onboarding_checkpoints
for each row execute function public.set_updated_at();

create or replace function public.provision_identity(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and auth.uid() <> target_user_id then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  insert into public.profiles (id) values (target_user_id)
  on conflict (id) do nothing;
  insert into public.user_preferences (user_id) values (target_user_id)
  on conflict (user_id) do nothing;
  insert into public.onboarding_checkpoints (user_id) values (target_user_id)
  on conflict (user_id) do nothing;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.provision_identity(new.id);
  insert into public.identity_audit_events (user_id, operation, result)
  values (new.id, 'account_provisioned', 'success');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.complete_identity_checkpoint(
  preferred_name_input text,
  username_input text,
  age_band_input public.age_band,
  policy_version_input text,
  accept_terms boolean,
  accept_privacy boolean,
  accept_ai boolean
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  checkpoint_status public.identity_checkpoint_status;
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not (accept_terms and accept_privacy and accept_ai) then
    raise exception 'required consent missing' using errcode = '22023';
  end if;
  if age_band_input = 'unknown' then
    raise exception 'age declaration required' using errcode = '22023';
  end if;

  perform public.provision_identity(actor);

  select status into checkpoint_status
  from public.onboarding_checkpoints
  where user_id = actor
  for update;

  if checkpoint_status = 'completed' then
    return;
  end if;

  update public.profiles set
    preferred_name = trim(preferred_name_input),
    display_name = trim(preferred_name_input),
    username = lower(trim(username_input))::extensions.citext,
    age_band = age_band_input,
    safeguarding_review_required = age_band_input in ('under_13', '13_15', '16_17'),
    onboarding_status = 'stage_3_ready'
  where id = actor;

  insert into public.user_consents (
    user_id, consent_type, policy_version, status, source
  ) values
    (actor, 'terms', policy_version_input, 'granted', 'identity_checkpoint'),
    (actor, 'privacy', policy_version_input, 'granted', 'identity_checkpoint'),
    (actor, 'ai_processing', policy_version_input, 'granted', 'identity_checkpoint'),
    (actor, 'age_declaration', policy_version_input, 'granted', 'identity_checkpoint');

  if age_band_input in ('under_13', '13_15', '16_17') then
    insert into public.user_consents (
      user_id, consent_type, policy_version, status, source
    ) values (
      actor, 'guardian_required', policy_version_input, 'declined',
      'identity_checkpoint'
    );
  end if;

  update public.onboarding_checkpoints set
    current_step = 'completed',
    status = 'completed',
    resume_path = '/app',
    completed_at = now(),
    version = version + 1
  where user_id = actor and status <> 'completed';

  insert into public.identity_audit_events (user_id, operation, result)
  values (actor, 'identity_checkpoint_completed', 'success');
exception
  when unique_violation then
    raise exception 'username unavailable' using errcode = '23505';
end;
$$;

create or replace function public.withdraw_consent(
  consent_type_input text,
  policy_version_input text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  latest_status public.consent_status;
begin
  if actor is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select status into latest_status
  from public.user_consents
  where user_id = actor and consent_type = consent_type_input
  order by occurred_at desc
  limit 1;

  if latest_status is distinct from 'granted' then
    raise exception 'consent is not currently granted' using errcode = '22023';
  end if;

  insert into public.user_consents (
    user_id, consent_type, policy_version, status, source, withdrawn_at
  ) values (
    actor, consent_type_input, policy_version_input, 'withdrawn', 'settings', now()
  );

  insert into public.identity_audit_events (user_id, operation, result)
  values (actor, 'consent_withdrawn', 'success');
end;
$$;

revoke all on function public.provision_identity(uuid) from public;
grant execute on function public.provision_identity(uuid)
to authenticated, service_role;
revoke all on function public.complete_identity_checkpoint(
  text, text, public.age_band, text, boolean, boolean, boolean
) from public;
grant execute on function public.complete_identity_checkpoint(
  text, text, public.age_band, text, boolean, boolean, boolean
) to authenticated;
revoke all on function public.withdraw_consent(text, text) from public;
grant execute on function public.withdraw_consent(text, text) to authenticated;

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_consents enable row level security;
alter table public.onboarding_checkpoints enable row level security;
alter table public.identity_audit_events enable row level security;

create policy profiles_select_own on public.profiles
for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_safe_fields on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy preferences_select_own on public.user_preferences
for select to authenticated using ((select auth.uid()) = user_id);
create policy preferences_update_own on public.user_preferences
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy consents_select_own on public.user_consents
for select to authenticated using ((select auth.uid()) = user_id);

create policy checkpoints_select_own on public.onboarding_checkpoints
for select to authenticated using ((select auth.uid()) = user_id);

grant select on public.profiles, public.user_preferences, public.user_consents,
  public.onboarding_checkpoints to authenticated;
grant update (
  display_name, preferred_name, username, avatar_path, general_location,
  country_code, primary_language, life_stage, education_level, last_active_at
) on public.profiles to authenticated;
grant update (
  interface, accessibility, communication, magicpen, notifications
) on public.user_preferences to authenticated;

revoke all on public.profiles, public.user_preferences, public.user_consents,
  public.onboarding_checkpoints, public.identity_audit_events from anon;

