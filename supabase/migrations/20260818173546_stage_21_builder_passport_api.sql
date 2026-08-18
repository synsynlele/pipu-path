-- Stage 21: Builder Passport/API.
--
-- A Passport is an immutable Builder-controlled snapshot of existing PipuPath
-- proof. External shares are revocable capabilities. Raw share secrets never
-- enter Postgres; only SHA-256 hex hashes are persisted. Public share resolution
-- is service-role-only so the Next.js boundary can enforce durable rate limits
-- before any Passport data is returned.

create type public.builder_passport_status as enum (
  'issued',
  'superseded',
  'revoked'
);

create table public.builder_passport_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  version integer not null check (version > 0),
  source_profile_version_id uuid not null references public.builder_profile_versions(id) on delete restrict,
  status public.builder_passport_status not null default 'issued',
  display_name_snapshot text not null check (char_length(display_name_snapshot) between 2 and 120),
  public_summary_snapshot text check (
    public_summary_snapshot is null
    or char_length(public_summary_snapshot) between 3 and 800
  ),
  selected_path_name_snapshot text check (
    selected_path_name_snapshot is null
    or char_length(selected_path_name_snapshot) between 3 and 180
  ),
  consent_policy_version text not null check (consent_policy_version = 'builder-passport-v1'),
  issued_at timestamptz not null default now(),
  superseded_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, version),
  constraint builder_passport_status_consistency check (
    (status = 'issued' and superseded_at is null and revoked_at is null)
    or (status = 'superseded' and superseded_at is not null and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
  )
);

create unique index builder_passport_one_issued_per_builder_idx
  on public.builder_passport_versions(user_id)
  where status = 'issued';
create index builder_passport_versions_user_history_idx
  on public.builder_passport_versions(user_id, version desc);
create index builder_passport_versions_profile_idx
  on public.builder_passport_versions(source_profile_version_id);

create trigger builder_passport_versions_updated_at
before update on public.builder_passport_versions
for each row execute function public.set_updated_at();

create table public.builder_passport_capabilities (
  passport_id uuid not null references public.builder_passport_versions(id) on delete cascade,
  claim_id uuid not null references public.builder_capability_claims(id) on delete restrict,
  capability_key text not null check (char_length(capability_key) between 2 and 120),
  capability_label text not null check (char_length(capability_label) between 2 and 120),
  capability_level public.builder_capability_level not null,
  created_at timestamptz not null default now(),
  primary key (passport_id, claim_id),
  unique (passport_id, capability_key)
);

create index builder_passport_capabilities_claim_idx
  on public.builder_passport_capabilities(claim_id);

create table public.builder_passport_evidence (
  passport_id uuid not null references public.builder_passport_versions(id) on delete cascade,
  evidence_id uuid not null references public.builder_capability_evidence(id) on delete restrict,
  claim_id uuid not null references public.builder_capability_claims(id) on delete restrict,
  capability_key text not null check (char_length(capability_key) between 2 and 120),
  source_type public.builder_capability_evidence_source not null,
  source_title text not null check (char_length(source_title) between 2 and 160),
  evidence_summary text not null check (char_length(evidence_summary) between 10 and 400),
  verification public.builder_capability_verification not null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (passport_id, evidence_id),
  foreign key (passport_id, claim_id)
    references public.builder_passport_capabilities(passport_id, claim_id)
    on delete cascade
);

create index builder_passport_evidence_evidence_idx
  on public.builder_passport_evidence(evidence_id);
create index builder_passport_evidence_claim_idx
  on public.builder_passport_evidence(claim_id);

create table public.builder_passport_institution_verifications (
  passport_id uuid not null references public.builder_passport_versions(id) on delete cascade,
  verification_id uuid not null references public.institution_capability_verifications(id) on delete restrict,
  claim_id uuid not null references public.builder_capability_claims(id) on delete restrict,
  capability_key text not null check (char_length(capability_key) between 2 and 120),
  capability_label text not null check (char_length(capability_label) between 2 and 120),
  institution_name text not null check (char_length(institution_name) between 2 and 180),
  confirmed_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (passport_id, verification_id),
  foreign key (passport_id, claim_id)
    references public.builder_passport_capabilities(passport_id, claim_id)
    on delete cascade
);

create index builder_passport_institution_verification_idx
  on public.builder_passport_institution_verifications(verification_id);
create index builder_passport_institution_claim_idx
  on public.builder_passport_institution_verifications(claim_id);

create table public.builder_passport_portfolio_proofs (
  passport_id uuid not null references public.builder_passport_versions(id) on delete cascade,
  portfolio_id uuid not null references public.builder_project_portfolios(id) on delete restrict,
  slug text not null check (char_length(slug) between 3 and 120),
  public_title text not null check (char_length(public_title) between 3 and 180),
  public_summary text not null check (char_length(public_summary) between 20 and 600),
  proof_href text not null check (proof_href ~ '^/proof/'),
  published_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (passport_id, portfolio_id)
);

create index builder_passport_portfolio_proof_idx
  on public.builder_passport_portfolio_proofs(portfolio_id);

create table public.builder_passport_shares (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.builder_passport_versions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete restrict,
  secret_hash text not null unique check (secret_hash ~ '^[a-f0-9]{64}$'),
  label text check (label is null or char_length(label) between 3 and 80),
  expires_at timestamptz not null,
  last_accessed_at timestamptz,
  access_count integer not null default 0 check (access_count >= 0),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint builder_passport_share_expiry check (
    expires_at > created_at
    and expires_at <= created_at + interval '90 days 5 minutes'
  )
);

create index builder_passport_shares_user_idx
  on public.builder_passport_shares(user_id, created_at desc);
create index builder_passport_shares_passport_idx
  on public.builder_passport_shares(passport_id, revoked_at, expires_at);

create trigger builder_passport_shares_updated_at
before update on public.builder_passport_shares
for each row execute function public.set_updated_at();

create table public.builder_passport_access_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(id) on delete set null,
  passport_id uuid references public.builder_passport_versions(id) on delete set null,
  share_id uuid references public.builder_passport_shares(id) on delete set null,
  event_type text not null check (char_length(event_type) between 3 and 100),
  integrity_state text check (integrity_state is null or integrity_state in ('current', 'changed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index builder_passport_access_passport_idx
  on public.builder_passport_access_events(passport_id, created_at desc);
create index builder_passport_access_share_idx
  on public.builder_passport_access_events(share_id, created_at desc);
create index builder_passport_access_actor_idx
  on public.builder_passport_access_events(actor_user_id, created_at desc);

create table public.builder_passport_rate_limits (
  key_hash text primary key check (key_hash ~ '^[a-f0-9]{64}$'),
  attempts integer not null default 0 check (attempts >= 0),
  window_started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.builder_passport_versions enable row level security;
alter table public.builder_passport_capabilities enable row level security;
alter table public.builder_passport_evidence enable row level security;
alter table public.builder_passport_institution_verifications enable row level security;
alter table public.builder_passport_portfolio_proofs enable row level security;
alter table public.builder_passport_shares enable row level security;
alter table public.builder_passport_access_events enable row level security;
alter table public.builder_passport_rate_limits enable row level security;

revoke all on
  public.builder_passport_versions,
  public.builder_passport_capabilities,
  public.builder_passport_evidence,
  public.builder_passport_institution_verifications,
  public.builder_passport_portfolio_proofs,
  public.builder_passport_shares,
  public.builder_passport_access_events,
  public.builder_passport_rate_limits
from public, anon, authenticated;

grant select, insert, update, delete on
  public.builder_passport_versions,
  public.builder_passport_capabilities,
  public.builder_passport_evidence,
  public.builder_passport_institution_verifications,
  public.builder_passport_portfolio_proofs,
  public.builder_passport_shares,
  public.builder_passport_access_events,
  public.builder_passport_rate_limits
  to service_role;

grant usage, select on sequence public.builder_passport_access_events_id_seq
  to service_role;

create or replace function private.stage21_require_active_builder(actor uuid)
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
  ) then
    raise exception 'PASSPORT_ACTIVE_BUILDER_REQUIRED' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function private.stage21_require_active_builder(uuid)
  from public, anon, authenticated;

create or replace function private.stage21_require_adult_builder(actor uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.stage21_require_active_builder(actor);

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = actor
      and coalesce(profile.is_minor, true) = false
      and profile.safeguarding_review_required = false
  ) then
    raise exception 'PASSPORT_ADULT_BUILDER_REQUIRED' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function private.stage21_require_adult_builder(uuid)
  from public, anon, authenticated;

create or replace function private.stage21_guard_passport_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id
    or new.version is distinct from old.version
    or new.source_profile_version_id is distinct from old.source_profile_version_id
    or new.display_name_snapshot is distinct from old.display_name_snapshot
    or new.public_summary_snapshot is distinct from old.public_summary_snapshot
    or new.selected_path_name_snapshot is distinct from old.selected_path_name_snapshot
    or new.consent_policy_version is distinct from old.consent_policy_version
    or new.issued_at is distinct from old.issued_at
    or new.created_at is distinct from old.created_at then
    raise exception 'PASSPORT_SNAPSHOT_IMMUTABLE' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function private.stage21_guard_passport_immutable()
  from public, anon, authenticated;

create trigger builder_passport_immutable_snapshot
before update on public.builder_passport_versions
for each row execute function private.stage21_guard_passport_immutable();

create or replace function public.get_stage21_builder_passport_workspace()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  profile_row public.profiles%rowtype;
  active_profile_version_id uuid;
  adult_eligible boolean := false;
  capabilities jsonb := '[]'::jsonb;
  evidence jsonb := '[]'::jsonb;
  institution_verifications jsonb := '[]'::jsonb;
  portfolio_proofs jsonb := '[]'::jsonb;
  passports jsonb := '[]'::jsonb;
  shares jsonb := '[]'::jsonb;
begin
  perform private.stage21_require_active_builder(actor);

  select * into profile_row
  from public.profiles
  where id = actor;

  adult_eligible := coalesce(profile_row.is_minor, true) = false
    and profile_row.safeguarding_review_required = false;

  select version.id into active_profile_version_id
  from public.builder_profile_versions version
  where version.user_id = actor
    and version.status = 'active'
  order by version.version desc
  limit 1;

  if active_profile_version_id is not null then
    select coalesce(jsonb_agg(jsonb_build_object(
      'claimId', claim.id,
      'capabilityKey', claim.capability_key,
      'capabilityLabel', claim.capability_label,
      'capabilityLevel', claim.level
    ) order by claim.capability_label), '[]'::jsonb)
    into capabilities
    from public.builder_capability_claims claim
    where claim.user_id = actor
      and claim.profile_version_id = active_profile_version_id;

    select coalesce(jsonb_agg(jsonb_build_object(
      'evidenceId', item.id,
      'claimId', item.claim_id,
      'capabilityKey', claim.capability_key,
      'sourceType', item.source_type,
      'sourceTitle', item.source_title,
      'evidenceSummary', item.evidence_summary,
      'verification', item.verification,
      'occurredAt', item.source_occurred_at
    ) order by item.source_occurred_at desc), '[]'::jsonb)
    into evidence
    from public.builder_capability_evidence item
    join public.builder_capability_claims claim on claim.id = item.claim_id
    where item.user_id = actor
      and claim.user_id = actor
      and claim.profile_version_id = active_profile_version_id;

    select coalesce(jsonb_agg(jsonb_build_object(
      'verificationId', verification.id,
      'claimId', verification.claim_id_at_request,
      'capabilityKey', verification.capability_key,
      'capabilityLabel', verification.capability_label_at_request,
      'institutionName', cohort.organisation_name,
      'confirmedAt', verification.responded_at
    ) order by verification.responded_at desc), '[]'::jsonb)
    into institution_verifications
    from public.institution_capability_verifications verification
    join public.builder_capability_claims claim on claim.id = verification.claim_id_at_request
    join public.institution_workspaces workspace on workspace.id = verification.workspace_id
    join public.khpos_school_cohorts cohort on cohort.id = workspace.cohort_id
    where verification.builder_user_id = actor
      and verification.status = 'confirmed'
      and verification.responded_at is not null
      and claim.user_id = actor
      and claim.profile_version_id = active_profile_version_id;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'portfolioId', portfolio.id,
    'slug', portfolio.slug::text,
    'publicTitle', portfolio.public_title,
    'publicSummary', portfolio.public_summary,
    'proofHref', '/proof/' || portfolio.slug::text,
    'publishedAt', portfolio.published_at
  ) order by portfolio.published_at desc), '[]'::jsonb)
  into portfolio_proofs
  from public.builder_project_portfolios portfolio
  where portfolio.user_id = actor
    and portfolio.status = 'published'
    and portfolio.published_at is not null;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', passport.id,
    'version', passport.version,
    'status', passport.status,
    'displayName', passport.display_name_snapshot,
    'publicSummary', passport.public_summary_snapshot,
    'selectedPathName', passport.selected_path_name_snapshot,
    'issuedAt', passport.issued_at,
    'supersededAt', passport.superseded_at,
    'revokedAt', passport.revoked_at
  ) order by passport.version desc), '[]'::jsonb)
  into passports
  from public.builder_passport_versions passport
  where passport.user_id = actor;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', share.id,
    'passportId', share.passport_id,
    'label', share.label,
    'expiresAt', share.expires_at,
    'lastAccessedAt', share.last_accessed_at,
    'accessCount', share.access_count,
    'revokedAt', share.revoked_at,
    'createdAt', share.created_at
  ) order by share.created_at desc), '[]'::jsonb)
  into shares
  from public.builder_passport_shares share
  where share.user_id = actor;

  return jsonb_build_object(
    'adultEligible', adult_eligible,
    'profile', jsonb_build_object(
      'displayName', coalesce(
        nullif(btrim(profile_row.display_name), ''),
        nullif(btrim(profile_row.preferred_name), ''),
        nullif(btrim(profile_row.username::text), '')
      )
    ),
    'activeProfileVersionId', active_profile_version_id,
    'eligibleCapabilities', capabilities,
    'eligibleEvidence', evidence,
    'eligibleInstitutionVerifications', institution_verifications,
    'eligiblePortfolioProofs', portfolio_proofs,
    'passports', passports,
    'shares', shares
  );
end;
$$;

revoke all on function public.get_stage21_builder_passport_workspace()
  from public, anon;
grant execute on function public.get_stage21_builder_passport_workspace()
  to authenticated, service_role;

create or replace function public.issue_stage21_builder_passport(
  public_summary_input text,
  selected_path_name_input text,
  claim_ids_input uuid[],
  evidence_ids_input uuid[],
  institution_verification_ids_input uuid[],
  portfolio_ids_input uuid[],
  consent_policy_version_input text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  claim_ids uuid[] := coalesce(claim_ids_input, '{}'::uuid[]);
  evidence_ids uuid[] := coalesce(evidence_ids_input, '{}'::uuid[]);
  verification_ids uuid[] := coalesce(institution_verification_ids_input, '{}'::uuid[]);
  portfolio_ids uuid[] := coalesce(portfolio_ids_input, '{}'::uuid[]);
  active_profile_version_id uuid;
  current_passport_id uuid;
  passport_id_value uuid;
  display_name_value text;
  next_version integer;
begin
  perform private.stage21_require_adult_builder(actor);

  if consent_policy_version_input <> 'builder-passport-v1' then
    raise exception 'PASSPORT_CONSENT_REQUIRED' using errcode = 'P0001';
  end if;

  if cardinality(claim_ids) < 1
    or cardinality(claim_ids) > 12
    or cardinality(evidence_ids) > 20
    or cardinality(verification_ids) > 12
    or cardinality(portfolio_ids) > 8
    or (
      cardinality(evidence_ids) = 0
      and cardinality(verification_ids) = 0
      and cardinality(portfolio_ids) = 0
    ) then
    raise exception 'PASSPORT_SELECTION_INVALID' using errcode = 'P0001';
  end if;

  if cardinality(claim_ids) <> (select count(distinct value) from unnest(claim_ids) value)
    or cardinality(evidence_ids) <> (select count(distinct value) from unnest(evidence_ids) value)
    or cardinality(verification_ids) <> (select count(distinct value) from unnest(verification_ids) value)
    or cardinality(portfolio_ids) <> (select count(distinct value) from unnest(portfolio_ids) value) then
    raise exception 'PASSPORT_DUPLICATE_SELECTION' using errcode = 'P0001';
  end if;

  perform 1
  from public.profiles profile
  where profile.id = actor
  for update;

  select coalesce(
    nullif(btrim(profile.display_name), ''),
    nullif(btrim(profile.preferred_name), ''),
    nullif(btrim(profile.username::text), '')
  ) into display_name_value
  from public.profiles profile
  where profile.id = actor;

  if display_name_value is null then
    raise exception 'PASSPORT_DISPLAY_NAME_REQUIRED' using errcode = 'P0001';
  end if;

  select version.id into active_profile_version_id
  from public.builder_profile_versions version
  where version.user_id = actor
    and version.status = 'active'
  order by version.version desc
  limit 1;

  if active_profile_version_id is null then
    raise exception 'PASSPORT_ACTIVE_PROFILE_REQUIRED' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from unnest(claim_ids) requested(claim_id)
    where not exists (
      select 1
      from public.builder_capability_claims claim
      where claim.id = requested.claim_id
        and claim.user_id = actor
        and claim.profile_version_id = active_profile_version_id
    )
  ) then
    raise exception 'PASSPORT_CLAIM_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from unnest(evidence_ids) requested(evidence_id)
    where not exists (
      select 1
      from public.builder_capability_evidence item
      join public.builder_capability_claims claim on claim.id = item.claim_id
      where item.id = requested.evidence_id
        and item.user_id = actor
        and claim.user_id = actor
        and claim.profile_version_id = active_profile_version_id
        and claim.id = any(claim_ids)
    )
  ) then
    raise exception 'PASSPORT_EVIDENCE_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

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
        and verification.claim_id_at_request = any(claim_ids)
    )
  ) then
    raise exception 'PASSPORT_INSTITUTION_VERIFICATION_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from unnest(portfolio_ids) requested(portfolio_id)
    where not exists (
      select 1
      from public.builder_project_portfolios portfolio
      where portfolio.id = requested.portfolio_id
        and portfolio.user_id = actor
        and portfolio.status = 'published'
        and portfolio.published_at is not null
    )
  ) then
    raise exception 'PASSPORT_PORTFOLIO_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  select passport.id into current_passport_id
  from public.builder_passport_versions passport
  where passport.user_id = actor
    and passport.status = 'issued'
  for update;

  if current_passport_id is not null then
    update public.builder_passport_versions
    set status = 'superseded',
        superseded_at = now()
    where id = current_passport_id;

    update public.builder_passport_shares
    set revoked_at = coalesce(revoked_at, now())
    where passport_id = current_passport_id
      and revoked_at is null;
  end if;

  select coalesce(max(passport.version), 0) + 1 into next_version
  from public.builder_passport_versions passport
  where passport.user_id = actor;

  insert into public.builder_passport_versions(
    user_id,
    version,
    source_profile_version_id,
    status,
    display_name_snapshot,
    public_summary_snapshot,
    selected_path_name_snapshot,
    consent_policy_version
  ) values (
    actor,
    next_version,
    active_profile_version_id,
    'issued',
    display_name_value,
    nullif(btrim(public_summary_input), ''),
    nullif(btrim(selected_path_name_input), ''),
    consent_policy_version_input
  ) returning id into passport_id_value;

  insert into public.builder_passport_capabilities(
    passport_id,
    claim_id,
    capability_key,
    capability_label,
    capability_level
  )
  select
    passport_id_value,
    claim.id,
    claim.capability_key,
    claim.capability_label,
    claim.level
  from public.builder_capability_claims claim
  where claim.id = any(claim_ids)
    and claim.user_id = actor
    and claim.profile_version_id = active_profile_version_id;

  insert into public.builder_passport_evidence(
    passport_id,
    evidence_id,
    claim_id,
    capability_key,
    source_type,
    source_title,
    evidence_summary,
    verification,
    occurred_at
  )
  select
    passport_id_value,
    item.id,
    item.claim_id,
    claim.capability_key,
    item.source_type,
    item.source_title,
    item.evidence_summary,
    item.verification,
    item.source_occurred_at
  from public.builder_capability_evidence item
  join public.builder_capability_claims claim on claim.id = item.claim_id
  where item.id = any(evidence_ids)
    and item.user_id = actor
    and claim.id = any(claim_ids);

  insert into public.builder_passport_institution_verifications(
    passport_id,
    verification_id,
    claim_id,
    capability_key,
    capability_label,
    institution_name,
    confirmed_at
  )
  select
    passport_id_value,
    verification.id,
    verification.claim_id_at_request,
    verification.capability_key,
    verification.capability_label_at_request,
    cohort.organisation_name,
    verification.responded_at
  from public.institution_capability_verifications verification
  join public.institution_workspaces workspace on workspace.id = verification.workspace_id
  join public.khpos_school_cohorts cohort on cohort.id = workspace.cohort_id
  where verification.id = any(verification_ids)
    and verification.builder_user_id = actor
    and verification.status = 'confirmed'
    and verification.responded_at is not null
    and verification.claim_id_at_request = any(claim_ids);

  insert into public.builder_passport_portfolio_proofs(
    passport_id,
    portfolio_id,
    slug,
    public_title,
    public_summary,
    proof_href,
    published_at
  )
  select
    passport_id_value,
    portfolio.id,
    portfolio.slug::text,
    portfolio.public_title,
    portfolio.public_summary,
    '/proof/' || portfolio.slug::text,
    portfolio.published_at
  from public.builder_project_portfolios portfolio
  where portfolio.id = any(portfolio_ids)
    and portfolio.user_id = actor
    and portfolio.status = 'published'
    and portfolio.published_at is not null;

  insert into public.builder_passport_access_events(
    actor_user_id,
    passport_id,
    event_type,
    metadata
  ) values (
    actor,
    passport_id_value,
    'passport_issued',
    jsonb_build_object(
      'version', next_version,
      'capabilityCount', cardinality(claim_ids),
      'evidenceCount', cardinality(evidence_ids),
      'institutionVerificationCount', cardinality(verification_ids),
      'portfolioProofCount', cardinality(portfolio_ids)
    )
  );

  return passport_id_value;
end;
$$;

revoke all on function public.issue_stage21_builder_passport(
  text, text, uuid[], uuid[], uuid[], uuid[], text
) from public, anon;
grant execute on function public.issue_stage21_builder_passport(
  text, text, uuid[], uuid[], uuid[], uuid[], text
) to authenticated, service_role;

create or replace function public.revoke_stage21_builder_passport(passport_id_input uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  revoked_count integer := 0;
begin
  perform private.stage21_require_active_builder(actor);

  update public.builder_passport_versions
  set status = 'revoked',
      revoked_at = now()
  where id = passport_id_input
    and user_id = actor
    and status = 'issued';

  get diagnostics revoked_count = row_count;

  if revoked_count = 0 then
    raise exception 'PASSPORT_CURRENT_VERSION_NOT_FOUND' using errcode = 'P0001';
  end if;

  update public.builder_passport_shares
  set revoked_at = coalesce(revoked_at, now())
  where passport_id = passport_id_input
    and user_id = actor
    and revoked_at is null;

  insert into public.builder_passport_access_events(
    actor_user_id, passport_id, event_type
  ) values (actor, passport_id_input, 'passport_revoked');

  return true;
end;
$$;

revoke all on function public.revoke_stage21_builder_passport(uuid)
  from public, anon;
grant execute on function public.revoke_stage21_builder_passport(uuid)
  to authenticated, service_role;

create or replace function public.create_stage21_passport_share(
  passport_id_input uuid,
  secret_hash_input text,
  label_input text,
  expires_in_days_input integer
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  share_id_value uuid;
begin
  perform private.stage21_require_adult_builder(actor);

  if secret_hash_input !~ '^[a-f0-9]{64}$'
    or expires_in_days_input not in (1, 7, 30, 90) then
    raise exception 'PASSPORT_SHARE_INPUT_INVALID' using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.builder_passport_versions passport
    where passport.id = passport_id_input
      and passport.user_id = actor
      and passport.status = 'issued'
  ) then
    raise exception 'PASSPORT_CURRENT_VERSION_NOT_FOUND' using errcode = 'P0001';
  end if;

  insert into public.builder_passport_shares(
    passport_id,
    user_id,
    secret_hash,
    label,
    expires_at
  ) values (
    passport_id_input,
    actor,
    secret_hash_input,
    nullif(btrim(label_input), ''),
    now() + make_interval(days => expires_in_days_input)
  ) returning id into share_id_value;

  insert into public.builder_passport_access_events(
    actor_user_id,
    passport_id,
    share_id,
    event_type,
    metadata
  ) values (
    actor,
    passport_id_input,
    share_id_value,
    'share_created',
    jsonb_build_object('expiresInDays', expires_in_days_input)
  );

  return share_id_value;
end;
$$;

revoke all on function public.create_stage21_passport_share(uuid, text, text, integer)
  from public, anon;
grant execute on function public.create_stage21_passport_share(uuid, text, text, integer)
  to authenticated, service_role;

create or replace function public.revoke_stage21_passport_share(share_id_input uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  passport_id_value uuid;
  revoked_count integer := 0;
begin
  perform private.stage21_require_active_builder(actor);

  select share.passport_id into passport_id_value
  from public.builder_passport_shares share
  where share.id = share_id_input
    and share.user_id = actor;

  if passport_id_value is null then
    raise exception 'PASSPORT_SHARE_NOT_FOUND' using errcode = 'P0001';
  end if;

  update public.builder_passport_shares
  set revoked_at = now()
  where id = share_id_input
    and user_id = actor
    and revoked_at is null;

  get diagnostics revoked_count = row_count;

  if revoked_count = 0 then
    return true;
  end if;

  insert into public.builder_passport_access_events(
    actor_user_id, passport_id, share_id, event_type
  ) values (actor, passport_id_value, share_id_input, 'share_revoked');

  return true;
end;
$$;

revoke all on function public.revoke_stage21_passport_share(uuid)
  from public, anon;
grant execute on function public.revoke_stage21_passport_share(uuid)
  to authenticated, service_role;

create or replace function public.consume_stage21_passport_rate_limit(
  key_hash_input text,
  limit_input integer default 30,
  window_seconds_input integer default 60
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  bucket public.builder_passport_rate_limits%rowtype;
  now_value timestamptz := clock_timestamp();
  inserted_count integer := 0;
begin
  if key_hash_input !~ '^[a-f0-9]{64}$'
    or limit_input not between 1 and 120
    or window_seconds_input not between 10 and 3600 then
    return false;
  end if;

  insert into public.builder_passport_rate_limits(
    key_hash,
    attempts,
    window_started_at,
    updated_at
  ) values (
    key_hash_input,
    1,
    now_value,
    now_value
  )
  on conflict (key_hash) do nothing;

  get diagnostics inserted_count = row_count;

  select * into bucket
  from public.builder_passport_rate_limits
  where key_hash = key_hash_input
  for update;

  if bucket.window_started_at + make_interval(secs => window_seconds_input) <= now_value then
    update public.builder_passport_rate_limits
    set attempts = 1,
        window_started_at = now_value,
        updated_at = now_value
    where key_hash = key_hash_input;
    return true;
  end if;

  if inserted_count = 1 then
    return true;
  end if;

  if bucket.attempts >= limit_input then
    return false;
  end if;

  update public.builder_passport_rate_limits
  set attempts = attempts + 1,
      updated_at = now_value
  where key_hash = key_hash_input;

  return true;
end;
$$;

revoke all on function public.consume_stage21_passport_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_stage21_passport_rate_limit(text, integer, integer)
  to service_role;

create or replace function public.resolve_stage21_passport_share(
  share_id_input uuid,
  secret_hash_input text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  share_row public.builder_passport_shares%rowtype;
  passport_row public.builder_passport_versions%rowtype;
  capabilities jsonb := '[]'::jsonb;
  evidence jsonb := '[]'::jsonb;
  institution_verifications jsonb := '[]'::jsonb;
  portfolio_proofs jsonb := '[]'::jsonb;
  notices jsonb := '[]'::jsonb;
  institution_changes integer := 0;
  portfolio_changes integer := 0;
  integrity_state_value text := 'current';
begin
  if share_id_input is null or secret_hash_input !~ '^[a-f0-9]{64}$' then
    return null;
  end if;

  select share.* into share_row
  from public.builder_passport_shares share
  join public.builder_passport_versions passport on passport.id = share.passport_id
  where share.id = share_id_input
    and share.secret_hash = secret_hash_input
    and share.revoked_at is null
    and share.expires_at > clock_timestamp()
    and passport.status = 'issued'
  for update of share;

  if share_row.id is null then
    return null;
  end if;

  select * into passport_row
  from public.builder_passport_versions
  where id = share_row.passport_id
    and status = 'issued';

  if passport_row.id is null then
    return null;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'capabilityKey', item.capability_key,
    'capabilityLabel', item.capability_label,
    'capabilityLevel', item.capability_level
  ) order by item.capability_label), '[]'::jsonb)
  into capabilities
  from public.builder_passport_capabilities item
  where item.passport_id = passport_row.id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'capabilityKey', item.capability_key,
    'sourceType', item.source_type,
    'sourceTitle', item.source_title,
    'evidenceSummary', item.evidence_summary,
    'verification', item.verification,
    'occurredAt', item.occurred_at
  ) order by item.occurred_at desc), '[]'::jsonb)
  into evidence
  from public.builder_passport_evidence item
  where item.passport_id = passport_row.id;

  select
    coalesce(jsonb_agg(jsonb_build_object(
      'capabilityKey', item.capability_key,
      'capabilityLabel', item.capability_label,
      'institutionName', item.institution_name,
      'confirmedAt', item.confirmed_at,
      'current', (
        verification.status = 'confirmed'
        and verification.responded_at is not null
      )
    ) order by item.confirmed_at desc), '[]'::jsonb),
    count(*) filter (where verification.status is distinct from 'confirmed' or verification.responded_at is null)
  into institution_verifications, institution_changes
  from public.builder_passport_institution_verifications item
  left join public.institution_capability_verifications verification
    on verification.id = item.verification_id
  where item.passport_id = passport_row.id;

  select
    coalesce(jsonb_agg(jsonb_build_object(
      'slug', item.slug,
      'publicTitle', item.public_title,
      'publicSummary', item.public_summary,
      'proofHref', case when portfolio.status = 'published' then item.proof_href else null end,
      'current', portfolio.status = 'published'
    ) order by item.published_at desc), '[]'::jsonb),
    count(*) filter (where portfolio.status is distinct from 'published')
  into portfolio_proofs, portfolio_changes
  from public.builder_passport_portfolio_proofs item
  left join public.builder_project_portfolios portfolio
    on portfolio.id = item.portfolio_id
  where item.passport_id = passport_row.id;

  if institution_changes > 0 or portfolio_changes > 0 then
    integrity_state_value := 'changed';
  end if;

  select coalesce(jsonb_agg(value order by value), '[]'::jsonb)
  into notices
  from (
    select 'Institution confirmation changed: ' || item.capability_label as value
    from public.builder_passport_institution_verifications item
    left join public.institution_capability_verifications verification
      on verification.id = item.verification_id
    where item.passport_id = passport_row.id
      and (verification.status is distinct from 'confirmed' or verification.responded_at is null)

    union all

    select 'Portfolio proof no longer published: ' || item.public_title as value
    from public.builder_passport_portfolio_proofs item
    left join public.builder_project_portfolios portfolio
      on portfolio.id = item.portfolio_id
    where item.passport_id = passport_row.id
      and portfolio.status is distinct from 'published'
  ) notice_rows;

  update public.builder_passport_shares
  set last_accessed_at = clock_timestamp(),
      access_count = access_count + 1
  where id = share_row.id;

  insert into public.builder_passport_access_events(
    passport_id,
    share_id,
    event_type,
    integrity_state,
    metadata
  ) values (
    passport_row.id,
    share_row.id,
    'share_resolved',
    integrity_state_value,
    jsonb_build_object(
      'institutionChanges', institution_changes,
      'portfolioChanges', portfolio_changes
    )
  );

  return jsonb_build_object(
    'schemaVersion', 'builder-passport.v1',
    'passportId', passport_row.id,
    'version', passport_row.version,
    'issuedAt', passport_row.issued_at,
    'builder', jsonb_build_object(
      'displayName', passport_row.display_name_snapshot,
      'publicSummary', passport_row.public_summary_snapshot,
      'selectedPathName', passport_row.selected_path_name_snapshot
    ),
    'capabilities', capabilities,
    'evidence', evidence,
    'institutionVerifications', institution_verifications,
    'portfolioProofs', portfolio_proofs,
    'integrity', jsonb_build_object(
      'state', integrity_state_value,
      'checkedAt', clock_timestamp(),
      'notices', notices
    ),
    'share', jsonb_build_object(
      'expiresAt', share_row.expires_at
    )
  );
end;
$$;

revoke all on function public.resolve_stage21_passport_share(uuid, text)
  from public, anon, authenticated;
grant execute on function public.resolve_stage21_passport_share(uuid, text)
  to service_role;
