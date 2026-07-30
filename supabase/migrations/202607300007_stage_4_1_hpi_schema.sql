-- Stage 4.1: private Human Potential evidence, provenance and profile foundation.
-- This migration creates no insights or profiles. All system-managed writes flow
-- through controlled functions added in the following migration.

create type public.hpi_evidence_source_type as enum ('discovery_response');
create type public.hpi_evidence_category as enum (
  'current_reality', 'interest', 'capability', 'experience', 'value',
  'environment', 'constraint', 'motivation', 'readiness'
);
create type public.hpi_evidence_status as enum ('eligible', 'invalidated', 'superseded');
create type public.hpi_sensitivity_level as enum ('standard', 'sensitive');
create type public.hpi_request_status as enum (
  'pending', 'validating', 'ready', 'processing', 'completed', 'failed',
  'cancelled', 'superseded'
);
create type public.hpi_insight_type as enum (
  'strength_pattern', 'interest_pattern', 'value_pattern', 'capability_pattern',
  'environmental_preference', 'problem_orientation', 'contribution_orientation',
  'growth_need', 'constraint', 'motivation_pattern', 'readiness_pattern'
);
create type public.hpi_insight_status as enum ('draft', 'active', 'rejected', 'superseded', 'archived');
create type public.hpi_confidence_level as enum ('low', 'emerging', 'moderate', 'strong');
create type public.hpi_support_type as enum ('supporting', 'contradicting', 'context');
create type public.hpi_uncertainty_type as enum (
  'insufficient_examples', 'conflicting_evidence', 'low_response_detail',
  'age_or_life_stage', 'context_specific', 'outdated_evidence', 'possible_response_bias'
);
create type public.hpi_feedback_type as enum (
  'confirmed', 'partly_true', 'not_true', 'needs_context', 'unsure', 'edited'
);
create type public.hpi_profile_version_status as enum ('draft', 'active', 'superseded', 'archived');
create type public.hpi_profile_item_visibility as enum ('private');

create table public.evidence_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_type public.hpi_evidence_source_type not null,
  source_id uuid not null,
  source_version integer not null check (source_version > 0),
  source_key text not null check (source_key ~ '^[a-z][a-z0-9_]{2,49}$'),
  category public.hpi_evidence_category not null,
  subcategory text,
  content_summary text,
  structured_value jsonb not null,
  sensitivity_level public.hpi_sensitivity_level not null,
  age_restriction public.age_band,
  evidence_status public.hpi_evidence_status not null default 'eligible',
  occurred_at timestamptz,
  captured_at timestamptz not null default now(),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, source_type, source_id, source_version, content_hash)
);
create index evidence_records_user_eligible_idx on public.evidence_records (user_id, evidence_status, created_at desc);
create index evidence_records_source_idx on public.evidence_records (source_type, source_id, source_version);

create table public.interpretation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_type text not null default 'human_potential_profile' check (request_type = 'human_potential_profile'),
  status public.hpi_request_status not null default 'pending',
  evidence_snapshot_version integer not null default 1 check (evidence_snapshot_version > 0),
  question_set_version integer not null check (question_set_version > 0),
  interpretation_schema_version text not null,
  prompt_version text not null,
  consent_policy_version text not null,
  provider text,
  model text,
  age_band public.age_band not null,
  is_minor boolean not null,
  safeguarding_review_required boolean not null default false,
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  idempotency_key uuid not null,
  failure_code text,
  failure_detail_safe text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create unique index interpretation_requests_active_snapshot_idx
  on public.interpretation_requests (user_id, question_set_version, interpretation_schema_version, prompt_version)
  where status in ('pending', 'validating', 'ready', 'processing');

create table public.interpretation_request_evidence (
  interpretation_request_id uuid not null references public.interpretation_requests(id) on delete restrict,
  evidence_record_id uuid not null references public.evidence_records(id) on delete restrict,
  included_reason text not null check (char_length(included_reason) between 1 and 280),
  source_version integer not null check (source_version > 0),
  created_at timestamptz not null default now(),
  primary key (interpretation_request_id, evidence_record_id)
);

create table public.potential_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  interpretation_request_id uuid not null references public.interpretation_requests(id) on delete restrict,
  insight_type public.hpi_insight_type not null,
  insight_key text not null check (insight_key ~ '^[a-z][a-z0-9_]{2,79}$'),
  title text not null check (char_length(title) between 1 and 120),
  summary text not null check (char_length(summary) between 1 and 320),
  description text not null check (char_length(description) between 1 and 1200),
  confidence_level public.hpi_confidence_level not null,
  confidence_score numeric(4,3) not null check (confidence_score >= 0 and confidence_score <= 1),
  confidence_factors jsonb not null,
  status public.hpi_insight_status not null default 'draft',
  sensitivity_level public.hpi_sensitivity_level not null,
  schema_version text not null,
  suggested_confirmation_question text check (char_length(suggested_confirmation_question) <= 400),
  age_appropriate boolean not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  superseded_at timestamptz,
  unique (interpretation_request_id, insight_key)
);
create index potential_insights_user_status_idx on public.potential_insights (user_id, status, created_at desc);

create table public.insight_evidence_links (
  insight_id uuid not null references public.potential_insights(id) on delete restrict,
  evidence_record_id uuid not null references public.evidence_records(id) on delete restrict,
  support_type public.hpi_support_type not null,
  support_weight numeric(4,3) not null check (support_weight > 0 and support_weight <= 1),
  explanation text not null check (char_length(explanation) between 1 and 500),
  created_at timestamptz not null default now(),
  primary key (insight_id, evidence_record_id, support_type)
);

create table public.insight_uncertainties (
  id uuid primary key default gen_random_uuid(),
  insight_id uuid not null references public.potential_insights(id) on delete restrict,
  uncertainty_type public.hpi_uncertainty_type not null,
  description text not null check (char_length(description) between 1 and 400),
  created_at timestamptz not null default now()
);

create table public.insight_user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  insight_id uuid not null references public.potential_insights(id) on delete restrict,
  feedback_type public.hpi_feedback_type not null,
  replacement_text text check (char_length(replacement_text) <= 600),
  reason text check (char_length(reason) <= 600),
  created_at timestamptz not null default now(),
  check ((feedback_type <> 'edited') or replacement_text is not null)
);
create index insight_user_feedback_user_idx on public.insight_user_feedback (user_id, created_at desc);

create table public.human_potential_profile_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  version integer not null check (version > 0),
  status public.hpi_profile_version_status not null default 'draft',
  source_interpretation_request_id uuid not null references public.interpretation_requests(id) on delete restrict,
  schema_version text not null,
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  superseded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  unique (user_id, version)
);
create unique index human_potential_profile_one_active_idx
  on public.human_potential_profile_versions (user_id) where status = 'active';

create table public.human_potential_profile_items (
  profile_version_id uuid not null references public.human_potential_profile_versions(id) on delete restrict,
  insight_id uuid not null references public.potential_insights(id) on delete restrict,
  display_order integer not null check (display_order >= 0),
  visibility public.hpi_profile_item_visibility not null default 'private',
  created_at timestamptz not null default now(),
  primary key (profile_version_id, insight_id),
  unique (profile_version_id, display_order)
);

alter table public.evidence_records enable row level security;
alter table public.interpretation_requests enable row level security;
alter table public.interpretation_request_evidence enable row level security;
alter table public.potential_insights enable row level security;
alter table public.insight_evidence_links enable row level security;
alter table public.insight_uncertainties enable row level security;
alter table public.insight_user_feedback enable row level security;
alter table public.human_potential_profile_versions enable row level security;
alter table public.human_potential_profile_items enable row level security;

revoke all on public.evidence_records, public.interpretation_requests,
  public.interpretation_request_evidence, public.potential_insights,
  public.insight_evidence_links, public.insight_uncertainties,
  public.insight_user_feedback, public.human_potential_profile_versions,
  public.human_potential_profile_items from anon, authenticated;
grant select on public.evidence_records, public.interpretation_requests,
  public.potential_insights, public.insight_user_feedback,
  public.human_potential_profile_versions to authenticated;

create policy evidence_records_own_select on public.evidence_records for select to authenticated using (user_id = auth.uid());
create policy interpretation_requests_own_select on public.interpretation_requests for select to authenticated using (user_id = auth.uid());
create policy potential_insights_own_select on public.potential_insights for select to authenticated using (user_id = auth.uid());
create policy insight_user_feedback_own_select on public.insight_user_feedback for select to authenticated using (user_id = auth.uid());
create policy profile_versions_own_select on public.human_potential_profile_versions for select to authenticated using (user_id = auth.uid());

-- Keep provenance links private: browser clients do not receive direct table access.
-- Controlled functions in the next migration enforce same-user and same-request links.
