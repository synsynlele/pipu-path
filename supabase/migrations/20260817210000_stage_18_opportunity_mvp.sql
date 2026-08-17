-- Stage 18: curated, explainable Opportunity MVP.
-- Supply is administrator-controlled. Builder state is private. Browser roles
-- receive no direct table access; allow-listed authenticated RPCs enforce roles
-- and ownership.

create type public.opportunity_category as enum (
  'competition',
  'scholarship',
  'internship',
  'challenge',
  'grant',
  'apprenticeship',
  'volunteer_project',
  'entrepreneurship'
);

create type public.opportunity_geography_scope as enum ('global', 'country', 'region');
create type public.opportunity_delivery_mode as enum (
  'in_person', 'remote', 'hybrid', 'unspecified'
);
create type public.opportunity_review_status as enum ('pending', 'approved', 'rejected');
create type public.opportunity_publication_status as enum ('draft', 'published', 'withdrawn');
create type public.opportunity_builder_outcome as enum (
  'accepted', 'not_selected', 'withdrawn', 'other'
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  provider_name text not null check (char_length(provider_name) between 2 and 160),
  category public.opportunity_category not null,
  summary text not null check (char_length(summary) between 20 and 1200),
  eligibility_summary text not null check (char_length(eligibility_summary) between 10 and 1200),
  benefit_summary text not null check (char_length(benefit_summary) between 5 and 600),
  min_age smallint check (min_age is null or min_age between 0 and 120),
  max_age smallint check (max_age is null or max_age between 0 and 120),
  geography_scope public.opportunity_geography_scope not null,
  country_codes text[] not null default '{}'::text[] check (cardinality(country_codes) <= 20),
  geography_label text not null check (char_length(geography_label) between 2 and 180),
  delivery_mode public.opportunity_delivery_mode not null default 'unspecified',
  pathway_tags text[] not null default '{}'::text[] check (cardinality(pathway_tags) <= 12),
  capability_tags text[] not null default '{}'::text[] check (cardinality(capability_tags) <= 12),
  official_url text not null check (
    char_length(official_url) between 8 and 1000
    and official_url ~* '^https://'
  ),
  deadline_date date,
  review_status public.opportunity_review_status not null default 'pending',
  publication_status public.opportunity_publication_status not null default 'draft',
  review_notes text check (review_notes is null or char_length(review_notes) <= 1000),
  created_by uuid not null references public.profiles(id) on delete restrict,
  reviewed_by uuid references public.profiles(id) on delete restrict,
  reviewed_at timestamptz,
  published_by uuid references public.profiles(id) on delete restrict,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunities_age_order check (
    min_age is null or max_age is null or min_age <= max_age
  ),
  constraint opportunities_geography_consistency check (
    (geography_scope = 'global' and cardinality(country_codes) = 0)
    or (geography_scope <> 'global' and cardinality(country_codes) > 0)
  ),
  constraint opportunities_review_consistency check (
    (review_status = 'pending' and reviewed_by is null and reviewed_at is null)
    or (review_status <> 'pending' and reviewed_by is not null and reviewed_at is not null)
  ),
  constraint opportunities_publication_consistency check (
    publication_status <> 'published'
    or (
      review_status = 'approved'
      and published_by is not null
      and published_at is not null
    )
  )
);

create index opportunities_public_catalog_idx
  on public.opportunities(publication_status, review_status, deadline_date);
create index opportunities_category_idx
  on public.opportunities(category, publication_status, deadline_date);

create trigger opportunities_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();

create table public.builder_opportunity_state (
  user_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  saved_at timestamptz,
  applied_at timestamptz,
  outcome public.opportunity_builder_outcome,
  outcome_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, opportunity_id),
  constraint builder_opportunity_outcome_consistency check (
    (outcome is null and outcome_at is null)
    or (outcome is not null and outcome_at is not null and applied_at is not null)
  )
);

create index builder_opportunity_state_user_time_idx
  on public.builder_opportunity_state(user_id, updated_at desc);

create trigger builder_opportunity_state_updated_at
before update on public.builder_opportunity_state
for each row execute function public.set_updated_at();

alter table public.opportunities enable row level security;
alter table public.builder_opportunity_state enable row level security;
revoke all on public.opportunities, public.builder_opportunity_state
  from public, anon, authenticated;
grant select, insert, update on public.opportunities to service_role;
grant select, insert, update, delete on public.builder_opportunity_state to service_role;

create or replace function private.stage18_admin_role(actor uuid)
returns public.platform_admin_role
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  admin_role public.platform_admin_role;
begin
  select role into admin_role
  from public.platform_admins
  where user_id = actor and status = 'active';

  if admin_role is null then
    raise exception 'OPPORTUNITY_ADMIN_REQUIRED' using errcode = 'P0001';
  end if;
  return admin_role;
end;
$$;

revoke all on function private.stage18_admin_role(uuid)
  from public, anon, authenticated;

create or replace function private.stage18_require_supply_editor(actor uuid)
returns public.platform_admin_role
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  admin_role public.platform_admin_role := private.stage18_admin_role(actor);
begin
  if admin_role not in ('owner', 'operator') then
    raise exception 'OPPORTUNITY_ADMIN_READ_ONLY' using errcode = 'P0001';
  end if;
  return admin_role;
end;
$$;

revoke all on function private.stage18_require_supply_editor(uuid)
  from public, anon, authenticated;

create or replace function private.stage18_active_builder(actor uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if actor is null or not exists (
    select 1 from public.profiles
    where id = actor and account_status = 'active' and deleted_at is null
  ) then
    raise exception 'OPPORTUNITY_ACCESS_DENIED' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function private.stage18_active_builder(uuid)
  from public, anon, authenticated;

create or replace function public.get_stage18_opportunity_catalog()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  items jsonb;
begin
  perform private.stage18_active_builder(actor);

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', opportunity.id,
    'title', opportunity.title,
    'providerName', opportunity.provider_name,
    'category', opportunity.category,
    'summary', opportunity.summary,
    'eligibilitySummary', opportunity.eligibility_summary,
    'benefitSummary', opportunity.benefit_summary,
    'minAge', opportunity.min_age,
    'maxAge', opportunity.max_age,
    'geographyScope', opportunity.geography_scope,
    'countryCodes', opportunity.country_codes,
    'geographyLabel', opportunity.geography_label,
    'deliveryMode', opportunity.delivery_mode,
    'pathwayTags', opportunity.pathway_tags,
    'capabilityTags', opportunity.capability_tags,
    'officialUrl', opportunity.official_url,
    'deadlineDate', opportunity.deadline_date,
    'state', jsonb_build_object(
      'savedAt', builder_state.saved_at,
      'appliedAt', builder_state.applied_at,
      'outcome', builder_state.outcome,
      'outcomeAt', builder_state.outcome_at
    )
  ) order by opportunity.deadline_date nulls last, opportunity.created_at desc), '[]'::jsonb)
  into items
  from public.opportunities opportunity
  left join public.builder_opportunity_state builder_state
    on builder_state.opportunity_id = opportunity.id
   and builder_state.user_id = actor
  where opportunity.review_status = 'approved'
    and opportunity.publication_status = 'published'
    and (opportunity.deadline_date is null or opportunity.deadline_date >= current_date);

  return items;
end;
$$;

create or replace function public.get_stage18_opportunity_link(opportunity_id_input uuid)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target_url text;
begin
  perform private.stage18_active_builder(actor);

  select official_url into target_url
  from public.opportunities
  where id = opportunity_id_input
    and review_status = 'approved'
    and publication_status = 'published'
    and (deadline_date is null or deadline_date >= current_date);

  if target_url is null then
    raise exception 'OPPORTUNITY_NOT_AVAILABLE' using errcode = 'P0001';
  end if;
  return target_url;
end;
$$;

create or replace function public.set_stage18_opportunity_saved(
  opportunity_id_input uuid,
  saved_input boolean
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
begin
  perform private.stage18_active_builder(actor);
  perform public.get_stage18_opportunity_link(opportunity_id_input);

  insert into public.builder_opportunity_state(user_id, opportunity_id, saved_at)
  values (actor, opportunity_id_input, case when saved_input then now() else null end)
  on conflict (user_id, opportunity_id) do update
    set saved_at = case when saved_input then now() else null end;
end;
$$;

create or replace function public.mark_stage18_opportunity_applied(opportunity_id_input uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
begin
  perform private.stage18_active_builder(actor);
  perform public.get_stage18_opportunity_link(opportunity_id_input);

  insert into public.builder_opportunity_state(user_id, opportunity_id, applied_at)
  values (actor, opportunity_id_input, now())
  on conflict (user_id, opportunity_id) do update
    set applied_at = coalesce(public.builder_opportunity_state.applied_at, now());
end;
$$;

create or replace function public.record_stage18_opportunity_outcome(
  opportunity_id_input uuid,
  outcome_input public.opportunity_builder_outcome
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
begin
  perform private.stage18_active_builder(actor);

  if not exists (
    select 1 from public.builder_opportunity_state
    where user_id = actor
      and opportunity_id = opportunity_id_input
      and applied_at is not null
  ) then
    raise exception 'OPPORTUNITY_APPLICATION_REQUIRED' using errcode = 'P0001';
  end if;

  update public.builder_opportunity_state
  set outcome = outcome_input, outcome_at = now()
  where user_id = actor and opportunity_id = opportunity_id_input;
end;
$$;

create or replace function public.get_stage18_admin_opportunities()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  admin_role public.platform_admin_role;
  items jsonb;
begin
  admin_role := private.stage18_admin_role(actor);

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', opportunity.id,
    'title', opportunity.title,
    'providerName', opportunity.provider_name,
    'category', opportunity.category,
    'summary', opportunity.summary,
    'eligibilitySummary', opportunity.eligibility_summary,
    'benefitSummary', opportunity.benefit_summary,
    'minAge', opportunity.min_age,
    'maxAge', opportunity.max_age,
    'geographyScope', opportunity.geography_scope,
    'countryCodes', opportunity.country_codes,
    'geographyLabel', opportunity.geography_label,
    'deliveryMode', opportunity.delivery_mode,
    'pathwayTags', opportunity.pathway_tags,
    'capabilityTags', opportunity.capability_tags,
    'officialUrl', opportunity.official_url,
    'deadlineDate', opportunity.deadline_date,
    'reviewStatus', opportunity.review_status,
    'publicationStatus', opportunity.publication_status,
    'reviewNotes', opportunity.review_notes,
    'createdAt', opportunity.created_at,
    'updatedAt', opportunity.updated_at
  ) order by opportunity.updated_at desc), '[]'::jsonb)
  into items
  from public.opportunities opportunity;

  insert into public.admin_audit_events(
    actor_user_id, operation, result, target_type, metadata
  ) values (
    actor, 'opportunity_supply_viewed', 'success', 'opportunity',
    jsonb_build_object('role', admin_role, 'count', jsonb_array_length(items))
  );

  return jsonb_build_object('role', admin_role, 'items', items);
end;
$$;

create or replace function public.upsert_stage18_opportunity(
  opportunity_id_input uuid,
  title_input text,
  provider_name_input text,
  category_input public.opportunity_category,
  summary_input text,
  eligibility_summary_input text,
  benefit_summary_input text,
  min_age_input smallint,
  max_age_input smallint,
  geography_scope_input public.opportunity_geography_scope,
  country_codes_input text[],
  geography_label_input text,
  delivery_mode_input public.opportunity_delivery_mode,
  pathway_tags_input text[],
  capability_tags_input text[],
  official_url_input text,
  deadline_date_input date
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  saved_id uuid;
begin
  perform private.stage18_require_supply_editor(actor);

  if opportunity_id_input is null then
    insert into public.opportunities(
      title, provider_name, category, summary, eligibility_summary,
      benefit_summary, min_age, max_age, geography_scope, country_codes,
      geography_label, delivery_mode, pathway_tags, capability_tags,
      official_url, deadline_date, created_by
    ) values (
      title_input, provider_name_input, category_input, summary_input,
      eligibility_summary_input, benefit_summary_input, min_age_input,
      max_age_input, geography_scope_input, country_codes_input,
      geography_label_input, delivery_mode_input, pathway_tags_input,
      capability_tags_input, official_url_input, deadline_date_input, actor
    ) returning id into saved_id;
  else
    update public.opportunities
    set title = title_input,
        provider_name = provider_name_input,
        category = category_input,
        summary = summary_input,
        eligibility_summary = eligibility_summary_input,
        benefit_summary = benefit_summary_input,
        min_age = min_age_input,
        max_age = max_age_input,
        geography_scope = geography_scope_input,
        country_codes = country_codes_input,
        geography_label = geography_label_input,
        delivery_mode = delivery_mode_input,
        pathway_tags = pathway_tags_input,
        capability_tags = capability_tags_input,
        official_url = official_url_input,
        deadline_date = deadline_date_input,
        review_status = 'pending',
        publication_status = 'draft',
        review_notes = null,
        reviewed_by = null,
        reviewed_at = null,
        published_by = null,
        published_at = null
    where id = opportunity_id_input
    returning id into saved_id;

    if saved_id is null then
      raise exception 'OPPORTUNITY_NOT_FOUND' using errcode = 'P0001';
    end if;
  end if;

  insert into public.admin_audit_events(
    actor_user_id, operation, result, target_type, target_id
  ) values (
    actor,
    case when opportunity_id_input is null then 'opportunity_created' else 'opportunity_updated' end,
    'success', 'opportunity', saved_id::text
  );

  return saved_id;
end;
$$;

create or replace function public.review_stage18_opportunity(
  opportunity_id_input uuid,
  approved_input boolean,
  review_notes_input text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
begin
  perform private.stage18_require_supply_editor(actor);

  update public.opportunities
  set review_status = case when approved_input then 'approved' else 'rejected' end,
      publication_status = 'draft',
      review_notes = nullif(btrim(review_notes_input), ''),
      reviewed_by = actor,
      reviewed_at = now(),
      published_by = null,
      published_at = null
  where id = opportunity_id_input;

  if not found then
    raise exception 'OPPORTUNITY_NOT_FOUND' using errcode = 'P0001';
  end if;

  insert into public.admin_audit_events(
    actor_user_id, operation, result, target_type, target_id,
    metadata
  ) values (
    actor, 'opportunity_reviewed', 'success', 'opportunity',
    opportunity_id_input::text, jsonb_build_object('approved', approved_input)
  );
end;
$$;

create or replace function public.set_stage18_opportunity_publication(
  opportunity_id_input uuid,
  publish_input boolean
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  opportunity_row public.opportunities%rowtype;
begin
  perform private.stage18_require_supply_editor(actor);

  select * into opportunity_row from public.opportunities
  where id = opportunity_id_input for update;
  if not found then
    raise exception 'OPPORTUNITY_NOT_FOUND' using errcode = 'P0001';
  end if;

  if publish_input then
    if opportunity_row.review_status <> 'approved' then
      raise exception 'OPPORTUNITY_REVIEW_REQUIRED' using errcode = 'P0001';
    end if;
    if opportunity_row.deadline_date is not null
       and opportunity_row.deadline_date < current_date then
      raise exception 'OPPORTUNITY_DEADLINE_PASSED' using errcode = 'P0001';
    end if;

    update public.opportunities
    set publication_status = 'published', published_by = actor, published_at = now()
    where id = opportunity_id_input;
  else
    update public.opportunities
    set publication_status = 'withdrawn'
    where id = opportunity_id_input;
  end if;

  insert into public.admin_audit_events(
    actor_user_id, operation, result, target_type, target_id,
    metadata
  ) values (
    actor,
    case when publish_input then 'opportunity_published' else 'opportunity_withdrawn' end,
    'success', 'opportunity', opportunity_id_input::text,
    jsonb_build_object('published', publish_input)
  );
end;
$$;

revoke all on function public.get_stage18_opportunity_catalog() from public, anon;
revoke all on function public.get_stage18_opportunity_link(uuid) from public, anon;
revoke all on function public.set_stage18_opportunity_saved(uuid, boolean) from public, anon;
revoke all on function public.mark_stage18_opportunity_applied(uuid) from public, anon;
revoke all on function public.record_stage18_opportunity_outcome(uuid, public.opportunity_builder_outcome) from public, anon;
revoke all on function public.get_stage18_admin_opportunities() from public, anon;
revoke all on function public.upsert_stage18_opportunity(uuid,text,text,public.opportunity_category,text,text,text,smallint,smallint,public.opportunity_geography_scope,text[],text,public.opportunity_delivery_mode,text[],text[],text,date) from public, anon;
revoke all on function public.review_stage18_opportunity(uuid,boolean,text) from public, anon;
revoke all on function public.set_stage18_opportunity_publication(uuid,boolean) from public, anon;

grant execute on function public.get_stage18_opportunity_catalog() to authenticated;
grant execute on function public.get_stage18_opportunity_link(uuid) to authenticated;
grant execute on function public.set_stage18_opportunity_saved(uuid, boolean) to authenticated;
grant execute on function public.mark_stage18_opportunity_applied(uuid) to authenticated;
grant execute on function public.record_stage18_opportunity_outcome(uuid, public.opportunity_builder_outcome) to authenticated;
grant execute on function public.get_stage18_admin_opportunities() to authenticated;
grant execute on function public.upsert_stage18_opportunity(uuid,text,text,public.opportunity_category,text,text,text,smallint,smallint,public.opportunity_geography_scope,text[],text,public.opportunity_delivery_mode,text[],text[],text,date) to authenticated;
grant execute on function public.review_stage18_opportunity(uuid,boolean,text) to authenticated;
grant execute on function public.set_stage18_opportunity_publication(uuid,boolean) to authenticated;

-- Reuse the single Stage 14 product-event stream; do not create parallel
-- opportunity analytics storage.
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
    'builder_guide_feedback',
    'opportunity_saved',
    'opportunity_unsaved',
    'opportunity_external_clicked',
    'opportunity_applied',
    'opportunity_outcome_recorded'
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
      'guide',
      'opportunities'
    )
  );
