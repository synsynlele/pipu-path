-- Stage 12 Economic Pathways MVP.
-- Recommendations remain private and are tied to the exact Human Potential
-- Profile version that produced them. Browser clients can read only their own
-- recommendation; server-only service-role code owns generation, selection and
-- product-event writes.

create table public.economic_pathway_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  human_potential_profile_id uuid not null references public.human_potential_profile_versions(id) on delete restrict,
  schema_version text not null default 'economic-pathways-v1',
  possible_paths jsonb not null,
  earn_from_strengths jsonb not null,
  selected_path_key text,
  selected_at timestamptz,
  provider text not null,
  model text not null,
  prompt_version text not null,
  consent_policy_version text not null,
  age_band public.age_band not null,
  is_minor boolean not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint economic_pathway_possible_paths_array check (
    jsonb_typeof(possible_paths) = 'array'
    and jsonb_array_length(possible_paths) between 3 and 5
  ),
  constraint economic_pathway_earn_array check (
    jsonb_typeof(earn_from_strengths) = 'array'
    and jsonb_array_length(earn_from_strengths) between 3 and 5
  ),
  constraint economic_pathway_selection_consistency check (
    (selected_path_key is null and selected_at is null)
    or (selected_path_key is not null and selected_at is not null)
  ),
  unique (user_id, human_potential_profile_id)
);

create index economic_pathway_user_created_idx
  on public.economic_pathway_recommendations(user_id, created_at desc);

create trigger economic_pathway_recommendations_updated_at
before update on public.economic_pathway_recommendations
for each row execute function public.set_updated_at();

alter table public.economic_pathway_recommendations enable row level security;
revoke all on public.economic_pathway_recommendations from public, anon, authenticated;
grant select on public.economic_pathway_recommendations to authenticated;
grant select, insert, update on public.economic_pathway_recommendations to service_role;

create policy economic_pathway_recommendations_own_select
on public.economic_pathway_recommendations
for select to authenticated
using ((select auth.uid()) = user_id);

create table public.product_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_name text not null check (event_name in (
    'possible_paths_generated',
    'possible_paths_viewed',
    'path_selected',
    'path_changed',
    'pathway_started',
    'first_value_challenge_started',
    'first_value_challenge_completed'
  )),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index product_events_user_event_time_idx
  on public.product_events(user_id, event_name, occurred_at desc);

alter table public.product_events enable row level security;
revoke all on public.product_events from public, anon, authenticated;
grant select, insert on public.product_events to service_role;
