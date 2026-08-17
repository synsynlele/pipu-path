-- Stage 17: private, evidence-aware Personal Builder Guide.
-- Guide runs are created only by trusted server code after authenticated context,
-- consent and safety validation. Browser roles receive no direct table access.

create type public.builder_guide_intent as enum (
  'next_move',
  'improvement',
  'missing_evidence',
  'weekly_focus'
);

create type public.builder_guide_feedback_verdict as enum (
  'helpful',
  'not_helpful'
);

create table public.builder_guide_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  intent public.builder_guide_intent not null,
  schema_version text not null check (schema_version = 'builder-guide-v1'),
  living_profile_version_id uuid not null
    references public.builder_profile_versions(id) on delete restrict,
  human_potential_profile_id uuid not null
    references public.human_potential_profile_versions(id) on delete restrict,
  economic_pathway_recommendation_id uuid
    references public.economic_pathway_recommendations(id) on delete set null,
  mission_id uuid references public.user_missions(id) on delete set null,
  journey_id uuid references public.user_journeys(id) on delete set null,
  project_id uuid references public.builder_projects(id) on delete set null,
  context_fingerprint text not null check (context_fingerprint ~ '^[0-9a-f]{64}$'),
  provider text not null check (provider in ('openai', 'evidence_fallback')),
  model text not null check (char_length(model) between 2 and 120),
  prompt_version text not null check (prompt_version = 'stage17.v1'),
  consent_policy_version text not null check (char_length(consent_policy_version) between 1 and 120),
  advice jsonb not null check (jsonb_typeof(advice) = 'object'),
  created_at timestamptz not null default now()
);

create index builder_guide_runs_user_time_idx
  on public.builder_guide_runs(user_id, created_at desc);
create index builder_guide_runs_reuse_idx
  on public.builder_guide_runs(user_id, intent, context_fingerprint, created_at desc);
create index builder_guide_runs_profile_idx
  on public.builder_guide_runs(living_profile_version_id, created_at desc);

create table public.builder_guide_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  run_id uuid not null references public.builder_guide_runs(id) on delete cascade,
  verdict public.builder_guide_feedback_verdict not null,
  note text check (note is null or char_length(note) <= 600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint builder_guide_feedback_user_run_unique unique (user_id, run_id)
);

create index builder_guide_feedback_user_time_idx
  on public.builder_guide_feedback(user_id, created_at desc);

create trigger builder_guide_feedback_updated_at
before update on public.builder_guide_feedback
for each row execute function public.set_updated_at();

alter table public.builder_guide_runs enable row level security;
alter table public.builder_guide_feedback enable row level security;

revoke all on public.builder_guide_runs, public.builder_guide_feedback
  from public, anon, authenticated;
grant select, insert on public.builder_guide_runs to service_role;
grant select, insert, update on public.builder_guide_feedback to service_role;

-- Extend the privacy-safe product telemetry vocabulary. Guide events carry only
-- bounded metadata; the recommendation body stays in the private Guide table.
alter table public.product_events
  drop constraint if exists product_events_event_name_check;

alter table public.product_events
  add constraint product_events_event_name_check check (event_name in (
    'possible_paths_generated',
    'possible_paths_viewed',
    'path_selected',
    'path_changed',
    'pathway_started',
    'first_value_challenge_started',
    'first_value_challenge_completed',
    'feature_viewed',
    'collaboration_invited',
    'collaboration_accepted',
    'collaboration_contribution_added',
    'collaboration_completed',
    'builder_guide_generated',
    'builder_guide_feedback'
  ));

alter table public.product_events
  drop constraint if exists product_events_feature_key_check;

alter table public.product_events
  add constraint product_events_feature_key_check check (
    feature_key is null or feature_key in (
      'home',
      'profile',
      'journey',
      'build',
      'portfolio',
      'connect',
      'guide'
    )
  );
