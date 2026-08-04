-- Stage 9: selective, adult-only publication of one completed Builder Project.
create type public.project_portfolio_status as enum (
  'draft',
  'published',
  'withdrawn'
);

create table public.builder_project_portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null unique references public.builder_projects(id) on delete cascade,
  slug extensions.citext not null unique,
  builder_name text not null check (char_length(builder_name) between 2 and 80),
  public_title text not null check (char_length(public_title) between 3 and 100),
  public_summary text not null check (char_length(public_summary) between 40 and 1000),
  public_problem text not null check (char_length(public_problem) between 20 and 800),
  public_audience text not null check (char_length(public_audience) between 10 and 400),
  public_outcome text not null check (char_length(public_outcome) between 20 and 800),
  impact_signal text not null check (char_length(impact_signal) between 10 and 500),
  milestone_summaries text[] not null check (cardinality(milestone_summaries) = 3),
  proof_link text check (
    proof_link is null
    or (
      char_length(proof_link) between 8 and 500
      and proof_link ~* '^https://'
    )
  ),
  status public.project_portfolio_status not null default 'draft',
  consent_version text check (
    consent_version is null or char_length(consent_version) between 1 and 40
  ),
  consent_confirmed_at timestamptz,
  published_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint builder_project_portfolio_state_consistency check (
    (
      status = 'draft'
      and consent_confirmed_at is null
      and published_at is null
      and withdrawn_at is null
    )
    or (
      status = 'published'
      and consent_version is not null
      and consent_confirmed_at is not null
      and published_at is not null
      and withdrawn_at is null
    )
    or (
      status = 'withdrawn'
      and consent_version is not null
      and consent_confirmed_at is not null
      and published_at is not null
      and withdrawn_at is not null
    )
  )
);

create unique index builder_project_portfolios_one_published_user_idx
  on public.builder_project_portfolios(user_id)
  where status = 'published';

create index builder_project_portfolios_user_status_idx
  on public.builder_project_portfolios(user_id, status, updated_at desc);
create index builder_project_portfolios_project_idx
  on public.builder_project_portfolios(project_id);

alter table public.builder_project_portfolios enable row level security;

revoke all on public.builder_project_portfolios
from public, anon, authenticated;

grant select on public.builder_project_portfolios to authenticated;

create policy builder_project_portfolios_own_select
on public.builder_project_portfolios for select to authenticated
using ((select auth.uid()) = user_id);

create trigger builder_project_portfolios_updated_at
before update on public.builder_project_portfolios
for each row execute function public.set_updated_at();

create or replace function public.save_stage9_project_portfolio(
  project_id_input uuid,
  builder_name_input text,
  public_title_input text,
  public_summary_input text,
  public_problem_input text,
  public_audience_input text,
  public_outcome_input text,
  impact_signal_input text,
  milestone_summaries_input jsonb,
  proof_link_input text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  actor_profile public.profiles%rowtype;
  project_row public.builder_projects%rowtype;
  portfolio_row public.builder_project_portfolios%rowtype;
  summary_item jsonb;
  summaries text[] := '{}';
  clean_link text := nullif(trim(coalesce(proof_link_input, '')), '');
  slug_base text;
  portfolio_id uuid;
begin
  if actor is null then
    raise exception 'PORTFOLIO_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select * into actor_profile
  from public.profiles
  where id = actor
    and account_status = 'active';

  if actor_profile.id is null then
    raise exception 'PORTFOLIO_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  if actor_profile.age_band not in ('18_24', '25_plus')
    or actor_profile.safeguarding_review_required then
    raise exception 'PORTFOLIO_ADULT_REQUIRED' using errcode = 'P0001';
  end if;

  select * into project_row
  from public.builder_projects
  where id = project_id_input
    and user_id = actor
    and status = 'completed'
  for update;

  if project_row.id is null then
    raise exception 'PORTFOLIO_COMPLETED_PROJECT_REQUIRED' using errcode = 'P0001';
  end if;

  if (
    select count(*)
    from public.builder_project_milestones
    where project_id = project_row.id
      and user_id = actor
      and status = 'completed'
  ) <> 3 then
    raise exception 'PORTFOLIO_COMPLETED_PROJECT_REQUIRED' using errcode = 'P0001';
  end if;

  if char_length(trim(builder_name_input)) not between 2 and 80
    or char_length(trim(public_title_input)) not between 3 and 100
    or char_length(trim(public_summary_input)) not between 40 and 1000
    or char_length(trim(public_problem_input)) not between 20 and 800
    or char_length(trim(public_audience_input)) not between 10 and 400
    or char_length(trim(public_outcome_input)) not between 20 and 800
    or char_length(trim(impact_signal_input)) not between 10 and 500 then
    raise exception 'PORTFOLIO_INPUT_INVALID' using errcode = 'P0001';
  end if;

  if jsonb_typeof(milestone_summaries_input) <> 'array'
    or jsonb_array_length(milestone_summaries_input) <> 3 then
    raise exception 'PORTFOLIO_MILESTONES_INVALID' using errcode = 'P0001';
  end if;

  for summary_item in
    select value from jsonb_array_elements(milestone_summaries_input)
  loop
    if jsonb_typeof(summary_item) <> 'string'
      or char_length(trim(summary_item #>> '{}')) not between 10 and 500 then
      raise exception 'PORTFOLIO_MILESTONES_INVALID' using errcode = 'P0001';
    end if;
    summaries := array_append(summaries, trim(summary_item #>> '{}'));
  end loop;

  if clean_link is not null
    and (
      char_length(clean_link) not between 8 and 500
      or clean_link !~* '^https://'
    ) then
    raise exception 'PORTFOLIO_PROOF_LINK_INVALID' using errcode = 'P0001';
  end if;

  select * into portfolio_row
  from public.builder_project_portfolios
  where project_id = project_row.id
    and user_id = actor
  for update;

  if portfolio_row.id is not null and portfolio_row.status = 'published' then
    raise exception 'PORTFOLIO_WITHDRAW_REQUIRED' using errcode = 'P0001';
  end if;

  if portfolio_row.id is null then
    slug_base := trim(both '-' from regexp_replace(
      lower(trim(public_title_input)),
      '[^a-z0-9]+',
      '-',
      'g'
    ));
    if slug_base = '' then
      slug_base := 'builder-proof';
    end if;
    slug_base := left(slug_base, 48);

    insert into public.builder_project_portfolios (
      user_id,
      project_id,
      slug,
      builder_name,
      public_title,
      public_summary,
      public_problem,
      public_audience,
      public_outcome,
      impact_signal,
      milestone_summaries,
      proof_link
    ) values (
      actor,
      project_row.id,
      (slug_base || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))::extensions.citext,
      trim(builder_name_input),
      trim(public_title_input),
      trim(public_summary_input),
      trim(public_problem_input),
      trim(public_audience_input),
      trim(public_outcome_input),
      trim(impact_signal_input),
      summaries,
      clean_link
    ) returning id into portfolio_id;
  else
    update public.builder_project_portfolios
    set
      builder_name = trim(builder_name_input),
      public_title = trim(public_title_input),
      public_summary = trim(public_summary_input),
      public_problem = trim(public_problem_input),
      public_audience = trim(public_audience_input),
      public_outcome = trim(public_outcome_input),
      impact_signal = trim(impact_signal_input),
      milestone_summaries = summaries,
      proof_link = clean_link,
      status = 'draft',
      consent_version = null,
      consent_confirmed_at = null,
      published_at = null,
      withdrawn_at = null
    where id = portfolio_row.id
    returning id into portfolio_id;
  end if;

  insert into public.identity_audit_events (
    user_id,
    operation,
    result,
    metadata
  ) values (
    actor,
    'project_portfolio_saved',
    'success',
    jsonb_build_object(
      'portfolio_id', portfolio_id,
      'project_id', project_row.id,
      'status', 'draft'
    )
  );

  return portfolio_id;
exception
  when check_violation then
    raise exception 'PORTFOLIO_INPUT_INVALID' using errcode = 'P0001';
end
$$;

create or replace function public.publish_stage9_project_portfolio(
  portfolio_id_input uuid,
  consent_confirmed_input boolean,
  consent_version_input text
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  actor_profile public.profiles%rowtype;
  portfolio_row public.builder_project_portfolios%rowtype;
begin
  if actor is null then
    raise exception 'PORTFOLIO_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select * into actor_profile
  from public.profiles
  where id = actor
    and account_status = 'active';

  if actor_profile.id is null
    or actor_profile.age_band not in ('18_24', '25_plus')
    or actor_profile.safeguarding_review_required then
    raise exception 'PORTFOLIO_ADULT_REQUIRED' using errcode = 'P0001';
  end if;

  if not consent_confirmed_input
    or trim(consent_version_input) <> 'project-portfolio-v1' then
    raise exception 'PORTFOLIO_CONSENT_REQUIRED' using errcode = 'P0001';
  end if;

  select * into portfolio_row
  from public.builder_project_portfolios
  where id = portfolio_id_input
    and user_id = actor
    and status in ('draft', 'withdrawn')
  for update;

  if portfolio_row.id is null then
    raise exception 'PORTFOLIO_NOT_PUBLISHABLE' using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.builder_projects project
    where project.id = portfolio_row.project_id
      and project.user_id = actor
      and project.status = 'completed'
  ) or (
    select count(*)
    from public.builder_project_milestones milestone
    where milestone.project_id = portfolio_row.project_id
      and milestone.user_id = actor
      and milestone.status = 'completed'
  ) <> 3 then
    raise exception 'PORTFOLIO_COMPLETED_PROJECT_REQUIRED' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.builder_project_portfolios
    where user_id = actor
      and status = 'published'
      and id <> portfolio_row.id
  ) then
    raise exception 'PORTFOLIO_ALREADY_PUBLISHED' using errcode = 'P0001';
  end if;

  update public.builder_project_portfolios
  set
    status = 'published',
    consent_version = 'project-portfolio-v1',
    consent_confirmed_at = now(),
    published_at = now(),
    withdrawn_at = null
  where id = portfolio_row.id;

  insert into public.user_consents (
    user_id,
    consent_type,
    policy_version,
    status,
    source,
    metadata
  ) values (
    actor,
    'public_profile',
    'project-portfolio-v1',
    'granted',
    'settings',
    jsonb_build_object(
      'portfolio_id', portfolio_row.id,
      'project_id', portfolio_row.project_id
    )
  );

  insert into public.identity_audit_events (
    user_id,
    operation,
    result,
    metadata
  ) values (
    actor,
    'project_portfolio_published',
    'success',
    jsonb_build_object(
      'portfolio_id', portfolio_row.id,
      'project_id', portfolio_row.project_id,
      'slug', portfolio_row.slug::text
    )
  );

  return portfolio_row.slug::text;
exception
  when unique_violation then
    raise exception 'PORTFOLIO_ALREADY_PUBLISHED' using errcode = 'P0001';
end
$$;

create or replace function public.withdraw_stage9_project_portfolio(
  portfolio_id_input uuid
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  portfolio_row public.builder_project_portfolios%rowtype;
begin
  if actor is null then
    raise exception 'PORTFOLIO_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select * into portfolio_row
  from public.builder_project_portfolios
  where id = portfolio_id_input
    and user_id = actor
    and status = 'published'
  for update;

  if portfolio_row.id is null then
    raise exception 'PORTFOLIO_NOT_PUBLISHED' using errcode = 'P0001';
  end if;

  update public.builder_project_portfolios
  set
    status = 'withdrawn',
    withdrawn_at = now()
  where id = portfolio_row.id;

  insert into public.user_consents (
    user_id,
    consent_type,
    policy_version,
    status,
    source,
    withdrawn_at,
    metadata
  ) values (
    actor,
    'public_profile',
    'project-portfolio-v1',
    'withdrawn',
    'settings',
    now(),
    jsonb_build_object(
      'portfolio_id', portfolio_row.id,
      'project_id', portfolio_row.project_id
    )
  );

  insert into public.identity_audit_events (
    user_id,
    operation,
    result,
    metadata
  ) values (
    actor,
    'project_portfolio_withdrawn',
    'success',
    jsonb_build_object(
      'portfolio_id', portfolio_row.id,
      'project_id', portfolio_row.project_id
    )
  );

  return true;
end
$$;

create or replace function public.get_stage9_public_portfolio(
  slug_input text
) returns table (
  slug text,
  builder_name text,
  public_title text,
  public_summary text,
  public_problem text,
  public_audience text,
  public_outcome text,
  impact_signal text,
  milestone_summaries text[],
  proof_link text,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    portfolio.slug::text,
    portfolio.builder_name,
    portfolio.public_title,
    portfolio.public_summary,
    portfolio.public_problem,
    portfolio.public_audience,
    portfolio.public_outcome,
    portfolio.impact_signal,
    portfolio.milestone_summaries,
    portfolio.proof_link,
    portfolio.published_at
  from public.builder_project_portfolios portfolio
  where portfolio.slug = lower(trim(slug_input))::extensions.citext
    and portfolio.status = 'published'
  limit 1;
$$;

revoke all on function public.save_stage9_project_portfolio(
  uuid, text, text, text, text, text, text, text, jsonb, text
) from public, anon;
grant execute on function public.save_stage9_project_portfolio(
  uuid, text, text, text, text, text, text, text, jsonb, text
) to authenticated;

revoke all on function public.publish_stage9_project_portfolio(
  uuid, boolean, text
) from public, anon;
grant execute on function public.publish_stage9_project_portfolio(
  uuid, boolean, text
) to authenticated;

revoke all on function public.withdraw_stage9_project_portfolio(uuid)
from public, anon;
grant execute on function public.withdraw_stage9_project_portfolio(uuid)
to authenticated;

revoke all on function public.get_stage9_public_portfolio(text)
from public, anon, authenticated;
grant execute on function public.get_stage9_public_portfolio(text)
to anon, authenticated;
