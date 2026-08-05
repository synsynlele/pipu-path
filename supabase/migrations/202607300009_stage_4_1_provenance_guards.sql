-- Stage 4.1 provenance guards for future controlled result persistence.

create or replace function public.assert_hpi_active_insight_provenance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active' then
    if not exists (
      select 1 from public.insight_evidence_links link
      where link.insight_id = new.id
    ) then
      raise exception 'HPI_OUTPUT_MISSING_PROVENANCE' using errcode = 'P0001';
    end if;

    if exists (
      select 1
      from public.insight_evidence_links link
      left join public.interpretation_request_evidence request_evidence
        on request_evidence.interpretation_request_id = new.interpretation_request_id
        and request_evidence.evidence_record_id = link.evidence_record_id
      left join public.evidence_records evidence on evidence.id = link.evidence_record_id
      where link.insight_id = new.id
        and (request_evidence.evidence_record_id is null or evidence.user_id <> new.user_id)
    ) then
      raise exception 'HPI_ACCESS_DENIED' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

create trigger potential_insights_active_provenance_guard
before insert or update of status on public.potential_insights
for each row execute function public.assert_hpi_active_insight_provenance();

create or replace function public.assert_hpi_profile_item_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_owner uuid;
  insight_owner uuid;
  insight_status public.hpi_insight_status;
begin
  select user_id into profile_owner from public.human_potential_profile_versions where id = new.profile_version_id;
  select user_id, status into insight_owner, insight_status from public.potential_insights where id = new.insight_id;
  if profile_owner is null or insight_owner is null or profile_owner <> insight_owner then
    raise exception 'HPI_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  if insight_status in ('rejected', 'archived') then
    raise exception 'HPI_REQUEST_INVALID_STATE' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger human_potential_profile_item_integrity_guard
before insert or update on public.human_potential_profile_items
for each row execute function public.assert_hpi_profile_item_integrity();

revoke all on function public.assert_hpi_active_insight_provenance() from public;
revoke all on function public.assert_hpi_profile_item_integrity() from public;

