-- Harden Stage 18 workspace aggregation before database release.
-- Multiple confirmed capabilities must aggregate into one JSON array, not multiple scalar rows.

create or replace function public.get_stage18_capability_verification_workspace()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  result jsonb;
begin
  if actor is null then
    raise exception 'CAPABILITY_VERIFICATION_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select jsonb_build_object(
    'eligibleEvidence', coalesce((
      select jsonb_agg(jsonb_build_object(
        'claimId', claim.id,
        'evidenceId', evidence.id,
        'capabilityKey', claim.capability_key,
        'capabilityLabel', claim.capability_label,
        'level', claim.level,
        'sourceTitle', evidence.source_title,
        'sourceSummary', evidence.evidence_summary,
        'collaborationId', collaboration.id,
        'verifierUserId', partner.id,
        'verifierDisplayName', partner.display_name,
        'verifierUsername', partner.username
      ) order by claim.capability_label, evidence.source_occurred_at desc)
      from public.builder_capability_claims claim
      join public.builder_profile_versions version
        on version.id = claim.profile_version_id and version.status = 'active'
      join public.builder_capability_evidence evidence
        on evidence.claim_id = claim.id
       and evidence.user_id = actor
       and evidence.source_type = 'collaboration'
       and evidence.verification = 'mutual_collaboration'
      join public.builder_collaborations collaboration
        on collaboration.id = evidence.source_id
       and collaboration.status = 'completed'
       and actor in (collaboration.owner_id, collaboration.collaborator_id)
      join public.profiles partner
        on partner.id = case
          when collaboration.owner_id = actor then collaboration.collaborator_id
          else collaboration.owner_id
        end
      where claim.user_id = actor
        and version.user_id = actor
        and private.stage18_verification_relationship_valid(actor, partner.id)
        and not exists (
          select 1 from public.builder_capability_verifications verification
          where verification.builder_user_id = actor
            and verification.capability_key = claim.capability_key
            and verification.basis_source_id = collaboration.id
            and verification.verifier_user_id = partner.id
            and verification.status in ('pending','confirmed')
        )
    ), '[]'::jsonb),
    'verifiedCapabilities', coalesce((
      select jsonb_agg(jsonb_build_object(
        'capabilityKey', summary.capability_key,
        'capabilityLabel', summary.capability_label,
        'confirmedCount', summary.confirmed_count
      ) order by summary.capability_label)
      from (
        select
          verification.capability_key,
          max(verification.capability_label_at_request) as capability_label,
          count(*) as confirmed_count
        from public.builder_capability_verifications verification
        where verification.builder_user_id = actor
          and verification.status = 'confirmed'
        group by verification.capability_key
      ) summary
    ), '[]'::jsonb),
    'outgoing', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', verification.id,
        'capabilityKey', verification.capability_key,
        'capabilityLabel', verification.capability_label_at_request,
        'sourceTitle', evidence.source_title,
        'sourceSummary', evidence.evidence_summary,
        'status', verification.status,
        'requestNote', verification.request_note,
        'responseNote', verification.response_note,
        'requestedAt', verification.requested_at,
        'respondedAt', verification.responded_at,
        'verifierDisplayName', verifier.display_name,
        'verifierUsername', verifier.username,
        'actionable', verification.status = 'pending'
      ) order by verification.requested_at desc)
      from public.builder_capability_verifications verification
      join public.builder_capability_evidence evidence on evidence.id = verification.evidence_id_at_request
      join public.profiles verifier on verifier.id = verification.verifier_user_id
      where verification.builder_user_id = actor
    ), '[]'::jsonb),
    'incoming', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', verification.id,
        'capabilityKey', verification.capability_key,
        'capabilityLabel', verification.capability_label_at_request,
        'sourceTitle', evidence.source_title,
        'sourceSummary', evidence.evidence_summary,
        'status', verification.status,
        'requestNote', verification.request_note,
        'responseNote', verification.response_note,
        'requestedAt', verification.requested_at,
        'respondedAt', verification.responded_at,
        'builderDisplayName', builder.display_name,
        'builderUsername', builder.username,
        'actionable', verification.status = 'pending'
          and private.stage18_verification_relationship_valid(verification.builder_user_id, actor)
          and exists (
            select 1 from public.builder_collaborations collaboration
            where collaboration.id = verification.basis_source_id
              and collaboration.status = 'completed'
          )
      ) order by verification.requested_at desc)
      from public.builder_capability_verifications verification
      join public.builder_capability_evidence evidence on evidence.id = verification.evidence_id_at_request
      join public.profiles builder on builder.id = verification.builder_user_id
      where verification.verifier_user_id = actor
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_stage18_capability_verification_workspace() from public, anon;
grant execute on function public.get_stage18_capability_verification_workspace() to authenticated;
