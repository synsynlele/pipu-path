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

