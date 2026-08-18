-- Stage 20: trusted Opportunity Marketplace.
--
-- Extends the released Stage 18 curated opportunity seed without creating an
-- open Builder directory. Provider identity, provider-owned supply and exact
-- Builder-controlled application packets are durable. Browser roles receive no
-- direct table access; narrowly granted RPCs enforce Builder/provider/admin
-- authority and all shared data is snapshotted at the application boundary.

create type public.opportunity_provider_status as enum (
  'pending',
  'approved',
  'suspended',
  'revoked'
);

create type public.opportunity_provider_role as enum ('owner', 'operator');

create type public.opportunity_provider_organisation_type as enum (
  'company',
  'nonprofit',
  'school',
  'university',
  'government',
  'foundation',
  'community',
  'other'
);

create type public.opportunity_application_status as enum (
  'draft',
  'submitted',
  'viewed',
  'shortlisted',
  'accepted',
  'not_selected',
  'withdrawn'
);

create table public.opportunity_providers (
  id uuid primary key default gen_random_uuid(),
  organisation_name text not null check (char_length(organisation_name) between 2 and 180),
  organisation_type public.opportunity_provider_organisation_type not null,
  official_website text not null check (
    char_length(official_website) between 8 and 1000
    and official_website ~* '^https://'
  ),
  official_domain text not null check (
    char_length(official_domain) between 3 and 253
    and official_domain ~ '^[a-z0-9.-]+$'
  ),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  public_description text not null check (char_length(public_description) between 20 and 1200),
  status public.opportunity_provider_status not null default 'pending',
  review_notes text check (review_notes is null or char_length(review_notes) <= 1200),
  created_by uuid not null references public.profiles(id) on delete restrict,
  reviewed_by uuid references public.profiles(id) on delete restrict,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_provider_review_consistency check (
    (status = 'pending' and reviewed_by is null and reviewed_at is null)
    or (status <> 'pending' and reviewed_by is not null and reviewed_at is not null)
  )
);

create unique index opportunity_providers_domain_unique_idx
  on public.opportunity_providers(lower(official_domain));
create index opportunity_providers_status_idx
  on public.opportunity_providers(status, updated_at desc);

create trigger opportunity_providers_updated_at
before update on public.opportunity_providers
for each row execute function public.set_updated_at();

create table public.opportunity_provider_members (
  provider_id uuid not null references public.opportunity_providers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.opportunity_provider_role not null,
  status text not null default 'active' check (status in ('active', 'revoked')),
  granted_by uuid not null references public.profiles(id) on delete restrict,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (provider_id, user_id),
  constraint opportunity_provider_member_status_consistency check (
    (status = 'active' and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
  )
);

create index opportunity_provider_members_user_idx
  on public.opportunity_provider_members(user_id, status, provider_id);

create trigger opportunity_provider_members_updated_at
before update on public.opportunity_provider_members
for each row execute function public.set_updated_at();

alter table public.opportunities
  add column provider_id uuid references public.opportunity_providers(id) on delete restrict;

create index opportunities_provider_idx
  on public.opportunities(provider_id, publication_status, review_status, deadline_date);

create table public.opportunity_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete restrict,
  provider_id uuid not null references public.opportunity_providers(id) on delete restrict,
  builder_user_id uuid not null references public.profiles(id) on delete restrict,
  status public.opportunity_application_status not null default 'draft',
  display_name_snapshot text not null check (char_length(display_name_snapshot) between 2 and 120),
  builder_summary_snapshot text check (
    builder_summary_snapshot is null
    or char_length(builder_summary_snapshot) between 20 and 800
  ),
  selected_path_name_snapshot text check (
    selected_path_name_snapshot is null
    or char_length(selected_path_name_snapshot) between 2 and 180
  ),
  application_note text check (application_note is null or char_length(application_note) <= 2000),
  consent_policy_version text check (
    consent_policy_version is null
    or consent_policy_version = 'opportunity-marketplace-application-v1'
  ),
  submitted_at timestamptz,
  viewed_at timestamptz,
  decided_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (builder_user_id, opportunity_id),
  constraint opportunity_application_provider_matches_listing check (provider_id is not null),
  constraint opportunity_application_submission_consistency check (
    (status = 'draft' and submitted_at is null and consent_policy_version is null)
    or (status = 'withdrawn')
    or (
      status in ('submitted', 'viewed', 'shortlisted', 'accepted', 'not_selected')
      and submitted_at is not null
      and consent_policy_version = 'opportunity-marketplace-application-v1'
    )
  ),
  constraint opportunity_application_view_consistency check (
    status not in ('viewed', 'shortlisted', 'accepted', 'not_selected')
    or viewed_at is not null
  ),
  constraint opportunity_application_decision_consistency check (
    status not in ('accepted', 'not_selected')
    or decided_at is not null
  ),
  constraint opportunity_application_withdrawal_consistency check (
    (status = 'withdrawn' and withdrawn_at is not null)
    or (status <> 'withdrawn' and withdrawn_at is null)
  )
);

create index opportunity_applications_builder_idx
  on public.opportunity_applications(builder_user_id, updated_at desc);
create index opportunity_applications_provider_queue_idx
  on public.opportunity_applications(provider_id, status, submitted_at desc);

create trigger opportunity_applications_updated_at
before update on public.opportunity_applications
for each row execute function public.set_updated_at();

create table public.opportunity_application_capabilities (
  application_id uuid not null references public.opportunity_applications(id) on delete cascade,
  claim_id uuid not null references public.builder_capability_claims(id) on delete restrict,
  capability_key text not null check (char_length(capability_key) between 2 and 120),
  capability_label text not null check (char_length(capability_label) between 2 and 120),
  capability_level public.builder_capability_level not null,
  created_at timestamptz not null default now(),
  primary key (application_id, claim_id)
);

create table public.opportunity_application_evidence (
  application_id uuid not null references public.opportunity_applications(id) on delete cascade,
  claim_id uuid not null references public.builder_capability_claims(id) on delete restrict,
  evidence_id uuid not null references public.builder_capability_evidence(id) on delete restrict,
  source_type public.builder_capability_evidence_source not null,
  source_title text not null check (char_length(source_title) between 2 and 160),
  evidence_summary text not null check (char_length(evidence_summary) between 10 and 400),
  source_href text not null check (source_href ~ '^/'),
  created_at timestamptz not null default now(),
  primary key (application_id, evidence_id),
  foreign key (application_id, claim_id)
    references public.opportunity_application_capabilities(application_id, claim_id)
    on delete cascade
);

create table public.opportunity_application_institution_verifications (
  application_id uuid not null references public.opportunity_applications(id) on delete cascade,
  verification_id uuid not null references public.institution_capability_verifications(id) on delete restrict,
  capability_key text not null check (char_length(capability_key) between 2 and 120),
  capability_label text not null check (char_length(capability_label) between 2 and 120),
  institution_name text not null check (char_length(institution_name) between 2 and 180),
  confirmed_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (application_id, verification_id)
);

create table public.opportunity_application_portfolio_proofs (
  application_id uuid not null references public.opportunity_applications(id) on delete cascade,
  portfolio_id uuid not null references public.builder_project_portfolios(id) on delete restrict,
  slug text not null check (char_length(slug) between 3 and 120),
  public_title text not null check (char_length(public_title) between 3 and 180),
  public_summary text not null check (char_length(public_summary) between 20 and 600),
  proof_href text not null check (proof_href ~ '^/proof/'),
  created_at timestamptz not null default now(),
  primary key (application_id, portfolio_id)
);

create table public.opportunity_marketplace_audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(id) on delete set null,
  provider_id uuid references public.opportunity_providers(id) on delete set null,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  application_id uuid references public.opportunity_applications(id) on delete set null,
  event_type text not null check (char_length(event_type) between 3 and 100),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index opportunity_marketplace_audit_provider_idx
  on public.opportunity_marketplace_audit_events(provider_id, created_at desc);
create index opportunity_marketplace_audit_application_idx
  on public.opportunity_marketplace_audit_events(application_id, created_at desc);

alter table public.opportunity_providers enable row level security;
alter table public.opportunity_provider_members enable row level security;
alter table public.opportunity_applications enable row level security;
alter table public.opportunity_application_capabilities enable row level security;
alter table public.opportunity_application_evidence enable row level security;
alter table public.opportunity_application_institution_verifications enable row level security;
alter table public.opportunity_application_portfolio_proofs enable row level security;
alter table public.opportunity_marketplace_audit_events enable row level security;

revoke all on
  public.opportunity_providers,
  public.opportunity_provider_members,
  public.opportunity_applications,
  public.opportunity_application_capabilities,
  public.opportunity_application_evidence,
  public.opportunity_application_institution_verifications,
  public.opportunity_application_portfolio_proofs,
  public.opportunity_marketplace_audit_events
from public, anon, authenticated;

grant select, insert, update, delete on
  public.opportunity_providers,
  public.opportunity_provider_members,
  public.opportunity_applications,
  public.opportunity_application_capabilities,
  public.opportunity_application_evidence,
  public.opportunity_application_institution_verifications,
  public.opportunity_application_portfolio_proofs,
  public.opportunity_marketplace_audit_events
  to service_role;

grant usage, select on sequence public.opportunity_marketplace_audit_events_id_seq
  to service_role;

create or replace function private.stage20_active_adult_builder(actor uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if actor is null or not exists (
    select 1
    from public.profiles profile
    where profile.id = actor
      and profile.account_status = 'active'
      and profile.deleted_at is null
      and coalesce(profile.is_minor, true) = false
      and profile.safeguarding_review_required = false
  ) then
    raise exception 'MARKETPLACE_ADULT_BUILDER_REQUIRED' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function private.stage20_active_adult_builder(uuid)
  from public, anon, authenticated;

create or replace function private.stage20_provider_member_role(
  provider_id_input uuid,
  actor uuid
) returns public.opportunity_provider_role
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  member_role public.opportunity_provider_role;
begin
  select member.role into member_role
  from public.opportunity_provider_members member
  join public.profiles profile on profile.id = member.user_id
  where member.provider_id = provider_id_input
    and member.user_id = actor
    and member.status = 'active'
    and profile.account_status = 'active'
    and profile.deleted_at is null
    and coalesce(profile.is_minor, true) = false
    and profile.safeguarding_review_required = false;

  if member_role is null then
    raise exception 'OPPORTUNITY_PROVIDER_MEMBER_REQUIRED' using errcode = 'P0001';
  end if;

  return member_role;
end;
$$;

revoke all on function private.stage20_provider_member_role(uuid, uuid)
  from public, anon, authenticated;

create or replace function private.stage20_require_approved_provider_operator(
  provider_id_input uuid,
  actor uuid
) returns public.opportunity_provider_role
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  member_role public.opportunity_provider_role;
begin
  member_role := private.stage20_provider_member_role(provider_id_input, actor);

  if not exists (
    select 1
    from public.opportunity_providers provider
    where provider.id = provider_id_input
      and provider.status = 'approved'
  ) then
    raise exception 'OPPORTUNITY_PROVIDER_NOT_APPROVED' using errcode = 'P0001';
  end if;

  return member_role;
end;
$$;

revoke all on function private.stage20_require_approved_provider_operator(uuid, uuid)
  from public, anon, authenticated;

create or replace function private.stage20_marketplace_opportunity(
  opportunity_id_input uuid
) returns public.opportunities
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  opportunity_row public.opportunities%rowtype;
begin
  select opportunity.* into opportunity_row
  from public.opportunities opportunity
  join public.opportunity_providers provider on provider.id = opportunity.provider_id
  where opportunity.id = opportunity_id_input
    and opportunity.provider_id is not null
    and provider.status = 'approved'
    and opportunity.review_status = 'approved'
    and opportunity.publication_status = 'published'
    and (opportunity.deadline_date is null or opportunity.deadline_date >= current_date);

  if opportunity_row.id is null then
    raise exception 'MARKETPLACE_OPPORTUNITY_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  return opportunity_row;
end;
$$;

revoke all on function private.stage20_marketplace_opportunity(uuid)
  from public, anon, authenticated;

create or replace function public.get_stage20_admin_provider_registry()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  admin_role public.platform_admin_role;
  providers jsonb;
begin
  admin_role := private.stage18_admin_role(actor);

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', provider.id,
    'organisationName', provider.organisation_name,
    'organisationType', provider.organisation_type,
    'officialWebsite', provider.official_website,
    'officialDomain', provider.official_domain,
    'countryCode', provider.country_code,
    'publicDescription', provider.public_description,
    'status', provider.status,
    'reviewNotes', provider.review_notes,
    'reviewedAt', provider.reviewed_at,
    'createdAt', provider.created_at,
    'updatedAt', provider.updated_at,
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'userId', member.user_id,
        'username', profile.username,
        'displayName', profile.display_name,
        'role', member.role,
        'status', member.status,
        'grantedAt', member.granted_at,
        'revokedAt', member.revoked_at
      ) order by member.granted_at)
      from public.opportunity_provider_members member
      join public.profiles profile on profile.id = member.user_id
      where member.provider_id = provider.id
    ), '[]'::jsonb)
  ) order by provider.updated_at desc), '[]'::jsonb)
  into providers
  from public.opportunity_providers provider;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, event_type, metadata
  ) values (
    actor,
    'admin_provider_registry_viewed',
    jsonb_build_object('role', admin_role, 'providerCount', jsonb_array_length(providers))
  );

  return jsonb_build_object('role', admin_role, 'providers', providers);
end;
$$;

create or replace function public.upsert_stage20_opportunity_provider(
  provider_id_input uuid,
  organisation_name_input text,
  organisation_type_input public.opportunity_provider_organisation_type,
  official_website_input text,
  official_domain_input text,
  country_code_input text,
  public_description_input text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  saved_id uuid;
  existing_status public.opportunity_provider_status;
begin
  perform private.stage18_require_supply_editor(actor);

  if provider_id_input is null then
    insert into public.opportunity_providers(
      organisation_name,
      organisation_type,
      official_website,
      official_domain,
      country_code,
      public_description,
      created_by
    ) values (
      btrim(organisation_name_input),
      organisation_type_input,
      btrim(official_website_input),
      lower(btrim(official_domain_input)),
      upper(btrim(country_code_input)),
      btrim(public_description_input),
      actor
    ) returning id into saved_id;
  else
    select provider.status into existing_status
    from public.opportunity_providers provider
    where provider.id = provider_id_input
    for update;

    if existing_status is null then
      raise exception 'OPPORTUNITY_PROVIDER_NOT_FOUND' using errcode = 'P0001';
    end if;
    if existing_status = 'revoked' then
      raise exception 'OPPORTUNITY_PROVIDER_REVOKED' using errcode = 'P0001';
    end if;

    update public.opportunity_providers
    set organisation_name = btrim(organisation_name_input),
        organisation_type = organisation_type_input,
        official_website = btrim(official_website_input),
        official_domain = lower(btrim(official_domain_input)),
        country_code = upper(btrim(country_code_input)),
        public_description = btrim(public_description_input),
        status = 'pending',
        review_notes = null,
        reviewed_by = null,
        reviewed_at = null
    where id = provider_id_input
    returning id into saved_id;

    update public.opportunities
    set publication_status = 'withdrawn'
    where provider_id = saved_id
      and publication_status = 'published';
  end if;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, event_type
  ) values (
    actor,
    saved_id,
    case when provider_id_input is null then 'provider_created' else 'provider_updated_for_rereview' end
  );

  return saved_id;
end;
$$;

create or replace function public.set_stage20_opportunity_provider_status(
  provider_id_input uuid,
  status_input public.opportunity_provider_status,
  review_notes_input text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  current_status public.opportunity_provider_status;
  allowed boolean := false;
begin
  perform private.stage18_require_supply_editor(actor);

  select provider.status into current_status
  from public.opportunity_providers provider
  where provider.id = provider_id_input
  for update;

  if current_status is null then
    raise exception 'OPPORTUNITY_PROVIDER_NOT_FOUND' using errcode = 'P0001';
  end if;

  allowed := (
    (current_status = 'pending' and status_input in ('approved', 'revoked'))
    or (current_status = 'approved' and status_input in ('suspended', 'revoked'))
    or (current_status = 'suspended' and status_input in ('approved', 'revoked'))
  );

  if not allowed then
    raise exception 'OPPORTUNITY_PROVIDER_STATUS_TRANSITION_INVALID' using errcode = 'P0001';
  end if;

  update public.opportunity_providers
  set status = status_input,
      review_notes = nullif(btrim(review_notes_input), ''),
      reviewed_by = actor,
      reviewed_at = now()
  where id = provider_id_input;

  if status_input in ('suspended', 'revoked') then
    update public.opportunities
    set publication_status = 'withdrawn'
    where provider_id = provider_id_input
      and publication_status = 'published';
  end if;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, event_type,
    metadata
  ) values (
    actor,
    provider_id_input,
    'provider_status_changed',
    jsonb_build_object('from', current_status, 'to', status_input)
  );
end;
$$;

create or replace function public.set_stage20_opportunity_provider_member(
  provider_id_input uuid,
  username_input text,
  role_input public.opportunity_provider_role,
  active_input boolean
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  member_user_id uuid;
begin
  perform private.stage18_require_supply_editor(actor);

  if not exists (
    select 1 from public.opportunity_providers provider
    where provider.id = provider_id_input
      and provider.status <> 'revoked'
  ) then
    raise exception 'OPPORTUNITY_PROVIDER_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  select profile.id into member_user_id
  from public.profiles profile
  where lower(profile.username::text) = lower(btrim(username_input))
    and profile.account_status = 'active'
    and profile.deleted_at is null
    and coalesce(profile.is_minor, true) = false
    and profile.safeguarding_review_required = false;

  if member_user_id is null then
    raise exception 'OPPORTUNITY_PROVIDER_MEMBER_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  insert into public.opportunity_provider_members(
    provider_id, user_id, role, status, granted_by, granted_at, revoked_at
  ) values (
    provider_id_input,
    member_user_id,
    role_input,
    case when active_input then 'active' else 'revoked' end,
    actor,
    now(),
    case when active_input then null else now() end
  )
  on conflict (provider_id, user_id) do update
    set role = excluded.role,
        status = excluded.status,
        granted_by = actor,
        granted_at = case
          when excluded.status = 'active' then now()
          else public.opportunity_provider_members.granted_at
        end,
        revoked_at = case when excluded.status = 'revoked' then now() else null end;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, event_type,
    metadata
  ) values (
    actor,
    provider_id_input,
    case when active_input then 'provider_member_granted' else 'provider_member_revoked' end,
    jsonb_build_object('memberUserId', member_user_id, 'role', role_input)
  );

  return member_user_id;
end;
$$;

create or replace function public.get_stage20_provider_workspace(provider_id_input uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  member_role public.opportunity_provider_role;
  provider_payload jsonb;
  opportunities_payload jsonb;
begin
  member_role := private.stage20_provider_member_role(provider_id_input, actor);

  select jsonb_build_object(
    'id', provider.id,
    'organisationName', provider.organisation_name,
    'organisationType', provider.organisation_type,
    'officialWebsite', provider.official_website,
    'officialDomain', provider.official_domain,
    'countryCode', provider.country_code,
    'publicDescription', provider.public_description,
    'status', provider.status,
    'reviewedAt', provider.reviewed_at,
    'createdAt', provider.created_at,
    'updatedAt', provider.updated_at
  ) into provider_payload
  from public.opportunity_providers provider
  where provider.id = provider_id_input;

  if provider_payload is null then
    raise exception 'OPPORTUNITY_PROVIDER_NOT_FOUND' using errcode = 'P0001';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', opportunity.id,
    'title', opportunity.title,
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
  into opportunities_payload
  from public.opportunities opportunity
  where opportunity.provider_id = provider_id_input;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, event_type,
    metadata
  ) values (
    actor,
    provider_id_input,
    'provider_workspace_viewed',
    jsonb_build_object('role', member_role)
  );

  return jsonb_build_object(
    'provider', provider_payload,
    'membership', jsonb_build_object(
      'providerId', provider_id_input,
      'role', member_role,
      'status', 'active'
    ),
    'opportunities', opportunities_payload
  );
end;
$$;

create or replace function public.upsert_stage20_provider_opportunity(
  provider_id_input uuid,
  opportunity_id_input uuid,
  title_input text,
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
  provider_name_snapshot text;
  saved_id uuid;
begin
  perform private.stage20_require_approved_provider_operator(provider_id_input, actor);

  select provider.organisation_name into provider_name_snapshot
  from public.opportunity_providers provider
  where provider.id = provider_id_input
    and provider.status = 'approved';

  if opportunity_id_input is null then
    insert into public.opportunities(
      provider_id,
      provider_name,
      title,
      category,
      summary,
      eligibility_summary,
      benefit_summary,
      min_age,
      max_age,
      geography_scope,
      country_codes,
      geography_label,
      delivery_mode,
      pathway_tags,
      capability_tags,
      official_url,
      deadline_date,
      created_by
    ) values (
      provider_id_input,
      provider_name_snapshot,
      title_input,
      category_input,
      summary_input,
      eligibility_summary_input,
      benefit_summary_input,
      min_age_input,
      max_age_input,
      geography_scope_input,
      country_codes_input,
      geography_label_input,
      delivery_mode_input,
      pathway_tags_input,
      capability_tags_input,
      official_url_input,
      deadline_date_input,
      actor
    ) returning id into saved_id;
  else
    update public.opportunities
    set provider_name = provider_name_snapshot,
        title = title_input,
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
      and provider_id = provider_id_input
    returning id into saved_id;

    if saved_id is null then
      raise exception 'PROVIDER_OPPORTUNITY_NOT_FOUND' using errcode = 'P0001';
    end if;
  end if;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, opportunity_id, event_type
  ) values (
    actor,
    provider_id_input,
    saved_id,
    case when opportunity_id_input is null then 'provider_opportunity_created' else 'provider_opportunity_updated' end
  );

  return saved_id;
end;
$$;

create or replace function public.get_stage20_marketplace_catalog()
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
    'providerId', opportunity.provider_id,
    'providerStatus', provider.status,
    'providerWebsite', provider.official_website,
    'providerCountryCode', provider.country_code,
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
    'deadlineDate', opportunity.deadline_date,
    'isActive', (
      opportunity.review_status = 'approved'
      and opportunity.publication_status = 'published'
      and (opportunity.deadline_date is null or opportunity.deadline_date >= current_date)
      and (opportunity.provider_id is null or provider.status = 'approved')
    ),
    'nativeApplicationEnabled', (
      opportunity.provider_id is not null and provider.status = 'approved'
    ),
    'applicationStatus', application.status,
    'state', jsonb_build_object(
      'savedAt', builder_state.saved_at,
      'appliedAt', builder_state.applied_at,
      'outcome', builder_state.outcome,
      'outcomeAt', builder_state.outcome_at
    )
  ) order by opportunity.deadline_date nulls last, opportunity.created_at desc), '[]'::jsonb)
  into items
  from public.opportunities opportunity
  left join public.opportunity_providers provider
    on provider.id = opportunity.provider_id
  left join public.builder_opportunity_state builder_state
    on builder_state.opportunity_id = opportunity.id
   and builder_state.user_id = actor
  left join public.opportunity_applications application
    on application.opportunity_id = opportunity.id
   and application.builder_user_id = actor
  where (
    opportunity.review_status = 'approved'
    and opportunity.publication_status = 'published'
    and (opportunity.deadline_date is null or opportunity.deadline_date >= current_date)
    and (opportunity.provider_id is null or provider.status = 'approved')
  )
  or builder_state.applied_at is not null
  or application.id is not null;

  return items;
end;
$$;

create or replace function public.get_stage20_builder_application_workspace(
  opportunity_id_input uuid
) returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  opportunity_row public.opportunities%rowtype;
  provider_payload jsonb;
  application_payload jsonb;
  capabilities jsonb;
  evidence jsonb;
  institution_verifications jsonb;
  portfolio_proofs jsonb;
begin
  perform private.stage20_active_adult_builder(actor);
  opportunity_row := private.stage20_marketplace_opportunity(opportunity_id_input);

  select jsonb_build_object(
    'id', provider.id,
    'organisationName', provider.organisation_name,
    'organisationType', provider.organisation_type,
    'officialWebsite', provider.official_website,
    'officialDomain', provider.official_domain,
    'countryCode', provider.country_code,
    'publicDescription', provider.public_description,
    'status', provider.status
  ) into provider_payload
  from public.opportunity_providers provider
  where provider.id = opportunity_row.provider_id;

  select jsonb_build_object(
    'id', application.id,
    'opportunityId', application.opportunity_id,
    'providerId', application.provider_id,
    'builderUserId', application.builder_user_id,
    'status', application.status,
    'displayName', application.display_name_snapshot,
    'builderSummary', application.builder_summary_snapshot,
    'selectedPathName', application.selected_path_name_snapshot,
    'applicationNote', application.application_note,
    'consentPolicyVersion', application.consent_policy_version,
    'submittedAt', application.submitted_at,
    'viewedAt', application.viewed_at,
    'decidedAt', application.decided_at,
    'withdrawnAt', application.withdrawn_at,
    'createdAt', application.created_at,
    'updatedAt', application.updated_at,
    'selectedClaimIds', coalesce((
      select jsonb_agg(selection.claim_id order by selection.capability_label)
      from public.opportunity_application_capabilities selection
      where selection.application_id = application.id
    ), '[]'::jsonb),
    'selectedEvidenceIds', coalesce((
      select jsonb_agg(selection.evidence_id order by selection.source_title)
      from public.opportunity_application_evidence selection
      where selection.application_id = application.id
    ), '[]'::jsonb),
    'selectedInstitutionVerificationIds', coalesce((
      select jsonb_agg(selection.verification_id order by selection.institution_name)
      from public.opportunity_application_institution_verifications selection
      where selection.application_id = application.id
    ), '[]'::jsonb),
    'selectedPortfolioIds', coalesce((
      select jsonb_agg(selection.portfolio_id order by selection.public_title)
      from public.opportunity_application_portfolio_proofs selection
      where selection.application_id = application.id
    ), '[]'::jsonb)
  ) into application_payload
  from public.opportunity_applications application
  where application.opportunity_id = opportunity_id_input
    and application.builder_user_id = actor;

  select coalesce(jsonb_agg(jsonb_build_object(
    'claimId', claim.id,
    'capabilityKey', claim.capability_key,
    'capabilityLabel', claim.capability_label,
    'capabilityLevel', claim.level
  ) order by claim.capability_label), '[]'::jsonb)
  into capabilities
  from public.builder_capability_claims claim
  join public.builder_profile_versions version on version.id = claim.profile_version_id
  where claim.user_id = actor
    and version.user_id = actor
    and version.status = 'active';

  select coalesce(jsonb_agg(jsonb_build_object(
    'evidenceId', item.id,
    'claimId', item.claim_id,
    'sourceType', item.source_type,
    'sourceTitle', item.source_title,
    'evidenceSummary', item.evidence_summary,
    'sourceHref', item.source_href
  ) order by item.source_occurred_at desc), '[]'::jsonb)
  into evidence
  from public.builder_capability_evidence item
  join public.builder_capability_claims claim on claim.id = item.claim_id
  join public.builder_profile_versions version on version.id = claim.profile_version_id
  where item.user_id = actor
    and claim.user_id = actor
    and version.status = 'active';

  select coalesce(jsonb_agg(jsonb_build_object(
    'verificationId', verification.id,
    'capabilityKey', verification.capability_key,
    'capabilityLabel', verification.capability_label_at_request,
    'institutionName', cohort.organisation_name,
    'confirmedAt', verification.responded_at
  ) order by verification.responded_at desc), '[]'::jsonb)
  into institution_verifications
  from public.institution_capability_verifications verification
  join public.institution_workspaces workspace on workspace.id = verification.workspace_id
  join public.khpos_school_cohorts cohort on cohort.id = workspace.cohort_id
  where verification.builder_user_id = actor
    and verification.status = 'confirmed'
    and verification.responded_at is not null;

  select coalesce(jsonb_agg(jsonb_build_object(
    'portfolioId', portfolio.id,
    'slug', portfolio.slug::text,
    'publicTitle', portfolio.public_title,
    'publicSummary', portfolio.public_summary,
    'proofHref', '/proof/' || portfolio.slug::text
  ) order by portfolio.published_at desc), '[]'::jsonb)
  into portfolio_proofs
  from public.builder_project_portfolios portfolio
  where portfolio.user_id = actor
    and portfolio.status = 'published';

  return jsonb_build_object(
    'opportunity', jsonb_build_object(
      'id', opportunity_row.id,
      'title', opportunity_row.title,
      'providerId', opportunity_row.provider_id,
      'providerName', opportunity_row.provider_name,
      'category', opportunity_row.category,
      'summary', opportunity_row.summary,
      'eligibilitySummary', opportunity_row.eligibility_summary,
      'benefitSummary', opportunity_row.benefit_summary,
      'deadlineDate', opportunity_row.deadline_date
    ),
    'provider', provider_payload,
    'application', application_payload,
    'eligibleCapabilities', capabilities,
    'eligibleEvidence', evidence,
    'eligibleInstitutionVerifications', institution_verifications,
    'eligiblePortfolioProofs', portfolio_proofs
  );
end;
$$;

create or replace function public.save_stage20_opportunity_application_draft(
  opportunity_id_input uuid,
  builder_summary_input text,
  selected_path_name_input text,
  application_note_input text,
  claim_ids_input uuid[],
  evidence_ids_input uuid[],
  institution_verification_ids_input uuid[],
  portfolio_ids_input uuid[]
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  opportunity_row public.opportunities%rowtype;
  application_id_value uuid;
  display_name_value text;
  claim_ids uuid[] := coalesce(claim_ids_input, '{}'::uuid[]);
  evidence_ids uuid[] := coalesce(evidence_ids_input, '{}'::uuid[]);
  verification_ids uuid[] := coalesce(institution_verification_ids_input, '{}'::uuid[]);
  portfolio_ids uuid[] := coalesce(portfolio_ids_input, '{}'::uuid[]);
begin
  perform private.stage20_active_adult_builder(actor);
  opportunity_row := private.stage20_marketplace_opportunity(opportunity_id_input);

  if cardinality(claim_ids) > 12
     or cardinality(evidence_ids) > 20
     or cardinality(verification_ids) > 12
     or cardinality(portfolio_ids) > 8 then
    raise exception 'MARKETPLACE_APPLICATION_SELECTION_LIMIT' using errcode = 'P0001';
  end if;

  if cardinality(claim_ids) <> (select count(distinct value) from unnest(claim_ids) value)
     or cardinality(evidence_ids) <> (select count(distinct value) from unnest(evidence_ids) value)
     or cardinality(verification_ids) <> (select count(distinct value) from unnest(verification_ids) value)
     or cardinality(portfolio_ids) <> (select count(distinct value) from unnest(portfolio_ids) value) then
    raise exception 'MARKETPLACE_APPLICATION_DUPLICATE_SELECTION' using errcode = 'P0001';
  end if;

  select coalesce(
    nullif(btrim(profile.display_name), ''),
    nullif(btrim(profile.preferred_name), ''),
    nullif(btrim(profile.username::text), '')
  ) into display_name_value
  from public.profiles profile
  where profile.id = actor;

  if display_name_value is null then
    raise exception 'MARKETPLACE_APPLICATION_DISPLAY_NAME_REQUIRED' using errcode = 'P0001';
  end if;

  select application.id into application_id_value
  from public.opportunity_applications application
  where application.builder_user_id = actor
    and application.opportunity_id = opportunity_id_input
  for update;

  if application_id_value is null then
    insert into public.opportunity_applications(
      opportunity_id,
      provider_id,
      builder_user_id,
      display_name_snapshot,
      builder_summary_snapshot,
      selected_path_name_snapshot,
      application_note
    ) values (
      opportunity_id_input,
      opportunity_row.provider_id,
      actor,
      display_name_value,
      nullif(btrim(builder_summary_input), ''),
      nullif(btrim(selected_path_name_input), ''),
      nullif(btrim(application_note_input), '')
    ) returning id into application_id_value;
  else
    if not exists (
      select 1 from public.opportunity_applications application
      where application.id = application_id_value
        and application.status = 'draft'
    ) then
      raise exception 'MARKETPLACE_APPLICATION_DRAFT_LOCKED' using errcode = 'P0001';
    end if;

    update public.opportunity_applications
    set display_name_snapshot = display_name_value,
        builder_summary_snapshot = nullif(btrim(builder_summary_input), ''),
        selected_path_name_snapshot = nullif(btrim(selected_path_name_input), ''),
        application_note = nullif(btrim(application_note_input), '')
    where id = application_id_value;

    delete from public.opportunity_application_evidence
    where application_id = application_id_value;
    delete from public.opportunity_application_institution_verifications
    where application_id = application_id_value;
    delete from public.opportunity_application_portfolio_proofs
    where application_id = application_id_value;
    delete from public.opportunity_application_capabilities
    where application_id = application_id_value;
  end if;

  if exists (
    select 1
    from unnest(claim_ids) requested(claim_id)
    where not exists (
      select 1
      from public.builder_capability_claims claim
      join public.builder_profile_versions version on version.id = claim.profile_version_id
      where claim.id = requested.claim_id
        and claim.user_id = actor
        and version.user_id = actor
        and version.status = 'active'
    )
  ) then
    raise exception 'MARKETPLACE_APPLICATION_CLAIM_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  insert into public.opportunity_application_capabilities(
    application_id,
    claim_id,
    capability_key,
    capability_label,
    capability_level
  )
  select
    application_id_value,
    claim.id,
    claim.capability_key,
    claim.capability_label,
    claim.level
  from public.builder_capability_claims claim
  where claim.id = any(claim_ids);

  if exists (
    select 1
    from unnest(evidence_ids) requested(evidence_id)
    where not exists (
      select 1
      from public.builder_capability_evidence item
      join public.builder_capability_claims claim on claim.id = item.claim_id
      join public.builder_profile_versions version on version.id = claim.profile_version_id
      where item.id = requested.evidence_id
        and item.user_id = actor
        and claim.user_id = actor
        and version.status = 'active'
        and claim.id = any(claim_ids)
    )
  ) then
    raise exception 'MARKETPLACE_APPLICATION_EVIDENCE_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  insert into public.opportunity_application_evidence(
    application_id,
    claim_id,
    evidence_id,
    source_type,
    source_title,
    evidence_summary,
    source_href
  )
  select
    application_id_value,
    item.claim_id,
    item.id,
    item.source_type,
    item.source_title,
    item.evidence_summary,
    item.source_href
  from public.builder_capability_evidence item
  where item.id = any(evidence_ids);

  if exists (
    select 1
    from unnest(verification_ids) requested(verification_id)
    where not exists (
      select 1
      from public.institution_capability_verifications verification
      where verification.id = requested.verification_id
        and verification.builder_user_id = actor
        and verification.status = 'confirmed'
        and verification.responded_at is not null
    )
  ) then
    raise exception 'MARKETPLACE_APPLICATION_INSTITUTION_VERIFICATION_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  insert into public.opportunity_application_institution_verifications(
    application_id,
    verification_id,
    capability_key,
    capability_label,
    institution_name,
    confirmed_at
  )
  select
    application_id_value,
    verification.id,
    verification.capability_key,
    verification.capability_label_at_request,
    cohort.organisation_name,
    verification.responded_at
  from public.institution_capability_verifications verification
  join public.institution_workspaces workspace on workspace.id = verification.workspace_id
  join public.khpos_school_cohorts cohort on cohort.id = workspace.cohort_id
  where verification.id = any(verification_ids)
    and verification.builder_user_id = actor
    and verification.status = 'confirmed';

  if exists (
    select 1
    from unnest(portfolio_ids) requested(portfolio_id)
    where not exists (
      select 1
      from public.builder_project_portfolios portfolio
      where portfolio.id = requested.portfolio_id
        and portfolio.user_id = actor
        and portfolio.status = 'published'
    )
  ) then
    raise exception 'MARKETPLACE_APPLICATION_PORTFOLIO_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  insert into public.opportunity_application_portfolio_proofs(
    application_id,
    portfolio_id,
    slug,
    public_title,
    public_summary,
    proof_href
  )
  select
    application_id_value,
    portfolio.id,
    portfolio.slug::text,
    portfolio.public_title,
    portfolio.public_summary,
    '/proof/' || portfolio.slug::text
  from public.builder_project_portfolios portfolio
  where portfolio.id = any(portfolio_ids)
    and portfolio.user_id = actor
    and portfolio.status = 'published';

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, opportunity_id, application_id, event_type,
    metadata
  ) values (
    actor,
    opportunity_row.provider_id,
    opportunity_id_input,
    application_id_value,
    'application_draft_saved',
    jsonb_build_object(
      'capabilityCount', cardinality(claim_ids),
      'evidenceCount', cardinality(evidence_ids),
      'institutionVerificationCount', cardinality(verification_ids),
      'portfolioProofCount', cardinality(portfolio_ids)
    )
  );

  return application_id_value;
end;
$$;

create or replace function public.submit_stage20_opportunity_application(
  application_id_input uuid,
  consent_policy_version_input text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  application_row public.opportunity_applications%rowtype;
  opportunity_row public.opportunities%rowtype;
begin
  perform private.stage20_active_adult_builder(actor);

  select application.* into application_row
  from public.opportunity_applications application
  where application.id = application_id_input
    and application.builder_user_id = actor
  for update;

  if application_row.id is null then
    raise exception 'MARKETPLACE_APPLICATION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if application_row.status <> 'draft' then
    raise exception 'MARKETPLACE_APPLICATION_NOT_DRAFT' using errcode = 'P0001';
  end if;
  if consent_policy_version_input <> 'opportunity-marketplace-application-v1' then
    raise exception 'MARKETPLACE_APPLICATION_CONSENT_REQUIRED' using errcode = 'P0001';
  end if;

  opportunity_row := private.stage20_marketplace_opportunity(application_row.opportunity_id);
  if opportunity_row.provider_id <> application_row.provider_id then
    raise exception 'MARKETPLACE_APPLICATION_PROVIDER_MISMATCH' using errcode = 'P0001';
  end if;

  update public.opportunity_applications
  set status = 'submitted',
      consent_policy_version = consent_policy_version_input,
      submitted_at = now()
  where id = application_id_input;

  insert into public.builder_opportunity_state(user_id, opportunity_id, applied_at)
  values (actor, application_row.opportunity_id, now())
  on conflict (user_id, opportunity_id) do update
    set applied_at = coalesce(public.builder_opportunity_state.applied_at, now());

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, opportunity_id, application_id, event_type
  ) values (
    actor,
    application_row.provider_id,
    application_row.opportunity_id,
    application_id_input,
    'application_submitted'
  );
end;
$$;

create or replace function public.withdraw_stage20_opportunity_application(
  application_id_input uuid
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  application_row public.opportunity_applications%rowtype;
begin
  perform private.stage18_active_builder(actor);

  select application.* into application_row
  from public.opportunity_applications application
  where application.id = application_id_input
    and application.builder_user_id = actor
  for update;

  if application_row.id is null then
    raise exception 'MARKETPLACE_APPLICATION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if application_row.status not in ('draft', 'submitted', 'viewed', 'shortlisted') then
    raise exception 'MARKETPLACE_APPLICATION_WITHDRAWAL_NOT_ALLOWED' using errcode = 'P0001';
  end if;

  update public.opportunity_applications
  set status = 'withdrawn',
      withdrawn_at = now()
  where id = application_id_input;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, opportunity_id, application_id, event_type,
    metadata
  ) values (
    actor,
    application_row.provider_id,
    application_row.opportunity_id,
    application_id_input,
    'application_withdrawn',
    jsonb_build_object('from', application_row.status)
  );
end;
$$;

create or replace function private.stage20_application_projection(application_id_input uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  payload jsonb;
begin
  select jsonb_build_object(
    'id', application.id,
    'opportunityId', application.opportunity_id,
    'providerId', application.provider_id,
    'builderUserId', application.builder_user_id,
    'status', application.status,
    'displayName', application.display_name_snapshot,
    'builderSummary', application.builder_summary_snapshot,
    'selectedPathName', application.selected_path_name_snapshot,
    'applicationNote', application.application_note,
    'submittedAt', application.submitted_at,
    'viewedAt', application.viewed_at,
    'decidedAt', application.decided_at,
    'withdrawnAt', application.withdrawn_at,
    'capabilities', coalesce((
      select jsonb_agg(jsonb_build_object(
        'claimId', selection.claim_id,
        'capabilityKey', selection.capability_key,
        'capabilityLabel', selection.capability_label,
        'capabilityLevel', selection.capability_level
      ) order by selection.capability_label)
      from public.opportunity_application_capabilities selection
      where selection.application_id = application.id
    ), '[]'::jsonb),
    'evidence', coalesce((
      select jsonb_agg(jsonb_build_object(
        'evidenceId', selection.evidence_id,
        'claimId', selection.claim_id,
        'sourceType', selection.source_type,
        'sourceTitle', selection.source_title,
        'evidenceSummary', selection.evidence_summary,
        'sourceHref', selection.source_href
      ) order by selection.source_title)
      from public.opportunity_application_evidence selection
      where selection.application_id = application.id
    ), '[]'::jsonb),
    'institutionVerifications', coalesce((
      select jsonb_agg(jsonb_build_object(
        'verificationId', selection.verification_id,
        'capabilityKey', selection.capability_key,
        'capabilityLabel', selection.capability_label,
        'institutionName', selection.institution_name,
        'confirmedAt', selection.confirmed_at
      ) order by selection.institution_name)
      from public.opportunity_application_institution_verifications selection
      where selection.application_id = application.id
    ), '[]'::jsonb),
    'portfolioProofs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'portfolioId', selection.portfolio_id,
        'slug', selection.slug,
        'publicTitle', selection.public_title,
        'publicSummary', selection.public_summary,
        'proofHref', selection.proof_href
      ) order by selection.public_title)
      from public.opportunity_application_portfolio_proofs selection
      where selection.application_id = application.id
    ), '[]'::jsonb)
  ) into payload
  from public.opportunity_applications application
  where application.id = application_id_input;

  return payload;
end;
$$;

revoke all on function private.stage20_application_projection(uuid)
  from public, anon, authenticated;

create or replace function public.get_stage20_provider_applications(provider_id_input uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  member_role public.opportunity_provider_role;
  applications jsonb;
begin
  member_role := private.stage20_require_approved_provider_operator(provider_id_input, actor);

  select coalesce(jsonb_agg(
    private.stage20_application_projection(application.id)
    order by application.submitted_at desc
  ), '[]'::jsonb)
  into applications
  from public.opportunity_applications application
  where application.provider_id = provider_id_input
    and application.status in ('submitted', 'viewed', 'shortlisted', 'accepted', 'not_selected');

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, event_type,
    metadata
  ) values (
    actor,
    provider_id_input,
    'provider_application_queue_viewed',
    jsonb_build_object('role', member_role, 'applicationCount', jsonb_array_length(applications))
  );

  return jsonb_build_object(
    'providerId', provider_id_input,
    'role', member_role,
    'applications', applications
  );
end;
$$;

create or replace function public.transition_stage20_provider_application(
  application_id_input uuid,
  status_input public.opportunity_application_status
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  application_row public.opportunity_applications%rowtype;
  allowed boolean := false;
begin
  select application.* into application_row
  from public.opportunity_applications application
  where application.id = application_id_input
  for update;

  if application_row.id is null then
    raise exception 'MARKETPLACE_APPLICATION_NOT_FOUND' using errcode = 'P0001';
  end if;

  perform private.stage20_require_approved_provider_operator(application_row.provider_id, actor);

  allowed := (
    (application_row.status = 'submitted' and status_input in ('viewed', 'shortlisted', 'accepted', 'not_selected'))
    or (application_row.status = 'viewed' and status_input in ('shortlisted', 'accepted', 'not_selected'))
    or (application_row.status = 'shortlisted' and status_input in ('accepted', 'not_selected'))
  );

  if not allowed then
    raise exception 'MARKETPLACE_APPLICATION_PROVIDER_TRANSITION_INVALID' using errcode = 'P0001';
  end if;

  update public.opportunity_applications
  set status = status_input,
      viewed_at = case
        when status_input in ('viewed', 'shortlisted', 'accepted', 'not_selected')
          then coalesce(viewed_at, now())
        else viewed_at
      end,
      decided_at = case
        when status_input in ('accepted', 'not_selected') then now()
        else decided_at
      end
  where id = application_id_input;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, opportunity_id, application_id, event_type,
    metadata
  ) values (
    actor,
    application_row.provider_id,
    application_row.opportunity_id,
    application_id_input,
    'provider_application_status_changed',
    jsonb_build_object('from', application_row.status, 'to', status_input)
  );

  return application_row.builder_user_id;
end;
$$;

create or replace function public.get_stage20_admin_applications(provider_id_input uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  admin_role public.platform_admin_role;
  applications jsonb;
begin
  admin_role := private.stage18_admin_role(actor);

  select coalesce(jsonb_agg(
    private.stage20_application_projection(application.id)
    order by application.updated_at desc
  ), '[]'::jsonb)
  into applications
  from public.opportunity_applications application
  where provider_id_input is null
     or application.provider_id = provider_id_input;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, event_type,
    metadata
  ) values (
    actor,
    provider_id_input,
    'admin_marketplace_applications_viewed',
    jsonb_build_object('role', admin_role, 'applicationCount', jsonb_array_length(applications))
  );

  return jsonb_build_object('role', admin_role, 'applications', applications);
end;
$$;

-- A provider-owned listing must still pass platform review and cannot be
-- published while its provider is unapproved. Preserve the Stage 18 admin
-- publication boundary while adding the provider trust gate.
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
    if opportunity_row.provider_id is not null and not exists (
      select 1 from public.opportunity_providers provider
      where provider.id = opportunity_row.provider_id
        and provider.status = 'approved'
    ) then
      raise exception 'OPPORTUNITY_PROVIDER_NOT_APPROVED' using errcode = 'P0001';
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

revoke all on function public.get_stage20_admin_provider_registry() from public, anon;
revoke all on function public.upsert_stage20_opportunity_provider(uuid,text,public.opportunity_provider_organisation_type,text,text,text,text) from public, anon;
revoke all on function public.set_stage20_opportunity_provider_status(uuid,public.opportunity_provider_status,text) from public, anon;
revoke all on function public.set_stage20_opportunity_provider_member(uuid,text,public.opportunity_provider_role,boolean) from public, anon;
revoke all on function public.get_stage20_provider_workspace(uuid) from public, anon;
revoke all on function public.upsert_stage20_provider_opportunity(uuid,uuid,text,public.opportunity_category,text,text,text,smallint,smallint,public.opportunity_geography_scope,text[],text,public.opportunity_delivery_mode,text[],text[],text,date) from public, anon;
revoke all on function public.get_stage20_marketplace_catalog() from public, anon;
revoke all on function public.get_stage20_builder_application_workspace(uuid) from public, anon;
revoke all on function public.save_stage20_opportunity_application_draft(uuid,text,text,text,uuid[],uuid[],uuid[],uuid[]) from public, anon;
revoke all on function public.submit_stage20_opportunity_application(uuid,text) from public, anon;
revoke all on function public.withdraw_stage20_opportunity_application(uuid) from public, anon;
revoke all on function public.get_stage20_provider_applications(uuid) from public, anon;
revoke all on function public.transition_stage20_provider_application(uuid,public.opportunity_application_status) from public, anon;
revoke all on function public.get_stage20_admin_applications(uuid) from public, anon;

-- Revoke PUBLIC execute as well: SECURITY DEFINER functions are not an implicit
-- API. Only explicitly allow-listed authenticated users and service-role code
-- may call the public Stage 20 boundary.
revoke all on function public.get_stage20_admin_provider_registry() from public;
revoke all on function public.upsert_stage20_opportunity_provider(uuid,text,public.opportunity_provider_organisation_type,text,text,text,text) from public;
revoke all on function public.set_stage20_opportunity_provider_status(uuid,public.opportunity_provider_status,text) from public;
revoke all on function public.set_stage20_opportunity_provider_member(uuid,text,public.opportunity_provider_role,boolean) from public;
revoke all on function public.get_stage20_provider_workspace(uuid) from public;
revoke all on function public.upsert_stage20_provider_opportunity(uuid,uuid,text,public.opportunity_category,text,text,text,smallint,smallint,public.opportunity_geography_scope,text[],text,public.opportunity_delivery_mode,text[],text[],text,date) from public;
revoke all on function public.get_stage20_marketplace_catalog() from public;
revoke all on function public.get_stage20_builder_application_workspace(uuid) from public;
revoke all on function public.save_stage20_opportunity_application_draft(uuid,text,text,text,uuid[],uuid[],uuid[],uuid[]) from public;
revoke all on function public.submit_stage20_opportunity_application(uuid,text) from public;
revoke all on function public.withdraw_stage20_opportunity_application(uuid) from public;
revoke all on function public.get_stage20_provider_applications(uuid) from public;
revoke all on function public.transition_stage20_provider_application(uuid,public.opportunity_application_status) from public;
revoke all on function public.get_stage20_admin_applications(uuid) from public;

grant execute on function public.get_stage20_admin_provider_registry() to authenticated, service_role;
grant execute on function public.upsert_stage20_opportunity_provider(uuid,text,public.opportunity_provider_organisation_type,text,text,text,text) to authenticated, service_role;
grant execute on function public.set_stage20_opportunity_provider_status(uuid,public.opportunity_provider_status,text) to authenticated, service_role;
grant execute on function public.set_stage20_opportunity_provider_member(uuid,text,public.opportunity_provider_role,boolean) to authenticated, service_role;
grant execute on function public.get_stage20_provider_workspace(uuid) to authenticated, service_role;
grant execute on function public.upsert_stage20_provider_opportunity(uuid,uuid,text,public.opportunity_category,text,text,text,smallint,smallint,public.opportunity_geography_scope,text[],text,public.opportunity_delivery_mode,text[],text[],text,date) to authenticated, service_role;
grant execute on function public.get_stage20_marketplace_catalog() to authenticated, service_role;
grant execute on function public.get_stage20_builder_application_workspace(uuid) to authenticated, service_role;
grant execute on function public.save_stage20_opportunity_application_draft(uuid,text,text,text,uuid[],uuid[],uuid[],uuid[]) to authenticated, service_role;
grant execute on function public.submit_stage20_opportunity_application(uuid,text) to authenticated, service_role;
grant execute on function public.withdraw_stage20_opportunity_application(uuid) to authenticated, service_role;
grant execute on function public.get_stage20_provider_applications(uuid) to authenticated, service_role;
grant execute on function public.transition_stage20_provider_application(uuid,public.opportunity_application_status) to authenticated, service_role;
grant execute on function public.get_stage20_admin_applications(uuid) to authenticated, service_role;
