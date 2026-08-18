-- Stage 20 corrective performance migration.
-- Add covering indexes for marketplace foreign keys surfaced by the Supabase
-- performance advisor. These indexes change no application behavior or data.

create index opportunity_providers_created_by_idx
  on public.opportunity_providers(created_by);
create index opportunity_providers_reviewed_by_idx
  on public.opportunity_providers(reviewed_by)
  where reviewed_by is not null;

create index opportunity_provider_members_granted_by_idx
  on public.opportunity_provider_members(granted_by);

create index opportunity_applications_opportunity_idx
  on public.opportunity_applications(opportunity_id);

create index opportunity_application_capabilities_claim_idx
  on public.opportunity_application_capabilities(claim_id);

create index opportunity_application_evidence_application_claim_idx
  on public.opportunity_application_evidence(application_id, claim_id);
create index opportunity_application_evidence_claim_idx
  on public.opportunity_application_evidence(claim_id);
create index opportunity_application_evidence_evidence_idx
  on public.opportunity_application_evidence(evidence_id);

create index opportunity_application_institution_verifications_verification_idx
  on public.opportunity_application_institution_verifications(verification_id);

create index opportunity_application_portfolio_proofs_portfolio_idx
  on public.opportunity_application_portfolio_proofs(portfolio_id);

create index opportunity_marketplace_audit_actor_idx
  on public.opportunity_marketplace_audit_events(actor_user_id, created_at desc)
  where actor_user_id is not null;
create index opportunity_marketplace_audit_opportunity_idx
  on public.opportunity_marketplace_audit_events(opportunity_id, created_at desc)
  where opportunity_id is not null;
